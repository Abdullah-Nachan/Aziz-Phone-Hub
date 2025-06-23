/**
 * Firebase Configuration for Aziz Phone Hub
 * Handles initialization of Firebase services and provides global references
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAZGH8rJGdSyBFMAi0C83hmiV7MVqfLdz4",
    authDomain: "aziz-phone-hub.firebaseapp.com",
    projectId: "aziz-phone-hub",
    storageBucket: "aziz-phone-hub.appspot.com",
    messagingSenderId: "473526218558",
    appId: "1:473526218558:web:e4148eb208cb6f5a03466f"
};

// Initialize Firebase
try {
    if (typeof firebase === 'undefined') {
        console.error('Firebase library not loaded! Make sure the <script> tag is present and before this config.');
        throw new Error('Firebase not loaded');
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
    } else {
        console.log('Firebase already initialized');
    }

    // Get Firestore instance with settings for better performance
    const db = firebase.firestore();
    db.settings({ 
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        experimentalForceLongPolling: true // This helps with some connectivity issues
    });
    console.log('Firestore settings applied');

    // Get Auth instance
    const auth = firebase.auth();
    
    // Enable offline persistence for auth
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log('Auth persistence set to LOCAL');
            
            // Sign in anonymously to ensure we can access public data
            // Skip anonymous auth on auth page to prevent redirect issues
            if (!auth.currentUser && !window.location.pathname.includes('auth.html')) {
                // First attempt at anonymous auth
                signInAnonymouslyWithRetry(3);
            }
        })
        .catch(error => {
            console.warn('Auth persistence setting failed:', error);
        });
    
    // Function to retry anonymous sign-in with exponential backoff
    function signInAnonymouslyWithRetry(retriesLeft, delay = 1000) {
        auth.signInAnonymously()
            .then(() => {
                console.log('Anonymous auth successful - this helps with Firestore permissions');
                // Dispatch event to notify components that auth is ready
                document.dispatchEvent(new CustomEvent('auth-ready', { detail: { anonymous: true } }));
            })
            .catch(error => {
                console.warn(`Anonymous auth attempt failed (${retriesLeft} retries left):`, error);
                
                // Check if the error is due to admin-only restriction
                if (error.message && error.message.includes('restricted to administrators only')) {
                    console.log('Anonymous auth is restricted to admins. Proceeding with public access.');
                    // Dispatch event to notify components that auth is ready even though we're not authenticated
                    // This will allow read-only access to public collections based on Firestore rules
                    document.dispatchEvent(new CustomEvent('auth-ready', { detail: { anonymous: false, publicAccess: true } }));
                    return;
                }
                
                // If we have retries left, try again with exponential backoff
                if (retriesLeft > 0) {
                    console.log(`Retrying anonymous auth in ${delay}ms...`);
                    setTimeout(() => {
                        signInAnonymouslyWithRetry(retriesLeft - 1, delay * 2);
                    }, delay);
                } else {
                    console.error('All anonymous auth attempts failed. Proceeding without authentication.');
                    // Dispatch event to notify components that auth failed but they should proceed anyway
                    document.dispatchEvent(new CustomEvent('auth-failed', { detail: error }));
                }
            });
    }

    // Export instances to window for global access
    window.db = db;
    window.auth = auth;

    // Create collection references
    window.productsRef = db.collection('products');
    window.ordersRef = db.collection('orders');
    window.usersRef = db.collection('users');
    
    // Log initialization status
    console.log('Firebase configuration loaded successfully');
    
    // Set a flag to indicate Firebase is ready
    window.firebaseInitialized = true;
    
    // Dispatch custom event for other scripts to listen to
    const event = new Event('firebaseInitialized');
    document.dispatchEvent(event);
    
    console.log('firebaseInitialized event dispatched');
    
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Still dispatch the event but with an error flag
    const errorEvent = new CustomEvent('firebaseInitialized', { detail: { error: true, message: error.message } });
    document.dispatchEvent(errorEvent);
}

/**
 * Migrates data from localStorage to Firebase when a user is logged in
 * This ensures that cart and wishlist data persists across devices
 */
function migrateLocalStorageToFirebase() {
    try {
        // Only proceed if user is logged in
        if (!auth.currentUser) {
            console.log('No user logged in, skipping migration');
            return;
        }
        
        const userId = auth.currentUser.uid;
        
        // Migrate wishlist
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        if (wishlist.length > 0) {
            db.collection('users').doc(userId).set({
                wishlist: wishlist
            }, { merge: true });
            console.log('Wishlist migrated to Firebase');
        }
        
        // Migrate cart
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length > 0) {
            db.collection('users').doc(userId).set({
                cart: cart
            }, { merge: true });
            console.log('Cart migrated to Firebase');
        }
    } catch (error) {
        console.error('Error migrating localStorage to Firebase:', error);
    }
}

// Add auth state change listener to migrate data when user logs in
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User signed in, migrating local data to Firebase');
        migrateLocalStorageToFirebase();
    }
});

// Make migration function available globally
window.migrateLocalStorageToFirebase = migrateLocalStorageToFirebase;

/**
 * Tests the Firestore connection to ensure everything is working
 */
function testFirestoreConnection() {
    console.log('Testing Firestore connection...');
    
    db.collection('test').doc('connection').set({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        test: 'Connection test'
    })
    .then(() => {
        console.log('✅ Firestore connection successful!');
    })
    .catch(error => {
        console.error('❌ Firestore connection error:', error);
    });
}

// Make test function available globally
window.testFirestoreConnection = testFirestoreConnection;

// Log initialization status
console.log('Firebase initialized successfully');
console.log('DB Reference:', window.db ? '✅ Available' : '❌ Missing');
console.log('Auth Reference:', window.auth ? '✅ Available' : '❌ Missing');
// console.log('Storage Reference:', window.storage ? '✅ Available' : '❌ Missing');

// Export Firebase services if needed for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        firebase,
        db,
        auth,
        // storage,
        productsRef: window.productsRef,
        ordersRef: window.ordersRef,
        usersRef: window.usersRef
    };
}
