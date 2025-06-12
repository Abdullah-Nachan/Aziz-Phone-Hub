// Main script file for general functionalities
console.log('Script script.js loaded');

/**
 * Creates an HTML string for a single product card.
 * @param {object} product - The product object from static data.
 * @returns {string} The HTML string for the product card.
 */
function createProductCard(product) {
    // Ensure product.price is treated as a number for formatting if it's a string with '₹'
    // Remove any existing currency symbols and commas before parsing as float
    const price = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^0-9.]/g, '')) : product.price;
    // Format the price with one rupee symbol
    const formattedPrice = typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : product.price;

    return `
        <div class="col-6 col-md-4 col-lg-3 mb-4">
            <div class="product-card">
                <div class="product-actions">
                    <button class="product-action-btn like-btn" data-product-id="${product.id}" title="Add to Wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="product-image">
                    <a href="product.html?id=${product.id}">
                        <img src="${product.image || 'https://res.cloudinary.com/dcnawxif9/image/upload/v1748688934/logo_qn8fgh.jpg'}" alt="${product.name}" class="img-fluid">
                    </a>
                </div>
                <div class="product-info">
                    <h3 class="product-title">
                        <a href="product.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <p class="price">${formattedPrice}</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary add-to-cart w-100" data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Displays a list of products in a specified container.
 * Used for general product grids (e.g., shop page, category page).
 * @param {Array} products - Array of product objects to display.
 * @param {string} containerId - The ID of the HTML element to display products in.
 */
function displayProductsGrid(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Products container with ID '${containerId}' not found.`);
        return;
    }

    container.innerHTML = ''; // Clear existing content

    if (!products.length) {
        container.innerHTML = '<div class="col-12 text-center"><p>No products found.</p></div>';
        return;
    }

    products.forEach(product => {
        container.innerHTML += createProductCard(product);
    });

    initializeProductButtonListeners(); // Reinitialize listeners after adding products
    updateWishlistButtonStates(); // Update wishlist icons
}

/**
 * Loads and displays a limited number of featured products on the homepage.
 */
function loadFeaturedProducts() {
    console.log('Loading featured products for homepage...');
    const featuredContainer = document.getElementById('featuredProductsContainer');
    
    if (!featuredContainer) {
        console.log('Featured products container not found on this page. Skipping featured product display.');
        return;
    }

    // Ensure static products data is available
    if (!window.products || Object.keys(window.products).length === 0) {
        console.error('Static product data (window.products) not found or is empty.');
        featuredContainer.innerHTML = '<div class="col-12 text-center"><p>Error loading products or no products available.</p></div>';
        return;
    }

    // Get all products and select a limited number (e.g., 8) for featured
    const allProducts = Object.values(window.products);
    const numberOfFeatured = Math.min(8, allProducts.length); // Display at most 8 featured products
    const featuredProducts = allProducts.slice(0, numberOfFeatured); // Simple slice, could be randomized if desired

    displayProductsGrid(featuredProducts, 'featuredProductsContainer');
    console.log(`Displayed ${featuredProducts.length} featured products.`);
}

