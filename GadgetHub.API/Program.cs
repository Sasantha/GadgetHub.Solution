using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.OpenApi.Models;
using GadgetHub.API.Data;
using GadgetHub.API.Repositories;
using GadgetHub.API.Services;
using GadgetHub.API.Middleware;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var isDevelopment = builder.Environment.IsDevelopment();

if (string.IsNullOrWhiteSpace(connectionString) && !isDevelopment)
{
    throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is not configured. Set it in configuration or the ConnectionStrings__DefaultConnection environment variable."
    );
}

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
if (allowedOrigins == null || allowedOrigins.Length == 0)
{
    allowedOrigins = builder.Environment.IsDevelopment()
        ? new[] { "http://localhost:3000", "https://localhost:3000" }
        : throw new InvalidOperationException(
            "No CORS origins are configured. Set Cors__AllowedOrigins__0 (and additional entries as needed) for production deployments."
        );
}

var swaggerEnabled = builder.Environment.IsDevelopment() ||
                     builder.Configuration.GetValue<bool>("Swagger:Enabled");

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Handle circular references in Entity Framework navigation properties
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHealthChecks();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "The Gadget Hub API",
        Version = "v1",
        Description = "SOC-based API for The Gadget Hub - Educational Assessment\n\n" +
                     "This API manages the complete gadget ordering process:\n" +
                     "1. Browse products and add to cart\n" +
                     "2. Request quotations from 3 distributors (TechWorld, ElectroCom, Gadget Central)\n" +
                     "3. Compare prices and availability\n" +
                     "4. Place orders with selected distributors\n" +
                     "5. Track order status and delivery\n\n" +
                     "**Authentication:** Add header 'X-API-Key: gadgethub-api-key-2025' (Development: Optional)",
        Contact = new OpenApiContact
        {
            Name = "The Gadget Hub Team"
        }
    });

    // Add API Key authentication to Swagger
    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Description = "API Key needed to access the endpoints. X-API-Key: gadgethub-api-key-2025 (Optional in Development)",
        In = ParameterLocation.Header,
        Name = "X-API-Key",
        Type = SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "ApiKey"
                }
            },
            new string[] {}
        }
    });
});

// Add Entity Framework
builder.Services.AddDbContext<GadgetHubDbContext>(options =>
{
    if (!string.IsNullOrWhiteSpace(connectionString))
    {
        try
        {
            options.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString)
            );
        }
        catch (MySqlException)
        {
            if (isDevelopment)
            {
                options.UseSqlite("Data Source=GadgetHub.db");
            }
            else
            {
                throw;
            }
        }
    }
    else if (isDevelopment)
    {
        options.UseSqlite("Data Source=GadgetHub.db");
    }
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// Register Repository Pattern
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Register All 7 Services (including Admin)
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IDistributorService, DistributorService>();
builder.Services.AddScoped<IQuotationService, QuotationService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Seed admin data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<GadgetHubDbContext>();
    var seedAdminPassword = app.Configuration["GadgetHub:SeedAdminPassword"];
    if (context.Database.IsSqlite())
    {
        await context.Database.EnsureCreatedAsync();
    }
    else
    {
        await context.Database.MigrateAsync();
    }

    await AdminSeeder.SeedAdminsAsync(context, seedAdminPassword);
}

// Configure the HTTP request pipeline.
if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "The Gadget Hub API v1");
        c.DocumentTitle = "The Gadget Hub API Documentation";
        c.DefaultModelsExpandDepth(-1); // Hide models section by default
    });
}

app.UseForwardedHeaders();

// Add custom middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

// Only enable auth in production for educational simplicity
if (!app.Environment.IsDevelopment())
{
    app.UseMiddleware<SimpleAuthMiddleware>();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/healthz");

app.Run();

internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
