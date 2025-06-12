$sourceDir = "c:\Users\usama\OneDrive\Desktop\Abdullah\Website"
$excludeDirs = @(
    "archive",
    "old-products",
    "node_modules"
)

# Define a mapping between old category HTML files and their new dynamic URLs
$categoryMapping = @{
    "smartwatches.html" = "category.html?cat=smartwatches"
    "airpods.html" = "category.html?cat=airpods"
    "headphones.html" = "category.html?cat=headphones"
    "shoes.html" = "category.html?cat=shoes"
    "casualwatch.html" = "category.html?cat=casualwatch"
    "crocs.html" = "category.html?cat=crocs"
    "magsafe.html" = "category.html?cat=accessories"
    "moreproducts.html" = "category.html?cat=accessories"
}

# Define a mapping between old product HTML files and their new product IDs
$productMapping = @{
    # AirPods
    "airpods/airpods-gen4.html" = "product.html?id=airpods01"
    "airpods/airpods-pro-2.html" = "product.html?id=airpods-pro-2"
    "airpods/airpods-pro-2-display.html" = "product.html?id=airpods-pro-2"
    "airpods/airpods-3rd-generation.html" = "product.html?id=airpods-3"
    "airpods/airpods-2nd-generation.html" = "product.html?id=airpods-2"
    "headphones/airpods-max.html" = "product.html?id=airpods-max"
    "airpods/galaxy-buds-2-pro.html" = "product.html?id=galaxy-buds-2-pro"
    "galaxy-buds-2-pro.html" = "product.html?id=galaxy-buds-2-pro"
    
    # Smartwatches
    "smartwatch/apple-watch-series-10.html" = "product.html?id=apple-watch-series-10"
    "smartwatch/samsung-watch-ultra.html" = "product.html?id=samsung-watch-ultra"
    "smartwatch/hk9-ultra.html" = "product.html?id=hk9-ultra"
    "smartwatch/active-2-smartwatch.html" = "product.html?id=active-2-smartwatch"
    "smartwatch/gen-16-pro.html" = "product.html?id=gen-16-pro"
    "smartwatch/gen-9-pro.html" = "product.html?id=gen-9-pro"
    "smartwatch/s9-pro-max.html" = "product.html?id=s9-pro-max"
    "smartwatch/t10-ultra.html" = "product.html?id=t10-ultra"
    "smartwatch/x90-max.html" = "product.html?id=x90-max"
    "smartwatch/z86-pro-max.html" = "product.html?id=z86-pro-max"
    "smartwatch/smartwatches.html" = "category.html?cat=smartwatches"
    
    # Shoes
    "shoes/nike-airmax.html" = "product.html?id=nike-airmax"
    "shoes/nike-dunk-unc.html" = "product.html?id=nike-dunk-unc"
    "shoes/nike-vomero-black.html" = "product.html?id=nike-vomero-black"
    "shoes/nike-vomero-white.html" = "product.html?id=nike-vomero-white"
    "shoes/puma-suede-crush.html" = "product.html?id=puma-suede-crush"
    
    # Casual Watches
    "casualwatch/boss-hugo.html" = "product.html?id=boss-hugo"
    "casualwatch/cartier-roman.html" = "product.html?id=cartier-roman"
    "casualwatch/gshock-manga.html" = "product.html?id=gshock-manga"
    "casualwatch/omega-seamaster.html" = "product.html?id=omega-seamaster"
    "casualwatch/tissot-trace.html" = "product.html?id=tissot-trace"
    
    # Crocs
    "crocs/bayband-flip.html" = "product.html?id=bayband-flip"
    "crocs/bayband-slide.html" = "product.html?id=bayband-slide"
    "crocs/bayband.html" = "product.html?id=bayband"
    "crocs/echo-clog.html" = "product.html?id=echo-clog"
    "crocs/literide-360.html" = "product.html?id=literide-360"
    "crocs/yukon.html" = "product.html?id=yukon"
    
    # Other Products
    "magsafe/magsafe.html" = "product.html?id=magsafe"
    "moreproducts/apple-power-adapter.html" = "product.html?id=apple-power-adapter"
    "moreproducts/type-c-cable.html" = "product.html?id=type-c-cable"
    "moreproducts/type-c-lightning-cable.html" = "product.html?id=type-c-lightning-cable"
    
    # Offer Bundles
    "offer/airpodmax-airpods2.html" = "product.html?id=airpodmax-airpods2-bundle"
    "offer/airpodpro2-magsafe.html" = "product.html?id=airpodpro2-magsafe-bundle"
    "offer/series9-airpods2.html" = "product.html?id=series9-airpods2-bundle"
}

