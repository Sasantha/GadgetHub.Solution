using System.Text;
using System.Text.RegularExpressions;
using MySqlConnector;
using BC = BCrypt.Net.BCrypt;

var options = ImportOptions.Parse(args);
var repoRoot = FindRepoRoot(AppContext.BaseDirectory)
    ?? throw new InvalidOperationException("Could not find repository root.");

LoadEnvFile(Path.Combine(repoRoot, "GadgetHub.API", ".env"));

var dumpPath = Path.GetFullPath(options.DumpPath ?? Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
    "Downloads",
    "gadgethub.sql"));

if (!File.Exists(dumpPath))
{
    throw new FileNotFoundException("Could not find SQL dump file.", dumpPath);
}

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("ConnectionStrings__DefaultConnection is not set.");
}

var importStatements = DumpImporter.BuildImportStatements(File.ReadAllText(dumpPath));
if (importStatements.Count == 0)
{
    throw new InvalidOperationException("No supported INSERT statements were found in the SQL dump.");
}

await using var connection = new MySqlConnection(connectionString);
await connection.OpenAsync();
await ValidateSchemaAsync(connection);

await using var transaction = await connection.BeginTransactionAsync();
try
{
    var processedByTable = new Dictionary<string, int>(StringComparer.Ordinal);

    foreach (var statement in importStatements)
    {
        await using var command = new MySqlCommand(statement.Sql, connection, transaction);
        await command.ExecuteNonQueryAsync();
        processedByTable[statement.TableName] = processedByTable.GetValueOrDefault(statement.TableName) + statement.RowCount;
    }

    await ResetAdminsAsync(connection, transaction, options.AdminPassword);

    if (options.DryRun)
    {
        await transaction.RollbackAsync();
        Console.WriteLine("Dry run succeeded. No rows were committed.");
    }
    else
    {
        await transaction.CommitAsync();
        Console.WriteLine("Import succeeded.");
    }

    foreach (var tableName in DumpImporter.ImportOrder)
    {
        if (processedByTable.TryGetValue(tableName, out var rowCount))
        {
            Console.WriteLine($"{tableName}: {rowCount} dump row(s) processed");
        }
    }

    Console.WriteLine("Admins: reset to admin, manager1, support1");
}
catch
{
    await transaction.RollbackAsync();
    throw;
}

static async Task ResetAdminsAsync(MySqlConnection connection, MySqlTransaction transaction, string adminPassword)
{
    var passwordHash = BC.HashPassword(adminPassword);

    await using (var deleteCommand = new MySqlCommand("DELETE FROM `Admins`;", connection, transaction))
    {
        await deleteCommand.ExecuteNonQueryAsync();
    }

    await using var insertCommand = new MySqlCommand("""
        INSERT INTO `Admins`
            (`Id`, `Username`, `Email`, `PasswordHash`, `FirstName`, `LastName`, `Role`, `IsActive`, `LastLoginAt`, `CreatedAt`, `UpdatedAt`)
        VALUES
            (@AdminId, 'admin', 'admin@gadgethub.com', @PasswordHash, 'System', 'Administrator', 'super_admin', 1, NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
            (@ManagerId, 'manager1', 'manager@gadgethub.com', @PasswordHash, 'Michael', 'Manager', 'manager', 1, NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
            (@SupportId, 'support1', 'support@gadgethub.com', @PasswordHash, 'Sarah', 'Support', 'admin', 1, NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));
        """, connection, transaction);

    insertCommand.Parameters.AddWithValue("@AdminId", Guid.NewGuid().ToString());
    insertCommand.Parameters.AddWithValue("@ManagerId", Guid.NewGuid().ToString());
    insertCommand.Parameters.AddWithValue("@SupportId", Guid.NewGuid().ToString());
    insertCommand.Parameters.AddWithValue("@PasswordHash", passwordHash);

    await insertCommand.ExecuteNonQueryAsync();
}

