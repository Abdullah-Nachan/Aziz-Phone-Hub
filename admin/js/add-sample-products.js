/**
 * Add Sample Products to Firestore
 * This script adds sample products to Firestore for each category
 */

// Sample product data with placeholder images
const sampleProducts = [
    // Airpods Category
    {
        id: "airpods-pro-1",
        name: "AirPods Pro",
        image: "https://placehold.co/400x400?text=AirPods+Pro",
        images: [
            "https://placehold.co/400x400?text=AirPods+Pro+1",
            "https://placehold.co/400x400?text=AirPods+Pro+2",
            "https://placehold.co/400x400?text=AirPods+Pro+3",
            "https://placehold.co/400x400?text=AirPods+Pro+4"
        ],
        price: "₹1,499",
        description: "Premium wireless earbuds with active noise cancellation and transparency mode.",
        category: "airpods"
    },
    {
        id: "airpods-gen3",
        name: "AirPods 3rd Generation",
        image: "https://placehold.co/400x400?text=AirPods+3rd+Gen",
        images: [
            "https://placehold.co/400x400?text=AirPods+3rd+Gen+1",
            "https://placehold.co/400x400?text=AirPods+3rd+Gen+2",
            "https://placehold.co/400x400?text=AirPods+3rd+Gen+3"
        ],
        price: "₹999",
        description: "Third-generation AirPods with spatial audio and adaptive EQ for an immersive listening experience.",
        category: "airpods"
    },
    {
        id: "airpods-max",
        name: "AirPods Max",
        image: "https://placehold.co/400x400?text=AirPods+Max",
        images: [
            "https://placehold.co/400x400?text=AirPods+Max+1",
            "https://placehold.co/400x400?text=AirPods+Max+2",
            "https://placehold.co/400x400?text=AirPods+Max+3"
        ],
        price: "₹2,499",
        description: "Over-ear headphones with high-fidelity audio, active noise cancellation, and spatial audio.",
        category: "airpods"
    },
    
    // Smartwatches Category
    {
        id: "smartwatch-pro",
        name: "Smartwatch Pro",
        image: "https://placehold.co/400x400?text=Smartwatch+Pro",
        images: [
            "https://placehold.co/400x400?text=Smartwatch+Pro+1",
            "https://placehold.co/400x400?text=Smartwatch+Pro+2",
            "https://placehold.co/400x400?text=Smartwatch+Pro+3"
        ],
        price: "₹1,999",
        description: "Advanced smartwatch with health monitoring features and long battery life.",
        category: "smartwatches"
    },
    {
        id: "fitness-tracker",
        name: "Fitness Tracker Ultra",
        image: "https://placehold.co/400x400?text=Fitness+Tracker",
        images: [
            "https://placehold.co/400x400?text=Fitness+Tracker+1",
            "https://placehold.co/400x400?text=Fitness+Tracker+2",
            "https://placehold.co/400x400?text=Fitness+Tracker+3"
        ],
        price: "₹899",
        description: "Comprehensive fitness tracker with heart rate monitoring and sleep analysis.",
        category: "smartwatches"
    },
    {
        id: "smart-band",
        name: "Smart Band 5",
        image: "https://placehold.co/400x400?text=Smart+Band",
        images: [
            "https://placehold.co/400x400?text=Smart+Band+1",
            "https://placehold.co/400x400?text=Smart+Band+2",
            "https://placehold.co/400x400?text=Smart+Band+3"
        ],
        price: "₹599",
        description: "Affordable smart band with essential fitness tracking features.",
        category: "smartwatches"
    },
    
    // Shoes Category
    {
        id: "running-shoes",
        name: "Premium Running Shoes",
        image: "https://placehold.co/400x400?text=Running+Shoes",
        images: [
            "https://placehold.co/400x400?text=Running+Shoes+1",
            "https://placehold.co/400x400?text=Running+Shoes+2",
            "https://placehold.co/400x400?text=Running+Shoes+3"
        ],
        price: "₹1,299",
        description: "High-performance running shoes with superior cushioning and support.",
        category: "shoes"
    },
    {
        id: "casual-sneakers",
        name: "Casual Sneakers",
        image: "https://placehold.co/400x400?text=Casual+Sneakers",
        images: [
            "https://placehold.co/400x400?text=Casual+Sneakers+1",
            "https://placehold.co/400x400?text=Casual+Sneakers+2",
            "https://placehold.co/400x400?text=Casual+Sneakers+3"
        ],
        price: "₹899",
        description: "Stylish casual sneakers for everyday wear.",
        category: "shoes"
    },
    {
        id: "sports-shoes",
        name: "Sports Shoes Pro",
        image: "https://placehold.co/400x400?text=Sports+Shoes",
        images: [
            "https://placehold.co/400x400?text=Sports+Shoes+1",
            "https://placehold.co/400x400?text=Sports+Shoes+2",
            "https://placehold.co/400x400?text=Sports+Shoes+3"
        ],
        price: "₹1,499",
        description: "Professional sports shoes designed for maximum performance.",
        category: "shoes"
    },
    
    // Accessories Category
    {
        id: "phone-case",
        name: "Premium Phone Case",
        image: "https://placehold.co/400x400?text=Phone+Case",
        images: [
            "https://placehold.co/400x400?text=Phone+Case+1",
            "https://placehold.co/400x400?text=Phone+Case+2",
            "https://placehold.co/400x400?text=Phone+Case+3"
        ],
        price: "₹499",
        description: "Durable and stylish phone case with drop protection.",
        category: "accessories"
    },
    {
        id: "wireless-charger",
        name: "Fast Wireless Charger",
        image: "https://placehold.co/400x400?text=Wireless+Charger",
        images: [
            "https://placehold.co/400x400?text=Wireless+Charger+1",
            "https://placehold.co/400x400?text=Wireless+Charger+2",
            "https://placehold.co/400x400?text=Wireless+Charger+3"
        ],
        price: "₹799",
        description: "Fast wireless charger compatible with all Qi-enabled devices.",
        category: "accessories"
    },
    {
        id: "power-bank",
        name: "20000mAh Power Bank",
        image: "https://placehold.co/400x400?text=Power+Bank",
        images: [
            "https://placehold.co/400x400?text=Power+Bank+1",
            "https://placehold.co/400x400?text=Power+Bank+2",
            "https://placehold.co/400x400?text=Power+Bank+3"
        ],
        price: "₹999",
        description: "High-capacity power bank with fast charging support.",
        category: "accessories"
    }
];

