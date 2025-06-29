/**
 * Razorpay Test Integration
 * Handles payment processing for Aziz Phone Hub (Test Environment)
 */

// Test Razorpay configuration
const RAZORPAY_TEST_CONFIG = {
    key: 'rzp_test_g1q57RmuF0n22s', // Replace with your test key
    currency: 'INR',
    name: 'Aziz Phone Hub',
    description: 'Test Order Payment',
    image: './images/AzizPhoneHub.webp', // Replace with your logo URL
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

// Create Razorpay order with all payment methods
async function createRazorpayOrder(orderData) {
    try {
        console.log('Creating Razorpay order:', orderData);
        
        const options = {
            key: RAZORPAY_TEST_CONFIG.key,
            amount: orderData.total * 100, // Amount in paise
            currency: RAZORPAY_TEST_CONFIG.currency,
            name: RAZORPAY_TEST_CONFIG.name,
            description: RAZORPAY_TEST_CONFIG.description,
            image: RAZORPAY_TEST_CONFIG.image,
            handler: function(response) {
                console.log('Payment successful:', response);
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
            theme: RAZORPAY_TEST_CONFIG.theme,
            modal: {
                ondismiss: function() {
                    console.log('Payment modal dismissed');
                    Swal.fire({
                        title: 'Payment Cancelled',
                        text: 'You cancelled the payment. You can try again.',
                        icon: 'info',
                        confirmButtonText: 'OK'
                    });
                }
            },
            config: {
                display: {
                    blocks: {
                        card: {
                            name: "Pay with Card",
                            instruments: [{ method: "card" }]
                        },
                        netbanking: {
                            name: "Net Banking",
                            instruments: [{ method: "netbanking" }]
                        },
                        upi: {
                            name: "UPI",
                            instruments: [{ method: "upi" }]
                        },
                        wallet: {
                            name: "Wallets",
                            instruments: [{ method: "wallet" }]
                        }
                    },
                    sequence: ["block.card", "block.netbanking", "block.upi", "block.wallet"],
                    preferences: {
                        show_default_blocks: false
                    }
                }
            }
        };

        console.log('Razorpay options:', options);
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
        console.log('Processing payment success:', response);
        // Verify payment (mock verification for test)
        const verificationResult = await verifyPayment(response, orderData);
        if (verificationResult.success) {
            // Prepare orderDetails and personalDetails
            const orderDetails = {
                items: orderData.items,
                total: orderData.total,
                status: 'confirmed',
                paymentResponse: response
            };
            const personalDetails = orderData.customerDetails;
            // Save the order in Firestore
            await saveOrder(orderData.orderId, orderDetails, personalDetails);
            // Update order status to confirmed (optional, if you want to keep status update logic)
            await updateOrderStatus(orderData.orderId, 'confirmed', response);
            // Show success message (without WhatsApp)
            Swal.fire({
                title: 'Payment Successful! 🎉',
                html: `
                    <p>Your order has been confirmed!</p>
                    <p>Order ID: <strong>${orderData.orderId}</strong></p>
                    <p>Payment ID: <strong>${response.razorpay_payment_id}</strong></p>
                    <p>Amount: <strong>₹${orderData.total}</strong></p>
                    <p>You will receive an order confirmation shortly.</p>
                    <p>Thank you for shopping with Aziz Phone Hub! 🙏</p>
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
        console.error('Payment success handling error:', error);
        Swal.fire({
            title: 'Payment Error',
            text: 'There was an issue processing your payment. Please contact support.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Verify payment (mock verification for test)
async function verifyPayment(response, orderData) {
    try {
        console.log('Verifying payment:', response);
        
        // Mock verification - replace with actual backend call
        const verificationData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderData.orderId
        };

        console.log('Payment verification data:', verificationData);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For test, always return success
        return { success: true };
        
    } catch (error) {
        console.error('Payment verification error:', error);
        return { success: false, error: error.message };
    }
}

// Update order status in Firestore
async function updateOrderStatus(orderId, status, paymentResponse) {
    try {
        console.log('Updating order status:', { orderId, status, paymentResponse });
        // Use compat SDK for Firestore
        // Update order in main orders collection
        const orderRef = firebase.firestore().collection('orders').doc(orderId);
        await orderRef.update({
            status: status,
            paymentId: paymentResponse.razorpay_payment_id,
            paymentStatus: 'completed',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        // Update order in user's subcollection
        const user = firebase.auth().currentUser;
        if (user) {
            const userOrderRef = firebase.firestore().collection('users').doc(user.uid).collection('orders').doc(orderId);
            await userOrderRef.update({
                status: status,
                paymentId: paymentResponse.razorpay_payment_id,
                paymentStatus: 'completed',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        console.log('Order status updated successfully');
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

// Send WhatsApp confirmation via API
async function sendWhatsAppConfirmation(orderData) {
    try {
        console.log('Sending WhatsApp confirmation for order:', orderData.orderId);
        
        const phoneNumber = orderData.customerDetails.phone.replace(/\D/g, ''); // Remove non-digits
        
        // WhatsApp message content
        const message = `
🎉 *Order Confirmed!* 

Dear ${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName},

Your order has been successfully placed!

📋 *Order Details:*
• Order ID: ${orderData.orderId}
• Total Amount: ₹${orderData.total}
• Payment Status: ✅ Confirmed

🛍️ *Items Ordered:*
${orderData.items.map(item => `• ${item.name} - ₹${item.price} x ${item.quantity}`).join('\n')}

📞 *Contact Support:* +91 1234567890
🌐 *Website:* www.azizphonehub.com

Thank you for choosing Aziz Phone Hub! 🙏

We'll keep you updated on your order status.
        `;

        // Method 1: WhatsApp Business API (Recommended for production)
        try {
            await sendWhatsAppViaAPI(phoneNumber, message);
            console.log('WhatsApp message sent via API successfully');
        } catch (apiError) {
            console.warn('WhatsApp API failed, using fallback method:', apiError);
            // Fallback: Show success message without WhatsApp
            showWhatsAppSuccessMessage();
        }
        
    } catch (error) {
        console.error('WhatsApp message error:', error);
        // Don't break the flow if WhatsApp fails
    }
}

// Send WhatsApp via Business API
async function sendWhatsAppViaAPI(phoneNumber, message) {
    try {
        // This would be your backend API endpoint
        const response = await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: phoneNumber,
                message: message,
                orderId: orderData.orderId
            })
        });

        if (!response.ok) {
            throw new Error('WhatsApp API request failed');
        }

        const result = await response.json();
        console.log('WhatsApp API response:', result);
        
        return result;
        
    } catch (error) {
        console.error('WhatsApp API error:', error);
        throw error;
    }
}

// Fallback: Show success message about WhatsApp
function showWhatsAppSuccessMessage() {
    // This will be shown in the success modal
    console.log('WhatsApp message will be sent shortly');
}

// Process checkout with Razorpay
async function processCheckoutWithRazorpay(orderData) {
    try {
        console.log('Starting Razorpay checkout process:', orderData);
        
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
window.processCheckoutWithRazorpay = processCheckoutWithRazorpay;
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