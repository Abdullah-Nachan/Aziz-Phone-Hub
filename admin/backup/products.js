/**
 * Product data store
 * Contains all product information from Firestore database
 * Structured for use with dynamic product.html and category.html pages
 */

// Initialize empty products object
if (!window.products) window.products = {

  "airpods01": {
    id: "airpods01",
    name: "AirPods Gen 4 (ANC)",
    image: "images/placeholder.svg",
    images: [
      "images/placeholder.svg",
      "images/airpods-images/airpods_gen4/1.webp",
      "images/airpods-images/airpods_gen4/2.webp",
      "images/airpods-images/airpods_gen4/3.webp",
      "images/airpods-images/airpods_gen4/4.webp",
      "images/airpods-images/airpods_gen4/5.webp",
      "images/airpods-images/airpods_gen4/6.webp",
      "images/airpods-images/airpods_gen4/7.webp"
    ],
    price: "₹1,799",
    description: "The latest AirPods with Active Noise Cancellation for immersive sound experience.",
    category: "airpods"
  },
  "airpods-pro-2": {
    id: "airpods-pro-2",
    name: "AirPods Pro 2",
    image: "images/placeholder.svg",
    images: [
      "images/placeholder.svg",
      "images/airpods-images/aripods_pro2/1.webp",
      "images/airpods-images/aripods_pro2/2.webp",
      "images/airpods-images/aripods_pro2/3.webp",
      "images/airpods-images/aripods_pro2/4.webp",
      "images/airpods-images/aripods_pro2/5.webp",
      "images/airpods-images/aripods_pro2/6.webp",
      "images/airpods-images/aripods_pro2/7.webp"
    ],
    price: "₹999",
    description: "Premium wireless earbuds with active noise cancellation and transparency mode.",
    category: "airpods"
  },
  "airpods-pro-2-display": {
    id: "airpods-pro-2-display",
    name: "AirPods Pro 2 with Display",
    image: "images/placeholder.svg",
    images: [
      "images/placeholder.svg\,
      "images/airpods-images/airpods_display/1.webp",
      "images/airpods-images/airpods_display/2.webp",
      "images/airpods-images/airpods_display/3.webp",
      "images/airpods-images/airpods_display/4.webp",
      "images/airpods-images/airpods_display/5.webp",
      "images/airpods-images/airpods_display/6.webp",
      "images/airpods-images/airpods_display/7.webp"
    ],
    price: "₹1,499",
    description: "AirPods Pro 2 with LED display on the charging case to show battery status and notifications.",
    category: "airpods"
  },
  "airpods-3": {
    id: "airpods-3",
    name: "AirPods 3rd Generation",
    image: "images/placeholder.svg",
    images: [
      "images/placeholder.svg",
      "images/airpods-images/airpods_3buds/1.webp",
      "images/airpods-images/airpods_3buds/2.webp",
      "images/airpods-images/airpods_3buds/3.webp",
      "images/airpods-images/airpods_3buds/4.webp",
      "images/airpods-images/airpods_3buds/5.webp",
      "images/airpods-images/airpods_3buds/6.webp",
      "images/airpods-images/airpods_3buds/7.webp"
    ],
    price: "₹949",
    description: "Third-generation AirPods with spatial audio and adaptive EQ for an immersive listening experience.",
    category: "airpods"
  },
  "airpods-2": {
    id: "airpods-2",
    name: "AirPods 2nd Generation",
    image: "images/placeholder.svg",
    images: [
      "images/placeholder.svg",
      "images/airpods-images/airpods_2buds/1.webp",
      "images/airpods-images/airpods_2buds/2.webp",
      "images/airpods-images/airpods_2buds/3.webp",
      "images/airpods-images/airpods_2buds/4.webp",
      "images/airpods-images/airpods_2buds/5.webp",
      "images/airpods-images/airpods_2buds/6.webp"
    ],
    price: "₹949",
    description: "Second-generation AirPods with H1 chip for faster wireless connection and 'Hey Siri' support.",
    category: "airpods"
  },
  "galaxy-buds-2-pro": {
    id: "galaxy-buds-2-pro",
    name: "Samsung Galaxy Buds 2 Pro",
    image: "images/placeholder.svg",
    images: [
      "images/placeholder.svg",
      "images/airpods-images/galaxy_buds2_pro/1.webp",
      "images/airpods-images/galaxy_buds2_pro/2.webp",
      "images/airpods-images/galaxy_buds2_pro/3.webp",
      "images/airpods-images/galaxy_buds2_pro/4.webp",
      "images/airpods-images/galaxy_buds2_pro/5.webp",
      "images/airpods-images/galaxy_buds2_pro/6.webp",
      "images/airpods-images/galaxy_buds2_pro/7.webp"
    ],
    price: "₹999",
    description: "Samsung's premium wireless earbuds with intelligent ANC and high-quality sound.",
    category: "airpods"
  },
  "airpods-max": {
    id: "airpods-max",
    name: "AirPods Max",
    image: "images/headphone_airpods_max.jpg",
    price: "₹1,999",
    description: "Over-ear headphones with high-fidelity audio, active noise cancellation, and spatial audio.",
    category: "headphones"
  },
  "bose-qc-ultra": {
    id: "bose-qc-ultra",
    name: "Bose QC Ultra",
    image: "images/headphone_bose_qc_ultra.jpg",
    price: "₹1,699",
    description: "Premium noise-cancelling headphones with exceptional sound quality and comfort.",
    category: "headphones"
  },
  "samsung-watch-ultra": {
    id: "samsung-watch-ultra",
    name: "Samsung Watch Ultra",
    image: "images/smartwatch_samsung_ultra.jpg",
    price: "₹1,499",
    description: "Premium smartwatch with advanced health monitoring and fitness tracking features.",
    category: "smartwatches"
  },
  "active-2-smartwatch": {
    id: "active-2-smartwatch",
    name: "Active 2 Smartwatch",
    image: "images/smartwatch_active2.jpeg",
    price: "₹1,499",
    description: "Fitness-focused smartwatch with heart rate monitoring and activity tracking.",
    category: "smartwatches"
  },
  "gen-9-pro": {
    id: "gen-9-pro",
    name: "Gen 9 Pro Bluetooth Calling Smartwatch",
    image: "images/smartwatch_gen9pro.jpeg",
    price: "₹1,450",
    description: "Feature-rich smartwatch with Bluetooth calling and health monitoring capabilities.",
    category: "smartwatches"
  },
  "t10-ultra": {
    id: "t10-ultra",
    name: "T10 Ultra Bluetooth Smartwatch",
    image: "images/smartwatch_t10ultra.jpeg",
    price: "₹649",
    description: "Affordable smartwatch with essential features and long battery life.",
    category: "smartwatches"
  },
  "z86-pro-max": {
    id: "z86-pro-max",
    name: "Z86 Pro Max Smartwatch",
    image: "images/smartwatch_z86promax.jpeg",
    price: "₹1,599",
    description: "Advanced smartwatch with large display and comprehensive health tracking features.",
    category: "smartwatches"
  },
  "apple-watch-series-10": {
    id: "apple-watch-series-10",
    name: "Apple Watch Series 10",
    image: "images/smartwatch_series10.jpg",
    images: [
      "images/smartwatch_series10.jpg",
      "images/AppleWatch Series 10.jpeg",
      "images/Apple watch series 9.jpeg",
      "images/SmartWatch.jpeg",
      "images/watch.jpeg",
      "images/offer series9 and airpods2.jpg"
    ],
    price: "₹3,999",
    description: "The latest Apple Watch with advanced health monitoring and fitness tracking features.",
    category: "watches"
  },
  "hk9-ultra": {
    id: "hk9-ultra",
    name: "HK9 Ultra Smartwatch",
    image: "images/smartwatch_hk9.jpg",
    images: [
      "images/smartwatch_hk9.jpg",
      "images/smartwatch_active2.jpeg",
      "images/smartwatch_samsung_ultra.jpg",
      "images/smartwatch_t10ultra.jpeg",
      "images/SmartWatch.jpeg"
    ],
    price: "₹1,899",
    description: "Premium smartwatch with ultra-bright display and health monitoring features.",
    category: "smartwatches"
  },
  "s9-pro-max": {
    id: "s9-pro-max",
    name: "S9 Pro Max Smartwatch",
    image: "images/smartwatch_s9promax.jpeg",
    images: [
      "images/smartwatch_s9promax.jpeg",
      "images/smartwatch_gen9pro.jpeg",
      "images/smartwatch_active2.jpeg",
      "images/smartwatch_t10ultra.jpeg",
      "images/SmartWatch.jpeg"
    ],
    price: "₹1,799",
    description: "Feature-rich smartwatch with large display and comprehensive health tracking.",
    category: "smartwatches"
  },
  "x90-max": {
    id: "x90-max",
    name: "X90 Max Smartwatch",
    image: "images/smartwatch_x90max.jpeg",
    images: [
      "images/smartwatch_x90max.jpeg",
      "images/smartwatch_z86promax.jpeg",
      "images/smartwatch_gen16pro.jpeg",
      "images/smartwatch_active2.jpeg",
      "images/SmartWatch.jpeg"
    ],
    price: "₹1,299",
    description: "Advanced smartwatch with comprehensive health monitoring features.",
    category: "smartwatches"
  },
  "nike-vomero-black": {
    id: "nike-vomero-black",
    name: "Nike Zoom Vomero Triple Black",
    image: "images/shoes_nike_vomero_black.jpg",
    price: "₹1,999",
    description: "Premium running shoes with responsive cushioning and sleek all-black design.",
    category: "shoes"
  },
  "nike-vomero-white": {
    id: "nike-vomero-white",
    name: "Nike Zoom Vomero White-Black",
    image: "images/shoes_nike_vomero_white.jpg",
    price: "₹1,999",
    description: "Stylish running shoes with responsive cushioning in a classic white and black colorway.",
    category: "shoes"
  },
  "puma-suede-crush": {
    id: "puma-suede-crush",
    name: "Puma XL Suede Crush Black White",
    image: "images/shoes_puma_suede.jpg",
    price: "₹1,899",
    description: "Classic Puma suede sneakers with a platform sole and timeless black and white design.",
    category: "shoes"
  },
  "nike-airmax": {
    id: "nike-airmax",
    name: "Nike Air Max 90",
    image: "images/shoes_nike_airmax.jpg",
    images: [
      "images/shoes_nike_airmax.jpg",
      "images/shoes_nike_vomero_white.jpg",
      "images/shoes_nike_vomero_black.jpg",
      "images/shoes_puma_suede.jpg",
      "images/nike air force 1.jpeg",
      "images/shoes.jpeg"
    ],
    price: "₹2,499",
    description: "Classic Nike Air Max 90 sneakers with comfortable cushioning and stylish design.",
    category: "shoes"
  },
  "nike-dunk-unc": {
    id: "nike-dunk-unc",
    name: "Nike Dunk Low UNC",
    image: "images/shoes_nike_dunk.jpg",
    images: [
      "images/shoes_nike_dunk.jpg",
      "images/shoes_nike_airmax.jpg",
      "images/shoes_nike_vomero_white.jpg",
      "images/shoes_nike_vomero_black.jpg",
      "images/nike air force 1.jpeg",
      "images/shoes.jpeg"
    ],
    price: "₹2,999",
    description: "Nike Dunk Low in University Blue colorway, a classic basketball-inspired sneaker.",
    category: "shoes"
  },
  "boss-hugo": {
    id: "boss-hugo",
    name: "Boss Hugo",
    image: "images/watch_boss.jpg",
    price: "₹1,799",
    description: "Elegant Boss Hugo watch with premium materials and sophisticated design.",
    category: "casualwatch"
  },
  "cartier-roman": {
    id: "cartier-roman",
    name: "Cartier Roman Dial",
    image: "images/watch_cartier.jpg",
    price: "₹1,799",
    description: "Luxurious Cartier watch with classic Roman numeral dial and timeless design.",
    category: "casualwatch"
  },
  "gshock-manga": {
    id: "gshock-manga",
    name: "G-Shock Manga Edition",
    image: "images/watch_gshock.jpg",
    price: "₹1,799",
    description: "Limited edition G-Shock watch with manga-inspired design and rugged durability.",
    category: "casualwatch"
  },
  "omega-seamaster": {
    id: "omega-seamaster",
    name: "Omega Seamaster",
    image: "images/watch_omega.jpg",
    price: "₹1,799",
    description: "Iconic Omega Seamaster watch with professional diving features and elegant styling.",
    category: "casualwatch"
  },
  "tissot-trace": {
    id: "tissot-trace",
    name: "Tissot T-race Chronograph",
    image: "images/watch_tissot.jpg",
    price: "₹1,599",
    description: "Sports-inspired Tissot chronograph watch with racing design elements.",
    category: "casualwatch"
  },
  "crocs-literide-360": {
    id: "crocs-literide-360",
    name: "Crocs LiteRide 360",
    image: "images/crocs_literide360.jpeg",
    images: [
      "images/crocs_literide360.jpeg",
      "images/placeholder.svg",
      "images/placeholder.svg",
      "images/crocs_bayband_flip.jpeg",
      "images/crocs_bayband_slide.jpeg",
      "images/placeholder.svg"
    ],
    price: "₹1,299",
    description: "Comfortable and lightweight Crocs LiteRide 360 with responsive cushioning.",
    category: "crocs"
  },
  "bayband": {
    id: "bayband",
    name: "Crocs Bayaband Clog",
    image: "images/placeholder.svg",
    images: [
      "images/placeholder.svg",
      "images/crocs_bayband_flip.jpeg",
      "images/crocs_bayband_slide.jpeg",
      "images/placeholder.svg",
      "images/crocs_literide360.jpeg",
      "images/placeholder.svg"
    ],
    price: "₹999",
    description: "Classic Crocs Bayaband Clog with sporty stripe and unmatched comfort.",
    category: "crocs"
  },
  "bayband-flip": {
    id: "bayband-flip",
    name: "Crocs Bayaband Flip",
    image: "images/placeholder.svg",
    images: [
      "images/crocs_bayband_flip.jpeg",
      "images/placeholder.svg",
      "images/crocs_bayband_slide.jpeg",
      "images/placeholder.svg",
      "images/crocs_literide360.jpeg",
      "images/placeholder.svg"
    ],
    price: "₹999",
    description: "Comfortable flip-flop style Crocs with the signature Bayaband design.",
    category: "crocs"
  },
  "yukon": {
    id: "yukon",
    name: "Crocs Yukon",
    image: "images/placeholder.svg",
    images: [
      "images/placeholder.svg",
      "images/placeholder.svg",
      "images/placeholder.svg",
      "images/placeholder.svg",
      "images/placeholder.svg"
    ],
    price: "₹1,899",
    description: "Rugged Crocs design with leather upper for a more refined look.",
    category: "crocs"
  },
  "apple-power-adapter": {
    id: "apple-power-adapter",
    name: "Apple 20W USB-C Power Adapter",
    image: "images/moreproduct_adapter.jpg",
    images: [
      "images/moreproduct_adapter.jpg",
      "images/apple adapter.jpeg",
      "images/adapter.jpeg",
      "images/moreproduct_cable.jpg",
      "images/moreproduct_cable_C.jpeg"
    ],
    price: "₹549",
    description: "Fast-charging Apple 20W USB-C power adapter for iPhone, iPad, and AirPods.",
    category: "accessories"
  },
  "type-c-cable": {
    id: "type-c-cable",
    name: "Apple Type C to C Cable",
    image: "images/placeholder.svg",
    price: "₹999",
    description: "High-quality USB-C to USB-C cable for fast charging and data transfer.",
    category: "accessories"
  },
  "type-c-lightning-cable": {
    id: "type-c-lightning-cable",
    name: "Apple Type C to Lightning Cable",
    image: "images/placeholder.svg",
    images: [
      "images/moreproduct_cable.jpg",
      "images/moreproduct_cable_C.jpeg",
      "images/apple adapter.jpeg",
      "images/adapter.jpeg",
      "images/moreproduct_adapter.jpg"
    ],
    price: "₹399",
    description: "Original Apple USB-C to Lightning cable for fast charging your iPhone or iPad.",
    category: "accessories"
  },
  "magsafe": {
    id: "magsafe",
    name: "Apple MagSafe Battery Pack 5000 Mah",
    image: "images/magsafe.jpeg",
    price: "₹799",
    description: "MagSafe Battery Pack for iPhone with 5000mAh capacity for on-the-go charging.",
    category: "accessories"
  }
};

