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
    
    // Get product details from static-products.js
    let product = window.products && window.products[productId];
    
    if (product) {
        // Proceed to checkout with the product
        proceedToCheckout({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    } else {
        console.error('Product not found in static-products.js');
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
