/**
 * Firestore Wishlist functionality for Aziz Phone Hub
 * Handles fetching and displaying wishlist items from user's Firestore collection
 */

// Wishlist Operations Handler
console.log('Script firestore-wishlist.js loaded');

// Load wishlist items once auth state is known
firebase.auth().onAuthStateChanged(function(user) {
    console.log('[Wishlist] Auth state changed, loading items');
    loadWishlistItems();
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

// Load wishlist items from Firestore
async function loadWishlistItems() {
    const userRef = getUserRef();
    const emptyWishlistDiv = document.getElementById('empty-wishlist');
    const wishlistContentDiv = document.getElementById('wishlist-content');
    const wishlistItemsDiv = document.getElementById('wishlist-items');
    
    try {
        const userDoc = await userRef.get();
        
        if (!userDoc.exists || !userDoc.data().wishlist || userDoc.data().wishlist.length === 0) {
            // Show empty wishlist message
            if (emptyWishlistDiv) emptyWishlistDiv.classList.remove('d-none');
            if (wishlistContentDiv) wishlistContentDiv.classList.add('d-none');
            return;
        }
        
        const wishlist = userDoc.data().wishlist;
        
        // Debug: log wishlist IDs and static-products keys
        console.log('[Debug][Wishlist] Wishlist IDs:', wishlist.map(i => i.productId || i.id));
        console.log('[Debug][Wishlist] Static product keys:', Object.keys(window.products || {}));
        
        // Show wishlist content
        if (emptyWishlistDiv) emptyWishlistDiv.classList.add('d-none');
        if (wishlistContentDiv) wishlistContentDiv.classList.remove('d-none');
        
        // Clear existing items
        if (wishlistItemsDiv) wishlistItemsDiv.innerHTML = '';
        
        // Render wishlist items using static product data
        wishlist.forEach(item => {
            const product = window.products && window.products[item.productId];
            if (product && wishlistItemsDiv) {
                wishlistItemsDiv.innerHTML += `
                    <div class="col-6 col-md-4 col-lg-3 mb-4 wishlist-item" data-product-id="${item.productId}">
                        <div class="card h-100 position-relative">
                            <button class="btn remove-from-wishlist p-2 position-absolute top-0 end-0 bg-transparent border-0" data-product-id="${item.productId}">
                                <i class="fas fa-heart text-danger"></i>
                            </button>
                            <a href="product.html?id=${item.productId}" class="stretched-link"></a>
                            <img src="${product.image}" class="card-img-top" alt="${product.name}">
                            <div class="card-body">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text text-primary fw-bold">${product.price}</p>
                                <button class="btn btn-primary add-to-cart" data-product-id="${item.productId}">
                                    <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                console.warn(`Product not found in static-products.js for wishlist item with ID: ${item.productId}`);
            }
        });
        
        // Add event listeners to the new buttons after they are added to the DOM
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                handleCartAction(productId);
            });
        });
        
        document.querySelectorAll('.remove-from-wishlist').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                removeFromWishlist(productId);
            });
        });
        
    } catch (error) {
        console.error('Error loading wishlist:', error);
        Swal.fire({
            title: 'Error',
            text: 'There was a problem loading your wishlist.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Listen for auth state changes
firebase.auth().onAuthStateChanged(function(user) {
    // Reload wishlist items when auth state changes
    loadWishlistItems();
});

// Initialize Firestore wishlist
async function initFirestoreWishlist() {
    // Check if we're on the wishlist page
    const wishlistContainer = document.getElementById('wishlist-items');
    const emptyWishlistMessage = document.getElementById('empty-wishlist');
    const wishlistContent = document.getElementById('wishlist-content');
    
    if (wishlistContainer && emptyWishlistMessage && wishlistContent) {
        console.log("Initializing Firestore wishlist on wishlist page");
        await loadWishlistFromFirestore();
    }
    
    // Setup remove item event listeners
    setupRemoveItemListeners();
}

// Load wishlist from Firestore
async function loadWishlistFromFirestore() {
    try {
        // Check if user is logged in
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.log("User not logged in, showing login prompt");
            showLoginRequiredMessage();
            return;
        }
        
        console.log("Loading wishlist from Firestore for user:", user.uid);
        
        // Get user's wishlist from Firestore
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.error('User document not found');
            showEmptyWishlist();
            return;
        }
        
        const userData = userDoc.data();
        const wishlistItems = userData.wishlist || [];
        
        if (wishlistItems.length === 0) {
            console.log("Wishlist is empty");
            showEmptyWishlist();
            return;
        }
        
        console.log("Wishlist items loaded:", wishlistItems);
        
        // Display wishlist items
        displayWishlistItems(wishlistItems);
        
    } catch (error) {
        console.error('Error loading wishlist from Firestore:', error);
        showErrorMessage("There was a problem loading your wishlist. Please try again later.");
    }
}

// Display wishlist items in the UI
function displayWishlistItems(wishlistItems) {
    const wishlistContainer = document.getElementById('wishlist-items');
    const emptyWishlistMessage = document.getElementById('empty-wishlist');
    const wishlistContent = document.getElementById('wishlist-content');
    
    if (!wishlistContainer || !emptyWishlistMessage || !wishlistContent) {
        console.error('Wishlist containers not found');
        return;
    }
    
    // Clear previous items
    wishlistContainer.innerHTML = '';
    
    // Hide empty wishlist message and show wishlist content
    emptyWishlistMessage.classList.add('d-none');
    wishlistContent.classList.remove('d-none');
    
    // Create row for grid layout
    const row = document.createElement('div');
    row.className = 'row g-4';
    wishlistContainer.appendChild(row);
    
    // Add each item to the wishlist
    wishlistItems.forEach(item => {
        const itemElement = createWishlistItemElement(item);
        row.appendChild(itemElement);
    });
}

// Create wishlist item element
function createWishlistItemElement(item) {
    const colElement = document.createElement('div');
    colElement.className = 'col-md-4 col-sm-6';
    
    // Format the price to ensure only one rupee symbol
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price;
    const formattedPrice = typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : item.price;
    
    colElement.innerHTML = `
        <div class="product-card wishlist-item" data-product-id="${item.productId}">
            <div class="product-image">
                <img src="${item.image || 'https://res.cloudinary.com/dcnawxif9/image/upload/v1748688934/logo_qn8fgh.jpg'}" alt="${item.name}">
                <div class="product-actions">
                    <button class="btn btn-sm btn-danger remove-from-wishlist" title="Remove from Wishlist">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-primary add-to-cart" title="Add to Cart" data-product-id="${item.productId}">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">
                    <a href="product.html?id=${item.productId}">${item.name}</a>
                </h3>
                <div class="product-price">${formattedPrice}</div>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="far fa-star"></i>
                    <span class="rating-count">(4.0)</span>
                </div>
            </div>
        </div>
    `;
    
    return colElement;
}

// Setup remove item event listeners
function setupRemoveItemListeners() {
    const wishlistContainer = document.getElementById('wishlist-items');
    
    if (!wishlistContainer) return;
    
    // Use event delegation for remove buttons
    wishlistContainer.addEventListener('click', function(e) {
        const target = e.target;
        
        if (target.classList.contains('remove-from-wishlist') || target.closest('.remove-from-wishlist')) {
            const item = target.closest('.wishlist-item');
            const productId = item.dataset.productId;
            
            // Confirm removal
            if (confirm('Are you sure you want to remove this item from your wishlist?')) {
                removeWishlistItem(productId);
            }
        }
    });
}

// Remove wishlist item from Firestore
async function removeWishlistItem(productId) {
    try {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.error('User not logged in');
            return;
        }
        
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.error('User document not found');
            return;
        }
        
        const userData = userDoc.data();
        let wishlistItems = userData.wishlist || [];
        
        // Remove the item from the wishlist
        wishlistItems = wishlistItems.filter(item => item.productId !== productId);
        
        // Update Firestore
        await userRef.update({ wishlist: wishlistItems });
        
        // Update UI
        if (wishlistItems.length === 0) {
            showEmptyWishlist();
        } else {
            // Remove the item from the DOM
            const wishlistItem = document.querySelector(`.wishlist-item[data-product-id="${productId}"]`);
            if (wishlistItem) {
                const colElement = wishlistItem.closest('.col-md-4');
                if (colElement) {
                    colElement.remove();
                }
            }
        }
        
        // Update wishlist count badge
        updateWishlistCountBadge(wishlistItems.length);
        
        // Show success message
        Swal.fire({
            title: 'Removed!',
            text: 'Item has been removed from your wishlist.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error removing wishlist item:', error);
        showErrorMessage("There was a problem removing the item from your wishlist. Please try again later.");
    }
}

// Add item to cart from wishlist
async function addToCartFromWishlist(productId) {
    try {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.error('User not logged in');
            showLoginRequiredMessage();
            return;
        }
        
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.error('User document not found');
            return;
        }
        
        const userData = userDoc.data();
        const wishlistItems = userData.wishlist || [];
        const cartItems = userData.cart || [];
        
        // Find the item in the wishlist
        const wishlistItem = wishlistItems.find(item => item.productId === productId);
        
        if (!wishlistItem) {
            console.error('Item not found in wishlist:', productId);
            return;
        }
        
        // Check if item is already in cart
        const existingCartItem = cartItems.find(item => item.productId === productId);
        
        if (existingCartItem) {
            // Update quantity
            existingCartItem.quantity += 1;
        } else {
            // Add to cart
            cartItems.push({
                productId: wishlistItem.productId,
                name: wishlistItem.name,
                price: wishlistItem.price,
                image: wishlistItem.image,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        // Update Firestore
        await userRef.update({ cart: cartItems });
        
        // Update cart count badge
        updateCartCountBadge(cartItems.length);
        
        // Show success message
        Swal.fire({
            title: 'Added to Cart!',
            text: 'Item has been added to your cart.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error adding item to cart from wishlist:', error);
        showErrorMessage("There was a problem adding the item to your cart. Please try again later.");
    }
}

// Show empty wishlist message
function showEmptyWishlist() {
    const emptyWishlistMessage = document.getElementById('empty-wishlist');
    const wishlistContent = document.getElementById('wishlist-content');
    
    if (emptyWishlistMessage && wishlistContent) {
        emptyWishlistMessage.classList.remove('d-none');
        wishlistContent.classList.add('d-none');
    }
}

// Show login required message
function showLoginRequiredMessage() {
    const emptyWishlistMessage = document.getElementById('empty-wishlist');
    const wishlistContent = document.getElementById('wishlist-content');
    
    if (emptyWishlistMessage && wishlistContent) {
        emptyWishlistMessage.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-user-lock fa-4x mb-3 text-muted"></i>
                <h3>Sign In Required</h3>
                <p class="text-muted">Please sign in to view your wishlist</p>
                <a href="auth.html" class="btn btn-primary mt-3">Sign In</a>
            </div>
        `;
        emptyWishlistMessage.classList.remove('d-none');
        wishlistContent.classList.add('d-none');
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

// Update cart count badge
function updateCartCountBadge(count) {
    const desktopBadge = document.getElementById('desktop-nav-cart-count');
    const mobileBadge = document.getElementById('mobile-nav-cart-count');
    const footerBadge = document.getElementById('mobile-cart-count');
    
    if (desktopBadge) desktopBadge.textContent = count;
    if (mobileBadge) mobileBadge.textContent = count;
    if (footerBadge) footerBadge.textContent = count;
}

// Remove item from wishlist
async function removeFromWishlist(productId) {
    const userRef = getUserRef();

    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;

        const wishlist = userDoc.data().wishlist || [];
        const itemIndex = wishlist.findIndex(item => item.productId === productId);

        if (itemIndex >= 0) {
            // Remove item
            wishlist.splice(itemIndex, 1);

            // Update wishlist in Firestore
            await userRef.update({ wishlist: wishlist });

            // Reload wishlist items
            loadWishlistItems();

            // Update wishlist count badge
            updateWishlistCountBadge(wishlist.length);

            // Show success message
            Swal.fire({
                title: 'Removed from Wishlist',
                text: 'Item has been removed from your wishlist.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        Swal.fire({
            title: 'Error',
            text: 'There was a problem removing the item from your wishlist.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}
