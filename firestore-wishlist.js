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
    const user = firebase.auth().currentUser;
    const loginPrompt = document.getElementById('login-prompt');
    const emptyWishlistDiv = document.getElementById('empty-wishlist');
    const wishlistContentDiv = document.getElementById('wishlist-content');
    const wishlistItemsDiv = document.getElementById('wishlist-items');

    // Prompt login if not signed in
    if (!user) {
        if (loginPrompt) loginPrompt.classList.remove('d-none');
        if (emptyWishlistDiv) emptyWishlistDiv.classList.add('d-none');
        if (wishlistContentDiv) wishlistContentDiv.classList.add('d-none');
        return;
    } else {
        if (loginPrompt) loginPrompt.classList.add('d-none');
    }
    const userRef = getUserRef();
    
    try {
        // Ensure static products are loaded
        if (!window.products || Object.keys(window.products).length === 0) {
            console.log('[Wishlist] Waiting for static products to load...');
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for products to load
            
            // If still not loaded, retry once
            if (!window.products || Object.keys(window.products).length === 0) {
                console.log('[Wishlist] Retrying static products load...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        const userDoc = await userRef.get();
        
        if (!userDoc.exists || !userDoc.data().wishlist || userDoc.data().wishlist.length === 0) {
            // Show empty wishlist message
            if (emptyWishlistDiv) emptyWishlistDiv.classList.remove('d-none');
            if (wishlistContentDiv) wishlistContentDiv.classList.add('d-none');
            return;
        }
        
        const wishlist = userDoc.data().wishlist;
        
        // Debug: log wishlist items and static products
        console.log('[Debug][Wishlist] Raw wishlist items:', wishlist);
        console.log('[Debug][Wishlist] Wishlist IDs:', wishlist.map(i => i.productId || i.id));
        console.log('[Debug][Wishlist] Static product keys:', Object.keys(window.products || {}));
        
        // Check if wishlist items have matching products in static data
        const matchedItems = [];
        const missingItems = [];
        
        wishlist.forEach(item => {
            const productId = item.productId || item.id;
            if (window.products && window.products[productId]) {
                matchedItems.push({
                    id: productId,
                    ...window.products[productId]
                });
            } else {
                missingItems.push(productId);
            }
        });
        
        console.log(`[Debug][Wishlist] Found ${matchedItems.length} matching products, ${missingItems.length} missing`);
        if (missingItems.length > 0) {
            console.warn('[Debug][Wishlist] Missing products for IDs:', missingItems);
        }
        
        // Show wishlist content
        if (emptyWishlistDiv) emptyWishlistDiv.classList.add('d-none');
        if (wishlistContentDiv) wishlistContentDiv.classList.remove('d-none');
        
        // Clear existing items
        if (wishlistItemsDiv) wishlistItemsDiv.innerHTML = '';
        
        // If products are still not loaded, show error
        if (!window.products || Object.keys(window.products).length === 0) {
            console.error('Static products not loaded');
            showErrorMessage('Failed to load products. Please refresh the page.');
            return;
        }
        
        // Remove all inline HTML rendering and direct event listeners
        // Instead, after building matchedItems, call displayWishlistItems
        displayWishlistItems(matchedItems);
        return;
        
    } catch (error) {
        console.error('Error loading wishlist:', error);
        showErrorMessage('There was a problem loading your wishlist.');
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
        // Get the current user
        const user = firebase.auth().currentUser;
        const loginPrompt = document.getElementById('login-prompt');
        const emptyWishlistDiv = document.getElementById('empty-wishlist');
        const wishlistContent = document.getElementById('wishlist-content');
        
        // Handle case when user is not logged in
        if (!user) {
            console.log("User not logged in, showing login prompt");
            if (loginPrompt) loginPrompt.classList.remove('d-none');
            if (emptyWishlistDiv) emptyWishlistDiv.classList.add('d-none');
            if (wishlistContent) wishlistContent.classList.add('d-none');
            return;
        }
        
        // Hide login prompt if user is logged in
        if (loginPrompt) loginPrompt.classList.add('d-none');
        
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
        console.log("User data from Firestore:", userData);
        
        // Check if wishlist exists and is an array
        const wishlistItems = userData.wishlist || [];
        console.log("Wishlist items (raw):", wishlistItems);
        
        if (!Array.isArray(wishlistItems)) {
            console.error("Wishlist is not an array:", wishlistItems);
            showEmptyWishlist();
            return;
        }
        
        if (wishlistItems.length === 0) {
            console.log("Wishlist is empty");
            showEmptyWishlist();
            return;
        }
        
        console.log("Raw wishlist items from Firestore:", wishlistItems);
        
        // Log detailed status of wishlist items
        logWishlistItemsStatus(wishlistItems);
        
        // Check for missing products and get valid wishlist items
        const validWishlistItems = checkForMissingProducts(wishlistItems);
        
        if (validWishlistItems.length === 0) {
            console.log("No valid products found in wishlist");
            showEmptyWishlist();
            
            // Log available product IDs for debugging
            if (window.products) {
                console.log("Available product IDs:", Object.keys(window.products));
            } else {
                console.error("Window.products is not available");
            }
            
            return;
        }
        
        console.log(`Displaying ${validWishlistItems.length} valid wishlist items`);
        
        // Display valid wishlist items
        displayWishlistItems(validWishlistItems);
        
    } catch (error) {
        console.error('Error loading wishlist from Firestore:', error);
        showErrorMessage("There was a problem loading your wishlist. Please try again later.");
    }
}

// Display wishlist items in the UI
function displayWishlistItems(wishlistItems) {
    console.log("Displaying wishlist items:", wishlistItems);
    
    const wishlistContainer = document.getElementById('wishlist-items');
    const emptyWishlistMessage = document.getElementById('empty-wishlist');
    const wishlistContent = document.getElementById('wishlist-content');
    
    if (!wishlistContainer || !emptyWishlistMessage || !wishlistContent) {
        console.error('Wishlist containers not found');
        return;
    }
    
    // Clear previous items
    wishlistContainer.innerHTML = '';
    
    // Check if we have valid wishlist items
    if (!Array.isArray(wishlistItems) || wishlistItems.length === 0) {
        console.log("No valid wishlist items to display");
        showEmptyWishlist();
        return;
    }
    
    // Filter out any invalid items
    const validItems = wishlistItems.filter(item => {
        const isValid = item && item.id && item.name && window.products[item.id];
        if (!isValid) {
            console.warn('Invalid wishlist item skipped:', item);
        }
        return isValid;
    });
    
    if (validItems.length === 0) {
        console.log("No valid items to display after filtering");
        showEmptyWishlist();
        return;
    }
    
    // Hide empty wishlist message and show wishlist content
    emptyWishlistMessage.classList.add('d-none');
    wishlistContent.classList.remove('d-none');
    
    // Create a row for the wishlist items
    const row = document.createElement('div');
    row.className = 'row g-4';
    wishlistContainer.appendChild(row);
    
    // Add each wishlist item to the row
    validItems.forEach(item => {
        try {
            const itemElement = createWishlistItemElement(item);
            if (itemElement) {
                row.appendChild(itemElement);
            }
        } catch (error) {
            console.error('Error creating wishlist item element:', error, item);
        }
    });

    // Setup event listeners for wishlist cards
    setupWishlistCardEventListeners();
}

// Create wishlist item element
function createWishlistItemElement(item) {
    const colElement = document.createElement('div');
    colElement.className = 'col-md-4 col-sm-6';
    // Format the price to ensure only one rupee symbol
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price;
    const formattedPrice = typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : item.price;
    colElement.innerHTML = `
        <div class="product-card wishlist-item" data-product-id="${item.id}">
            <div class="product-image position-relative">
                <img src="${item.image || 'https://res.cloudinary.com/dcnawxif9/image/upload/v1748688934/logo_qn8fgh.jpg'}" alt="${item.name}">
                <button class="btn btn-sm remove-from-wishlist position-absolute top-0 end-0 m-2" title="Remove from Wishlist" style="background:rgba(255,255,255,0.8); border-radius:50%;">
                    <i class="fas fa-heart text-danger"></i>
                </button>
            </div>
            <div class="product-info text-center mt-2">
                <h3 class="product-title mb-1" style="font-size:1.1rem; font-weight:500;">
                    ${item.name}
                </h3>
                <div class="product-price fw-bold" style="font-size:1.05rem;">${formattedPrice}</div>
                <button class="btn btn-primary add-to-cart w-100 mt-2" data-product-id="${item.id}">
                    <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                </button>
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

        // Find the item in the wishlist (support both id and productId)
        const wishlistItem = wishlistItems.find(item => (item.productId || item.id) === productId);

        if (!wishlistItem) {
            console.error('Item not found in wishlist:', productId);
            return;
        }

        // Get product details from window.products
        const product = window.products && window.products[productId];
        if (!product) {
            console.error('Product details not found in window.products for:', productId);
            showErrorMessage('Product details not found. Please refresh the page.');
            return;
        }

        // Convert price to number if it's a string
        let priceNum = product.price;
        if (typeof priceNum === 'string') {
            priceNum = parseFloat(priceNum.replace(/[₹,]/g, '')) || 0;
        }

        // Check if item is already in cart
        const existingCartItem = cartItems.find(item => (item.id || item.productId) === productId);

        if (existingCartItem) {
            // Update quantity
            existingCartItem.quantity += 1;
        } else {
            // Add to cart with required fields and price as number
            cartItems.push({
                id: product.id,
                image: product.image,
                name: product.name,
                price: priceNum, // Now always a number
                quantity: 1
            });
        }

        // Update Firestore
        await userRef.update({ cart: cartItems });
        console.log('Cart updated in Firestore:', cartItems);

        // Update cart count badge
        updateCartCountBadge(cartItems.length);
        console.log('Cart badge updated, count:', cartItems.length);

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
    const loginPrompt = document.getElementById('login-prompt');
    const emptyWishlistMessage = document.getElementById('empty-wishlist');
    const wishlistContent = document.getElementById('wishlist-content');
    
    // Show login prompt and hide other sections
    if (loginPrompt) {
        loginPrompt.classList.remove('d-none');
        // Set the login prompt content if empty
        if (loginPrompt.innerHTML.trim() === '') {
            loginPrompt.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-user-lock fa-4x mb-3 text-muted"></i>
                    <h4>Please sign in to view your wishlist</h4>
                    <p class="text-muted mb-4">Sign in to access your saved items and continue shopping.</p>
                    <a href="login.html" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt me-2"></i>Sign In
                    </a>
                </div>`;
        }
    }
    
    // Hide other sections
    if (emptyWishlistMessage) emptyWishlistMessage.classList.add('d-none');
    if (wishlistContent) wishlistContent.classList.add('d-none');
}