// On DOMContentLoaded, initialize page-specific scripts
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired.');

    // Initialize homepage features if on the homepage
    if (document.getElementById('featuredProductsContainer')) {
        console.log('Homepage detected. Loading featured products.');
        loadFeaturedProducts();
        // Initialize hero swiper if on homepage (assuming heroSwiper is on index.html)
        if (document.querySelector('.heroSwiper')) {
             console.log('Hero Swiper element found. Initializing Swiper.');
             if (typeof initializeHeroSwiper === 'function') {
                 initializeHeroSwiper();
             } else {
                 console.warn('initializeHeroSwiper function not found. Using basic Swiper init.');
                 // Basic Swiper init if function is missing
                  new Swiper('.heroSwiper', {
                     loop: true,
                     autoplay: { delay: 3000, disableOnInteraction: false },
                     pagination: { el: '.swiper-pagination', clickable: true },
                     navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                  });
             }
         }
    }

    // Initialize shop page features if on the shop page
    // Note: Assumes your shop page body has a class like 'shop-page' or similar identifier
    if (document.getElementById('products-grid') && document.body.classList.contains('shop-page')) {
         console.log('Shop page detected. Initializing shop page logic.');
        //  initializeShopPage(); // You would uncomment and implement this function
         // For now, we can call displayProductsGrid directly if that's the shop page's main function
         // displayProductsGrid(Object.values(window.products || {}), 'products-grid'); // Example
    }

     // Initialize category page features if on the category page
     // Note: Assumes your category page body has a class like 'category-page' or similar identifier
     if (document.getElementById('products-grid') && document.body.classList.contains('category-page')) {
          console.log('Category page detected. Initializing category page logic.');
         //  initializeCategoryPage(); // You would uncomment and implement this function
          // For now, the logic in js/category-script.js should handle this if included correctly
     }

     // Initialize product detail page features if on the product detail page
     // Note: Assumes your product detail page body has a class like 'product-page' or similar identifier
     if (document.getElementById('product-details') && document.body.classList.contains('product-page')) {
          console.log('Product detail page detected. Initializing product detail page logic.');
         //  initializeProductPage(); // You would uncomment and implement this function
          // For now, the logic in js/product-detail.js should handle this if included correctly
     }

    // Initialize global features that should run on all pages
    initializeProductButtonListeners(); // Initialize listeners globally for add to cart/wishlist
    updateWishlistButtonStates(); // Update wishlist states globally

    // Initialize lightbox (keep as it's a general utility and seems correctly implemented)
    try {
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true
        });
    } catch (e) {
        console.warn('Lightbox script not loaded or initialized.');
    }

    // Remove any Swiper initializations here that are NOT for the heroSwiper
    // Based on the console, there might be other Swiper calls causing issues.
    // Review the rest of script.js for other `new Swiper(...)` calls and remove if unrelated to the hero.
});

/**
 * Initialize event listeners for product buttons
 */
function initializeProductButtonListeners() {
    console.log('Initializing product button listeners');
    
    // Remove existing event listeners before adding new ones via delegation
    // This prevents multiple listeners from being attached if this function is called multiple times
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
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons) {
    addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            if (productId) {
                    const product = getProductById(productId);
                    if (product) {
                        addToCart(product); // Use the global addToCart function if needed, but delegation is preferred.
                    }
                } else {
                    console.warn('Add to cart button missing product ID.');
                }
            });
        });
    }

    // Like/wishlist buttons
    const likeButtons = document.querySelectorAll('.like-btn');
    if (likeButtons) {
        likeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                if (productId) {
                    toggleWishlist(this, productId); // Use the global toggleWishlist function if needed, but delegation is preferred.
                } else {
                    console.warn('Like button missing product ID.');
                }
            });
        });
    }
    */
}

/**
 * Update wishlist button states based on current wishlist
 */
function updateWishlistButtonStates() {
    // This function can remain, but ensure it works with the delegated listeners
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const wishlistButtons = document.querySelectorAll('.like-btn');
        wishlistButtons.forEach(button => {
        const productId = button.dataset.productId;
        if (productId && wishlist.includes(productId)) {
                button.classList.add('active');
            } else {
                 button.classList.remove('active');
            }
        });
}

// Initialize lightbox
try {
    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true
    });
} catch (e) {
    // Lightbox not loaded, ignore
}

