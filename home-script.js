// Home page script to handle dynamic offers and other functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize featured products
    initializeFeaturedProducts();

    // Initialize Hero Swiper Slider with a slight delay
    setTimeout(initializeHeroSwiper, 100);

    // Review Image Modal Logic
    const modal = document.getElementById('reviewImageModal');
    const modalImg = document.getElementById('reviewImageModalImg');
    const closeBtn = document.querySelector('.review-image-modal-close');
    if (!modal || !modalImg || !closeBtn) return;
    // Open modal on image click
    document.querySelectorAll('.review-image').forEach(img => {
        img.addEventListener('click', function(e) {
            console.log('Review image clicked:', this.src);
            modal.classList.add('show');
            modal.style.display = 'flex';
            modalImg.src = this.src;
        });
    });
    // Close modal on close button
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modalImg.src = '';
    });
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            modalImg.src = '';
        }
    });

    // Review Image Row Navigation
    const reviewWrapper = document.querySelector('.review-images-wrapper');
    const prevBtn = document.querySelector('.swiper-prev-review');
    const nextBtn = document.querySelector('.swiper-next-review');
    if (reviewWrapper && prevBtn && nextBtn) {
        function getCardWidth() {
            const card = reviewWrapper.querySelector('.review-image-card');
            if (card) return card.offsetWidth + parseInt(getComputedStyle(reviewWrapper).gap || 0);
            return 200;
        }
        prevBtn.addEventListener('click', function() {
            reviewWrapper.scrollBy({ left: -getCardWidth() * 3, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', function() {
            reviewWrapper.scrollBy({ left: getCardWidth() * 3, behavior: 'smooth' });
        });
    }

    // Video Modal Logic (moved from index.html)
    const videoModalEl = document.getElementById('videoModal');
    if (videoModalEl) {
        const videoModal = new bootstrap.Modal(videoModalEl);
        const modalVideo = document.getElementById('modalVideo');
        let isInPipMode = false;

        async function togglePictureInPicture(video) {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                    isInPipMode = false;
                } else if (document.pictureInPictureEnabled) {
                    await video.requestPictureInPicture();
                    isInPipMode = true;
                    video.addEventListener('leavepictureinpicture', () => {
                        isInPipMode = false;
                    }, { once: true });
                }
            } catch (error) {
                console.error('Error toggling Picture-in-Picture:', error);
            }
        }

        function handleVideoClick(e, video) {
            if (e.target.tagName === 'VIDEO' && e.target.controls) return;
            if (isInPipMode) {
                togglePictureInPicture(video);
                return;
            }
            const source = video.querySelector('source');
            if (source) {
                while (modalVideo.firstChild) {
                    modalVideo.removeChild(modalVideo.firstChild);
                }
                const newSource = document.createElement('source');
                newSource.src = source.src;
                newSource.type = source.type;
                modalVideo.appendChild(newSource);
                videoModal.show();
                videoModal._element.addEventListener('shown.bs.modal', function onShown() {
                    modalVideo.play();
                    videoModal._element.removeEventListener('shown.bs.modal', onShown);
                    if (document.pictureInPictureEnabled) {
                        const pipButton = document.createElement('button');
                        pipButton.className = 'pip-button';
                        pipButton.innerHTML = '&#xe63b;';
                        pipButton.style.cssText = `
                            position: absolute;
                            right: 60px;
                            top: 15px;
                            z-index: 10;
                            background: rgba(0,0,0,0.5);
                            border: none;
                            color: white;
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-family: 'Material Icons';
                            font-size: 18px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        `;
                        pipButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            togglePictureInPicture(modalVideo);
                        });
                        videoModal._element.querySelector('.modal-content').appendChild(pipButton);
                    }
                }, { once: true });
                videoModal._element.addEventListener('hidden.bs.modal', function onHidden() {
                    if (!isInPipMode) {
                        modalVideo.pause();
                        modalVideo.currentTime = 0;
                    }
                    const pipButton = videoModal._element.querySelector('.pip-button');
                    if (pipButton) pipButton.remove();
                    videoModal._element.removeEventListener('hidden.bs.modal', onHidden);
                }, { once: true });
            }
        }

        document.querySelectorAll('.video-container').forEach(container => {
            const video = container.querySelector('video');
            if (video) {
                container.addEventListener('click', (e) => handleVideoClick(e, video));
                let clickCount = 0;
                container.addEventListener('click', (e) => {
                    clickCount++;
                    if (clickCount === 1) {
                        setTimeout(() => {
                            if (clickCount === 2) {
                                togglePictureInPicture(video);
                            }
                            clickCount = 0;
                        }, 300);
                    }
                });
            }
        });
        videoModalEl.addEventListener('click', function(e) {
            if (e.target === this && !isInPipMode) {
                videoModal.hide();
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && videoModal._isShown && !isInPipMode) {
                videoModal.hide();
            }
        });
        document.addEventListener('leavepictureinpicture', () => {
            isInPipMode = false;
            if (videoModal._isShown) {
                videoModal.hide();
            }
        });
    }
});

// Function to initialize featured products
function initializeFeaturedProducts() {
    // No Add to Cart logic here. Handled globally in cart-handler.js
    const featuredProductsContainer = document.querySelector('.featured-products-row');
    if (!featuredProductsContainer) {
        console.error('Featured products container (.featured-products-row) not found.');
        return;
    }
    // You can keep other logic here if needed, but do not add any event listeners for .add-to-cart
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
        // autoplay: {
        //     delay: 5000, // Auto cycle every 5 seconds
        //     disableOnInteraction: false,
        // },
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
                // console.log('[Hero Swiper] Slide changed to', this.activeIndex);
            }
        }
    });
    heroSwiper.update();
    console.log('[Hero Swiper] Swiper instance:', heroSwiper);
}
