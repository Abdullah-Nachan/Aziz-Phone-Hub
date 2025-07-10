// guest-cart-wishlist.js
// Handles Add to Cart and Wishlist for guests (not signed in) using localStorage

document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
        const addToCartBtn = e.target.closest('.add-to-cart, .add-to-cart-btn');
        const likeBtn = e.target.closest('.like-btn, .btn-wishlist');
        // If user is not signed in
        if (typeof firebase !== 'undefined' && firebase.auth && !firebase.auth().currentUser) {
            if (addToCartBtn) {
                e.preventDefault();
                e.stopPropagation();
                // Get product data from data attributes
                const product = getProductDataFromButton(addToCartBtn);
                addToLocalStorage('cart', product);
                Swal.fire({
                    title: 'Added to Cart!',
                    text: `${product.name} has been added to your cart.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            if (likeBtn) {
                e.preventDefault();
                e.stopPropagation();
                const product = getProductDataFromButton(likeBtn);
                addToLocalStorage('wishlist', product);
                Swal.fire({
                    title: 'Added to Wishlist!',
                    text: `${product.name} has been added to your wishlist.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        }
    }, true);

    if (typeof firebase !== 'undefined' && firebase.auth && !firebase.auth().currentUser) {
        // Only run on cart page
        if (document.getElementById('cart-items')) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            renderGuestCart(cart);
        }
    }

    // --- Update badges for guests on page load ---
    if (typeof firebase !== 'undefined' && firebase.auth && !firebase.auth().currentUser) {
        updateGuestCartBadge();
        updateGuestWishlistBadge();
    }
});

// Helper to get product data for cart
function getCartProductData(btn) {
    return {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        image: btn.dataset.image,
        quantity: 1
    };
}

// Helper to get product data for wishlist
function getWishlistProductData(btn) {
    return {
        id: btn.dataset.id,
        productId: btn.dataset.id
    };
}

// --- Helper to extract product data from button or card (copied from script.js for consistency) ---
function getProductDataFromButton(btn) {
    // Try to get data from data attributes
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    const image = btn.getAttribute('data-image');
    let price = btn.getAttribute('data-price');
    if (typeof price === 'string') price = parseFloat(price.replace(/[^0-9.]/g, ''));
    // Fallback: try to find parent card and extract info
    if (!id || !name || !image || !price) {
        const card = btn.closest('.product-card');
        if (card) {
            const link = card.querySelector('a[href*="product.html?id="]');
            const img = card.querySelector('img');
            const title = card.querySelector('.product-title a');
            const priceElem = card.querySelector('.price');
            return {
                id: link ? link.href.split('id=')[1] : id,
                name: title ? title.textContent : name,
                image: img ? img.src : image,
                price: priceElem ? parseFloat(priceElem.textContent.replace(/[^0-9.]/g, '')) : price
            };
        }
    }
    return { id, name, image, price };
}

// --- Add to Cart for Guest (always use consistent structure) ---
document.addEventListener('click', function(e) {
    if (e.target.closest('.add-to-cart')) {
        const btn = e.target.closest('.add-to-cart');
        // Only for guests
        if (!window.firebase || !firebase.auth().currentUser) {
            const product = getProductDataFromButton(btn);
            addToLocalStorage('cart', product);
            
            // Fire Meta Pixel AddToCart event for guests
            if (typeof fbq !== 'undefined') {
                fbq('track', 'AddToCart', {
                    content_ids: [product.id],
                    content_type: 'product',
                    content_name: product.name,
                    value: parseFloat(product.price.replace(/[^\d.]/g, '')),
                    currency: 'INR',
                    content_category: product.category || 'electronics'
                });
                console.log('Meta Pixel AddToCart event fired for guest user:', product.name);
            }
            
            Swal.fire({ title: 'Added to Cart!', text: `${product.name} has been added to your cart.`, icon: 'success', timer: 1500, showConfirmButton: false });
            e.preventDefault();
        }
    }
});

// --- Add to Wishlist for Guest (always use consistent structure) ---
document.addEventListener('click', function(e) {
    if (e.target.closest('.like-btn')) {
        const btn = e.target.closest('.like-btn');
        // Only for guests
        if (!window.firebase || !firebase.auth().currentUser) {
            const product = getProductDataFromButton(btn);
            addToLocalStorage('wishlist', product);
            btn.classList.add('active');
            Swal.fire({ title: 'Added to Wishlist', text: `${product.name} has been added to your wishlist.`, icon: 'success', timer: 1500, showConfirmButton: false });
            e.preventDefault();
        }
    }
});

