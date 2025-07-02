/**
 * Dynamic Product Page Script
 * This script handles loading product data from the URL parameter
 * and populating the product template with the appropriate content
 */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    console.log('Product ID from URL:', productId);

    if (!productId) {
        console.log('No product ID found in URL. Showing product not found.');
        showProductNotFound();
        return;
    }

    try {
        const product = getProductById(productId);
        console.log('Product fetched by ID:', product);
        if (product) {
            console.log('Product found. Populating details.');
            populateProductDetails(product);
            populateSimilarProducts(product.category, productId);
        } else {
            console.log('Product not found in database. Showing product not found.');
            showProductNotFound();
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        console.log('Error during product fetch. Showing product not found.');
        showProductNotFound();
    }
});

function getProductById(productId) {
    // Return product from static data
    return window.products && window.products[productId] ? window.products[productId] : null;
}

/**
 * Get products by category from static data
 * @param {string} category - The category to filter by
 * @returns {Array} - Array of products
 */
function getProductsByCategory(category) {
    // Return filtered products from static data
    if (!window.products) return [];
    return Object.values(window.products).filter(product => product.category === category);
}

/**
 * Shows the product not found message and hides the product details
 */
function showProductNotFound() {
    document.getElementById('product-not-found').classList.remove('d-none');
    document.getElementById('product-details').classList.add('d-none');
}

/**
 * Populates all product details with data from the product object
 * @param {Object} product - The product object containing all product data
 */
