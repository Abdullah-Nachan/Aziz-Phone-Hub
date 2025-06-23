// JS for watches category tabs and product cards section
// Categories: Smartwatches, Casual Watches, Accessories, Combo Offer
// This script expects a global products array (from static-products.js) with category info

document.addEventListener('DOMContentLoaded', function() {
  const categories = [
    { key: 'smartwatches', label: 'Smartwatches' },
    { key: 'casualwatch', label: 'Casual Watches' },
    { key: 'accessories', label: 'Accessories' },
    { key: 'combo-offers', label: 'Combo Offer' }
  ];

  const section = document.getElementById('watchesTabsSection');
  if (!section) return;
  
  // Clear any existing content
  section.innerHTML = '';

  // Tab UI
  const tabRow = document.createElement('div');
  tabRow.className = 'watches-tabs-row';
  categories.forEach((cat, i) => {
    const tab = document.createElement('button');
    tab.className = 'watches-tab-btn' + (i === 0 ? ' active' : '');
    tab.textContent = cat.label;
    tab.dataset.cat = cat.key;
    tabRow.appendChild(tab);
  });
  section.appendChild(tabRow);

  // Product cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'watches-products-cards-container';
  section.appendChild(cardsContainer);

  // Function to create view products button
  function createViewProductsButton(category) {
    const button = document.createElement('button');
    button.className = 'view-products-btn';
    button.textContent = 'View Products';
    button.onclick = () => window.location.href = `category.html?cat=${category}`;
    return button;
  }

  // Add view products button after cards container
  const viewProductsBtn = createViewProductsButton(categories[0].key);
  section.appendChild(viewProductsBtn);

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
      card.className = 'watches-product-card';
      card.innerHTML = `
        <img src="${prod.image || prod.images?.[0] || 'https://placehold.co/300x300?text=No+Image'}" alt="${prod.name}" class="watches-card-img">
        <div class="watches-card-title">${prod.name}</div>
        <div class="watches-card-price">Rs. ${prod.price?.toLocaleString() || ''}</div>
      `;
      card.onclick = () => window.location.href = `product.html?id=${prod.id}`;
      cardsContainer.appendChild(card);
    });
  }

  // Tab switching
  tabRow.addEventListener('click', function(e) {
    if (e.target.classList.contains('watches-tab-btn')) {
      tabRow.querySelectorAll('.watches-tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      const category = e.target.dataset.cat;
      renderCards(category);
      
      // Update button
      const oldBtn = document.querySelector('#watchesTabsSection .view-products-btn');
      if (oldBtn) {
        section.removeChild(oldBtn);
      }
      const newBtn = createViewProductsButton(category);
      section.appendChild(newBtn);
    }
  });

  // Initial render
  renderCards(categories[0].key);
  
  // Ensure first tab is visible on load
  setTimeout(() => {
    tabRow.scrollTo(0, 0);
    const firstTab = tabRow.querySelector('.watches-tab-btn');
    if (firstTab) {
      firstTab.classList.add('active');
      const firstTabContent = document.querySelector(firstTab.dataset.target);
      if (firstTabContent) {
        firstTabContent.classList.add('show', 'active');
      }
      // Scroll active tab into view for better visibility on mobile
      // Commenting this out to prevent page from scrolling on load
      // firstTab.scrollIntoView({
      //     behavior: 'smooth',
      //     block: 'nearest',
      //     inline: 'center'
      // });
    }
  }, 100);
});
