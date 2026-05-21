# Test Script for Quotation Management and Orders
Write-Host "🧪 Testing Quotation Management and Orders Functionality" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Test 1: Check if API is running
Write-Host "`n1. Testing API Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5058/api/test/connection" -Method GET
    Write-Host "✅ API is running: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ API is not running. Please start the API first." -ForegroundColor Red
    exit 1
}

# Test 2: Check pending quotation requests
Write-Host "`n2. Testing Pending Quotation Requests..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5058/api/quotations/admin/pending" -Method GET
    Write-Host "✅ Found $($response.Count) pending quotation requests" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        $firstRequest = $response[0]
        Write-Host "   First request: $($firstRequest.productName) - $($firstRequest.customerName)" -ForegroundColor Gray
        
        # Test 3: Get available distributors for this request
        Write-Host "`n3. Testing Available Distributors..." -ForegroundColor Yellow
        $distributorsResponse = Invoke-RestMethod -Uri "http://localhost:5058/api/quotations/admin/request/$($firstRequest.id)/available-distributors" -Method GET
        Write-Host "✅ Found $($distributorsResponse.Count) available distributors" -ForegroundColor Green
        
        if ($distributorsResponse.Count -gt 0) {
            $firstDistributor = $distributorsResponse[0]
            Write-Host "   First distributor: $($firstDistributor.name) ($($firstDistributor.type))" -ForegroundColor Gray
            
            # Test 4: Add a distributor response
            Write-Host "`n4. Testing Add Distributor Response..." -ForegroundColor Yellow
            $responseData = @{
                requestId = $firstRequest.id
                distributorId = $firstDistributor.id
                productId = $firstRequest.productId
                pricePerUnit = 299.99
                availableQuantity = 10
                estimatedDeliveryDays = 5
            }
            
            $addResponse = Invoke-RestMethod -Uri "http://localhost:5058/api/quotations/admin/response" -Method POST -Body ($responseData | ConvertTo-Json) -ContentType "application/json"
            Write-Host "✅ Successfully added distributor response" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error testing quotation requests: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Check customer orders
Write-Host "`n5. Testing Customer Orders..." -ForegroundColor Yellow
try {
    # Get a customer ID first
    $customersResponse = Invoke-RestMethod -Uri "http://localhost:5058/api/customers" -Method GET
    if ($customersResponse.Count -gt 0) {
        $customerId = $customersResponse[0].id
        $ordersResponse = Invoke-RestMethod -Uri "http://localhost:5058/api/orders/customer/$customerId" -Method GET
        Write-Host "✅ Found $($ordersResponse.Count) orders for customer" -ForegroundColor Green
        
        if ($ordersResponse.Count -gt 0) {
            $firstOrder = $ordersResponse[0]
            Write-Host "   First order: $($firstOrder.id) - Status: $($firstOrder.status)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error testing customer orders: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Testing completed!" -ForegroundColor Green
Write-Host "`n📋 Summary of fixes:" -ForegroundColor Cyan
Write-Host "1. ✅ Added status filtering to Admin Quotations page" -ForegroundColor Green
Write-Host "2. ✅ Added sorting (pending first, then completed)" -ForegroundColor Green
Write-Host "3. ✅ Added available distributors filtering (excludes already responded)" -ForegroundColor Green
Write-Host "4. ✅ Fixed Customer Quotations UI styling" -ForegroundColor Green
Write-Host "5. ✅ Fixed Orders page to handle ApiResponse wrapper" -ForegroundColor Green
Write-Host "6. ✅ Added navigation properties loading for orders" -ForegroundColor Green

Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the API: dotnet run (in GadgetHub.API directory)" -ForegroundColor White
Write-Host "2. Start the frontend: npm start (in gadgethub-client directory)" -ForegroundColor White
Write-Host "3. Test the Admin Quotations page with filtering and sorting" -ForegroundColor White
Write-Host "4. Test placing orders from Customer Quotations page" -ForegroundColor White
Write-Host "5. Verify orders appear in the Orders page" -ForegroundColor White 