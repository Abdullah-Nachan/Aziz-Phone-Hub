// Firebase config for Admin Panel ONLY
const firebaseConfig = {
    apiKey: "AIzaSyAZGH8rJGdSyBFMAi0C83hmiV7MVqfLdz4",
    authDomain: "aziz-phone-hub.firebaseapp.com",
    projectId: "aziz-phone-hub",
    storageBucket: "aziz-phone-hub.appspot.com",
    messagingSenderId: "473526218558",
    appId: "1:473526218558:web:e4148eb208cb6f5a03466f"
};

// Initialize Firebase (if not already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Expose Auth and Firestore globally for admin scripts
window.db = firebase.firestore();
window.auth = firebase.auth();

console.log('[ADMIN] Firebase initialized for admin panel'); 