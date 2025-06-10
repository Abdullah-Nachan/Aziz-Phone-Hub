// Category page search functionality with suggestions
document.addEventListener('DOMContentLoaded', function() {
    // Get all search input fields and suggestion containers
    const searchInputs = document.querySelectorAll('.search-box input');
    let currentFocus = -1;
    
    // Get current category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('cat') || '';
    
    // Create suggestion container for each search box if it doesn't exist
    searchInputs.forEach(input => {
        const searchBox = input.closest('.search-box');
        
        // Create suggestions container if it doesn't exist
        if (!searchBox.querySelector('.search-suggestions')) {
            const suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'search-suggestions';
            searchBox.appendChild(suggestionsContainer);
        }
        
        // Add event listeners
        input.addEventListener('input', debounce(handleSearchInput, 300));
        input.addEventListener('focus', handleSearchInput);
        input.addEventListener('blur', function() {
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => {
                const suggestionsContainer = searchBox.querySelector('.search-suggestions');
                if (suggestionsContainer) {
                    suggestionsContainer.style.display = 'none';
                }
                currentFocus = -1;
            }, 200);
        });
        
        // Add keyboard navigation
        input.addEventListener('keydown', function(e) {
            const suggestionsContainer = searchBox.querySelector('.search-suggestions');
            if (!suggestionsContainer) return;
            
            const suggestionItems = suggestionsContainer.querySelectorAll('.suggestion-item');
            if (suggestionItems.length === 0) return;
            
            // Down arrow
            if (e.keyCode === 40) {
                currentFocus++;
                if (currentFocus >= suggestionItems.length) currentFocus = 0;
                setActiveSuggestion(suggestionItems, currentFocus);
                e.preventDefault();
            }
            // Up arrow
            else if (e.keyCode === 38) {
                currentFocus--;
                if (currentFocus < 0) currentFocus = suggestionItems.length - 1;
                setActiveSuggestion(suggestionItems, currentFocus);
                e.preventDefault();
            }
            // Enter key
            else if (e.keyCode === 13 && currentFocus > -1) {
                e.preventDefault();
                suggestionItems[currentFocus].click();
            }
        });
    });
    
    // Set active suggestion
    function setActiveSuggestion(items, index) {
        if (!items || items.length === 0) return;
        
        // Remove active class from all items
        items.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current item
        if (index >= 0 && index < items.length) {
            items[index].classList.add('active');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Debounce function to limit how often the search is triggered
    function debounce(func, delay) {
        let timer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
    
    // Handle search input
    function handleSearchInput(e) {
        const input = e.target;
        const searchTerm = input.value.trim().toLowerCase();
        const searchBox = input.closest('.search-box');
        const suggestionsContainer = searchBox.querySelector('.search-suggestions');
        
        // Reset current focus
        currentFocus = -1;
        
        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';
        
        // If search term is empty, hide suggestions
        if (searchTerm.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        try {
            // Get matching products in the current category
            const matchingProducts = findMatchingProductsInCategory(searchTerm, currentCategory);
            
            // Display suggestions
            if (matchingProducts.length > 0) {
                suggestionsContainer.style.display = 'block';
                
                // Add product suggestions
                matchingProducts.slice(0, 8).forEach(product => {
                    const suggestionItem = createSuggestionItem(product.name, `product.html?id=${product.id}`, 'product', product.price);
                    suggestionsContainer.appendChild(suggestionItem);
                });
                
                // Add "View all results" option
                if (matchingProducts.length > 8) {
                    const viewAllItem = document.createElement('a');
                    viewAllItem.className = 'suggestion-item view-all';
                    viewAllItem.href = `category.html?cat=${currentCategory}&search=${encodeURIComponent(searchTerm)}`;
                    viewAllItem.innerHTML = `
                        <div class="suggestion-icon"><i class="fas fa-search"></i></div>
                        <div class="suggestion-text">View all ${matchingProducts.length} results for "${searchTerm}"</div>
                    `;
                    suggestionsContainer.appendChild(viewAllItem);
                }
            } else {
                // No results found
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `<p>No results found for "${searchTerm}" in this category</p>`;
                suggestionsContainer.appendChild(noResults);
                suggestionsContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error in search suggestions:', error);
            suggestionsContainer.style.display = 'none';
        }
    }
    
    // Create a suggestion item
    function createSuggestionItem(name, link, type, price = null) {
        const item = document.createElement('a');
        item.className = 'suggestion-item';
        item.href = link;
        
        let icon = '<i class="fas fa-box"></i>';
        let priceHtml = price ? `<span class="suggestion-price">${price}</span>` : '';
        
        item.innerHTML = `
            <div class="suggestion-icon">${icon}</div>
            <div class="suggestion-text">${name}</div>
            ${priceHtml}
        `;
        
        return item;
    }
    
    // Find matching products in the current category
    function findMatchingProductsInCategory(searchTerm, category) {
        const results = [];
        
        // Check if products object exists
        if (typeof products !== 'undefined') {
            for (const productId in products) {
                const product = products[productId];
                // Check if product belongs to current category and matches search term
                if (product.category === category && product.name.toLowerCase().includes(searchTerm)) {
                    results.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        category: product.category
                    });
                }
            }
        }
        
        return results;
    }
    
    // Handle search form submission
    const searchForms = document.querySelectorAll('.search-box-form');
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = form.querySelector('input');
            const searchTerm = input.value.trim();
            
            if (searchTerm.length > 0) {
                // Redirect to category page with search query
                window.location.href = `category.html?cat=${currentCategory}&search=${encodeURIComponent(searchTerm)}`;
            } else {
                // If no search term, just reload the category page
                window.location.href = `category.html?cat=${currentCategory}`;
            }
        });
    });
});
