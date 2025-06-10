$sourceDir = "c:\Users\usama\OneDrive\Desktop\Abdullah\Website"

# Load products.js to get valid product IDs and categories
$productsJsPath = Join-Path -Path $sourceDir -ChildPath "products.js"
$productsJsContent = Get-Content -Path $productsJsPath -Raw

# Extract product IDs using a more reliable method
$productIdMatches = [regex]::Matches($productsJsContent, '"([^"]+)":\s*{')
$productIds = @()
foreach ($match in $productIdMatches) {
    $productIds += $match.Groups[1].Value
}
$productIds = $productIds | Select-Object -Unique

# Extract categories
$categoryMatches = [regex]::Matches($productsJsContent, 'category:\s*"([^"]+)"')
$categories = @()
foreach ($match in $categoryMatches) {
    $categories += $match.Groups[1].Value
}
$categories = $categories | Select-Object -Unique

Write-Host "Found $($productIds.Count) product IDs in products.js"
Write-Host "Product IDs: $($productIds -join ', ')"
Write-Host "`nFound $($categories.Count) categories in products.js"
Write-Host "Categories: $($categories -join ', ')"

# Check index.html for product links
$indexHtmlPath = Join-Path -Path $sourceDir -ChildPath "index.html"
$indexHtmlContent = Get-Content -Path $indexHtmlPath -Raw

$productLinkMatches = [regex]::Matches($indexHtmlContent, 'product\.html\?id=([^"&]+)')
$indexProductIds = @()
foreach ($match in $productLinkMatches) {
    $indexProductIds += $match.Groups[1].Value
}
$indexProductIds = $indexProductIds | Select-Object -Unique

Write-Host "`nFound $($indexProductIds.Count) unique product links in index.html"
$invalidIndexProductIds = $indexProductIds | Where-Object { $productIds -notcontains $_ }
if ($invalidIndexProductIds.Count -gt 0) {
    Write-Host "Invalid product IDs in index.html: $($invalidIndexProductIds -join ', ')"
} else {
    Write-Host "All product IDs in index.html are valid"
}

# Check category links in index.html
$categoryLinkMatches = [regex]::Matches($indexHtmlContent, 'category\.html\?cat=([^"&]+)')
$indexCategories = @()
foreach ($match in $categoryLinkMatches) {
    $indexCategories += $match.Groups[1].Value
}
$indexCategories = $indexCategories | Select-Object -Unique

Write-Host "`nFound $($indexCategories.Count) unique category links in index.html"
$invalidIndexCategories = $indexCategories | Where-Object { $categories -notcontains $_ }
if ($invalidIndexCategories.Count -gt 0) {
    Write-Host "Invalid categories in index.html: $($invalidIndexCategories -join ', ')"
} else {
    Write-Host "All categories in index.html are valid"
}

# Check shop.html for product links
$shopHtmlPath = Join-Path -Path $sourceDir -ChildPath "shop.html"
if (Test-Path $shopHtmlPath) {
    $shopHtmlContent = Get-Content -Path $shopHtmlPath -Raw

    $productLinkMatches = [regex]::Matches($shopHtmlContent, 'product\.html\?id=([^"&]+)')
    $shopProductIds = @()
    foreach ($match in $productLinkMatches) {
        $shopProductIds += $match.Groups[1].Value
    }
    $shopProductIds = $shopProductIds | Select-Object -Unique

    Write-Host "`nFound $($shopProductIds.Count) unique product links in shop.html"
    $invalidShopProductIds = $shopProductIds | Where-Object { $productIds -notcontains $_ }
    if ($invalidShopProductIds.Count -gt 0) {
        Write-Host "Invalid product IDs in shop.html: $($invalidShopProductIds -join ', ')"
    } else {
        Write-Host "All product IDs in shop.html are valid"
    }

    # Check category links in shop.html
    $categoryLinkMatches = [regex]::Matches($shopHtmlContent, 'category\.html\?cat=([^"&]+)')
    $shopCategories = @()
    foreach ($match in $categoryLinkMatches) {
        $shopCategories += $match.Groups[1].Value
    }
    $shopCategories = $shopCategories | Select-Object -Unique

    Write-Host "`nFound $($shopCategories.Count) unique category links in shop.html"
    $invalidShopCategories = $shopCategories | Where-Object { $categories -notcontains $_ }
    if ($invalidShopCategories.Count -gt 0) {
        Write-Host "Invalid categories in shop.html: $($invalidShopCategories -join ', ')"
    } else {
        Write-Host "All categories in shop.html are valid"
    }
}
