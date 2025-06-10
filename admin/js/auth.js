/**
 * Admin Authentication for Aziz Phone Hub
 * Handles admin login and session management
 */

console.log('auth.js loaded, initializing...');

// Global variables
let auth, db;

// Simple login event listener for login form
function setupSimpleLoginListener() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }
        // Firebase login
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Login successful, redirect to dashboard
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                // Show error message
                alert('Login failed: ' + (error.message || 'Invalid credentials.'));
            });
    });
}

// Initialize function that will be called from index.html
function initAuth() {
    console.log('Initializing auth...');
    
    // Get references to the global Firebase objects
    auth = window.auth;
    db = window.db;
    
    if (!auth || !db) {
        console.error('Firebase services not available');
        showError('Authentication service not available. Please refresh the page.');
        return;
    }
    
    console.log('Firebase services initialized');
    
    // Check if user is already logged in
    checkAuthState();
    
    // Setup simple login listener (for basic login)
    setupSimpleLoginListener();
}

// Check authentication state
function checkAuthState() {
    console.log('Checking auth state...');
    
    if (!auth) {
        console.error('Auth service not available');
        return;
    }
    
    auth.onAuthStateChanged(user => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        if (user) {
            // Check if user is admin
            db.collection('admins').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists && doc.data().role === 'admin') {
                        // User is admin, redirect to dashboard if on login page
                        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/admin/')) {
                            window.location.href = 'dashboard.html';
                        }
                    } else {
                        // User is not admin, sign out
                        auth.signOut().then(() => {
                            showError('You do not have admin privileges');
                            window.location.href = 'index.html';
                        });
                    }
                })
                .catch(error => {
                    console.error('Error checking admin status:', error);
                    showError('Error verifying admin status');
                });
        } else {
            // User is not logged in, redirect to login page if not already there
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage !== 'index.html' && currentPage !== '') {
                window.location.href = 'index.html';
            }
        }
    });
}

// Setup login form
function setupLoginForm() {
    console.log('=== Setting up login form ===');
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('❌ Login form not found!');
        return;
    }
    
    console.log('✅ Login form found');
    
    // Debug: Check if auth is available
    console.log('🔒 Auth service available:', !!auth);
    console.log('🔑 Firebase Auth object:', auth);
    
    // Debug: List all form elements
    console.log('📋 Form elements:', Array.from(loginForm.elements).map(el => ({
        id: el.id,
        type: el.type,
        value: el.value,
        required: el.required
    })));
    
    // Add input event listeners for debugging
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
        emailInput.addEventListener('input', (e) => {
            console.log('📧 Email input changed:', e.target.value);
        });
        
        passwordInput.addEventListener('input', (e) => {
            console.log('🔑 Password input changed: [hidden]');
        });
    }
    
    loginForm.addEventListener('submit', async (e) => {
        console.log('=== Form submitted ===');
        e.preventDefault();
        console.log('✅ Default form submission prevented');
        
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;
        
        console.log('📨 Form values:', { 
            email: email ? '*****@' + email.split('@')[1] : 'undefined',
            password: password ? '********' : 'undefined' 
        });
        
        if (!email || !password) {
            const errorMsg = !email ? 'Email is required' : 'Password is required';
            console.error('❌ Validation error:', errorMsg);
            showError(errorMsg);
            return;
        }
        
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        console.log('Login attempt with email:', email);
        
        console.log('🔄 Starting login process...');
        
        // Show loading state
        const loginBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = loginBtn?.innerHTML || 'Login';
        
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
        }
        
        try {
            console.log('🔐 Attempting Firebase authentication...');
            
            // Sign in with email and password
            const userCredential = await auth.signInWithEmailAndPassword(email, password)
                .catch(error => {
                    console.error('🔥 Firebase auth error:', {
                        code: error.code,
                        message: error.message,
                        email: email
                    });
                    throw error;
                });
                
            const user = userCredential.user;
            console.log('✅ User authenticated successfully:', {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified
            });
            
            // Check if user is admin
            console.log('🔍 Checking admin privileges...');
            const adminDoc = await db.collection('admins').doc(user.uid).get()
                .catch(error => {
                    console.error('🔥 Firestore error when checking admin status:', error);
                    throw new Error('Failed to verify admin status');
                });
            
            const adminData = adminDoc.data();
            console.log('👨‍💼 Admin check result:', {
                exists: adminDoc.exists,
                role: adminData?.role,
                data: adminData
            });
            
            if (adminDoc.exists && adminData.role === 'admin') {
                console.log('🎉 Admin access granted!');
                console.log('🔄 Redirecting to dashboard...');
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                console.log('⛔ User is not an admin, signing out...');
                // User is not admin, sign out
                await auth.signOut();
                showError('You do not have admin privileges');
            }
        } catch (error) {
            console.error('❌ Login process failed:', {
                name: error.name,
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            
            let errorMessage = 'Failed to login. Please try again.';
            
            // More specific error messages
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                default:
                    console.error('Unhandled auth error:', error);
            }
            
            console.log('💬 Showing error to user:', errorMessage);
            showError(errorMessage);
        } finally {
            // Reset button state
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalBtnText;
            }
        }
    });
}

// Show error message
function showError(message) {
    console.error('Auth Error:', message);
    
    // Check if Swal is available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: '#0d6efd'
        });
    } else {
        // Fallback to alert if Swal is not available
        alert('Error: ' + message);
    }
    
    // Also log to console for debugging
    console.error('Authentication Error:', message);
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        console.error('Error signing out:', error);
        showError('Error signing out');
    });
}

// Export functions
window.logout = logout;
