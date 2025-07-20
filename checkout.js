/**
 * Checkout functionality for Aziz Phone Hub
 * Handles checkout process and form validation
 */

// Global cart data
let cartData = {
    items: [],
    total: 0
};

document.addEventListener('DOMContentLoaded', function() {
    const checkFirebase = setInterval(() => {
        if (window.firebaseInitialized) {
            clearInterval(checkFirebase);
            console.log('[DEBUG] Firebase initialized:', window.firebaseInitialized);
            firebase.auth().onAuthStateChanged(async function(user) {
                console.log('[DEBUG] onAuthStateChanged fired. User:', user);
                if (!user) {
                    // Guest user: load cart from localStorage and allow checkout
                    let items = JSON.parse(localStorage.getItem('cart')) || [];
                    if (!items || items.length === 0) {
                        alert('Your cart is empty. Please add items to your cart.');
                        window.location.href = 'cart.html';
                        return;
                    }
                    cartData = {
                        items,
                        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    };
                    renderCheckoutItems(cartData.items);
                    updateCheckoutSummary(cartData.items);
                    setupCheckoutEventListeners();
                    setupProceedButton(cartData.items);
                    return;
                }
                try {
                    const userRef = firebase.firestore().collection('users').doc(user.uid);
                    const userDoc = await userRef.get();
                    console.log('[DEBUG] Firestore user doc:', userDoc.exists ? userDoc.data() : null);
                    let items = [];
                    if (userDoc.exists) {
                        items = userDoc.data().cart || [];
                    }
                    if (!items || items.length === 0) {
                        alert('Your cart is empty in Firestore. Please add items to your cart.');
                        window.location.href = 'cart.html';
                        return;
                    }
                    cartData = {
                        items,
                        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    };
                    console.log('[DEBUG] Cart data for checkout:', cartData);
                    renderCheckoutItems(cartData.items);
                    updateCheckoutSummary(cartData.items);
                    setupCheckoutEventListeners();
                    setupProceedButton(cartData.items);
                } catch (error) {
                    console.error('[DEBUG] Error loading cart from Firestore:', error);
                    alert('Error loading cart from Firestore. See console for details.');
                    window.location.href = 'cart.html';
                }
            });
        } else {
            console.log('[DEBUG] Waiting for window.firebaseInitialized...');
        }
    }, 500);
});

