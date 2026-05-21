# GadgetHub.Solution Production Deployment Guide

This guide is written for this repository structure:

```text
GadgetHub.Solution/
  GadgetHub.API/        # ASP.NET Core Web API backend
  gadgethub-client/     # React frontend
```

Target free-tier deployment:

- Database: Aiven MySQL Free Plan
- Backend: Render Free Web Service using Docker
- Frontend: Vercel Free Plan
- Repository: GitHub monorepo

Use Windows PowerShell from VS Code unless a step says otherwise.

Important rule: complete one phase, verify it, then continue. Each phase has a pause checkpoint with the files to edit.

---

## Phase 1 - Analyze Existing Project

### 1.1 Current backend findings

Backend path:

```text
GadgetHub.API/
```

Key files inspected:

```text
GadgetHub.API/GadgetHub.API.csproj
GadgetHub.API/Program.cs
GadgetHub.API/Data/GadgetHubDbContext.cs
GadgetHub.API/appsettings.json
GadgetHub.API/appsettings.Development.json
GadgetHub.API/Dockerfile
GadgetHub.API/Middleware/SimpleAuthMiddleware.cs
GadgetHub.API/Data/AdminSeeder.cs
```

Current backend stack:

- ASP.NET Core Web API.
- Target framework is currently `net10.0`.
- Entity Framework Core packages are currently `9.0.7`.
- MySQL provider is `Pomelo.EntityFrameworkCore.MySql` version `9.0.0-preview.3.efcore.9.0.0`.
- SQLite package is still present and used as a development fallback.
- Swagger is configured and can be enabled by environment variable.
- CORS is configured from `Cors:AllowedOrigins`.
- MySQL connection string is read from `ConnectionStrings:DefaultConnection`.
- Production environment variable name for the database is:

```text
ConnectionStrings__DefaultConnection
```

Current backend port behavior:

- Local HTTP port from `launchSettings.json`: `http://localhost:5058`
- Local HTTPS port: `https://localhost:7136`
- Dockerfile currently exposes and binds to port `10000`.
- Render expects the app to listen on `0.0.0.0` and commonly uses `PORT=10000`.

Current deployment issues to fix before production:

1. `GadgetHub.API.csproj` targets `.NET 10.0`, but `GadgetHub.API/Dockerfile` uses `.NET 8.0` images. The Docker image version must match the target framework.
2. `SimpleAuthMiddleware.cs` hardcodes the API key: `gadgethub-api-key-2025`.
3. `AdminSeeder.cs` hardcodes demo admin passwords: `password123`.
4. `Program.cs` does not currently expose a standard `/healthz` endpoint for Render health checks.
5. `ErrorHandlingMiddleware.cs` returns `exception.Message` to clients, which can leak production internals.
6. `Program.cs` calls `EnsureCreatedAsync()` on startup. This is acceptable for a student/free-tier demo, but commercial apps should use migrations.
7. `GadgetHub.API/GadgetHub.db` is a local SQLite database file and must not be committed.
8. Some generated folders are present and must not be deployed from source: `bin/`, `obj/`, `.vs/`, `.codex-build*/`.

### 1.2 Current frontend findings

Frontend path:

```text
gadgethub-client/
```

Key files inspected:

```text
gadgethub-client/package.json
gadgethub-client/src/config/api.ts
gadgethub-client/src/services/api.ts
gadgethub-client/src/App.tsx
gadgethub-client/.env.example
gadgethub-client/.gitignore
```

Current frontend stack:

- React with TypeScript.
- Build tool is Create React App because `package.json` uses `react-scripts`.
- React Router uses `BrowserRouter`.
- API base URL is controlled by:

```text
REACT_APP_API_BASE_URL
```

Fallback in code:

```text
http://localhost:5058/api
```

Current frontend deployment issues to fix before production:

1. `gadgethub-client/src/services/api.ts` hardcodes the `X-API-Key`.
2. CRA only exposes frontend variables prefixed with `REACT_APP_`.
3. Browser refreshes on nested routes such as `/products` and `/admin/login` need a Vercel rewrite to `index.html`.
4. `build/`, `node_modules/`, `.env.local`, `.env.production.local`, and `.vercel/` must not be committed.

### 1.3 Current repository findings

The solution root is not currently a Git repository, but both subfolders contain their own `.git` directories:

```text
GadgetHub.API/.git
gadgethub-client/.git
```

For GitHub, Render, and Vercel, the cleanest approach is a single monorepo:

```text
GadgetHub.Solution/.git
GadgetHub.Solution/GadgetHub.API/
GadgetHub.Solution/gadgethub-client/
```

Do not push nested `.git` folders.

### 1.4 Files that need environment variables

Backend:

```text
GadgetHub.API/appsettings.json
GadgetHub.API/appsettings.Development.json
GadgetHub.API/appsettings.Production.json
GadgetHub.API/Program.cs
GadgetHub.API/Middleware/SimpleAuthMiddleware.cs
GadgetHub.API/Data/AdminSeeder.cs
```

Frontend:

```text
gadgethub-client/.env.example
gadgethub-client/.env.local
gadgethub-client/.env.production
gadgethub-client/src/config/api.ts
gadgethub-client/src/services/api.ts
```

### 1.5 Files that must never be committed to GitHub

Never commit:

```text
.vs/
**/.vs/
**/bin/
**/obj/
**/node_modules/
**/build/
**/.codex-build*/
**/.env
**/.env.local
**/.env.development.local
**/.env.test.local
**/.env.production.local
**/appsettings.Local.json
**/appsettings.*.local.json
**/*.db
**/*.sqlite
**/*.sqlite3
**/*.user
**/*.suo
**/.vercel/
**/.DS_Store
```

