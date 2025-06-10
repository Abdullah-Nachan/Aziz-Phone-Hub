/**
 * Wishlist functionality for Aziz Phone Hub
 * Handles adding, removing, and displaying wishlist items
 */

// Global wishlist instance
let wishlistInstance;

// Helper to generate a unique ID for guests
function generateGuestId() {
    return 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

// Wishlist class
class Wishlist {
    constructor() {
        console.log('Creating wishlist instance');
        this.items = []; // Local cache of wishlist item IDs, populated from Firebase
        this.guestId = this._getOrCreateGuestId(); // Get or create a unique ID for guest sessions
        
        // The actual initialization (fetching items, rendering) will be triggered externally after auth state is known.
    }

    async init() {
        console.log('[Wishlist] Initializing instance data and UI...');
        // Fetch initial items based on current auth state (which is resolved by now)
        this.items = await this.getWishlistItems().then(fetchedItems => fetchedItems.map(item => item.id));
        this.updateWishlistCount();

        // Render wishlist page if on wishlist page initially
        // REMOVED: renderWishlistPage();
    }

    // Get or create a unique guest ID stored in localStorage
    _getOrCreateGuestId() {
        let id = localStorage.getItem('guestId');
        if (!id) {
            id = generateGuestId();
            localStorage.setItem('guestId', id);
        }
        return id;
    }

    // Add item to wishlist (Firestore only for all users)
    async addItem(product) {
        try {
            const user = firebase && firebase.auth().currentUser;
            const productId = typeof product === 'object' ? product.id : product;

            // Ensure productObj has necessary fields for storage
            let productObj = typeof product === 'object' ? product : (window.products ? window.products[productId] : null);
            if (!productObj || !productObj.id) {
                console.error('Product not found or invalid:', productId, productObj);
                return false;
            }
            // Ensure productObj has both 'id' and 'productId' for consistency in Firestore
            if (!productObj.productId) {
                productObj.productId = productObj.id;
            }

            let wishlistDocRef;
            let currentWishlist = [];
            let fieldToUpdate = 'wishlist'; // Field name for authenticated users

            if (user) {
                // Authenticated user: store in users/{uid}
                wishlistDocRef = firebase.firestore().collection('users').doc(user.uid);
                const userDoc = await wishlistDocRef.get();
                if (userDoc.exists) {
                    currentWishlist = (userDoc.data().wishlist || []).filter(item => item && item.id);
                }
            } else {
                // Guest user: store in guest_wishlists/{guestId}
                wishlistDocRef = firebase.firestore().collection('guest_wishlists').doc(this.guestId);
                const guestDoc = await wishlistDocRef.get();
                if (guestDoc.exists) {
                    currentWishlist = (guestDoc.data().items || []).filter(item => item && item.id);
                }
                fieldToUpdate = 'items'; // Field name for guest users
            }

            // Only add if not already present based on productObj.id
            if (!currentWishlist.some(item => item && item.id === productObj.id)) {
                currentWishlist.push(productObj); // Store the full product object
                await wishlistDocRef.set({ [fieldToUpdate]: currentWishlist }, { merge: true });
                
                // Update local cache and UI
                this.items.push(productObj.id);
                this.updateWishlistCount();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding item to wishlist:', error);
            return false;
        }
    }
    
    // Remove item from wishlist (Firestore only for all users)
    async removeItem(productId) {
        try {
            const user = firebase && firebase.auth().currentUser;
            let wishlistDocRef;
            let currentWishlist = [];
            let fieldToUpdate = 'wishlist'; // Field name for authenticated users

            if (user) {
                wishlistDocRef = firebase.firestore().collection('users').doc(user.uid);
                const userDoc = await wishlistDocRef.get();
                if (userDoc.exists) {
                    currentWishlist = (userDoc.data().wishlist || []).filter(item => item && item.id);
                }
            } else {
                wishlistDocRef = firebase.firestore().collection('guest_wishlists').doc(this.guestId);
                const guestDoc = await wishlistDocRef.get();
                if (guestDoc.exists) {
                    currentWishlist = (guestDoc.data().items || []).filter(item => item && item.id);
                }
                fieldToUpdate = 'items'; // Field name for guest users
            }

            const initialLength = currentWishlist.length;
            const updatedWishlist = currentWishlist.filter(item => item.id !== productId);

            if (updatedWishlist.length < initialLength) {
                // Item was found and removed
                await wishlistDocRef.set({ [fieldToUpdate]: updatedWishlist }, { merge: true });
                
                // Update local cache and UI
                this.items = this.items.filter(id => id !== productId);
                this.updateWishlistCount();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing item from wishlist:', error);
            return false;
        }
    }

    // Toggle item in wishlist (handles async for Firestore)
    async toggleItem(product) {
        const productId = typeof product === 'object' ? product.id : product;
        
        // This 'hasItem' now relies on the local 'this.items' cache, which is updated
        // after addItem/removeItem.
        if (this.items.includes(productId)) { // Check local cache
            await this.removeItem(productId);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Removed from Wishlist',
                    text: 'Product has been removed from your wishlist.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            return false;
        } else {
            await this.addItem(product);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Added to Wishlist',
                    text: 'Product has been added to your wishlist.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            return true;
        }
    }
    
    // Check if item is in wishlist (relies on local cache after initial load/updates)
    hasItem(productId) {
        return this.items.includes(productId);
    }
    
    // Update wishlist count in UI
    updateWishlistCount() {
        try {
            const count = this.items.length;
            
            // Update all wishlist count badges
            const wishlistCounts = document.querySelectorAll('.wishlist-count-badge');
            wishlistCounts.forEach(badge => {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            });
            
            // Also update specific elements by ID
            const wishlistCount = document.getElementById('wishlist-count');
            if (wishlistCount) {
                wishlistCount.textContent = count;
            }
            
            const mobileWishlistCount = document.getElementById('mobile-nav-wishlist-count');
            if (mobileWishlistCount) {
                mobileWishlistCount.textContent = count;
                mobileWishlistCount.style.display = count > 0 ? 'flex' : 'none';
            }
            
            const desktopWishlistCount = document.getElementById('desktop-nav-wishlist-count');
            if (desktopWishlistCount) {
                desktopWishlistCount.textContent = count;
                desktopWishlistCount.style.display = count > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Error updating wishlist count:', error);
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        try {
            document.addEventListener('click', async (e) => {
                const wishlistBtn = e.target.closest('.btn-wishlist, .like-btn');
                if (wishlistBtn) {
                    e.preventDefault();
                    const productId = wishlistBtn.dataset.productId;
                    let product = productId; // Start with just the ID

                    // Attempt to get the full product object from available global data
                    if (window.currentProduct && window.currentProduct.id === productId) {
                        product = window.currentProduct;
                    } else if (window.filteredProducts) {
                        const foundProduct = window.filteredProducts.find(p => p.id === productId);
                        if (foundProduct) product = foundProduct;
                    } else if (window.products) { // Try static products if other sources fail
                        const staticProduct = window.products[productId];
                        if (staticProduct) product = staticProduct;
                    }

                    if (typeof product === 'string' && window.products && window.products[product]) {
                        // If still just an ID, try to get the full product object from static data
                        product = window.products[product];
                    } else if (typeof product === 'string') {
                        // If it's still just a string ID and no product object was found,
                        // we can't add full details. Log an error and prevent adding.
                        console.error('Failed to get full product details for ID:', productId);
                        Swal.fire({
                            title: 'Error',
                            text: 'Could not get product details to add to wishlist.',
                            icon: 'error',
                            timer: 3000,
                            showConfirmButton: false
                        });
                        return; // Prevent adding if product details can't be found
                    }

                    await this.toggleItem(product);
                    // Update button icon state based on the local 'this.items' cache
                    const icon = wishlistBtn.querySelector('i');
                    if (icon) {
                        if (this.hasItem(productId)) {
                            icon.className = 'fas fa-heart text-danger';
                        } else {
                            icon.className = 'far fa-heart';
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error setting up wishlist event listeners:', error);
        }
    }
    
    // Get all wishlist items with details (from Firebase for both authenticated and guest)
    async getWishlistItems() {
        try {
            const user = firebase && firebase.auth().currentUser;
            let fetchedItems = [];
            let docRef;

            if (user) {
                // Authenticated user: fetch from users/{uid}/wishlist
                docRef = firebase.firestore().collection('users').doc(user.uid);
            } else {
                // Guest user: fetch from guest_wishlists/{guestId}
                docRef = firebase.firestore().collection('guest_wishlists').doc(this.guestId);
            }

            const doc = await docRef.get();
            if (doc.exists) {
                const data = doc.data();
                // For authenticated, it's 'wishlist'. For guests, it's 'items'.
                // Ensure data is an array before filtering
                fetchedItems = (user ? data.wishlist : data.items) || [];
                if (!Array.isArray(fetchedItems)) {
                    console.warn(`[Wishlist][getWishlistItems] Fetched data for ${user ? 'user' : 'guest'} is not an array. Resetting.`);
                    fetchedItems = [];
                }
                
                // Filter out any nulls or malformed items right after fetching
                fetchedItems = fetchedItems.filter(item => item && (item.id || item.productId));

                // Ensure consistency: if product has only 'id', add 'productId', and ensure 'id' is top-level
                fetchedItems = fetchedItems.map(item => {
                    const newItem = { ...item }; // Create a new object to avoid direct modification issues
                    if (newItem.id && !newItem.productId) {
                        newItem.productId = newItem.id;
                    }
                    if (!newItem.id && newItem.productId) {
                        newItem.id = newItem.productId; // Ensure 'id' is also present if only productId exists
                    }
                    return newItem;
                });
            }
            console.log('[Wishlist][getWishlistItems] Fetched items from Firebase:', fetchedItems);
            // Return full product objects, which renderWishlistPage will use
            return fetchedItems;
        } catch (error) {
            console.error('Error fetching wishlist products:', error);
            return [];
        }
    }
}

// Initialize wishlist when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired for wishlist.js');

    // Wait for window.products and Firebase to be ready
    const checkDependencies = () => {
        if (window.products && Object.keys(window.products).length > 0 && typeof firebase !== 'undefined' && firebase.auth) {
            console.log('[Wishlist Module] All dependencies ready. Setting up Firebase auth state listener.');
            if (!window.wishlistInitialized) {
                window.wishlistInitialized = true;
                
                // Listen for Firebase Auth state to be ready before initializing wishlistInstance
                firebase.auth().onAuthStateChanged(function(user) {
                    console.log('Firebase auth state resolved in DOMContentLoaded:', user ? user.uid : 'Guest');
                    wishlistInstance = new Wishlist();
                    wishlistInstance.setupEventListeners(); // Setup listeners once
                    wishlistInstance.init(); // Call init to fetch data and render

                    // After wishlist is initialized, if on the wishlist page, render it.
                    if (document.getElementById('wishlist-items')) {
                        renderWishlistPage();
                    }

                    // Make functions globally available
                    window.isInWishlist = (productId) => wishlistInstance.hasItem(productId);
                    window.toggleWishlist = (product) => wishlistInstance.toggleItem(product);
                    window.addToWishlist = (product) => wishlistInstance.addItem(product);
                    window.removeFromWishlist = (productId) => wishlistInstance.removeItem(productId);
                    window.getWishlistItems = () => wishlistInstance.getWishlistItems();
                });
            }
        } else {
            console.log('[Wishlist Module] Waiting for dependencies (products:', window.products ? Object.keys(window.products).length : '0', 'firebase:', typeof firebase !== 'undefined', '). Retrying in 100ms...');
            setTimeout(checkDependencies, 100); // Retry after 100ms
        }
    };

    checkDependencies(); // Start checking for dependencies
});

async function renderWishlistPage() {
    console.log('[Wishlist Page] renderWishlistPage called.');
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    const emptyWishlist = document.getElementById('empty-wishlist');
    const wishlistContent = document.getElementById('wishlist-content');
    wishlistItemsContainer.innerHTML = '';
    
    // Use the locally cached item IDs and map them to full product objects from window.products
    const productIdsInWishlist = wishlistInstance.items;
    
    const itemsToRender = productIdsInWishlist
        .map(id => window.products[id]) // Map IDs to full product objects from window.products
        .filter(product => product); // Filter out any null/undefined if product not found

    console.log('[Wishlist Page] Items prepared for rendering from cache:', itemsToRender);

    if (!itemsToRender || itemsToRender.length === 0) {
        emptyWishlist.classList.remove('d-none');
        wishlistContent.classList.add('d-none');
    } else {
        emptyWishlist.classList.add('d-none');
        wishlistContent.classList.remove('d-none');
        itemsToRender.forEach(product => {
            console.log('[Wishlist Page] Rendering product:', product);
            const card = createWishlistProductCard(product);
            console.log('[Wishlist Page] Created card element:', card); // Log the created element
            if (card && card.nodeType === 1) { // Ensure it's a valid element before appending
                wishlistItemsContainer.appendChild(card);
                console.log('[Wishlist Page] Appended card to container.', wishlistItemsContainer.children.length, 'total children.'); // Confirm append
            } else {
                console.error('[Wishlist Page] Card element is invalid, not appending:', card);
            }
        });
    }
}

function createWishlistProductCard(product) {
    // Ensure product and its properties are defined before accessing
    // Check for 'id' OR 'productId' as the primary identifier
    if (!product || (!product.id && !product.productId)) {
        console.error('Invalid product object passed to createWishlistProductCard. Object received:', product);
        console.error('Diagnostic: product.id type:', typeof product.id, 'value:', product.id, '; product.productId type:', typeof product.productId, 'value:', product.productId);
        return document.createElement('div'); // Return an empty div to avoid errors
    }

    const productId = product.id || product.productId; // Use 'id' if present, else 'productId'
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    col.innerHTML = `
        <div class="product-card h-100 position-relative">
            <div class="product-image">
                <img src="${product.image || 'https://placehold.co/300x300?text=No+Image'}" alt="${product.name || ''}" class="img-fluid" />
            </div>
            <div class="product-info">
                <h3>${product.name || 'No Name'}</h3>
                <div class="price">₹${product.price || '0'}</div>
                <button class="btn btn-outline-danger remove-wishlist-btn mt-2" data-product-id="${productId}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    console.log('[Wishlist Card] Generated HTML for product:', productId, col.outerHTML); // Log the generated HTML
    // Remove from wishlist event
    col.querySelector('.remove-wishlist-btn').addEventListener('click', async function(e) {
        e.preventDefault();
        await wishlistInstance.removeItem(productId); // Use the consistent productId
        renderWishlistPage(); // Re-render after removal
    });
    return col;
}

