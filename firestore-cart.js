/**
 * Firestore Cart functionality for Aziz Phone Hub
 * Handles fetching and displaying cart items from user's Firestore collection
 */

// Cart Operations Handler
console.log('Script firestore-cart.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        loadCartItems();
    }
    // For guests, do nothing here. guest-cart-wishlist.js will handle rendering.
});

// Get the appropriate user reference based on authentication status
function getUserRef() {
    const user = firebase.auth().currentUser;
    if (user) {
        return firebase.firestore().collection('users').doc(user.uid);
    } else {
        throw new Error('User must be authenticated to access cart');
    }
}

// Load cart items from Firestore or localStorage depending on auth state
async function loadCartItems() {
    const user = firebase.auth().currentUser;
    // Get all necessary elements
    const cartItemsDiv = document.getElementById('cart-items');
    const priceBreakdown = document.getElementById('cart-item-prices');
    const subtotalElement = document.getElementById('cart-subtotal');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');
    const emptyCartDiv = document.getElementById('empty-cart');
    const cartContentDiv = document.getElementById('cart-content');

    // If not authenticated, render guest cart from localStorage
    if (!user) {
        // Hide sign-in required message if any
        if (emptyCartDiv) emptyCartDiv.classList.add('d-none');
        if (cartContentDiv) cartContentDiv.classList.remove('d-none');
        // Render guest cart
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            if (emptyCartDiv) emptyCartDiv.classList.remove('d-none');
            if (cartContentDiv) cartContentDiv.classList.add('d-none');
            return;
        }
        // Use your existing renderGuestCart function if available
        if (typeof renderGuestCart === 'function') {
            renderGuestCart(cart);
        } else if (cartItemsDiv) {
            // Fallback: simple render
            cartItemsDiv.innerHTML = cart.map(item => `<div>${item.name || item.id} x${item.quantity || 1}</div>`).join('');
        }
        // Update price summary
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += (item.price || 0) * (item.quantity || 1);
        });
        if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `₹0.00`;
        if (totalElement) totalElement.textContent = `₹${subtotal.toFixed(2)}`;
        return;
    }
    
    const userRef = getUserRef();
    try {
        const userDoc = await userRef.get();
        const cart = (userDoc.exists && userDoc.data().cart) || [];

        // Always update the cart count badge on all pages
        updateCartCountBadge(cart);

        // If we are not on the cart page, we don't need to do anything else.
        const isCartPage = cartItemsDiv && priceBreakdown && subtotalElement;
        if (!isCartPage) {
            return;
        }
        
        if (cart.length === 0) {
            // Show empty cart message
            if (emptyCartDiv) emptyCartDiv.classList.remove('d-none');
            if (cartContentDiv) cartContentDiv.classList.add('d-none');
            return;
        }
        
        // Show cart content
        if (emptyCartDiv) emptyCartDiv.classList.add('d-none');
        if (cartContentDiv) cartContentDiv.classList.remove('d-none');
        
        // Clear existing items
        cartItemsDiv.innerHTML = '';
        priceBreakdown.innerHTML = ''; // Clear existing breakdown
        
        // Calculate totals and update price breakdown
        let subtotal = 0;
        
        // Add each item to the cart and price breakdown
        cart.forEach(item => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 0;
            const itemTotal = itemPrice * itemQuantity;
            subtotal += itemTotal;
            
            // Add to price breakdown
            const itemRow = document.createElement('div');
            itemRow.className = 'd-flex justify-content-between mb-1';
            itemRow.innerHTML = `
                <span>${item.name} (${itemQuantity} × ₹${itemPrice})</span>
                <span>₹${itemTotal.toFixed(2)}</span>
            `;
            priceBreakdown.appendChild(itemRow);
            
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
                                    <p class="text-muted mb-0">₹${itemPrice}</p>
                                </div>
                                <div class="col-6 col-md-3">
                                    <div class="input-group">
                                        <button class="btn btn-outline-secondary" type="button" onclick="updateCartItemQuantity('${item.id}', -1)">-</button>
                                        <input type="text" class="form-control text-center" value="${itemQuantity}" readonly>
                                        <button class="btn btn-outline-secondary" type="button" onclick="updateCartItemQuantity('${item.id}', 1)">+</button>
                                    </div>
                                </div>
                                <div class="col-6 col-md-2 text-end">
                                    <p class="mb-0">₹${itemTotal.toFixed(2)}</p>
                                    <button class="btn btn-link text-danger p-0 remove-from-cart" data-product-id="${item.id}">
                                        <i class="fas fa-trash"></i> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Update price summary
        const tax = 0; // No tax
        const total = subtotal; // No extra charges
        if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `₹${tax.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
        
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
            updateCartCountBadge(cart);
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
                updateCartCountBadge(cart);
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
function updateCartCountBadge(cartItems) {
    const count = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    const badges = document.querySelectorAll('.cart-count-badge');
    
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

// Handle checkout
async function handleCheckout() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            // Guest user: proceed to checkout (guest flow)
            // Optionally, you can check if the guest cart is empty here
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                showErrorMessage("Your cart is empty. Please add items to your cart before checking out.");
                return;
            }
            // Redirect to checkout page for guests
            window.location.href = 'checkout.html';
            return;
        }
        // Authenticated user: proceed as before
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

// Global function to add items to cart using Firestore
window.addToCartFirestore = async function(product, quantity = 1) {
    console.log('addToCartFirestore called with product:', product);
    if (!product || !product.id) {
        console.error('Invalid product provided to addToCartFirestore');
        Swal.fire({ title: 'Error', text: 'Cannot add invalid product to cart.', icon: 'error' });
        return;
    }

    // Always store price as a number
    let priceNum = product.price;
    if (typeof priceNum === 'string') {
        priceNum = parseFloat(priceNum.replace(/[^0-9.]/g, ''));
    }
    if (isNaN(priceNum)) priceNum = 0;

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            Swal.fire({ 
                title: 'Sign In Required', 
                text: 'Please sign in to add items to your cart.', 
                icon: 'info', 
                confirmButtonText: 'Sign In' 
            }).then((result) => {
                if(result.isConfirmed) {
                    window.location.href = 'auth.html';
                }
            });
            return;
        }

        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
             await userRef.set({ cart: [] }, { merge: true });
        }

        const cartItems = (userDoc.exists && userDoc.data().cart) ? userDoc.data().cart : [];
        const existingCartItemIndex = cartItems.findIndex(item => item.id === product.id);

        if (existingCartItemIndex > -1) {
            cartItems[existingCartItemIndex].quantity += quantity;
        } else {
            cartItems.push({
                id: product.id,
                image: product.image,
                name: product.name,
                price: priceNum,
                quantity: quantity
            });
        }

        await userRef.update({ cart: cartItems });
        updateCartCountBadge(cartItems);
        Swal.fire({ title: 'Added to Cart!', text: `${product.name} has been added to your cart.`, icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (error) {
        console.error('Error adding to cart:', error);
        Swal.fire({ title: 'Error', text: 'There was a problem adding the item to your cart.', icon: 'error' });
    }
};
