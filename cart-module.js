/**
 * Cart Module
 * Handles all cart-related functionality
 */

// Cart object with methods
const cartModule = (function() {
    // Private variables
    let items = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Private methods
    function save() {
        localStorage.setItem('cart', JSON.stringify(items));
    }
    
    // Public API
    return {
        // Add item to cart
        addItem: function(productId, quantity = 1) {
            console.log('Adding item to cart:', productId);
            
            // Find if item already exists in cart
            const existingItem = items.find(item => item.id === productId);
            
            if (existingItem) {
                // Update quantity if item exists
                existingItem.quantity += quantity;
            } else {
                // Add new item
                items.push({
                    id: productId,
                    quantity: quantity,
                    addedAt: new Date().toISOString()
                });
            }
            
            // Save to localStorage
            save();
            console.log('Cart updated:', items);
            return true;
        },
        
        // Get cart items
        getItems: function() {
            return items;
        },
        
        // Get cart count
        getCount: function() {
            return items.reduce((total, item) => total + item.quantity, 0);
        },
        
        // Clear cart
        clear: function() {
            items = [];
            save();
        },
        
        // Initialize cart
        init: function() {
            console.log('Cart module initialized');
            return this;
        }
    };
})();

// Initialize and expose cart
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    const cart = cartModule.init();
    
    // Make cart available globally
    window.cart = cart;
    
    console.log('Cart initialized and ready to use');
});
