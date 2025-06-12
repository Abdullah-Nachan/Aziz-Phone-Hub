// This file handles cart functionality
console.log('Script cart.js loaded');

/**
 * Cart functionality for Aziz Phone Hub
 * Handles adding, removing, and displaying cart items
 */

// Global cart instance
// Remove let cartInstance;

// Cart class
class Cart {
    constructor() {
        console.log('Creating cart instance');
        this.items = this.loadCart();
        this.updateCartCount();
        this.setupEventListeners();
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateCartCount();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Add item to cart
    addItem(product, quantity = 1) {
        try {
            // Ensure product is an object with necessary properties
            let productObj = typeof product === 'string' ? { id: product } : { ...product };
            const productId = productObj.id;

            // Ensure price is a number
            if (productObj.price) {
                productObj.price = parseFloat(String(productObj.price).replace(/[^0-9.]/g, '')) || 0;
                            } else {
                productObj.price = 0; // Default to 0 if no price is found
            }
        
        // Check if item already exists in cart
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            // Update quantity
            existingItem.quantity = parseInt(existingItem.quantity) + parseInt(quantity);
        } else {
            // Add new item
            this.items.push({
                id: productId,
                quantity: parseInt(quantity),
                    name: productObj.name || 'Unknown Product',
                    image: productObj.image || 'https://placehold.co/300x300?text=No+Image',
                price: productObj.price
            });
        }
        
        this.saveCart();
            // Re-render cart items if on the cart page to reflect changes immediately
            if (document.getElementById('cart-items')) {
                 updateCartUI();
            }
        return true;
        } catch (error) {
            console.error('Error adding item to cart:', error);
            return false;
        }
    }

    // Remove item from cart
    removeItem(productId) {
        try {
            const index = this.items.findIndex(item => item.id === productId);
            if (index > -1) {
                this.items.splice(index, 1);
                this.saveCart();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing item from cart:', error);
            return false;
        }
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        try {
            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity = parseInt(quantity);
                if (item.quantity <= 0) {
                    return this.removeItem(productId);
                }
                this.saveCart();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return false;
        }
    }
    
    // Check if item is in cart
    hasItem(productId) {
        return this.items.some(item => item.id === productId);
    }
    
    // Get item quantity
    getItemQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }
    
    // Get total quantity of items in cart
    getTotalQuantity() {
        return this.items.reduce((total, item) => total + parseInt(item.quantity || 0), 0);
    }
    
    // Get total price of all items in cart
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Update cart count in UI
    updateCartCount() {
            const count = this.getTotalQuantity();
        const countElements = document.querySelectorAll('.cart-count-badge');
        countElements.forEach(element => {
            element.textContent = count;
        });
    }
    
