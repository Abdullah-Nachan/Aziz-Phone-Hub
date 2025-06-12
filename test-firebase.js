/**
 * Test script to verify Firebase connection and functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Testing Firebase connection...');
    
    // Create test container
    const testContainer = document.createElement('div');
    testContainer.id = 'firebase-test-container';
    testContainer.style.position = 'fixed';
    testContainer.style.top = '10px';
    testContainer.style.right = '10px';
    testContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    testContainer.style.color = 'white';
    testContainer.style.padding = '10px';
    testContainer.style.borderRadius = '5px';
    testContainer.style.zIndex = '9999';
    testContainer.style.maxWidth = '300px';
    testContainer.style.maxHeight = '400px';
    testContainer.style.overflow = 'auto';
    document.body.appendChild(testContainer);
    
    // Add test header
    const testHeader = document.createElement('h4');
    testHeader.textContent = 'Firebase Connection Test';
    testHeader.style.margin = '0 0 10px 0';
    testContainer.appendChild(testHeader);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.padding = '2px 5px';
    closeButton.style.fontSize = '10px';
    closeButton.addEventListener('click', function() {
        testContainer.remove();
    });
    testContainer.appendChild(closeButton);
    
    // Function to add test result
    function addTestResult(name, result, success) {
        const resultElement = document.createElement('div');
        resultElement.style.marginBottom = '5px';
        resultElement.style.borderLeft = `3px solid ${success ? 'green' : 'red'}`;
        resultElement.style.paddingLeft = '5px';
        
        const nameElement = document.createElement('strong');
        nameElement.textContent = name + ': ';
        resultElement.appendChild(nameElement);
        
        const resultText = document.createElement('span');
        resultText.textContent = result;
        resultElement.appendChild(resultText);
        
        testContainer.appendChild(resultElement);
        
        // Also log to console
        console.log(`Test: ${name} - ${result} - ${success ? 'Success' : 'Failed'}`);
    }
    
    // Test Firebase initialization
    if (typeof firebase !== 'undefined') {
        addTestResult('Firebase SDK', 'Available', true);
        
        // Test Firestore
        if (typeof firebase.firestore === 'function') {
            addTestResult('Firestore', 'Available', true);
            
            // Test db variable
            if (typeof db !== 'undefined') {
                addTestResult('DB Variable', 'Available', true);
                
                // Test products collection
                db.collection('products').limit(1).get()
                    .then(snapshot => {
                        if (snapshot.empty) {
                            addTestResult('Products Collection', 'Empty (No products found)', false);
                        } else {
                            addTestResult('Products Collection', 'Available', true);
                            
                            // Test product data
                            const doc = snapshot.docs[0];
                            const product = doc.data();
                            if (product && product.name) {
                                addTestResult('Product Data', `Found: ${product.name}`, true);
                            } else {
                                addTestResult('Product Data', 'Invalid format', false);
                            }
                        }
                    })
                    .catch(error => {
                        addTestResult('Products Collection', `Error: ${error.message}`, false);
                    });
            } else {
                addTestResult('DB Variable', 'Not available', false);
            }
        } else {
            addTestResult('Firestore', 'Not available', false);
        }
        
        // Test Authentication
        if (typeof firebase.auth === 'function') {
            addTestResult('Authentication', 'Available', true);
            
            // Test auth variable
            if (typeof auth !== 'undefined') {
                addTestResult('Auth Variable', 'Available', true);
            } else {
                addTestResult('Auth Variable', 'Not available', false);
            }
        } else {
            addTestResult('Authentication', 'Not available', false);
        }
        
        // Test Storage
        if (typeof firebase.storage === 'function') {
            addTestResult('Storage', 'Available', true);
            
            // Test storage variable
            if (typeof storage !== 'undefined') {
                addTestResult('Storage Variable', 'Available', true);
            } else {
                addTestResult('Storage Variable', 'Not available', false);
            }
        } else {
            addTestResult('Storage', 'Not available', false);
        }
    } else {
        addTestResult('Firebase SDK', 'Not available', false);
    }
    
    // Test cart functionality
    if (typeof window.cart !== 'undefined') {
        addTestResult('Cart Module', 'Available', true);
    } else if (typeof window.cartInstance !== 'undefined') {
        addTestResult('Cart Module', 'Available (as cartInstance)', true);
    } else {
        addTestResult('Cart Module', 'Not available', false);
    }
    
    // Test wishlist functionality
    if (typeof window.wishlist !== 'undefined') {
        addTestResult('Wishlist Module', 'Available', true);
    } else if (typeof window.wishlistInstance !== 'undefined') {
        addTestResult('Wishlist Module', 'Available (as wishlistInstance)', true);
    } else {
        addTestResult('Wishlist Module', 'Not available', false);
    }
    
    // Test products functionality
    if (typeof window.getAllProducts === 'function') {
        addTestResult('Products Module', 'Available', true);
    } else {
        addTestResult('Products Module', 'Not available', false);
    }
});
