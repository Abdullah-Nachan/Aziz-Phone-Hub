/**
 * Admin Dashboard for Aziz Phone Hub
 * Handles dashboard statistics and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load dashboard data
    loadDashboardData();
});

// Load dashboard data
function loadDashboardData() {
    // Load stats
    loadStats();
    
    // Load recent orders
    loadRecentOrders();
    
    // Load low stock products
    loadLowStockProducts();
}

// Load stats
function loadStats() {
    // Get total products
    db.collection('products').get().then(snapshot => {
        document.getElementById('total-products').textContent = snapshot.size;
    }).catch(error => {
        console.error('Error getting products:', error);
    });
    
    // Get total orders
    db.collection('orders').get().then(snapshot => {
        document.getElementById('total-orders').textContent = snapshot.size;
    }).catch(error => {
        console.error('Error getting orders:', error);
    });
    
    // Get pending orders
    db.collection('orders').where('status', '==', 'pending').get().then(snapshot => {
        document.getElementById('pending-orders').textContent = snapshot.size;
    }).catch(error => {
        console.error('Error getting pending orders:', error);
    });
    
    // Get total categories
    db.collection('categories').get().then(snapshot => {
        document.getElementById('total-categories').textContent = snapshot.size;
    }).catch(error => {
        console.error('Error getting categories:', error);
        // Fallback: Get unique categories from products
        db.collection('products').get().then(productsSnapshot => {
            const categories = new Set();
            productsSnapshot.forEach(doc => {
                const product = doc.data();
                if (product.category) {
                    categories.add(product.category);
                }
            });
            document.getElementById('total-categories').textContent = categories.size;
        }).catch(error => {
            console.error('Error getting product categories:', error);
        });
    });
}

// Load recent orders
function loadRecentOrders() {
    const recentOrdersTable = document.getElementById('recent-orders-table');
    
    if (!recentOrdersTable) return;
    
    // Clear table
    recentOrdersTable.innerHTML = '';
    
    // Get recent orders
    db.collection('orders')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                recentOrdersTable.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const order = doc.data();
                const orderId = doc.id;
                const date = order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${orderId.substring(0, 8)}</td>
                    <td>${order.customerName || 'N/A'}</td>
                    <td>${date}</td>
                    <td>${order.totalAmount || 'N/A'}</td>
                    <td>
                        <span class="order-status status-${order.status || 'pending'}">
                            ${order.status || 'pending'}
                        </span>
                    </td>
                    <td>
                        <a href="order-details.html?id=${orderId}" class="btn btn-sm btn-primary">
                            <i class="fas fa-eye"></i>
                        </a>
                    </td>
                `;
                
                recentOrdersTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error getting recent orders:', error);
            recentOrdersTable.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading orders</td></tr>';
        });
}

// Load low stock products
function loadLowStockProducts() {
    const lowStockTable = document.getElementById('low-stock-table');
    
    if (!lowStockTable) return;
    
    // Clear table
    lowStockTable.innerHTML = '';
    
    // Get low stock products
    db.collection('products')
        .where('stock', '<', 10)
        .orderBy('stock', 'asc')
        .limit(5)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                // If no products with stock field, get all products
                db.collection('products')
                    .limit(5)
                    .get()
                    .then(allSnapshot => {
                        if (allSnapshot.empty) {
                            lowStockTable.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
                            return;
                        }
                        
                        allSnapshot.forEach(doc => {
                            const product = doc.data();
                            const productId = doc.id;
                            
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${productId.substring(0, 8)}</td>
                                <td>${product.name || 'N/A'}</td>
                                <td>${product.category || 'N/A'}</td>
                                <td>${product.price || 'N/A'}</td>
                                <td>${product.stock || 'Not tracked'}</td>
                                <td>
                                    <a href="edit-product.html?id=${productId}" class="btn btn-sm btn-primary">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                </td>
                            `;
                            
                            lowStockTable.appendChild(row);
                        });
                    })
                    .catch(error => {
                        console.error('Error getting all products:', error);
                        lowStockTable.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading products</td></tr>';
                    });
                return;
            }
            
            snapshot.forEach(doc => {
                const product = doc.data();
                const productId = doc.id;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${productId.substring(0, 8)}</td>
                    <td>${product.name || 'N/A'}</td>
                    <td>${product.category || 'N/A'}</td>
                    <td>${product.price || 'N/A'}</td>
                    <td>
                        <span class="badge bg-danger">${product.stock || 0}</span>
                    </td>
                    <td>
                        <a href="edit-product.html?id=${productId}" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i>
                        </a>
                    </td>
                `;
                
                lowStockTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error getting low stock products:', error);
            lowStockTable.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading products</td></tr>';
        });
}