static async Task ValidateSchemaAsync(MySqlConnection connection)
{
    var expectedColumns = new Dictionary<string, string[]>(StringComparer.Ordinal)
    {
        ["Admins"] = ["Id", "Username", "Email", "PasswordHash", "FirstName", "LastName", "Role", "IsActive", "LastLoginAt", "CreatedAt", "UpdatedAt"],
        ["Products"] = ["Id", "Name", "Description", "Category", "Brand", "ImageUrl", "CreatedAt"],
        ["Customers"] = ["Id", "FirstName", "LastName", "Email", "Phone", "Address", "PasswordHash", "CreatedAt"],
        ["Distributors"] = ["Id", "Name", "Type", "ContactInfo", "CreatedAt"],
        ["CartItems"] = ["Id", "CustomerId", "ProductId", "Quantity", "AddedAt"],
        ["QuotationRequests"] = ["Id", "CustomerId", "ProductId", "Quantity", "Status", "RequestedAt"],
        ["QuotationResponses"] = ["Id", "RequestId", "DistributorId", "ProductId", "PricePerUnit", "AvailableQuantity", "EstimatedDeliveryDays", "Status", "RespondedAt"],
        ["Orders"] = ["Id", "CustomerId", "DistributorId", "ProductId", "Quantity", "PricePerUnit", "TotalAmount", "Status", "DistributorOrderId", "EstimatedDelivery", "PlacedAt"]
    };

    await using var command = new MySqlCommand("""
        SELECT TABLE_NAME, COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME IN ('Admins','Products','Customers','Distributors','CartItems','QuotationRequests','QuotationResponses','Orders')
        ORDER BY TABLE_NAME, ORDINAL_POSITION;
        """, connection);

    var actualColumns = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        var tableName = reader.GetString(0);
        var columnName = reader.GetString(1);
        if (!actualColumns.TryGetValue(tableName, out var columns))
        {
            columns = new HashSet<string>(StringComparer.Ordinal);
            actualColumns[tableName] = columns;
        }

        columns.Add(columnName);
    }

    var problems = new List<string>();
    foreach (var (tableName, columns) in expectedColumns)
    {
        if (!actualColumns.TryGetValue(tableName, out var actual))
        {
            problems.Add($"Missing table `{tableName}`.");
            continue;
        }

        foreach (var column in columns)
        {
            if (!actual.Contains(column))
            {
                problems.Add($"Missing column `{tableName}`.`{column}`.");
            }
        }
    }

    if (problems.Count > 0)
    {
        throw new InvalidOperationException("Database schema is not ready:\n" + string.Join("\n", problems));
    }
}

static string? FindRepoRoot(string startPath)
{
    var directory = new DirectoryInfo(startPath);
    while (directory != null)
    {
        if (File.Exists(Path.Combine(directory.FullName, "GadgetHub.Solution.sln")))
        {
            return directory.FullName;
        }

        directory = directory.Parent;
    }

    return null;
}

