// JS for dynamic category tabs and product cards section
// Categories: Airpods, Headphones, Shoes, Crocs
// This script expects a global products array (from static-products.js) with category info

// Prevent multiple initializations
if (!window.categoryTabsInitialized) {
    window.categoryTabsInitialized = true;
    
    document.addEventListener('DOMContentLoaded', function() {
  const categories = [
    { key: 'airpods', label: 'Airpods' },
    { key: 'headphones', label: 'Headphones' },
    { key: 'shoes', label: 'Shoes' },
    { key: 'crocs', label: 'Crocs' }
  ];

  const section = document.getElementById('categoryTabsSection');
  if (!section) return;

  // Tab UI
  const tabRow = document.createElement('div');
  tabRow.className = 'category-tabs-row';
  categories.forEach((cat, i) => {
    const tab = document.createElement('button');
    tab.className = 'category-tab-btn' + (i === 0 ? ' active' : '');
    tab.textContent = cat.label;
    tab.dataset.cat = cat.key;
    tabRow.appendChild(tab);
  });
  section.appendChild(tabRow);

  // Product cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'category-products-cards-container';
  section.appendChild(cardsContainer);

  function renderCards(category) {
    cardsContainer.innerHTML = '';
    let productsArr = window.productsArray || (window.products ? Object.values(window.products) : []);
    let filtered = productsArr.filter(p => (p.category || '').toLowerCase() === category);
    if (!filtered.length) {
      cardsContainer.innerHTML = '<div class="no-products-msg">No products found.</div>';
      return;
    }
    filtered.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'category-product-card';
      card.innerHTML = `
        <img src="${prod.image || prod.images?.[0] || 'https://placehold.co/300x300?text=No+Image'}" alt="${prod.name}" class="category-card-img">
        <div class="category-card-title">${prod.name}</div>
        <div class="category-card-price">Rs. ${prod.price?.toLocaleString() || ''}</div>
      `;
      // Only navigate to product page if clicking on the card, not the button
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.add-to-cart-btn')) {
          window.location.href = `product.html?id=${prod.id}`;
        }
      });
      cardsContainer.appendChild(card);
    });
  }

  // Tab switching
  tabRow.addEventListener('click', function(e) {
    if (e.target.classList.contains('category-tab-btn')) {
      tabRow.querySelectorAll('.category-tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      renderCards(e.target.dataset.cat);
    }
  });

  // Function to create view products button
  function createViewProductsButton(category) {
    const button = document.createElement('button');
    button.className = 'view-products-btn';
    button.textContent = 'View Products';
    button.onclick = () => window.location.href = `category.html?cat=${category}`;
    return button;
  }

  // Set initial active tab and scroll to start
  renderCards(categories[0].key);
  
  // Add view products button after cards container
  const viewProductsBtn = createViewProductsButton(categories[0].key);
  section.appendChild(viewProductsBtn);
  
  // Handle Add to Cart button clicks using event delegation
  document.addEventListener('click', function(e) {
    const addToCartBtn = e.target.closest('.add-to-cart-btn');
    if (addToCartBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const productId = addToCartBtn.dataset.productId;
      if (!productId) return;
      
      // Show loading state
      const originalText = addToCartBtn.innerHTML;
      addToCartBtn.disabled = true;
      addToCartBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';
      
      // Add to cart with quantity 1
      addToCart(productId, 1)
        .then(() => {
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Added to Cart',
            text: 'Product has been added to your cart!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          
          // Update cart count
          updateCartCount();
        })
        .catch(error => {
          console.error('Error adding to cart:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add product to cart. Please try again.'
          });
        })
        .finally(() => {
          // Reset button state
          addToCartBtn.disabled = false;
          addToCartBtn.innerHTML = originalText;
        });
    }
  });
  
  // Function to update cart count in the UI
  function updateCartCount() {
    // This function should be implemented based on your cart implementation
    // For example, if you're using a global cart object:
    if (window.cart && typeof window.updateCartCount === 'function') {
      window.updateCartCount();
    }
  }
  
  // Ensure first tab is visible on load
  setTimeout(() => {
    tabRow.scrollTo(0, 0);
    const firstTab = document.querySelector('.category-tab-btn');
    if (firstTab) {
      firstTab.classList.add('active');
      const firstTabContent = document.querySelector(firstTab.dataset.target);
      if (firstTabContent) {
        firstTabContent.classList.add('show', 'active');
      }
    }
  }, 100);

  // Update button when tab changes
  tabRow.addEventListener('click', function(e) {
    if (e.target.classList.contains('category-tab-btn')) {
      const category = e.target.dataset.cat;
      const oldBtn = document.querySelector('.view-products-btn');
      if (oldBtn) {
        section.removeChild(oldBtn);
      }
      const newBtn = createViewProductsButton(category);
      section.appendChild(newBtn);
    }
    });
  });
}