function fetchAndDisplayProducts() {
    try {
        console.log('Fetching products from static data');
        const container = document.getElementById('home-products-container') || document.getElementById('products-container');
        
        // Check if the container exists before proceeding
        if (!container) {
            console.log('Products container not found on this page. Skipping product display.');
            // Optionally, handle this case by displaying a message or doing nothing
            return;
        }
        
        container.innerHTML = '';
        
        // Get products from static data
        let productsArr = window.products ? Object.values(window.products) : [];
        if (!productsArr.length) {
            container.innerHTML = '<div class="col-12 text-center"><p>No products found.</p></div>';
            return;
        }
        
        // Display random products
        const featuredProducts = getRandomProducts(productsArr, Math.min(8, productsArr.length));
        featuredProducts.forEach(product => {
            container.innerHTML += createProductCard(product);
        });
        
        initializeProductButtonListeners();
        updateWishlistButtonStates();
    } catch (error) {
        console.error('Error fetching and displaying products:', error);
        const container = document.getElementById('home-products-container') || document.getElementById('products-container');
                if (container) {
            container.innerHTML = '<div class="col-12 text-center"><p>Error loading products. Please try again later.</p></div>';
        }
    }
}

/**
 * Show error message to the user
 */
function showError(message) {
    console.error(message);
    if (window.Swal) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    } else {
        alert(message);
    }
}

// Toggle cart
document.querySelector('.cart-icon')?.addEventListener('click', function() {
    document.querySelector('.cart')?.classList.toggle('active');
});

// Close cart when clicking outside
document.addEventListener('click', function(e) {
    const cart = document.querySelector('.cart');
    const cartIcon = document.querySelector('.cart-icon');
    
    if (cart && cartIcon && !cart.contains(e.target) && !cartIcon.contains(e.target)) {
        cart.classList.remove('active');
    }
});

// Mobile menu toggle
document.querySelector('.navbar-toggler')?.addEventListener('click', function() {
    document.querySelector('.navbar-collapse')?.classList.toggle('show');
});

// Search functionality
document.querySelector('.search-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const searchTerm = this.querySelector('input').value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
});

// Newsletter Form Submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        Swal.fire({
            title: 'Thank You!',
            text: 'You have successfully subscribed to our newsletter.',
            icon: 'success',
            confirmButtonText: 'Great!',
            confirmButtonColor: '#2563eb'
        });
        
        this.reset();
    });
}

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});

// Category Card Hover Effect
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Product Image Zoom Effect
document.querySelectorAll('.product-image').forEach(image => {
    image.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    image.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Review Form Functionality

document.addEventListener('DOMContentLoaded', function () {
    // Star rating selection
    const stars = document.querySelectorAll('#reviewRating .fa-star');
    const ratingInput = document.getElementById('reviewerRating');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseenter', function () {
            const val = parseInt(this.getAttribute('data-value'));
            highlightStars(val);
        });
        star.addEventListener('mouseleave', function () {
            highlightStars(currentRating);
        });
        star.addEventListener('click', function () {
            currentRating = parseInt(this.getAttribute('data-value'));
            ratingInput.value = currentRating;
            highlightStars(currentRating);
        });
    });
    function highlightStars(rating) {
        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'));
            if (val <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    // Media preview
    const mediaInput = document.getElementById('reviewMedia');
    const mediaPreview = document.getElementById('mediaPreview');
    if (mediaInput) {
        mediaInput.addEventListener('change', function () {
            mediaPreview.innerHTML = '';
            Array.from(mediaInput.files).forEach(file => {
                const url = URL.createObjectURL(file);
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = url;
                    mediaPreview.appendChild(img);
                } else if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = url;
                    video.controls = true;
                    mediaPreview.appendChild(video);
                }
            });
        });
    }

    // Review submit
    const reviewForm = document.getElementById('customerReviewForm');
    const reviewsList = document.getElementById('reviewsList');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('reviewerName').value.trim();
            const rating = parseInt(document.getElementById('reviewerRating').value);
            const text = document.getElementById('reviewText').value.trim();
            const files = mediaInput.files;
            if (!name || !rating || !text) {
                alert('Please fill all fields and select a rating.');
                return;
            }
            // Create review item
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item bg-white p-4 rounded shadow-sm mb-4';
            reviewItem.innerHTML = `
                <div class="review-header d-flex justify-content-between align-items-center mb-3">
                    <div class="reviewer-info">
                        <h5 class="mb-1">${name}</h5>
                        <div class="rating-stars text-warning">
                            ${'<i class="fas fa-star"></i>'.repeat(rating)}${rating < 5 ? '<i class="far fa-star"></i>'.repeat(5-rating) : ''}
                        </div>
                    </div>
                    <div class="review-date text-muted">Just now</div>
                </div>
                <div class="review-content">
                    <p>${text}</p>
                </div>
            `;
            // Media
            if (files.length > 0) {
                const mediaDiv = document.createElement('div');
                mediaDiv.className = 'review-images mt-3';
                Array.from(files).forEach(file => {
                    const url = URL.createObjectURL(file);
                    if (file.type.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = url;
                        img.className = 'review-image me-2';
                        img.style.width = '80px';
                        img.style.height = '80px';
                        img.style.objectFit = 'cover';
                        mediaDiv.appendChild(img);
                    } else if (file.type.startsWith('video/')) {
                        const video = document.createElement('video');
                        video.src = url;
                        video.controls = true;
                        video.className = 'review-image me-2';
                        video.style.width = '80px';
                        video.style.height = '80px';
                        video.style.objectFit = 'cover';
                        mediaDiv.appendChild(video);
                    }
                });
                reviewItem.appendChild(mediaDiv);
            }
            // Add to top of reviews
            reviewsList.prepend(reviewItem);
            // Reset form
            reviewForm.reset();
            highlightStars(0);
            mediaPreview.innerHTML = '';
        });
    }
}); 

