// admin/js/migrate-reviews.js
// Migration script to add realistic reviews to Firestore for all products (browser version)
// This script is loaded in migrate-reviews.html and exposes migrateReviews()

// All products from static-products.js (copy the same array as before)
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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomName() {
  const firstNames = ["Ali", "Ahmed", "Sara", "Fatima", "Usman", "Ayesha", "Bilal", "Zain", "Hira", "Imran", "Sana", "Hamza", "Mariam", "Danish", "Rabia", "Kashif", "Nida", "Fahad", "Mehwish", "Saad", "Iqra"];
  const lastNames = ["Khan", "Malik", "Sheikh", "Butt", "Raza", "Qureshi", "Chaudhry", "Hussain", "Javed", "Rashid", "Siddiqui", "Farooq", "Nawaz", "Shah", "Mirza", "Abbasi", "Mughal", "Ansari", "Akhtar", "Gill"];
  return firstNames[randomInt(0, firstNames.length-1)] + ' ' + lastNames[randomInt(0, lastNames.length-1)];
}

function randomEmail(name) {
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "mail.com"];
  return (
    name.toLowerCase().replace(/ /g, '.') + randomInt(1, 99) + '@' + domains[randomInt(0, domains.length-1)]
  );
}

function randomComment(productName) {
  const openers = [
    `I bought the ${productName} and`,
    `After using the ${productName},`,
    `The ${productName} is`,
    `My experience with the ${productName} has been`,
    `Absolutely love my new ${productName}!`,
    `The ${productName} exceeded my expectations.`,
    `Very happy with the ${productName}.`,
  ];
  return (
    openers[randomInt(0, openers.length-1)] + ' ' + getRandomPositives(2 + randomInt(0,2))
  );
}

// Cloudinary image URLs for AirPods + MagSafe Combo
const comboImages = [
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386238/1_diogti.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386238/2_aygwk3.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386237/3_xgzr7b.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386239/4_k6s4cn.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386239/5_atkbba.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386239/6_hyq3pr.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386239/7_yaav1u.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386239/8_rfghed.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386240/9_egsz0p.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386238/10_prvmrc.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386238/11_stnww9.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386240/12_pp3nf5.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386241/13_jyntbe.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386240/14_pf6lsv.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386240/15_n9pnng.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386241/16_pccazv.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386238/17_rphina.jpg",
  "https://res.cloudinary.com/dkcibdwm8/video/upload/v1751386240/18_pdv40v.mp4",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386239/18_q01pmd.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386241/19_amgm0s.jpg",
  "https://res.cloudinary.com/dkcibdwm8/image/upload/v1751386241/20_huwhfj.jpg"
];

function getRandomImages(arr, min = 0, max = 2) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomPastDate() {
  const now = new Date();
  const choice = Math.random();
  let past;
  if (choice < 0.2) { // hours ago
    past = new Date(now.getTime() - Math.floor(Math.random() * 24) * 60 * 60 * 1000);
  } else if (choice < 0.5) { // days ago
    past = new Date(now.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
  } else if (choice < 0.8) { // weeks ago
    past = new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
  } else { // months ago
    past = new Date(now.getTime() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000);
  }
  return past;
}

// 60 unique Indian first names and last names
const indianFirstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Dhruv', 'Kabir', 'Rudra', 'Anaya', 'Aadhya', 'Siya', 'Pari', 'Anika',
  'Navya', 'Myra', 'Ira', 'Aarohi', 'Saanvi', 'Prisha', 'Riya', 'Aanya', 'Ishita', 'Sara',
  'Meera', 'Anvi', 'Aaradhya', 'Vanya', 'Trisha', 'Diya', 'Kiara', 'Tara', 'Mira', 'Advika',
  'Aisha', 'Amaira', 'Jiya', 'Samaira', 'Pranav', 'Laksh', 'Om', 'Yash', 'Harsh', 'Manav',
  'Dev', 'Aryan', 'Kunal', 'Rohan', 'Nikhil', 'Siddharth', 'Rahul', 'Abhinav', 'Saurabh', 'Gaurav'
];
const indianLastNames = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Singh', 'Gupta', 'Mehta', 'Jain', 'Agarwal',
  'Kumar', 'Das', 'Chopra', 'Joshi', 'Kapoor', 'Bose', 'Chatterjee', 'Banerjee', 'Ghosh', 'Mishra',
  'Rao', 'Iyer', 'Menon', 'Pillai', 'Shetty', 'Naidu', 'Shah', 'Desai', 'Kulkarni', 'Pandey',
  'Tripathi', 'Dubey', 'Yadav', 'Chaudhary', 'Saxena', 'Srivastava', 'Bhatt', 'Pandit', 'Pathak', 'Tiwari',
  'Jadhav', 'More', 'Pawar', 'Deshmukh', 'Patil', 'Shinde', 'Gaikwad', 'Salunkhe', 'Bhosale', 'Sawant',
  'Kadam', 'Gawande', 'Chavan', 'Lokhande', 'Dani', 'Gokhale', 'Phadke', 'Kelkar', 'Joshi', 'Apte'
];

