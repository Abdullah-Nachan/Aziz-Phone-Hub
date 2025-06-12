// Profile dropdown functionality
console.log('Profile.js loading...', window.location.href);
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in profile.js', window.location.href);
    
    // Desktop elements
    const profileDropdown = document.getElementById('profileDropdown');
    const profileMenu = document.querySelector('.dropdown-menu[aria-labelledby="profileDropdown"]');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginSignupBtn = document.getElementById('loginSignupBtn');
    
    // Mobile elements
    // Mobile header profile dropdown buttons
    const mobileLoginBtn = document.getElementById('mobileLoginSignupBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    // Get parent li elements for easier class toggling and direct style manipulation
    const desktopLogoutLi = logoutBtn ? logoutBtn.parentElement : null;
    const desktopLoginLi = loginSignupBtn ? loginSignupBtn.parentElement : null;
    // Get parent li elements for mobile header buttons
    const mobileLogoutLi = mobileLogoutBtn ? mobileLogoutBtn.parentElement : null;
    const mobileLoginLi = mobileLoginBtn ? mobileLoginBtn.parentElement : null; // Use mobileLoginBtn here
    
    console.log('Profile elements found:', {
        desktop: {
            profileDropdown: !!profileDropdown,
            logoutBtn: !!logoutBtn,
            loginSignupBtn: !!loginSignupBtn,
            desktopLogoutLi: !!desktopLogoutLi,
            desktopLoginLi: !!desktopLoginLi
        },
        mobile: {
            mobileProfileDropdown: !!mobileLoginBtn,
            mobileLogoutBtn: !!mobileLogoutBtn,
            mobileLoginSignupBtn: !!mobileLoginBtn,
            mobileLogoutLi: !!mobileLogoutLi,
            mobileLoginLi: !!mobileLoginLi
        },
        currentUrl: window.location.href
    });

    // Function to update the visibility of login/logout buttons
    function updateProfileDropdownVisibility() {
        console.log('Updating profile dropdown button visibility...', 'on page:', window.location.href);
        const user = firebase.auth().currentUser;
        
        // Check if user is authenticated (not anonymous and has email or provider data)
        const isAuthenticatedUser = user && 
            !user.isAnonymous && 
            ((user.email && user.email.length > 0) || 
             (user.providerData && user.providerData.length > 0));
        
        console.log('Auth state check for visibility update:', {
            isAuthenticatedUser: isAuthenticatedUser, 
            user: user ? {
                uid: user.uid,
                email: user.email,
                isAnonymous: user.isAnonymous,
                hasProviderData: user.providerData && user.providerData.length > 0
            } : 'No user', 
            currentPage: window.location.href
        });

        // Desktop UI: Show ONLY one button at a time
        if (desktopLogoutLi) desktopLogoutLi.style.display = isAuthenticatedUser ? 'block' : 'none';
        if (desktopLoginLi) desktopLoginLi.style.display = isAuthenticatedUser ? 'none' : 'block';

        // Hide both if state is unknown (should not happen, for safety)
        if (!isAuthenticatedUser && !user) {
            if (desktopLogoutLi) desktopLogoutLi.style.display = 'none';
            if (desktopLoginLi) desktopLoginLi.style.display = 'block';
        }

        // Mobile UI: Show ONLY one button at a time
        if (mobileLogoutLi) mobileLogoutLi.style.display = isAuthenticatedUser ? 'block' : 'none';
        if (mobileLoginLi) mobileLoginLi.style.display = isAuthenticatedUser ? 'none' : 'block';

        // Hide both if state is unknown (should not happen, for safety)
        if (!isAuthenticatedUser && !user) {
            if (mobileLogoutLi) mobileLogoutLi.style.display = 'none';
            if (mobileLoginLi) mobileLoginLi.style.display = 'block';
        }
    }

    // Function to handle logout with confirmation
    async function handleLogout(e) {
        e.preventDefault();
        console.log('Logout button clicked, handling logout...', 'on page:', window.location.href);
        
        try {
            // Show confirmation dialog
            const result = await Swal.fire({
                title: 'Logout Confirmation',
                text: 'Are you sure you want to logout?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, logout',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                console.log('User confirmed logout', 'on page:', window.location.href);
                
                // Sign out the user
                await firebase.auth().signOut();
                console.log('User signed out successfully', 'on page:', window.location.href);
                
                // Update UI immediately without waiting for auth state change
                updateProfileDropdownVisibility();
                
                // Show success message
                Swal.fire({
                    title: 'Logged Out!',
                    text: 'You have been successfully logged out.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Error signing out:', error, 'on page:', window.location.href);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to logout. Please try again: ' + error.message,
                icon: 'error'
            });
        }
    }

    // Listen for auth state changes
    firebase.auth().onAuthStateChanged((user) => {
        // If on auth.html and user is logged in, redirect to home
        if ((window.location.pathname.endsWith('auth.html') || window.location.pathname.endsWith('/auth.html')) && user && !user.isAnonymous) {
            window.location.href = 'index.html';
            return;
        }
        console.log('Auth state changed listener triggered:', user ? `User signed in: ${user.email || 'no email'} (${user.isAnonymous ? 'anonymous' : 'authenticated'})` : 'No user', 'on page:', window.location.href);
            
        if (user) {
            console.log('Auth state changed - User details:', {
                uid: user.uid,
                email: user.email,
                isAnonymous: user.isAnonymous,
                emailVerified: user.emailVerified,
                providerData: user.providerData,
                providerId: user.providerId,
                metadata: user.metadata
            }, 'on page:', window.location.href);
        } else {
             console.log('User logged out details: N/A', 'on page:', window.location.href);
        }
        
        // Update profile dropdown button visibility on auth state change
        updateProfileDropdownVisibility();
    });
    
    // Initial check and update on DOMContentLoaded
    updateProfileDropdownVisibility();
    console.log('Initial updateProfileDropdownVisibility call on DOMContentLoaded', window.location.href);
    
    // Handle logout for desktop
    if (logoutBtn) {
        console.log('Adding desktop logout click listener', 'on page:', window.location.href);
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Handle logout for mobile
    if (mobileLogoutBtn) {
         console.log('Adding mobile logout click listener', 'on page:', window.location.href);
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    if (profileDropdown) {
        console.log('Adding profile dropdown click listener', 'on page:', window.location.href);
        // Handle click on profile icon
        profileDropdown.addEventListener('click', function(e) {
            console.log('Profile dropdown clicked', 'on page:', window.location.href);
            // If clicking directly on the icon (not a dropdown item)
            // Do not prevent default here to allow Bootstrap to handle dropdown toggle
             console.log('Checking if click is on dropdown menu item...', e.target.closest('.dropdown-menu'));
            if (!e.target.closest('.dropdown-menu')) {
                 console.log('Click is on profile icon, not dropdown menu item.', 'on page:', window.location.href);
                // Update auth options right before showing the dropdown
                // updateAuthOptions(firebase.auth().currentUser); // Removed redundant call
                 updateProfileDropdownVisibility(); // Ensure correct visibility before toggle
                 console.log('Called updateProfileDropdownVisibility from dropdown click', 'on page:', window.location.href);
                
                // Let Bootstrap toggle the dropdown
                 console.log('Letting Bootstrap handle dropdown toggle.', 'on page:', window.location.href);
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
             console.log('Document clicked', 'on page:', window.location.href);
            if (!profileDropdown.contains(e.target) && (!profileMenu || !profileMenu.contains(e.target))) {
                const dropdown = bootstrap.Dropdown.getInstance(profileDropdown);
                if (dropdown) {
                    dropdown.hide();
                     console.log('Dropdown hidden', 'on page:', window.location.href);
                }
            }
        });
    }
     console.log('profile.js DOMContentLoaded end', window.location.href);
});

console.log('profile.js end', window.location.href);
