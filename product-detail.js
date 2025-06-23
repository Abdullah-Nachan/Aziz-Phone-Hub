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
    
    // Initialize quantity controls
    initQuantityControls();
    
    // Initialize image gallery
    initImageGallery();
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
        descriptionElement.textContent = product.description || 'No description available';
    }
    
    // Update product specifications
    const specsElement = document.getElementById('product-specs');
    if (specsElement && product.specifications) {
        specsElement.innerHTML = ''; // Clear existing specs
        Object.entries(product.specifications).forEach(([key, value]) => {
            const specItem = document.createElement('div');
            specItem.className = 'spec-item';
            specItem.innerHTML = `
                <span class="spec-label">${key}:</span>
                <span class="spec-value">${value}</span>
            `;
            specsElement.appendChild(specItem);
        });
    }
    
    // Update product images
    updateProductImages(product);
    
    // Update Add to Cart and Buy Now buttons
    updateProductButtons(product);
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

// Update product buttons
function updateProductButtons(product) {
    const addToCartTop = document.getElementById('add-to-cart-top');
    const addToCartBottom = document.getElementById('add-to-cart-bottom');
    const buyNowTop = document.getElementById('buy-now-top');
    const buyNowBottom = document.getElementById('buy-now-bottom');

    // Remove existing onclick handlers to prevent duplicates
    [addToCartTop, addToCartBottom, buyNowTop, buyNowBottom].forEach(btn => {
        if (btn) {
            btn.onclick = null;
            btn.removeAttribute('onclick');
        }
    });

    // Add classes and data attributes for delegated event listeners
    [addToCartTop, addToCartBottom].forEach(btn => {
        if (btn) {
            btn.classList.add('add-to-cart', 'add-to-cart-btn');
            btn.dataset.productId = product.id;
            // Add icon if not already present
            if (!btn.querySelector('i.fa-shopping-cart')) {
                btn.innerHTML = `<i class="fas fa-shopping-cart me-2"></i>${btn.textContent}`;
            }
        }
    });

    // Handle Buy Now buttons
    [buyNowTop, buyNowBottom].forEach(btn => {
        if (btn) {
            btn.classList.add('buy-now');
            btn.dataset.productId = product.id;
            btn.onclick = async function() {
                // User check
                const user = firebase.auth().currentUser;
                if (!user) {
                    if (typeof showLoginRequiredMessage === 'function') {
                        showLoginRequiredMessage();
                    } else {
                        alert('Please log in to continue.');
                    }
                    return;
                }
                // Cart clear + add only this product
                const userRef = firebase.firestore().collection('users').doc(user.uid);
                // Always store price as number
                let priceNum = product.price;
                if (typeof priceNum === 'string') {
                    priceNum = parseFloat(priceNum.replace(/[^0-9.]/g, ''));
                }
                if (isNaN(priceNum)) priceNum = 0;
                const cartItems = [{
                    id: product.id,
                    image: product.image,
                    name: product.name,
                    price: priceNum,
                    quantity: 1
                }];
                await userRef.update({ cart: cartItems });
                // Redirect to checkout
                window.location.href = 'checkout.html';
            };
        }
    });
    
    // Show product details section
    document.getElementById('product-details').classList.remove('d-none');
}

// Initialize quantity controls
function initQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    
    if (quantityInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            quantityInput.value = currentValue + 1;
        });
    }
}

// Initialize image gallery
function initImageGallery() {
    // Initialize lightbox if available
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true,
            'showImageNumberLabel': false,
            'disableScrolling': true
        });
    }
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
    ).slice(0, 4);

    if (similarProducts.length === 0) {
        similarProductsContainer.innerHTML = '<p class="text-center w-100">No similar products found</p>';
        return;
    }

    // Add similar products to container
    similarProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col-md-3 col-6 mb-4';
        // Format the price
        let priceStr = String(product.price).trim();
        priceStr = priceStr.replace(/[₹,]/g, '').trim();
        const priceNum = parseFloat(priceStr) || 0;
        const formattedPrice = `₹${priceNum.toLocaleString('en-IN')}`;
        
        productCard.innerHTML = `
            <div class="product-card">
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
                    <button class="btn btn-primary add-to-cart-btn w-100 mt-2" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                    </button>
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

// Add to cart function
function addToCart(productId, quantity = 1) {
    if (typeof window.addToCartFirestore === 'function') {
        const product = window.products && window.products[productId];
        if (product) {
            window.addToCartFirestore(product, quantity);
        }
    } else {
        console.error('addToCartFirestore function not found');
    }
}

// Buy now function
function buyNow(productId, quantity = 1) {
    // Add to cart first
    addToCart(productId, quantity);
    
    // Redirect to checkout
    window.location.href = 'checkout.html';
}