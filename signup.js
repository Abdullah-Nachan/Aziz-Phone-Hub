document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = signupForm.firstName.value;
            const lastName = signupForm.lastName.value;
            const email = signupForm.email.value;
            const phone = signupForm.phone.value;
            const password = signupForm.password.value;
            const confirmPassword = signupForm.confirmPassword.value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            try {
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                console.log('User registered:', userCredential.user);
                const user = userCredential.user;
                // Create a user document in Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    email: user.email,
                    phone: phone,
                    createdAt: new Date(),
                    cart: [],
                    wishlist: []
                });
                alert('Registration successful! You can now log in.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Registration error:', error.message);
                alert('Registration failed: ' + error.message);
            }
        });
    }
});