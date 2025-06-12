document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('User logged in:', userCredential.user);
                console.log('User logged in:', userCredential.user);
                // Call the global migration function
                if (window.migrateLocalStorageToFirebase) {
                    window.migrateLocalStorageToFirebase();
                } else {
                    console.warn('migrateLocalStorageToFirebase function not found.');
                }
                alert('Login successful!');
                window.location.href = 'index.html'; // Redirect to home page after successful login
            } catch (error) {
                console.error('Login error:', error.message);
                alert('Login failed: ' + error.message);
            }
        });
    }
});