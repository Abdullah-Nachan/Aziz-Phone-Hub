// Home page script to handle dynamic offers and other functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize featured products
    initializeFeaturedProducts();

    // Initialize Hero Swiper Slider with a slight delay
    setTimeout(initializeHeroSwiper, 100);
});

// Function to initialize featured products
function initializeFeaturedProducts() {
    // Get all add to cart buttons in featured products
    const addToCartButtons = document.querySelectorAll('.featured-products-row .add-to-cart');
    const buyNowButtons = document.querySelectorAll('.featured-products-row .buy-now');
    const likeButtons = document.querySelectorAll('.featured-products-row .like-btn');
    
    // Add event listeners to add to cart buttons
    addToCartButtons.forEach(button => {
        // Remove existing event listeners
        button.replaceWith(button.cloneNode(true));
    });
    
    // Re-add event listeners
    document.querySelectorAll('.featured-products-row .add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            
            // Add to cart
            if (typeof cart !== 'undefined' && cart.addItem(productId)) {
                // Show success message
                Swal.fire({
                    title: 'Added to cart!',
                    text: 'The item has been added to your cart.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    });
    
    // Add event listeners to buy now buttons
    buyNowButtons.forEach(button => {
        // Remove existing event listeners
        button.replaceWith(button.cloneNode(true));
    });
    
    // Re-add event listeners
    document.querySelectorAll('.featured-products-row .buy-now').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            
            if (typeof cart !== 'undefined') {
                // Clear cart first
                cart.clearCart();
                
                // Add to cart
                if (cart.addItem(productId)) {
                    // Redirect to checkout
                    window.location.href = 'checkout.html';
                }
            }
        });
    });
    
    // Add event listeners to like buttons
    likeButtons.forEach(button => {
        // Get the onclick attribute
        const onclickAttr = button.getAttribute('onclick');
        
        // If it has an onclick attribute, remove it and add an event listener instead
        if (onclickAttr) {
            button.removeAttribute('onclick');
            
            // Extract product ID from the onclick attribute
            const match = onclickAttr.match(/toggleWishlist\(this,\s*['"](.*?)['"]\)/);
            if (match && match[1]) {
                const productId = match[1];
                button.dataset.productId = productId;
                
                // Add active class if product is in wishlist
                if (typeof wishlist !== 'undefined' && wishlist.hasItem(productId)) {
                    button.classList.add('active');
                }
            }
        }
    });
    
    // Re-add event listeners to like buttons
    document.querySelectorAll('.featured-products-row .like-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.dataset.productId;
            
            if (typeof wishlist !== 'undefined' && productId) {
                // Toggle wishlist item
                const isAdded = wishlist.toggleItem(productId);
                
                // Update button state
                if (isAdded) {
                    this.classList.add('active');
                    
                    // Show success message
                    Swal.fire({
                        title: 'Added to wishlist!',
                        text: 'The item has been added to your wishlist.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    this.classList.remove('active');
                    
                    // Show success message
                    Swal.fire({
                        title: 'Removed from wishlist!',
                        text: 'The item has been removed from your wishlist.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        });
    });
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


import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

document.addEventListener("DOMContentLoaded", () => {
  // Get desktop header profile dropdown buttons
  const desktopLoginBtn = document.getElementById("loginSignupBtn");
  const desktopLogoutBtn = document.getElementById("logoutBtn");
  // Get mobile header profile dropdown buttons
  const mobileLoginBtn = document.getElementById("mobileLoginSignupBtn");
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

  function updateAuthUI(user) {
    const isLoggedIn = !!user;

    // Control visibility of desktop header buttons
    if (desktopLoginBtn) desktopLoginBtn.style.display = isLoggedIn ? "none" : "block";
    if (desktopLogoutBtn) desktopLogoutBtn.style.display = isLoggedIn ? "block" : "none";
    // Control visibility of mobile header buttons
    if (mobileLoginBtn) mobileLoginBtn.style.display = isLoggedIn ? "none" : "block";
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = isLoggedIn ? "block" : "none";

    const handleLogout = () => {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Logout?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel"
        }).then((result) => {
          if (result.isConfirmed) {
            signOut(auth).then(() => window.location.reload());
          }
        });
      } else {
        if (confirm("Are you sure you want to logout?")) {
          signOut(auth).then(() => window.location.reload());
        }
      }
    };

    if (isLoggedIn) {
      // Attach logout listener to desktop logout button if not already attached
      if (desktopLogoutBtn && !desktopLogoutBtn.dataset.listenerAttached) {
        desktopLogoutBtn.addEventListener("click", handleLogout);
        desktopLogoutBtn.dataset.listenerAttached = "true";
      }

      // Attach logout listener to mobile logout button if not already attached
      if (mobileLogoutBtn && !mobileLogoutBtn.dataset.listenerAttached) {
        mobileLogoutBtn.addEventListener("click", handleLogout);
        mobileLogoutBtn.dataset.listenerAttached = "true";
      }
    }
  }

  onAuthStateChanged(auth, (user) => {
    console.log("Firebase user:", user?.email || "Not logged in");
    updateAuthUI(user);
  });
});
