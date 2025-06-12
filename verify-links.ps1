$sourceDir = "c:\Users\usama\OneDrive\Desktop\Abdullah\Website"
$excludeDirs = @(
    "archive",
    "old-products",
    "node_modules"
)

# Load products.js content to extract product IDs and categories
$productsJsPath = Join-Path -Path $sourceDir -ChildPath "products.js"
$productsJsContent = Get-Content -Path $productsJsPath -Raw

# Extract product IDs
$productIds = [regex]::Matches($productsJsContent, '"([^"]+)":\s*{') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique

# Extract categories
$categories = [regex]::Matches($productsJsContent, 'category:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique

Write-Host "Found $($productIds.Count) product IDs and $($categories.Count) categories in products.js"
Write-Host "Product IDs: $($productIds -join ', ')"
Write-Host "Categories: $($categories -join ', ')"

# Get all HTML and JS files to check, excluding specific directories
$filesToCheck = Get-ChildItem -Path $sourceDir -Filter "*.html" -Recurse | 
    Where-Object { 
        $file = $_
        # Skip files in excluded directories
        foreach ($dir in $excludeDirs) {
            if ($file.FullName -like "*\$dir\*") {
                return $false
            }
        }
        return $true
    }

# Also include JS files
$jsFiles = Get-ChildItem -Path $sourceDir -Filter "*.js" -Recurse | 
    Where-Object { 
        $file = $_
        # Skip files in excluded directories
        foreach ($dir in $excludeDirs) {
            if ($file.FullName -like "*\$dir\*") {
                return $false
            }
        }
        # Skip products.js since we already processed it
        if ($file.Name -eq "products.js" -or $file.Name -eq "products-new.js" -or $file.Name -eq "products-extracted.js") {
            return $false
        }
        return $true
    }

$filesToCheck += $jsFiles

# Initialize counters
$validProductLinks = 0
$invalidProductLinks = 0
$validCategoryLinks = 0
$invalidCategoryLinks = 0

# Check each file for product and category links
foreach ($file in $filesToCheck) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check product links
    $productLinkMatches = [regex]::Matches($content, 'product\.html\?id=([^"&]+)')
    foreach ($match in $productLinkMatches) {
        $productId = $match.Groups[1].Value
        if ($productIds -contains $productId) {
            $validProductLinks++
        } else {
            $invalidProductLinks++
            Write-Host "Invalid product ID in $($file.FullName): $productId"
        }
    }
    
    # Check category links
    $categoryLinkMatches = [regex]::Matches($content, 'category\.html\?cat=([^"&]+)')
    foreach ($match in $categoryLinkMatches) {
        $category = $match.Groups[1].Value
        if ($categories -contains $category) {
            $validCategoryLinks++
        } else {
            $invalidCategoryLinks++
            Write-Host "Invalid category in $($file.FullName): $category"
        }
    }
}

# Print summary
Write-Host "`nLink Verification Summary:"
Write-Host "Valid product links: $validProductLinks"
Write-Host "Invalid product links: $invalidProductLinks"
Write-Host "Valid category links: $validCategoryLinks"
Write-Host "Invalid category links: $invalidCategoryLinks"

# Check if all links are valid
if ($invalidProductLinks -eq 0 -and $invalidCategoryLinks -eq 0) {
    Write-Host "`nAll links are valid! The dynamic pages should work correctly."
} else {
    Write-Host "`nSome links are invalid. Please fix them to ensure all dynamic pages work correctly."
}
