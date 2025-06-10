/**
 * Buy Now Functionality for Aziz Phone Hub
 * Handles direct checkout for products
 */

/**
 * Redirects to checkout page with the selected product
 * @param {string} productId - The ID of the product to buy
 */
function buyNow(productId) {
    // Prevent default behavior if called from an event
    if (event) event.preventDefault();
    
    console.log('Buy Now clicked for product:', productId);
    
    // Get product details from the page or fetch from Firestore
    let product;
    
    // Try to find product in current page products
    if (typeof allCategoryProducts !== 'undefined') {
        product = allCategoryProducts.find(p => p.id === productId);
    }
    
    // If product not found on page, fetch from Firestore
    if (!product && window.db) {
        // Show loading toast
        showToast('Preparing checkout...', 'info');
        
        // Get product from Firestore
        window.db.collection('products').doc(productId).get()
            .then(doc => {
                if (doc.exists) {
                    const productData = doc.data();
                    proceedToCheckout({
                        id: doc.id,
                        name: productData.name,
                        price: productData.price,
                        image: productData.image,
                        quantity: 1
                    });
                } else {
                    console.error('Product not found in Firestore');
                    showToast('Error: Product not found', 'error');
                }
            })
            .catch(error => {
                console.error('Error getting product:', error);
                showToast('Error preparing checkout', 'error');
            });
    } else if (product) {
        // Proceed to checkout with the product
        proceedToCheckout({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    } else {
        console.error('Product not found and Firestore not available');
        showToast('Error: Product not found', 'error');
    }
    
    return false;
}

/**
 * Proceeds to checkout with the selected product
 * @param {Object} product - The product to checkout
 */
function proceedToCheckout(product) {
    // Create a temporary cart with just this product
    const tempCart = [product];
    
    // Store the temporary cart in sessionStorage
    sessionStorage.setItem('buyNowCart', JSON.stringify(tempCart));
    
    // Redirect to checkout page
    window.location.href = 'checkout.html?buyNow=true';
}

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} icon - The icon type (success, error, warning, info)
 */
function showToast(message, icon) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    } else {
        // Fallback to alert if SweetAlert is not available
        alert(message);
    }
}

// Add event listeners to Buy Now buttons
document.addEventListener('DOMContentLoaded', function() {
    // Find all Buy Now buttons
    const buyNowButtons = document.querySelectorAll('.buy-now');
    
    // Add click event listener to each button
    buyNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            buyNow(productId);
        });
    });
});