    // Setup event listeners
    setupEventListeners() {
        try {
            // Listen for add to cart button clicks and buy now button clicks using event delegation
            document.addEventListener('click', (e) => {
                const addToCartBtn = e.target.closest('.add-to-cart');
                const buyNowBtn = e.target.closest('.buy-now');
                const removeBtn = e.target.closest('.remove-from-cart');
                const increaseBtn = e.target.closest('.increase-quantity');
                const decreaseBtn = e.target.closest('.decrease-quantity');
                const quantityInput = e.target.closest('.quantity-input');

                if (addToCartBtn) {
                    e.preventDefault();
                    const productId = addToCartBtn.dataset.productId;
                    if (productId) {
                        // Find the full product details using the product ID from the global products data
                        const productToAdd = window.products ? window.products[productId] : null;

                        if (productToAdd) {
                            // Add the full product object to the cart
                            if (this.addItem(productToAdd)) {
                    // Show success message
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: 'Added to Cart',
                            text: 'Product has been added to your cart.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                }
                        } else {
                            console.error('Product details not found for ID:', productId);
                            // Optionally show an error message to the user
                             if (typeof Swal !== 'undefined') {
                                Swal.fire({
                                    title: 'Error',
                                    text: 'Could not add product to cart. Details not found.',
                                    icon: 'error',
                                    timer: 2000,
                                    showConfirmButton: false
                                });
                            }
                        }
                    } else {
                        console.warn('Add to cart button missing product ID.');
                    }
                } else if (buyNowBtn) {
                    e.preventDefault();
                    const productId = buyNowBtn.dataset.productId;
                    if (productId) {
                         // Find the full product details using the product ID
                        const productToBuy = window.products ? window.products[productId] : null;

                        if (productToBuy) {
                            this.clearCart();
                             if (this.addItem(productToBuy)) {
                                 window.location.href = 'checkout.html';
                            }
                         } else {
                            console.error('Product details not found for ID:', productId);
                            // Optionally show an error message to the user
                             if (typeof Swal !== 'undefined') {
                                Swal.fire({
                                    title: 'Error',
                                    text: 'Could not proceed to checkout. Product details not found.',
                                    icon: 'error',
                                    timer: 2000,
                                    showConfirmButton: false
                                });
                            }
                         }
                    } else {
                        console.warn('Buy now button missing product ID.');
                    }
                } else if (removeBtn) {
                    // Handle remove button click
                    const productId = removeBtn.dataset.productId;
                     if (productId) {
                        // Show confirmation dialog
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                title: 'Remove item?',
                                text: 'Are you sure you want to remove this item from your cart?',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#dc3545',
                                cancelButtonColor: '#6c757d',
                                confirmButtonText: 'Yes, remove it!'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    this.removeItem(productId);
                                    // Re-render cart items after removal
                                    updateCartUI();
                                    Swal.fire(
                                        'Removed!',
                                        'The item has been removed from your cart.',
                                        'success'
                                    );
                                }
                            });
                         } else {
                             this.removeItem(productId);
                             updateCartUI();
                         }
                    }
                } else if (increaseBtn) {
                    // Handle increase quantity button click
                    const productId = increaseBtn.dataset.productId;
                    if (productId) {
                         const item = this.items.find(item => item.id === productId);
                         if (item) {
                             this.updateQuantity(productId, item.quantity + 1);
                             updateCartUI(); // Update UI after quantity change
                         }
                    }
                } else if (decreaseBtn) {
                    // Handle decrease quantity button click
                     const productId = decreaseBtn.dataset.productId;
                    if (productId) {
                         const item = this.items.find(item => item.id === productId);
                         if (item) {
                             this.updateQuantity(productId, item.quantity - 1);
                             updateCartUI(); // Update UI after quantity change
                         }
                    }
                } else if (quantityInput && e.type === 'change') {
                     // Handle quantity input change
                    const productId = quantityInput.dataset.productId;
                    const newQuantity = parseInt(quantityInput.value) || 1;
                     if (productId) {
                         this.updateQuantity(productId, newQuantity);
                         updateCartUI(); // Update UI after quantity change
                     }
                }
            });

            // Event listener for DOM content loaded
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM fully loaded and parsed');

                // Remove initialization logic from here
                // window.cartInstance = window.cart = new Cart(); // No longer needed here
                console.log('DOMContentLoaded: Ensuring cart instance is available globally.');

                // Make commonly used functions globally available for backward compatibility
                // and easier access in inline scripts or other files that might expect them globally.
                // Use window.cart directly now
                if (window.cart) {
                    window.isInCart = (productId) => window.cart.hasItem(productId);
                    window.addToCart = (product, quantity) => window.cart.addItem(product, quantity);
                    window.removeFromCart = (productId) => window.cart.removeItem(productId);
                    window.updateCartQuantity = (productId, quantity) => window.cart.updateQuantity(productId, quantity);
                    window.getCartItems = () => window.cart.getCartItems();
                    window.getCartTotal = () => window.cart.calculateTotal();
                    window.clearCart = () => window.cart.clearCart();
                    window.checkout = () => window.cart.checkout();
                }

                // Initialize wishlist if on the cart or checkout page (or any page with wishlist UI)
                // Check if wishlist class is defined and initialize if not already
                if (typeof Wishlist !== 'undefined' && (typeof window.wishlist === 'undefined' || !window.wishlist)) {
                    window.wishlist = new Wishlist();
                    console.log('Wishlist instance created and assigned to window.wishlist.');
                } else if (window.wishlist) {
                     console.log('Wishlist instance already exists:', window.wishlist);
                } else {
                    console.warn('Wishlist class not defined or wishlist instance not created.');
                }


                // Initialize cart and wishlist UI on DOMContentLoaded
                // The cart instance is now created immediately, so just update UI
                 updateCartUI();
                 updateWishlistUI();
            });
        } catch (error) {
            console.error('Error setting up cart event listeners:', error);
        }
    }

    // Get all cart items with details
    getCartItems() {
                return this.items;
    }

    // Calculate cart total
    calculateTotal() {
        return this.items.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            return total + (price * parseInt(item.quantity || 0));
        }, 0);
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
    }
    
    // Proceed to checkout
    checkout() {
        try {
            // Save cart for checkout page
            localStorage.setItem('checkoutCart', JSON.stringify(this.items));
            
            // Redirect to checkout page
            window.location.href = 'checkout.html';
        } catch (error) {
            console.error('Error proceeding to checkout:', error);
            // Fallback to checkout page without cart data
            window.location.href = 'checkout.html';
        }
    }
}

// Instantiate the cart immediately after the class definition
window.cart = new Cart();
console.log('Cart instance created and assigned to window.cart immediately on script load, after class definition.');