// Function to add sample products to Firestore
function addSampleProducts() {
    // Check if Firebase is initialized
    if (!firebase || !firebase.apps.length) {
        showMessage('Firebase is not initialized', 'error');
        return;
    }
    
    // Get Firestore reference (use global reference if available)
    const productsRef = window.productsRef || firebase.firestore().collection('products');
    
    // Disable the add button during the process
    const addProductsBtn = document.getElementById('addProductsBtn');
    if (addProductsBtn) {
        addProductsBtn.disabled = true;
        addProductsBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Adding Products...';
    }
    
    // Show loading message
    showMessage('Adding sample products to Firestore...', 'info');
    
    // Counter for tracking progress
    let addedCount = 0;
    let errorCount = 0;
    let totalProducts = sampleProducts.length;
    
    // Add each product to Firestore one by one (to avoid overwhelming Firestore)
    const addProduct = (index) => {
        if (index >= sampleProducts.length) {
            // All products processed
            showMessage(`Added ${addedCount} products successfully. ${errorCount} failed.`, 
                       errorCount > 0 ? 'warning' : 'success');
            
            // Re-enable the add button
            if (addProductsBtn) {
                addProductsBtn.disabled = false;
                addProductsBtn.innerHTML = '<i class="fas fa-plus me-2"></i> Add Sample Products';
            }
            return;
        }
        
        const product = sampleProducts[index];
        
        // Add product to Firestore
        productsRef.doc(product.id).set({
            name: product.name,
            image: product.image,
            images: product.images,
            price: product.price,
            description: product.description,
            category: product.category,
            inStock: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log(`Added product: ${product.name}`);
            addedCount++;
            updateProgress(addedCount, errorCount, totalProducts);
            // Process next product
            setTimeout(() => addProduct(index + 1), 300); // Add a small delay to avoid overwhelming Firestore
        })
        .catch(error => {
            console.error(`Error adding product ${product.name}:`, error);
            errorCount++;
            updateProgress(addedCount, errorCount, totalProducts);
            // Process next product despite error
            setTimeout(() => addProduct(index + 1), 300);
        });
    };
    
    // Start adding products
    addProduct(0);
}

// Function to update progress
function updateProgress(addedCount, errorCount, total) {
    total = total || sampleProducts.length;
    const progress = ((addedCount + errorCount) / total) * 100;
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
    }
    
    // Update progress text
    const progressText = document.createElement('div');
    progressText.className = 'mt-2 small';
    progressText.textContent = `Progress: ${addedCount + errorCount} of ${total} (${addedCount} succeeded, ${errorCount} failed)`;
    
    // Add to message container
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        // Remove any existing progress text
        const existingText = messageContainer.querySelector('.small');
        if (existingText) {
            existingText.remove();
        }
        
        // Add new progress text
        messageContainer.appendChild(progressText);
    }
}

// Function to show message
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        const alertClass = `alert-${type === 'error' ? 'danger' : type}`;
        messageContainer.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Add click event listener to the add products button
    const addProductsBtn = document.getElementById('addProductsBtn');
    if (addProductsBtn) {
        addProductsBtn.addEventListener('click', function() {
            // Confirm before adding products
            if (confirm('This will add sample products to your Firestore database. Continue?')) {
                addSampleProducts();
            }
        });
    }
});
