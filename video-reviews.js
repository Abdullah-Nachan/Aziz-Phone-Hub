/**
 * Video and Reviews functionality for Aziz Phone Hub
 * Handles video playback and horizontal scrolling for product videos and customer reviews
 */

// This file handles video and reviews functionality
console.log('Script video-reviews.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all videos to autoplay, mute, and loop
    initializeVideos();
    
    // Initialize horizontal scrolling for video sections
    initializeHorizontalScrolling();
    
    // Initialize navigation buttons
    initializeNavigationButtons();
    
    // Create placeholder content notice (development only)
    createPlaceholderNotice();
});

/**
 * Initialize all videos to autoplay, mute, and loop with viewport detection
 */
function initializeVideos() {
    // Get all videos in both sections
    const videos = document.querySelectorAll('.video-container video');
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Play video when in viewport
                    entry.target.play();
                } else {
                    // Pause video when out of viewport
                    entry.target.pause();
                }
            });
        }, { threshold: 0.3 }); // Trigger when 30% of the video is visible
        
        // Observe all videos
        videos.forEach(video => {
            // Make sure autoplay, mute, and loop attributes are set
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.autoplay = true;
            
            // Observe the video
            videoObserver.observe(video);
            
            // Force play on touch for mobile devices
            video.addEventListener('touchstart', function() {
                video.play();
            });
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        videos.forEach(video => {
            video.play();
        });
    }
}

/**
 * Initialize horizontal scrolling for video sections
 */
function initializeHorizontalScrolling() {
    // Initialize product videos scrolling
    initializeScrollContainer('.video-cards-container');
    
    // Initialize customer reviews scrolling
    initializeScrollContainer('.review-videos-container');
}

/**
 * Initialize horizontal scrolling for a specific container
 */
function initializeScrollContainer(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    // Mouse events for desktop
    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });
    
    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        container.scrollLeft = scrollLeft - walk;
    });
    
    // Set initial cursor style
    container.style.cursor = 'grab';
}

/**
 * Initialize navigation buttons for both sections
 */
function initializeNavigationButtons() {
    // Product videos navigation
    initializeNavButtons('.swiper-prev-video', '.swiper-next-video', '.video-cards-container');
    
    // Customer reviews navigation
    initializeNavButtons('.swiper-prev-review', '.swiper-next-review', '.review-videos-container');
}

/**
 * Initialize navigation buttons for a specific section
 */
function initializeNavButtons(prevSelector, nextSelector, containerSelector) {
    const prevButton = document.querySelector(prevSelector);
    const nextButton = document.querySelector(nextSelector);
    const container = document.querySelector(containerSelector);
    
    if (!prevButton || !nextButton || !container) return;
    
    // Scroll amount (width of one card + gap)
    const scrollAmount = 270; // Adjust based on your card width + gap
    
    // Previous button click
    prevButton.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    // Next button click
    nextButton.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
}

/**
 * Create placeholder notice for videos and images
 * This is a helper function for development only
 */
function createPlaceholderNotice() {
    console.log('%c📹 Video Files Required', 'font-weight: bold; font-size: 14px; color: #e74c3c;');
    console.log('Please create the following folders and files:');
    console.log('1. Create a "videos" folder in your project root');
    console.log('2. Add product videos: product-video-1.mp4 through product-video-7.mp4');
    console.log('3. Add review videos: review-video-1.mp4 through review-video-6.mp4');
    console.log('\nAll videos should be short clips (5-10 seconds) that showcase your products');
}
