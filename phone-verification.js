/*
// ... entire phone-verification.js code commented out ...
// (Original code remains here, but is now inside this block comment)

/**
 * Phone Number Verification using Firebase Authentication
 * This script handles phone number verification during checkout
 */

class PhoneVerification {
    constructor() {
        this.verificationId = null;
        this.phoneNumber = null;
        this.isVerified = false;
        this.recaptchaVerifier = null;
        this.recaptchaWidgetId = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Get DOM elements
        this.verificationPhoneInput = document.getElementById('verification-phone');
        this.otpInput = document.getElementById('otp-input');
        this.sendOtpBtn = document.getElementById('send-otp-btn');
        this.verifyOtpBtn = document.getElementById('verify-otp-btn');
        this.resendOtpBtn = document.getElementById('resend-otp-btn');
        this.changePhoneBtn = document.getElementById('change-phone-btn');
        this.proceedAfterVerificationBtn = document.getElementById('proceed-after-verification');
        
        // Section elements
        this.contactInfoSection = document.getElementById('contact-info-card');
        this.verificationSection = document.getElementById('phone-verification-section');
        this.paymentSection = document.getElementById('payment-section');
        
        // Step elements
        this.step1 = document.getElementById('phone-verification-step1');
        this.step2 = document.getElementById('phone-verification-step2');
        this.successStep = document.getElementById('phone-verification-success');
    }

    bindEvents() {
        // Send OTP button
        this.sendOtpBtn.addEventListener('click', () => this.sendOTP());
        
        // Verify OTP button
        this.verifyOtpBtn.addEventListener('click', () => this.verifyOTP());
        
        // Resend OTP button
        this.resendOtpBtn.addEventListener('click', () => this.sendOTP());
        
        // Change phone button
        this.changePhoneBtn.addEventListener('click', () => this.goBackToContactInfo());
        
        // Proceed after verification
        this.proceedAfterVerificationBtn.addEventListener('click', () => this.proceedToPayment());
        
        // OTP input - auto-submit on 6 digits
        this.otpInput.addEventListener('input', (e) => {
            if (e.target.value.length === 6) {
                this.verifyOTP();
            }
        });
    }

    // Start verification process
    startVerification(phoneNumber) {
        this.phoneNumber = phoneNumber;
        this.verificationPhoneInput.value = phoneNumber;
        
        // Show verification section
        this.contactInfoSection.style.display = 'none';
        this.verificationSection.style.display = 'block';
        
        // Update checkout steps
        this.updateCheckoutSteps('verification');
        
        // Initialize reCAPTCHA
        this.initializeRecaptcha();
    }

    // Initialize reCAPTCHA for Firebase Phone Auth
    initializeRecaptcha() {
        if (!this.recaptchaVerifier) {
            this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('send-otp-btn', {
                'size': 'invisible',
                'callback': (response) => {
                    console.log('reCAPTCHA solved');
                }
            }, firebase.app()); // <-- Corrected from firebase.auth() to firebase.app()
        }
    }