static void LoadEnvFile(string envPath)
{
    if (!File.Exists(envPath))
    {
        return;
    }

    foreach (var rawLine in File.ReadLines(envPath))
    {
        var line = rawLine.Trim();
        if (line.Length == 0 || line.StartsWith('#'))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim().Trim('"');

        if (Environment.GetEnvironmentVariable(key) is null)
        {
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

internal sealed record ImportOptions(string? DumpPath, bool DryRun, string AdminPassword)
{
    public static ImportOptions Parse(string[] args)
    {
        string? dumpPath = null;
        var dryRun = false;
        var adminPassword = "password123";

        for (var i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "--dump" when i + 1 < args.Length:
                    dumpPath = args[++i];
                    break;
                case "--admin-password" when i + 1 < args.Length:
                    adminPassword = args[++i];
                    break;
                case "--dry-run":
                    dryRun = true;
                    break;
                default:
                    throw new ArgumentException($"Unknown argument: {args[i]}");
            }
        }

        return new ImportOptions(dumpPath, dryRun, adminPassword);
    }
}

internal static class DumpImporter
{
    public static readonly string[] ImportOrder =
    [
        "Products",
        "Customers",
        "Distributors",
        "CartItems",
        "QuotationRequests",
        "QuotationResponses",
        "Orders"
    ];

    private static readonly Dictionary<string, string> TableMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["products"] = "Products",
        ["customers"] = "Customers",
        ["distributors"] = "Distributors",
        ["cartitems"] = "CartItems",
        ["quotationrequests"] = "QuotationRequests",
        ["quotationresponses"] = "QuotationResponses",
        ["orders"] = "Orders"
    };

    private static readonly Regex InsertRegex = new(
        @"INSERT\s+INTO\s+`(?<table>[^`]+)`\s*\((?<columns>[^)]+)\)\s+VALUES\s*(?<values>.+)\s*$",
        RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);

    public static List<ImportStatement> BuildImportStatements(string dumpSql)
    {
        var statementsByTable = new Dictionary<string, List<ImportStatement>>(StringComparer.Ordinal);

        foreach (var statement in SplitStatements(dumpSql))
        {
            var match = InsertRegex.Match(statement.Trim().TrimEnd(';'));
            if (!match.Success)
            {
                continue;
            }

            var sourceTable = match.Groups["table"].Value;
            if (!TableMap.TryGetValue(sourceTable, out var tableName))
            {
                continue;
            }

            var columns = ExtractColumns(match.Groups["columns"].Value);
            if (!columns.Contains("Id", StringComparer.Ordinal))
            {
                throw new InvalidOperationException($"`{sourceTable}` insert does not include an Id column.");
            }

            var updateColumns = columns.Where(column => column != "Id").ToArray();
            var updateSql = string.Join(", ", updateColumns.Select(column => $"`{column}` = VALUES(`{column}`)"));
            var sql = new StringBuilder()
                .Append("INSERT INTO `").Append(tableName).Append("` (")
                .Append(string.Join(", ", columns.Select(column => $"`{column}`")))
                .Append(") VALUES ")
                .Append(match.Groups["values"].Value.Trim())
                .Append(" ON DUPLICATE KEY UPDATE ")
                .Append(updateSql)
                .Append(';')
                .ToString();

            if (!statementsByTable.TryGetValue(tableName, out var tableStatements))
            {
                tableStatements = [];
                statementsByTable[tableName] = tableStatements;
            }

            tableStatements.Add(new ImportStatement(tableName, sql, CountRows(match.Groups["values"].Value)));
        }

        return ImportOrder
            .Where(statementsByTable.ContainsKey)
            .SelectMany(tableName => statementsByTable[tableName])
            .ToList();
    }

    private static string[] ExtractColumns(string columnsSql)
    {
        return columnsSql
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Select(column => column.Trim('`', ' '))
            .ToArray();
    }

    private static int CountRows(string valuesSql)
    {
        var count = 0;
        var inString = false;
        var escaped = false;

        foreach (var current in valuesSql)
        {
            if (escaped)
            {
                escaped = false;
                continue;
            }

            if (inString && current == '\\')
            {
                escaped = true;
                continue;
            }

            if (current == '\'')
            {
                inString = !inString;
                continue;
            }

            if (!inString && current == '(')
            {
                count++;
            }
        }

        return count;
    }

    private static IEnumerable<string> SplitStatements(string sql)
    {
        var statement = new StringBuilder();
        var inString = false;
        var inBacktick = false;
        var escaped = false;

        foreach (var current in sql)
        {
            statement.Append(current);

            if (escaped)
            {
                escaped = false;
                continue;
            }

            if (inString && current == '\\')
            {
                escaped = true;
                continue;
            }

            if (!inBacktick && current == '\'')
            {
                inString = !inString;
                continue;
            }

            if (!inString && current == '`')
            {
                inBacktick = !inBacktick;
                continue;
            }

            if (!inString && !inBacktick && current == ';')
            {
                yield return statement.ToString();
                statement.Clear();
            }
        }

        if (statement.Length > 0)
        {
            yield return statement.ToString();
        }
    }
}

internal sealed record ImportStatement(string TableName, string Sql, int RowCount);
