# Test Vercel Backend API
# Run this after deploying to verify your backend is working

Write-Host "🔍 Testing Vercel Backend API..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://jhu-enrollment.vercel.app"

# Test endpoints
$endpoints = @("leaders", "cities", "enrollments")

foreach ($endpoint in $endpoints) {
    $url = "$baseUrl/api/$endpoint"
    Write-Host "Testing: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        $recordCount = $data.records.Count
        
        if ($response.StatusCode -eq 200 -and $recordCount -gt 0) {
            Write-Host "  ✅ SUCCESS - $recordCount records returned" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  WARNING - Status $($response.StatusCode), $recordCount records" -ForegroundColor Yellow
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  ❌ FAILED - HTTP $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 404) {
            Write-Host "     → Backend not deployed or wrong URL" -ForegroundColor Gray
        } elseif ($statusCode -eq 500) {
            Write-Host "     → Server error - check Airtable credentials" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
}

Write-Host "Testing complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. If all tests passed, enable live mode in dashboard/.env.local" -ForegroundColor Gray
Write-Host "  2. Restart your dev server: cd dashboard; npm run dev" -ForegroundColor Gray
Write-Host "  3. Look for the yellow ● LIVE badge in the header" -ForegroundColor Gray
