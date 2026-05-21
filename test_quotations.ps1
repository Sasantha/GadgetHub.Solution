# Test Quotation Endpoints
$baseUrl = "http://localhost:5058/api"

Write-Host "Testing Quotation Endpoints..." -ForegroundColor Green

# Test 1: Get pending quotation requests
Write-Host "`n1. Getting pending quotation requests..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/quotations/admin/pending" -Method Get
    Write-Host "Success! Found $($response.Count) pending requests" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        $firstRequest = $response[0]
        Write-Host "First request: $($firstRequest.customerName) - $($firstRequest.productName) - Responses: $($firstRequest.responseCount)/3" -ForegroundColor Cyan
        Write-Host "Customer ID: $($firstRequest.customerId)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get customer quotations (if we have a customer ID)
Write-Host "`n2. Getting customer quotations..." -ForegroundColor Yellow
try {
    # Get the first customer ID from the pending requests
    $response = Invoke-RestMethod -Uri "$baseUrl/quotations/admin/pending" -Method Get
    if ($response.Count -gt 0) {
        $customerId = $response[0].customerId
        Write-Host "Using customer ID: $customerId" -ForegroundColor Cyan
        
        $customerResponse = Invoke-RestMethod -Uri "$baseUrl/quotations/customer/$customerId" -Method Get
        Write-Host "Success! Found $($customerResponse.Count) customer quotations" -ForegroundColor Green
        
        if ($customerResponse.Count -gt 0) {
            $firstCustomerRequest = $customerResponse[0]
            Write-Host "First customer request: $($firstCustomerRequest.id) - Status: $($firstCustomerRequest.status)" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green 