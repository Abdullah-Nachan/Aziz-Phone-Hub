/**
 * Product Detail Page for Aziz Phone Hub
 * Handles product detail display and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        // Load product details
        loadProductDetails(productId);
    } else {
        // Show product not found message
        showProductNotFound();
    }
    
    // Setup event listeners
    setupEventListeners();
});

// Load product details
function loadProductDetails(productId) {
    // Get product from static data
    const product = window.products && window.products[productId] ? window.products[productId] : null;
    if (product) {
        displayProductDetails(product);
        loadSimilarProducts(product.category, product.id);
    } else {
        showProductNotFound();
    }
}


// Display product details
function displayProductDetails(product) {
    // Update page title
    document.title = `${product.name} - Aziz Phone Hub`;
    document.getElementById('product-title').textContent = `${product.name} - Aziz Phone Hub`;
    
    // Update product name
    document.getElementById('product-name').textContent = product.name;
    
    // Update product price
    const priceElement = document.getElementById('product-current-price');
    if (priceElement) {
        // Format the price - remove any existing rupee symbol and format the number
        let priceStr = String(product.price).trim();
        // Remove any existing rupee symbol and trim whitespace
        priceStr = priceStr.replace(/[₹,]/g, '').trim();
        const priceNum = parseFloat(priceStr) || 0;
        // Format the number with Indian locale and add a single Rupee symbol
        const formattedPrice = `₹${priceNum.toLocaleString('en-IN')}`;
        priceElement.textContent = formattedPrice;
    }
    
    // Update product description
    const descriptionElement = document.getElementById('product-description');
    if (descriptionElement) {
        descriptionElement.textContent = product.description;
    }
    
    // Update product images
    updateProductImages(product);
    
    // Update Add to Cart and Buy Now buttons with product ID
    const addToCartTop = document.getElementById('add-to-cart-top');
    const addToCartBottom = document.getElementById('add-to-cart-bottom');
    const buyNowTop = document.getElementById('buy-now-top');
    const buyNowBottom = document.getElementById('buy-now-bottom');

    // Remove existing onclick handlers
    if (addToCartTop) { addToCartTop.onclick = null; }
    if (addToCartBottom) { addToCartBottom.onclick = null; }
    if (buyNowTop) { buyNowTop.onclick = null; }
    if (buyNowBottom) { buyNowBottom.onclick = null; }

    // Add classes and data attributes for delegated event listeners
    if (addToCartTop) {
        addToCartTop.classList.add('add-to-cart');
        addToCartTop.dataset.productId = product.id;
    }
    if (addToCartBottom) {
        addToCartBottom.classList.add('add-to-cart');
        addToCartBottom.dataset.productId = product.id;
    }
    if (buyNowTop) {
        buyNowTop.classList.add('buy-now');
        buyNowTop.dataset.productId = product.id;
    }
    if (buyNowBottom) {
        buyNowBottom.classList.add('buy-now');
        buyNowBottom.dataset.productId = product.id;
    }
    
    // Show product details section
    document.getElementById('product-details').classList.remove('d-none');
}

// Update product images
function updateProductImages(product) {
    const mainSwiperContainer = document.getElementById('main-image-swiper');
    const thumbSwiperContainer = document.getElementById('thumbnail-swiper');
    
    if (!mainSwiperContainer || !thumbSwiperContainer) return;
    
    // Clear existing images
    mainSwiperContainer.innerHTML = '';
    thumbSwiperContainer.innerHTML = '';
    
    // Check if product has images
    const images = product.images || [product.image];
    
    if (images && images.length > 0) {
        // Add images to swipers
        images.forEach((image, index) => {
            // Add to main swiper
            const mainSlide = document.createElement('div');
            mainSlide.className = 'swiper-slide';
            mainSlide.innerHTML = `
                <a href="${image}" data-lightbox="product-gallery" data-title="${product.name}">
                    <img src="${image}" alt="${product.name} - Image ${index + 1}" class="img-fluid">
                </a>
            `;
            mainSwiperContainer.appendChild(mainSlide);
            
            // Add to thumbnail swiper
            const thumbSlide = document.createElement('div');
            thumbSlide.className = 'swiper-slide';
            thumbSlide.innerHTML = `
                <img src="${image}" alt="Thumbnail ${index + 1}" class="img-fluid">
            `;
            thumbSwiperContainer.appendChild(thumbSlide);
        });
        
        // Initialize Swiper
        initializeSwiper();
    } else {
        // Add placeholder image
        const mainSlide = document.createElement('div');
        mainSlide.className = 'swiper-slide';
        mainSlide.innerHTML = `
            <img src="images/placeholder.svg" alt="${product.name}" class="img-fluid">
        `;
        mainSwiperContainer.appendChild(mainSlide);
        
        const thumbSlide = document.createElement('div');
        thumbSlide.className = 'swiper-slide';
        thumbSlide.innerHTML = `
            <img src="images/placeholder.svg" alt="Thumbnail" class="img-fluid">
        `;
        thumbSwiperContainer.appendChild(thumbSlide);
        
        // Initialize Swiper
        initializeSwiper();
    }
}

// Initialize Swiper
function initializeSwiper() {
    // Initialize thumbnail swiper
    const thumbSwiper = new Swiper('.thumbSwiper', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
    });
    
    // Initialize main swiper
    const mainSwiper = new Swiper('.mainSwiper', {
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        thumbs: {
            swiper: thumbSwiper,
        },
    });
}

// Load similar products
function loadSimilarProducts(category, currentProductId) {
    const similarProductsContainer = document.querySelector('.similar-products-row');
    
    if (!similarProductsContainer) return;
    
    // Clear container
    similarProductsContainer.innerHTML = '';
    
    // Get products in the same category from static data
    if (!window.products) return;
    const similarProducts = Object.values(window.products).filter(
        p => p.category === category && p.id !== currentProductId
    ).slice(0, 8);

    if (similarProducts.length === 0) {
        similarProductsContainer.innerHTML = '<p class="text-center w-100">No similar products found</p>';
        return;
    }

    // Add similar products to container
    similarProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        // Format the price - remove any existing rupee symbol and format the number
        let priceStr = String(product.price).trim();
        // Remove any existing rupee symbol and trim whitespace
        priceStr = priceStr.replace(/[₹,]/g, '').trim();
        const priceNum = parseFloat(priceStr) || 0;
        // Format the number with Indian locale and add a single Rupee symbol
        const formattedPrice = `₹${priceNum.toLocaleString('en-IN')}`;
        productCard.innerHTML = `
            <div class="product-card-inner">
                <div class="product-image">
                    <a href="product.html?id=${product.id}">
                        <img src="${product.image || 'images/placeholder.svg'}" alt="${product.name}" class="img-fluid">
                    </a>
                </div>
                <div class="product-info">
                    <h3 class="product-title">
                        <a href="product.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="product-price">${formattedPrice}</div>
                </div>
            </div>
        `;
        similarProductsContainer.appendChild(productCard);
    });
}


// Show product not found message
function showProductNotFound() {
    document.getElementById('product-not-found').classList.remove('d-none');
    document.getElementById('product-details').classList.add('d-none');
}

// Setup event listeners
function setupEventListeners() {
    // Add event listeners for Add to Cart and Buy Now buttons
    // These will be added dynamically when the product is loaded
}

// Add to cart function
function addToCart(productId) {
    cart.addItem(productId);
    
    // Show success message
    Swal.fire({
        title: 'Added to Cart!',
        text: 'Product has been added to your cart.',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Go to Cart',
        cancelButtonText: 'Continue Shopping'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'cart.html';
        }
    });
}

// Buy now function
function buyNow(productId) {
    // Add to cart first
    cart.addItem(productId);
    
    // Redirect to checkout
    window.location.href = 'checkout.html';
}