function populateProductDetails(product) {
    document.getElementById('product-not-found').classList.add('d-none');
    document.getElementById('product-details').classList.remove('d-none');
    // Set page title
    document.title = `${product.name} - Aziz Phone Hub`;
    document.getElementById('product-title').textContent = `${product.name} - Aziz Phone Hub`;
    
    // Set product name
    document.getElementById('product-name').textContent = product.name;
    
    // Set product ID on Add to Cart button
    var addToCartBtn = document.getElementById('add-to-cart-bottom');
    if (addToCartBtn) {
        addToCartBtn.setAttribute('data-product-id', product.id);
    }
    
    // Set product price information
    document.getElementById('product-current-price').textContent = product.price;
    
    // Hide original price and discount if not available
    const originalPriceElement = document.getElementById('product-original-price');
    const discountElement = document.getElementById('product-discount');
    originalPriceElement.style.display = 'none';
    discountElement.style.display = 'none';
    
    // Set default rating (4.5 stars)
    const defaultRating = 4.5;
    const defaultRatingCount = 120;
    populateRatingStars('product-rating-stars', defaultRating);
    document.getElementById('product-rating-count').textContent = `(${defaultRatingCount} ratings)`;
    
    // Set overall rating in reviews section
    document.getElementById('overall-rating').textContent = defaultRating;
    populateRatingStars('overall-rating-stars', defaultRating);
    document.getElementById('overall-rating-count').textContent = `Based on ${defaultRatingCount} reviews`;
    
    // Set product highlights from description
    const highlightsList = document.getElementById('product-highlights');
    highlightsList.innerHTML = '';
    
    // Create highlights from description
    const descriptionPoints = product.description.split('. ');
    descriptionPoints.forEach(point => {
        if (point.trim()) {
            const li = document.createElement('li');
            li.textContent = point.trim() + (point.endsWith('.') ? '' : '.');
            highlightsList.appendChild(li);
        }
    });
    
    // Set product description
    document.getElementById('product-description').textContent = product.description;
    
    // Set product features (use description points as features)
    const featuresList = document.getElementById('product-features');
    featuresList.innerHTML = '';
    
    // Add category as a feature
    const categoryLi = document.createElement('li');
    categoryLi.textContent = `Category: ${formatCategoryName(product.category)}`;
    featuresList.appendChild(categoryLi);
    
    // Add price as a feature
    const priceLi = document.createElement('li');
    priceLi.textContent = `Price: ${product.price}`;
    featuresList.appendChild(priceLi);
    
    // Add other features from description
    descriptionPoints.slice(0, 3).forEach(point => {
        if (point.trim()) {
            const li = document.createElement('li');
            li.textContent = point.trim() + (point.endsWith('.') ? '' : '.');
            featuresList.appendChild(li);
        }
    });
    
    // Set product specifications
    const specificationsTable = document.getElementById('product-specifications');
    specificationsTable.innerHTML = '';
    
    // Add basic specifications
    const specs = [
        ['Product ID', product.id],
        ['Name', product.name],
        ['Category', formatCategoryName(product.category)],
        ['Price', product.price]
    ];
    
    specs.forEach(([key, value]) => {
        const tr = document.createElement('tr');
        
        const tdKey = document.createElement('td');
        tdKey.textContent = key;
        
        const tdValue = document.createElement('td');
        tdValue.textContent = value;
        
        tr.appendChild(tdKey);
        tr.appendChild(tdValue);
        specificationsTable.appendChild(tr);
    });
    
    // Set product images using the images array
    const mainImageSwiper = document.getElementById('main-image-swiper');
    const thumbnailSwiper = document.getElementById('thumbnail-swiper');
    
    mainImageSwiper.innerHTML = '';
    thumbnailSwiper.innerHTML = '';
    
    // Use the images array if available, otherwise fall back to the single image
    let productImages = [];
    
    if (product.images && product.images.length > 0) {
        productImages = Array.isArray(product.images) ? product.images : [product.images];
    } else if (product.image) {
        productImages = [product.image];
    } else {
        // If no images are found, use a placeholder
        productImages = ['https://placehold.co/600x400?text=No+Image+Available'];
    }
    
    // Create slides for each image
    productImages.forEach((imageUrl, index) => {
        // Ensure the image URL is properly formatted
        let processedUrl = imageUrl;
        if (processedUrl && !processedUrl.startsWith('http') && !processedUrl.startsWith('/') && !processedUrl.startsWith('data:')) {
            // If it's a relative path, make sure it starts with a slash
            processedUrl = processedUrl.startsWith('./') ? processedUrl.substring(1) : 
                         processedUrl.startsWith('images/') ? '/' + processedUrl : 
                         `/images/${processedUrl}`;
        }
        
        // Create main image slide
        const mainDiv = document.createElement('div');
        mainDiv.className = 'swiper-slide';
        
        const mainImg = document.createElement('img');
        mainImg.src = processedUrl;
        mainImg.alt = `${product.name} - Image ${index + 1}`;
        mainImg.loading = 'lazy';
        mainImg.style.width = '100%';
        mainImg.style.height = 'auto';
        mainImg.style.objectFit = 'cover';
        mainImg.onerror = function() {
            console.error(`Failed to load image: ${processedUrl}`);
            this.src = 'https://placehold.co/600x400?text=Image+Not+Available';
            this.onerror = null; // Prevent infinite loop if placeholder also fails
        };
        
        mainDiv.appendChild(mainImg);
        mainImageSwiper.appendChild(mainDiv);
        
        // Create thumbnail slide
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'swiper-slide';
        
        const thumbImg = document.createElement('img');
        thumbImg.src = imageUrl;
        thumbImg.alt = `Thumbnail ${index + 1}`;
        thumbImg.onerror = function() {
            this.src = 'images/placeholder.svg';
            console.log(`Failed to load thumbnail: ${imageUrl}. Using placeholder.`);
        };
        
        thumbDiv.appendChild(thumbImg);
        thumbnailSwiper.appendChild(thumbDiv);
    });
    
    // Reinitialize swiper after adding images
    if (window.mainSwiper) {
        window.mainSwiper.destroy(true, true);
    }
    if (window.thumbSwiper) {
        window.thumbSwiper.destroy(true, true);
    }
    initializeSwiper();
    
    // Hide color variants section as we don't have this data
    const colorVariantsList = document.getElementById('product-colors');
    if (colorVariantsList) {
        colorVariantsList.parentElement.style.display = 'none';
    }
}

/**
 * Creates and populates star rating elements based on the rating value
 * @param {string} elementId - The ID of the element to populate with stars
 * @param {number} rating - The rating value (e.g., 4.5)
 */