Be careful with SQL files:

```text
gadgethub-client/database_schema_simple.sql
gadgethub-client/admin_table.sql
GadgetHub.API/reset_admin_passwords.sql
```

These are safe only if they contain schema and demo data, not real passwords, real customers, or private production data.

### Pause checkpoint - Phase 1

Before continuing, edit or plan to edit:

```text
GadgetHub.API/GadgetHub.API.csproj
GadgetHub.API/Dockerfile
GadgetHub.API/Program.cs
GadgetHub.API/Middleware/SimpleAuthMiddleware.cs
GadgetHub.API/Data/AdminSeeder.cs
gadgethub-client/src/services/api.ts
gadgethub-client/src/config/api.ts
```

Why: these files control framework compatibility, secrets, database access, CORS, health checks, and frontend API routing.

---

## Phase 2 - Prepare GitHub Repository

### 2.1 Recommended folder structure

Keep this structure:

```text
GadgetHub.Solution/
  .gitignore
  README.md
  DEPLOYMENT_GUIDE.md
  GadgetHub.Solution.sln
  GadgetHub.API/
    GadgetHub.API.csproj
    Program.cs
    Dockerfile
    appsettings.json
    appsettings.Development.json
    appsettings.Production.json
  gadgethub-client/
    package.json
    package-lock.json
    vercel.json
    .env.example
    src/
```

### 2.2 Remove nested Git repositories

Run from the solution root:

```powershell
cd C:\MyProjects\GadgetHub.Solution
```

Check nested Git folders:

```powershell
Get-ChildItem -Force GadgetHub.API\.git
Get-ChildItem -Force gadgethub-client\.git
```

If you have already pushed those separate repos and want one monorepo, remove only the nested Git metadata:

```powershell
Remove-Item -Recurse -Force GadgetHub.API\.git
Remove-Item -Recurse -Force gadgethub-client\.git
```

Why: GitHub, Render, and Vercel will work more predictably when the solution root is the only Git repository.

### 2.3 Create a root `.gitignore`

Create this file:

```text
GadgetHub.Solution/.gitignore
```

Content:

```gitignore
# OS and editor
.DS_Store
Thumbs.db
.vs/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json

# Visual Studio / .NET
bin/
obj/
*.user
*.suo
*.userosscache
*.sln.docstates
TestResults/
coverage/
*.nupkg

# Local databases
*.db
*.sqlite
*.sqlite3
*.db-shm
*.db-wal

# ASP.NET secrets and local config
appsettings.Local.json
appsettings.*.local.json
secrets.json

# Keep safe templates
!appsettings.json
!appsettings.Development.json
!appsettings.Production.json

# Node / React
node_modules/
build/
dist/
.pnp/
.pnp.js
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Hosting provider local metadata
.vercel/
.render/

# Generated agent/build folders
.codex-build/
.codex-build*/
```

### 2.4 Create a professional root `README.md`

Create this file:

```text
GadgetHub.Solution/README.md
```

Starter content:

````markdown
# GadgetHub.Solution

GadgetHub.Solution is a full stack mobile phone shop web application with a React frontend, ASP.NET Core Web API backend, and MySQL database.

## Live Demo

- Frontend: https://your-vercel-app.vercel.app
- Backend API: https://your-render-service.onrender.com
- Swagger: https://your-render-service.onrender.com/swagger

## Features

- Product catalog for phones and gadgets
- Customer registration and login
- Shopping cart
- Distributor quotation workflow
- Order placement and tracking
- Admin dashboard for products, orders, customers, distributors, and quotations

## Tech Stack

- Frontend: React, TypeScript, Create React App
- Backend: ASP.NET Core Web API, Entity Framework Core
- Database: MySQL
- Hosting: Vercel, Render, Aiven

## Project Structure

```text
GadgetHub.Solution/
  GadgetHub.API/
  gadgethub-client/
```

## Local Development

### Backend

```powershell
cd GadgetHub.API
dotnet restore
dotnet run
```

Backend runs at:

```text
http://localhost:5058
```

### Frontend

```powershell
cd gadgethub-client
npm install
npm start
```

Frontend runs at:

```text
http://localhost:3000
```

## Environment Variables

Backend production:

```text
ConnectionStrings__DefaultConnection=
Cors__AllowedOrigins__0=
GadgetHub__ApiKey=
GadgetHub__SeedAdminPassword=
ASPNETCORE_ENVIRONMENT=Production
```

Frontend production:

```text
REACT_APP_API_BASE_URL=https://your-render-service.onrender.com/api
REACT_APP_API_KEY=your-api-key
```

## Deployment

See `DEPLOYMENT_GUIDE.md`.
````

### 2.5 Initialize Git at the root

Run:

```powershell
cd C:\MyProjects\GadgetHub.Solution
git init
git status --short
```

If sensitive files appear in `git status`, stop and update `.gitignore`.

Expected safe files include:

```text
GadgetHub.Solution.sln
GadgetHub.API/*.cs
GadgetHub.API/*.csproj
GadgetHub.API/Dockerfile
gadgethub-client/package.json
gadgethub-client/package-lock.json
gadgethub-client/src/*
README.md
DEPLOYMENT_GUIDE.md
.gitignore
```

### 2.6 Create GitHub repository

1. Go to GitHub.
2. Click New repository.
3. Repository name:

```text
GadgetHub.Solution
```

4. Choose Public for portfolio visibility or Private while preparing.
5. Do not add GitHub's README, `.gitignore`, or license if you already created local files.
6. Click Create repository.