// 20 combo images (already defined as comboImages)
// 15 reviews get 1 or 2 unique images, no repeats
function assignComboImagesToReviews(reviewCount, comboImages) {
  const assignments = Array(reviewCount).fill().map(() => []);
  let imgIdx = 0;
  for (let i = 0; i < 15 && imgIdx < comboImages.length; i++) {
    let numImages = (imgIdx + 1 < comboImages.length && Math.random() < 0.5) ? 2 : 1;
    if (imgIdx + numImages > comboImages.length) numImages = 1;
    assignments[i] = comboImages.slice(imgIdx, imgIdx + numImages);
    imgIdx += numImages;
  }
  return assignments;
}

// Hindi (Roman), Marathi, and English comments
const hindiComments = [
  'Bahut badiya product hai, paisa vasool!',
  'Sound quality zabardast hai, battery bhi acchi hai.',
  'Delivery time pe hui, packaging bhi sahi thi.',
  'Mujhe bahut pasand aaya, dosto ko bhi recommend kiya.',
  'Charging bahut fast hai, design bhi stylish hai.'
];
const marathiComments = [
  'उत्पादन खूप छान आहे, आवाजाची गुणवत्ता अप्रतिम आहे.',
  'पैशाची पूर्ण किंमत मिळाली, मी समाधानी आहे.',
  'डिलिव्हरी वेळेत झाली, पॅकेजिंग उत्तम.',
  'चार्जिंग जलद आहे, डिझाईन आकर्षक आहे.',
  'माझ्या मित्रांनाही आवडले.'
];
const englishComments = [
  'Excellent product, totally worth the price.',
  'Amazing sound and battery backup.',
  'Delivery was on time and packaging was great.',
  'Very happy with the purchase, highly recommended.',
  'Fast charging and stylish design.'
];

// Expanded pool of unique comments for more variety
const uniqueComments = [
  // English
  'Absolutely love the sound quality and battery life!',
  'The fit is perfect and the design is very stylish.',
  'Noise cancellation works like a charm.',
  'Very comfortable for long use.',
  'The charging case is compact and easy to carry.',
  'Pairing was super easy and quick.',
  'Mic quality is great for calls.',
  'Bass is punchy and clear.',
  'Touch controls are very responsive.',
  'Build quality feels premium.',
  // Roman Hindi
  'Yeh product sach mein kamaal ka hai!',
  'Battery backup zabardast hai.',
  'Dosto ko bhi pasand aaya.',
  'Sound bilkul clear hai.',
  'Design bahut hi modern hai.',
  'Delivery time pe mil gaya.',
  'Charging bahut fast hai.',
  'Use karne mein bahut aasan hai.',
  'Packaging bhi acchi thi.',
  'Main khush hoon is kharid se.',
  // Marathi
  'हे उत्पादन खूप छान आहे.',
  'आवाजाची गुणवत्ता अप्रतिम आहे.',
  'पैशाची पूर्ण किंमत मिळाली.',
  'डिलिव्हरी वेळेत झाली.',
  'पॅकेजिंग उत्तम होती.',
  'चार्जिंग जलद आहे.',
  'डिझाईन आकर्षक आहे.',
  'माझ्या मित्रांनाही आवडले.',
  'उपयोगात सोपे आहे.',
  'मी खूप समाधानी आहे.'
];

// Negative comments
const negativeComments = [
  'Battery drains too quickly, not satisfied.',
  'Sound quality is not as expected, disappointed.'
];

function getReviewComment(idx, usedCommentsSet) {
  // First 20: unique comments
  if (idx < 20) {
    for (let i = 0; i < uniqueComments.length; i++) {
      if (!usedCommentsSet.has(uniqueComments[i])) {
        usedCommentsSet.add(uniqueComments[i]);
        return uniqueComments[i];
      }
    }
    // Fallback if not enough unique
    return uniqueComments[idx % uniqueComments.length];
  }
  // For negative reviews (handled separately)
  // For the rest: random from all pools
  const allComments = [...uniqueComments, ...hindiComments, ...marathiComments, ...englishComments];
  return allComments[Math.floor(Math.random() * allComments.length)];
}

