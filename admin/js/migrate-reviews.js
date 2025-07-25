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
  // --- NEW LOGIC FOR AIRPODS PRO 2 & AIRPODS MAX COMBO ---
  const comboProductId = 'airpods-pro2-airpodsmax-combo';
  const comboProductName = 'AirPods Pro 2 & AirPods Max Premium Combo';

  const reviewsToAdd = [
    { firstName: "Rohan", lastName: "Mehta", rating: 5, comment: "The sound quality on both the Pro 2 and Max is just mind-blowing. I use the Pro 2 for the gym and the Max for movies at home. Best combo for music lovers!" },
    { firstName: "Aarav", lastName: "Sharma", rating: 5, comment: "Switching between the AirPods Pro 2 and Max is seamless. Both are super comfortable and the noise cancellation is next level. Highly recommended!" },
    { firstName: "Simran", lastName: "Kaur", rating: 5, comment: "I love the versatility of this combo. The Pro 2 are perfect for calls and the Max are a treat for long flights. Both look and feel premium." },
    { firstName: "Vikas", lastName: "Patel", rating: 5, comment: "The Max headphones are so comfortable for long listening sessions. The Pro 2 are my go-to for workouts. Both connect instantly to my iPhone." },
    { firstName: "Priya", lastName: "Deshmukh", rating: 5, comment: "I was blown away by the battery life on both. The Max are perfect for home and the Pro 2 are always in my bag. Worth every rupee!" },
    { firstName: "Kabir", lastName: "Jain", rating: 5, comment: "The combo is a dream for audiophiles. The Max deliver deep bass and the Pro 2 are so light you forget you’re wearing them. Super happy with this purchase." },
    { firstName: "Meera", lastName: "Nair", rating: 5, comment: "I use the Pro 2 for my morning runs and the Max for relaxing at home. Both have amazing sound and block out all noise. Delivery was quick too!" },
    { firstName: "Siddharth", lastName: "Gupta", rating: 5, comment: "The Pro 2 are perfect for calls and the Max are unbeatable for music. Both charge fast and last long. Great value combo!" },
    { firstName: "Aisha", lastName: "Khan", rating: 5, comment: "I gifted this combo to my brother and he’s obsessed! The Max are super comfy and the Pro 2 are perfect for travel. Both look stunning." },
    { firstName: "Yash", lastName: "Joshi", rating: 5, comment: "The best part is the seamless switching between devices. The Max are my favorite for gaming and the Pro 2 for podcasts. Both are top notch." },
    { firstName: "Tanvi", lastName: "Singh", rating: 5, comment: "I use the Max for movies and the Pro 2 for Zoom calls. Both have crystal clear sound and the noise cancellation is amazing. Love this combo!" },
    { firstName: "Dev", lastName: "Reddy", rating: 5, comment: "The Max headphones are a luxury experience. The Pro 2 are so handy for daily commutes. Both are easy to pair and use. Would buy again!" },
    { firstName: "Sneha", lastName: "Kapoor", rating: 5, comment: "I was looking for a premium audio combo and this is it. The Max are perfect for home and the Pro 2 for the office. Both exceeded my expectations." },
    { firstName: "Arjun", lastName: "Bose", rating: 5, comment: "The Pro 2 fit perfectly and the Max are super soft on the ears. Both have great battery life and sound quality. Fast shipping too!" },
    { firstName: "Riya", lastName: "Chopra", rating: 5, comment: "I use the Max for music production and the Pro 2 for calls. Both are reliable and the build quality is excellent. Highly recommend this combo!" },
    { firstName: "Kunal", lastName: "Saxena", rating: 5, comment: "The Max headphones are a game changer for movies. The Pro 2 are my daily drivers for calls and music. Both are super easy to use." },
    { firstName: "Maya", lastName: "Iyer", rating: 5, comment: "I love how both devices sync with my Apple Watch and iPhone. The Max are perfect for home and the Pro 2 for the gym. Great combo deal!" },
    { firstName: "Rahul", lastName: "Pandey", rating: 5, comment: "The Pro 2 are so light and the Max are so immersive. Both have amazing sound and the noise cancellation is the best I’ve tried." },
    { firstName: "Ananya", lastName: "Menon", rating: 5, comment: "I use the Max for audiobooks and the Pro 2 for music. Both are super comfortable and the battery lasts all day. Very happy with this purchase." },
    { firstName: "Gaurav", lastName: "Tripathi", rating: 5, comment: "The Max are perfect for home office and the Pro 2 for travel. Both connect instantly and the sound is fantastic. Would recommend to everyone!" },
    { firstName: "Ishaan", lastName: "Bhatt", rating: 5, comment: "The Pro 2 are my favorite for workouts and the Max for movies. Both are easy to use and the sound is crystal clear. Great combo!" },
    { firstName: "Pooja", lastName: "Kulkarni", rating: 5, comment: "I was impressed by the packaging and fast delivery. The Max are super comfy and the Pro 2 are perfect for calls. Both are worth the price." },
    { firstName: "Saurabh", lastName: "Patil", rating: 5, comment: "The Max headphones are a treat for music lovers. The Pro 2 are so convenient for daily use. Both have excellent battery life." },
    { firstName: "Neha", lastName: "Ghosh", rating: 5, comment: "I use the Max for editing videos and the Pro 2 for meetings. Both are reliable and the sound is top quality. Highly recommend!" },
    { firstName: "Manav", lastName: "Desai", rating: 5, comment: "The Max are perfect for home and the Pro 2 for travel. Both are easy to pair and the sound is amazing. Great combo for Apple fans!" }
  ];

  log(`Starting to add ${reviewsToAdd.length} reviews for: ${comboProductName}`, 'info');
  setStatus(`Migrating reviews for ${comboProductName}...`);

  let totalAdded = 0;
  const totalToMigrate = reviewsToAdd.length;
  updateProgress(0, totalToMigrate);

  for (const reviewData of reviewsToAdd) {
    const review = {
      productId: comboProductId,
      productName: comboProductName,
      name: `${reviewData.firstName} ${reviewData.lastName}`,
      rating: reviewData.rating,
      comment: reviewData.comment,
      timestamp: randomPastDate().toISOString(),
      mediaUrls: []
    };

    try {
      await firebase.firestore().collection('reviews').add(review);
      totalAdded++;
      log(`Added review #${totalAdded}: ${review.name} - "${review.comment.substring(0, 30)}..."`, 'success');
      updateProgress(totalAdded, totalToMigrate);
    } catch (error) {
      log(`Failed to add review for ${review.name}: ${error.message}`, 'error');
    }
  }

  setStatus('Migration completed!');
  log(`Successfully added ${totalAdded} reviews for ${comboProductName}.`, 'success');
};

