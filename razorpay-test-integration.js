/**
 * Razorpay Test Integration
 * Handles payment processing for Aziz Phone Hub (Test Environment)
 */

// === Razorpay Mode and Config ===
const RAZORPAY_MODE = 'live';
const RAZORPAY_CONFIG = {
    live: {
        key: 'rzp_live_JnvUIfFvjuSFWq',
        backendUrl: 'https://aziz-phone-hub-backend.onrender.com/verify-payment',
    },
    test: {
        key: 'rzp_test_g1q57RmuF0n22s',
        backendUrl: 'https://aziz-phone-hub-backend.onrender.com/verify-payment',
    }
};
const currentConfig = RAZORPAY_CONFIG[RAZORPAY_MODE];

// Razorpay configuration
const RAZORPAY_OPTIONS = {
    key: currentConfig.key,
    currency: 'INR',
    name: 'Aziz Phone Hub',
    description: 'Test Order Payment',
    image: './images/AzizPhoneHub.webp',
    theme: {
        color: '#3399cc'
    }
};

// Initialize Razorpay
function initializeRazorpay() {
    return new Promise((resolve, reject) => {
        if (typeof Razorpay !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.head.appendChild(script);
    });
}

// Create Razorpay order (get real order_id from backend)
async function createRazorpayOrder(orderData) {
    try {
        // 1. Create order on backend
        const orderRes = await fetch(currentConfig.backendUrl.replace('/verify-payment', '/create-order'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: orderData.total, currency: 'INR' })
        });
        const order = await orderRes.json();
        if (!order.id) throw new Error('Failed to create order on backend');
        // 2. Use real order_id in Razorpay options
        const options = {
            key: currentConfig.key,
            amount: orderData.total * 100, // Amount in paise
            currency: RAZORPAY_OPTIONS.currency,
            name: RAZORPAY_OPTIONS.name,
            description: RAZORPAY_OPTIONS.description,
            image: RAZORPAY_OPTIONS.image,
            order_id: order.id, // Use real order_id from backend
            handler: function(response) {
                // This handler will be called by Razorpay when payment is successful
                // The actual payment verification and capture will be handled by the backend webhook
                Swal.fire({
                    title: 'Payment Successful! 🎉',
                    html: `
                        <p>Your payment has been initiated.</p>
                        <p>Order ID: <strong>${orderData.orderId}</strong></p>
                        <p>Payment ID: <strong>${response.razorpay_payment_id}</strong></p>
                        <p>Amount: <strong>₹${orderData.total}</strong></p>
                        <p>Your order will be confirmed shortly after payment is verified by the merchant.</p>
                        <p>Thank you for shopping with Aziz Phone Hub! 🙏</p>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Continue Shopping'
                }).then(() => {
                    window.location.href = 'index.html';
                });
            },
            prefill: {
                name: orderData.customerDetails.firstName + ' ' + orderData.customerDetails.lastName,
                email: orderData.customerDetails.email,
                contact: orderData.customerDetails.phone
            },
            notes: {
                address: orderData.customerDetails.address,
                order_id: orderData.orderId
            },
            theme: RAZORPAY_OPTIONS.theme,
            modal: {
                ondismiss: function() {
                    Swal.fire({
                        title: 'Payment Cancelled',
                        text: 'You cancelled the payment. You can try again.',
                        icon: 'info',
                        confirmButtonText: 'OK'
                    });
                }
            },
            // Disable EMI and Pay Later options
            method: {
                netbanking: true,
                card: true,
                upi: true,
                wallet: true,
                emi: false,
                paylater: false
            }
        };
        const rzp = new Razorpay(options);
        rzp.open();
        // Start polling for payment status after opening the payment window
        pollOrderStatus(orderData.orderId);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        Swal.fire({
            title: 'Payment Error',
            text: 'Failed to create order. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        throw error;
    }
}

// Process checkout with Razorpay
async function processCheckoutWithRazorpay(orderData) {
    try {
        await initializeRazorpay();
        await createRazorpayOrder(orderData);
    } catch (error) {
        console.error('Error processing checkout with Razorpay:', error);
        Swal.fire({
            title: 'Payment Error',
            text: 'Failed to initialize payment. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Make functions and config globally available
window.processCheckoutWithRazorpay = processCheckoutWithRazorpay;
window.currentConfig = currentConfig;
window.RAZORPAY_OPTIONS = RAZORPAY_OPTIONS;

// Test function for development
async function testRazorpayIntegration() {
    console.log('Testing Razorpay integration...');
    
    const testOrderData = {
        orderId: 'TEST_' + Date.now(),
        total: 100,
        customerDetails: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '9876543210',
            address: 'Test Address'
        },
        items: [
            {
                name: 'Test Product',
                price: 100,
                quantity: 1
            }
        ]
    };
    
    await processCheckoutWithRazorpay(testOrderData);
}

// Make functions globally available
window.testRazorpayIntegration = testRazorpayIntegration;

// Save order for both authenticated and guest users
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

// Poll Firestore for order status after payment is initiated
async function pollOrderStatus(orderId) {
    const db = firebase.firestore();
    const orderRef = db.collection('orders').doc(orderId);
    Swal.fire({
        title: 'Waiting for Payment Confirmation...',
        html: '<p>Please complete your payment in your UPI app.<br>This page will update automatically once your payment is confirmed.</p>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    const interval = setInterval(async () => {
        const doc = await orderRef.get();
        if (doc.exists && doc.data().paymentStatus === 'paid') {
            clearInterval(interval);
            
            // Fire Meta Pixel Purchase event
            if (typeof fbq !== 'undefined') {
                const orderData = doc.data();
                const totalAmount = orderData.totalAmount || 0;
                const currency = 'INR';
                
                fbq('track', 'Purchase', {
                    value: totalAmount,
                    currency: currency,
                    content_type: 'product',
                    content_ids: orderData.items ? orderData.items.map(item => item.id) : [],
                    num_items: orderData.items ? orderData.items.length : 0,
                    order_id: orderId
                });
                console.log('Meta Pixel Purchase event fired for order:', orderId);
            }
            
            Swal.fire({
                title: 'Payment Successful!',
                text: 'Your payment was received and your order is confirmed.',
                icon: 'success',
                confirmButtonText: 'Continue Shopping'
            }).then(() => {
                // Redirect to home page (existing flow)
                window.location.href = 'index.html';
            });
        }
    }, 4000);
} 