// Expanded pool of unique comments for all products
const allProductUniqueComments = [
  // English
  'Great value for money, highly recommended!',
  'The product exceeded my expectations.',
  'Very easy to use and setup.',
  'Customer support was very helpful.',
  'Build quality is top notch.',
  'Battery lasts longer than advertised.',
  'Looks and feels premium.',
  'Delivery was super fast.',
  'Perfect for daily use.',
  'Sound quality is crystal clear.',
  // Roman Hindi
  'Yeh product bahut accha hai, main khush hoon.',
  'Paise vasool item hai.',
  'Dosto ko bhi recommend kiya.',
  'Use karne mein bahut aasan hai.',
  'Design mast hai.',
  'Delivery time pe mil gaya.',
  'Quality bilkul expected jaisi hai.',
  'Main fir se kharidunga.',
  'Packaging bhi acchi thi.',
  'Service bhi badiya thi.',
  // Marathi
  'उत्पादनाची गुणवत्ता खूप छान आहे.',
  'पैशाची पूर्ण किंमत मिळाली.',
  'डिलिव्हरी वेळेत झाली.',
  'पॅकेजिंग उत्तम होती.',
  'डिझाईन आकर्षक आहे.',
  'माझ्या मित्रांनाही आवडले.',
  'उपयोगात सोपे आहे.',
  'मी खूप समाधानी आहे.',
  'चार्जिंग जलद आहे.',
  'सर्व काही अपेक्षेप्रमाणे आहे.'
];

window.migrateReviews = async function({log, updateProgress, setStatus}) {
  const comboProductId = 'airpods-pro2-magsafe';
  const comboProductName = 'Airpods Pro 2 & MagSafe Battery Pack';
  const reviewCount = 60;
  log(`Generating ${reviewCount} reviews for ${comboProductName}...`, 'info');
  setStatus(`Migrating reviews for ${comboProductName}...`);
  let total = 0;
  // Assign images to reviews
  const imageAssignments = assignComboImagesToReviews(reviewCount, comboImages.slice());
  // Pick 2 random indices for negative reviews
  const negativeIdx1 = Math.floor(Math.random() * 20); // in first 20
  let negativeIdx2 = 20 + Math.floor(Math.random() * 40); // in rest
  if (negativeIdx2 === negativeIdx1) negativeIdx2 = (negativeIdx2 + 1) % reviewCount;
  const usedCommentsSet = new Set();
  for (let i = 0; i < reviewCount; i++) {
    const firstName = indianFirstNames[i];
    const lastName = indianLastNames[i];
    const name = `${firstName} ${lastName}`;
    let rating = randomInt(4, 5);
    let comment = getReviewComment(i, usedCommentsSet);
    // Insert negative reviews
    if (i === negativeIdx1) {
      rating = randomInt(1, 2);
      comment = negativeComments[0];
    } else if (i === negativeIdx2) {
      rating = randomInt(1, 2);
      comment = negativeComments[1];
    }
    const review = {
      productId: comboProductId,
      productName: comboProductName,
      name,
      email: randomEmail(name),
      rating,
      comment,
      timestamp: randomPastDate().toISOString(),
      mediaUrls: imageAssignments[i]
    };
    await firebase.firestore().collection('reviews').add(review);
    total++;
    if (total % 10 === 0 || total === reviewCount) {
      log(`Added ${total} reviews for ${comboProductName}`, 'success');
      updateProgress(total, reviewCount);
    }
  }
  setStatus('All reviews migrated!');
  log(`All reviews migrated! Total: ${total}`, 'success');

  // --- All other products ---
  for (const product of products) {
    if (product.id === comboProductId) continue;
    const reviewCount = randomInt(20, 30);
    log(`Generating ${reviewCount} reviews for ${product.name}...`, 'info');
    setStatus(`Migrating reviews for ${product.name}...`);
    let total = 0;
    // Shuffle names for uniqueness per product
    const shuffledFirstNames = indianFirstNames.slice().sort(() => 0.5 - Math.random());
    const shuffledLastNames = indianLastNames.slice().sort(() => 0.5 - Math.random());
    // Shuffle comments for uniqueness per product
    const shuffledComments = allProductUniqueComments.slice().sort(() => 0.5 - Math.random());
    for (let i = 0; i < reviewCount; i++) {
      const firstName = shuffledFirstNames[i % shuffledFirstNames.length];
      const lastName = shuffledLastNames[i % shuffledLastNames.length];
      const name = `${firstName} ${lastName}`;
      const comment = shuffledComments[i % shuffledComments.length];
      const review = {
        productId: product.id,
        productName: product.name,
        name,
        email: randomEmail(name),
        rating: randomInt(4, 5),
        comment,
        timestamp: randomPastDate().toISOString(),
        mediaUrls: []
      };
      await firebase.firestore().collection('reviews').add(review);
      total++;
      if (total % 10 === 0 || total === reviewCount) {
        log(`Added ${total} reviews for ${product.name}`, 'success');
        updateProgress(total, reviewCount);
      }
    }
  }
  setStatus('All reviews migrated!');
  log('All reviews migrated for all products!', 'success');
}; 