window.migrateRatings = async function({log, updateProgress, setStatus}) {
  const comboProductId = 'airpods-pro2-magsafe';
  let totalToAdd = 0;
  const ratingsPerProduct = [];
  for (const product of products) {
    let count;
    if (product.id === comboProductId) {
      count = randomInt(1000, 1500);
    } else {
      count = randomInt(100, 150);
    }
    ratingsPerProduct.push(count);
    totalToAdd += count;
  }
  let added = 0;
  for (let p = 0; p < products.length; p++) {
    const product = products[p];
    const ratingCount = ratingsPerProduct[p];
    log(`Generating ${ratingCount} ratings for ${product.name}...`, 'info');
    setStatus(`Migrating ratings for ${product.name}...`);
    for (let i = 0; i < ratingCount; i++) {
      const rating = randomInt(1, 5);
      await firebase.firestore()
        .collection('reviews')
        .doc('ratings')
        .collection('rating')
        .add({
          productId: product.id,
          rating: rating
        });
      added++;
      if (added % 50 === 0 || added === totalToAdd) {
        updateProgress(added, totalToAdd);
      }
    }
    log(`Added ${ratingCount} ratings for ${product.name}`, 'success');
  }
  setStatus('All ratings migrated!');
  log('All ratings migrated for all products!', 'success');
};

// Wire up the migrate ratings button
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    const startRatingBtn = document.getElementById('startRatingMigration');
    if (startRatingBtn) {
      startRatingBtn.addEventListener('click', async function() {
        startRatingBtn.disabled = true;
        const progressBar = document.getElementById('progress-bar');
        const progressStatus = document.getElementById('progress-status');
        const logEntries = document.getElementById('log-entries');
        progressBar.style.width = '0%';
        progressStatus.textContent = 'Generating ratings...';
        logEntries.innerHTML = '';
        try {
          await window.migrateRatings({
            log: (msg, type) => {
              const entry = document.createElement('div');
              entry.className = `log-entry log-${type || 'info'}`;
              entry.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
              logEntries.appendChild(entry);
              logEntries.scrollTop = logEntries.scrollHeight;
            },
            updateProgress: (count, total) => {
              const percentage = Math.round((count / total) * 100);
              progressBar.style.width = `${percentage}%`;
              progressBar.setAttribute('aria-valuenow', percentage);
              document.getElementById('progress-text').textContent = `${count} of ${total} ratings migrated (${percentage}%)`;
            },
            setStatus: (msg) => progressStatus.textContent = msg,
          });
          progressStatus.textContent = 'Ratings migration completed!';
          Swal.fire('Migration Completed', 'All ratings have been migrated.', 'success');
        } catch (error) {
          const log = (msg, type) => {
            const entry = document.createElement('div');
            entry.className = `log-entry log-${type || 'error'}`;
            entry.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
            logEntries.appendChild(entry);
            logEntries.scrollTop = logEntries.scrollHeight;
          };
          log(error.message, 'error');
          progressStatus.textContent = 'Ratings migration failed!';
          Swal.fire('Migration Failed', error.message, 'error');
        }
        startRatingBtn.disabled = false;
      });
    }
  });
} 