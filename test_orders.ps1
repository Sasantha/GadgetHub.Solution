# Test Order Creation Endpoint
$baseUrl = "http://localhost:5058/api"

Write-Host "Testing Order Creation..." -ForegroundColor Green

# Test 1: Create an order
Write-Host "`n1. Creating an order..." -ForegroundColor Yellow
try {
    $orderData = @{
        customerId = "7baeadca-2375-44a5-a0bb-4b0d499eb9a6"  # Use the customer ID from previous test
        distributorId = "dist1"  # Use a distributor ID
        productId = "prod1"      # Use a product ID
        quantity = 2
        pricePerUnit = 1500.00
    }

    $response = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Body ($orderData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Success! Order created with ID: $($response.id)" -ForegroundColor Green
    Write-Host "Total Amount: $($response.totalAmount)" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get customer orders
Write-Host "`n2. Getting customer orders..." -ForegroundColor Yellow
try {
    $customerId = "7baeadca-2375-44a5-a0bb-4b0d499eb9a6"
    $response = Invoke-RestMethod -Uri "$baseUrl/orders/customer/$customerId" -Method Get
    Write-Host "Success! Found $($response.Count) orders for customer" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        $firstOrder = $response[0]
        Write-Host "First order: $($firstOrder.id) - Status: $($firstOrder.status) - Total: $($firstOrder.totalAmount)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green