function populateRatingStars(elementId, rating) {
    const starsContainer = document.getElementById(elementId);
    starsContainer.innerHTML = '';
    
    // Create full stars
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star';
        starsContainer.appendChild(star);
    }
    
    // Create half star if needed
    if (rating % 1 >= 0.5) {
        const halfStar = document.createElement('i');
        halfStar.className = 'fas fa-star-half-alt';
        starsContainer.appendChild(halfStar);
    }
    
    // Create empty stars to fill up to 5
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        const emptyStar = document.createElement('i');
        emptyStar.className = 'far fa-star';
        starsContainer.appendChild(emptyStar);
    }
}

/**
 * Formats a category name for display (capitalizes first letter of each word)
 * @param {string} category - The category name to format
 * @returns {string} The formatted category name
 */
function formatCategoryName(category) {
    if (!category) return '';
    
    return category.split('-').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

/**
 * Populates the similar products section with products from the same category
 * @param {string} category - The category of the current product
 * @param {string} currentProductId - The ID of the current product to exclude
 */
// Track similar products state
const similarProductsState = {
    isLoading: false,
    lastCategory: null,
    lastProductId: null,
    isInitialized: false
};

// Debounce function to prevent rapid multiple calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced version of populateSimilarProducts
const debouncedPopulateSimilarProducts = debounce(async (category, currentProductId) => {
    // If we're already loading or already showing this exact product, skip
    if (similarProductsState.isLoading || 
        (similarProductsState.lastCategory === category && 
         similarProductsState.lastProductId === currentProductId)) {
        console.log('Skipping duplicate similar products load for:', { category, currentProductId });
        return;
    }
    
    // Update state
    similarProductsState.isLoading = true;
    similarProductsState.lastCategory = category;
    similarProductsState.lastProductId = currentProductId;
    
    console.log('Loading similar products for:', { category, currentProductId });
    
    // Get the container for similar products
    const similarProductsContainer = document.querySelector('.similar-products-row');
    const similarProductsSection = document.querySelector('.similar-products');
    
    if (!similarProductsContainer || !similarProductsSection) {
        console.log('Containers not found');
        similarProductsState.isLoading = false;
        return;
    }
    
    // Clear any existing content first
    similarProductsContainer.innerHTML = '';
    
    // Show loading state
    similarProductsContainer.innerHTML = `
        <div class="col-12 text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading similar products...</span>
            </div>
        </div>`;
    
    try {
        console.log('Fetching similar products for category:', category);
        const similarProducts = getProductsByCategory(category);
        console.log('Raw similar products from API:', similarProducts);
        
        // Log all product IDs before filtering
        console.log('All product IDs before filtering:', similarProducts.map(p => p.id));
        
        // Filter out the current product and any duplicates
        const uniqueProducts = [];
        const productIds = new Set();
        
        similarProducts.forEach((product, index) => {
            console.log(`Processing product ${index + 1}:`, { id: product.id, name: product.name });
            if (product.id !== currentProductId && !productIds.has(product.id)) {
                productIds.add(product.id);
                uniqueProducts.push(product);
                console.log('Added product:', product.id);
            } else {
                console.log('Skipped duplicate/current product:', product.id);
            }
        });
        
        console.log('Final unique product IDs:', Array.from(productIds));
        
        // If no similar products, hide the section
        if (uniqueProducts.length === 0) {
            console.log('No similar products found, hiding section');
            similarProductsSection.style.display = 'none';
            return;
        }
        
        // Update section title to be more specific
        const sectionTitle = similarProductsSection.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.textContent = `Similar ${formatCategoryName(category)}`;
        }
        
        // Clear container again before adding new products
        similarProductsContainer.innerHTML = '';
        
        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Track added product IDs to prevent duplicates
        const addedProductIds = new Set();
        
        // Create product cards for each similar product
        uniqueProducts.forEach(product => {
            // Skip if we've already added this product
            if (addedProductIds.has(product.id)) {
                console.log('Skipping duplicate product:', product.id);
                return;
            }
            
            // Mark this product as added
            addedProductIds.add(product.id);
            
            // Create product card with data attribute for tracking
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.productId = product.id;
            
            // Create product link
            const productLink = document.createElement('a');
            productLink.href = `product.html?id=${product.id}`;
            productLink.className = 'text-decoration-none d-block h-100';
            
            // Create product image container
            const imageContainer = document.createElement('div');
            imageContainer.className = 'product-image';
            
            // Create product image with error handling
            const image = document.createElement('img');
            image.src = product.image || 'https://placehold.co/300x300?text=No+Image';
            image.alt = product.name || 'Product Image';
            image.loading = 'lazy';
            image.className = 'img-fluid';
            image.onerror = function() {
                this.src = 'https://placehold.co/300x300?text=Image+Not+Available';
            };
            
            // Create product info container
            const infoContainer = document.createElement('div');
            infoContainer.className = 'product-info';
            
            // Create product name
            const name = document.createElement('h3');
            name.className = 'h6 mb-2';
            name.textContent = product.name || 'Unnamed Product';
            
            // Create product price
            const price = document.createElement('p');
            price.className = 'price mb-0';
            // Remove any existing Rupee symbol and add only one
            const priceValue = product.price ? String(product.price).replace(/[₹,]/g, '') : '';
            price.textContent = priceValue ? `₹${priceValue}` : 'Price not available';
            
            // Assemble the card
            imageContainer.appendChild(image);
            infoContainer.appendChild(name);
            infoContainer.appendChild(price);
            
            productLink.appendChild(imageContainer);
            productLink.appendChild(infoContainer);
            productCard.appendChild(productLink);
            
            // Add the card to the fragment
            fragment.appendChild(productCard);
        });
        
        // Append all products at once for better performance
        similarProductsContainer.appendChild(fragment);

        console.log(`Added ${addedProductIds.size} unique products to the similar products section`);

        // Initialize navigation
        setupSimilarProductsNavigation();

        // Update state
        similarProductsState.isLoading = false;
        similarProductsState.isInitialized = true;

        // Show the section
        similarProductsSection.style.display = 'block';
    } catch (error) {
        console.error('Error loading similar products:', error);
        similarProductsSection.style.display = 'none';
        similarProductsState.isLoading = false;
    }
}, 300);

