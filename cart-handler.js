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

// Add to cart function with Meta Pixel tracking
function addToCart(product) {
    // Existing cart logic
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex !== -1) {
        // Product already exists, increase quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add new product to cart
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count display
    updateCartCount();
    
    // Meta Pixel AddToCart Event
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_ids: [product.id],
            content_type: 'product',
            content_name: product.name,
            value: parseFloat(product.price.replace(/[^\d.]/g, '')),
            currency: 'INR',
            content_category: product.category || 'electronics'
        });
        console.log('Meta Pixel AddToCart event fired for:', product.name);
    }
    
    // Show success message
    Swal.fire({
        icon: 'success',
        title: 'Added to Cart!',
        text: `${product.name} has been added to your cart.`,
        showConfirmButton: false,
        timer: 1500
    });
}

// Purchase completion function with Meta Pixel tracking
function completePurchase(orderData) {
    // Meta Pixel Purchase Event
    if (typeof fbq !== 'undefined') {
        const totalValue = orderData.items.reduce((total, item) => {
            return total + (parseFloat(item.price.replace(/[^\d.]/g, '')) * item.quantity);
        }, 0);
        
        const contentIds = orderData.items.map(item => item.id);
        
        fbq('track', 'Purchase', {
            content_ids: contentIds,
            content_type: 'product',
            value: totalValue,
            currency: 'INR',
            num_items: orderData.items.length,
            content_category: 'electronics'
        });
        console.log('Meta Pixel Purchase event fired for order:', orderData);
    }
    
    // Clear cart after successful purchase
    localStorage.removeItem('cart');
    updateCartCount();
} 