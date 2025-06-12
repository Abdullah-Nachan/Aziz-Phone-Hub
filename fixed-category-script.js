
/* ✅ FINAL FIXED category-script.js (Spinner guaranteed to hide) */
function populateProductsGrid(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) {
        console.error('Products grid element not found!');
        return;
    }
    productsGrid.innerHTML = ''; // Clear existing products

    if (products.length === 0) {
        const noProductsMessage = document.createElement('div');
        noProductsMessage.className = 'col-12 text-center';
        noProductsMessage.innerHTML = `
            <div class="alert alert-warning p-5 shadow-sm">
                <h2><i class="fas fa-exclamation-triangle me-2"></i> No Products Found</h2>
                <p class="mt-3">Sorry, we couldn't find any products matching your criteria.</p>
                <button class="btn btn-primary mt-3" onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
        productsGrid.appendChild(noProductsMessage);
        document.getElementById('loading-indicator').style.display = 'none'; // ✅ Force hide spinner
        return;
    }

    const fragment = document.createDocumentFragment();
    products.forEach(product => {
        const productCard = createProductCard(product);
        fragment.appendChild(productCard);
    });
    productsGrid.appendChild(fragment);

    document.getElementById('loading-indicator').style.display = 'none'; // ✅ Hide spinner after rendering
}