// Log wishlist items and their matching status with static products
function logWishlistItemsStatus(wishlistItems) {
    if (!wishlistItems || !Array.isArray(wishlistItems)) {
        console.error('Invalid wishlist items:', wishlistItems);
        return [];
    }
    
    console.group('Wishlist Items Status');
    wishlistItems.forEach((item, index) => {
        const productId = item.productId || item.id;
        const exists = window.products && window.products[productId];
        console.log(`[${index}] ID: ${productId}, Exists: ${exists ? '✅' : '❌'}`);
    });
    console.groupEnd();
}

// Check for missing products in wishlist and merge with product data
function checkForMissingProducts(wishlistItems) {
    if (!wishlistItems || !Array.isArray(wishlistItems)) {
        console.error('Invalid wishlist items:', wishlistItems);
        return [];
    }
    
    const missingProducts = [];
    const existingProducts = [];
    
    console.log('Available window.products:', window.products);
    console.log('Processing wishlist items:', wishlistItems);
    
    wishlistItems.forEach(item => {
        // Handle both string (productId) and object formats
        let productId = item;
        
        if (typeof item === 'object' && item !== null) {
            productId = item.productId || item.id || item;
        }
        
        // If productId is an object, try to get the string ID
        if (productId && typeof productId === 'object') {
            productId = productId.id || productId.productId || '';
        }
        
        console.log('Processing wishlist item:', { originalItem: item, resolvedProductId: productId });
        
        if (!productId) {
            console.error('Wishlist item missing productId:', item);
            return;
        }
        
        // Check if product exists in static data
        const product = window.products && window.products[productId];
        if (product) {
            console.log(`Found matching product for ID: ${productId}`);
            existingProducts.push({
                id: productId,
                ...product
            });
        } else {
            console.warn('Product not found in static data:', productId);
            missingProducts.push(productId);
            
            // Try to find product by name if ID doesn't match
            if (typeof item === 'object' && item.name) {
                const matchedProduct = Object.values(window.products || {}).find(
                    p => p.name === item.name || p.id === item.name.toLowerCase().replace(/\s+/g, '-')
                );
                
                if (matchedProduct) {
                    console.log(`Found product by name: ${item.name} -> ${matchedProduct.id}`);
                    existingProducts.push(matchedProduct);
                }
            }
        }
    });
    
    if (missingProducts.length > 0) {
        console.warn(`Found ${missingProducts.length} missing products in wishlist:`, missingProducts);
        console.log('Available product IDs:', Object.keys(window.products || {}));
    } else {
        console.log('All wishlist items have matching products');
    }
    
    console.log('Final wishlist items to display:', existingProducts);
    return existingProducts;
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
    const cartBadges = document.querySelectorAll('.cart-count-badge');
    cartBadges.forEach(badge => {
        badge.textContent = count > 0 ? count : '0';
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// Remove item from wishlist
async function removeFromWishlist(productId) {
    console.log('removeFromWishlist called with:', productId);
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

// Function to wait for products to load
function waitForProducts(callback, maxAttempts = 10, attempt = 1) {
    if (window.products && Object.keys(window.products).length > 0) {
        console.log('Products loaded successfully');
        callback();
    } else if (attempt <= maxAttempts) {
        console.log(`Waiting for products to load (attempt ${attempt}/${maxAttempts})...`);
        setTimeout(() => waitForProducts(callback, maxAttempts, attempt + 1), 500);
    } else {
        console.error('Failed to load products after multiple attempts');
        showErrorMessage('Failed to load product data. Please refresh the page.');
    }
}

// Initialize wishlist when the script loads
console.log('Firestore wishlist script loaded');

// Wait for Firebase to be ready and check auth state
function initializeWishlist() {
    console.log('Initializing wishlist functionality...');
    
    function checkAuthAndLoad() {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            // Check if user is logged in
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    console.log('User is signed in:', user.uid);
                    if (window.products && Object.keys(window.products).length > 0) {
                        console.log('Products already loaded, initializing wishlist...');
                        loadWishlistFromFirestore();
                    } else {
                        console.log('Waiting for products to load...');
                        waitForProducts(loadWishlistFromFirestore);
                    }
                } else {
                    console.log('No user is signed in, showing login prompt');
                    showLoginRequiredMessage();
                }
            });
        } else {
            console.log('Firebase not ready yet, retrying...');
            setTimeout(checkAuthAndLoad, 500);
        }
    }
    
    // Start the process
    checkAuthAndLoad();
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWishlist);
} else {
    initializeWishlist();
}

// Setup event listeners for wishlist cards
function setupWishlistCardEventListeners() {
    const wishlistContainer = document.getElementById('wishlist-items');
    if (!wishlistContainer) return;

    // The actual cards are inside a .row inside #wishlist-items
    const row = wishlistContainer.querySelector('.row');
    if (!row) return;

    row.addEventListener('click', function(e) {
        // Always look for the closest .wishlist-item from the click target
        const card = e.target.closest('.wishlist-item');
        if (!card) return;
        const productId = card.getAttribute('data-product-id');

        // Add to Cart button
        if (e.target.closest('.add-to-cart')) {
            e.preventDefault();
            e.stopPropagation();
            addToCartFromWishlist(productId);
            return;
        }
        // Remove from Wishlist (heart icon)
        if (e.target.closest('.remove-from-wishlist')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Heart icon clicked. Product ID:', productId);
            removeFromWishlist(productId);
            return;
        }
        // Card click (anywhere else)
        window.location.href = `product.html?id=${productId}`;
    });
}