// Set up navigation for similar products
function setupSimilarProductsNavigation() {
    const container = document.querySelector('.similar-products-row');
    const prevButton = document.querySelector('.similar-products .swiper-navigation .similar-swiper-prev');
    const nextButton = document.querySelector('.similar-products .swiper-navigation .similar-swiper-next');
    const scrollAmount = 300; // Adjust this value based on your card width
    
    if (!container || !prevButton || !nextButton) return;
    
    // Update button states on load
    updateButtonStates();
    
    // Add scroll event to update button states
    container.addEventListener('scroll', updateButtonStates);
    
    // Previous button click handler
    prevButton.addEventListener('click', () => {
        container.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Next button click handler
    nextButton.addEventListener('click', () => {
        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Update button states based on scroll position
    function updateButtonStates() {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        
        // Show/hide previous button
        if (scrollLeft <= 10) {
            prevButton.classList.add('invisible');
        } else {
            prevButton.classList.remove('invisible');
        }
        
        // Show/hide next button
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
            nextButton.classList.add('invisible');
        } else {
            nextButton.classList.remove('invisible');
        }
    }
}

// Main function that will be called from outside
function populateSimilarProducts(category, currentProductId) {
    // Call the debounced version
    debouncedPopulateSimilarProducts(category, currentProductId);
}

/**
 * Initializes the Swiper components for product images
 */
function initializeSwiper() {
    // Initialize thumbnail swiper
    window.thumbSwiper = new Swiper('.thumbSwiper', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
    });
    
    // Initialize main swiper
    window.mainSwiper = new Swiper('.mainSwiper', {
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        thumbs: {
            swiper: window.thumbSwiper,
        },
    });
    
    // Initialize similar products swiper if needed
    if (document.querySelector('.similar-products-swiper')) {
        new Swiper('.similar-products-swiper', {
            slidesPerView: 1,
            spaceBetween: 10,
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                },
            },
            navigation: {
                nextEl: '.similar-swiper-next',
                prevEl: '.similar-swiper-prev',
            },
        });
    }
}

// --- GLOBAL STUBS FOR CART HANDLER ---
window.addToCartFirestore = async function(product, quantity) {
    // For now, just log and resolve
    console.log('addToCartFirestore called with:', product, quantity);
    // Simulate async Firestore write
    return Promise.resolve();
};

window.showError = function(title, message) {
    alert(title + ': ' + message);
};
