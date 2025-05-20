// Initialize AOS
AOS.init({
    duration: 800,
    once: true
});

// Initialize Swiper for Hero Section
const heroSwiper = new Swiper('.hero-swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 5000,
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
});

// Initialize Offers Swiper
const offersSwiper = new Swiper('.offersSwiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    centeredSlides: true,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    }
});

// Add to Cart Functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const productName = this.closest('.product-info').querySelector('h3').textContent;
        const productPrice = this.closest('.product-info').querySelector('.price').textContent;
        
        Swal.fire({
            title: 'Added to Cart!',
            text: `${productName} (${productPrice}) has been added to your cart.`,
            icon: 'success',
            confirmButtonText: 'Continue Shopping',
            confirmButtonColor: '#2563eb'
        });
    });
});

// Newsletter Form Submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        Swal.fire({
            title: 'Thank You!',
            text: 'You have successfully subscribed to our newsletter.',
            icon: 'success',
            confirmButtonText: 'Great!',
            confirmButtonColor: '#2563eb'
        });
        
        this.reset();
    });
}

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});

// Search Functionality for both desktop and mobile
const searchForms = document.querySelectorAll('.search-box-form');
searchForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = this.querySelector('input');
        const searchTerm = input.value.trim();
        if (searchTerm) {
            console.log('Searching for:', searchTerm);
            // Add your search functionality here
        }
    });
});

// Initialize Lightbox
lightbox.option({
    'resizeDuration': 200,
    'wrapAround': true,
    'albumLabel': 'Image %1 of %2'
});

// Mobile Menu Toggle
const navbarToggler = document.querySelector('.navbar-toggler');
const navbarCollapse = document.querySelector('.navbar-collapse');

if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', function() {
        navbarCollapse.classList.toggle('show');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navbarCollapse.contains(e.target) && !navbarToggler.contains(e.target)) {
            navbarCollapse.classList.remove('show');
        }
    });
}

// Category Card Hover Effect
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Product Image Zoom Effect
document.querySelectorAll('.product-image').forEach(image => {
    image.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    image.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}); 