// Update cart UI
function updateCartUI() {
    // Update cart count badges
    const cartCountElements = document.querySelectorAll('.cart-count-badge');
    const cartCount = cart.getTotalQuantity();
    
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
        element.style.display = cartCount > 0 ? 'block' : 'none';
    });
    
    // Check if we're on the cart page
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    
    if (cartItemsContainer && emptyCartMessage && cartContent) {
        // We're on the cart page
        if (cart.items.length === 0) {
            // Show empty cart message
            emptyCartMessage.classList.remove('d-none');
            cartContent.classList.add('d-none');
        } else {
            // Show cart content
            emptyCartMessage.classList.add('d-none');
            cartContent.classList.remove('d-none');
            
            // Render cart items
            renderCartItems();
            
            // Update cart summary
            updateCartSummary();
        }
    }
    
    // Check if we're on the checkout page
    const checkoutItemsContainer = document.getElementById('checkout-items');
    
    if (checkoutItemsContainer) {
        // We're on the checkout page
        renderCheckoutItems();
        updateCheckoutSummary();
    }
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cartItemsContainer) return;
    
    // Clear container
    cartItemsContainer.innerHTML = '';
    
    // Add each item to the container
    cart.items.forEach(item => {
        // Ensure price is treated as a number for calculation and display
        const numericPrice = parseFloat(item.price) || 0;
        const formattedPrice = formatCurrency(numericPrice);

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item mb-3';
        itemElement.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-3 col-md-2">
                            <img src="${item.image || 'https://placehold.co/100x100?text=No+Image'}" alt="${item.name}" class="img-fluid rounded">
                        </div>
                        <div class="col-9 col-md-4">
                            <h5 class="mb-1">${item.name || 'Unknown Product'}</h5>
                            <p class="text-muted mb-0">
                                <a href="product.html?id=${item.id}" class="text-decoration-none">View details</a>
                            </p>
                        </div>
                        <div class="col-6 col-md-2 mt-3 mt-md-0">
                            <div class="quantity-control d-flex align-items-center">
                                <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-product-id="${item.id}">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="form-control form-control-sm mx-2 quantity-input" 
                                    value="${item.quantity}" min="1" data-product-id="${item.id}">
                                <button class="btn btn-sm btn-outline-secondary increase-quantity" data-product-id="${item.id}">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-6 col-md-2 mt-3 mt-md-0 text-end">
                            <p class="price mb-0">${formattedPrice}</p>
                            <p class="item-total text-success mb-0">
                                ${formatCurrency(calculateItemTotal(item))}
                            </p>
                        </div>
                        <div class="col-12 col-md-2 mt-3 mt-md-0 text-end">
                            <div class="d-flex flex-column align-items-end">
                                <button class="btn btn-sm btn-outline-danger remove-from-cart mb-2" data-product-id="${item.id}">
                                    <i class="fas fa-trash me-1"></i> Remove
                                </button>
                                <button class="btn btn-sm btn-outline-primary move-to-wishlist" data-product-id="${item.id}">
                                    <i class="fas fa-heart me-1"></i> Save for later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(itemElement);
    });
    
    // Event listeners for dynamically added elements are handled by delegation in setupEventListeners
    // No need to call addCartItemEventListeners here anymore.
    // addCartItemEventListeners();
}

// Update cart summary
function updateCartSummary() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');
    
    if (!subtotalElement || !taxElement || !totalElement) return;
    
    const subtotal = cart.getTotal();
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    subtotalElement.textContent = formatCurrency(subtotal);
    taxElement.textContent = formatCurrency(tax);
    totalElement.textContent = formatCurrency(total);
}

// Render checkout items
function renderCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    
    if (!checkoutItemsContainer) return;
    
    // Clear container
    checkoutItemsContainer.innerHTML = '';
    
    // Add each item to the container
    cart.items.forEach(item => {
         // Ensure price is treated as a number for calculation and display
        const numericPrice = parseFloat(item.price) || 0;
        const formattedPrice = formatCurrency(numericPrice);

        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item d-flex align-items-center mb-3 pb-3 border-bottom';
        itemElement.innerHTML = `
            <div class="checkout-item-image me-3">
                <img src="${item.image || 'https://placehold.co/60x60?text=No+Image'}" alt="${item.name}" class="img-fluid rounded" style="width: 60px;">
            </div>
            <div class="checkout-item-details flex-grow-1">
                <div class="d-flex justify-content-between">
                    <h6 class="mb-0">${item.name || 'Unknown Product'}</h6>
                    <span class="text-muted">${formattedPrice}</span>
                </div>
                <p class="text-muted small mb-0">Quantity: ${item.quantity}</p>
            </div>
        `;
        
        checkoutItemsContainer.appendChild(itemElement);
    });
}

