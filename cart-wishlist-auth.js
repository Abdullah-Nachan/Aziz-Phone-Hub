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
    // No wishlist button logic here. Handled exclusively by wishlist.js
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
            const wishlist = userData.wishlist || [];
            updateWishlistCountBadge(wishlist.length);
        } else {
            // Reset counts if no data exists
            updateWishlistCountBadge(0);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Reset counts on error
        updateWishlistCountBadge(0);
    }
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