function renderCheckoutItems(items) {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    if (!checkoutItemsContainer || !items) return;
    const itemsHTML = items.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center">
                <img src="${item.image}" alt="${item.name}" class="rounded me-3" style="width: 50px; height: 50px; object-fit: cover;">
                <div>
                    <h6 class="mb-1">${item.name}</h6>
                    <small class="text-muted">Qty: ${item.quantity}</small>
                </div>
            </div>
            <div class="text-end">
                <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
        </div>
    `).join('');
    checkoutItemsContainer.innerHTML = itemsHTML;
}

// Discount for prepaid
const PREPAID_DISCOUNT = 100;
let isPrepaidSelected = false;

function updateCheckoutSummary(items) {
    const subtotalElement = document.getElementById('summary-subtotal');
    const shippingElement = document.getElementById('summary-shipping');
    const totalElement = document.getElementById('summary-total');
    let discountRow = document.getElementById('summary-discount');
    if (!subtotalElement || !shippingElement || !totalElement) return;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    shippingElement.textContent = 'Free';
    // Discount logic
    if (isPrepaidSelected) {
        if (!discountRow) {
            discountRow = document.createElement('div');
            discountRow.className = 'd-flex justify-content-between mb-2';
            discountRow.id = 'summary-discount';
            // Insert after shipping row
            shippingElement.parentNode.parentNode.insertBefore(discountRow, shippingElement.parentNode.nextSibling);
        }
        discountRow.innerHTML = `<span class='text-success'>Prepaid Discount</span><span class='text-success'>-₹${PREPAID_DISCOUNT.toFixed(2)}</span>`;
        totalElement.textContent = `₹${(subtotal - PREPAID_DISCOUNT).toFixed(2)}`;
    } else {
        if (discountRow) discountRow.remove();
        totalElement.textContent = `₹${subtotal.toFixed(2)}`;
    }
}

// --- PHONE VERIFICATION LOGIC COMMENTED OUT ---
// In setupProceedButton, skip phone verification and proceed as before
function setupProceedButton(items) {
    const proceedBtn = document.getElementById('proceed-to-payment-btn');
    if (proceedBtn) {
        proceedBtn.onclick = function() {
            if (!validateCheckoutForm()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Form Incomplete',
                    text: 'Please fill all required fields before proceeding.'
                });
                return;
            }
            // Get phone number from form
            const phoneNumber = document.getElementById('phone').value.trim();
            // Validate phone number format
            if (!isValidPhone(phoneNumber)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Phone Number',
                    text: 'Please enter a valid 10-digit phone number.'
                });
                return;
            }
            // --- SKIP PHONE VERIFICATION ---
            // Directly show payment section or proceed as before
            // If you want to show payment section:
            document.getElementById('contact-info-card').style.display = 'none';
            document.getElementById('payment-section').style.display = 'block';
            updateCheckoutStepsForPayment();
            setupPaymentMethodSelection(cartData.items);
        };
    }
}

function updateCheckoutStepsForPayment() {
    // Set Payment step as active, previous as active, connectors as active
    document.getElementById('step-payment').classList.add('active');
    document.getElementById('connector-payment').classList.add('active');
}

function setupPaymentMethodSelection(items) {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const availableMethods = document.getElementById('available-methods');
    const codInfo = document.getElementById('cod-info');
    const confirmBtn = document.getElementById('confirm-payment-method');
    paymentOptions.forEach(option => {
        option.onclick = function() {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            if (radio.value === 'online') {
                isPrepaidSelected = true;
                availableMethods.style.display = 'block';
                if (codInfo) codInfo.style.display = 'none';
                confirmBtn.textContent = 'Pay Now';
            } else if (radio.value === 'cod') {
                isPrepaidSelected = false;
                if (availableMethods) availableMethods.style.display = 'none';
                if (codInfo) codInfo.style.display = 'block';
                confirmBtn.textContent = 'Place Order';
            } else {
                isPrepaidSelected = false;
                if (availableMethods) availableMethods.style.display = 'none';
                if (codInfo) codInfo.style.display = 'none';
                confirmBtn.textContent = 'Pay Now';
            }
            updateCheckoutSummary(items);
        };
    });
    confirmBtn.onclick = function() {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedMethod) {
            alert('Please select a payment method.');
            return;
        }
        if (selectedMethod.value === 'cod') {
            processCODOrder(items);
        } else if (selectedMethod.value === 'online') {
            processCheckout(items);
        }
    };
    // Set initial state
    updateCheckoutSummary(items);
}

// Add the COD info message and video to the payment section if not already present
function ensureCODInfoSection() {
    let codInfo = document.getElementById('cod-info');
    if (!codInfo) {
        const codOption = document.getElementById('cod-option');
        codInfo = document.createElement('div');
        codInfo.id = 'cod-info';
        codInfo.style.display = 'none';
        codInfo.className = 'mt-3';
        codInfo.innerHTML = `
            <div class="alert alert-info" style="white-space: pre-line;">
                <strong>Partial Cash on Delivery – ₹100 Advance Required</strong><br>
                Dear customer, to reduce fake & non-serious orders, we have implemented a Partial COD system.<br>
                ✅ You only need to pay ₹100 in advance to confirm your order.
                ✅ This amount will be adjusted in your total bill — so you're not paying anything extra.
                ✅ The remaining amount can be paid in cash at the time of delivery.<br>
                🧾 This small step helps us serve genuine buyers faster and reduces losses due to fake orders.<br>
                📹 For full explanation, please watch the video below 👇<br>
                ❓Have any questions? Feel free to contact us at 📞 +91 7498543260
            </div>
            <div class="text-center mb-3">
                <!-- Placeholder video, replace src with your link -->
                <video id="cod-info-video" width="320" height="180" controls style="max-width:100%;border-radius:10px;">
                    <source src="video/COD.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
        codOption.appendChild(codInfo);
    }
}
document.addEventListener('DOMContentLoaded', ensureCODInfoSection);

