// This file handles search functionality
console.log('Script search.js loaded');

// Search functionality with suggestions
document.addEventListener('DOMContentLoaded', function() {
    // Get all search input fields and suggestion containers
    const searchInputs = document.querySelectorAll('.search-box input');
    let currentFocus = -1;
    
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
                suggestionsContainer.style.display = 'none';
                currentFocus = -1;
            }, 200);
        });
        
        // Save on form submit
        const form = searchBox.closest('form');
        if (form) {
            form.addEventListener('submit', function() {
                const v = input.value.trim();
                if (v) saveSearchTerm(v);
            });
        }
        
        // Add keyboard navigation
        input.addEventListener('keydown', function(e) {
            const suggestionsContainer = searchBox.querySelector('.search-suggestions');
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
    
    // Recent searches helpers
    function getRecentSearches() {
        return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    }
    function saveSearchTerm(term) {
        let rec = getRecentSearches().filter(t => t.toLowerCase() !== term.toLowerCase());
        rec.unshift(term);
        rec = rec.slice(0,5);
        localStorage.setItem('recentSearches', JSON.stringify(rec));
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
        
        // If search term is empty, show recent searches
        if (searchTerm.length === 0) {
            const recents = getRecentSearches();
            if (recents.length) {
                suggestionsContainer.style.display = 'block';
                recents.forEach(term => {
                    const item = createSuggestionItem(term, `shop.html?search=${encodeURIComponent(term)}`, 'recent');
                    suggestionsContainer.appendChild(item);
                });
            } else {
                suggestionsContainer.style.display = 'none';
            }
            return;
        }
        
        try {
            // Get matching products and categories
            const matchingProducts = findMatchingProducts(searchTerm);
            const matchingCategories = findMatchingCategories(searchTerm);
            
            // Display suggestions
            if (matchingProducts.length > 0 || matchingCategories.length > 0) {
                suggestionsContainer.style.display = 'block';
                
                // Add category suggestions
                if (matchingCategories.length > 0) {
                    const categoryHeader = document.createElement('div');
                    categoryHeader.className = 'suggestion-header';
                    categoryHeader.textContent = 'Categories';
                    suggestionsContainer.appendChild(categoryHeader);
                    
                    matchingCategories.slice(0, 3).forEach(category => {
                        const suggestionItem = createSuggestionItem(category.name, `category.html?cat=${category.id}`, 'category');
                        suggestionsContainer.appendChild(suggestionItem);
                    });
                }
                
                // Add product suggestions
                if (matchingProducts.length > 0) {
                    const productHeader = document.createElement('div');
                    productHeader.className = 'suggestion-header';
                    productHeader.textContent = 'Products';
                    suggestionsContainer.appendChild(productHeader);
                    
                    matchingProducts.slice(0, 5).forEach(product => {
                        const suggestionItem = createSuggestionItem(product.name, `product.html?id=${product.id}`, 'product', product.price);
                        suggestionsContainer.appendChild(suggestionItem);
                    });
                }
                
                // Add "View all results" option
                if (matchingProducts.length > 5 || matchingCategories.length > 3) {
                    const viewAllItem = document.createElement('a');
                    viewAllItem.className = 'suggestion-item view-all';
                    viewAllItem.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
                    viewAllItem.innerHTML = `
                        <div class="suggestion-icon"><i class="fas fa-search"></i></div>
                        <div class="suggestion-text">View all results for "${searchTerm}"</div>
                    `;
                    suggestionsContainer.appendChild(viewAllItem);
                }
            } else {
                // No results found
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `<p>No results found for "${searchTerm}"</p>`;
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
        item.className = `suggestion-item ${type}`;
        item.href = link;
        
        let icon = '';
        if (type === 'category') {
            icon = '<i class="fas fa-tag"></i>';
        } else if (type === 'product') {
            icon = '<i class="fas fa-box"></i>';
        }
        
        let priceHtml = price ? `<span class="suggestion-price">${price}</span>` : '';
        
        item.innerHTML = `
            <div class="suggestion-icon">${icon}</div>
            <div class="suggestion-text">${name}</div>
            ${priceHtml}
        `;
        
        return item;
    }
    
    // Find matching products from the products object
    function findMatchingProducts(searchTerm) {
        const results = [];
        
        // Check if products object exists
        if (typeof products !== 'undefined') {
            for (const productId in products) {
                const product = products[productId];
                if (product.name.toLowerCase().includes(searchTerm)) {
                    results.push({
                        id: product.id,
                        name: product.name,
                        price: product.price
                    });
                }
            }
        }
        
        return results;
    }
    
    // Find matching categories
    function findMatchingCategories(searchTerm) {
        const categories = [
            { id: 'airpods', name: 'AirPods' },
            { id: 'smartwatches', name: 'Smartwatches' },
            { id: 'headphones', name: 'Headphones' },
            { id: 'shoes', name: 'Shoes' },
            { id: 'accessories', name: 'Accessories' },
            { id: 'watches', name: 'Watches' },
            { id: 'combo-offers', name: 'Combo Offers' }
        ];
        
        return categories.filter(category => 
            category.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Handle search form submission
    const searchForms = document.querySelectorAll('.search-box-form');
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = form.querySelector('input');
            const searchTerm = input.value.trim();
            
            if (searchTerm.length > 0) {
                // Redirect to search results page
                window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
            }
        });
    });
    
    // Handle suggestion click
    const suggestionsContainers = document.querySelectorAll('.search-suggestions');
    suggestionsContainers.forEach(suggestionsContainer => {
        suggestionsContainer.addEventListener('click', e => {
            if (!e.target.matches('.suggestion-item')) return;
            const term = e.target.textContent;
            saveSearchTerm(term);
            const input = suggestionsContainer.closest('.search-box').querySelector('input');
            input.value = term;
            suggestionsContainer.innerHTML = '';
            // you can optionally submit form or redirect here
        });
    });
});
