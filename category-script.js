// Category page script
document.addEventListener('DOMContentLoaded', function() {
    // Check if the current page is category.html
    if (window.location.pathname.endsWith('/category.html')) {
        console.log('Category page detected. Initializing category page logic.');

        // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');
    
    if (!category) {
            showError('No category specified');
        return;
    }
    
        // Update page title and header
        const categoryTitle = document.getElementById('category-title');
        const categoryHeaderTitle = document.getElementById('category-header-title');
        const categoryHeaderDescription = document.getElementById('category-header-description');
        
        if (categoryTitle) categoryTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} - Aziz Phone Hub`;
        if (categoryHeaderTitle) categoryHeaderTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`;
        if (categoryHeaderDescription) categoryHeaderDescription.textContent = `Discover our premium selection of ${category}`;

        // Get products for this category
        const products = getProductsByCategory(category);
        const productsGrid = document.getElementById('products-grid');
        const noProductsFound = document.getElementById('no-products-found');

        if (!products.length) {
            if (productsGrid) productsGrid.innerHTML = '';
            if (noProductsFound) noProductsFound.classList.remove('d-none');
                return;
            }

        if (noProductsFound) noProductsFound.classList.add('d-none');
        if (productsGrid) {
            productsGrid.innerHTML = '';
            let productsHtml = '';
            products.forEach(product => {
                productsHtml += createProductCard(product);
            });
            productsGrid.innerHTML = productsHtml;
        }

        // Initialize product button listeners
        initializeProductButtonListeners();
        updateWishlistButtonStates();

        // Initialize filters
        initializeFilters(products);
        
        // Initialize sort functionality
        initializeSorting(products);
                } else {
        console.log('Not on category page. Skipping category page logic.');
    }
});

function initializeSorting(products) {
    const sortButtons = document.querySelectorAll('.sort-option');
    sortButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sortOption = e.currentTarget.getAttribute('data-sort');
            sortProducts(products, sortOption);
        });
    });
}

function sortProducts(products, sortOption) {
    let sortedProducts = [...products];
    
    switch(sortOption) {
        case 'price-low-high':
            sortedProducts.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
                const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
                return priceA - priceB;
            });
            break;
            
        case 'price-high-low':
            sortedProducts.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
                const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
                return priceB - priceA;
            });
            break;
            
        case 'newest':
            // Assuming newer products have higher IDs or you can add a 'dateAdded' field
            sortedProducts.reverse();
            break;
            
        case 'popularity':
            // Shuffle array for random order (simulating popularity)
            for (let i = sortedProducts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [sortedProducts[i], sortedProducts[j]] = [sortedProducts[j], sortedProducts[i]];
            }
            break;
            
        default:
            // Default sorting (as loaded)
            break;
    }
    
    // Update the display with sorted products
    updateProductsDisplay(sortedProducts);
}

function updateProductsDisplay(products) {
    const productsGrid = document.getElementById('products-grid');
    const noProductsFound = document.getElementById('no-products-found');
    
    if (productsGrid) {
        productsGrid.innerHTML = '';
        if (products.length > 0) {
            if (noProductsFound) noProductsFound.classList.add('d-none');
            products.forEach(product => {
                productsGrid.innerHTML += createProductCard(product);
            });
            // Reinitialize product button listeners after updating the grid
            initializeProductButtonListeners();
            updateWishlistButtonStates();
        } else if (noProductsFound) {
            noProductsFound.classList.remove('d-none');
        }
    }
}

