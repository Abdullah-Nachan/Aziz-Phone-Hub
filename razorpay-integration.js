/**
 * Razorpay Payment Integration
 * Handles payment processing for Aziz Phone Hub
 */

// Razorpay configuration
const RAZORPAY_CONFIG = {
    key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay test key
    currency: 'INR',
    name: 'Aziz Phone Hub',
    description: 'Online Electronics Store',
    image: 'https://your-logo-url.com/logo.png', // Replace with your logo URL
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

// Create Razorpay order
async function createRazorpayOrder(orderData) {
    try {
        // In a real implementation, you would call your backend to create a Razorpay order
        // For now, we'll create a mock order
        const options = {
            key: RAZORPAY_CONFIG.key,
            amount: orderData.total * 100, // Amount in paise
            currency: RAZORPAY_CONFIG.currency,
            name: RAZORPAY_CONFIG.name,
            description: RAZORPAY_CONFIG.description,
            image: RAZORPAY_CONFIG.image,
            order_id: 'order_' + Date.now(), // This should come from your backend
            handler: function(response) {
                // Handle successful payment
                handlePaymentSuccess(response, orderData);
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
            theme: RAZORPAY_CONFIG.theme,
            modal: {
                ondismiss: function() {
                    // Handle modal dismissal
                    console.log('Payment modal dismissed');
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
}

// Handle successful payment
async function handlePaymentSuccess(response, orderData) {
    try {
        // Verify payment on your backend
        const verificationResult = await verifyPayment(response, orderData);
        
        if (verificationResult.success) {
            // Update order status to confirmed
            await updateOrderStatus(orderData.orderId, 'confirmed', response);
            
            // Show success message
            Swal.fire({
                title: 'Payment Successful!',
                html: `
                    <p>Your payment has been processed successfully.</p>
                    <p>Order ID: <strong>${orderData.orderId}</strong></p>
                    <p>Payment ID: <strong>${response.razorpay_payment_id}</strong></p>
                    <p>Thank you for shopping with Aziz Phone Hub!</p>
                `,
                icon: 'success',
                confirmButtonText: 'Continue Shopping'
            }).then(() => {
                window.location.href = 'index.html';
            });
        } else {
            throw new Error('Payment verification failed');
        }
        
    } catch (error) {
        console.error('Payment verification error:', error);
        Swal.fire({
            title: 'Payment Error',
            text: 'There was an issue verifying your payment. Please contact support.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Verify payment (this should call your backend)
async function verifyPayment(response, orderData) {
    try {
        // In a real implementation, you would send the payment details to your backend
        // for verification with Razorpay's API
        const verificationData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderData.orderId
        };

        // Mock verification - replace with actual backend call
        console.log('Verifying payment:', verificationData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
        
    } catch (error) {
        console.error('Payment verification error:', error);
        return { success: false, error: error.message };
    }
}

// Update order status in Firestore
async function updateOrderStatus(orderId, status, paymentResponse) {
    try {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js');
        const { db } = await import('./firebase-utils.js');
        
        // Update order in main orders collection
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: status,
            paymentId: paymentResponse.razorpay_payment_id,
            paymentStatus: 'completed',
            updatedAt: new Date()
        });
        
        // Update order in user's subcollection
        const { auth } = await import('./firebase-utils.js');
        const user = auth.currentUser;
        if (user) {
            const userOrderRef = doc(db, 'users', user.uid, 'orders', orderId);
            await updateDoc(userOrderRef, {
                status: status,
                paymentId: paymentResponse.razorpay_payment_id,
                paymentStatus: 'completed',
                updatedAt: new Date()
            });
        }
        
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

// Process checkout with Razorpay
async function processCheckoutWithRazorpay(orderData) {
    try {
        // Initialize Razorpay
        await initializeRazorpay();
        
        // Create and open Razorpay payment
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

// Export functions for use in other files
export {
    initializeRazorpay,
    createRazorpayOrder,
    handlePaymentSuccess,
    verifyPayment,
    updateOrderStatus,
    processCheckoutWithRazorpay
};

// Make functions globally available
window.processCheckoutWithRazorpay = processCheckoutWithRazorpay; 