### 2.7 Push to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
git add .
git commit -m "Initial full stack GadgetHub deployment setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/GadgetHub.Solution.git
git push -u origin main
```

### Pause checkpoint - Phase 2

Files to edit before committing:

```text
.gitignore
README.md
DEPLOYMENT_GUIDE.md
```

Files to verify are not staged:

```text
GadgetHub.API/GadgetHub.db
GadgetHub.API/bin/
GadgetHub.API/obj/
gadgethub-client/node_modules/
gadgethub-client/build/
gadgethub-client/.env.local
```

---

## Phase 3 - Setup Aiven MySQL Database

### 3.1 Create Aiven account and service

1. Go to Aiven.
2. Create a free account.
3. Open the Aiven Console.
4. Create a project if one does not exist.
5. Click Create service.
6. Select MySQL.
7. Select the free tier.
8. Choose the default free-tier cloud/region options. Free tier may not allow custom region selection.
9. Name the service:

```text
gadgethub-mysql
```

10. Create the service and wait until it is running.

Collect from the Aiven service Overview page:

```text
Host
Port
User
Password
Database
Service URI
CA certificate
```

Default Aiven database name is often:

```text
defaultdb
```

### 3.2 Install MySQL CLI on Windows

If MySQL client is already installed, check:

```powershell
mysql --version
mysqldump --version
```

If not installed:

1. Install MySQL Community Server or MySQL Shell from the official MySQL website.
2. Ensure the MySQL `bin` folder is in PATH.
3. Restart VS Code terminal.

### 3.3 Test Aiven connection

Use the values from Aiven:

```powershell
mysql --host YOUR_AIVEN_HOST --port YOUR_AIVEN_PORT --user avnadmin --password --database defaultdb
```

Enter the password when prompted.

Run:

```sql
SELECT 1 + 2 AS three;
SHOW DATABASES;
```

Expected result:

```text
three = 3
```

### 3.4 Export local MySQL database

If your local database is named `GadgetHub`:

```powershell
cd C:\MyProjects\GadgetHub.Solution
mysqldump --host localhost --port 3306 --user root --password GadgetHub > gadgethub-local-backup.sql
```

If your local root password is blank, press Enter when prompted.

Security warning: `gadgethub-local-backup.sql` may contain data. Add it to `.gitignore` if you keep it locally:

```gitignore
*.sql.backup
*-backup.sql
gadgethub-local-backup.sql
```

### 3.5 Import local database into Aiven

Option A, import into Aiven's `defaultdb`:

```powershell
mysql --host YOUR_AIVEN_HOST --port YOUR_AIVEN_PORT --user avnadmin --password --database defaultdb < gadgethub-local-backup.sql
```

Option B, create a dedicated database first:

```powershell
mysql --host YOUR_AIVEN_HOST --port YOUR_AIVEN_PORT --user avnadmin --password --database defaultdb
```

Then inside MySQL:

```sql
CREATE DATABASE GadgetHub;
EXIT;
```

Import:

```powershell
mysql --host YOUR_AIVEN_HOST --port YOUR_AIVEN_PORT --user avnadmin --password --database GadgetHub < gadgethub-local-backup.sql
```

### 3.6 If you only have schema SQL

This repository contains:

```text
gadgethub-client/database_schema_simple.sql
```

Import it:

```powershell
mysql --host YOUR_AIVEN_HOST --port YOUR_AIVEN_PORT --user avnadmin --password --database defaultdb < gadgethub-client\database_schema_simple.sql
```

If the SQL file contains `CREATE DATABASE GadgetHub; USE GadgetHub;`, ensure your Aiven user can create databases. If it fails, remove those two lines and import directly into `defaultdb`.

### 3.7 Test tables

Connect:

```powershell
mysql --host YOUR_AIVEN_HOST --port YOUR_AIVEN_PORT --user avnadmin --password --database defaultdb
```

Run:

```sql
SHOW TABLES;
SELECT COUNT(*) FROM Products;
SELECT COUNT(*) FROM Distributors;
```

### 3.8 ASP.NET Core Aiven connection string

Use this format:

```text
server=YOUR_AIVEN_HOST;port=YOUR_AIVEN_PORT;database=defaultdb;user=avnadmin;password=YOUR_AIVEN_PASSWORD;SslMode=Required;MaximumPoolSize=10;
```

Why:

- `SslMode=Required` encrypts traffic to Aiven MySQL.
- `MaximumPoolSize=10` is free-tier friendly and avoids too many idle database connections.
- The password stays in Render environment variables, not in GitHub.

### 3.9 Backend config files

Keep `GadgetHub.API/appsettings.json` safe and generic:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "Cors": {
    "AllowedOrigins": []
  },
  "Swagger": {
    "Enabled": false
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Create `GadgetHub.API/appsettings.Production.json`:

```json
{
  "Swagger": {
    "Enabled": false
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Warning"
    }
  }
}
```

Do not put real Aiven credentials in this file.

### Pause checkpoint - Phase 3

Files to edit:

```text
GadgetHub.API/appsettings.json
GadgetHub.API/appsettings.Production.json
.gitignore
```

Secrets to store only in Render:

```text
ConnectionStrings__DefaultConnection
```

Never commit:

```text
gadgethub-local-backup.sql
Any Aiven password
Any downloaded CA certificate containing private local paths
```

---

## Phase 4 - Prepare ASP.NET Backend for Render

Render does not currently list .NET as a native runtime. Use Docker for this backend.

### 4.1 Fix .NET and Docker version mismatch

Your current project targets:

```xml
<TargetFramework>net10.0</TargetFramework>
```

Your current Dockerfile uses:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
```