function initializeFilters(products) {
    // Get unique brands from the already filtered products
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    
    // Update brand checkboxes to show only relevant brands
    const brandContainer = document.querySelector('.filter-section:has(.filter-brand)');
    if (brandContainer) {
        // Clear existing brand checkboxes
        const brandCheckboxes = brandContainer.querySelectorAll('.form-check');
        brandCheckboxes.forEach(el => el.remove());
        
        // Add checkboxes for each brand in this category
        brands.forEach(brand => {
            if (!brand) return; // Skip if brand is undefined
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input filter-brand" type="checkbox" value="${brand}" id="brand${brand.replace(/\s+/g, '')}">
                <label class="form-check-label" for="brand${brand.replace(/\s+/g, '')}">${brand}</label>
            `;
            brandContainer.appendChild(div);
        });
    }
    
    // Re-bind filter event listeners after updating the DOM
    bindFilterEvents(products);
    
    // Initialize price range slider
    const minPriceInput = document.getElementById('minPriceRange');
    const maxPriceInput = document.getElementById('maxPriceRange');
    const minPriceValue = document.getElementById('minPriceValue');
    const maxPriceValue = document.getElementById('maxPriceValue');
    
    if (minPriceInput && maxPriceInput && minPriceValue && maxPriceValue) {
        // Extract numeric values from prices (remove Rupee symbol and commas)
        const prices = products.map(p => {
            if (typeof p.price === 'string') {
                return parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0;
            }
            return p.price || 0;
        });
        
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        // Set min and max attributes for the range inputs
        minPriceInput.min = minPrice;
        minPriceInput.max = maxPrice;
        minPriceInput.value = minPrice;
        
        maxPriceInput.min = minPrice;
        maxPriceInput.max = maxPrice;
        maxPriceInput.value = maxPrice;
        
        // Update displayed price values
        minPriceValue.textContent = `₹${minPrice.toLocaleString('en-IN')}`;
        maxPriceValue.textContent = `₹${maxPrice.toLocaleString('en-IN')}`;
        
        // Add event listeners for real-time price updates
        minPriceInput.addEventListener('input', () => {
            minPriceValue.textContent = `₹${parseInt(minPriceInput.value).toLocaleString('en-IN')}`;
            // Ensure min doesn't exceed max
            if (parseInt(minPriceInput.value) > parseInt(maxPriceInput.value)) {
                maxPriceInput.value = minPriceInput.value;
                maxPriceValue.textContent = `₹${parseInt(maxPriceInput.value).toLocaleString('en-IN')}`;
            }
        });
        
        maxPriceInput.addEventListener('input', () => {
            maxPriceValue.textContent = `₹${parseInt(maxPriceInput.value).toLocaleString('en-IN')}`;
            // Ensure max doesn't go below min
            if (parseInt(maxPriceInput.value) < parseInt(minPriceInput.value)) {
                minPriceInput.value = maxPriceInput.value;
                minPriceValue.textContent = `₹${parseInt(minPriceInput.value).toLocaleString('en-IN')}`;
            }
        });
    }
    
    // Bind filter events
    bindFilterEvents(products);
}

function applyFilters(products) {
    // Get all selected brand checkboxes
    const selectedBrands = [];
    document.querySelectorAll('.filter-brand:checked').forEach(checkbox => {
        selectedBrands.push(checkbox.value);
    });
    
    // Get price range values
    const minPriceInput = document.getElementById('minPriceRange');
    const maxPriceInput = document.getElementById('maxPriceRange');
    const minPrice = minPriceInput ? parseInt(minPriceInput.value) : 0;
    const maxPrice = maxPriceInput ? parseInt(maxPriceInput.value) : Infinity;
    
    const productsGrid = document.getElementById('products-grid');
    const noProductsFound = document.getElementById('no-products-found');

    let filteredProducts = [...products];

    // Apply brand filter if any brand is selected
    if (selectedBrands.length > 0) {
        filteredProducts = filteredProducts.filter(p => selectedBrands.includes(p.brand));
    }

    // Apply price range filter
    filteredProducts = filteredProducts.filter(p => {
        // Extract numeric value from price (remove Rupee symbol and commas)
        let price;
        if (typeof p.price === 'string') {
            price = parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0;
        } else {
            price = p.price || 0;
        }
        
        return price >= minPrice && price <= maxPrice;
    });

    // Update products display
    if (productsGrid) {
        productsGrid.innerHTML = '';
        if (filteredProducts.length > 0) {
            if (noProductsFound) noProductsFound.classList.add('d-none');
            filteredProducts.forEach(product => {
                productsGrid.innerHTML += createProductCard(product);
            });
            // Reinitialize product button listeners after updating the grid
            initializeProductButtonListeners();
            updateWishlistButtonStates();
        } else {
            if (noProductsFound) noProductsFound.classList.remove('d-none');
        }
    }
}

function bindFilterEvents(products) {
    // Add event listeners for filter buttons
    const applyFilterBtn = document.getElementById('apply-filter-btn');
    const resetFilterBtn = document.getElementById('reset-filter-btn');
    
    if (applyFilterBtn && resetFilterBtn) {
        // Remove existing event listeners to prevent duplicates
        const newApplyBtn = applyFilterBtn.cloneNode(true);
        const newResetBtn = resetFilterBtn.cloneNode(true);
        
        applyFilterBtn.parentNode.replaceChild(newApplyBtn, applyFilterBtn);
        resetFilterBtn.parentNode.replaceChild(newResetBtn, resetFilterBtn);
        
        // Add new event listeners
        newApplyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyFilters(products);
        });
        
        newResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetFilters(products);
        });
    }
}

function resetFilters(products) {
    // Reset brand checkboxes
    document.querySelectorAll('.filter-brand').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset price range sliders
    const minPriceInput = document.getElementById('minPriceRange');
    const maxPriceInput = document.getElementById('maxPriceRange');
    const minPriceValue = document.getElementById('minPriceValue');
    const maxPriceValue = document.getElementById('maxPriceValue');
    
    if (minPriceInput && maxPriceInput && minPriceValue && maxPriceValue) {
        // Extract numeric values from prices (remove Rupee symbol and commas)
        const prices = products.map(p => {
            if (typeof p.price === 'string') {
                return parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0;
            }
            return p.price || 0;
        });
        
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        minPriceInput.value = minPrice;
        maxPriceInput.value = maxPrice;
        minPriceValue.textContent = `₹${minPrice.toLocaleString('en-IN')}`;
        maxPriceValue.textContent = `₹${maxPrice.toLocaleString('en-IN')}`;
    }
    
    // Display all products again
    const productsGrid = document.getElementById('products-grid');
    const noProductsFound = document.getElementById('no-products-found');

    if (noProductsFound) noProductsFound.classList.add('d-none');
    if (productsGrid) {
        productsGrid.innerHTML = '';
        const category = new URLSearchParams(window.location.search).get('cat');
        const categoryProducts = category ? 
            products.filter(p => p.category === category) : 
            products;
            
        if (categoryProducts.length > 0) {
            categoryProducts.forEach(product => {
                productsGrid.innerHTML += createProductCard(product);
            });
            // Reinitialize product button listeners after updating the grid
            initializeProductButtonListeners();
            updateWishlistButtonStates();
        } else if (noProductsFound) {
            noProductsFound.classList.remove('d-none');
        }
    }
}

