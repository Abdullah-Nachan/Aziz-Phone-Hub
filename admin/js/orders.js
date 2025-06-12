/**
 * Admin Orders Management for Aziz Phone Hub
 * Handles order listing, viewing details, and status updates
 */

// Global variables
let currentPage = 1;
let ordersPerPage = 10;
let totalOrders = 0;
let allOrders = [];
let filteredOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuth();
    
    // Load orders
    loadOrders();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Check if user is authenticated
 */
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (!user) {
            // Redirect to login page if not authenticated
            window.location.href = 'index.html';
        } else {
            // Check if user is admin
            user.getIdTokenResult().then(idTokenResult => {
                if (!idTokenResult.claims.admin) {
                    // Redirect to login page if not admin
                    window.location.href = 'index.html';
                }
            });
        }
    });
}

/**
 * Load orders from Firestore
 */
function loadOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    
    if (!ordersTableBody || !loadingIndicator || !noOrdersMessage) return;
    
    // Show loading indicator
    loadingIndicator.classList.remove('d-none');
    ordersTableBody.innerHTML = '';
    noOrdersMessage.classList.add('d-none');
    
    // Check if Firebase is initialized
    if (!window.db && !firebase.apps.length) {
        console.error('Firebase not initialized');
        showFirebaseError(ordersTableBody, 'Firebase not initialized. Please refresh the page and try again.');
        return;
    }
    
    // Make sure we have a reference to Firestore
    const firestore = window.db || firebase.firestore();
    const ordersCollection = window.ordersRef || firestore.collection('orders');
    
    console.log('Loading orders from Firestore...');
    
    try {
        // Get orders from Firestore
        ordersCollection.orderBy('createdAt', 'desc').get()
            .then(snapshot => {
                console.log(`Found ${snapshot.size} orders`);
                
                // Hide loading indicator
                loadingIndicator.classList.add('d-none');
                
                // Clear orders array
                allOrders = [];
                
                // Check if there are any orders
                if (snapshot.empty) {
                    console.log('No orders found');
                    noOrdersMessage.classList.remove('d-none');
                    return;
                }
                
                // Add each order to the array
                snapshot.forEach(doc => {
                    const orderData = doc.data();
                    allOrders.push({
                        id: doc.id,
                        customer: orderData.customer || { name: 'Unknown Customer' },
                        items: orderData.items || [],
                        total: orderData.total || 0,
                        status: orderData.status || 'pending',
                        createdAt: orderData.createdAt ? orderData.createdAt.toDate() : new Date(),
                        shippingAddress: orderData.shippingAddress || {},
                        paymentMethod: orderData.paymentMethod || 'Unknown',
                        ...orderData
                    });
                });
                
                // Set filtered orders to all orders initially
                filteredOrders = [...allOrders];
                
                // Update total orders
                totalOrders = filteredOrders.length;
                
                // Display orders
                displayOrders();
            })
            .catch(error => {
                console.error('Error getting orders:', error);
                showFirebaseError(ordersTableBody, error.message);
            });
    } catch (error) {
        console.error('Error in loadOrders:', error);
        showFirebaseError(ordersTableBody, 'An unexpected error occurred. Please refresh the page and try again.');
    }
}

/**
 * Show Firebase error message
 * @param {HTMLElement} container - The container to show the error in
 * @param {string} message - The error message
 */
function showFirebaseError(container, message) {
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('d-none');
    }
    
    // Show error message
    container.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error Loading Orders</h4>
                    <p>${message}</p>
                    <hr>
                    <p class="mb-0">Please check your Firebase connection and try again.</p>
                    <button class="btn btn-primary mt-3" onclick="loadOrders()">Retry</button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Display orders in the table
 */
function displayOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    
    if (!ordersTableBody) return;
    
    // Clear orders table
    ordersTableBody.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, filteredOrders.length);
    const currentOrders = filteredOrders.slice(startIndex, endIndex);
    
    // Add each order to the table
    currentOrders.forEach(order => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(order.createdAt);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Format total
        const formattedTotal = '₹' + order.total.toLocaleString('en-IN');
        
        // Create status badge
        const statusBadge = getStatusBadge(order.status);
        
        row.innerHTML = `
            <td>${order.id.substring(0, 8)}...</td>
            <td>${order.customer.name}</td>
            <td>${formattedDate}</td>
            <td>${formattedTotal}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-primary view-order" data-id="${order.id}" data-bs-toggle="modal" data-bs-target="#orderDetailsModal">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        
        ordersTableBody.appendChild(row);
    });
    
    // Update pagination
    updatePagination();
    
    // Add event listeners to view buttons
    addViewButtonListeners();
}

/**
 * Get status badge HTML based on status
 * @param {string} status - The order status
 * @returns {string} - HTML for the status badge
 */
function getStatusBadge(status) {
    let badgeClass = '';
    let icon = '';
    
    switch (status.toLowerCase()) {
        case 'pending':
            badgeClass = 'bg-warning';
            icon = 'fa-clock';
            break;
        case 'processing':
            badgeClass = 'bg-info';
            icon = 'fa-cog';
            break;
        case 'shipped':
            badgeClass = 'bg-primary';
            icon = 'fa-shipping-fast';
            break;
        case 'delivered':
            badgeClass = 'bg-success';
            icon = 'fa-check-circle';
            break;
        case 'cancelled':
            badgeClass = 'bg-danger';
            icon = 'fa-times-circle';
            break;
        default:
            badgeClass = 'bg-secondary';
            icon = 'fa-question-circle';
    }
    
    return `<span class="badge ${badgeClass}"><i class="fas ${icon} me-1"></i> ${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

/**
 * Update pagination
 */
function updatePagination() {
    const pagination = document.getElementById('pagination');
    
    if (!pagination) return;
    
    // Clear pagination
    pagination.innerHTML = '';
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    
    // If only one page, hide pagination
    if (totalPages <= 1) {
        pagination.classList.add('d-none');
        return;
    }
    
    // Show pagination
    pagination.classList.remove('d-none');
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    pagination.appendChild(prevLi);
    
    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pagination.appendChild(pageLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    pagination.appendChild(nextLi);
    
    // Add event listeners to pagination buttons
    addPaginationListeners();
}

/**
 * Add event listeners to pagination buttons
 */
function addPaginationListeners() {
    const pagination = document.getElementById('pagination');
    
    if (!pagination) return;
    
    // Get all page links
    const pageLinks = pagination.querySelectorAll('.page-link');
    
    // Add click event listener to each page link
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get page number
            const pageText = this.textContent.trim();
            
            if (pageText === '«') {
                // Previous page
                if (currentPage > 1) {
                    currentPage--;
                    displayOrders();
                }
            } else if (pageText === '»') {
                // Next page
                const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    displayOrders();
                }
            } else {
                // Specific page
                currentPage = parseInt(pageText);
                displayOrders();
            }
        });
    });
}

/**
 * Add event listeners to view buttons
 */
function addViewButtonListeners() {
    const viewButtons = document.querySelectorAll('.view-order');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            viewOrderDetails(orderId);
        });
    });
}

/**
 * View order details
 * @param {string} orderId - The ID of the order to view
 */
function viewOrderDetails(orderId) {
    const orderDetailsContent = document.getElementById('orderDetailsContent');
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    
    if (!orderDetailsContent || !updateStatusBtn) return;
    
    // Show loading
    orderDetailsContent.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading order details...</p>
        </div>
    `;
    
    // Get order from Firestore
    db.collection('orders').doc(orderId).get()
        .then(doc => {
            if (!doc.exists) {
                orderDetailsContent.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        Order not found.
                    </div>
                `;
                updateStatusBtn.style.display = 'none';
                return;
            }
            
            const order = {
                id: doc.id,
                ...doc.data()
            };
            
            // Format date
            const date = order.createdAt ? order.createdAt.toDate() : new Date();
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Format total
            const formattedTotal = '₹' + order.total.toLocaleString('en-IN');
            
            // Create status badge
            const statusBadge = getStatusBadge(order.status);
            
            // Create order items container for horizontal display
            const orderItemsContainer = document.createElement('div');
            orderItemsContainer.id = 'orderItemsContainer';
            orderItemsContainer.className = 'row g-3 mb-4';
            
            // Add each item to the container
            order.items.forEach(item => {
                // Format price and calculate total
                const itemPrice = parseFloat(item.price) || 0;
                const itemQuantity = parseInt(item.quantity) || 1;
                const totalPrice = (itemPrice * itemQuantity).toFixed(2);
                
                // Create a column for each item
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-6 col-lg-4';
                
                // Create the item card
                colDiv.innerHTML = `
                    <div class="card h-100">
                        <div class="row g-0">
                            <div class="col-4">
                                <img src="${item.image || '../images/placeholder.svg'}" 
                                     alt="${item.name}" 
                                     onerror="this.src='../images/placeholder.svg'" 
                                     class="img-fluid rounded-start h-100 w-100 object-fit-cover">
                            </div>
                            <div class="col-8">
                                <div class="card-body p-3">
                                    <h6 class="card-title">${item.name}</h6>
                                    <p class="card-text mb-1 small">Price: ₹${itemPrice.toFixed(2)}</p>
                                    <p class="card-text mb-1 small">Quantity: ${itemQuantity}</p>
                                    <p class="card-text fw-bold">Total: ₹${totalPrice}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                orderItemsContainer.appendChild(colDiv);
            });
            
            // Convert to HTML string
            const itemsHtml = orderItemsContainer.outerHTML;
            
            // Create shipping address HTML
            const shippingAddress = order.shippingAddress || {};
            const addressHtml = `
                <p class="mb-1">${shippingAddress.name || order.customer.name}</p>
                <p class="mb-1">${shippingAddress.street || ''}</p>
                <p class="mb-1">${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zip || ''}</p>
                <p class="mb-1">${shippingAddress.country || ''}</p>
                <p class="mb-0">${shippingAddress.phone || order.customer.phone || ''}</p>
            `;
            
            // Set order details HTML
            orderDetailsContent.innerHTML = `
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h5>Order Information</h5>
                        <p class="mb-1"><strong>Order ID:</strong> ${order.id}</p>
                        <p class="mb-1"><strong>Date:</strong> ${formattedDate}</p>
                        <p class="mb-1"><strong>Status:</strong> ${statusBadge}</p>
                        <p class="mb-0"><strong>Payment Method:</strong> ${order.paymentMethod || 'Unknown'}</p>
                    </div>
                    <div class="col-md-6">
                        <h5>Customer Information</h5>
                        <p class="mb-1"><strong>Name:</strong> ${order.customer.name}</p>
                        <p class="mb-1"><strong>Email:</strong> ${order.customer.email || 'N/A'}</p>
                        <p class="mb-0"><strong>Phone:</strong> ${order.customer.phone || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h5>Shipping Address</h5>
                        ${addressHtml}
                    </div>
                    <div class="col-md-6">
                        <h5>Order Summary</h5>
                        <p class="mb-1"><strong>Subtotal:</strong> ₹${(order.subtotal || order.total).toLocaleString('en-IN')}</p>
                        <p class="mb-1"><strong>Shipping:</strong> ₹${(order.shipping || 0).toLocaleString('en-IN')}</p>
                        <p class="mb-1"><strong>Tax:</strong> ₹${(order.tax || 0).toLocaleString('en-IN')}</p>
                        <p class="mb-0"><strong>Total:</strong> ${formattedTotal}</p>
                    </div>
                </div>
                
                <h5>Order Items</h5>
                ${itemsHtml}
                
                <div class="mt-4">
                    <h5>Update Status</h5>
                    <select id="orderStatus" class="form-select">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            `;
            
            // Show update status button
            updateStatusBtn.style.display = 'block';
            
            // Add event listener to update status button
            updateStatusBtn.onclick = function() {
                updateOrderStatus(orderId);
            };
        })
        .catch(error => {
            console.error('Error getting order details:', error);
            orderDetailsContent.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Error loading order details. Please try again later.
                </div>
            `;
            updateStatusBtn.style.display = 'none';
        });
}

