$sourceDir = "c:\Users\usama\OneDrive\Desktop\Abdullah\Website"
$destDir = "c:\Users\usama\OneDrive\Desktop\Abdullah\Website\old-products"

# Files to exclude from moving
$excludeFiles = @(
    "index.html",
    "shop.html",
    "cart.html",
    "profile.html",
    "product.html",
    "wishlist.html",
    "smartwatches.html"
)

# Directories to exclude from searching
$excludeDirs = @(
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
        # Skip category pages (files named exactly like their parent directory)
        if ($file.Name -eq "$($file.Directory.Name).html") {
            return $false
        }
        return $true
    }

# Create directories and copy files
foreach ($file in $htmlFiles) {
    # Get the relative path from the source directory
    $relativePath = $file.FullName.Substring($sourceDir.Length + 1)
    $destPath = Join-Path -Path $destDir -ChildPath $relativePath
    
    # Create the destination directory if it doesn't exist
    $destDirectory = Split-Path -Path $destPath -Parent
    if (!(Test-Path -Path $destDirectory)) {
        New-Item -ItemType Directory -Path $destDirectory -Force | Out-Null
    }
    
    # Copy the file to the destination
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    
    Write-Host "Copied $($file.FullName) to $destPath"
}

Write-Host "All product HTML files have been copied to the old-products directory."
