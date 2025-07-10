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
    
    // Always define descriptionPoints at the top
    const descriptionPoints = product.description ? product.description.split('. ') : [];
    
    // Meta Pixel ViewContent Event
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_ids: [product.id],
            content_type: 'product',
            content_name: product.name,
            value: parseFloat(product.price.replace(/[^\d.]/g, '')),
            currency: 'INR',
            content_category: product.category || 'electronics'
        });
        console.log('Meta Pixel ViewContent event fired for:', product.name);
    }
    
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
    
    // Set product highlights from highlights array if available, else fallback to description
    const highlightsList = document.getElementById('product-highlights');
    highlightsList.innerHTML = '';
    if (Array.isArray(product.highlights) && product.highlights.length > 0) {
        product.highlights.forEach(point => {
            if (point && point.trim()) {
                const li = document.createElement('li');
                li.textContent = point.trim();
                highlightsList.appendChild(li);
            }
        });
    } else {
        // Fallback: Create highlights from description
        descriptionPoints.forEach(point => {
            if (point.trim()) {
                const li = document.createElement('li');
                li.textContent = point.trim() + (point.endsWith('.') ? '' : '.');
                highlightsList.appendChild(li);
            }
        });
    }
    
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
    
    // Create slides for each image or video
    productImages.forEach((imageUrl, index) => {
        // Ensure the image URL is properly formatted
        let processedUrl = imageUrl;
        if (processedUrl && !processedUrl.startsWith('http') && !processedUrl.startsWith('/') && !processedUrl.startsWith('data:')) {
            processedUrl = processedUrl.startsWith('./') ? processedUrl.substring(1) : 
                         processedUrl.startsWith('images/') ? '/' + processedUrl : 
                         processedUrl.startsWith('video/') ? '/' + processedUrl : 
                         `/images/${processedUrl}`;
        }

        // Create main slide
        const mainDiv = document.createElement('div');
        mainDiv.className = 'swiper-slide';

        if (processedUrl.match(/\.mp4$/i)) {
            // Video slide with GLightbox support
            const mainLink = document.createElement('a');
            mainLink.href = processedUrl;
            mainLink.className = 'glightbox-product';
            mainLink.setAttribute('data-type', 'video');
            mainLink.title = `${product.name} - Video ${index + 1}`;

            const video = document.createElement('video');
            video.src = processedUrl;
            video.controls = true;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.borderRadius = '20px';
            video.poster = 'https://placehold.co/600x400?text=Loading+Video';
            video.onerror = function() {
                this.poster = 'https://placehold.co/600x400?text=Video+Not+Available';
                this.src = '';
            };
            mainLink.appendChild(video);
            mainDiv.appendChild(mainLink);
        } else {
            // Image slide (with GLightbox)
            const mainLink = document.createElement('a');
            mainLink.href = processedUrl;
            mainLink.className = 'glightbox-product';
            mainLink.title = `${product.name} - Image ${index + 1}`;

            const mainImg = document.createElement('img');
            mainImg.src = processedUrl;
            mainImg.alt = `${product.name} - Image ${index + 1}`;
            mainImg.loading = 'lazy';
            mainImg.style.width = '100%';
            mainImg.style.height = 'auto';
            mainImg.style.objectFit = 'cover';
            mainImg.onerror = function() {
                this.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                this.onerror = null;
            };
            mainLink.appendChild(mainImg);
            mainDiv.appendChild(mainLink);
        }
        mainImageSwiper.appendChild(mainDiv);

        // Create thumbnail slide
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'swiper-slide';

        if (imageUrl.match(/\.mp4$/i)) {
            // Video thumbnail with play icon
            thumbDiv.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#eee;border-radius:10px;position:relative;">
                <i class='fas fa-play-circle fa-2x' style='color:#2563eb;'></i>
            </div>`;
        } else {
            const thumbImg = document.createElement('img');
            thumbImg.src = imageUrl;
            thumbImg.alt = `Thumbnail ${index + 1}`;
            thumbImg.onerror = function() {
                this.src = 'images/placeholder.svg';
            };
            thumbDiv.appendChild(thumbImg);
        }
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

// Show write-review form on button click
window.addEventListener('DOMContentLoaded', function() {
    var showBtn = document.getElementById('show-review-form-btn');
    var formContainer = document.getElementById('write-review-form-container');
    if (showBtn && formContainer) {
        showBtn.addEventListener('click', function() {
            showBtn.style.display = 'none';
            formContainer.style.display = 'block';
        });
    }
});

// Firestore review submit handler
window.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('write-review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const firstName = document.getElementById('reviewer-firstname').value.trim();
            const lastName = document.getElementById('reviewer-lastname').value.trim();
            const rating = document.getElementById('review-rating').value;
            const reviewText = document.getElementById('review-text').value.trim();

            // Get productId from URL
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');

            // Prepare review object
            const reviewData = {
                firstName,
                lastName,
                rating: Number(rating),
                reviewText,
                productId,
                createdAt: new Date().toISOString()
            };

            try {
                // Firestore: add to cust_reviews collection
                await firebase.firestore().collection('cust_reviews').add(reviewData);

                // Optionally: Show success message and reset form
                Swal.fire('Thank you!', 'Your review has been submitted.', 'success');
                reviewForm.reset();
                // Add new review to the top of the reviews list in the UI
                const reviewsList = document.getElementById('reviewsList');
                if (reviewsList) {
                    const reviewDiv = document.createElement('div');
                    reviewDiv.className = 'review-item bg-light p-3 mb-3 rounded shadow-sm';
                    reviewDiv.innerHTML = `
                        <div class="d-flex align-items-center mb-2">
                            <strong>${firstName} ${lastName}</strong>
                            <span class="ms-2 badge bg-primary">${'★'.repeat(Number(rating))}</span>
                        </div>
                        <div class="mb-1">${reviewText}</div>
                        <small class="text-muted">${new Date().toLocaleString()}</small>
                    `;
                    reviewsList.prepend(reviewDiv);
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to submit review. Please try again.', 'error');
                console.error('Error saving review:', error);
            }
        });
    }
});