// Update checkout summary
function updateCheckoutSummary() {
    const subtotalElement = document.getElementById('checkout-subtotal');
    const taxElement = document.getElementById('checkout-tax');
    const totalElement = document.getElementById('checkout-total');
    
    if (!subtotalElement || !taxElement || !totalElement) return;
    
    const subtotal = cart.getTotal();
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    subtotalElement.textContent = formatCurrency(subtotal);
    taxElement.textContent = formatCurrency(tax);
    totalElement.textContent = formatCurrency(total);
}

// Update wishlist UI
function updateWishlistUI() {
    // Update wishlist count badges
    const wishlistCountElements = document.querySelectorAll('.wishlist-count-badge');
    // Check if wishlist is initialized
    const wishlistCount = typeof wishlist !== 'undefined' && typeof wishlist.getCount === 'function' ? wishlist.getCount() : 0;
    
    wishlistCountElements.forEach(element => {
        element.textContent = wishlistCount;
        element.style.display = wishlistCount > 0 ? 'block' : 'none';
    });
    
    // Check if we're on the wishlist page
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    const emptyWishlistMessage = document.getElementById('empty-wishlist');
    const wishlistContent = document.getElementById('wishlist-content');
    
    if (wishlistItemsContainer && emptyWishlistMessage && wishlistContent) {
        // We're on the wishlist page
        // Check if wishlist is initialized before accessing items
        if (typeof wishlist !== 'undefined' && wishlist.items.length === 0) {
            // Show empty wishlist message
            emptyWishlistMessage.classList.remove('d-none');
            wishlistContent.classList.add('d-none');
        } else if (typeof wishlist !== 'undefined') {
            // Show wishlist content
            emptyWishlistMessage.classList.add('d-none');
            wishlistContent.classList.remove('d-none');
            
            // Render wishlist items
            renderWishlistItems();
        }
    }
    
    // Update like buttons on product cards
     if (typeof wishlist !== 'undefined') {
    updateLikeButtons();
     }
}

// Render wishlist items
function renderWishlistItems() {
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    
    if (!wishlistItemsContainer) return;
    
    // Clear container
    wishlistItemsContainer.innerHTML = '';
    
    // Add each item to the container
    // Check if wishlist is initialized before accessing items
    if (typeof wishlist !== 'undefined') {
    wishlist.items.forEach(item => {
            // Ensure price is treated as a number for calculation and display
            const numericPrice = parseFloat(item.price) || 0;
            const formattedPrice = formatCurrency(numericPrice);

        const itemElement = document.createElement('div');
        itemElement.className = 'col-md-6 col-lg-4 mb-4';
        itemElement.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="wishlist-item-actions">
                    <button class="btn btn-sm btn-danger remove-from-wishlist" data-product-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                    <img src="${item.image || 'https://placehold.co/300x300?text=No+Image'}" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                        <h5 class="card-title">${item.name || 'Unknown Product'}</h5>
                        <p class="card-text price">${formattedPrice}</p>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary add-to-cart-from-wishlist" data-product-id="${item.id}">
                            <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                        </button>
                        <a href="product.html?id=${item.id}" class="btn btn-outline-secondary">View Details</a>
                    </div>
                </div>
            </div>
        `;
        
        wishlistItemsContainer.appendChild(itemElement);
    });
    }
    
    // Event listeners for dynamically added elements are handled by delegation in setupEventListeners
    // No need to call addWishlistItemEventListeners here anymore.
    // addWishlistItemEventListeners();
}

// Update like buttons on product cards
function updateLikeButtons() {
    document.querySelectorAll('.like-btn').forEach(button => {
        const productId = button.getAttribute('data-product-id');
        
        // Check if wishlist is initialized before accessing items
        if (typeof wishlist !== 'undefined' && wishlist.hasItem(productId)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Calculate item total
function calculateItemTotal(item) {
    // Assume item.price is already a number from addItem
    const price = parseFloat(item.price) || 0;
    const total = price * parseInt(item.quantity || 0);
    
    return total; // Return raw total, formatCurrency is called in render functions
}

// Format currency
function formatCurrency(amount) {
    // Ensure amount is a number before formatting
    const numericAmount = parseFloat(amount) || 0;
    return '₹' + numericAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Function to toggle wishlist item (used globally)
function toggleWishlist(button, productId) {
    // Toggle wishlist item
    const isAdded = wishlist.toggleItem(productId);
    
    // Update button state
    if (isAdded) {
        button.classList.add('active');
        
        // Show success message
        Swal.fire({
            title: 'Added to wishlist!',
            text: 'The item has been added to your wishlist.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        button.classList.remove('active');
        
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
