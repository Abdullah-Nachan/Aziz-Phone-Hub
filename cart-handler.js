// Remove all guest logic. Only handle authenticated users. If not signed in, show sign-in popup. 

// Only handle authenticated users' Add to Cart logic. If not signed in, show sign-in popup.
document.addEventListener('click', async function(e) {
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (addToCartBtn) {
            e.preventDefault();
            // Try both data-product-id and data-id for compatibility
            const productId = addToCartBtn.dataset.productId || addToCartBtn.dataset.id;
            if (!productId) {
                Swal.fire({ title: 'Error', text: 'Product ID not found.', icon: 'error' });
                return;
            }
            // Get product object from window.products
            const product = window.products && (window.products[productId] || Object.values(window.products).find(p => p.id === productId));
            if (!product) {
                Swal.fire({ title: 'Error', text: 'Product not found.', icon: 'error' });
                return;
            }
            // Call Firestore add to cart
            if (typeof window.addToCartFirestore === 'function') {
                await window.addToCartFirestore(product, 1);
            } else {
                Swal.fire({ title: 'Error', text: 'Cart function not available.', icon: 'error' });
            }
        }
    }
}); 