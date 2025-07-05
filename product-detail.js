/**
 * Product Detail Page for Aziz Phone Hub
 * Handles product detail display and interactions
 */
console.log('product-detail.js loaded');
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
    
    // Render Order Timeline Section
    renderOrderTimeline();

    // Cloudinary config
    const CLOUDINARY_CLOUD_NAME = 'dkcibdwm8'; // Your Cloudinary cloud name
    const CLOUDINARY_UPLOAD_PRESET = 'unsigned_reviews'; // Your unsigned upload preset
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

    // Review form elements
    const reviewForm = document.getElementById('write-review-form');
    const reviewsList = document.getElementById('reviewsList');
    const reviewerFirstNameInput = document.getElementById('reviewer-firstname');
    const reviewerLastNameInput = document.getElementById('reviewer-lastname');
    const reviewRatingInput = document.getElementById('review-rating');
    const reviewTextInput = document.getElementById('review-text');
    // Add a file input for media (images/videos)
    let reviewMediaInput = document.getElementById('review-media');
    if (!reviewMediaInput) {
        // If not present, create and insert it
        reviewMediaInput = document.createElement('input');
        reviewMediaInput.type = 'file';
        reviewMediaInput.id = 'review-media';
        reviewMediaInput.multiple = true;
        reviewMediaInput.accept = 'image/*,video/*';
        reviewMediaInput.className = 'form-control mb-3';
        // Insert before submit button
        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        reviewForm.insertBefore(reviewMediaInput, submitBtn);
    }

    // Handle review form submit
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const firstName = reviewerFirstNameInput.value.trim();
            const lastName = reviewerLastNameInput.value.trim();
            const rating = parseInt(reviewRatingInput.value);
            const text = reviewTextInput.value.trim();
            const files = reviewMediaInput.files;

            // Get user full name from Firebase Auth if available
            let userFirstName = firstName;
            let userLastName = lastName;
            const user = firebase.auth().currentUser;
            if (user && user.displayName) {
                const parts = user.displayName.split(' ');
                userFirstName = parts[0] || firstName;
                userLastName = parts.slice(1).join(' ') || lastName;
            }

            if (!userFirstName || !userLastName || !rating || !text) {
                alert('Please fill all fields and select a rating.');
                return;
            }

            // 1. Upload all media files to Cloudinary
            let mediaUrls = [];
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                    try {
                        const res = await fetch(CLOUDINARY_URL, {
                            method: 'POST',
                            body: formData
                        });
                        const data = await res.json();
                        if (data.secure_url) {
                            mediaUrls.push(data.secure_url);
                        }
                    } catch (err) {
                        console.error('Cloudinary upload error:', err);
                    }
                }
            }

            // 2. Store review in Firestore
            try {
                await firebase.firestore()
                    .collection('reviews')
                    .add({
                        productId: productId,
                        firstName: userFirstName,
                        lastName: userLastName,
                        rating: rating,
                        text: text,
                        mediaUrls: mediaUrls,
                        createdAt: new Date()
                    });
                alert('Review submitted!');
                reviewForm.reset();
                loadReviews();
            } catch (err) {
                alert('Error submitting review. Please try again.');
                console.error('Firestore review error:', err);
            }
        });
    }

    // --- Helper: getReviewDate ---
    function getReviewDate(review) {
        if (review.createdAt && typeof review.createdAt.toDate === 'function') return review.createdAt.toDate();
        if (review.createdAt && typeof review.createdAt === 'string') return new Date(review.createdAt);
        if (review.timestamp) return new Date(review.timestamp);
        return new Date();
    }

    // --- Review rendering function (must be defined before loadReviews) ---
    function renderReview(review, docId) {
        const fullName = [review.firstName, review.lastName].filter(Boolean).join(' ');
        const rating = parseInt(review.rating) || 0;
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item bg-white p-4 rounded shadow-sm mb-4';
        reviewItem.id = 'review-' + docId;
        reviewItem.innerHTML = `
            <div class="review-header d-flex justify-content-between align-items-center mb-3">
                <div class="reviewer-info">
                    <h5 class="mb-1">${fullName || 'Anonymous'}</h5>
                    <div class="rating-stars text-warning">
                        ${'<i class="fas fa-star"></i>'.repeat(rating)}${rating < 5 ? '<i class="far fa-star"></i>'.repeat(5-rating) : ''}
                    </div>
                </div>
                <div class="review-date text-muted">${timeAgo(getReviewDate(review))}</div>
            </div>
            <div class="review-content">
                <p>${review.text || ''}</p>
            </div>
        `;
        // Media
        if (review.mediaUrls && review.mediaUrls.length > 0) {
            const mediaDiv = document.createElement('div');
            mediaDiv.className = 'review-images mt-3';
            review.mediaUrls.forEach(url => {
                let mediaEl;
                if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                    mediaEl = document.createElement('img');
                    mediaEl.src = url;
                    mediaEl.className = 'review-image me-2 review-media-thumb';
                    mediaEl.removeAttribute('style');
                    mediaEl.style.cursor = 'pointer';
                    mediaEl.onclick = function() { showAllImagesModal([url]); };
                } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                    mediaEl = document.createElement('video');
                    mediaEl.src = url;
                    mediaEl.controls = true;
                    mediaEl.className = 'review-image me-2 review-media-thumb';
                    mediaEl.removeAttribute('style');
                }
                if (mediaEl) mediaDiv.appendChild(mediaEl);
            });
            reviewItem.appendChild(mediaDiv);
        }
        return reviewItem;
    }

    // --- Firestore reviews pagination ---
    let lastVisibleReview = null;
    let reviewsExhausted = false;
    let isLoadingReviews = false;
    let reviewsLoadedCount = 0;
    let showAllReviews = false; // Track whether to show all reviews
    const REVIEWS_INITIAL_DISPLAY = 4; // Number of reviews to show initially
    let reviewsQueryOrderField = 'timestamp'; // Change to 'createdAt' if needed

    async function loadReviews(initial = true) {
        if (!productId) return;
        if (isLoadingReviews || reviewsExhausted) return;
        isLoadingReviews = true;
        const reviewsList = document.getElementById('reviewsList');
        const mediaGallery = document.getElementById('review-media-gallery');
        if (initial) {
            reviewsList.innerHTML = '';
            if (mediaGallery) mediaGallery.innerHTML = '';
            lastVisibleReview = null;
            reviewsExhausted = false;
            reviewsLoadedCount = 0;
            showAllReviews = false; // Reset on initial load
        }
        let query = firebase.firestore()
            .collection('reviews')
            .where('productId', '==', productId)
            .orderBy(reviewsQueryOrderField, 'desc')
            .limit(100); // Fetch enough reviews for 'View All'
        if (lastVisibleReview) {
            query = query.startAfter(lastVisibleReview);
        }
        console.log('Querying reviews for productId:', productId);
        try {
            const reviewsSnap = await query.get();
            console.log('Reviews loaded:', reviewsSnap.size);
            if (reviewsSnap.empty) {
                // Fallback: fetch all reviews and filter by productId in JS
                console.warn('No reviews found with query. Trying fallback fetch-all.');
                const allReviewsSnap = await firebase.firestore().collection('reviews').get();
                const filteredReviews = [];
                allReviewsSnap.forEach(doc => {
                    const review = doc.data();
                    if (review.productId === productId) {
                        filteredReviews.push({ ...review, _docId: doc.id });
                    }
                });
                if (filteredReviews.length === 0) {
                    reviewsExhausted = true;
                    removeSeeMoreButton();
                    if (initial) {
                        reviewsList.innerHTML = '<div class="text-center">No reviews yet.</div>';
                        if (mediaGallery) mediaGallery.innerHTML = '';
                        updateReviewSummary([]);
                    }
                    isLoadingReviews = false;
                    return;
                }
                // Sort and render fallback reviews
                filteredReviews.sort((a, b) => getReviewDate(b) - getReviewDate(a));
                renderReviewsWithMediaGallery(filteredReviews, reviewsList, mediaGallery);
                isLoadingReviews = false;
                return;
            }
            let allReviews = [];
            let mediaReviews = [];
            let textReviews = [];
            let mediaItems = [];
            reviewsSnap.forEach(doc => {
                const review = doc.data();
                review.firstName = review.firstName || (review.name ? review.name.split(' ')[0] : '');
                review.lastName = review.lastName || (review.name ? review.name.split(' ').slice(1).join(' ') : '');
                review.text = review.text || review.comment || '';
                review._docId = doc.id;
                allReviews.push(review);
                if (review.mediaUrls && review.mediaUrls.length > 0) {
                    mediaReviews.push({ ...review, _docId: doc.id });
                    review.mediaUrls.forEach(url => mediaItems.push({ url, reviewId: doc.id }));
                } else {
                    textReviews.push({ ...review, _docId: doc.id });
                }
            });
            // Sort reviews by date
            allReviews.sort((a, b) => getReviewDate(b) - getReviewDate(a));
            mediaReviews.sort((a, b) => getReviewDate(b) - getReviewDate(a));
            textReviews.sort((a, b) => getReviewDate(b) - getReviewDate(a));
            // Render reviews and media gallery
            renderReviewsWithMediaGallery([...mediaReviews, ...textReviews], reviewsList, mediaGallery);
            if (initial) updateReviewSummary(allReviews);
        } catch (err) {
            reviewsList.innerHTML = '<div class="text-center text-danger">Error loading reviews.</div>';
            updateReviewSummary([]);
            console.error('Error loading reviews:', err);
        }
        isLoadingReviews = false;
    }

    // Helper to render reviews and media gallery with View All logic
    function renderReviewsWithMediaGallery(allReviews, reviewsList, mediaGallery) {
        // 1. Media Gallery: show all unique images from all reviews with images
        if (mediaGallery) {
            // Ensure the gallery is a clean grid, not a swiper or scroll
            mediaGallery.className = 'review-media-gallery';
            mediaGallery.innerHTML = '';
            const uniqueImages = new Set();
            allReviews.forEach(r => {
                if (r.mediaUrls && r.mediaUrls.length > 0) {
                    r.mediaUrls.forEach(url => {
                        if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) uniqueImages.add(url);
                    });
                }
            });
            const uniqueImagesArr = Array.from(uniqueImages);
            // 2 rows, 4 columns (8 total), last cell is show more if needed
            const maxGalleryImages = 7;
            let imagesToShow = uniqueImagesArr.slice(0, maxGalleryImages);
            imagesToShow.forEach((url, idx) => {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Review Image';
                img.className = 'review-media-thumb';
                img.style.cursor = 'pointer';
                img.onclick = function() {
                    showAllImagesModal([url]);
                };
                mediaGallery.appendChild(img);
            });
            if (uniqueImagesArr.length > maxGalleryImages) {
                const showMoreBox = document.createElement('div');
                showMoreBox.className = 'review-media-showmore';
                showMoreBox.textContent = `+${uniqueImagesArr.length - maxGalleryImages + 1} more`;
                showMoreBox.onclick = function() {
                    showAllImagesModal(uniqueImagesArr);
                };
                mediaGallery.appendChild(showMoreBox);
            }
        }
        // 2. Reviews: media reviews first, then text-only
        reviewsList.innerHTML = '';
        let reviewsToShow = allReviews;
        if (!showAllReviews) {
            reviewsToShow = allReviews.slice(0, REVIEWS_INITIAL_DISPLAY);
        }
        reviewsToShow.forEach(r => {
            try {
                reviewsList.appendChild(renderReview(r, r._docId));
            } catch (e) {
                console.error('Error rendering review:', r, e);
            }
        });
        // 3. View All Reviews button (move below reviews, above write review form)
        let viewAllBtn = document.getElementById('view-all-reviews-btn');
        if (!viewAllBtn) {
            viewAllBtn = document.createElement('button');
            viewAllBtn.id = 'view-all-reviews-btn';
            viewAllBtn.className = 'btn btn-outline-primary w-100 my-3';
            viewAllBtn.textContent = 'View All Reviews';
            viewAllBtn.onclick = function() {
                showAllReviews = true;
                renderReviewsWithMediaGallery(allReviews, reviewsList, mediaGallery);
            };
            // Insert after reviewsList, before write-review-form
            const writeReviewForm = document.getElementById('write-review-form');
            if (writeReviewForm && writeReviewForm.parentNode) {
                writeReviewForm.parentNode.insertBefore(viewAllBtn, writeReviewForm);
            } else if (reviewsList && reviewsList.parentNode) {
                reviewsList.parentNode.appendChild(viewAllBtn);
            }
        }
        if (!showAllReviews && allReviews.length > REVIEWS_INITIAL_DISPLAY) {
            viewAllBtn.style.display = '';
        } else {
            viewAllBtn.style.display = 'none';
        }
    }

    // Modal to show all images in gallery or a single image
    function showAllImagesModal(imagesArr) {
        let modal = document.getElementById('all-review-images-modal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'all-review-images-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.7)';
        modal.style.display = 'flex';
        modal.style.flexWrap = 'wrap';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
        const inner = document.createElement('div');
        inner.style.background = '#fff';
        inner.style.borderRadius = '10px';
        inner.style.padding = '24px';
        inner.style.maxWidth = '90vw';
        inner.style.maxHeight = '90vh';
        inner.style.overflow = 'auto';
        inner.style.display = 'flex';
        inner.style.flexWrap = 'wrap';
        inner.style.gap = '16px';
        imagesArr.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Review Image';
            img.style.width = '320px';
            img.style.height = '320px';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '8px';
            inner.appendChild(img);
        });
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.className = 'btn btn-secondary mt-3';
        closeBtn.style.display = 'block';
        closeBtn.onclick = function() { modal.remove(); };
        inner.appendChild(closeBtn);
        modal.appendChild(inner);
        document.body.appendChild(modal);
    }

    // --- See More Button Logic ---
    function showSeeMoreButton() {
        let seeMoreBtn = document.getElementById('see-more-reviews-btn');
        if (!seeMoreBtn) {
            seeMoreBtn = document.createElement('button');
            seeMoreBtn.id = 'see-more-reviews-btn';
            seeMoreBtn.className = 'btn btn-outline-primary w-100 my-3';
            seeMoreBtn.textContent = 'See More Reviews';
            seeMoreBtn.onclick = function() {
                loadReviews(false);
            };
            const reviewsList = document.getElementById('reviewsList');
            if (reviewsList) reviewsList.parentNode.appendChild(seeMoreBtn);
        } else {
            seeMoreBtn.style.display = '';
        }
    }
    function removeSeeMoreButton() {
        const seeMoreBtn = document.getElementById('see-more-reviews-btn');
        if (seeMoreBtn) seeMoreBtn.style.display = 'none';
    }

    // Update the review summary and product rating display with real data
    function updateReviewSummary(reviews) {
        // Calculate average, count, and star breakdown
        const total = reviews.length;
        let sum = 0;
        const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            const rating = parseInt(r.rating) || 0;
            sum += rating;
            if (starCounts[rating] !== undefined) starCounts[rating]++;
        });
        const avg = total ? (sum / total) : 0;
        // Update average rating
        const avgRatingElem = document.getElementById('overall-rating');
        if (avgRatingElem) avgRatingElem.textContent = avg.toFixed(1);
        // Update star icons for summary
        const summaryStarsElem = document.getElementById('overall-rating-stars');
        if (summaryStarsElem) {
            summaryStarsElem.innerHTML = '';
            const fullStars = Math.floor(avg);
            for (let i = 0; i < fullStars; i++) summaryStarsElem.innerHTML += '<i class="fas fa-star"></i>';
            if (avg % 1 >= 0.5) summaryStarsElem.innerHTML += '<i class="fas fa-star-half-alt"></i>';
            for (let i = fullStars + (avg % 1 >= 0.5 ? 1 : 0); i < 5; i++) summaryStarsElem.innerHTML += '<i class="far fa-star"></i>';
        }
        // Update review count
        const countElem = document.getElementById('overall-rating-count');
        if (countElem) countElem.textContent = `Based on ${total} review${total === 1 ? '' : 's'}`;
        // Update star breakdown bars and percentages
        const barPercents = {
            5: total ? Math.round((starCounts[5] / total) * 100) : 0,
            4: total ? Math.round((starCounts[4] / total) * 100) : 0,
            3: total ? Math.round((starCounts[3] / total) * 100) : 0,
            2: total ? Math.round((starCounts[2] / total) * 100) : 0,
            1: total ? Math.round((starCounts[1] / total) * 100) : 0
        };
        // Update progress bars and percentages (if present)
        const barSelectors = [
            { star: 5, bar: '.rating-bar-item:nth-child(1) .progress-bar', percent: '.rating-bar-item:nth-child(1) .ms-2' },
            { star: 4, bar: '.rating-bar-item:nth-child(2) .progress-bar', percent: '.rating-bar-item:nth-child(2) .ms-2' },
            { star: 3, bar: '.rating-bar-item:nth-child(3) .progress-bar', percent: '.rating-bar-item:nth-child(3) .ms-2' },
            { star: 2, bar: '.rating-bar-item:nth-child(4) .progress-bar', percent: '.rating-bar-item:nth-child(4) .ms-2' },
            { star: 1, bar: '.rating-bar-item:nth-child(5) .progress-bar', percent: '.rating-bar-item:nth-child(5) .ms-2' }
        ];
        barSelectors.forEach(sel => {
            const bar = document.querySelector(sel.bar);
            const percent = document.querySelector(sel.percent);
            if (bar) bar.style.width = barPercents[sel.star] + '%';
            if (percent) percent.textContent = barPercents[sel.star] + '%';
        });
        // Update product name's rating stars and count
        const prodStarsElem = document.getElementById('product-rating-stars');
        if (prodStarsElem) {
            prodStarsElem.innerHTML = '';
            const fullStars = Math.floor(avg);
            for (let i = 0; i < fullStars; i++) prodStarsElem.innerHTML += '<i class="fas fa-star"></i>';
            if (avg % 1 >= 0.5) prodStarsElem.innerHTML += '<i class="fas fa-star-half-alt"></i>';
            for (let i = fullStars + (avg % 1 >= 0.5 ? 1 : 0); i < 5; i++) prodStarsElem.innerHTML += '<i class="far fa-star"></i>';
        }
        const prodCountElem = document.getElementById('product-rating-count');
        if (prodCountElem) prodCountElem.textContent = `(${total} rating${total === 1 ? '' : 's'})`;
    }

    // Helper: time ago formatting
    function timeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + ' year' + (interval > 1 ? 's' : '') + ' ago';
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + ' month' + (interval > 1 ? 's' : '') + ' ago';
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + ' day' + (interval > 1 ? 's' : '') + ' ago';
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + ' hour' + (interval > 1 ? 's' : '') + ' ago';
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + ' minute' + (interval > 1 ? 's' : '') + ' ago';
        return 'Just now';
    }

    // Initial load reviews at the very top
    loadReviews(true);

    // --- Rate Product Modal Logic ---
    function createRateProductModal() {
        if (document.getElementById('rate-product-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'rate-product-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.3)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
          <div style="background:#fff; border-radius:10px; padding:32px 24px; min-width:320px; max-width:90vw; box-shadow:0 4px 32px rgba(0,0,0,0.15); text-align:center;">
            <h4 class="mb-3">Rate this Product</h4>
            <div id="rate-stars" style="font-size:2rem; color:#ffc107; margin-bottom:16px;">
              <span class="star" data-star="1"><i class="far fa-star"></i></span>
              <span class="star" data-star="2"><i class="far fa-star"></i></span>
              <span class="star" data-star="3"><i class="far fa-star"></i></span>
              <span class="star" data-star="4"><i class="far fa-star"></i></span>
              <span class="star" data-star="5"><i class="far fa-star"></i></span>
            </div>
            <button id="submit-rate-btn" class="btn btn-primary w-100" disabled>Submit Rating</button>
            <button id="close-rate-modal" class="btn btn-link w-100 mt-2">Cancel</button>
          </div>
        `;
        document.body.appendChild(modal);
        let selected = 0;
        const starSpans = modal.querySelectorAll('#rate-stars .star');
        function updateStarClasses(rating) {
            starSpans.forEach((span, idx) => {
                const icon = span.querySelector('i');
                if (icon) {
                    if (idx < rating) {
                        icon.className = 'fas fa-star selected';
                    } else {
                        icon.className = 'far fa-star';
                        icon.classList.remove('selected');
                    }
                }
            });
        }
        starSpans.forEach((span, idx) => {
            span.addEventListener('mouseenter', function() {
                updateStarClasses(idx + 1);
            });
            span.addEventListener('mouseleave', function() {
                updateStarClasses(selected);
            });
            span.addEventListener('click', function() {
                selected = idx + 1;
                updateStarClasses(selected);
                modal.querySelector('#submit-rate-btn').disabled = selected === 0;
            });
        });
        // Submit logic
        modal.querySelector('#submit-rate-btn').onclick = async function() {
          if (!selected) return;
          try {
            await firebase.firestore()
              .collection('reviews')
              .doc('ratings')
              .collection('rating')
              .add({
                productId: productId,
                rating: selected
              });
            modal.querySelector('div').innerHTML = '<div class="py-4"><i class="fas fa-check-circle text-success fa-2x mb-2"></i><h5>Thank you for rating!</h5></div>';
            setTimeout(() => { if (modal) modal.remove(); }, 1200);
            loadReviews();
          } catch (err) {
            alert('Error submitting rating. Please try again.');
          }
        };
        // Close logic
        modal.querySelector('#close-rate-modal').onclick = function() {
          modal.remove();
        };
        // Also close on background click
        modal.onclick = function(e) {
          if (e.target === modal) modal.remove();
        };
    }
    // Attach to Rate Product button
    const rateBtn = document.getElementById('rate-product-btn');
    if (rateBtn) {
      rateBtn.onclick = function(e) {
        e.preventDefault();
        createRateProductModal();
      };
    }

    // --- Highlight effect for review form and reviews ---
    const style = document.createElement('style');
    style.innerHTML = `
    .highlight-review-form {
        box-shadow: 0 0 0 4px #ffe082;
        transition: box-shadow 0.3s;
    }
    .highlight-review {
        box-shadow: 0 0 0 4px #ffe082;
        transition: box-shadow 0.3s;
    }
    `;
    document.head.appendChild(style);

    // Initialize quantity controls
    initQuantityControls();
    
    // Initialize image gallery
    initImageGallery();
    
    // Render Order Timeline Section
    renderOrderTimeline();
});

// Load product details
function loadProductDetails(productId) {
    // Get product from static data
    const product = window.products && window.products[productId] ? window.products[productId] : null;
    if (product) {
        displayProductDetails(product);
        populateSimilarProducts(product.category, product.id);
        
        // Add specific event listeners for product page buttons
        setupProductPageEventListeners(product);
    } else {
        showProductNotFound();
    }
}

// Setup specific event listeners for product page
function setupProductPageEventListeners(product) {
    console.log('Setting up product page event listeners for product:', product.id);

    const addToCartBtn = document.getElementById('add-to-cart-bottom');
    const buyNowBtn = document.getElementById('buy-now-bottom');

    if (addToCartBtn) {
        // Remove any existing listeners
        const newAddToCartBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);

        // Add new listener
        newAddToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Always get productId from button attribute
            const btnProductId = this.getAttribute('data-product-id');
            let prod = window.products && window.products[btnProductId];
            if (!prod) {
                Swal.fire({
                    title: 'Error',
                    text: 'Product details not found. Please refresh the page.',
                    icon: 'error'
                });
                return;
            }

            // If user is authenticated, use Firestore
            if (firebase.auth().currentUser) {
                if (typeof window.addToCartFirestore === 'function') {
                    window.addToCartFirestore(prod, 1).then(() => {
                        // After Firestore update, reload cart and update badge
                        if (typeof loadCartItems === 'function') {
                            loadCartItems(); // This will update badge via firestore-cart.js
                        }
                        Swal.fire({
                            title: 'Added to Cart!',
                            text: `${prod.name} has been added to your cart.`,
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Cart function not available. Please try again.',
                        icon: 'error'
                    });
                }
                return;
            }

            // For guests
            const productData = {
                id: prod.id,
                name: prod.name,
                price: parseFloat(String(prod.price).replace(/[^0-9.]/g, '')),
                image: prod.image,
                quantity: 1
            };

            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(item => item.id === prod.id);
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            } else {
                cart.push(productData);
            }
            localStorage.setItem('cart', JSON.stringify(cart));

            Swal.fire({
                title: 'Added to Cart!',
                text: `${prod.name} has been added to your cart.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    if (buyNowBtn) {
        // Remove any existing listeners
        const newBuyNowBtn = buyNowBtn.cloneNode(true);
        buyNowBtn.parentNode.replaceChild(newBuyNowBtn, buyNowBtn);

        // Add new listener
        newBuyNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Always get productId from button attribute
            const btnProductId = this.getAttribute('data-product-id');
            let prod = window.products && window.products[btnProductId];
            if (!prod) {
                Swal.fire({
                    title: 'Error',
                    text: 'Product details not found. Please refresh the page.',
                    icon: 'error'
                });
                return;
            }

            // If user is authenticated, use Firestore
            if (firebase.auth().currentUser) {
                if (typeof window.addToCartFirestore === 'function') {
                    window.addToCartFirestore(prod, 1).then(() => {
                        if (typeof loadCartItems === 'function') {
                            loadCartItems();
                        }
                        window.location.href = 'checkout.html?buyNow=true';
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Cart function not available. Please try again.',
                        icon: 'error'
                    });
                }
                return;
            }

            // For guests
            const productData = {
                id: prod.id,
                name: prod.name,
                price: parseFloat(String(prod.price).replace(/[^0-9.]/g, '')),
                image: prod.image,
                quantity: 1
            };

            // Clear cart and add only this product
            localStorage.setItem('cart', JSON.stringify([productData]));

            // Redirect to checkout
            window.location.href = 'checkout.html?buyNow=true';
        });
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
    
    // Set product ID on buttons for event handlers
    const addToCartBtn = document.getElementById('add-to-cart-bottom');
    const buyNowBtn = document.getElementById('buy-now-bottom');
    
    if (addToCartBtn) {
        addToCartBtn.setAttribute('data-product-id', product.id);
        addToCartBtn.setAttribute('data-id', product.id);
        addToCartBtn.setAttribute('data-name', product.name);
        addToCartBtn.setAttribute('data-image', product.image);
        addToCartBtn.setAttribute('data-price', product.price);
        console.log('Add to Cart button configured with product ID:', product.id);
    }
    if (buyNowBtn) {
        buyNowBtn.setAttribute('data-product-id', product.id);
        buyNowBtn.setAttribute('data-id', product.id);
        buyNowBtn.setAttribute('data-name', product.name);
        buyNowBtn.setAttribute('data-image', product.image);
        buyNowBtn.setAttribute('data-price', product.price);
        console.log('Buy Now button configured with product ID:', product.id);
    }
    
    // Render detailed description section if present
    const detailedSection = document.getElementById('detailed-description-section');
    if (detailedSection) {
        if (product.detailedDescription && Array.isArray(product.detailedDescription.sections)) {
            let html = '<div class="detailed-description-card">';
            product.detailedDescription.sections.forEach(section => {
                if (section.type === 'text') {
                    html += `<div class="detailed-description-block detailed-description-text">${section.content}</div>`;
                } else if (section.type === 'image') {
                    html += `<div class="detailed-description-block detailed-description-image"><img src="${section.src}" alt="Product feature image" class="detailed-description-img"></div>`;
                }
            });
            html += '</div>';
            detailedSection.innerHTML = html;
        } else {
            detailedSection.innerHTML = '';
        }
    }
}

// Add this before DOMContentLoaded or before it is called
function initQuantityControls() {
    const minusBtn = document.getElementById('quantity-minus');
    const plusBtn = document.getElementById('quantity-plus');
    const qtyInput = document.getElementById('quantity-input');
    if (!minusBtn || !plusBtn || !qtyInput) return;
    minusBtn.onclick = function() {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
    };
    plusBtn.onclick = function() {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
    };
}

function initImageGallery() {
    // No-op: function intentionally left blank. Add gallery logic here if needed.
}

function renderOrderTimeline() {
    // No-op: function intentionally left blank. Add order timeline logic here if needed.
}
