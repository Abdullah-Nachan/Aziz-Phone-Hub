$sourceDir = "c:\Users\usama\OneDrive\Desktop\Abdullah\Website"

# Files to exclude from removal (keep these files)
$excludeFiles = @(
    "index.html",
    "product.html",
    "category.html",
    "cart.html",
    "profile.html",
    "shop.html"
)

# Directories to exclude from searching
$excludeDirs = @(
    "archive",
    "old-products",
    "node_modules"
)

# Get all HTML files recursively, excluding specific files and directories
$htmlFiles = Get-ChildItem -Path $sourceDir -Filter "*.html" -Recurse | 
    Where-Object { 
        $file = $_
        # Skip files in excluded directories
        foreach ($dir in $excludeDirs) {
            if ($file.FullName -like "*\$dir\*") {
                return $false
            }
        }
        # Skip excluded files
        foreach ($exclude in $excludeFiles) {
            if ($file.Name -eq $exclude) {
                return $false
            }
        }
        return $true
    }

# Remove the original files now that they've been safely copied to the archive
foreach ($file in $htmlFiles) {
    Remove-Item -Path $file.FullName -Force
    Write-Host "Removed $($file.FullName)"
}

Write-Host "All static HTML files have been removed from the main website directory."