Choose one path.

Recommended path for this project: keep `.NET 10` and update Dockerfile to `.NET 10` images:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["GadgetHub.API.csproj", "./"]
RUN dotnet restore "GadgetHub.API.csproj"

COPY . .
RUN dotnet publish "GadgetHub.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "GadgetHub.API.dll"]
```

Alternative path: change the project to `net8.0` and use `.NET 8` images, but then also align package versions to stable .NET 8-compatible versions.

### 4.2 Add health checks

Edit:

```text
GadgetHub.API/Program.cs
```

Add service registration before `var app = builder.Build();`:

```csharp
builder.Services.AddHealthChecks();
```

Add endpoint before `app.Run();`:

```csharp
app.MapHealthChecks("/healthz");
```

Render health check path:

```text
/healthz
```

Why: Render can call `/healthz` to confirm the container is alive.

### 4.3 Make API key configurable

Edit:

```text
GadgetHub.API/Middleware/SimpleAuthMiddleware.cs
```

Replace the hardcoded field:

```csharp
private readonly string _apiKey = "gadgethub-api-key-2025";
```

With configuration:

```csharp
private readonly string _apiKey;
```

Update constructor:

```csharp
public SimpleAuthMiddleware(
    RequestDelegate next,
    IWebHostEnvironment environment,
    IConfiguration configuration)
{
    _next = next;
    _environment = environment;
    _apiKey = configuration["GadgetHub:ApiKey"]
        ?? throw new InvalidOperationException("GadgetHub:ApiKey is not configured.");
}
```

Render environment variable:

```text
GadgetHub__ApiKey=generate-a-long-random-value
```

Generate a strong API key locally:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4.4 Make seed admin password configurable

Edit:

```text
GadgetHub.API/Data/AdminSeeder.cs
GadgetHub.API/Program.cs
```

Recommended production behavior:

- Do not seed demo passwords in production.
- If seeding is needed for a demo, use `GadgetHub__SeedAdminPassword`.
- Change the password immediately after first login.

Example approach:

```csharp
var seedPassword = builder.Configuration["GadgetHub:SeedAdminPassword"];
```

Pass it into your seeder and fail in production if it is missing and admins do not exist.

Render environment variable:

```text
GadgetHub__SeedAdminPassword=generate-a-long-temporary-password
```

### 4.5 Hide production exception details

Edit:

```text
GadgetHub.API/Middleware/ErrorHandlingMiddleware.cs
```

Inject `IWebHostEnvironment`, then only return exception details in development.

Production response should be generic:

```json
{
  "error": "An error occurred while processing your request",
  "traceId": "..."
}
```

Why: database errors can expose table names, SQL details, hosts, and internal code paths.

### 4.6 Review `Program.cs` production setup

Your current setup already does several good things:

- Reads connection string from configuration.
- Fails fast in production if the connection string is missing.
- Reads CORS origins from configuration.
- Fails fast in production if CORS origins are missing.
- Uses forwarded headers for reverse proxy hosting.
- Enables Swagger only in development or when `Swagger__Enabled=true`.

Recommended final middleware order:

```csharp
app.UseForwardedHeaders();
app.UseMiddleware<ErrorHandlingMiddleware>();

if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");

if (!app.Environment.IsDevelopment())
{
    app.UseMiddleware<SimpleAuthMiddleware>();
}

app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/healthz");
app.Run();
```

### 4.7 Production CORS configuration

Render environment variables after Vercel deploy:

```text
Cors__AllowedOrigins__0=https://your-vercel-app.vercel.app
Cors__AllowedOrigins__1=https://your-custom-domain.com
```

Before Vercel deploy, use a placeholder and update after the frontend URL exists.

Do not use:

```csharp
AllowAnyOrigin()
```

for a production ecommerce-style app.

### 4.8 Render-compatible environment variables

Set these in Render:

```text
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:10000
ConnectionStrings__DefaultConnection=server=YOUR_AIVEN_HOST;port=YOUR_AIVEN_PORT;database=defaultdb;user=avnadmin;password=YOUR_AIVEN_PASSWORD;SslMode=Required;MaximumPoolSize=10;
Cors__AllowedOrigins__0=https://your-vercel-app.vercel.app
GadgetHub__ApiKey=YOUR_LONG_RANDOM_API_KEY
GadgetHub__SeedAdminPassword=YOUR_TEMP_ADMIN_PASSWORD
Swagger__Enabled=false
```

Temporarily use this during first deployment if you need Swagger:

```text
Swagger__Enabled=true
```

Set it back to `false` after verification.

### 4.9 Local backend production test

From the solution root:

```powershell
cd GadgetHub.API
dotnet restore
dotnet build -c Release
```

Test with environment variables locally:

```powershell
$env:ASPNETCORE_ENVIRONMENT="Production"
$env:ConnectionStrings__DefaultConnection="server=YOUR_AIVEN_HOST;port=YOUR_AIVEN_PORT;database=defaultdb;user=avnadmin;password=YOUR_AIVEN_PASSWORD;SslMode=Required;MaximumPoolSize=10;"
$env:Cors__AllowedOrigins__0="http://localhost:3000"
$env:GadgetHub__ApiKey="local-test-key"
$env:Swagger__Enabled="true"
dotnet run -c Release
```

Open:

```text
http://localhost:5058/healthz
http://localhost:5058/swagger
```

### 4.10 Local Docker test

From the backend folder:

```powershell
cd C:\MyProjects\GadgetHub.Solution\GadgetHub.API
docker build -t gadgethub-api .
```

Run:

```powershell
docker run --rm -p 10000:10000 `
  -e ASPNETCORE_ENVIRONMENT=Production `
  -e ASPNETCORE_URLS=http://0.0.0.0:10000 `
  -e ConnectionStrings__DefaultConnection="server=YOUR_AIVEN_HOST;port=YOUR_AIVEN_PORT;database=defaultdb;user=avnadmin;password=YOUR_AIVEN_PASSWORD;SslMode=Required;MaximumPoolSize=10;" `
  -e Cors__AllowedOrigins__0=http://localhost:3000 `
  -e GadgetHub__ApiKey=local-test-key `
  -e Swagger__Enabled=true `
  gadgethub-api
