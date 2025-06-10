/**
 * Shop page functionality for Aziz Phone Hub
 * Handles product display, filtering, and cart interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize shop page
    initializeShopPage();
});

// Fetch and display products from static-products.js
async function fetchAndDisplayProducts(category = null, minPrice = null, maxPrice = null, sort = null) {
    try {
        console.log('fetchAndDisplayProducts called with:', {
            category: category,
            minPrice: minPrice,
            maxPrice: maxPrice,
            sort: sort
        });
        const productsContainer = document.getElementById('all-products-container');
        if (!productsContainer) {
            console.error('Products container not found');
            return;
        }

        // Show loading state
        productsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        // Get all products from static data
        let allProducts = Object.values(window.products || {});

        // Apply category filter
        let filteredProducts = allProducts;
        if (category && category !== '') {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }

        // Apply price range filter (convert prices to numbers for comparison)
        if (minPrice !== null && minPrice > 0) {
            filteredProducts = filteredProducts.filter(product => {
                const price = parseInt((product.price || '').replace(/[^\d]/g, '')) || 0;
                return price >= minPrice;
            });
        }
        if (maxPrice !== null && maxPrice !== Infinity && maxPrice > 0) {
            filteredProducts = filteredProducts.filter(product => {
                const price = parseInt((product.price || '').replace(/[^\d]/g, '')) || 0;
                return price <= maxPrice;
            });
        }

        // Apply sorting
        if (sort === 'price-low') {
            filteredProducts.sort((a, b) => {
                const priceA = parseInt((a.price || '').replace(/[^\d]/g, '')) || 0;
                const priceB = parseInt((b.price || '').replace(/[^\d]/g, '')) || 0;
                return priceA - priceB;
            });
        } else if (sort === 'price-high') {
            filteredProducts.sort((a, b) => {
                const priceA = parseInt((a.price || '').replace(/[^\d]/g, '')) || 0;
                const priceB = parseInt((b.price || '').replace(/[^\d]/g, '')) || 0;
                return priceB - priceA;
            });
        } else if (sort === 'newest') {
            // If you have a 'createdAt' or similar property, sort by that; otherwise, leave as is or shuffle
            filteredProducts = shuffleArray(filteredProducts);
        } else if (sort === 'popularity') {
            // If you have a 'popularity' property, sort by that; otherwise, shuffle
            filteredProducts = shuffleArray(filteredProducts);
        } else {
            // Default: shuffle
            filteredProducts = shuffleArray(filteredProducts);
        }

        // Clear loading state
        productsContainer.innerHTML = '';

        // No products found
        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = '<div class="col-12 text-center"><p>No products found.</p></div>';
            return;
        }

        // Render product cards
        filteredProducts.forEach(product => {
            const productId = product.id;
            // Format the price to ensure only one rupee symbol
            const price = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^0-9.]/g, '')) : product.price;
            const formattedPrice = typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : product.price;
            
            const productCard = `
                <div class="col-6 col-md-4 col-lg-3 mb-4">
                    <div class="product-card">
                        <div class="product-actions">
                            <button class="product-action-btn like-btn" data-product-id="${productId}" title="Add to Wishlist">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        <div class="product-image">
                            <a href="product.html?id=${productId}">
                                <img src="${product.image || 'https://res.cloudinary.com/dcnawxif9/image/upload/v1748688934/logo_qn8fgh.jpg'}" alt="${product.name}" class="img-fluid">
                            </a>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">
                                <a href="product.html?id=${productId}">${product.name}</a>
                            </h3>
                            <p class="price">${formattedPrice}</p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-primary add-to-cart w-100" data-product-id="${productId}">
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.innerHTML += productCard;
        });

        // Update product cards with proper functionality
        updateProductCards();
    } catch (error) {
        console.error('Error fetching and displaying products:', error);
        const productsContainer = document.getElementById('all-products-container');
        if (productsContainer) {
            productsContainer.innerHTML = '<div class="col-12 text-center"><p>Error loading products. Please try again later.</p></div>';
        }
    }
}


// Fisher-Yates (Knuth) Shuffle algorithm
function shuffleArray(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

// Initialize shop page
function initializeShopPage() {
    // Fetch and display products
    fetchAndDisplayProducts();
    
    // Initialize filters
    initializeFilters();
    
    // Add event listener to close filter panel on apply
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            // Get the filter panel element
            const filterPanel = document.getElementById('filterPanel');
            if (filterPanel) {
                // Use Bootstrap's Offcanvas instance to hide the panel
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(filterPanel);
                if (offcanvasInstance) {
                    offcanvasInstance.hide();
                } else {
                    // If instance doesn't exist, create one and hide
                    const newOffcanvasInstance = new bootstrap.Offcanvas(filterPanel);
                    newOffcanvasInstance.hide();
                }
            }
        });
    }
}

// Update product cards with proper cart and wishlist functionality
function updateProductCards() {
    console.log('Updating product cards with event listeners');

    // Remove existing event listeners before relying on delegation
    document.querySelectorAll('.add-to-cart').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    document.querySelectorAll('.buy-now').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    document.querySelectorAll('.like-btn').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });

    // The primary event listeners for .add-to-cart, .buy-now, and .like-btn are handled by delegation in cart.js
    // We no longer need to add individual listeners here.

    // The following code is commented out as the listeners are handled by delegation in cart.js
    /*
    // Get all product cards
    const productCards = document.querySelectorAll('.card');
    
    productCards.forEach(card => {
        // Get product elements
        const addToCartBtn = card.querySelector('.btn-primary:not(.buy-now)') || card.querySelector('.btn-primary');
        const buyNowBtn = card.querySelector('.buy-now');
        const likeBtn = card.querySelector('.like-btn');
        
        // If there's no proper add to cart button, update the existing one
        if (addToCartBtn && !addToCartBtn.classList.contains('add-to-cart')) {
            // Get product ID from any existing data attribute or from the link
            let productId = '';
            if (addToCartBtn.dataset.productId) {
                productId = addToCartBtn.dataset.productId;
            } else {
                const productLink = card.querySelector('a');
                if (productLink && productLink.href) {
                    const url = new URL(productLink.href);
                    const params = new URLSearchParams(url.search);
                    productId = params.get('id') || '';
                    
                    // Extract ID from path if not in query params
                    if (!productId && url.pathname) {
                        const pathParts = url.pathname.split('/');
                        const filename = pathParts[pathParts.length - 1];
                        if (filename.includes('.html')) {
                            // For paths like ./headphones/bose-qc-ultra.html
                            const nameWithoutExt = filename.replace('.html', '');
                            productId = nameWithoutExt;
                        }
                    }
                }
            }
            
            if (productId) {
                // Update button
                addToCartBtn.classList.add('add-to-cart');
                addToCartBtn.dataset.productId = productId;
                addToCartBtn.textContent = 'Add to Cart';
                
                // Fix the card layout if needed
                const cardBody = card.querySelector('.card-body');
                if (cardBody && !cardBody.classList.contains('d-flex')) {
                    cardBody.classList.add('d-flex', 'flex-column');
                    
                    // Move price and buttons to the correct position
                    const title = cardBody.querySelector('.card-title');
                    const price = cardBody.querySelector('.price');
                    
                    // Create container for buttons
                    const buttonContainer = document.createElement('div');
                    buttonContainer.className = 'mt-auto d-flex gap-2';
                    
                    // Move add to cart button to container
                    addToCartBtn.classList.remove('w-100');
                    addToCartBtn.classList.add('flex-grow-1');
                    buttonContainer.appendChild(addToCartBtn);
                    
                    // Create buy now button if it doesn't exist
                    if (!buyNowBtn) {
                        const newBuyNowBtn = document.createElement('button');
                        newBuyNowBtn.className = 'btn btn-outline-primary buy-now';
                        newBuyNowBtn.dataset.productId = productId;
                        newBuyNowBtn.innerHTML = '<i class="fas fa-bolt"></i>';
                        buttonContainer.appendChild(newBuyNowBtn);
                    }
                    
                    // Add button container to card body
                    cardBody.appendChild(buttonContainer);
                }
            }
        }
        
        // If there's no like button, add one
        if (!likeBtn) {
            // Get product ID
            let productId = '';
            const addToCartButton = card.querySelector('.add-to-cart');
            if (addToCartButton && addToCartButton.dataset.productId) {
                productId = addToCartButton.dataset.productId;
            } else {
                const productLink = card.querySelector('a');
                if (productLink && productLink.href) {
                    const url = new URL(productLink.href);
                    const params = new URLSearchParams(url.search);
                    productId = params.get('id') || '';
                    
                    // Extract ID from path if not in query params
                    if (!productId && url.pathname) {
                        const pathParts = url.pathname.split('/');
                        const filename = pathParts[pathParts.length - 1];
                        if (filename.includes('.html')) {
                            // For paths like ./headphones/bose-qc-ultra.html
                            const nameWithoutExt = filename.replace('.html', '');
                            productId = nameWithoutExt;
                        }
                    }
                }
            }
            
            if (productId) {
                // Get product image container
                const productImage = card.querySelector('.product-image');
                if (productImage) {
                    // Make sure it has position relative
                    productImage.classList.add('position-relative');
                    
                    // Create like button
                    const newLikeBtn = document.createElement('button');
                    newLikeBtn.className = 'btn like-btn position-absolute top-0 end-0 m-2';
                    newLikeBtn.dataset.productId = productId;
                    newLikeBtn.innerHTML = '<i class="fas fa-heart"></i>';
                    
                    // Add active class if product is in wishlist
                    if (typeof wishlist !== 'undefined' && wishlist.hasItem(productId)) {
                        newLikeBtn.classList.add('active');
                    }
                    
                    // Add like button to product image container
                    productImage.appendChild(newLikeBtn);
                }
            }
        }
    });
    
    // Add event listeners to all add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        // Remove existing event listeners
        button.replaceWith(button.cloneNode(true));
    });
    
    // Re-add event listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            
            // Add to cart
            if (typeof cart !== 'undefined' && cart.addItem(productId)) {
                // Show success message
                Swal.fire({
                    title: 'Added to cart!',
                    text: 'The item has been added to your cart.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    });
    
    // Add event listeners to all buy now buttons
    document.querySelectorAll('.buy-now').forEach(button => {
        // Remove existing event listeners
        button.replaceWith(button.cloneNode(true));
    });
    
    // Re-add event listeners
    document.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            
            if (typeof cart !== 'undefined') {
                // Clear cart first
                cart.clearCart();
                
                // Add to cart
                if (cart.addItem(productId)) {
                    // Redirect to checkout
                    window.location.href = 'checkout.html';
                }
            }
        });
    });
    
    // Add event listeners to all like buttons
    document.querySelectorAll('.like-btn').forEach(button => {
        // Remove existing event listeners
        button.replaceWith(button.cloneNode(true));
    });
    
    // Re-add event listeners
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.dataset.productId;
            
            if (typeof wishlist !== 'undefined') {
                // Toggle wishlist item
                const isAdded = wishlist.toggleItem(productId);
                
                // Update button state
                if (isAdded) {
                    this.classList.add('active');
                    
                    // Show success message
                    Swal.fire({
                        title: 'Added to wishlist!',
                        text: 'The item has been added to your wishlist.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    this.classList.remove('active');
                    
                    // Show success message
                    Swal.fire({
                        title: 'Removed from wishlist!',
                        text: 'The item has been removed from your wishlist.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        });
    });
    */
}

