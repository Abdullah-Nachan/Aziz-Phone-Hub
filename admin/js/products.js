/**
 * Admin Products Management for Aziz Phone Hub
 * Handles product listing, adding, editing, and deleting
 */

// State management
const state = {
    currentPage: 1,
    productsPerPage: 12,
    allProducts: [],
    filteredProducts: [],
    categories: [],
    isInitialized: false,
    isLoading: false,
    hasError: false,
    errorMessage: '',
    currentSort: 'newest',
    currentCategory: 'all',
    searchQuery: ''
};

// DOM Elements
const elements = {
    productsGrid: null,
    searchInput: null,
    categoryFilter: null,
    sortBySelect: null,
    filterBtn: null,
    productForm: null,
    addProductBtn: null,
    loadingIndicator: null,
    productModal: null,
    productFormElement: null,
    productIdInput: null,
    productNameInput: null,
    productPriceInput: null,
    productStockInput: null,
    productCategorySelect: null,
    productDescriptionInput: null,
    productImageInput: null,
    productImagePreview: null,
    saveProductBtn: null,
    inStockCheckbox: null,
    pagination: null,
    searchBtn: null
};

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    if (state.isInitialized) {
        console.log('Products page already initialized.');
        return;
    }

    console.log('Initializing products page...');

    initializeElements();
    setupEventListeners();
    initializeModals();
    loadData();

    state.isInitialized = true;
    console.log('Products page initialization complete.');
});

// Initialize DOM elements
function initializeElements() {
    elements.productsGrid = document.getElementById('productsGrid');
    elements.searchInput = document.getElementById('searchInput');
    elements.categoryFilter = document.getElementById('categoryFilter');
    elements.sortBySelect = document.getElementById('sortBy');
    elements.filterBtn = document.getElementById('filterBtn');
    elements.loadingIndicator = document.getElementById('loadingIndicator');
    elements.productModal = new bootstrap.Modal(document.getElementById('productModal'));
    elements.productFormElement = document.getElementById('productForm');
    elements.productIdInput = document.getElementById('productId');
    elements.productNameInput = document.getElementById('productName');
    elements.productPriceInput = document.getElementById('productPrice');
    elements.productStockInput = document.getElementById('productStock');
    elements.productCategorySelect = document.getElementById('productCategory');
    elements.productDescriptionInput = document.getElementById('productDescription');
    elements.productImageInput = document.getElementById('productImage');
    elements.productImagePreview = document.getElementById('imagePreview');
    elements.saveProductBtn = document.getElementById('saveProductBtn');
    elements.addProductBtn = document.getElementById('addProductBtn');
    elements.inStockCheckbox = document.getElementById('inStock');
    elements.pagination = document.getElementById('pagination');
    elements.searchBtn = document.getElementById('searchBtn');
}

// Setup all event listeners
function setupEventListeners() {
    elements.addProductBtn.addEventListener('click', () => showProductModal());
    elements.productFormElement.addEventListener('submit', handleProductFormSubmit);
    elements.searchInput.addEventListener('input', handleSearchAndFilter);
    elements.searchBtn.addEventListener('click', handleSearchAndFilter);
    elements.categoryFilter.addEventListener('change', handleSearchAndFilter);
    elements.sortBySelect.addEventListener('change', handleSearchAndFilter);
    
    // Event delegation for edit and delete buttons
    elements.productsGrid.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('edit-product')) {
            editProduct(target.dataset.id);
        } else if (target.classList.contains('delete-product')) {
            deleteProduct(target.dataset.id);
        }
    });
}

// Initialize modals
function initializeModals() {
    elements.productModal._element.addEventListener('hidden.bs.modal', () => {
        resetProductForm();
    });
    
    if (elements.productImageInput) {
        elements.productImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    elements.productImagePreview.src = event.target.result;
                    elements.productImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Reset product form
function resetProductForm() {
    if (elements.productFormElement) {
        elements.productFormElement.reset();
    }
    if (elements.productImagePreview) {
        elements.productImagePreview.src = '#';
        elements.productImagePreview.style.display = 'none';
    }
    if (elements.productIdInput) {
        elements.productIdInput.value = '';
    }
    if (elements.saveProductBtn) {
        elements.saveProductBtn.textContent = 'Add Product';
    }
    if (elements.inStockCheckbox) {
        elements.inStockCheckbox.checked = true; // Default to in stock
    }
}

// Load initial data (products and categories)
async function loadData() {
    console.log('loadData function called');
    if (state.isLoading) {
        console.log('Data load already in progress');
        return;
    }

    state.isLoading = true;
    state.hasError = false;
    showLoadingState(true);
    
    try {
        await Promise.all([
            loadCategories(),
            loadProducts()
        ]);
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error loading data:', error);
        state.hasError = true;
        state.errorMessage = error.message || 'Failed to load data. Please try refreshing the page.';
        showError(state.errorMessage);
    } finally {
        state.isLoading = false;
        showLoadingState(false);
    }
}

// Show/hide loading state
function showLoadingState(show) {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.style.display = show ? 'block' : 'none';
    }
    if (elements.productsGrid) {
        elements.productsGrid.style.display = show ? 'none' : 'flex'; // Hide grid when loading
    }
}

// Show error messages
function showError(message) {
    if (!elements.productsGrid) return;
    elements.productsGrid.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error</h4>
            <p>${message}</p>
            <button class="btn btn-primary mt-2" onclick="loadData()">Retry</button>
        </div>
    `;
    elements.productsGrid.style.display = 'block'; // Ensure error is visible
}

// Load products from Firestore
async function loadProducts() {
    console.log('loadProducts function called');
    try {
        const snapshot = await window.db.collection('products').orderBy('createdAt', 'desc').get();
        state.allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Loaded ${state.allProducts.length} products.`);
    } catch (error) {
        console.error('Error loading products:', error);
        throw new Error('Failed to fetch products from database.');
    }
}

