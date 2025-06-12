// firebase-utils.js
// This file provides ES6 module exports for Firebase auth and db instances.
// It assumes that the main Firebase app has already been initialized globally by firebase-config.js.

let authInstance;
let dbInstance;

// Wait for the 'firebase-ready' event dispatched by firebase-config.js
document.addEventListener('firebase-ready', () => {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        authInstance = firebase.auth();
        dbInstance = firebase.firestore();
        console.log('[firebase-utils] Firebase auth and db instances ready.');
    } else {
        console.error('[firebase-utils] Firebase not initialized when firebase-ready event fired.');
    }
});

// Export the instances as ES6 modules
// These will be undefined until the 'firebase-ready' event fires and they are assigned.
export { authInstance as auth, dbInstance as db }; 