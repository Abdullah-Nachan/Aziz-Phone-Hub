// guest-cart-wishlist.js
// Handles Add to Cart and Wishlist for guests (not signed in)
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
        const addToCartBtn = e.target.closest('.add-to-cart, .add-to-cart-btn');
        const likeBtn = e.target.closest('.like-btn, .btn-wishlist');
        if (addToCartBtn || likeBtn) {
            // Check if user is signed in (Firebase Auth)
            if (typeof firebase !== 'undefined' && firebase.auth && !firebase.auth().currentUser) {
                e.preventDefault();
                e.stopPropagation();
                Swal.fire({
                    title: 'Sign In Required',
                    text: 'Please sign in to use this feature.',
                    icon: 'info',
                    confirmButtonText: 'Sign In',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'auth.html';
                    }
                });
            }
        }
    }, true);
}); 