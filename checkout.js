/**
 * Checkout functionality for Aziz Phone Hub
 * Handles checkout process and form validation
 */

import { auth, db } from './firebase-utils.js';
import { doc, collection, addDoc, updateDoc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize checkout
    initializeCheckout();
    
    // Setup event listeners
    setupCheckoutEventListeners();

    // Proceed to Payment button logic
    const proceedBtn = document.getElementById('proceed-to-payment-btn');
    const infoFormCard = document.querySelector('.card.mb-4.shadow-sm'); // Info form card
    const paymentSection = document.getElementById('payment-section');

    // Get references to checkout step elements
    const stepInfo = document.getElementById('step-info');
    const connectorPayment = document.getElementById('connector-payment');
    const stepPayment = document.getElementById('step-payment');

    if (proceedBtn && infoFormCard && paymentSection && stepInfo && connectorPayment && stepPayment) {
        proceedBtn.addEventListener('click', function() {
            // Validate info form before proceeding
            if (!validateCheckoutForm()) return;

            // Hide info form and show payment section
            infoFormCard.classList.add('d-none');
            paymentSection.classList.remove('d-none');
            window.scrollTo({ top: paymentSection.offsetTop - 80, behavior: 'smooth' });

            // Update checkout steps UI
            stepInfo.classList.remove('active');
            connectorPayment.classList.add('active');
            stepPayment.classList.add('active');
        });
    }

    // Back to Information button logic
    const backToInfoBtn = document.getElementById('back-to-info-btn');
    if (backToInfoBtn && infoFormCard && paymentSection && stepInfo && connectorPayment && stepPayment) {
        backToInfoBtn.addEventListener('click', function() {
            // Hide payment section and show info form
            paymentSection.classList.add('d-none');
            infoFormCard.classList.remove('d-none');
            window.scrollTo({ top: infoFormCard.offsetTop - 80, behavior: 'smooth' });

            // Update checkout steps UI
            stepInfo.classList.add('active');
            connectorPayment.classList.remove('active');
            stepPayment.classList.remove('active');
        });
    }

    // Payment form submit
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const selected = paymentForm.querySelector('input[name="payment-method"]:checked');
            if (!selected) {
                Swal.fire('Select Payment Method', 'Please select a payment method to continue.', 'warning');
                return;
            }
            // Stub: Show selected payment method (replace with real integration)
            Swal.fire('Payment Selected', `You selected: <b>${selected.labels[0].innerHTML}</b>`, 'info');
        });
    }
});

// PhonePe payment integration (client-side, using Firebase Functions as API proxy)
async function handlePayment() {
    const user = auth.currentUser;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const totalAmount = cart.getTotal();
    const isPartialCOD = paymentMethod === 'cod';
    const phonepeAmount = isPartialCOD ? 100 : totalAmount; // ₹100 for partial COD, else full

    // Collect customer details
    const customerDetails = {
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        address: document.getElementById('address').value,
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value
    };
    const orderItems = cart.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
    }));
    const shippingOption = document.querySelector('input[name="shipping-option"]:checked').value;

    // Prepare order data
    const orderData = {
        userId: user ? user.uid : null,
        customerDetails: customerDetails,
        items: orderItems,
        total: totalAmount,
        paid: isPartialCOD ? 100 : totalAmount,
        due: isPartialCOD ? (totalAmount - 100) : 0,
        paymentMethod: isPartialCOD ? 'Partial COD' : 'PhonePe',
        shippingOption: shippingOption,
        status: 'pending',
        createdAt: serverTimestamp()
    };

    try {
        // 1. Call Firebase Function to create PhonePe order and get payment URL
        const createPhonePeOrder = firebase.functions().httpsCallable('createPhonePeOrder');
        const response = await createPhonePeOrder({
            amount: phonepeAmount * 100, // paise
            orderData: orderData
        });
        if (!response.data || !response.data.paymentUrl) throw new Error('Failed to create PhonePe order');

        // 2. Redirect to PhonePe payment page
        window.location.href = response.data.paymentUrl;
        // After payment, PhonePe will redirect to callback page (payment-callback.html)
        // There, verify payment and call saveOrderToFirestore(orderData, paymentStatus)
    } catch (error) {
        console.error('Payment initiation failed:', error);
        Swal.fire('Error', 'Could not initiate payment. Please try again.', 'error');
    }
}

// After payment, on callback page, call this to save order
async function saveOrderToFirestore(orderData, paymentStatus) {
    // paymentStatus: 'PAID' or 'PARTIAL_PAID' or 'FAILED'
    try {
        // Save to orders collection
        const ordersRef = collection(db, 'orders');
        const orderDoc = await addDoc(ordersRef, {
            ...orderData,
            status: paymentStatus === 'PAID' ? 'confirmed' : (paymentStatus === 'PARTIAL_PAID' ? 'partial_paid' : 'failed'),
            paymentStatus: paymentStatus,
            confirmedAt: serverTimestamp()
        });
        // If user is authenticated, also save to user orders
        if (orderData.userId) {
            const userOrdersRef = collection(db, 'users', orderData.userId, 'orders');
            await addDoc(userOrdersRef, {
                ...orderData,
                orderId: orderDoc.id,
                status: paymentStatus === 'PAID' ? 'confirmed' : (paymentStatus === 'PARTIAL_PAID' ? 'partial_paid' : 'failed'),
                paymentStatus: paymentStatus,
                confirmedAt: serverTimestamp()
            });
            // Optionally update user profile with latest info
            const userDocRef = doc(db, 'users', orderData.userId);
            await updateDoc(userDocRef, {
                lastOrderAt: serverTimestamp(),
                lastShipping: orderData.customerDetails
            });
        }
        // Clear cart after order
        cart.clearCart();
        // Trigger email (Cloud Function callable)
        try {
            const sendOrderEmail = firebase.functions().httpsCallable('sendOrderEmail');
            await sendOrderEmail({
                orderId: orderDoc.id,
                to: orderData.customerDetails.email
            });
        } catch (e) {
            console.warn('Email not sent:', e);
        }
        Swal.fire('Order Confirmed!', 'Your order has been placed and a confirmation email sent.', 'success').then(() => {
            window.location.href = 'index.html';
        });
    } catch (error) {
        console.error('Error saving order:', error);
        Swal.fire('Error', 'Could not save order. Please contact support.', 'error');
    }
}


