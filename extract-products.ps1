$archiveDir = "c:\Users\usama\OneDrive\Desktop\Abdullah\Website\archive"
$outputFile = "c:\Users\usama\OneDrive\Desktop\Abdullah\Website\products-extracted.js"

# Define category mappings
$categoryMappings = @{
    "airpods.html" = "airpods"
    "casualwatch.html" = "casualwatch"
    "crocs.html" = "crocs"
    "galaxy-buds-2-pro.html" = "headphones"
    "headphones.html" = "headphones"
    "magsafe.html" = "accessories"
    "moreproducts.html" = "accessories"
    "shoes.html" = "shoes"
    "smartwatches.html" = "smartwatches"
}

# Initialize products object
$products = @{}
$productCount = 0

# Function to extract product ID from href
function Extract-ProductId {
    param (
        [string]$href
    )
    
    if ($href -match "product\.html\?id=([^&]+)") {
        return $matches[1]
    }
    
    # If no ID found, generate one based on the product count
    $global:productCount++
    return "product$($global:productCount.ToString('D2'))"
}

# Function to clean price text
function Clean-Price {
    param (
        [string]$price
    )
    
    return $price.Trim()
}

# Function to clean image path
function Clean-ImagePath {
    param (
        [string]$imagePath
    )
    
    # Remove ../ prefix if present
    $cleanPath = $imagePath -replace "^\.\./", ""
    
    # Ensure path starts with images/
    if (-not $cleanPath.StartsWith("images/")) {
        $cleanPath = "images/" + ($cleanPath -replace "^.*?/([^/]+)$", '$1')
    }
    
    return $cleanPath
}

# Process each category file
foreach ($categoryFile in $categoryMappings.Keys) {
    $categoryPath = Join-Path -Path $archiveDir -ChildPath $categoryFile
    $category = $categoryMappings[$categoryFile]
    
    if (Test-Path $categoryPath) {
        Write-Host "Processing $categoryFile (Category: $category)..."
        
        # Read the HTML content
        $htmlContent = Get-Content -Path $categoryPath -Raw
        
        # Create a .NET HTML document
        Add-Type -AssemblyName System.Web
        $doc = New-Object System.Web.UI.HtmlControls.HtmlGenericControl
        $doc.InnerHtml = $htmlContent
        
        # Extract product cards using regex
        $productCardPattern = '<div class="col-[^>]*>.*?<div class="product-card">.*?<a href="([^"]*)".*?<img src="([^"]*)" alt="([^"]*)".*?<h3>([^<]*)</h3>.*?<p class="price">([^<]*)</p>.*?</div>.*?</div>'
        $productMatches = [regex]::Matches($htmlContent, $productCardPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
        
        foreach ($match in $productMatches) {
            $href = $match.Groups[1].Value
            $imgSrc = $match.Groups[2].Value
            $imgAlt = $match.Groups[3].Value
            $productName = $match.Groups[4].Value.Trim()
            $price = Clean-Price -price $match.Groups[5].Value
            
            # Extract product ID from href
            $productId = Extract-ProductId -href $href
            
            # Clean image path
            $imagePath = Clean-ImagePath -imagePath $imgSrc
            
            # Create product object
            $products[$productId] = @{
                id = $productId
                name = $productName
                image = $imagePath
                price = $price
                category = $category
            }
            
            Write-Host "  Added product: $productName (ID: $productId)"
        }
    }
    else {
        Write-Host "Category file not found: $categoryPath"
    }
}

# Generate JavaScript file
$jsContent = @"
/**
 * Product data extracted from static HTML category pages
 * This file contains structured product data for use with dynamic category.html and product.html pages
 */
const products = {
"@

foreach ($productId in $products.Keys) {
    $product = $products[$productId]
    $jsContent += @"

  "$productId": {
    id: "$($product.id)",
    name: "$($product.name)",
    image: "$($product.image)",
    price: "$($product.price)",
    category: "$($product.category)"
  },
"@
}

# Remove trailing comma
$jsContent = $jsContent.TrimEnd(",`r`n") + "`r`n"

# Add export and utility functions
$jsContent += @"
};

// Function to get all products
function getAllProducts() {
  return Object.values(products);
}

// Function to get products by category
function getProductsByCategory(category) {
  return Object.values(products).filter(product => product.category === category);
}

// Function to get product by ID
function getProductById(id) {
  return products[id] || null;
}

// Export the products object and helper functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { products, getAllProducts, getProductsByCategory, getProductById };
}
"@

# Write to file
Set-Content -Path $outputFile -Value $jsContent

Write-Host "Extracted $($products.Count) products to $outputFile"
