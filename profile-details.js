import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                document.getElementById('profileName').textContent = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
                document.getElementById('profileEmail').textContent = userData.email || '';
                document.getElementById('firstName').value = userData.firstName || '';
                document.getElementById('lastName').value = userData.lastName || '';
                document.getElementById('email').value = userData.email || '';
                document.getElementById('phone').value = userData.phone || '';
            } else {
                // If user document doesn't exist, create a basic one
                await setDoc(userDocRef, {
                    email: user.email,
                    createdAt: new Date()
                }, { merge: true });
                document.getElementById('profileName').textContent = user.email;
                document.getElementById('profileEmail').textContent = user.email;
                document.getElementById('email').value = user.email;
            }

            // Handle profile update form submission
            const profileForm = document.getElementById('profileForm');
            if (profileForm) {
                profileForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const firstName = document.getElementById('firstName').value;
                    const lastName = document.getElementById('lastName').value;
                    const phone = document.getElementById('phone').value;

                    await setDoc(userDocRef, {
                        firstName,
                        lastName,
                        phone
                    }, { merge: true });
                    alert('Profile updated successfully!');
                    // Update displayed name and email immediately after saving
                    document.getElementById('profileName').textContent = `${firstName || ''} ${lastName || ''}`.trim();
                });
            }

        } else {
            // No user is logged in, redirect to login page
            window.location.href = 'login.html';
        }
    });
});