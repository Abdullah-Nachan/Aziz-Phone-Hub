document.addEventListener('DOMContentLoaded', function() {
    // Get all product cards
    const productCards = document.querySelectorAll('.product-card');
    const products = Array.from(productCards).map(card => {
        const price = parseInt(card.querySelector('.price').textContent.replace('₹', '').replace(',', ''));
        const title = card.querySelector('h3').textContent.toLowerCase();
        return { element: card, price, title };
    });

    // Price Range Filter
    const minPriceInput = document.querySelector('input[placeholder="Min"]');
    const maxPriceInput = document.querySelector('input[placeholder="Max"]');

    // Brand Filter
    const brandSelect = document.querySelector('.filter-group select');

    // Features Filter
    const featureCheckboxes = document.querySelectorAll('.filter-group .form-check-input');

    // Sort Filter
    const sortSelect = document.querySelector('#sortSelect');

    // Apply Filters Button (inside Filter panel)
    const applyButton = document.querySelector('#filterPanel .btn-primary');
    const resetButton = document.querySelector('#filterPanel .btn-outline-secondary');

    // Function to filter products
    function filterProducts() {
        const minPrice = minPriceInput.value ? parseInt(minPriceInput.value) : 0;
        const maxPrice = maxPriceInput.value ? parseInt(maxPriceInput.value) : Infinity;
        const selectedBrand = brandSelect.value.toLowerCase();
        const selectedFeatures = Array.from(featureCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.id.toLowerCase());
        const sortValue = sortSelect.value; // Get sort value from the separate sort select

        // Filter products
        products.forEach(product => {
            let show = true;

            // Price filter
            if (product.price < minPrice || product.price > maxPrice) {
                show = false;
            }

            // Brand filter
            if (selectedBrand && !product.title.includes(selectedBrand)) {
                show = false;
            }

            // Features filter
            if (selectedFeatures.length > 0) {
                const hasAllFeatures = selectedFeatures.every(feature => 
                    product.title.includes(feature.replace(/([A-Z])/g, ' $1').toLowerCase())
                );
                if (!hasAllFeatures) {
                    show = false;
                }
            }

            // Show/hide product
            // Check if the product element and its parent col-6 exist before trying to access style
            const productCol = product.element.closest('.col-6');
            if (productCol) {
                productCol.style.display = show ? '' : 'none';
            }
        });

        // Sort products
        const productContainer = document.querySelector('.row.g-4');
        if (!productContainer) return; // Exit if product container not found

        const visibleProducts = Array.from(productContainer.children)
            .filter(child => child.style.display !== 'none');

        visibleProducts.sort((a, b) => {
            const priceA = parseInt(a.querySelector('.price').textContent.replace('₹', '').replace(',', ''));
            const priceB = parseInt(b.querySelector('.price').textContent.replace('₹', '').replace(',', ''));

            switch (sortValue) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                    // For newest, we'll use the order in the HTML (no change needed here for default sort)
                    return 0;
                default: // popularity - assume original order is by popularity
                    return 0;
            }
        });

        // Reorder products in the DOM
        visibleProducts.forEach(product => {
            productContainer.appendChild(product);
        });
    }

    // Event Listeners for inputs and selects for real-time filtering/sorting
    if (minPriceInput) minPriceInput.addEventListener('input', filterProducts);
    if (maxPriceInput) maxPriceInput.addEventListener('input', filterProducts);
    if (brandSelect) brandSelect.addEventListener('change', filterProducts);
    featureCheckboxes.forEach(cb => cb.addEventListener('change', filterProducts));
    if (sortSelect) sortSelect.addEventListener('change', filterProducts);

    // Event listeners for Apply and Reset buttons inside the Filter panel
    if (applyButton) {
        applyButton.addEventListener('click', function() {
            filterProducts();
            // Close filter panel after applying filters from inside the panel
            const filterPanel = document.getElementById('filterPanel');
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(filterPanel);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Reset all inputs in filter panel
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';
            if (brandSelect) brandSelect.value = '';
            featureCheckboxes.forEach(cb => cb.checked = false);
            
            // Also reset sort select in sort panel
            if (sortSelect) sortSelect.value = 'popularity';

            filterProducts(); // Apply filters and sorting after reset

            // Close filter panel after reset from inside the panel
            const filterPanel = document.getElementById('filterPanel');
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(filterPanel);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        });
    }

}); 