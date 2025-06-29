// Desktop navigation
const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('.section');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.getAttribute('data-section');
        if (sectionId) {
            // Remove active class from all menu items
            menuItems.forEach(mi => mi.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            // Show selected section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        }
    });
});

// Mobile navigation
function showMobileSection(sectionId) {
    // Hide mobile menu/sections
    var mobileSections = document.querySelector('.mobile-sections');
    if (mobileSections) mobileSections.style.display = 'none';
    // Show main content
    var mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.display = '';
    // Show back button (only in mobile)
    var backBtn = document.getElementById('mobile-back-btn');
    if (backBtn) backBtn.style.display = '';
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Back button logic for mobile

document.addEventListener('DOMContentLoaded', function() {
    var backBtn = document.getElementById('mobile-back-btn');
    if (backBtn) {
        backBtn.onclick = function() {
            // Hide main content, show mobile menu
            var mainContent = document.querySelector('.main-content');
            var mobileSections = document.querySelector('.mobile-sections');
            if (mainContent) mainContent.style.display = 'none';
            if (mobileSections) mobileSections.style.display = '';
            // Hide back button
            backBtn.style.display = 'none';
        };
    }
});

// Help center functions
function sendEmail() {
    window.location.href = 'mailto:support@shopkart.com?subject=Support Request';
}

function callSupport() {
    window.location.href = 'tel:+919721934560';
}

function openChat() {
    alert('Live chat feature coming soon!');
}

// Address management
function showAddAddressForm() {
    const addressList = document.querySelector('.address-list');
    const newAddressForm = document.createElement('div');
    newAddressForm.className = 'address-item';
    newAddressForm.innerHTML = `
        <h4>Add New Address</h4>
        <form onsubmit="saveAddress(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" required>
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea required rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>City</label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>State</label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>PIN Code</label>
                    <input type="text" required>
                </div>
            </div>
            <div class="form-group">
                <label>Address Type</label>
                <select required>
                    <option value="">Select Type</option>
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div style="margin-top: 20px;">
                <button type="submit" class="btn btn-primary">Save Address</button>
                <button type="button" class="btn btn-secondary" onclick="cancelAddAddress(this)" style="margin-left: 10px;">Cancel</button>
            </div>
        </form>
    `;
    addressList.appendChild(newAddressForm);
}

function saveAddress(event) {
    event.preventDefault();
    alert('Address saved successfully!');
    event.target.closest('.address-item').remove();
}

function cancelAddAddress(button) {
    button.closest('.address-item').remove();
}

// Sidebar Auth Button logic
function updateSidebarAuthButton() {
    const btn = document.getElementById('sidebar-auth-btn');
    // Example: Use Firebase Auth if available
    let isLoggedIn = false;
    if (window.firebase && firebase.auth) {
        isLoggedIn = !!firebase.auth().currentUser;
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                btn.textContent = 'Logout';
            } else {
                btn.textContent = 'Login';
            }
        });
    } else {
        // Fallback: check localStorage for 'user' key
        isLoggedIn = !!localStorage.getItem('user');
        btn.textContent = isLoggedIn ? 'Logout' : 'Login';
    }
    btn.onclick = function() {
        if (btn.textContent === 'Logout') {
            if (window.firebase && firebase.auth) {
                firebase.auth().signOut().then(function() {
                    window.location.reload();
                });
            } else {
                localStorage.removeItem('user');
                window.location.reload();
            }
        } else {
            window.location.href = 'auth.html';
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    updateSidebarAuthButton();
});

// Initialize

// DOMContentLoaded event for profile page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Profile page loaded successfully');
    });
} else {
    console.log('Profile page loaded successfully');
}

// --- FIREBASE PROFILE PAGE DYNAMIC LOGIC ---

document.addEventListener('DOMContentLoaded', function() {
    // Listen for auth state
    firebase.auth().onAuthStateChanged(function(user) {
        if (user && !user.isAnonymous) {
            loadUserProfile(user.uid);
            loadUserOrders(user.uid);
            loadUserAddresses(user.uid);
        } else {
            // Not logged in: show empty states
            showProfileEmptyState();
            showOrdersEmptyState();
            showAddressesEmptyState();
        }
    });

    // Wishlist/Cart button redirects
    document.getElementById('go-to-wishlist-btn').onclick = function() {
        window.location.href = 'wishlist.html';
    };
    document.getElementById('go-to-cart-btn').onclick = function() {
        window.location.href = 'cart.html';
    };
    document.getElementById('shop-now-btn').onclick = function() {
        window.location.href = 'shop.html';
    };
    document.getElementById('add-address-btn').onclick = showAddAddressInlineForm;
    document.getElementById('add-address-empty-btn').onclick = showAddAddressInlineForm;
});

