/**
 * Global Cart Handler for Aziz Phone Hub
 * Handles Add to Cart functionality across the website
 */

// Debug flag
const DEBUG = true;

function log(...args) {
    if (DEBUG) {
        console.log('[Cart Handler]', ...args);
    }
}

// Wait for DOM and Firebase to be ready
function initializeCartHandler() {
    log('Initializing cart handler...');
    
    // Check if Firebase is already initialized
    if (window.firebaseInitialized) {
        log('Firebase already initialized');
        initCartHandlers();
    } else {
        log('Waiting for Firebase to initialize...');
        // Listen for Firebase initialization
        document.addEventListener('firebaseInitialized', function onFirebaseReady() {
            log('Firebase initialized, setting up cart handlers');
            document.removeEventListener('firebaseInitialized', onFirebaseReady);
            initCartHandlers();
        });
    }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCartHandler);
} else {
    initializeCartHandler();
}

// Initialize cart handlers
function initCartHandlers() {
    log('Setting up cart click handlers');
    
    // Delegated event listener for Add to Cart buttons
    document.body.addEventListener('click', async function(e) {
        try {
            const addToCartBtn = e.target.closest('.add-to-cart, .add-to-cart-btn');
            
            if (!addToCartBtn) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            log('Add to Cart button clicked');
            
            // Get product ID from data attribute or parent element
            let productId = addToCartBtn.dataset.productId || 
                          addToCartBtn.closest('[data-product-id]')?.dataset.productId;
            
            log('Product ID:', productId);
            
            if (!productId) {
                const errorMsg = 'No product ID found for Add to Cart button';
                log(errorMsg);
                showError('Error', 'Could not add to cart. Product ID not found.');
                return;
            }
            
            // Get product details from the global products object
            const product = window.products && (window.products[productId] || 
                Object.values(window.products).find(p => p.id === productId));
                
            log('Product:', product);
            
            if (!product) {
                const errorMsg = `Product not found: ${productId}`;
                log(errorMsg);
                showError('Error', 'Product not found. Please try again.');
                return;
            }
            
            // Check if user is logged in
            if (!firebase.auth().currentUser) {
                log('User not logged in, redirecting to login');
                showLoginPrompt();
                return;
            }
            
            // Call the global addToCartFirestore function
            if (typeof window.addToCartFirestore === 'function') {
                log('Calling addToCartFirestore with product:', product.name);
                
                // Show loading state
                const btnText = addToCartBtn.innerHTML;
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
                
                try {
                    await window.addToCartFirestore(product, 1);
                    log('Product added to cart successfully');
                    
                    // Show success message
                    Swal.fire({
                        title: 'Added to Cart!',
                        text: `${product.name} has been added to your cart.`,
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'View Cart',
                        cancelButtonText: 'Continue Shopping',
                        timer: 2000,
                        timerProgressBar: true
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = 'cart.html';
                        }
                    });
                } catch (error) {
                    log('Error adding to cart:', error);
                    showError('Error', 'Failed to add item to cart. Please try again.');
                } finally {
                    // Reset button state
                    addToCartBtn.disabled = false;
                    addToCartBtn.innerHTML = btnText;
                }
            } else {
                const errorMsg = 'addToCartFirestore function not found';
                log(errorMsg);
                showError('Error', 'Shopping cart is not available. Please try again later.');
            }
        } catch (error) {
            log('Unexpected error in cart handler:', error);
            showError('Error', 'An unexpected error occurred. Please try again.');
        }
    });
    
    log('Cart click handlers set up successfully');
}

// Update cart count badge
function updateCartCountBadge(count) {
    const cartBadges = document.querySelectorAll('.cart-count-badge, #mobile-nav-cart-count');
    cartBadges.forEach(badge => {
        badge.textContent = count > 0 ? count : '';
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

// Listen for cart updates from other components
window.addEventListener('cartUpdated', function(e) {
    if (e.detail && typeof e.detail.count !== 'undefined') {
        updateCartCountBadge(e.detail.count);
    }
});

// Error handling functions
function showError(title, message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: title,
            text: message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

function showLoginPrompt() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Login Required',
            text: 'Please log in to add items to your cart.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Login',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'auth.html';
            }
        });
    } else {
        if (confirm('Please log in to add items to your cart. Would you like to go to the login page?')) {
            window.location.href = 'auth.html';
        }
    }
}