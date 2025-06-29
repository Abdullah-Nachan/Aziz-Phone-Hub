/**
 * Orders page functionality
 * Displays user orders and order details
 */

import { auth, db } from './firebase-utils.js';
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!auth.currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user orders
    loadUserOrders();
    
    // Setup event listeners
    setupOrdersEventListeners();
});

// Load user orders
async function loadUserOrders() {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        // Show loading
        const ordersContainer = document.getElementById('orders-container');
        if (ordersContainer) {
            ordersContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><p class="mt-2">Loading orders...</p></div>';
        }
        
        // Get orders from user's subcollection
        const userOrdersRef = collection(db, 'users', user.uid, 'orders');
        const q = query(userOrdersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Render orders
        renderOrders(orders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders. Please try again.');
    }
}

// Render orders
function renderOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                <h4>No Orders Yet</h4>
                <p class="text-muted">You haven't placed any orders yet.</p>
                <a href="index.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    const ordersHTML = orders.map(order => `
        <div class="card mb-3 shadow-sm">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">Order #${order.orderId || order.id}</h6>
                            <span class="badge ${getStatusBadgeClass(order.status)}">${formatStatus(order.status)}</span>
                        </div>
                        <p class="text-muted mb-1">
                            <small>Placed on ${formatDate(order.createdAt)}</small>
                        </p>
                        <p class="mb-1">
                            <strong>Total:</strong> ₹${order.total.toFixed(2)}
                        </p>
                        <p class="mb-0">
                            <strong>Items:</strong> ${order.items.length} item${order.items.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewOrderDetails('${order.id}')">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    ordersContainer.innerHTML = ordersHTML;
}

// View order details
async function viewOrderDetails(orderId) {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        // Get order details
        const orderDoc = await getDoc(doc(db, 'users', user.uid, 'orders', orderId));
        
        if (!orderDoc.exists()) {
            showError('Order not found.');
            return;
        }
        
        const order = orderDoc.data();
        
        // Show order details modal
        showOrderDetailsModal(order);
        
    } catch (error) {
        console.error('Error loading order details:', error);
        showError('Failed to load order details.');
    }
}

// Show order details modal
function showOrderDetailsModal(order) {
    const itemsHTML = order.items.map(item => `
        <div class="d-flex align-items-center mb-3">
            <img src="${item.image}" alt="${item.name}" class="rounded me-3" style="width: 60px; height: 60px; object-fit: cover;">
            <div class="flex-grow-1">
                <h6 class="mb-1">${item.name}</h6>
                <p class="text-muted mb-0">₹${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <div class="text-end">
                <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
        </div>
    `).join('');
    
    const customerDetails = order.customerDetails;
    
    Swal.fire({
        title: `Order #${order.orderId || order.id}`,
        html: `
            <div class="text-start">
                <div class="row">
                    <div class="col-md-6">
                        <h6>Order Information</h6>
                        <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(order.status)}">${formatStatus(order.status)}</span></p>
                        <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Not specified'}</p>
                        <p><strong>Shipping:</strong> ${order.shippingOption || 'Standard'}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Customer Details</h6>
                        <p><strong>Name:</strong> ${customerDetails.firstName} ${customerDetails.lastName}</p>
                        <p><strong>Email:</strong> ${customerDetails.email}</p>
                        <p><strong>Phone:</strong> ${customerDetails.phone}</p>
                        <p><strong>Address:</strong> ${customerDetails.address}, ${customerDetails.state} ${customerDetails.zip}</p>
                    </div>
                </div>
                
                <hr>
                
                <h6>Order Items</h6>
                ${itemsHTML}
                
                <hr>
                
                <div class="text-end">
                    <h5>Total: ₹${order.total.toFixed(2)}</h5>
                </div>
            </div>
        `,
        width: '800px',
        confirmButtonText: 'Close',
        showCloseButton: true
    });
}

// Setup orders event listeners
function setupOrdersEventListeners() {
    // Add any additional event listeners here
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch (status) {
        case 'confirmed':
        case 'paid':
            return 'bg-success';
        case 'pending':
            return 'bg-warning';
        case 'cancelled':
            return 'bg-danger';
        case 'shipped':
            return 'bg-info';
        case 'delivered':
            return 'bg-success';
        default:
            return 'bg-secondary';
    }
}

// Format status
function formatStatus(status) {
    switch (status) {
        case 'confirmed':
            return 'Confirmed';
        case 'pending':
            return 'Pending';
        case 'cancelled':
            return 'Cancelled';
        case 'shipped':
            return 'Shipped';
        case 'delivered':
            return 'Delivered';
        case 'paid':
            return 'Paid';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show error message
function showError(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

// Make functions globally available
window.viewOrderDetails = viewOrderDetails; 