    // Send OTP to phone number
    async sendOTP() {
        try {
            // Show loading state
            this.sendOtpBtn.disabled = true;
            this.sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            
            // Format phone number
            const formattedPhone = `+91${this.phoneNumber}`;
            
            // Send OTP
            const confirmationResult = await firebase.auth().signInWithPhoneNumber(formattedPhone, this.recaptchaVerifier);
            this.verificationId = confirmationResult.verificationId;
            
            // Show OTP input step
            this.step1.style.display = 'none';
            this.step2.style.display = 'block';
            
            // Focus on OTP input
            this.otpInput.focus();
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'OTP Sent!',
                text: `Verification code has been sent to ${formattedPhone}`,
                timer: 3000,
                showConfirmButton: false
            });
            
        } catch (error) {
            console.error('Error sending OTP:', error);
            
            // Reset button state
            this.sendOtpBtn.disabled = false;
            this.sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Verification Code';
            
            // Show error message
            let errorMessage = 'Failed to send verification code. Please try again.';
            
            if (error.code === 'auth/invalid-phone-number') {
                errorMessage = 'Invalid phone number. Please check and try again.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    }

    // Verify OTP
    async verifyOTP() {
        const otp = this.otpInput.value.trim();
        
        if (otp.length !== 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid OTP',
                text: 'Please enter the 6-digit verification code'
            });
            return;
        }
        
        try {
            // Show loading state
            this.verifyOtpBtn.disabled = true;
            this.verifyOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verifying...';
            
            // Create credential
            const credential = firebase.auth.PhoneAuthProvider.credential(this.verificationId, otp);
            
            // Sign in with credential
            await firebase.auth().signInWithCredential(credential);
            
            // Mark as verified
            this.isVerified = true;
            
            // Show success step
            this.step2.style.display = 'none';
            this.successStep.style.display = 'block';
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Phone Verified!',
                text: 'Your phone number has been successfully verified.',
                timer: 2000,
                showConfirmButton: false
            });
            
        } catch (error) {
            console.error('Error verifying OTP:', error);
            
            // Reset button state
            this.verifyOtpBtn.disabled = false;
            this.verifyOtpBtn.innerHTML = '<i class="fas fa-check me-2"></i>Verify Code';
            
            // Show error message
            let errorMessage = 'Invalid verification code. Please try again.';
            
            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'Invalid verification code. Please check and try again.';
            } else if (error.code === 'auth/code-expired') {
                errorMessage = 'Verification code has expired. Please request a new one.';
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Verification Failed',
                text: errorMessage
            });
            
            // Clear OTP input
            this.otpInput.value = '';
            this.otpInput.focus();
        }
    }

    // Go back to contact info
    goBackToContactInfo() {
        // Reset verification state
        this.isVerified = false;
        this.verificationId = null;
        this.otpInput.value = '';
        
        // Show contact info section
        this.verificationSection.style.display = 'none';
        this.contactInfoSection.style.display = 'block';
        
        // Update checkout steps
        this.updateCheckoutSteps('info');
        
        // Clear Firebase auth state
        firebase.auth().signOut();
    }

    // Proceed to payment after verification
    proceedToPayment() {
        // Hide verification section
        this.verificationSection.style.display = 'none';
        
        // Show payment section
        this.paymentSection.style.display = 'block';
        
        // Update checkout steps
        this.updateCheckoutSteps('payment');
    }

    // Update checkout step indicators
    updateCheckoutSteps(currentStep) {
        const steps = {
            'info': ['cart', 'info'],
            'verification': ['cart', 'info', 'verification'],
            'payment': ['cart', 'info', 'verification', 'payment']
        };
        
        const currentSteps = steps[currentStep] || ['cart', 'info'];
        
        // Update step indicators
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        document.querySelectorAll('.step-connector').forEach(connector => {
            connector.classList.remove('active');
        });
        
        currentSteps.forEach(stepName => {
            const stepElement = document.getElementById(`step-${stepName}`);
            const connectorElement = document.getElementById(`connector-${stepName}`);
            
            if (stepElement) stepElement.classList.add('active');
            if (connectorElement) connectorElement.classList.add('active');
        });
    }

    // Check if phone is verified
    isPhoneVerified() {
        return this.isVerified;
    }

    // Get verified phone number
    getVerifiedPhone() {
        return this.isVerified ? this.phoneNumber : null;
    }
}

// Initialize phone verification when DOM is loaded
let phoneVerification;

function initPhoneVerificationIfReady() {
    if (window.firebaseInitialized) {
        phoneVerification = new PhoneVerification();
        window.phoneVerification = phoneVerification;
        console.log('[DEBUG] window.phoneVerification set:', window.phoneVerification);
        console.log('Phone verification system initialized');
    } else {
        document.addEventListener('firebaseInitialized', function() {
            phoneVerification = new PhoneVerification();
            window.phoneVerification = phoneVerification;
            console.log('[DEBUG] window.phoneVerification set:', window.phoneVerification);
            console.log('Phone verification system initialized');
        });
    }
}

document.addEventListener('DOMContentLoaded', initPhoneVerificationIfReady);

*/ 