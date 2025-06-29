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
        // Add item to cart with full product details
        addItem: function(product, quantity = 1) {
            console.log('Adding item to cart:', product);
            
            // Find if item already exists in cart
            const existingItem = items.find(item => item.id === product.id);
            
            if (existingItem) {
                // Update quantity if item exists
                existingItem.quantity += quantity;
            } else {
                // Add new item with full product details
                items.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
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
        
        // Get cart total
        getTotal: function() {
            return items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        
        // Clear cart
        clear: function() {
            items = [];
            save();
        },
        
        // Initialize cart
        init: function() {
            console.log('Cart module initialized with items:', items);
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
