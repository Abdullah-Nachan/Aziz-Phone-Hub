/**
 * Test Configuration for Razorpay Integration
 * Replace these values with your actual test credentials
 */

// Test Configuration
const TEST_CONFIG = {
    // Replace with your Razorpay test key
    razorpayKey: 'rzp_test_YOUR_TEST_KEY_HERE',
    
    // Test phone number for WhatsApp
    testPhone: '9876543210',
    
    // Test email
    testEmail: 'test@azizphonehub.com',
    
    // Test amount (small amount for testing)
    testAmount: 100,
    
    // Environment
    environment: 'test'
};

// Test Payment Methods (Razorpay Test Cards)
const TEST_PAYMENT_METHODS = {
    // Success Cards
    successCards: [
        {
            number: '4111 1111 1111 1111',
            type: 'Visa',
            description: 'Always succeeds'
        },
        {
            number: '5555 5555 5555 4444',
            type: 'MasterCard',
            description: 'Always succeeds'
        },
        {
            number: '4000 0000 0000 0002',
            type: 'Visa',
            description: 'Always succeeds'
        }
    ],
    
    // Failure Cards
    failureCards: [
        {
            number: '4000 0000 0000 0002',
            type: 'Visa',
            description: 'Declined'
        },
        {
            number: '4000 0000 0000 9995',
            type: 'Visa',
            description: 'Insufficient Funds'
        }
    ],
    
    // Test UPI IDs
    upiIds: [
        {
            id: 'success@razorpay',
            description: 'Always succeeds'
        },
        {
            id: 'failure@razorpay',
            description: 'Always fails'
        }
    ]
};

// Test Instructions
const TEST_INSTRUCTIONS = `
🧪 RAZORPAY TEST INTEGRATION INSTRUCTIONS

1. SETUP:
   - Replace 'rzp_test_YOUR_TEST_KEY_HERE' with your actual Razorpay test key
   - Update test phone number for WhatsApp testing
   - Update logo URL in razorpay-test-integration.js

2. TEST PAYMENT METHODS:
   - Credit/Debit Cards: Use test cards above
   - Net Banking: Use any test bank
   - UPI: Use test UPI IDs above
   - Wallets: Use test wallet options
   - COD: Test with ₹100 advance payment

3. TEST SCENARIOS:
   ✅ Successful payment with any method
   ✅ Failed payment with failure cards
   ✅ Cancelled payment (close modal)
   ✅ WhatsApp message sending
   ✅ Database storage (orders collection)
   ✅ User-specific storage (if logged in)

4. DATABASE STRUCTURE:
   orders/orderId/
   ├── orderDetails: {...}
   └── personalDetails: {...}
   
   users/uid/orders/orderId/
   ├── orderDetails: {...}
   └── personalDetails: {...}

5. WHATSAPP INTEGRATION:
   - Opens WhatsApp with pre-filled message
   - Contains order details and confirmation
   - Test with your phone number

6. DEBUGGING:
   - Check browser console for logs
   - Check Firebase console for data
   - Check Razorpay dashboard for payments

7. GO LIVE CHECKLIST:
   □ All test scenarios pass
   □ Replace test key with live key
   □ Update logo and branding
   □ Test with real payment methods
   □ Verify WhatsApp integration
   □ Check database structure
`;

// Export for use in other files
export {
    TEST_CONFIG,
    TEST_PAYMENT_METHODS,
    TEST_INSTRUCTIONS
};

// Make available globally
window.TEST_CONFIG = TEST_CONFIG;
window.TEST_PAYMENT_METHODS = TEST_PAYMENT_METHODS;
window.TEST_INSTRUCTIONS = TEST_INSTRUCTIONS; 