// Initialize checkout
function initializeCheckout() {
    // Check if cart is empty
    if (cart.items.length === 0) {
        // Redirect to cart page
        window.location.href = 'cart.html';
        return;
    }
    
    // Render checkout items
    renderCheckoutItems();
    
    // Update checkout summary
    updateCheckoutSummary();
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
                processCheckout();
            }
        });
    }
    
    // Shipping option radios
    const shippingOptions = document.querySelectorAll('input[name="shipping-option"]');
    
    if (shippingOptions.length > 0) {
        shippingOptions.forEach(option => {
            option.addEventListener('change', function() {
                updateCheckoutSummary();
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
    // Get form elements
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const address = document.getElementById('address');
    const country = document.getElementById('country');
    const state = document.getElementById('state');
    const zip = document.getElementById('zip');
    
    // Validate email
    if (!email.value || !isValidEmail(email.value)) {
        showError('Please enter a valid email address');
        email.focus();
        return false;
    }
    
    // Validate phone
    if (!phone.value || !isValidPhone(phone.value)) {
        showError('Please enter a valid phone number');
        phone.focus();
        return false;
    }
    
    // Validate first name
    if (!firstName.value.trim()) {
        showError('Please enter your first name');
        firstName.focus();
        return false;
    }
    
    // Validate last name
    if (!lastName.value.trim()) {
        showError('Please enter your last name');
        lastName.focus();
        return false;
    }
    
    // Validate address
    if (!address.value.trim()) {
        showError('Please enter your address');
        address.focus();
        return false;
    }
    
    // Validate country
    if (!country.value) {
        showError('Please select your country');
        country.focus();
        return false;
    }
    
    // Validate state
    if (!state.value) {
        showError('Please select your state');
        state.focus();
        return false;
    }
    
    // Validate zip
    if (!zip.value.trim() || !isValidZip(zip.value)) {
        showError('Please enter a valid pincode');
        zip.focus();
        return false;
    }
    
    return true;
}

// Process checkout
async function processCheckout() {
    // Show loading
    Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we process your order',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Simulate processing (in a real app, this would be an API call)
    const user = auth.currentUser;

    if (!user) {
        Swal.fire('Error', 'You must be logged in to place an order.', 'error');
        return;
    }

    const customerDetails = {
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        address: document.getElementById('address').value,
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value
    };

    const orderItems = cart.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
    }));

    const totalAmount = cart.getTotal();
    const shippingOption = document.querySelector('input[name="shipping-option"]:checked').value;

    const orderData = {
        userId: user.uid,
        customerDetails: customerDetails,
        items: orderItems,
        total: totalAmount,
        shippingOption: shippingOption,
        status: 'pending',
        createdAt: serverTimestamp()
    };

    try {
        // Save order to the main 'orders' collection
        const ordersRef = collection(db, 'orders');
        const newOrderRef = await addDoc(ordersRef, orderData);

        // Save order to a subcollection under the user's document
        const userOrdersRef = collection(db, 'users', user.uid, 'orders');
        await setDoc(doc(userOrdersRef, newOrderRef.id), orderData);

        // Update user's cart and wishlist in Firestore to be empty after order
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
            cart: [],
            wishlist: []
        });

        // Clear local cart
        cart.clearCart();

        Swal.fire({
            title: 'Order Placed!',
            html: `
                <p>Your order has been successfully placed.</p>
                <p>Order ID: <strong>${newOrderRef.id}</strong></p>
                <p>Thank you for shopping with Aziz Phone Hub!</p>
            `,
            icon: 'success',
            confirmButtonText: 'Continue Shopping'
        }).then(() => {
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('Error processing order:', error);
        Swal.fire('Error', 'There was an error processing your order. Please try again.', 'error');
    }
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

// Generate order number
function generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `AZ-${timestamp}-${random}`;
}

// Update checkout summary based on shipping option
function updateCheckoutSummary() {
    const subtotalElement = document.getElementById('summary-subtotal');
    const shippingElement = document.getElementById('summary-shipping');
    const totalElement = document.getElementById('summary-total');
    
    if (!subtotalElement || !shippingElement || !totalElement) return;
    
    const subtotal = cart.getTotal();
    
    // Get selected shipping option
    const expressShipping = document.getElementById('express-shipping');
    const shippingCost = expressShipping && expressShipping.checked ? 199 : 0;
    
    const total = subtotal + shippingCost;
    
    subtotalElement.textContent = formatCurrency(subtotal);
    shippingElement.textContent = shippingCost > 0 ? formatCurrency(shippingCost) : 'Free';
    totalElement.textContent = formatCurrency(total);
}

// Format currency
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}