/**
 * Get all products as an array
 * @returns {Array} Array of all product objects
 */
function getAllProducts() {
  return Object.values(products);
}

/**
 * Get products filtered by category
 * @param {string} category - Category name to filter by
 * @returns {Array} Array of product objects in the specified category
 */
function getProductsByCategory(category) {
  return Object.values(products).filter(product => product.category === category);
}

/**
 * Get a product by its ID
 * @param {string} id - Product ID to look up
 * @returns {Object|null} Product object or null if not found
 */
function getProductById(id) {
  return products[id] || null;
}

/**
 * Get a list of all available categories
 * @returns {Array} Array of unique category names
 */
function getAllCategories() {
  const categories = new Set(Object.values(products).map(product => product.category));
  return Array.from(categories);
}

// Load products from Firestore
function loadProductsFromFirestore() {
  if (typeof productsRef === 'undefined' || !productsRef) {
    // Firestore not available, use mock data
    updateProductUI();
    return Promise.resolve(products);
  }
  return productsRef.get().then(snapshot => {
    // Clear existing products
    products = {};
    // Add each product from Firestore to the products object
    snapshot.forEach(doc => {
      const productData = doc.data();
      products[doc.id] = {
        id: doc.id,
        name: productData.name,
        image: productData.image,
        images: productData.images || [productData.image],
        price: productData.price,
        description: productData.description,
        category: productData.category
      };
    });
    // Update UI if we're on a product-related page
    updateProductUI();
    return products;
  }).catch(error => {
    console.error('Error loading products:', error);
    return {};
  });
}