```

Test:

```powershell
Invoke-RestMethod http://localhost:10000/healthz
Invoke-RestMethod http://localhost:10000/api/test/connection
```

### Pause checkpoint - Phase 4

Files to edit:

```text
GadgetHub.API/Dockerfile
GadgetHub.API/Program.cs
GadgetHub.API/Middleware/SimpleAuthMiddleware.cs
GadgetHub.API/Middleware/ErrorHandlingMiddleware.cs
GadgetHub.API/Data/AdminSeeder.cs
GadgetHub.API/appsettings.Production.json
```

Verify:

```powershell
dotnet build -c Release
docker build -t gadgethub-api GadgetHub.API
```

---

## Phase 5 - Deploy Backend to Render

### 5.1 Push backend changes to GitHub

From solution root:

```powershell
cd C:\MyProjects\GadgetHub.Solution
git status --short
git add .
git commit -m "Prepare ASP.NET API for Render deployment"
git push
```

### 5.2 Create Render web service

1. Go to Render Dashboard.
2. Click New.
3. Select Web Service.
4. Connect GitHub.
5. Select repository:

```text
GadgetHub.Solution
```

6. Configure:

```text
Name: gadgethub-api
Branch: main
Root Directory: GadgetHub.API
Runtime: Docker
Instance Type: Free
Health Check Path: /healthz
Auto-Deploy: Yes
```

For Docker services, Render uses your `Dockerfile`. You usually do not need a build command or start command.

### 5.3 Add Render environment variables

In Render service settings, add:

```text
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:10000
ConnectionStrings__DefaultConnection=server=YOUR_AIVEN_HOST;port=YOUR_AIVEN_PORT;database=defaultdb;user=avnadmin;password=YOUR_AIVEN_PASSWORD;SslMode=Required;MaximumPoolSize=10;
Cors__AllowedOrigins__0=http://localhost:3000
GadgetHub__ApiKey=YOUR_LONG_RANDOM_API_KEY
GadgetHub__SeedAdminPassword=YOUR_TEMP_ADMIN_PASSWORD
Swagger__Enabled=true
```

Temporary CORS note: before the Vercel URL exists, you can keep `http://localhost:3000` for local frontend testing. After Vercel deploys, replace it with your Vercel URL.

### 5.4 Deploy

Click Create Web Service.

Watch logs for:

```text
Building image
Publishing app
Now listening on: http://0.0.0.0:10000
```

Your backend URL will look like:

```text
https://gadgethub-api.onrender.com
```

### 5.5 Test public backend

Health:

```powershell
Invoke-RestMethod https://gadgethub-api.onrender.com/healthz
```

Swagger:

```text
https://gadgethub-api.onrender.com/swagger
```

Database connection:

```powershell
Invoke-RestMethod https://gadgethub-api.onrender.com/api/test/connection
```

Authenticated endpoint:

```powershell
$headers = @{ "X-API-Key" = "YOUR_LONG_RANDOM_API_KEY" }
Invoke-RestMethod -Uri https://gadgethub-api.onrender.com/api/products -Headers $headers
```

### 5.6 Common Render backend issues

Issue:

```text
It was not possible to find any compatible framework version
```

Root cause: Docker image version does not match `TargetFramework`.

Fix: if project uses `net10.0`, Dockerfile must use:

```dockerfile
mcr.microsoft.com/dotnet/sdk:10.0
mcr.microsoft.com/dotnet/aspnet:10.0
```

Issue:

```text
No open ports detected
```

Root cause: app is not listening on `0.0.0.0:10000`.

Fix:

```text
ASPNETCORE_URLS=http://0.0.0.0:10000
```

Issue:

```text
Connection string 'DefaultConnection' is not configured
```

Root cause: missing or misspelled Render environment variable.

Fix:

```text
ConnectionStrings__DefaultConnection=...
```

Issue:

```text
Access to fetch at ... has been blocked by CORS policy
```

Root cause: Vercel frontend origin is not in backend CORS allowlist.

Fix:

```text
Cors__AllowedOrigins__0=https://your-vercel-app.vercel.app
```

Issue:

```text
MySQL SSL connection error
```

Root cause: Aiven requires encrypted connections.

Fix:

```text
SslMode=Required
```

### 5.7 Render free tier limitations

Expect:

- Service spins down after idle time.
- First request after idle can take about a minute.
- Local filesystem is ephemeral. Do not use SQLite, local uploads, or local generated files for persistent production data.
- Free services can be restarted by the platform.
- Free plan is suitable for portfolio/demo, not paid commercial production.

### Pause checkpoint - Phase 5

Save these values:

```text
Render backend URL
Render health URL
Render Swagger URL
Render API key
```

Then update:

```text
gadgethub-client/.env.production
Vercel environment variables
Render Cors__AllowedOrigins__0 after Vercel URL exists
```

---

## Phase 6 - Prepare React Frontend for Vercel

