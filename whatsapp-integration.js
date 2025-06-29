/**
 * WhatsApp Integration for Aziz Phone Hub
 * Handles WhatsApp message sending via Business API
 */

// WhatsApp Business API Configuration
const WHATSAPP_CONFIG = {
    // Your WhatsApp Business API credentials
    apiUrl: 'https://your-whatsapp-api-endpoint.com/send',
    apiKey: 'your_api_key_here',
    phoneNumberId: 'your_phone_number_id',
    accessToken: 'your_access_token'
};

// Send WhatsApp message via Business API
async function sendWhatsAppMessage(phoneNumber, message, orderId) {
    try {
        console.log('Sending WhatsApp message to:', phoneNumber);
        
        const response = await fetch(WHATSAPP_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'text',
                text: {
                    body: message
                }
            })
        });

        if (!response.ok) {
            throw new Error(`WhatsApp API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('WhatsApp message sent successfully:', result);
        
        // Save message status to database
        await saveWhatsAppMessageStatus(orderId, phoneNumber, 'sent', result);
        
        return result;
        
    } catch (error) {
        console.error('WhatsApp message sending failed:', error);
        
        // Save failed status to database
        await saveWhatsAppMessageStatus(orderId, phoneNumber, 'failed', error.message);
        
        throw error;
    }
}

// Save WhatsApp message status to Firestore
async function saveWhatsAppMessageStatus(orderId, phoneNumber, status, details) {
    try {
        const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js');
        const { db } = await import('./firebase-utils.js');
        
        const messageRef = doc(db, 'whatsapp_messages', `${orderId}_${Date.now()}`);
        await setDoc(messageRef, {
            orderId: orderId,
            phoneNumber: phoneNumber,
            status: status,
            details: details,
            timestamp: serverTimestamp()
        });
        
        console.log('WhatsApp message status saved to database');
        
    } catch (error) {
        console.error('Error saving WhatsApp message status:', error);
    }
}

// Generate order confirmation message
function generateOrderConfirmationMessage(orderData) {
    return `
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
    `.trim();
}

// Send order confirmation via WhatsApp
async function sendOrderConfirmation(orderData) {
    try {
        const phoneNumber = orderData.customerDetails.phone.replace(/\D/g, '');
        const message = generateOrderConfirmationMessage(orderData);
        
        await sendWhatsAppMessage(phoneNumber, message, orderData.orderId);
        
        return { success: true, message: 'WhatsApp confirmation sent' };
        
    } catch (error) {
        console.error('Failed to send order confirmation:', error);
        return { success: false, error: error.message };
    }
}

// Export functions
export {
    sendWhatsAppMessage,
    sendOrderConfirmation,
    generateOrderConfirmationMessage,
    saveWhatsAppMessageStatus
};

// Make functions globally available
window.sendWhatsAppMessage = sendWhatsAppMessage;
window.sendOrderConfirmation = sendOrderConfirmation; 