// Load categories from Firestore
async function loadCategories() {
    console.log('Loading categories...');
    try {
        // Predefined categories
        const predefinedCategories = [
            'Airpods',
            'Smartwatch',
            'Watch',
            'Headphone',
            'Crocs',
            'Shoes',
            'combo Offers',
            'Accessories'
        ];

        // Fetch categories from Firestore (if any, to merge or prioritize)
        const categoriesSnapshot = await window.db.collection('categories').get();
        const fetchedCategories = categoriesSnapshot.docs.map(doc => doc.data().name);

        // Combine and ensure uniqueness, prioritizing predefined categories
        const combinedCategories = [...new Set([...predefinedCategories, ...fetchedCategories])];
        
        state.categories = ['All', ...combinedCategories];
        populateCategoryFilter();
        populateProductCategorySelect();
        console.log('Categories loaded:', state.categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        state.hasError = true;
        state.errorMessage = 'Failed to load categories.';
        showError(state.errorMessage);
    }
}

// Populate category filter dropdown
function populateCategoryFilter() {
    if (!elements.categoryFilter) return;
    elements.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        elements.categoryFilter.appendChild(option);
    });
    elements.categoryFilter.value = state.currentCategory; // Set selected category
}

// Populate product category select in modal
function populateProductCategorySelect() {
    if (!elements.productCategorySelect) return;
    elements.productCategorySelect.innerHTML = '<option value="">Select Category</option>';
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        elements.productCategorySelect.appendChild(option);
    });
}

// Handle search, filter, and sort changes
function handleSearchAndFilter() {
    state.searchQuery = elements.searchInput.value.toLowerCase();
    state.currentCategory = elements.categoryFilter.value;
    state.currentSort = elements.sortBySelect.value;
    state.currentPage = 1; // Reset to first page on filter/sort change
    applyFiltersAndSort();
}

// Apply filters and sort to products
function applyFiltersAndSort() {
    let products = [...state.allProducts];

    // Apply search query
    if (state.searchQuery) {
        products = products.filter(product => 
            product.name.toLowerCase().includes(state.searchQuery) ||
            product.description.toLowerCase().includes(state.searchQuery)
        );
    }

    // Apply category filter
    if (state.currentCategory !== 'all') {
        products = products.filter(product => product.category === state.currentCategory);
    }

    // Apply sorting
    products.sort((a, b) => {
        switch (state.currentSort) {
            case 'newest':
                return b.createdAt.toDate() - a.createdAt.toDate();
            case 'oldest':
                return a.createdAt.toDate() - b.createdAt.toDate();
            case 'priceAsc':
                return (a.price || 0) - (b.price || 0);
            case 'priceDesc':
                return (b.price || 0) - (a.price || 0);
            default:
                return 0;
        }
    });

    state.filteredProducts = products;
    displayProducts();
    updatePagination();
}

// Display products in the grid
function displayProducts() {
    const productsGrid = elements.productsGrid;
    if (!productsGrid) return;

    productsGrid.innerHTML = ''; // Clear existing products

    const startIndex = (state.currentPage - 1) * state.productsPerPage;
    const endIndex = Math.min(startIndex + state.productsPerPage, state.filteredProducts.length);
    const currentProducts = state.filteredProducts.slice(startIndex, endIndex);

    if (currentProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="alert alert-info" role="alert">
                <h4 class="alert-heading">No Products Found</h4>
                <p>There are no products matching your search criteria.</p>
                <hr>
                <p class="mb-0">Try a different search or <button class="btn btn-primary btn-sm" id="addProductBtnEmpty">Add a New Product</button></p>
            </div>
        `;
        document.getElementById('addProductBtnEmpty')?.addEventListener('click', () => showProductModal());
        return;
    }

    const fragment = document.createDocumentFragment();
    const row = document.createElement('div');
    row.className = 'row g-4';

    currentProducts.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3';
        
        const productCard = document.createElement('div');
        productCard.className = 'card h-100 product-card';
        
        const price = product.price ? `₹${product.price.toFixed(2)}` : 'N/A';
        const stockBadge = product.inStock ? 
            '<span class="badge bg-success">In Stock</span>' : 
            '<span class="badge bg-danger">Out of Stock</span>';
        
        productCard.innerHTML = `
            <div class="position-relative">
                <img src="${product.imageUrl || '../images/placeholder.svg'}" 
                     class="card-img-top" 
                     alt="${product.name}" 
                     onerror="this.src='../images/placeholder.svg'"
                     loading="lazy">
                <div class="position-absolute top-0 end-0 m-2">
                    ${stockBadge}
                </div>
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-primary fw-bold">${price}</p>
                <p class="card-text small text-muted">${product.category || 'Uncategorized'}</p>
                <div class="mt-auto d-flex justify-content-between">
                    <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        col.appendChild(productCard);
        row.appendChild(col);
    });
    
    fragment.appendChild(row);
    productsGrid.appendChild(fragment);
}