// --- COMMENTED OUT: PARTIAL COD LOGIC ---
/*
// Partial COD logic
async function processPartialCOD(items) {
    try {
        // Collect form data
        const personalDetails = {
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        address: document.getElementById('address').value,
            address2: document.getElementById('address2').value,
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value
    };
        const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderData = {
            orderId: generateOrderId(),
            total: orderTotal,
            customerDetails: personalDetails,
            items: items,
            paymentType: 'partial-cod'
        };
        // Open Razorpay for ₹100 advance
        await processPartialCODWithRazorpay(orderData);
    } catch (error) {
        console.error('Partial COD error:', error);
        Swal.fire({
            title: 'Order Error',
            text: 'There was an issue placing your order. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Razorpay integration for Partial COD
async function processPartialCODWithRazorpay(orderData) {
    try {
        // Ensure Razorpay script is loaded (reuse logic from razorpay-integration.js)
        if (typeof Razorpay === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        // First, create an order on the backend to get a proper order ID
        const orderRes = await fetch(currentConfig.backendUrl.replace('/verify-payment', '/create-order'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: 100, // ₹100 advance for partial COD
                currency: 'INR',
                payment_capture: 1 // Ensure auto-capture
            })
        });
        
        const order = await orderRes.json();
        if (!order.id) throw new Error('Failed to create Razorpay order');

        // Prepare Razorpay options for ₹100 advance
        const options = {
            key: currentConfig.key,
            amount: 100 * 100, // ₹100 in paise
            currency: 'INR',
            name: RAZORPAY_OPTIONS.name,
            description: 'Advance for Partial COD',
            image: RAZORPAY_OPTIONS.image,
            order_id: order.id, // Use the server-generated order ID
            handler: async function(response) {
                // On payment success, save order as partial COD
                await handlePartialCODPaymentSuccess(response, orderData);
            },
            prefill: {
                name: orderData.customerDetails.firstName + ' ' + orderData.customerDetails.lastName,
                email: orderData.customerDetails.email,
                contact: orderData.customerDetails.phone
            },
            notes: {
                address: orderData.customerDetails.address,
                order_id: orderData.orderId,
                payment_type: 'partial_cod_advance'
            },
            theme: RAZORPAY_OPTIONS.theme,
            // Ensure auto-capture is enabled
            payment_capture: 1,
            // Configure payment methods
            method: {
                netbanking: true,
                card: true,
                upi: true,
                wallet: true,
                emi: false,
                paylater: false
            },
            // Set up a timeout to prevent hanging
            timeout: 300, // 5 minutes
            // Add retry configuration
            retry: {
                enabled: true,
                max_count: 4
            }
        };
        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Partial COD Razorpay error:', error);
        Swal.fire({
            title: 'Payment Error',
            text: 'Failed to initialize payment. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Handle successful partial COD payment
async function handlePartialCODPaymentSuccess(response, orderData) {
    const advancePaid = 100;
    const remainingAmount = orderData.total - advancePaid;
    
    try {
        // Save the order with pending status first
        const orderDetails = {
            items: orderData.items,
            total: orderData.total,
            status: 'confirmed',
            paymentMethod: 'Partial COD',
            paymentStatus: 'pending', // Changed from 'advance_paid' to 'pending'
            advancePaid: advancePaid,
            remainingAmount: remainingAmount,
            paymentResponse: response,
            paymentVerified: false, // Changed from true to false
            paymentInitiatedAt: new Date().toISOString(), // Changed from paymentVerifiedAt
            razorpay: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
            }
        };
        
        const personalDetailsForOrder = orderData.customerDetails;
        
        // Save the order in Firestore with pending status
        await saveOrder(orderData.orderId, orderDetails, personalDetailsForOrder);
        
        // Clear the cart after successful order
        if (typeof clearCart === 'function') {
            await clearCart();
        }
        
        // Show success message for Partial COD
        Swal.fire({
            title: 'Order Confirmed! 🎉',
            html: `
                <div style="text-align: left;">
                    <p>Your order has been confirmed with Partial COD!</p>
                    <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                    <p><strong>Advance Paid:</strong> ₹${advancePaid}</p>
                    <p><strong>Amount to Pay on Delivery:</strong> ₹${remainingAmount}</p>
                    <p><strong>Payment ID:</strong> ${response.razorpay_payment_id}</p>
                    <p>You will receive an order confirmation shortly.</p>
                    <p>Thank you for shopping with Aziz Phone Hub! 🙏</p>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'Continue Shopping',
            allowOutsideClick: false
        }).then(() => {
            // Redirect to home page
            window.location.href = 'index.html';
        });
    } catch (error) {
        console.error('Partial COD payment processing error:', error);
        
        // Try to save the failed payment attempt for debugging
        try {
            await saveOrder(orderData.orderId, {
                items: orderData.items,
                total: orderData.total,
                status: 'payment_failed',
                paymentStatus: 'failed',
                error: error.message,
                paymentResponse: response,
                timestamp: new Date().toISOString()
            }, orderData.customerDetails);
        } catch (saveError) {
            console.error('Failed to save failed payment attempt:', saveError);
        }
        
        // Show error message to user
        Swal.fire({
            title: 'Payment Processing Error',
            html: `
                <p>There was an issue processing your payment.</p>
                <p><strong>Error:</strong> ${error.message || 'Unknown error'}</p>
                <p>Your payment has been received but we couldn't confirm your order. Please contact support with your Order ID: <strong>${orderData.orderId}</strong></p>
            `,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false
        }).then(() => {
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
}
*/