// Set up real-time listener for product updates
function setupProductsListener() {
  if (typeof productsRef === 'undefined' || !productsRef) {
    // Firestore not available, skip listener
    return;
  }
  productsRef.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      const productData = change.doc.data();
      const productId = change.doc.id;
      if (change.type === 'added' || change.type === 'modified') {
        // Add or update product
        products[productId] = {
          id: productId,
          name: productData.name,
          image: productData.image,
          images: productData.images || [productData.image],
          price: productData.price,
          description: productData.description,
          category: productData.category
        };
      } else if (change.type === 'removed') {
        // Remove product
        delete products[productId];
      }
    });
    // Update UI if we're on a product-related page
    updateProductUI();
  }, error => {
    console.error('Error listening to products:', error);
  });
}

// Update UI based on current page
function updateProductUI() {
  // Check if we're on the product page
  const productContainer = document.getElementById('product-details');
  if (productContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId && products[productId]) {
      displayProductDetails(products[productId]);
    }
  }
  
  // Check if we're on the category page
  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      displayCategoryProducts(category);
    }
  }
  
  // Check if we're on the home page
  const featuredProducts = document.getElementById('featured-products');
  if (featuredProducts) {
    displayFeaturedProducts();
  }
}

// Initialize products when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load products from Firestore
  loadProductsFromFirestore();
  
  // Set up real-time listener
  setupProductsListener();
});

// Export the products object and helper functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { products, getAllProducts, getProductsByCategory, getProductById, getAllCategories, loadProductsFromFirestore };
}
