# Test Admin Quotation Management Features
$baseUrl = "http://localhost:5058/api"

Write-Host "Testing Admin Quotation Management Features..." -ForegroundColor Green

# Test 1: Get pending quotation requests (should be sorted with pending first)
Write-Host "`n1. Getting quotation requests (sorted with pending first)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/quotations/admin/pending" -Method Get
    Write-Host "Success! Found $($response.Count) requests" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "`nFirst few requests (should be pending first):" -ForegroundColor Cyan
        for ($i = 0; $i -lt [Math]::Min(3, $response.Count); $i++) {
            $req = $response[$i]
            Write-Host "  $($i+1). $($req.customerName) - $($req.productName) - Status: $($req.status) - Responses: $($req.responseCount)/3" -ForegroundColor White
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get available distributors for a specific request
Write-Host "`n2. Getting available distributors for a request..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/quotations/admin/pending" -Method Get
    if ($response.Count -gt 0) {
        $requestId = $response[0].id
        Write-Host "Using request ID: $requestId" -ForegroundColor Cyan
        
        $distributorsResponse = Invoke-RestMethod -Uri "$baseUrl/quotations/admin/request/$requestId/available-distributors" -Method Get
        Write-Host "Success! Found $($distributorsResponse.Count) available distributors" -ForegroundColor Green
        
        if ($distributorsResponse.Count -gt 0) {
            Write-Host "Available distributors:" -ForegroundColor Cyan
            foreach ($dist in $distributorsResponse) {
                Write-Host "  - $($dist.name) ($($dist.type))" -ForegroundColor White
            }
        } else {
            Write-Host "No available distributors (all have responded)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test adding a distributor response
Write-Host "`n3. Testing distributor response addition..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/quotations/admin/pending" -Method Get
    if ($response.Count -gt 0) {
        $request = $response[0]
        $distributorsResponse = Invoke-RestMethod -Uri "$baseUrl/quotations/admin/request/$($request.id)/available-distributors" -Method Get
        
        if ($distributorsResponse.Count -gt 0) {
            $distributor = $distributorsResponse[0]
            Write-Host "Adding response for distributor: $($distributor.name)" -ForegroundColor Cyan
            
            $responseData = @{
                requestId = $request.id
                distributorId = $distributor.id
                productId = $request.productId
                pricePerUnit = 1500.00
                availableQuantity = 5
                estimatedDeliveryDays = 7
            }
            
            $addResponse = Invoke-RestMethod -Uri "$baseUrl/quotations/admin/response" -Method Post -Body ($responseData | ConvertTo-Json) -ContentType "application/json"
            Write-Host "✅ Response added successfully!" -ForegroundColor Green
            Write-Host "Response ID: $($addResponse.id)" -ForegroundColor Cyan
        } else {
            Write-Host "No available distributors to test with" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green 