// Cart and Wishlist Authentication Handler
console.log('Script cart-wishlist-auth.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is initialized
    const checkFirebase = setInterval(() => {
        if (window.firebaseInitialized) {
            clearInterval(checkFirebase);
            console.log("Firebase ready for cart/wishlist operations");
            initCartWishlistHandlers();
            loadUserCartWishlistCounts();
        }
    }, 500);
});

// Initialize cart and wishlist handlers
function initCartWishlistHandlers() {
    // Add to cart button click handler
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            handleCartAction(productId);
        });
    });

    // Like/wishlist button click handler (event delegation)
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.like-btn');
        if (button) {
            e.preventDefault();
            const productId = button.dataset.productId || (button.getAttribute('onclick') && button.getAttribute('onclick').match(/'([^']+)'/)[1]);
            if (!productId) {
                console.error('No productId found on wishlist button!', button);
                return;
            }
            handleWishlistAction(productId, button);
        }
    });
}

// Get the appropriate user reference based on authentication status
function getUserRef() {
    const user = firebase.auth().currentUser;
    if (user) {
        return firebase.firestore().collection('users').doc(user.uid);
    } else {
        return firebase.firestore().collection('users').doc('guest');
    }
}

// Handle cart action
async function handleCartAction(productId) {
    try {
        // Get product details
        const productRef = firebase.firestore().collection('products').doc(productId);
        const productDoc = await productRef.get();
        
        if (!productDoc.exists) {
            console.error('Product not found:', productId);
            return;
        }
        
        const product = productDoc.data();
        const userRef = getUserRef();
        
        // Get current cart
        const userDoc = await userRef.get();
        let cart = [];
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            cart = userData.cart || [];
        }
        
        // Check if product is already in cart
        const existingItemIndex = cart.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
            // Product already in cart, increment quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new product to cart
            cart.push({
                productId: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        // Update cart in Firestore
        await userRef.set({ cart: cart }, { merge: true });
        
        // Show success message
        Swal.fire({
            title: 'Added to Cart!',
            text: `${product.name} has been added to your cart.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Update cart count badge
        updateCartCountBadge(cart);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        Swal.fire({
            title: 'Error',
            text: 'There was a problem adding this item to your cart.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Handle wishlist action
async function handleWishlistAction(productId, buttonElement) {
    try {
        // Get product details
        const product = typeof getProductById === 'function' ? getProductById(productId) : (window.products ? window.products[productId] : null);
        if (!product) {
            Swal.fire({ title: 'Error', text: 'Product not found!', icon: 'error', confirmButtonText: 'OK' });
            return;
        }
        // Get Firestore ref for current (or guest) user
        const userRef = getUserRef();
        const userDoc = await userRef.get();
        // Initialize wishlist array
        let wishlist = [];
        if (userDoc.exists && Array.isArray(userDoc.data().wishlist)) {
            wishlist = userDoc.data().wishlist;
        }
        // Toggle item
        const idx = wishlist.findIndex(item => item.productId === productId);
        if (idx >= 0) {
            wishlist.splice(idx, 1);
            if (buttonElement) buttonElement.classList.remove('active');
            Swal.fire({ title: 'Removed from Wishlist', text: `${product.name} has been removed.`, icon: 'info', timer: 2000, showConfirmButton: false });
        } else {
            wishlist.push({ productId: product.id || productId, name: product.name, price: product.price, image: product.image, addedAt: new Date().toISOString() });
            if (buttonElement) buttonElement.classList.add('active');
            Swal.fire({ title: 'Added to Wishlist!', text: `${product.name} has been added.`, icon: 'success', timer: 2000, showConfirmButton: false });
        }
        // Persist changes
        await userRef.set({ wishlist: wishlist }, { merge: true });
        updateWishlistCountBadge(wishlist.length);
    } catch (error) {
        console.error('Error updating wishlist:', error);
        Swal.fire({ title: 'Error', text: 'There was a problem updating your wishlist.', icon: 'error', confirmButtonText: 'OK' });
    }
}

// Show empty state message with shop now button
function showEmptyStateMessage(message) {
    Swal.fire({
        title: 'Empty',
        text: message,
        icon: 'info',
        confirmButtonText: 'Shop Now',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Redirect to shop page
            window.location.href = 'shop.html';
        }
    });
}

// Load cart and wishlist counts on page load
async function loadUserCartWishlistCounts() {
    const userRef = getUserRef();
    try {
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const cart = userData.cart || [];
            const wishlist = userData.wishlist || [];
            updateCartCountBadge(cart);
            updateWishlistCountBadge(wishlist.length);
        } else {
            // Reset counts if no data exists
            updateCartCountBadge(0);
            updateWishlistCountBadge(0);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Reset counts on error
        updateCartCountBadge(0);
        updateWishlistCountBadge(0);
    }
}

// Update cart count badge
function updateCartCountBadge(cart) {
    // cart can be an array or a number
    let count = 0;
    if (Array.isArray(cart)) {
        count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    } else if (typeof cart === 'number') {
        count = cart;
    }
    const desktopBadge = document.getElementById('desktop-nav-cart-count');
    const mobileBadge = document.getElementById('mobile-nav-cart-count');
    const footerBadge = document.getElementById('mobile-cart-count');
    const mobileFooterBadge = document.getElementById('mobile-footer-cart-count');
    if (desktopBadge) desktopBadge.textContent = count;
    if (mobileBadge) mobileBadge.textContent = count;
    if (footerBadge) footerBadge.textContent = count;
    if (mobileFooterBadge) mobileFooterBadge.textContent = count;
}

// Update wishlist count badge
function updateWishlistCountBadge(count) {
    const desktopBadge = document.getElementById('desktop-nav-wishlist-count');
    const mobileBadge = document.getElementById('mobile-nav-wishlist-count');
    const footerBadge = document.getElementById('mobile-wishlist-count');
    const mobileFooterBadge = document.getElementById('mobile-footer-wishlist-count');
    
    if (desktopBadge) desktopBadge.textContent = count;
    if (mobileBadge) mobileBadge.textContent = count;
    if (footerBadge) footerBadge.textContent = count;
    if (mobileFooterBadge) mobileFooterBadge.textContent = count;
}

// Listen for auth state changes
firebase.auth().onAuthStateChanged(function(user) {
    // Reload cart and wishlist counts when auth state changes
    loadUserCartWishlistCounts();
});