// --- PROFILE ---
function loadUserProfile(uid) {
    const ref = firebase.firestore().collection('users').doc(uid);
    ref.get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            setProfileFields(data);
        }
    });
    // Edit/Save/Cancel logic
    document.getElementById('edit-profile-btn').onclick = enableProfileEdit;
    document.getElementById('save-profile-btn').onclick = function() { saveProfile(uid); };
    document.getElementById('cancel-profile-btn').onclick = disableProfileEdit;
}
function setProfileFields(data) {
    document.getElementById('profile-first-name').value = data.firstName || '';
    document.getElementById('profile-last-name').value = data.lastName || '';
    document.getElementById('profile-gender').value = data.gender || '';
    document.getElementById('profile-email').value = data.email || '';
    document.getElementById('profile-phone').value = data.phone || '';
}
function enableProfileEdit() {
    ['profile-first-name','profile-last-name','profile-gender','profile-email','profile-phone'].forEach(id => {
        const el = document.getElementById(id);
        el.removeAttribute('readonly');
        el.removeAttribute('disabled');
    });
    document.getElementById('edit-profile-btn').style.display = 'none';
    document.getElementById('save-profile-btn').style.display = '';
    document.getElementById('cancel-profile-btn').style.display = '';
}
function disableProfileEdit() {
    ['profile-first-name','profile-last-name','profile-gender','profile-email','profile-phone'].forEach(id => {
        const el = document.getElementById(id);
        el.setAttribute('readonly', '');
        el.setAttribute('disabled', '');
    });
    document.getElementById('edit-profile-btn').style.display = '';
    document.getElementById('save-profile-btn').style.display = 'none';
    document.getElementById('cancel-profile-btn').style.display = 'none';
}
function saveProfile(uid) {
    const ref = firebase.firestore().collection('users').doc(uid);
    const data = {
        firstName: document.getElementById('profile-first-name').value,
        lastName: document.getElementById('profile-last-name').value,
        gender: document.getElementById('profile-gender').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value
    };
    ref.set(data, { merge: true }).then(() => {
        disableProfileEdit();
        setProfileFields(data);
        alert('Profile updated!');
    });
}
function showProfileEmptyState() {
    setProfileFields({});
    document.getElementById('edit-profile-btn').style.display = 'none';
}

