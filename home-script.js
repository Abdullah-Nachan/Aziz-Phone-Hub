// Home page script to handle dynamic offers and other functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize featured products
    initializeFeaturedProducts();

    // Initialize Hero Swiper Slider with a slight delay
    setTimeout(initializeHeroSwiper, 100);
});

// Function to initialize featured products
function initializeFeaturedProducts() {
    // Use event delegation for featured products container
    const featuredProductsContainer = document.querySelector('.featured-products-row');
    if (!featuredProductsContainer) {
        console.error('Featured products container (.featured-products-row) not found.');
        return;
    }

    console.log('Attaching click listener to .featured-products-row');

    featuredProductsContainer.addEventListener('click', function(e) {
        console.log('Click detected inside featured products container.');
        
        const button = e.target.closest('.add-to-cart');
        if (!button) {
            return;
        }

        console.log('Add to Cart button was clicked.');

        e.preventDefault();
        const productId = button.dataset.productId;
        console.log('Product ID from button:', productId);

        const product = window.products && window.products[productId];
        console.log('Found product object:', product);

        if (product && typeof window.addToCartFirestore === 'function') {
            console.log('Calling addToCartFirestore...');
            window.addToCartFirestore(product, 1);
        } else {
            console.error('Could not add to cart. Product:', product, 'addToCartFirestore function exists:', typeof window.addToCartFirestore === 'function');
            Swal.fire('Error', 'Could not add item to cart. Please try again.', 'error');
        }
    });

    // Note: The logic for like and buy now buttons can be updated similarly if needed
    // For now, only updating Add to Cart as requested.
}

// Function to initialize Hero Swiper Slider
function initializeHeroSwiper() {
    // Add a visible error div if not present
    let errorDiv = document.getElementById('swiper-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'swiper-error';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.width = '100%';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.background = 'red';
        errorDiv.style.color = 'white';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.display = 'none';
        errorDiv.style.fontWeight = 'bold';
        errorDiv.style.padding = '8px 0';
        document.body.appendChild(errorDiv);
    }
    console.log('[Hero Swiper] Initializing...');
    if (typeof Swiper === 'undefined') {
        console.error('[Hero Swiper] Swiper is not defined!');
        errorDiv.textContent = 'Swiper is not defined! Check Swiper JS loading.';
        errorDiv.style.display = 'block';
        return;
    }
    if (!document.querySelector('.heroSwiper')) {
        console.error('[Hero Swiper] .heroSwiper element not found!');
        errorDiv.textContent = '.heroSwiper element not found!';
        errorDiv.style.display = 'block';
        return;
    }
    const heroSwiper = new Swiper('.heroSwiper', {
        loop: true,
        autoplay: {
            delay: 3000, // Auto cycle every 3 seconds
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            init: function() {
                console.log('[Hero Swiper] Swiper initialized!');
                errorDiv.style.display = 'none';
            },
            slideChange: function() {
                console.log('[Hero Swiper] Slide changed to', this.activeIndex);
            }
        }
    });
    heroSwiper.update();
    console.log('[Hero Swiper] Swiper instance:', heroSwiper);
}