### 6.1 Create production env template

Create:

```text
gadgethub-client/.env.example
```

Content:

```env
REACT_APP_API_BASE_URL=http://localhost:5058/api
REACT_APP_API_KEY=dev-only-api-key
```

Create local-only file:

```text
gadgethub-client/.env.local
```

Content:

```env
REACT_APP_API_BASE_URL=http://localhost:5058/api
REACT_APP_API_KEY=local-test-key
```

Do not commit `.env.local`.

Optional committed production example:

```text
gadgethub-client/.env.production.example
```

Content:

```env
REACT_APP_API_BASE_URL=https://your-render-service.onrender.com/api
REACT_APP_API_KEY=use-vercel-environment-variable-instead
```

Do not commit a real `.env.production` if it contains secrets.

### 6.2 Make frontend API key environment-driven

Edit:

```text
gadgethub-client/src/config/api.ts
```

Use:

```ts
const configuredBaseUrl =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5058/api';

const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');

export const API_CONFIG = {
  BASE_URL: normalizedBaseUrl,
  ORIGIN: normalizedBaseUrl.endsWith('/api')
    ? normalizedBaseUrl.slice(0, -4)
    : normalizedBaseUrl,
  API_KEY: process.env.REACT_APP_API_KEY || '',
  DEFAULT_CUSTOMER_ID: 'c1',
  ENDPOINTS: {
    PRODUCTS: '/products',
    CART: '/cart',
    CUSTOMERS: '/customers',
    DISTRIBUTORS: '/distributors',
    QUOTATIONS: '/quotations',
    ORDERS: '/orders',
    TEST: '/test'
  }
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
```

Edit:

```text
gadgethub-client/src/services/api.ts
```

Replace hardcoded header:

```ts
'X-API-Key': 'gadgethub-api-key-2025'
```

With:

```ts
...(API_CONFIG.API_KEY ? { 'X-API-Key': API_CONFIG.API_KEY } : {})
```

Example:

```ts
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...(API_CONFIG.API_KEY ? { 'X-API-Key': API_CONFIG.API_KEY } : {})
};
```

Security note: any `REACT_APP_*` value is visible in the browser bundle. A frontend API key is not a true secret. For commercial scaling, replace simple API-key auth with real user authentication such as JWT access tokens, refresh token rotation, and role-based authorization.

### 6.3 Fix direct route refresh on Vercel

Because the app uses `BrowserRouter`, create:

```text
gadgethub-client/vercel.json
```

Content:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Why: Vercel must serve the React app for `/products`, `/cart`, `/admin/login`, and other client-side routes.

### 6.4 Production build test

Run:

```powershell
cd C:\MyProjects\GadgetHub.Solution\gadgethub-client
npm install
npm run build
```

If CRA treats warnings as errors in CI, fix warnings before deployment. For a temporary demo-only workaround in Vercel:

```text
CI=false
```

Prefer fixing warnings instead of relying on `CI=false`.

### 6.5 Frontend communicates with backend securely

Use HTTPS:

```text
REACT_APP_API_BASE_URL=https://gadgethub-api.onrender.com/api
```

Do not use:

```text
http://
```

from production frontend. Browser security will block mixed content when a HTTPS Vercel app calls a HTTP API.

### Pause checkpoint - Phase 6

Files to edit:

```text
gadgethub-client/src/config/api.ts
gadgethub-client/src/services/api.ts
gadgethub-client/vercel.json
gadgethub-client/.env.example
gadgethub-client/.env.local
```

Verify:

```powershell
npm run build
```

---

## Phase 7 - Deploy Frontend to Vercel

### 7.1 Push frontend changes

From solution root:

```powershell
cd C:\MyProjects\GadgetHub.Solution
git status --short
git add .
git commit -m "Prepare React frontend for Vercel deployment"
git push
```

### 7.2 Import project in Vercel

1. Go to Vercel Dashboard.
2. Click Add New Project.
3. Import your GitHub repository:

```text
GadgetHub.Solution
```

4. Configure project:

```text
Framework Preset: Create React App
Root Directory: gadgethub-client
Build Command: npm run build
Output Directory: build
Install Command: npm install
Node.js Version: 20.x or latest Vercel-supported LTS
```

### 7.3 Add Vercel environment variables

In Vercel Project Settings > Environment Variables:

```text
REACT_APP_API_BASE_URL=https://gadgethub-api.onrender.com/api
REACT_APP_API_KEY=YOUR_LONG_RANDOM_API_KEY
```

Optional if CRA fails because warnings are treated as errors:

```text
CI=false
```

Set variables for:

```text
Production
Preview
Development
```

At minimum, set Production.

### 7.4 Deploy

Click Deploy.

Your frontend URL will look like:

```text
https://gadgethub-client.vercel.app
```

### 7.5 Update Render CORS with Vercel URL

Go back to Render environment variables and set:

```text
Cors__AllowedOrigins__0=https://gadgethub-client.vercel.app
```

If you also use a custom domain:

```text
Cors__AllowedOrigins__1=https://www.yourdomain.com
```

Redeploy Render service.

### 7.6 Test production app

Test:

1. Open Vercel frontend URL.
2. Browse products.
3. Register or log in as customer.
4. Add item to cart.
5. Request quotations.
6. Place an order.
7. Open admin login.
8. Verify admin dashboard API calls work.

Browser DevTools checks:

```text
Network tab -> API requests return 200/201
Console tab -> no CORS errors
Application tab -> no unexpected secrets
```

### 7.7 Common Vercel issues

Issue:

```text
404 when refreshing /products or /admin/login
```

