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
    // Return the number of items in the wishlist (for UI badges etc.)
    getCount() {
        return Array.isArray(this.items) ? this.items.length : 0;
    }
    constructor() {
        console.log('Creating wishlist instance');
        this.items = []; // Local cache of wishlist item IDs, populated from Firebase
        this.guestId = this._getOrCreateGuestId(); // Get or create a unique ID for guest sessions
        
        // The actual initialization (fetching items, rendering) will be triggered externally after auth state is known.
    }

    async init() {
        // Defensive: ensure wishlistItemsContainer exists before manipulating
        if (typeof document !== 'undefined') {
            const wishlistItemsContainer = document.getElementById('wishlist-items');
            if (wishlistItemsContainer) wishlistItemsContainer.innerHTML = '';
        }
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
                // Store only {id, productId}, not the full product object
                const minimalWishlistItem = { id: productObj.id, productId: productObj.id };
                currentWishlist.push(minimalWishlistItem);
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
                    if (!productId) {
                        console.error('No productId found on wishlist button!', wishlistBtn);
                        Swal.fire({
                            title: 'Error',
                            text: 'Product ID not found.',
                            icon: 'error',
                            timer: 3000,
                            showConfirmButton: false
                        });
                        return;
                    }
                    let product = window.products && window.products[productId];
                    if (!product) {
                        console.error('Product not found or invalid:', productId, product);
                        Swal.fire({
                            title: 'Error',
                            text: 'Product not found or invalid.',
                            icon: 'error',
                            timer: 3000,
                            showConfirmButton: false
                        });
                        return;
                    }
                    // Only store {id, productId} in wishlist
                    const minimalProduct = { id: productId, productId: productId };
                    await this.toggleItem(minimalProduct);
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

    function renderForCurrentUser() {
        if (!firebase.auth().currentUser) {
            // Guest user: load wishlist from localStorage only
            const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            renderGuestWishlist(wishlist);
        } else {
            // Authenticated user: use Firestore logic as before
            wishlistInstance = new Wishlist();
            wishlistInstance.setupEventListeners();
            wishlistInstance.init();
            if (document.getElementById('wishlist-items')) {
                renderWishlistPage();
            }
            window.isInWishlist = (productId) => wishlistInstance.hasItem(productId);
            window.toggleWishlist = (product) => wishlistInstance.toggleItem(product);
            window.addToWishlist = (product) => wishlistInstance.addItem(product);
            window.removeFromWishlist = (productId) => wishlistInstance.removeItem(productId);
            window.getWishlistItems = () => wishlistInstance.getWishlistItems();
        }
    }

    // Wait for window.products and Firebase to be ready
    const checkDependencies = () => {
        if (window.products && Object.keys(window.products).length > 0 && typeof firebase !== 'undefined' && firebase.auth) {
            if (!window.wishlistInitialized) {
                window.wishlistInitialized = true;
                firebase.auth().onAuthStateChanged(function(user) {
                    renderForCurrentUser();
                });
                // Listen for localStorage changes (from other tabs/windows)
                window.addEventListener('storage', function(e) {
                    if (e.key === 'wishlist' && !firebase.auth().currentUser) {
                        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                        renderGuestWishlist(wishlist);
                    }
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
    if (wishlistItemsContainer) wishlistItemsContainer.innerHTML = '';
    
    // Use the locally cached item IDs
    const productIdsInWishlist = wishlistInstance.items;
    if (!productIdsInWishlist || productIdsInWishlist.length === 0) {
        emptyWishlist.classList.remove('d-none');
        wishlistContent.classList.add('d-none');
        return;
    }
    // Fetch product details from window.products (static data) for each ID
    let itemsToRender = [];
    for (const id of productIdsInWishlist) {
        if (window.products && window.products[id]) {
            itemsToRender.push(window.products[id]);
        } else {
            console.warn('[Wishlist Page] Product not found in static-products.js:', id);
        }
    }
    console.log('[Wishlist Page] Items prepared for rendering from static-products.js:', itemsToRender);
    if (!itemsToRender || itemsToRender.length === 0) {
        emptyWishlist.classList.remove('d-none');
        wishlistContent.classList.add('d-none');
    } else {
        emptyWishlist.classList.add('d-none');
        wishlistContent.classList.remove('d-none');
        itemsToRender.forEach(product => {
            console.log('[Wishlist Page] Rendering product:', product);
            const card = createWishlistProductCard(product);
            if (card && card.nodeType === 1) {
                wishlistItemsContainer.appendChild(card);
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

function renderGuestWishlist(wishlist) {
    // Hide login prompt, show wishlist content
    const loginPrompt = document.getElementById('login-prompt');
    const wishlistContentDiv = document.getElementById('wishlist-content');
    const emptyWishlistDiv = document.getElementById('empty-wishlist');
    
    if (loginPrompt) loginPrompt.classList.add('d-none');
    if (wishlistContentDiv) wishlistContentDiv.classList.remove('d-none');
    if (emptyWishlistDiv) emptyWishlistDiv.classList.toggle('d-none', wishlist.length > 0 ? true : false);
    
    // Render wishlist items
    const wishlistItemsDiv = document.getElementById('wishlist-items');
    if (wishlistItemsDiv) {
        wishlistItemsDiv.innerHTML = '';
        if (wishlist.length === 0) {
            wishlistItemsDiv.innerHTML = '<div class="text-center">Your wishlist is empty.</div>';
        } else {
            wishlist.forEach(item => {
                // Get product details from window.products if available
                const product = window.products && window.products[item.id];
                const productName = product ? product.name : `Product ${item.id}`;
                const productImage = product ? product.image : 'images/placeholder.svg';
                const productPrice = product ? product.price : 'N/A';
                
                wishlistItemsDiv.innerHTML += `
                    <div class="col-md-4 col-sm-6 mb-4">
                        <div class="product-card wishlist-item" data-product-id="${item.id}" style="cursor:pointer;" onclick="window.location.href='product.html?id=${item.id}'">
                            <div class="product-image position-relative">
                                <img src="${productImage}" alt="${productName}">
                                <button class="btn btn-sm remove-from-wishlist position-absolute top-0 end-0 m-2" 
                                    title="Remove from Wishlist" 
                                    style="background:rgba(255,255,255,0.8); border-radius:50%;"
                                    onclick="event.stopPropagation(); removeFromGuestWishlist('${item.id}')">
                                    <i class="fas fa-heart text-danger"></i>
                                </button>
                            </div>
                            <div class="product-info text-center mt-2">
                                <h3 class="product-title mb-1" style="font-size:1.1rem; font-weight:500;">
                                    ${productName}
                                </h3>
                                <div class="product-price fw-bold" style="font-size:1.05rem;">${productPrice}</div>
                                <button class="btn btn-primary add-to-cart w-100 mt-2" 
                                    data-id="${item.id}"
                                    data-name="${productName}"
                                    data-image="${productImage}"
                                    data-price="${productPrice}"
                                    onclick="event.stopPropagation();">
                                    <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    }
}

// Guest wishlist functions
function removeFromGuestWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderGuestWishlist(wishlist);
    
    Swal.fire({
        title: 'Removed from Wishlist',
        text: 'Item has been removed from your wishlist.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });
}