# Get all HTML and JS files to update, excluding specific directories
$filesToUpdate = Get-ChildItem -Path $sourceDir -Filter "*.html" -Recurse | 
    Where-Object { 
        $file = $_
        # Skip files in excluded directories
        foreach ($dir in $excludeDirs) {
            if ($file.FullName -like "*\$dir\*") {
                return $false
            }
        }
        # Only include the main files we want to keep
        $file.Name -in @("index.html", "product.html", "category.html", "cart.html", "profile.html", "shop.html")
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
        return $true
    }

$filesToUpdate += $jsFiles

$updatedFilesCount = 0
$totalLinksUpdated = 0

foreach ($file in $filesToUpdate) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $linksUpdated = 0
    
    # Update category links
    foreach ($oldPath in $categoryMapping.Keys) {
        $newPath = $categoryMapping[$oldPath]
        
        # Handle different relative path formats
        $oldPathVariations = @(
            $oldPath,                     # Original path
            "./$oldPath",                 # With ./ prefix
            "../$oldPath",                # With ../ prefix
            "../../$oldPath",             # With ../../ prefix
            $oldPath.Replace("/", "\")    # With backslashes
        )
        
        foreach ($variation in $oldPathVariations) {
            if ($content -match [regex]::Escape("href=`"$variation`"")) {
                $content = $content -replace [regex]::Escape("href=`"$variation`""), "href=`"$newPath`""
                $linksUpdated++
            }
            # Also check for JavaScript string references
            if ($content -match [regex]::Escape("'$variation'") -or $content -match [regex]::Escape("`"$variation`"")) {
                $content = $content -replace [regex]::Escape("'$variation'"), "'$newPath'"
                $content = $content -replace [regex]::Escape("`"$variation`""), "`"$newPath`""
                $linksUpdated++
            }
        }
    }
    
    # Update product links
    foreach ($oldPath in $productMapping.Keys) {
        $newPath = $productMapping[$oldPath]
        
        # Handle different relative path formats
        $oldPathVariations = @(
            $oldPath,                     # Original path
            "./$oldPath",                 # With ./ prefix
            "../$oldPath",                # With ../ prefix
            "../../$oldPath",             # With ../../ prefix
            $oldPath.Replace("/", "\")    # With backslashes
        )
        
        foreach ($variation in $oldPathVariations) {
            if ($content -match [regex]::Escape("href=`"$variation`"")) {
                $content = $content -replace [regex]::Escape("href=`"$variation`""), "href=`"$newPath`""
                $linksUpdated++
            }
            # Also check for JavaScript string references
            if ($content -match [regex]::Escape("'$variation'") -or $content -match [regex]::Escape("`"$variation`"")) {
                $content = $content -replace [regex]::Escape("'$variation'"), "'$newPath'"
                $content = $content -replace [regex]::Escape("`"$variation`""), "`"$newPath`""
                $linksUpdated++
            }
        }
    }
    
    # Only save the file if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content
        $updatedFilesCount++
        $totalLinksUpdated += $linksUpdated
        Write-Host "Updated $linksUpdated links in $($file.FullName)"
    }
}

Write-Host "Updated $totalLinksUpdated links in $updatedFilesCount files."