/**
 * Update order status
 * @param {string} orderId - The ID of the order to update
 */
function updateOrderStatus(orderId) {
    const orderStatus = document.getElementById('orderStatus');
    
    if (!orderStatus) return;
    
    const status = orderStatus.value;
    
    // Update order status in Firestore
    db.collection('orders').doc(orderId).update({
        status: status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // Show success message
        Swal.fire({
            title: 'Success',
            text: 'Order status updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
        modal.hide();
        
        // Reload orders
        loadOrders();
    })
    .catch(error => {
        console.error('Error updating order status:', error);
        
        // Show error message
        Swal.fire({
            title: 'Error',
            text: 'Error updating order status. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Refresh orders button
    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', loadOrders);
    }
    
    // Export orders button
    const exportOrdersBtn = document.getElementById('exportOrdersBtn');
    if (exportOrdersBtn) {
        exportOrdersBtn.addEventListener('click', exportOrders);
    }
    
    // Filter button
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', filterOrders);
    }
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterOrders();
            }
        });
    }
}

/**
 * Filter orders
 */
function filterOrders() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (!searchInput || !statusFilter || !sortBy) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    const sort = sortBy.value;
    
    // Filter orders
    filteredOrders = allOrders.filter(order => {
        // Filter by search term
        const matchesSearch = !searchTerm || 
            order.id.toLowerCase().includes(searchTerm) ||
            order.customer.name.toLowerCase().includes(searchTerm) ||
            (order.customer.email && order.customer.email.toLowerCase().includes(searchTerm));
        
        // Filter by status
        const matchesStatus = !status || order.status === status;
        
        return matchesSearch && matchesStatus;
    });
    
    // Sort orders
    filteredOrders.sort((a, b) => {
        switch (sort) {
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'total-asc':
                return a.total - b.total;
            case 'total-desc':
                return b.total - a.total;
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Display filtered orders
    displayOrders();
}

/**
 * Export orders to CSV
 */
function exportOrders() {
    // Create CSV content
    let csvContent = 'Order ID,Customer,Email,Date,Total,Status\n';
    
    filteredOrders.forEach(order => {
        // Format date
        const date = new Date(order.createdAt);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Format total
        const formattedTotal = order.total.toLocaleString('en-IN');
        
        // Add row to CSV
        csvContent += `"${order.id}","${order.customer.name}","${order.customer.email || ''}","${formattedDate}","₹${formattedTotal}","${order.status}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

/**
 * Logout function
 */
function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error signing out:', error);
        });
}