// New function for full COD order placement
async function processCODOrder(items) {
    try {
        // Collect form data
        const personalDetails = {
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            address2: document.getElementById('address2').value,
            country: document.getElementById('country').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value
        };
        const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderData = {
            orderId: generateOrderId(),
            total: orderTotal,
            customerDetails: personalDetails,
            items: items,
            paymentType: 'cod',
            status: 'confirmed',
            paymentMethod: 'COD',
            paymentStatus: 'pending',
            createdAt: new Date().toISOString()
        };
        // Save the order in Firestore
        await saveOrder(orderData.orderId, orderData, personalDetails);
        // Clear the cart after successful order
        if (typeof clearCart === 'function') {
            await clearCart();
        }
        // Show success message
        Swal.fire({
            title: 'Order Confirmed! 🎉',
            html: `
                <div style="text-align: left;">
                    <p>Your order has been placed with Cash on Delivery!</p>
                    <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                    <p><strong>Amount to Pay on Delivery:</strong> ₹${orderTotal}</p>
                    <p>You will receive an order confirmation shortly.</p>
                    <p>Thank you for shopping with Aziz Phone Hub! 🙏</p>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'Continue Shopping',
            allowOutsideClick: false
        }).then(() => {
            window.location.href = 'index.html';
        });
    } catch (error) {
        console.error('COD order error:', error);
        Swal.fire({
            title: 'Order Error',
            text: 'There was an issue placing your order. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Setup checkout event listeners
function setupCheckoutEventListeners() {
    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (validateCheckoutForm()) {
                // Process checkout
                processCheckout(cartData.items);
            }
        });
    }
    
    // Shipping option radios
    const shippingOptions = document.querySelectorAll('input[name="shipping-option"]');
    
    if (shippingOptions.length > 0) {
        shippingOptions.forEach(option => {
            option.addEventListener('change', function() {
                updateCheckoutSummary(cartData.items);
            });
        });
    }
    
    // Same address checkbox
    const sameAddressCheckbox = document.getElementById('same-address');
    
    if (sameAddressCheckbox) {
        sameAddressCheckbox.addEventListener('change', function() {
            // Toggle billing address fields
            toggleBillingAddressFields(this.checked);
        });
    }
}

// Validate checkout form
function validateCheckoutForm() {
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const address = document.getElementById('address');
    const country = document.getElementById('country');
    const state = document.getElementById('state');
    const zip = document.getElementById('zip');
    
    if (!email.value.trim()) {
        alert('Please enter your email address.');
        email.focus();
        return false;
    }
    if (!phone.value.trim()) {
        alert('Please enter your phone number.');
        phone.focus();
        return false;
    }
    if (!firstName.value.trim()) {
        alert('Please enter your first name.');
        firstName.focus();
        return false;
    }
    if (!lastName.value.trim()) {
        alert('Please enter your last name.');
        lastName.focus();
        return false;
    }
    if (!address.value.trim()) {
        alert('Please enter your address.');
        address.focus();
        return false;
    }
    if (!country.value.trim()) {
        alert('Please select your country.');
        country.focus();
        return false;
    }
    if (!state.value.trim()) {
        alert('Please select your state.');
        state.focus();
        return false;
    }
    if (!zip.value.trim()) {
        alert('Please enter your pincode.');
        zip.focus();
        return false;
    }
    return true;
}

// Process checkout - Updated for Razorpay integration with new database structure
async function processCheckout(items) {
    const personalDetails = {
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        address: document.getElementById('address').value,
        address2: document.getElementById('address2').value,
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value
    };
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal - PREPAID_DISCOUNT;
    const orderData = {
        orderId: generateOrderId(),
        total: total,
        customerDetails: personalDetails,
        items: items,
        discount: PREPAID_DISCOUNT
    };
    Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we prepare your payment.',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });
    try {
        await processCheckoutWithRazorpay(orderData);
        Swal.close();
    } catch (error) {
        Swal.close();
        showError('Payment initialization failed. Please try again.');
        console.error('Razorpay error:', error);
    }
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `AZ-${timestamp}-${random}`;
}

// Toggle billing address fields
function toggleBillingAddressFields(isSameAddress) {
    // In a real implementation, this would show/hide billing address fields
    console.log('Same address:', isSameAddress);
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

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone
function isValidPhone(phone) {
    // Basic validation - in a real app, this would be more sophisticated
    return phone.replace(/\D/g, '').length >= 10;
}

// Validate zip
function isValidZip(zip) {
    // Basic validation for Indian pincode
    return /^\d{6}$/.test(zip.replace(/\D/g, ''));
}

// Save order for both authenticated and guest users (copied from razorpay-test-integration.js)
async function saveOrder(orderId, orderDetails, personalDetails) {
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const orderDoc = {
        "order-details": orderDetails,
        "personal-details": personalDetails,
        updatedAt: new Date()
    };

    if (user) {
        // Authenticated user: Save in both places
        const batch = db.batch();
        // 1. Global orders collection
        const globalOrderRef = db.collection('orders').doc(orderId);
        batch.set(globalOrderRef, orderDoc, { merge: true });
        // 2. User's orders subcollection
        const userOrderRef = db.collection('users').doc(user.uid).collection('orders').doc(orderId);
        batch.set(userOrderRef, orderDoc, { merge: true });
        return batch.commit();
    } else {
        // Guest: Only global orders collection
        return db.collection('orders').doc(orderId).set(orderDoc, { merge: true });
    }
}
