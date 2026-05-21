# The Gadget Hub Admin API Testing Script
# Tests all admin endpoints to ensure proper functionality

$baseUrl = "https://localhost:7111/api"
$adminUrl = "$baseUrl/admin"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   The Gadget Hub Admin API Tests   " -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Test 1: Admin Login
Write-Host "`n1. Testing Admin Login..." -ForegroundColor Yellow
$loginData = @{
    Username = "admin"
    Password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$adminUrl/login" -Method POST -Body $loginData -ContentType "application/json" -SkipCertificateCheck
    Write-Host "✅ Admin Login successful!" -ForegroundColor Green
    Write-Host "Admin: $($loginResponse.admin.username) ($($loginResponse.admin.role))" -ForegroundColor White
    $adminToken = $loginResponse.token
}
catch {
    Write-Host "❌ Admin Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $adminToken = $null
}

# Test 2: Dashboard Statistics
Write-Host "`n2. Testing Dashboard Stats..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "$adminUrl/dashboard/stats" -Method GET -SkipCertificateCheck
    Write-Host "✅ Dashboard Stats retrieved!" -ForegroundColor Green
    Write-Host "Total Orders: $($statsResponse.totalOrders)" -ForegroundColor White
    Write-Host "Total Customers: $($statsResponse.totalCustomers)" -ForegroundColor White
    Write-Host "Total Products: $($statsResponse.totalProducts)" -ForegroundColor White
    Write-Host "Pending Orders: $($statsResponse.pendingOrders)" -ForegroundColor White
    Write-Host "Revenue: $($statsResponse.revenue)" -ForegroundColor White
}
catch {
    Write-Host "❌ Dashboard Stats failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: System Health
Write-Host "`n3. Testing System Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$adminUrl/system/health" -Method GET -SkipCertificateCheck
    Write-Host "✅ System Health retrieved!" -ForegroundColor Green
    Write-Host "API Status: $($healthResponse.apiStatus)" -ForegroundColor White
    Write-Host "Database Status: $($healthResponse.databaseStatus)" -ForegroundColor White
    Write-Host "Uptime: $($healthResponse.uptime)" -ForegroundColor White
}
catch {
    Write-Host "❌ System Health failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get All Admins
Write-Host "`n4. Testing Get All Admins..." -ForegroundColor Yellow
try {
    $adminsResponse = Invoke-RestMethod -Uri "$adminUrl" -Method GET -SkipCertificateCheck
    Write-Host "✅ All Admins retrieved!" -ForegroundColor Green
    Write-Host "Total Admins: $($adminsResponse.Count)" -ForegroundColor White
    foreach ($admin in $adminsResponse) {
        Write-Host "- $($admin.username) ($($admin.role)) - Active: $($admin.isActive)" -ForegroundColor White
    }
}
catch {
    Write-Host "❌ Get All Admins failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Manager Login
Write-Host "`n5. Testing Manager Login..." -ForegroundColor Yellow
$managerLoginData = @{
    Username = "manager1"
    Password = "password123"
} | ConvertTo-Json

try {
    $managerResponse = Invoke-RestMethod -Uri "$adminUrl/login" -Method POST -Body $managerLoginData -ContentType "application/json" -SkipCertificateCheck
    Write-Host "✅ Manager Login successful!" -ForegroundColor Green
    Write-Host "Manager: $($managerResponse.admin.username) ($($managerResponse.admin.role))" -ForegroundColor White
}
catch {
    Write-Host "❌ Manager Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Support Login
Write-Host "`n6. Testing Support Login..." -ForegroundColor Yellow
$supportLoginData = @{
    Username = "support1"
    Password = "password123"
} | ConvertTo-Json

try {
    $supportResponse = Invoke-RestMethod -Uri "$adminUrl/login" -Method POST -Body $supportLoginData -ContentType "application/json" -SkipCertificateCheck
    Write-Host "✅ Support Login successful!" -ForegroundColor Green
    Write-Host "Support: $($supportResponse.admin.username) ($($supportResponse.admin.role))" -ForegroundColor White
}
catch {
    Write-Host "❌ Support Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Invalid Login
Write-Host "`n7. Testing Invalid Login..." -ForegroundColor Yellow
$invalidLoginData = @{
    Username = "invalid"
    Password = "wrongpassword"
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-RestMethod -Uri "$adminUrl/login" -Method POST -Body $invalidLoginData -ContentType "application/json" -SkipCertificateCheck
    Write-Host "❌ Invalid Login should have failed!" -ForegroundColor Red
}
catch {
    Write-Host "✅ Invalid Login correctly rejected!" -ForegroundColor Green
}

Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "     Admin API Testing Complete     " -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`n📋 Available Admin Endpoints:" -ForegroundColor Magenta
Write-Host "POST   $adminUrl/login" -ForegroundColor White
Write-Host "GET    $adminUrl/dashboard/stats" -ForegroundColor White
Write-Host "GET    $adminUrl/system/health" -ForegroundColor White
Write-Host "GET    $adminUrl" -ForegroundColor White
Write-Host "GET    $adminUrl/{id}" -ForegroundColor White
Write-Host "POST   $adminUrl" -ForegroundColor White
Write-Host "PUT    $adminUrl/{id}" -ForegroundColor White
Write-Host "DELETE $adminUrl/{id}" -ForegroundColor White
Write-Host "POST   $adminUrl/{id}/change-password" -ForegroundColor White

Write-Host "`n🔐 Demo Credentials:" -ForegroundColor Magenta
Write-Host "Super Admin: admin / password123" -ForegroundColor White
Write-Host "Manager:     manager1 / password123" -ForegroundColor White
Write-Host "Support:     support1 / password123" -ForegroundColor White 