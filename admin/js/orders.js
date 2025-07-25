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
    window.auth.onAuthStateChanged(user => {
        if (!user) {
            // Redirect to login page if not authenticated
            window.location.href = 'index.html';
        } else {
            // Check if user is admin by email
            window.db.collection('admins').doc(user.email).get().then(docSnap => {
                if (!docSnap.exists) {
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
        ordersCollection.get()
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
                    let customer, items, total, status, createdAt, shippingAddress, paymentMethod, subtotal, shipping, tax;

                    if (orderData['order-details']) {
                        // New structure: fields are nested under 'order-details'
                        const od = orderData['order-details'];
                        customer = od.customerDetails || { name: 'Unknown Customer' };
                        items = od.items || [];
                        total = od.total || 0;
                        status = od.status || 'pending';
                        createdAt = od.createdAt ? new Date(od.createdAt) : new Date();
                        shippingAddress = od.shippingAddress || {};
                        paymentMethod = od.paymentMethod || 'Unknown';
                        subtotal = od.subtotal || od.total || 0;
                        shipping = od.shipping || 0;
                        tax = od.tax || 0;
                    } else {
                        // Old structure: fields at root
                        customer = orderData.customer || { name: 'Unknown Customer' };
                        items = orderData.items || [];
                        total = orderData.total || 0;
                        status = orderData.status || 'pending';
                        createdAt = orderData.createdAt ? orderData.createdAt.toDate() : new Date();
                        shippingAddress = orderData.shippingAddress || {};
                        paymentMethod = orderData.paymentMethod || 'Unknown';
                        subtotal = orderData.subtotal || orderData.total || 0;
                        shipping = orderData.shipping || 0;
                        tax = orderData.tax || 0;
                    }

                    allOrders.push({
                        id: doc.id,
                        customer,
                        items,
                        total,
                        status,
                        createdAt,
                        shippingAddress,
                        paymentMethod,
                        subtotal,
                        shipping,
                        tax,
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
    ordersTableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, filteredOrders.length);
    const currentOrders = filteredOrders.slice(startIndex, endIndex);
    currentOrders.forEach(order => {
        // Get customer name
        let customerName = 'Unknown Customer';
        if (order.customer) {
            if (order.customer.firstName) {
                customerName = `${order.customer.firstName} ${order.customer.lastName || ''}`.trim();
            } else if (order.customer.name) {
                customerName = order.customer.name;
            }
        }
        // Get date
        const date = order.createdAt ? new Date(order.createdAt) : new Date();
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // Get total
        const formattedTotal = '₹' + (order.total ? order.total.toLocaleString('en-IN') : '0');
        // Create status badge
        const statusBadge = getStatusBadge(order.status);
        const isVerified = order.status && order.status.toLowerCase() === 'verified';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id.substring(0, 8)}...</td>
            <td>${customerName}</td>
            <td>${formattedDate}</td>
            <td>${formattedTotal}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-primary view-order" data-id="${order.id}" data-bs-toggle="modal" data-bs-target="#orderDetailsModal">
                    <i class="fas fa-eye"></i> View
                </button>
                ${isVerified
                    ? `<button class="btn btn-sm btn-warning unverify-order ms-2" data-id="${order.id}"><i class="fas fa-undo"></i> Unverify</button>`
                    : `<button class="btn btn-sm btn-success verify-order ms-2" data-id="${order.id}"><i class="fas fa-check-circle"></i> Verify</button>`}
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
    updatePagination();
    addViewButtonListeners();
    addVerifyButtonListeners();
    addUnverifyButtonListeners();
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
        case 'verified':
            badgeClass = 'bg-success';
            icon = 'fa-check-circle';
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
 * Add event listeners to verify buttons
 */
function addVerifyButtonListeners() {
    document.querySelectorAll('.verify-order').forEach(btn => {
        btn.addEventListener('click', async function() {
            const orderId = this.getAttribute('data-id');
            if (!orderId) return;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            try {
                await window.db.collection('orders').doc(orderId).update({ status: 'verified' });
                Swal.fire({
                    title: 'Order Verified',
                    text: 'The order has been marked as verified.',
                    icon: 'success',
                    timer: 1200,
                    showConfirmButton: false
                });
                loadOrders();
            } catch (err) {
                Swal.fire('Error', 'Failed to verify order. Please try again.', 'error');
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-check-circle"></i> Verify';
            }
        });
    });
}

/**
 * Add event listeners to unverify buttons
 */
function addUnverifyButtonListeners() {
    document.querySelectorAll('.unverify-order').forEach(btn => {
        btn.addEventListener('click', async function() {
            const orderId = this.getAttribute('data-id');
            if (!orderId) return;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Unverifying...';
            try {
                await window.db.collection('orders').doc(orderId).update({ status: 'confirmed' });
                Swal.fire({
                    title: 'Order Unverified',
                    text: 'The order has been marked as unverified (confirmed).',
                    icon: 'success',
                    timer: 1200,
                    showConfirmButton: false
                });
                loadOrders();
            } catch (err) {
                Swal.fire('Error', 'Failed to unverify order. Please try again.', 'error');
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-undo"></i> Unverify';
            }
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
    orderDetailsContent.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading order details...</p>
        </div>
    `;
    window.db.collection('orders').doc(orderId).get()
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
            let order = { id: doc.id, ...doc.data() };
            let od = order['order-details'] || {};
            // Prefer nested structure if available
            const customer = od.customerDetails || order.customer || { name: 'Unknown Customer' };
            const items = od.items || order.items || [];
            const total = od.total || order.total || 0;
            const status = od.status || order.status || 'pending';
            const createdAt = od.createdAt ? new Date(od.createdAt) : (order.createdAt ? order.createdAt.toDate() : new Date());
            const shippingAddress = od.shippingAddress || order.shippingAddress || {};
            const paymentMethod = od.paymentMethod || order.paymentMethod || 'Unknown';
            const subtotal = od.subtotal || od.total || order.subtotal || order.total || 0;
            const shipping = od.shipping || order.shipping || 0;
            const tax = od.tax || order.tax || 0;
            // Format date
            const formattedDate = createdAt.toLocaleDateString() + ' ' + createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Format total
            const formattedTotal = '₹' + (total ? total.toLocaleString('en-IN') : '0');
            // Create status badge
            const statusBadge = getStatusBadge(status);
            // Create order items container for horizontal display
            const orderItemsContainer = document.createElement('div');
            orderItemsContainer.id = 'orderItemsContainer';
            orderItemsContainer.className = 'row g-3 mb-4';
            // Create shipping address HTML (show all fields except phone)
            const addressLines = [
                shippingAddress.name || customer.name || customer.firstName || '',
                shippingAddress.address || '',
                shippingAddress.address2 || '',
                [shippingAddress.city, shippingAddress.state, shippingAddress.zip].filter(Boolean).join(', '),
                shippingAddress.country || ''
            ].filter(line => line && line.trim() !== '');
            const addressHtml = addressLines.map(line => `<p class="mb-1">${line}</p>`).join('');

            // Improved order item card formatting
            orderItemsContainer.innerHTML = '';
            items.forEach(item => {
                const itemPrice = parseFloat(item.price) || 0;
                const itemQuantity = parseInt(item.quantity) || 1;
                const totalPrice = (itemPrice * itemQuantity).toFixed(2);
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-6 col-lg-4';
                colDiv.innerHTML = `
                    <div class="card h-100 shadow-sm">
                        <img src="${item.image || '../images/placeholder.svg'}"
                             alt="${item.name}"
                             onerror="this.src='../images/placeholder.svg'"
                             class="img-fluid rounded-top"
                             style="height:120px;object-fit:contain;background:#f8f9fa;">
                        <div class="card-body p-2">
                            <h6 class="card-title mb-1" style="font-size:1rem;white-space:normal;word-break:break-word;">${item.name}</h6>
                            <p class="card-text mb-1 small">Price: ₹${itemPrice.toFixed(2)}</p>
                            <p class="card-text mb-1 small">Quantity: ${itemQuantity}</p>
                            <p class="card-text fw-bold mb-0">Total: ₹${totalPrice}</p>
                        </div>
                    </div>
                `;
                orderItemsContainer.appendChild(colDiv);
            });
            const itemsHtml = orderItemsContainer.outerHTML;
            // Get customer details from nested structure
            const customerDetails = od.customerDetails || order.customerDetails || {};
            const customerName = [customerDetails.firstName, customerDetails.lastName].filter(Boolean).join(' ') || customerDetails.name || 'N/A';
            // Create shipping address HTML from customerDetails (address, address2, and pincode)
            const customerAddressLines = [
                customerDetails.address || '',
                customerDetails.address2 || '',
                customerDetails.zip ? `Pincode: ${customerDetails.zip}` : ''
            ].filter(line => line && line.trim() !== '');
            const customerAddressHtml = customerAddressLines.map(line => `<p class="mb-1">${line}</p>`).join('');

            // Helper to generate copy icon HTML
            function copyIconHtml(value, label) {
                return `<i class='fas fa-copy ms-2 copy-icon' title='Copy ${label}' style='cursor:pointer;font-size:1rem;color:#0d6efd;' data-copy-value="${value.replace(/"/g, '&quot;')}"></i>`;
            }

            orderDetailsContent.innerHTML = `
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h5>Order Information</h5>
                        <p class="mb-1"><strong>Order ID:</strong> <span>${order.id}</span>${copyIconHtml(order.id, 'Order ID')}</p>
                        <p class="mb-1"><strong>Date:</strong> <span>${formattedDate}</span>${copyIconHtml(formattedDate, 'Date')}</p>
                        <p class="mb-1"><strong>Status:</strong> <span>${statusBadge}</span></p>
                        <p class="mb-0"><strong>Payment Method:</strong> <span>${paymentMethod}</span>${copyIconHtml(paymentMethod, 'Payment Method')}</p>
                    </div>
                    <div class="col-md-6">
                        <h5>Customer Information</h5>
                        <p class="mb-1"><strong>Name:</strong> <span>${customerName}</span>${copyIconHtml(customerName, 'Name')}</p>
                        <p class="mb-1"><strong>Email:</strong> <span>${customerDetails.email || 'N/A'}</span>${copyIconHtml(customerDetails.email || '', 'Email')}</p>
                        <p class="mb-0"><strong>Phone:</strong> <span>${customerDetails.phone || 'N/A'}</span>${copyIconHtml(customerDetails.phone || '', 'Phone')}</p>
                    </div>
                </div>
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h5>Shipping Address</h5>
                        ${customerAddressLines.map(line => `<span>${line}${copyIconHtml(line, 'Address')}</span>`).join('<br>')}
                    </div>
                    <div class="col-md-6">
                        <h5>Order Summary</h5>
                        <p class="mb-1"><strong>Subtotal:</strong> <span>₹${(subtotal).toLocaleString('en-IN')}</span>${copyIconHtml(subtotal.toLocaleString('en-IN'), 'Subtotal')}</p>
                        <p class="mb-1"><strong>Shipping:</strong> <span>₹${(shipping).toLocaleString('en-IN')}</span>${copyIconHtml(shipping.toLocaleString('en-IN'), 'Shipping')}</p>
                        <p class="mb-1"><strong>Tax:</strong> <span>₹${(tax).toLocaleString('en-IN')}</span>${copyIconHtml(tax.toLocaleString('en-IN'), 'Tax')}</p>
                        <p class="mb-0"><strong>Total:</strong> <span>${formattedTotal}</span>${copyIconHtml(formattedTotal, 'Total')}</p>
                    </div>
                </div>
                <h5>Order Items</h5>
                ${itemsHtml}
                <div class="mt-4">
                    <h5>Update Status</h5>
                    <select id="orderStatus" class="form-select">
                        <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        <option value="confirmed" ${status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="verified" ${status === 'verified' ? 'selected' : ''}>Verified</option>
                    </select>
                </div>
            `;
            updateStatusBtn.style.display = 'block';
            updateStatusBtn.onclick = function() {
                updateOrderStatus(orderId);
            };

            // Add event listeners for copy icons
            document.querySelectorAll('.copy-icon').forEach(icon => {
                icon.addEventListener('click', function(e) {
                    const value = this.getAttribute('data-copy-value');
                    if (value) {
                        navigator.clipboard.writeText(value);
                        this.title = 'Copied!';
                        this.style.color = '#198754';
                        setTimeout(() => {
                            this.title = 'Copy';
                            this.style.color = '#0d6efd';
                        }, 1200);
                    }
                    e.stopPropagation();
                });
            });
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
    window.db.collection('orders').doc(orderId).update({
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
        // Get customer info (support nested and flat)
        let customer = order.customer || {};
        let name = '';
        let phone = '';
        if (customer.firstName) {
            name = `${customer.firstName} ${customer.lastName || ''}`.trim();
        } else if (customer.name) {
            name = customer.name;
        }
        phone = customer.phone || '';
        // Filter by search term (order id, name, email, phone)
        const matchesSearch = !searchTerm ||
            order.id.toLowerCase().includes(searchTerm) ||
            name.toLowerCase().includes(searchTerm) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
            phone.includes(searchTerm);
        // Filter by status
        const matchesStatus = !status || (order.status && order.status === status);
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
    currentPage = 1;
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
    window.auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error signing out:', error);
        });
}

// Add 'Verified' to status filter dropdown (ensure it appears in All Statuses)
(function addVerifiedToStatusFilter() {
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter && !Array.from(statusFilter.options).some(opt => opt.value === 'verified')) {
        const opt = document.createElement('option');
        opt.value = 'verified';
        opt.textContent = 'Verified';
        statusFilter.appendChild(opt);
    }
})();
