// admin-panel/migrate-reviews.js
// Script to generate and add realistic reviews to Firestore for all products
// - 100-150 reviews per product
// - 300-400 reviews for 'AirPods + MagSafe Combo Offer'
// - 1000-1500 ratings per product

const admin = require('firebase-admin');
const { faker } = require('@faker-js/faker');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

// All products from static-products.js
const products = [
  { id: 'airpods01', name: 'AirPods Gen 4 (ANC)' },
  { id: 'airpods-pro-2', name: 'AirPods Pro 2' },
  { id: 'airpods-pro-2-display', name: 'AirPods Pro 2 with Display' },
  { id: 'airpods-3', name: 'AirPods 3rd Generation' },
  { id: 'airpods-2', name: 'AirPods 2nd Generation' },
  { id: 'galaxy-buds-2-pro', name: 'Samsung Galaxy Buds 2 Pro' },
  { id: 'airpods-max', name: 'AirPods Max' },
  { id: 'bose-qc-ultra', name: 'Bose QC Ultra' },
  { id: 'samsung-watch-ultra', name: 'Samsung Watch Ultra' },
  { id: 'active-2-smartwatch', name: 'Active 2 Smartwatch' },
  { id: 'gen-9-pro', name: 'Gen 9 Pro Bluetooth Calling Smartwatch' },
  { id: 't10-ultra', name: 'T10 Ultra Bluetooth Smartwatch' },
  { id: 'z86-pro-max', name: 'Z86 Pro Max Smartwatch' },
  { id: 'apple-watch-series-10', name: 'Apple Watch Series 10' },
  { id: 'hk9-ultra', name: 'HK9 Ultra Smartwatch' },
  { id: 's9-pro-max', name: 'S9 Pro Max Smartwatch' },
  { id: 'x90-max', name: 'X90 Max Smartwatch' },
  { id: 'nike-vomero-black', name: 'Nike Zoom Vomero Triple Black' },
  { id: 'nike-vomero-white', name: 'Nike Zoom Vomero White-Black' },
  { id: 'puma-suede-crush', name: 'Puma XL Suede Crush Black White' },
  { id: 'nike-airmax', name: 'Nike Air Max 90' },
  { id: 'nike-dunk-unc', name: 'Nike Dunk Low UNC' },
  { id: 'boss-hugo', name: 'Boss Hugo' },
  { id: 'cartier-roman', name: 'Cartier Roman Dial' },
  { id: 'gshock-manga', name: 'G-Shock Manga Edition' },
  { id: 'omega-seamaster', name: 'Omega Seamaster' },
  { id: 'tissot-trace', name: 'Tissot T-race Chronograph' },
  { id: 'crocs-literide-360', name: 'Crocs LiteRide 360' },
  { id: 'bayband', name: 'Crocs Bayaband Clog' },
  { id: 'bayband-flip', name: 'Crocs Bayaband Flip' },
  { id: 'yukon', name: 'Crocs Yukon' },
  { id: 'apple-power-adapter', name: 'Apple 20W USB-C Power Adapter' },
  { id: 'type-c-cable', name: 'Apple Type C to C Cable' },
  { id: 'type-c-lightning-cable', name: 'Apple Type C to Lightning Cable' },
  { id: 'magsafe', name: 'Apple MagSafe Battery Pack 5000 Mah' },
  { id: 'airpods-pro2-magsafe', name: 'Airpods Pro 2 & MagSafe Battery Pack' }, // Combo offer
  { id: 'series9-gold-with-straps', name: 'Apple Watch Series 9 Gold with Straps' },
  { id: '7in1-apple-ultra-smartwatch', name: 'Apple Ultra Smartwatch with 7 straps' },
];

// Example positive points for products
const productPositives = [
  'Excellent battery life',
  'Crystal clear sound',
  'Fast charging',
  'Premium build quality',
  'Great value for money',
  'Easy to use',
  'Compact and portable',
  'Amazing camera',
  'Superb display',
  'Seamless connectivity',
  'Comfortable fit',
  'Long-lasting performance',
  'Highly recommended',
  'Perfect for daily use',
  'Outstanding customer support',
];

function getRandomPositives(count) {
  const shuffled = productPositives.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join('. ') + '.';
}

async function addReviewsForProduct(product, reviewCount, ratingCount) {
  // Add reviews
  for (let i = 0; i < reviewCount; i++) {
    const review = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      rating: Math.floor(Math.random() * 5) + 1,
      comment: `${faker.lorem.sentences(1)} ${getRandomPositives(2 + Math.floor(Math.random() * 3))}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      productId: product.id,
      productName: product.name
    };
    await db.collection('reviews').add(review);
    if (i % 50 === 0) console.log(`Added ${i} reviews for ${product.name}...`);
  }
  // Add ratings (without comments)
  for (let i = 0; i < ratingCount; i++) {
    const rating = {
      rating: Math.floor(Math.random() * 5) + 1,
      productId: product.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('ratings').add(rating);
    if (i % 200 === 0) console.log(`Added ${i} ratings for ${product.name}...`);
  }
}

async function main() {
  for (const product of products) {
    if (product.id === 'airpods-pro2-magsafe') {
      await addReviewsForProduct(product, faker.number.int({ min: 300, max: 400 }), faker.number.int({ min: 1000, max: 1500 }));
    } else {
      await addReviewsForProduct(product, faker.number.int({ min: 100, max: 150 }), faker.number.int({ min: 1000, max: 1500 }));
    }
    console.log(`Finished for ${product.name}`);
  }
  console.log('All reviews and ratings added!');
}

main(); 