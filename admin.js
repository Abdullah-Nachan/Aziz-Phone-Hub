// Admin Product Management
if (typeof window.ProductManager === 'undefined') {
class ProductManager {
    constructor() {
        this.productsRef = window.db.collection('products');
        this.storage = window.firebaseStorage;
    }

    // Add new product
    async addProduct(productData, imageFile) {
        try {
            // Upload image to Firebase Storage
            let imageUrl = '';
            if (imageFile) {
                const storageRef = this.storage.ref(`products/${Date.now()}_${imageFile.name}`);
                const snapshot = await storageRef.put(imageFile);
                imageUrl = await snapshot.ref.getDownloadURL();
            }

            // Add product to Firestore
            const productWithImage = {
                ...productData,
                imageUrl: imageUrl || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.productsRef.add(productWithImage);
            console.log('Product added with ID: ', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error adding product: ', error);
            return { success: false, error: error.message };
        }
    }

    // Update product
    async updateProduct(productId, productData, imageFile = null) {
        try {
            const updateData = { ...productData };
            
            // If new image is provided, upload it
            if (imageFile) {
                const storageRef = this.storage.ref(`products/${Date.now()}_${imageFile.name}`);
                const snapshot = await storageRef.put(imageFile);
                updateData.imageUrl = await snapshot.ref.getDownloadURL();
            }
            
            updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await this.productsRef.doc(productId).update(updateData);
            console.log('Product updated successfully');
            return { success: true };
        } catch (error) {
            console.error('Error updating product: ', error);
            return { success: false, error: error.message };
        }
    }

    // Delete product
    async deleteProduct(productId) {
        try {
            await this.productsRef.doc(productId).delete();
            console.log('Product deleted successfully');
            return { success: true };
        } catch (error) {
            console.error('Error deleting product: ', error);
            return { success: false, error: error.message };
        }
    }

    // Get all products
    async getAllProducts() {
        try {
            const snapshot = await this.productsRef.orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting products: ', error);
            return [];
        }
    }

    // Get single product
    async getProduct(productId) {
        try {
            const doc = await this.productsRef.doc(productId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting product: ', error);
            return null;
        }
    }
}

// Initialize Product Manager when Firebase is ready
let productManager;

function initProductManager() {
    if (window.firebaseInitialized) {
        productManager = new ProductManager();
        console.log('Product Manager initialized');
    } else {
        setTimeout(initProductManager, 500);
    }
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductManager);
} else {
    initProductManager();
}

// Make it globally available
window.ProductManager = ProductManager;
}