// Update pagination controls
function updatePagination() {
    const pagination = elements.pagination;
    if (!pagination) return;

    pagination.innerHTML = '';

    const totalPages = Math.ceil(state.filteredProducts.length / state.productsPerPage);

    if (totalPages <= 1) return; // No pagination needed for 1 or less pages

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${state.currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.currentPage > 1) {
            state.currentPage--;
            displayProducts();
        }
    });
    pagination.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === state.currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener('click', (e) => {
            e.preventDefault();
            state.currentPage = i;
            displayProducts();
        });
        pagination.appendChild(pageLi);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${state.currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.currentPage < totalPages) {
            state.currentPage++;
            displayProducts();
        }
    });
    pagination.appendChild(nextLi);
}

// Show product modal for add/edit
function showProductModal(product = null) {
    resetProductForm();
    if (product) {
        elements.productIdInput.value = product.id;
        elements.productNameInput.value = product.name;
        elements.productPriceInput.value = product.price;
        elements.productStockInput.value = product.stock;
        elements.productCategorySelect.value = product.category;
        elements.productDescriptionInput.value = product.description;
        elements.inStockCheckbox.checked = product.inStock;
        if (product.imageUrl) {
            elements.productImagePreview.src = product.imageUrl;
            elements.productImagePreview.style.display = 'block';
        }
        elements.saveProductBtn.textContent = 'Update Product';
    } else {
        elements.saveProductBtn.textContent = 'Add Product';
    }
    elements.productModal.show();
}

// Handle product form submission
async function handleProductFormSubmit(event) {
    event.preventDefault();
    const productId = elements.productIdInput.value;
    const isEditing = !!productId;

    const productData = {
        name: elements.productNameInput.value,
        price: parseFloat(elements.productPriceInput.value),
        stock: parseInt(elements.productStockInput.value),
        category: elements.productCategorySelect.value,
        description: elements.productDescriptionInput.value,
        inStock: elements.inStockCheckbox.checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const imageFile = elements.productImageInput.files[0];

    try {
        showLoadingState(true);
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, productId || productData.name);
            productData.imageUrl = imageUrl;
        }

        if (isEditing) {
            await window.db.collection('products').doc(productId).update(productData);
            console.log('Product updated successfully:', productId);
        } else {
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await window.db.collection('products').add(productData);
            console.log('Product added successfully with ID:', docRef.id);
        }
        elements.productModal.hide();
        await loadProducts(); // Reload products after add/edit
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product: ' + error.message);
    } finally {
        showLoadingState(false);
    }
}

// Upload image to Firebase Storage
async function uploadImage(file, productName) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(`product_images/${productName}_${Date.now()}_${file.name}`);
    const snapshot = await imageRef.put(file);
    return await snapshot.ref.getDownloadURL();
}

// Edit product
async function editProduct(id) {
    try {
        showLoadingState(true);
        const doc = await window.db.collection('products').doc(id).get();
        if (doc.exists) {
            showProductModal({ id: doc.id, ...doc.data() });
        } else {
            alert('Product not found!');
        }
    } catch (error) {
        console.error('Error fetching product for edit:', error);
        alert('Failed to load product for editing: ' + error.message);
    } finally {
        showLoadingState(false);
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        showLoadingState(true);
        // Optional: Delete image from storage if imageUrl exists
        const productDoc = await window.db.collection('products').doc(id).get();
        const productData = productDoc.data();
        if (productData && productData.imageUrl) {
            const imageRef = firebase.storage().refFromURL(productData.imageUrl);
            await imageRef.delete().catch(error => console.warn('Could not delete old image:', error.message));
        }

        await window.db.collection('products').doc(id).delete();
        console.log('Product deleted successfully:', id);
        await loadProducts(); // Reload products after deletion
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
    } finally {
        showLoadingState(false);
    }
}

// Sidebar toggle for smaller screens
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('wrapper').classList.toggle('toggled');
});