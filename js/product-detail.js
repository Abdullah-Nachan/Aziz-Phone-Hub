// Add similar products to container
similarProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    // Format the price to ensure only one rupee symbol
    const price = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^0-9.]/g, '')) : product.price;
    const formattedPrice = typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : product.price;
    productCard.innerHTML = `
        <div class="product-card-inner">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3 class="product-title">
                        <a href="product.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="product-price">${formattedPrice}</div>
                </div>
            </div>
        </div>
    `;
    similarProductsContainer.appendChild(productCard);
});

// Show product not found message 