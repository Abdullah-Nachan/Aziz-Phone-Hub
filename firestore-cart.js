/**
 * Firestore Cart functionality for Aziz Phone Hub
 * Handles fetching and displaying cart items from user's Firestore collection
 */

// Cart Operations Handler
console.log('Script firestore-cart.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is initialized
    const checkFirebase = setInterval(() => {
        if (window.firebaseInitialized) {
            clearInterval(checkFirebase);
            console.log("Firebase ready for cart operations");
            loadCartItems();
        }
    }, 500);
});

// Get the appropriate user reference based on authentication status
function getUserRef() {
    const user = firebase.auth().currentUser;
    if (user) {
        return firebase.firestore().collection('users').doc(user.uid);
    } else {
        return firebase.firestore().collection('users').doc('guest');
    }
}

// Load cart items from Firestore
async function loadCartItems() {
    const userRef = getUserRef();
    const emptyCartDiv = document.getElementById('empty-cart');
    const cartContentDiv = document.getElementById('cart-content');
    const cartItemsDiv = document.getElementById('cart-items');
    
    try {
        const userDoc = await userRef.get();
        
        if (!userDoc.exists || !userDoc.data().cart || userDoc.data().cart.length === 0) {
            // Show empty cart message
            if (emptyCartDiv) emptyCartDiv.classList.remove('d-none');
            if (cartContentDiv) cartContentDiv.classList.add('d-none');
            return;
        }
        
        const cart = userDoc.data().cart;
        
        // Show cart content
        if (emptyCartDiv) emptyCartDiv.classList.add('d-none');
        if (cartContentDiv) cartContentDiv.classList.remove('d-none');
        
        // Clear existing items
        if (cartItemsDiv) cartItemsDiv.innerHTML = '';
        
        // Calculate totals and update price breakdown
        let subtotal = 0;
        const priceBreakdown = document.getElementById('cart-item-prices');
        priceBreakdown.innerHTML = ''; // Clear existing breakdown
        
        // Add each item to the cart and price breakdown
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            // Add to price breakdown
            const itemRow = document.createElement('div');
            itemRow.className = 'd-flex justify-content-between mb-1';
            itemRow.innerHTML = `
                <span>${item.name} (${item.quantity} × ₹${item.price})</span>
                <span>₹${itemTotal}</span>
            `;
            priceBreakdown.appendChild(itemRow);
            
            if (cartItemsDiv) {
                cartItemsDiv.innerHTML += `
                    <div class="cart-item mb-3" data-product-id="${item.id}">
                        <div class="card">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-3 col-md-2">
                                        <img src="${item.image}" class="img-fluid rounded" alt="${item.name}">
                                    </div>
                                    <div class="col-9 col-md-4">
                                        <h5 class="card-title mb-1">${item.name}</h5>
                                        <p class="text-muted mb-0">₹${item.price}</p>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div class="input-group">
                                            <button class="btn btn-outline-secondary" type="button" onclick="updateCartItemQuantity('${item.id}', -1)">-</button>
                                            <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                                            <button class="btn btn-outline-secondary" type="button" onclick="updateCartItemQuantity('${item.id}', 1)">+</button>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-2 text-end">
                                        <p class="mb-0">₹${itemTotal}</p>
                                        <button class="btn btn-link text-danger p-0 remove-from-cart" data-product-id="${item.id}">
                                            <i class="fas fa-trash"></i> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        // Update price summary
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        
        const subtotalElement = document.getElementById('cart-subtotal');
        const taxElement = document.getElementById('cart-tax');
        const totalElement = document.getElementById('cart-total');
        
        if (subtotalElement) subtotalElement.textContent = `₹${subtotal}`;
        if (taxElement) taxElement.textContent = `₹${tax}`;
        if (totalElement) totalElement.textContent = `₹${total}`;
        
        // Add event listeners to the new remove buttons
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                removeFromCart(productId);
            });
        });
        
    } catch (error) {
        console.error('Error loading cart:', error);
        // Only show the error modal if NOT on the homepage
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/index.html')) {
            Swal.fire({
                title: 'Error',
                text: 'There was a problem loading your cart.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } else {
            // On homepage, just log the error silently
            console.warn('Cart loading error suppressed on homepage:', error);
        }
    }
}

// Update cart item quantity
async function updateCartItemQuantity(productId, change) {
    const userRef = getUserRef();
    
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;
        
        const cart = userDoc.data().cart || [];
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex >= 0) {
            const newQuantity = cart[itemIndex].quantity + change;
            
            if (newQuantity <= 0) {
                // Remove item if quantity becomes 0 or negative
                cart.splice(itemIndex, 1);
            } else {
                // Update quantity
                cart[itemIndex].quantity = newQuantity;
            }
            
            // Update cart in Firestore
            await userRef.update({ cart: cart });
            
            // Reload cart items
            loadCartItems();
            
            // Update cart count badge
            updateCartCountBadge(cart.length);
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        Swal.fire({
            title: 'Error',
            text: 'There was a problem updating your cart.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Remove item from cart
async function removeFromCart(productId) {
    const userRef = getUserRef();
    
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;
        
        const cart = userDoc.data().cart || [];
        console.log("Cart before removal:", cart);

        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex >= 0) {
            cart.splice(itemIndex, 1);
            console.log("Cart after removal:", cart);

            // Update Firestore
            await userRef.update({ cart: cart });

            // Also clear from localStorage to prevent restore on refresh
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('cart');
                console.log('Removed cart from localStorage');
            }

            const updatedDoc = await userRef.get();
            if (updatedDoc.exists) {
                updateCartCountBadge(cart.length);
                loadCartItems();
            }

            Swal.fire({
                title: 'Removed from Cart',
                text: 'Item has been removed from your cart.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        Swal.fire({
            title: 'Error',
            text: 'There was a problem removing the item from your cart.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Add event listener for the checkout button
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});

// Listen for auth state changes
firebase.auth().onAuthStateChanged(function(user) {
    // Reload cart items when auth state changes
    loadCartItems();
});

// Show empty cart message
function showEmptyCart() {
    const emptyCartMessage = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    
    if (emptyCartMessage && cartContent) {
        emptyCartMessage.classList.remove('d-none');
        cartContent.classList.add('d-none');
    }
}

// Show login required message
function showLoginRequiredMessage() {
    const emptyCartMessage = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    
    if (emptyCartMessage && cartContent) {
        emptyCartMessage.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-user-lock fa-4x mb-3 text-muted"></i>
                <h3>Sign In Required</h3>
                <p class="text-muted">Please sign in to view your cart</p>
                <a href="auth.html" class="btn btn-primary mt-3">Sign In</a>
            </div>
        `;
        emptyCartMessage.classList.remove('d-none');
        cartContent.classList.add('d-none');
    }
}

// Show error message
function showErrorMessage(message) {
    if (typeof Swal !== 'undefined') {
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

// Update cart count badge
function updateCartCountBadge(count) {
    const desktopBadge = document.getElementById('desktop-nav-cart-count');
    const mobileBadge = document.getElementById('mobile-nav-cart-count');
    const footerBadge = document.getElementById('mobile-cart-count');
    const mobileFooterBadge = document.getElementById('mobile-footer-cart-count');
    
    if (desktopBadge) desktopBadge.textContent = count;
    if (mobileBadge) mobileBadge.textContent = count;
    if (footerBadge) footerBadge.textContent = count;
    if (mobileFooterBadge) mobileFooterBadge.textContent = count;
}

// Handle checkout
async function handleCheckout() {
    try {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            showLoginRequiredMessage();
            return;
        }
        
        // Get cart items
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.error('User document not found');
            return;
        }
        
        const userData = userDoc.data();
        const cartItems = userData.cart || [];
        
        if (cartItems.length === 0) {
            showErrorMessage("Your cart is empty. Please add items to your cart before checking out.");
            return;
        }
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
        
    } catch (error) {
        console.error('Error handling checkout:', error);
        showErrorMessage("There was a problem processing your checkout. Please try again later.");
    }
}
