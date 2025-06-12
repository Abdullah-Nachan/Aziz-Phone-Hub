/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const axios = require("axios");

admin.initializeApp();

// PhonePe Configuration
const PHONEPE_CONFIG = {
    merchantId: functions.config().phonepe.merchant_id,
    apiKey: functions.config().phonepe.api_key,
    // Using PhonePe test environment
    baseUrl: "https://api-preprod.phonepe.com/apis/pg-sandbox",
    redirectUrl: "http://localhost:5000/payment-callback.html", // For local testing
    callbackUrl: `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/paymentCallback`,
    partialCodAmount: 100 // 100 INR for partial COD
};

// Generate X-VERIFY header
function generateXVerify(payload, key) {
    return crypto.createHmac("sha256", key).update(payload).digest("hex");
}

// Initiate Payment (for both full payment and partial COD)
exports.initiatePayment = functions.https.onCall(async (data, context) => {
    try {
        const { amount, orderId, mobileNumber, email, isPartialCOD } = data;
        const userId = (context.auth && context.auth.uid) ? context.auth.uid : "guest";
        
        // For partial COD, amount is fixed at 100 INR
        const paymentAmount = isPartialCOD ? PHONEPE_CONFIG.partialCodAmount : amount;
        const paymentType = isPartialCOD ? "partial_cod" : "full_payment";

        const payload = {
            merchantId: PHONEPE_CONFIG.merchantId,
            merchantTransactionId: orderId,
            merchantUserId: userId,
            amount: paymentAmount * 100, // Convert to paise
            redirectUrl: `${PHONEPE_CONFIG.redirectUrl}?orderId=${orderId}`,
            redirectMode: "REDIRECT",
            callbackUrl: PHONEPE_CONFIG.callbackUrl,
            mobileNumber: mobileNumber,
            paymentInstrument: { type: "PAY_PAGE" }
        };

        const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
        const xVerify = generateXVerify(payloadBase64 + "/pg/v1/pay" + PHONEPE_CONFIG.apiKey, PHONEPE_CONFIG.apiKey);

        const response = await axios.post(
            `${PHONEPE_CONFIG.baseUrl}/pg/v1/pay`,
            { request: payloadBase64 },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": xVerify,
                    "X-MERCHANT-ID": PHONEPE_CONFIG.merchantId
                }
            }
        );

        // Save payment intent to Firestore
        const paymentData = {
            userId,
            orderId,
            amount: paymentAmount,
            originalAmount: amount, // Store original amount for reference
            status: "PENDING",
            paymentType,
            isPartialCOD,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            merchantTransactionId: orderId
        };

        await admin.firestore().collection("payments").doc(orderId).set(paymentData);

        return {
            success: true,
            data: response.data,
            redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
            isPartialCOD
        };
    } catch (error) {
        console.error("Payment initiation error:", error);
        throw new functions.https.HttpsError("internal", "Payment initiation failed", error);
    }
});

// Check Payment Status
exports.checkPaymentStatus = functions.https.onCall(async (data, context) => {
    try {
        const { orderId } = data;
        
        const paymentRef = admin.firestore().collection("payments").doc(orderId);
        const paymentDoc = await paymentRef.get();
        
        if (!paymentDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Payment not found");
        }

        const paymentData = paymentDoc.data();
        const xVerify = generateXVerify(
            `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${orderId}${PHONEPE_CONFIG.apiKey}`,
            PHONEPE_CONFIG.apiKey
        );

        const response = await axios.get(
            `${PHONEPE_CONFIG.baseUrl}/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${orderId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": xVerify,
                    "X-MERCHANT-ID": PHONEPE_CONFIG.merchantId
                }
            }
        );

        // Update payment status in Firestore
        if (response.data.code === "PAYMENT_SUCCESS") {
            const updateData = {
                status: "SUCCESS",
                paymentResponse: response.data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            // If this was a partial COD, update the order status accordingly
            if (paymentData.isPartialCOD) {
                updateData.orderStatus = "PENDING_COD";
                updateData.balanceAmount = paymentData.originalAmount - 100; // Remaining amount to be paid via COD
            } else {
                updateData.orderStatus = "PAYMENT_COMPLETED";
            }

            await paymentRef.update(updateData);
        }

        return response.data;
    } catch (error) {
        console.error("Payment status error:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch payment status", error);
    }
});

// Webhook for PhonePe callback
exports.paymentCallback = functions.https.onRequest(async (req, res) => {
    try {
        const { merchantTransactionId, transactionId, code } = req.body;
        
        if (!merchantTransactionId) {
            return res.status(400).json({ success: false, message: "Invalid request" });
        }

        const paymentRef = admin.firestore().collection("payments").doc(merchantTransactionId);
        const paymentDoc = await paymentRef.get();
        
        if (!paymentDoc.exists) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        const paymentData = paymentDoc.data();
        const isSuccess = code === "PAYMENT_SUCCESS";

        const updateData = {
            callbackReceived: true,
            transactionId: transactionId,
            callbackData: req.body,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (isSuccess) {
            updateData.status = "SUCCESS";
            if (paymentData.isPartialCOD) {
                updateData.orderStatus = "PENDING_COD";
                updateData.balanceAmount = paymentData.originalAmount - 100;
            } else {
                updateData.orderStatus = "PAYMENT_COMPLETED";
            }
        }

        await paymentRef.update(updateData);
        
        // Here you can add additional logic like sending confirmation emails, etc.
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Callback error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