Root cause: BrowserRouter route is not rewritten to React app.

Fix: add `gadgethub-client/vercel.json` rewrite to `/index.html`.

Issue:

```text
API calls still go to localhost
```

Root cause: missing Vercel environment variable or app was not redeployed after adding it.

Fix:

```text
REACT_APP_API_BASE_URL=https://gadgethub-api.onrender.com/api
```

Then redeploy.

Issue:

```text
CORS blocked
```

Root cause: backend does not allow the exact Vercel origin.

Fix:

```text
Cors__AllowedOrigins__0=https://your-exact-vercel-domain.vercel.app
```

Issue:

```text
401 Unauthorized
```

Root cause: frontend `REACT_APP_API_KEY` does not match Render `GadgetHub__ApiKey`.

Fix: set both to the same value and redeploy frontend/backend.

### Pause checkpoint - Phase 7

Save:

```text
Frontend live URL
Backend live URL
GitHub repo URL
```

Then update:

```text
README.md
Render CORS environment variables
Portfolio links
```

---

## Phase 8 - Production Optimization

### 8.1 Security checklist

Implement before calling this commercial-ready:

- Replace simple API key auth with JWT authentication.
- Store password hashes only, never plaintext passwords.
- Remove hardcoded admin passwords.
- Require strong admin password on first deploy.
- Hide exception details in production.
- Disable Swagger in production unless protected.
- Use strict CORS allowlist.
- Add request validation DTOs.
- Add rate limiting.
- Add audit logging for admin actions.
- Use HTTPS-only frontend/backend URLs.
- Keep Aiven database credentials only in Render.
- Rotate API keys after any accidental exposure.

### 8.2 Add rate limiting

In ASP.NET Core, add rate limiting in `Program.cs`.

Example:

```csharp
using System.Threading.RateLimiting;

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
});
```

Then:

```csharp
app.UseRateLimiter();
```

Place it before controllers.

### 8.3 Add API versioning

Recommended future route style:

```text
/api/v1/products
/api/v1/orders
```

Why: commercial apps need compatibility when mobile clients or external integrations rely on old endpoints.

### 8.4 Improve database reliability

Recommended:

- Use EF Core migrations instead of `EnsureCreatedAsync`.
- Keep seed data separate from production admin creation.
- Add indexes for frequently queried fields:

```sql
CREATE INDEX idx_products_category ON Products(Category);
CREATE INDEX idx_products_brand ON Products(Brand);
CREATE INDEX idx_orders_customer ON Orders(CustomerId);
CREATE INDEX idx_cart_customer ON CartItems(CustomerId);
CREATE INDEX idx_quotations_customer ON QuotationRequests(CustomerId);
```

### 8.5 Improve frontend performance

Recommended:

- Remove `console.log` from production API service.
- Add loading and retry states for slow Render free-tier cold starts.
- Lazy-load admin pages.
- Compress images and use CDN-hosted optimized images.
- Add meaningful page titles.
- Add `robots.txt` and metadata for portfolio/demo visibility.

### 8.6 Free-tier usage optimization

Render:

- Expect cold starts.
- Keep API startup fast.
- Avoid writing anything important to local filesystem.
- Keep DB connection pool small.

Aiven:

- Keep connection pool small.
- Avoid long-running idle connections.
- Avoid heavy migrations during peak demo time.

Vercel:

- Static React build is a good fit.
- Environment variable changes require redeploy.
- Use Preview deployments for testing changes before Production.

### Pause checkpoint - Phase 8

Files to improve:

```text
GadgetHub.API/Program.cs
GadgetHub.API/Middleware/ErrorHandlingMiddleware.cs
GadgetHub.API/Middleware/SimpleAuthMiddleware.cs
GadgetHub.API/Data/AdminSeeder.cs
gadgethub-client/src/services/api.ts
gadgethub-client/public/robots.txt
gadgethub-client/public/index.html
```

---

## Phase 9 - Portfolio Preparation

### 9.1 README live demo section

Update:

```text
README.md
```

Add:

```markdown
## Live Demo

- Frontend: https://your-vercel-app.vercel.app
- Backend API: https://your-render-service.onrender.com
- API Health: https://your-render-service.onrender.com/healthz
```

If Swagger is disabled in production, do not list it as a public demo link.

### 9.2 Deployment architecture explanation

Add:

```markdown
## Deployment Architecture

GadgetHub uses a three-service cloud deployment:

- Vercel hosts the React frontend as a static production build.
- Render hosts the ASP.NET Core Web API in a Docker container.
- Aiven hosts the managed MySQL database.

The frontend communicates with the backend over HTTPS using a configured API base URL. The backend reads the MySQL connection string from Render environment variables and connects to Aiven using SSL. CORS is restricted to the deployed Vercel frontend domain.
```

### 9.3 Features section

```markdown
## Features

- Product catalog with mobile phones and gadgets
- Customer registration and login
- Shopping cart management
- Distributor quotation workflow
- Best quotation comparison
- Order placement and order tracking
- Admin dashboard for business management
- REST API with layered controller-service-repository architecture
```

### 9.4 Screenshots section

Create:

```text
docs/screenshots/
```

Recommended screenshots:

```text
home-page.png
products-page.png
cart-page.png
quotation-page.png
admin-dashboard.png
render-health-check.png
vercel-deployment.png
```

README:

```markdown
## Screenshots

### Home Page
![Home Page](docs/screenshots/home-page.png)

### Product Catalog
![Product Catalog](docs/screenshots/products-page.png)

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)
```

### 9.5 Professional project description

GitHub:

```text
GadgetHub.Solution is a full stack ecommerce web application for a mobile phone and gadget shop. It includes a React TypeScript frontend, ASP.NET Core Web API backend, Entity Framework Core data access, and a MySQL database. The system supports product browsing, customer cart management, distributor quotation workflows, order placement, order tracking, and admin management. The project is deployed using Vercel, Render, and Aiven MySQL.
```

LinkedIn:

```text
I built and deployed GadgetHub.Solution, a full stack mobile phone shop web application using React, ASP.NET Core Web API, and MySQL. The platform includes product browsing, customer authentication, cart management, distributor quotation comparison, order tracking, and an admin dashboard. I deployed the frontend to Vercel, containerized the .NET backend for Render, and hosted the production MySQL database on Aiven with environment-based configuration and secure CORS setup.
```

Fiverr:

```text
I can build and deploy full stack ecommerce web applications using React, ASP.NET Core Web API, and MySQL. My GadgetHub project demonstrates product catalogs, shopping carts, customer workflows, admin dashboards, API integration, cloud database hosting, and deployment to Vercel, Render, and Aiven.
```

Upwork:

```text
Full stack developer experienced with React, ASP.NET Core Web API, MySQL, REST APIs, and cloud deployment. I built GadgetHub.Solution, an ecommerce-style gadget shop with customer shopping flows, distributor quotations, order tracking, and admin management. I can help design, build, debug, and deploy production-ready web applications using free-tier or commercial cloud hosting.
```

Personal portfolio:

```text
GadgetHub.Solution is a full stack gadget shop platform built with React, ASP.NET Core, and MySQL. It demonstrates a real-world ecommerce workflow where customers browse products, request distributor quotations, place orders, and track fulfillment. The project includes an admin dashboard and a cloud deployment architecture using Vercel, Render, and Aiven.
```

### Pause checkpoint - Phase 9

Files to edit:

```text
README.md
docs/screenshots/*
```

Update live links after Render and Vercel are working.

---

## Phase 10 - Troubleshooting Assistant

Use this format whenever an error happens:

```text
Error:
Paste the exact error message.

Where:
Render logs / Vercel build logs / browser console / terminal / Aiven / local.

What changed:
Last file edited, env var changed, or command run.

Expected:
What you expected to happen.
```

### Backend troubleshooting commands

Build:

```powershell
cd C:\MyProjects\GadgetHub.Solution\GadgetHub.API
dotnet restore
dotnet build -c Release
```

Run:

```powershell
dotnet run
```

Test local health:

```powershell
Invoke-RestMethod http://localhost:5058/healthz
```

Test local products:

```powershell
$headers = @{ "X-API-Key" = "local-test-key" }
Invoke-RestMethod -Uri http://localhost:5058/api/products -Headers $headers
```

Docker build:

```powershell
docker build -t gadgethub-api .
```

Docker run:

```powershell
docker run --rm -p 10000:10000 gadgethub-api
```

### Frontend troubleshooting commands

Install:

```powershell
cd C:\MyProjects\GadgetHub.Solution\gadgethub-client
npm install
```

Build:

```powershell
npm run build
```

Start:

```powershell
npm start
```

Check API env value at build time:

```powershell
Get-Content .env.local
```

### Database troubleshooting commands

Connect:

```powershell
mysql --host YOUR_AIVEN_HOST --port YOUR_AIVEN_PORT --user avnadmin --password --database defaultdb
```

Check tables:

```sql
SHOW TABLES;
SELECT COUNT(*) FROM Products;
```

### Git troubleshooting commands

Check files:

```powershell
git status --short
```

Check ignored file:

```powershell
git check-ignore -v GadgetHub.API\GadgetHub.db
git check-ignore -v gadgethub-client\node_modules
git check-ignore -v gadgethub-client\.env.local
```

Remove accidentally staged file:

```powershell
git restore --staged GadgetHub.API\GadgetHub.db
```

If a secret was committed:

1. Rotate the secret immediately in Aiven, Render, or Vercel.
2. Remove it from code.
3. Commit the removal.
4. Consider rewriting Git history only if the repository was public and the secret is highly sensitive.

---

## Deployment Order Summary

Follow this exact order:

1. Fix backend framework/Docker mismatch.
2. Move backend API key and seed password to environment variables.
3. Add `/healthz`.
4. Create root `.gitignore` and root `README.md`.
5. Remove nested `.git` folders if using a monorepo.
6. Push root repository to GitHub.
7. Create Aiven MySQL service.
8. Import database/schema.
9. Deploy backend to Render with environment variables.
10. Test backend public URL.
11. Configure frontend production API URL.
12. Add Vercel SPA rewrite.
13. Deploy frontend to Vercel.
14. Update Render CORS with exact Vercel URL.
15. Test complete customer and admin workflows.
16. Update README and portfolio content.

---

## Official References

- Render Web Services: https://render.com/docs/web-services
- Render Docker: https://render.com/docs/docker
- Render Free Instances: https://render.com/docs/free
- Render Environment Variables: https://render.com/docs/environment-variables
- Vercel Create React App: https://vercel.com/docs/frameworks/frontend/create-react-app
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Aiven MySQL Get Started: https://aiven.io/docs/products/mysql/get-started
- Aiven MySQL CLI Connection: https://aiven.io/docs/products/mysql/howto/connect-from-cli
- Aiven TLS/SSL Certificates: https://aiven.io/docs/platform/concepts/tls-ssl-certificates
- ASP.NET Core Health Checks: https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks
- .NET Container Images: https://learn.microsoft.com/en-us/dotnet/core/docker/container-images