// --- Add to LocalStorage (cart/wishlist) ---
function addToLocalStorage(key, product) {
    if (!product || !product.id) return;
    let items = JSON.parse(localStorage.getItem(key) || '[]');
    if (key === 'cart') {
        // If already in cart, increase quantity
        const idx = items.findIndex(item => item.id === product.id);
        if (idx > -1) {
            items[idx].quantity = (items[idx].quantity || 1) + 1;
        } else {
            product.quantity = 1;
            items.push(product);
        }
        localStorage.setItem(key, JSON.stringify(items));
        updateGuestCartBadge();
    } else if (key === 'wishlist') {
        // Only store {id, productId}
        if (!items.some(item => item.id === product.id)) {
            items.push({ id: product.id, productId: product.id });
        }
        localStorage.setItem(key, JSON.stringify(items));
        updateGuestWishlistBadge();
    }
}

// --- Update cart badge for guests ---
function updateGuestCartBadge() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    const cartBadges = document.querySelectorAll('.cart-count-badge, #mobile-nav-cart-count');
    cartBadges.forEach(badge => {
        badge.textContent = count > 0 ? count : '';
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

// --- Update wishlist badge for guests ---
function updateGuestWishlistBadge() {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let count = wishlist.length;
    const desktopBadge = document.getElementById('desktop-nav-wishlist-count');
    const mobileBadge = document.getElementById('mobile-nav-wishlist-count');
    const footerBadge = document.getElementById('mobile-wishlist-count');
    const mobileFooterBadge = document.getElementById('mobile-footer-wishlist-count');
    if (desktopBadge) desktopBadge.textContent = count;
    if (mobileBadge) mobileBadge.textContent = count;
    if (footerBadge) footerBadge.textContent = count;
    if (mobileFooterBadge) mobileFooterBadge.textContent = count;
}

// Migration logic: On login, move guest cart/wishlist to Firebase
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            migrateLocalStorageToFirebase(user.uid);
        }
    });
}

async function migrateLocalStorageToFirebase(uid) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const userRef = firebase.firestore().collection('users').doc(uid);

    if (cart.length > 0) {
        await userRef.set({ cart: cart }, { merge: true });
        localStorage.removeItem('cart');
    }
    if (wishlist.length > 0) {
        await userRef.set({ wishlist: wishlist }, { merge: true });
        localStorage.removeItem('wishlist');
    }
}

// Render guest cart on cart page for guests
function renderGuestCart(cart) {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartContentDiv = document.getElementById('cart-content');
    const emptyCartDiv = document.getElementById('empty-cart');
    if (!cartItemsDiv) return;

    cartItemsDiv.innerHTML = '';
    if (cart.length === 0) {
        if (emptyCartDiv) emptyCartDiv.classList.remove('d-none');
        if (cartContentDiv) cartContentDiv.classList.add('d-none');
        return;
    } else {
        if (emptyCartDiv) emptyCartDiv.classList.add('d-none');
        if (cartContentDiv) cartContentDiv.classList.remove('d-none');
    }

    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        subtotal += itemTotal;
        cartItemsDiv.innerHTML += `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${item.image || 'images/placeholder.svg'}" alt="${item.name}" class="img-fluid rounded">
                        </div>
                        <div class="col-md-4">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="text-muted">₹${item.price || 0}</p>
                        </div>
                        <div class="col-md-3">
                            <div class="input-group">
                                <button class="btn btn-outline-secondary" type="button" onclick="updateGuestCartQuantity('${item.id}', -1)">-</button>
                                <input type="number" class="form-control text-center" value="${item.quantity || 1}" readonly>
                                <button class="btn btn-outline-secondary" type="button" onclick="updateGuestCartQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>
                        <div class="col-md-2 text-end">
                            <p class="mb-0">₹${itemTotal.toFixed(2)}</p>
                            <button class="btn btn-link text-danger p-0" onclick="removeFromGuestCart('${item.id}')">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    // Update price summary
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');
    if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₹${subtotal.toFixed(2)}`;
}

function updateGuestCartQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity = Math.max(1, (cart[itemIndex].quantity || 1) + change);
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderGuestCart(cart);
    }
}

function removeFromGuestCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderGuestCart(cart);
    Swal.fire({
        title: 'Removed from Cart',
        text: 'Item has been removed from your cart.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });
} 