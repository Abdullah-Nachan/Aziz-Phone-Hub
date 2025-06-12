document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    const showSignupBtn = document.getElementById('showSignupBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');

    const loginRow = document.getElementById('loginRow');
    const signupRow = document.getElementById('signupRow');
    const createAccountLink = document.getElementById('createAccountLink');
    const loginLink = document.getElementById('loginLink');
    const createAccountLinkMobile = document.getElementById('createAccountLinkMobile');
    const createAccountLinkMobileAlternate = document.getElementById('createAccountLinkMobileAlternate');
    const loginLinkMobileAlternate = document.getElementById('loginLinkMobileAlternate');
    const loginLinkDesktopAlternate = document.getElementById('loginLinkDesktopAlternate'); // Added for new desktop link
    const originalCreateAccountLinkContainerMobile = document.getElementById('originalCreateAccountLinkContainerMobile');
    const mobileCreateAccountLink = document.getElementById('mobileCreateAccountLink');
    const mobileLoginLink = document.getElementById('mobileLoginLink');

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.loginEmail.value;
            const password = loginForm.loginPassword.value;

            try {
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('User logged in:', userCredential.user);
                await migrateLocalStorageToFirebase();
                alert('Login successful!');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Login error:', error.message);
                alert('Login failed: ' + error.message);
            }
        });
    }

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form values
            const firstName = document.getElementById('signupFirstName').value.trim();
            const lastName = document.getElementById('signupLastName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;

            // Basic validation
            if (!firstName || !lastName || !email || !password) {
                alert('All fields are required');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }

            try {
                // Create user with email and password
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Create user document in Firestore
                const userData = {
                    uid: user.uid,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    displayName: `${firstName} ${lastName}`,
                    phone: '',
                    emailVerified: false,
                    profileComplete: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    cart: [],
                    wishlist: [],
                    orders: [],
                    addresses: []
                };

                // Save to Firestore
                await firebase.firestore().collection('users').doc(user.uid).set(userData);

                // Update user profile
                await user.updateProfile({
                    displayName: `${firstName} ${lastName}`
                });

                alert('Registration successful! You can now log in.');
                showLogin();
            } catch (error) {
                console.error('Registration error:', error);
                let errorMessage = 'Registration failed';

                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'This email is already registered. Please use a different email or login.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Password is too weak';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email address';
                }

                alert(errorMessage);
            }
        });
    }

    // Google Auth Provider
    const provider = new firebase.auth.GoogleAuthProvider();

    // Handle Google Login
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            await handleGoogleSignIn();
        });
    }

    // Handle Google Signup (reusing the same function as login)
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', async () => {
            await handleGoogleSignIn();
        });
    }

    async function handleGoogleSignIn() {
        try {
            const userCredential = await firebase.auth().signInWithPopup(provider);
            const user = userCredential.user;
            console.log('Google user logged in:', user);
            // Check if user document exists, if not, create it
            const userDocRef = firebase.firestore().collection('users').doc(user.uid);
            const userDocSnap = await userDocRef.get();

            if (!userDocSnap.exists()) {
                await userDocRef.set({
                    firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                    lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                    email: user.email,
                    phone: user.phoneNumber || '',
                    createdAt: new Date(),
                    cart: [],
                    wishlist: []
                });
            }
            await migrateLocalStorageToFirebase();
            alert('Login successful with Google!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Google login error:', error.message);
            alert('Google login failed: ' + error.message);
        }
    }

    // Toggle between login and signup sections
    function showSignup() {
        loginRow.classList.add('d-none');
        signupRow.classList.remove('d-none');
        mobileCreateAccountLink.classList.add('d-none');
        mobileLoginLink.classList.remove('d-none');
        window.scrollTo(0, 0);
    }

    function showLogin() {
        signupRow.classList.add('d-none');
        loginRow.classList.remove('d-none');
        mobileCreateAccountLink.classList.remove('d-none');
        mobileLoginLink.classList.add('d-none');
        window.scrollTo(0, 0);
    }

    if (createAccountLink) {
        createAccountLink.addEventListener('click', (e) => {
            e.preventDefault();
            showSignup();
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    }

    if (createAccountLinkMobile) {
        createAccountLinkMobile.addEventListener('click', (e) => {
            e.preventDefault();
            showSignup();
        });
    }

    if (createAccountLinkMobileAlternate) {
        createAccountLinkMobileAlternate.addEventListener('click', (e) => {
            e.preventDefault();
            showSignup();
            // Optionally hide the other mobile create account link container if this one is clicked
            if (originalCreateAccountLinkContainerMobile) {
                originalCreateAccountLinkContainerMobile.classList.add('d-none');
            }
        });
    }

    // When showing signup, ensure the alternate link's container (if it exists) is also handled or hidden
    // This might be redundant if the above click handler for alternate link already hides the original one.
    // However, if showSignup is called from desktop link, we might want to ensure mobile state is consistent.
    // For now, let's assume the click handler is sufficient. If issues arise, revisit this logic.


    if (loginLinkMobileAlternate) {
        loginLinkMobileAlternate.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    }

    if (loginLinkDesktopAlternate) { // Added event listener for new desktop link
        loginLinkDesktopAlternate.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    }

    // Add event listeners for the main toggle buttons
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSignup();
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    }

    // Add event listeners for mobile links
    if (createAccountLinkMobile) {
        createAccountLinkMobile.addEventListener('click', (e) => {
            e.preventDefault();
            showSignup();
        });
    }

    if (loginLinkMobile) {
        loginLinkMobile.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    }
});