// --- ORDERS ---
function loadUserOrders(uid) {
    const ref = firebase.firestore().collection('users').doc(uid).collection('orders');
    ref.get().then(snapshot => {
        const orders = [];
        snapshot.forEach(doc => orders.push(doc.data()));
        if (orders.length === 0) {
            showOrdersEmptyState();
        } else {
            renderOrdersList(orders);
        }
    });
}
function renderOrdersList(orders) {
    const list = document.getElementById('orders-list');
    list.innerHTML = '';
    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
            <div class="order-info">
                <h4>Order #${order.orderId || ''}</h4>
                <p>Placed on: ${order.date || ''}</p>
                <p>Total: ₹${order.total || ''}</p>
            </div>
            <div class="order-status ${order.status === 'Delivered' ? 'status-delivered' : 'status-pending'}">${order.status || ''}</div>
        `;
        list.appendChild(div);
    });
    document.getElementById('orders-empty').style.display = 'none';
}
function showOrdersEmptyState() {
    document.getElementById('orders-list').innerHTML = '';
    document.getElementById('orders-empty').style.display = '';
}

// --- ADDRESSES ---
function loadUserAddresses(uid) {
    const ref = firebase.firestore().collection('users').doc(uid).collection('addresses');
    ref.get().then(snapshot => {
        const addresses = [];
        snapshot.forEach(doc => addresses.push({id: doc.id, ...doc.data()}));
        if (addresses.length === 0) {
            showAddressesEmptyState();
        } else {
            renderAddressesList(addresses, uid);
        }
    });
}
function renderAddressesList(addresses, uid) {
    const list = document.getElementById('addresses-list');
    list.innerHTML = '';
    addresses.forEach(address => {
        const div = document.createElement('div');
        div.className = 'address-item';
        div.innerHTML = `
            <div class="address-header">
                <span class="address-type">${address.type || ''}</span>
                <div>
                    <button class="btn btn-secondary" onclick="editAddress('${address.id}')">Edit</button>
                    <button class="btn btn-secondary" onclick="deleteAddress('${address.id}', '${uid}')">Delete</button>
                </div>
            </div>
            <p><strong>${address.fullName || ''}</strong></p>
            <p>${address.address || ''}</p>
            <p>${address.city || ''}, ${address.state || ''} ${address.pin || ''}</p>
            <p>Phone: ${address.phone || ''}</p>
        `;
        list.appendChild(div);
    });
    document.getElementById('addresses-empty').style.display = 'none';
}
function showAddressesEmptyState() {
    document.getElementById('addresses-list').innerHTML = '';
    document.getElementById('addresses-empty').style.display = '';
}
function showAddAddressInlineForm() {
    // Show inline form for adding address
    const list = document.getElementById('addresses-list');
    const formDiv = document.createElement('div');
    formDiv.className = 'address-item';
    formDiv.innerHTML = `
        <h4>Add New Address</h4>
        <form id="add-address-form">
            <div class="form-row">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="fullName" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" required>
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" required rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>City</label>
                    <input type="text" name="city" required>
                </div>
                <div class="form-group">
                    <label>State</label>
                    <input type="text" name="state" required>
                </div>
                <div class="form-group">
                    <label>PIN Code</label>
                    <input type="text" name="pin" required>
                </div>
            </div>
            <div class="form-group">
                <label>Address Type</label>
                <select name="type" required>
                    <option value="">Select Type</option>
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div style="margin-top: 20px;">
                <button type="submit" class="btn btn-primary">Save Address</button>
                <button type="button" class="btn btn-secondary" onclick="this.closest('.address-item').remove()" style="margin-left: 10px;">Cancel</button>
            </div>
        </form>
    `;
    list.prepend(formDiv);
    document.getElementById('add-address-form').onsubmit = function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this).entries());
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('users').doc(user.uid).collection('addresses').add(data).then(() => {
                loadUserAddresses(user.uid);
            });
        }
    };
}
function editAddress(addressId) {
    // For simplicity, reload addresses and show an inline form for editing
    // (You can implement a more advanced inline edit if needed)
    const user = firebase.auth().currentUser;
    if (!user) return;
    const ref = firebase.firestore().collection('users').doc(user.uid).collection('addresses').doc(addressId);
    ref.get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const list = document.getElementById('addresses-list');
            list.innerHTML = '';
            const formDiv = document.createElement('div');
            formDiv.className = 'address-item';
            formDiv.innerHTML = `
                <h4>Edit Address</h4>
                <form id="edit-address-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="fullName" value="${data.fullName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value="${data.phone || ''}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea name="address" required rows="3">${data.address || ''}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>City</label>
                            <input type="text" name="city" value="${data.city || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>State</label>
                            <input type="text" name="state" value="${data.state || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>PIN Code</label>
                            <input type="text" name="pin" value="${data.pin || ''}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Address Type</label>
                        <select name="type" required>
                            <option value="">Select Type</option>
                            <option value="home" ${data.type === 'home' ? 'selected' : ''}>Home</option>
                            <option value="work" ${data.type === 'work' ? 'selected' : ''}>Work</option>
                            <option value="other" ${data.type === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div style="margin-top: 20px;">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" class="btn btn-secondary" onclick="loadUserAddresses('${user.uid}')" style="margin-left: 10px;">Cancel</button>
                    </div>
                </form>
            `;
            list.appendChild(formDiv);
            document.getElementById('edit-address-form').onsubmit = function(e) {
                e.preventDefault();
                const newData = Object.fromEntries(new FormData(this).entries());
                ref.set(newData, { merge: true }).then(() => {
                    loadUserAddresses(user.uid);
                });
            };
        }
    });
}
function deleteAddress(addressId, uid) {
    if (!confirm('Are you sure you want to delete this address?')) return;
    firebase.firestore().collection('users').doc(uid).collection('addresses').doc(addressId).delete().then(() => {
        loadUserAddresses(uid);
    });
}
// --- END FIREBASE PROFILE PAGE DYNAMIC LOGIC --- 