document.addEventListener('DOMContentLoaded', function () {
    // Swiper debug
    console.log("Swiper check");

    if (window.Swiper && document.querySelector('.mainSwiper') && document.querySelector('.thumbSwiper')) {
        console.log('Initializing Swiper on product page...');
        var thumbSwiper = new Swiper('.thumbSwiper', {
            spaceBetween: 10,
            slidesPerView: 3,
            freeMode: true,
            watchSlidesProgress: true,
        });
        var mainSwiper = new Swiper('.mainSwiper', {
            spaceBetween: 10,
            navigation: {
                nextEl: '.mainSwiper .swiper-button-next',
                prevEl: '.mainSwiper .swiper-button-prev',
            },
            thumbs: {
                swiper: thumbSwiper,
            },
        });
    } else {
        console.log('Swiper or required elements not found!');
    }
});

// Function to toggle wishlist
function toggleWishlist(button, productId) {
    const isLiked = button.classList.contains('active');
    
    if (isLiked) {
        // Remove from wishlist
        button.classList.remove('active');
        Swal.fire({
            title: 'Removed from Wishlist',
            text: 'Product has been removed from your wishlist',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    } else {
        // Add to wishlist
        button.classList.add('active');
        Swal.fire({
            title: 'Added to Wishlist',
            text: 'Product has been added to your wishlist',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// Function to share product
function shareProduct(productId) {
    const productUrl = window.location.origin + window.location.pathname + '?product=' + productId;
    
    Swal.fire({
        title: 'Share Product',
        text: 'Copy this link to share the product:',
        input: 'text',
        inputValue: productUrl,
        showCancelButton: true,
        confirmButtonText: 'Copy Link',
        cancelButtonText: 'Close'
    }).then((result) => {
        if (result.isConfirmed) {
            navigator.clipboard.writeText(result.value);
            Swal.fire('Copied!', 'Link copied to clipboard', 'success');
        }
    });
}

// Function to check if product is in wishlist
function checkWishlistStatus() {
    const wishlistItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
    document.querySelectorAll('.like-btn').forEach(button => {
        const productId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (wishlistItems.includes(productId)) {
            button.classList.add('active');
        }
    });
}

// Initialize wishlist status check
document.addEventListener('DOMContentLoaded', function() {
    checkWishlistStatus();
});