// Initialize filters
function initializeFilters() {
    const categorySelect = document.getElementById('categoryFilter');
    const minPriceInput = document.getElementById('minPriceFilter');
    const maxPriceInput = document.getElementById('maxPriceFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFilterBtn = document.getElementById('resetFiltersBtn'); // Corrected selector
    const sortSelectDesktop = document.getElementById('sortSelectDesktop');
    const sortSelectMobile = document.getElementById('sortSelectMobile');
    const mobileSortButtons = document.querySelectorAll('#sortPanel .sort-options button');

    // State variables to hold current filter/sort values
    let currentCategory = '';
    let currentMinPrice = null;
    let currentMaxPrice = null;
    let currentSort = 'popularity'; // Default sort

    // Function to apply filters and sort
    async function applyFiltersAndSort() {
        // Read current values from inputs
        currentCategory = categorySelect ? categorySelect.value : '';
        currentMinPrice = minPriceInput ? parseFloat(minPriceInput.value) : null;
        currentMaxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) : null;

        // Determine current sort value from either desktop or mobile select
        if (sortSelectDesktop && sortSelectDesktop.value) {
            currentSort = sortSelectDesktop.value;
        } else if (sortSelectMobile && sortSelectMobile.value) {
             currentSort = sortSelectMobile.value; // Fallback to mobile if desktop not present
        }
         // If sort was selected via mobile buttons, currentSort is already updated

        console.log('Applying filters and sort with state:', {
            category: currentCategory,
            minPrice: currentMinPrice,
            maxPrice: currentMaxPrice,
            sort: currentSort
        });

        await fetchAndDisplayProducts(currentCategory, currentMinPrice, currentMaxPrice, currentSort);
    }

    // Event listeners for filter changes
    if (categorySelect) {
        categorySelect.addEventListener('change', applyFiltersAndSort);
    }
    if (minPriceInput) {
        minPriceInput.addEventListener('input', applyFiltersAndSort);
    }
    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', applyFiltersAndSort);
    }

    // Event listener for Apply Filters button (if you prefer a manual trigger)
    // If you want filters to apply automatically on input/change, you can remove this
    if (applyFiltersBtn) {
         applyFiltersBtn.addEventListener('click', applyFiltersAndSort);
    }


    // Event listeners for sort changes
    if (sortSelectDesktop) {
        sortSelectDesktop.addEventListener('change', function() {
            currentSort = this.value;
            // Sync mobile sort select if it exists
            if (sortSelectMobile) sortSelectMobile.value = currentSort;
            // Update mobile sort buttons active state
            mobileSortButtons.forEach(button => {
                 if (button.textContent.toLowerCase().includes(currentSort.replace('price-','').replace('newest','newest first').replace('popularity','popularity').toLowerCase())) {
                     button.classList.add('active');
                 } else {
                     button.classList.remove('active');
                 }
            });
            applyFiltersAndSort();
        });
    }
    if (sortSelectMobile) {
        sortSelectMobile.addEventListener('change', function() {
            currentSort = this.value;
            // Sync desktop sort select if it exists
            if (sortSelectDesktop) sortSelectDesktop.value = currentSort;
             // Update mobile sort buttons active state
            mobileSortButtons.forEach(button => {
                 if (button.textContent.toLowerCase().includes(currentSort.replace('price-','').replace('newest','newest first').replace('popularity','popularity').toLowerCase())) {
                     button.classList.add('active');
                 } else {
                     button.classList.remove('active');
                 }
            });
            applyFiltersAndSort();
        });
    }

    // Event listeners for mobile sort buttons
    mobileSortButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Determine sort value from button text
            let sortValue = 'popularity'; // Default
            const buttonText = this.textContent.toLowerCase();
            if (buttonText.includes('price: low')) sortValue = 'price-low';
            else if (buttonText.includes('price: high')) sortValue = 'price-high';
            else if (buttonText.includes('newest first')) sortValue = 'newest';
            else if (buttonText.includes('popularity')) sortValue = 'popularity';

            currentSort = sortValue;

            // Update active state for mobile buttons
            mobileSortButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

             // Sync desktop and mobile select values
            if (sortSelectDesktop) sortSelectDesktop.value = currentSort;
            if (sortSelectMobile) sortSelectMobile.value = currentSort;

            applyFiltersAndSort();
        });
    });

    // Reset filters
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', async function() {
            console.log('Resetting filters...');
            // Reset all filter inputs
            if (categorySelect) categorySelect.value = '';
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';

            // Reset sort
            // We need to select the correct sort select element(s) based on your HTML
            // Assuming you have select elements for sort with IDs like 'sortSelectDesktop' and 'sortSelectMobile'
             if (sortSelectDesktop) sortSelectDesktop.value = 'popularity';
             if (sortSelectMobile) sortSelectMobile.value = 'popularity';

            // Reset mobile sort buttons active state
            mobileSortButtons.forEach(button => {
                if (button.textContent.toLowerCase().includes('popularity')) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });

            console.log('Filters reset. Fetching all products...');
            // Fetch all products (resetting all parameters)
            await fetchAndDisplayProducts();
        });
    }
}
