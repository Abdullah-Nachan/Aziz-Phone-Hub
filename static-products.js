/**
 * Product data store
 * Contains all product information from Firestore database
 * Structured for use with dynamic product.html and category.html pages
 */

// Initialize empty products object
if (!window.products) window.products = {
  "airpods01": {
    id: "airpods01",
    brand: "Apple",
    name: "AirPods Gen 4 (ANC)",
    image: "images/airpods4.jpg",
    images: [
      "images/airpods-images/airpods_gen4/1.webp",
      "images/airpods-images/airpods_gen4/2.webp",
      "images/airpods-images/airpods_gen4/3.webp",
      "images/airpods-images/airpods_gen4/4.webp",
      "images/airpods-images/airpods_gen4/5.webp",
      "images/airpods-images/airpods_gen4/6.webp",
      "images/airpods-images/airpods_gen4/7.webp"
    ],
    price: "₹1,799",
    description: "The latest AirPods with Active Noise Cancellation for immersive sound experience.",
    category: "airpods"
  },
  "airpods-pro-2": {
    id: "airpods-pro-2",
    brand: "Apple",
    name: "AirPods Pro 2",
    image: "images/airpods2pro.jpg",
    images: [
      "images/airpods-images/aripods_pro2/1.webp",
      "images/airpods-images/aripods_pro2/2.webp",
      "images/airpods-images/aripods_pro2/3.webp",
      "images/airpods-images/aripods_pro2/4.webp",
      "images/airpods-images/aripods_pro2/5.webp",
      "images/airpods-images/aripods_pro2/6.webp",
      "images/airpods-images/aripods_pro2/7.webp"
    ],
    price: "₹999",
    description: "Premium wireless earbuds with active noise cancellation and transparency mode.",
    category: "airpods"
  },
  "airpods-pro-2-display": {
    id: "airpods-pro-2-display",
    name: "AirPods Pro 2 with Display",
    image: "images/airpods-2pro-display.jpg",
    images: [
      "images/airpods-images/airpods_display/1.webp",
      "images/airpods-images/airpods_display/2.webp",
      "images/airpods-images/airpods_display/3.webp",
      "images/airpods-images/airpods_display/4.webp",
      "images/airpods-images/airpods_display/5.webp",
      "images/airpods-images/airpods_display/6.webp",
      "images/airpods-images/airpods_display/7.webp"
    ],
    price: "₹1,499",
    description: "AirPods Pro 2 with LED display on the charging case to show battery status and notifications.",
    category: "airpods"
  },
  "airpods-3": {
    id: "airpods-3",
    name: "AirPods 3rd Generation",
    image: "images/airpods-gen3.jpg",
    images: [
      "images/airpods-images/airpods_3buds/1.webp",
      "images/airpods-images/airpods_3buds/2.webp",
      "images/airpods-images/airpods_3buds/3.webp",
      "images/airpods-images/airpods_3buds/4.webp",
      "images/airpods-images/airpods_3buds/5.webp",
      "images/airpods-images/airpods_3buds/6.webp",
      "images/airpods-images/airpods_3buds/7.webp"
    ],
    price: "₹949",
    description: "Third-generation AirPods with spatial audio and adaptive EQ for an immersive listening experience.",
    category: "airpods"
  },
  "airpods-2": {
    id: "airpods-2",
    name: "AirPods 2nd Generation",
    image: "images/airpods-gen2.jpg",
    images: [
      "images/airpods-images/airpods_2buds/1.webp",
      "images/airpods-images/airpods_2buds/2.webp",
      "images/airpods-images/airpods_2buds/3.webp",
      "images/airpods-images/airpods_2buds/4.webp",
      "images/airpods-images/airpods_2buds/5.webp",
      "images/airpods-images/airpods_2buds/6.webp"
    ],
    price: "₹949",
    description: "Second-generation AirPods with H1 chip for faster wireless connection and 'Hey Siri' support.",
    category: "airpods"
  },
  "galaxy-buds-2-pro": {
    id: "galaxy-buds-2-pro",
    brand: "Samsung",
    name: "Samsung Galaxy Buds 2 Pro",
    image: "images/galaxy-buds2-pro.jpg",
    images: [
      "images/airpods-images/galaxy_buds2_pro/1.webp",
      "images/airpods-images/galaxy_buds2_pro/2.webp",
      "images/airpods-images/galaxy_buds2_pro/3.webp",
      "images/airpods-images/galaxy_buds2_pro/4.webp",
      "images/airpods-images/galaxy_buds2_pro/5.webp",
      "images/airpods-images/galaxy_buds2_pro/6.webp",
      "images/airpods-images/galaxy_buds2_pro/7.webp"
    ],
    price: "₹999",
    description: "Samsung's premium wireless earbuds with intelligent ANC and high-quality sound.",
    category: "airpods"
  },
  "airpods-max": {
    id: "airpods-max",
    brand: "Apple",
    name: "AirPods Max",
    image: "images/airpods-max.jpg",
    images: [
      "images/Headphone-images/Airpod max/1.webp",
      "images/Headphone-images/Airpod max/2.webp",
      "images/Headphone-images/Airpod max/3.webp",
      "images/Headphone-images/Airpod max/4.webp",
      "images/Headphone-images/Airpod max/5.webp",
    ],
    price: "₹1,799",
    description: "Over-ear headphones with high-fidelity audio, active noise cancellation, and spatial audio.",
    category: "headphones"
  },
  "bose-qc-ultra": {
    id: "bose-qc-ultra",
    brand: "Bose",
    name: "Bose QC Ultra",
    image: "images/bose-qc-ultra.jpg",
    images: [
      "images/Headphone-images/Bose qc/1.webp",
      "images/Headphone-images/Bose qc/2.webp",
      "images/Headphone-images/Bose qc/3.webp",
      "images/Headphone-images/Bose qc/4.webp",
      "images/Headphone-images/Bose qc/5.webp",
      "images/Headphone-images/Bose qc/6.webp",
      "images/Headphone-images/Bose qc/7.webp",
    ],
    price: "₹1,799",
    description: "Premium noise-cancelling headphones with exceptional sound quality and comfort.",
    category: "headphones"
  },
  "samsung-watch-ultra": {
    id: "samsung-watch-ultra",
    brand: "Samsung",
    name: "Samsung Watch Ultra",
    image: "images/samsung-watch-ultra.jpg",
    images: [
      "images/smartwatch-images/samsung-watch-ultra/1.webp",
      "images/smartwatch-images/samsung-watch-ultra/2.webp",
      "images/smartwatch-images/samsung-watch-ultra/3.webp",
      "images/smartwatch-images/samsung-watch-ultra/4.webp",
      "images/smartwatch-images/samsung-watch-ultra/5.webp",
      "images/smartwatch-images/samsung-watch-ultra/6.webp",
    ],
    price: "₹1,499",
    description: "Premium smartwatch with advanced health monitoring and fitness tracking features.",
    category: "smartwatches"
  },
  "active-2-smartwatch": {
    id: "active-2-smartwatch",
    brand: "Samsung",
    name: "Active 2 Smartwatch",
    image: "images/active2-smartwatch.jpg",
    images: [
      "images/smartwatch-images/active2/1.webp",
      "images/smartwatch-images/active2/2.webp",
      "images/smartwatch-images/active2/3.webp",
      "images/smartwatch-images/active2/4.webp",
      "images/smartwatch-images/active2/5.webp",
      "images/smartwatch-images/active2/6.webp",
    ],
    price: "₹1,499",
    description: "Fitness-focused smartwatch with heart rate monitoring and activity tracking.",
    category: "smartwatches"
  },
  "gen-9-pro": {
    id: "gen-9-pro",
    brand: "Generic",
    name: "Gen 9 Pro Bluetooth Calling Smartwatch",
    image: "images/gen9-pro-smartwatch.jpg",
    images: [
      "images/smartwatch-images/gen-9pro/1.webp",
      "images/smartwatch-images/gen-9pro/2.webp",
      "images/smartwatch-images/gen-9pro/3.webp",
      "images/smartwatch-images/gen-9pro/4.webp",
      "images/smartwatch-images/gen-9pro/5.webp",
      "images/smartwatch-images/gen-9pro/6.webp",
    ],
    price: "₹1,450",
    description: "Feature-rich smartwatch with Bluetooth calling and health monitoring capabilities.",
    category: "smartwatches"
  },
  "t10-ultra": {
    id: "t10-ultra",
    brand: "Generic",
    name: "T10 Ultra Bluetooth Smartwatch",
    image: "images/t10-ultra-smartwatch.jpg",
    images: [
      "images/smartwatch-images/T10 Ultra/1.webp",
      "images/smartwatch-images/T10 Ultra/2.webp",
      "images/smartwatch-images/T10 Ultra/3.webp",
      "images/smartwatch-images/T10 Ultra/4.webp",
      "images/smartwatch-images/T10 Ultra/5.webp",
      "images/smartwatch-images/T10 Ultra/6.webp",
      "images/smartwatch-images/T10 Ultra/7.webp",
      "images/smartwatch-images/T10 Ultra/8.webp",
    ],
    price: "₹649",
    description: "Affordable smartwatch with essential features and long battery life.",
    category: "smartwatches"
  },
  "z86-pro-max": {
    id: "z86-pro-max",
    brand: "Generic",
    name: "Z86 Pro Max Smartwatch",
    image: "images/z86-pro-max-smartwatch.jpg",
    images: [
      "images/smartwatch-images/Z86 pro max/1.webp",
      "images/smartwatch-images/Z86 pro max/2.webp",
      "images/smartwatch-images/Z86 pro max/3.webp",
      "images/smartwatch-images/Z86 pro max/4.webp",
      "images/smartwatch-images/Z86 pro max/5.webp",
      "images/smartwatch-images/Z86 pro max/6.webp",
      "images/smartwatch-images/Z86 pro max/7.webp",
    ],
    price: "₹1,599",
    description: "Advanced smartwatch with large display and comprehensive health tracking features.",
    category: "smartwatches"
  },
  "apple-watch-series-10": {
    id: "apple-watch-series-10",
    brand: "Apple",
    name: "Apple Watch Series 10",
    image: "images/apple-series10.jpg",
    images: [
      "images/smartwatch-images/series 10/1.webp",
      "images/smartwatch-images/series 10/2.webp",
      "images/smartwatch-images/series 10/3.webp",
      "images/smartwatch-images/series 10/4.webp",
      "images/smartwatch-images/series 10/5.webp",
      "images/smartwatch-images/series 10/6.webp",
      "images/smartwatch-images/series 10/7.webp",
    ],
    price: "₹1,799",
    description: "The latest Apple Watch with advanced health monitoring and fitness tracking features.",
    category: "smartwatches"
  },
  "hk9-ultra": {
    id: "hk9-ultra",
    brand: "HK9",
    name: "HK9 Ultra Smartwatch",
    image: "images/hk9-ultra-smartwatch.jpg",
    images: [
      "images/smartwatch-images/Hk9-ultra/1.webp",
      "images/smartwatch-images/Hk9-ultra/2.webp",
      "images/smartwatch-images/Hk9-ultra/3.webp",
      "images/smartwatch-images/Hk9-ultra/4.webp",
      "images/smartwatch-images/Hk9-ultra/5.webp",
      "images/smartwatch-images/Hk9-ultra/6.webp",
      "images/smartwatch-images/Hk9-ultra/7.webp",
    ],
    price: "₹1,899",
    description: "Premium smartwatch with ultra-bright display and health monitoring features.",
    category: "smartwatches"
  },
  "s9-pro-max": {
    id: "s9-pro-max",
    brand: "Generic",
    name: "S9 Pro Max Smartwatch",
    image: "images/s9-pro-max-smartwatch.jpg",
    images: [
      "images/smartwatch-images/S9 pro max/1.webp",
      "images/smartwatch-images/S9 pro max/2.webp",
      "images/smartwatch-images/S9 pro max/3.webp",
      "images/smartwatch-images/S9 pro max/4.webp",
      "images/smartwatch-images/S9 pro max/5.webp",
      "images/smartwatch-images/S9 pro max/6.webp",
      "images/smartwatch-images/S9 pro max/7.webp",
    ],
    price: "₹1,799",
    description: "Feature-rich smartwatch with large display and comprehensive health tracking.",
    category: "smartwatches"
  },
  "x90-max": {
    id: "x90-max",
    brand: "Generic",
    name: "X90 Max Smartwatch",
    image: "images/x90-max-smartwatch.jpg",
    images: [
      "images/smartwatch-images/Z86 pro max/1.webp",
      "images/smartwatch-images/Z86 pro max/2.webp",
      "images/smartwatch-images/Z86 pro max/3.webp",
      "images/smartwatch-images/Z86 pro max/4.webp",
      "images/smartwatch-images/Z86 pro max/5.webp",
      "images/smartwatch-images/Z86 pro max/6.webp",
      "images/smartwatch-images/Z86 pro max/7.webp",
    ],
    price: "₹1,299",
    description: "Advanced smartwatch with comprehensive health monitoring features.",
    category: "smartwatches"
  },
  "nike-vomero-black": {
    id: "nike-vomero-black",
    brand: "Nike",
    name: "Nike Zoom Vomero Triple Black",
    image: "images/nike-zoom-vomero-triple-black.jpg",
    images: [
      "images/shoes-images/nike-zoom-vomero-triple-black/1.jpg",
      "images/shoes-images/nike-zoom-vomero-triple-black/2.jpg",
      "images/shoes-images/nike-zoom-vomero-triple-black/3.jpg",
      "images/shoes-images/nike-zoom-vomero-triple-black/4.jpg",
      "images/shoes-images/nike-zoom-vomero-triple-black/5.jpg",
      "images/shoes-images/nike-zoom-vomero-triple-black/6.jpg",
      "images/shoes-images/nike-zoom-vomero-triple-black/7.jpg",
      "images/shoes-images/nike-zoom-vomero-triple-black/8.jpg",
    ],
    price: "₹2,999",
    description: "Premium running shoes with responsive cushioning and sleek all-black design.",
    category: "shoes"
  },
  "nike-vomero-white": {
    id: "nike-vomero-white",
    brand: "Nike",
    name: "Nike Zoom Vomero White-Black",
    image: "images/nike-zoom-vomero-white-black.jpg",
    images: [
      "images/shoes-images/nike-zoom-vomero-white-black/1.jpg",
      "images/shoes-images/nike-zoom-vomero-white-black/2.jpg",
      "images/shoes-images/nike-zoom-vomero-white-black/3.jpg",
      "images/shoes-images/nike-zoom-vomero-white-black/4.jpg",
    ],
    price: "₹2,999",
    description: "Stylish running shoes with responsive cushioning in a classic white and black colorway.",
    category: "shoes"
  },
  "puma-suede-crush": {
    id: "puma-suede-crush",
    brand: "Puma",
    name: "Puma XL Suede Crush Black White",
    image: "images/puma-suede-crush.jpg",
    images: [
      "images/shoes-images/puma-suede-crush/1.jpg",
      "images/shoes-images/puma-suede-crush/2.jpg",
      "images/shoes-images/puma-suede-crush/3.jpg",
      "images/shoes-images/puma-suede-crush/4.jpg",
      "images/shoes-images/puma-suede-crush/5.jpg",
    ],
    price: "₹2,599",
    description: "Classic Puma suede sneakers with a platform sole and timeless black and white design.",
    category: "shoes"
  },
  "nike-airmax": {
    id: "nike-airmax",
    brand: "Nike",
    name: "Nike Air Max 90",
    image: "images/nike-air-max.jpg",
    images: [
      "images/shoes-images/nike-air-max90/1.jpg",
      "images/shoes-images/nike-air-max90/2.jpg",
      "images/shoes-images/nike-air-max90/3.jpg",
      "images/shoes-images/nike-air-max90/4.jpg",
    ],
    price: "₹2,999",
    description: "Classic Nike Air Max 90 sneakers with comfortable cushioning and stylish design.",
    category: "shoes"
  },
  "nike-dunk-unc": {
    id: "nike-dunk-unc",
    brand: "Nike",
    name: "Nike Dunk Low UNC",
    image: "images/nike-dunk-low.jpg",
    images: [
      "images/shoes-images/nike-dunk-low-UNC/1.jpg",
      "images/shoes-images/nike-dunk-low-UNC/2.jpg",
      "images/shoes-images/nike-dunk-low-UNC/3.jpg",
      "images/shoes-images/nike-dunk-low-UNC/4.mp4",
    ],
    price: "₹2,999",
    description: "Nike Dunk Low in University Blue colorway, a classic basketball-inspired sneaker.",
    category: "shoes"
  },
  "boss-hugo": {
    id: "boss-hugo",
    brand: "Boss",
    name: "Boss Hugo",
    image: "images/boss-hugo.jpg",
    images: [
      "images/watch-images/boss-hugo/1.jpg",
      "images/watch-images/boss-hugo/3.jpg",
    ],
    price: "₹1,799",
    description: "Elegant Boss Hugo watch with premium materials and sophisticated design.",
    category: "casualwatch"
  },
  "cartier-roman": {
    id: "cartier-roman",
    brand: "Cartier",
    name: "Cartier Roman Dial",
    image: "images/cartier-roman-dial.jpg",
    images: [
      "images/watch-images/cartier-roman-dial/1.jpg",
      "images/watch-images/cartier-roman-dial/2.jpg",
      "images/watch-images/cartier-roman-dial/3.jpg",
    ],
    price: "₹1,799",
    description: "Luxurious Cartier watch with classic Roman numeral dial and timeless design.",
    category: "casualwatch"
  },
  "gshock-manga": {
    id: "gshock-manga",
    brand: "G-Shock",
    name: "G-Shock Manga Edition",
    image: "images/gshock-manga.jpg",
    images: [
      "images/watch-images/g-shock-manga/1.jpg",
      "images/watch-images/g-shock-manga/2.jpg",
      "images/watch-images/g-shock-manga/3.jpg",
      "images/watch-images/g-shock-manga/4.jpg",
      "images/watch-images/g-shock-manga/5.jpg",
    ],
    price: "₹1,799",
    description: "Limited edition G-Shock watch with manga-inspired design and rugged durability.",
    category: "casualwatch"
  },
  "omega-seamaster": {
    id: "omega-seamaster",
    brand: "Omega",
    name: "Omega Seamaster",
    image: "images/omega-seamaster.jpg",
    images: [
      "images/watch-images/omega-seamaster/1.jpg",
      "images/watch-images/omega-seamaster/2.jpg",
      "images/watch-images/omega-seamaster/3.jpg",
      "images/watch-images/omega-seamaster/4.jpg",
      "images/watch-images/omega-seamaster/5.jpg",
    ],
    price: "₹1,799",
    description: "Iconic Omega Seamaster watch with professional diving features and elegant styling.",
    category: "casualwatch"
  },
  "tissot-trace": {
    id: "tissot-trace",
    name: "Tissot T-race Chronograph",
    image: "images/tissot-trace.jpg",
    images: [
      "images/watch-images/tissot-t-race/1.jpg",
      "images/watch-images/tissot-t-race/2.jpg",
      "images/watch-images/tissot-t-race/3.jpg",
    ],
    price: "₹1,599",
    description: "Sports-inspired Tissot chronograph watch with racing design elements.",
    category: "casualwatch"
  },
  "crocs-literide-360": {
    id: "crocs-literide-360",
    name: "Crocs LiteRide 360",
    image: "images/crocs-literide-360.jpg",
    images: [
      "images/crocs-images/literide-360/1.png",
      "images/crocs-images/literide-360/2.png",
      "images/crocs-images/literide-360/3.png",
      "images/crocs-images/literide-360/4.png",
      "images/crocs-images/literide-360/5.png",
      "images/crocs-images/literide-360/6.png",
    ],
    price: "₹1,899",
    description: "Comfortable and lightweight Crocs LiteRide 360 with responsive cushioning.",
    category: "crocs"
  },
  "bayband": {
    id: "bayband",
    name: "Crocs Bayaband Clog",
    image: "images/crocs-bayband.jpg",
    images: [
      "images/crocs-images/bayband-clog/1.png",
      "images/crocs-images/bayband-clog/2.png",
      "images/crocs-images/bayband-clog/3.png",
      "images/crocs-images/bayband-clog/4.png",
      "images/crocs-images/bayband-clog/5.png",
    ],
    price: "₹1,899",
    description: "Classic Crocs Bayaband Clog with sporty stripe and unmatched comfort.",
    category: "crocs"
  },
  "bayband-flip": {
    id: "bayband-flip",
    name: "Crocs Bayaband Flip",
    image: "images/crocs-bayband-flip.jpg",
    images: [
      "images/crocs-images/bayaband-flip/1.png",
      "images/crocs-images/bayaband-flip/2.png",
      "images/crocs-images/bayaband-flip/3.png",
      "images/crocs-images/bayaband-flip/4.png",
      "images/crocs-images/bayaband-flip/5.png",
      "images/crocs-images/bayaband-flip/6.png",
    ],
    price: "₹1,899",
    description: "Comfortable flip-flop style Crocs with the signature Bayaband design.",
    category: "crocs"
  },
  "yukon": {
    id: "yukon",
    name: "Crocs Yukon",
    image: "images/crocs-yukon.jpg",
    images: [
      "images/crocs-images/yukon/1.png",
      "images/crocs-images/yukon/2.png",
      "images/crocs-images/yukon/3.png",
      "images/crocs-images/yukon/4.png",
      "images/crocs-images/yukon/5.png",
      "images/crocs-images/yukon/6.png",
      "images/crocs-images/yukon/7.png",
    ],
    price: "₹1,899",
    description: "Rugged Crocs design with leather upper for a more refined look.",
    category: "crocs"
  },
  "apple-power-adapter": {
    id: "apple-power-adapter",
    brand: "Apple",
    name: "Apple 20W USB-C Power Adapter",
    image: "images/apple-adapter.jpg",
    images: [
      "images/Accessories-images/adapter/1.webp",
      "images/Accessories-images/adapter/2.webp",
      "images/Accessories-images/adapter/3.webp",
      "images/Accessories-images/adapter/4.webp",
      "images/Accessories-images/adapter/5.webp",
    ],
    price: "₹799",
    description: "Fast-charging Apple 20W USB-C power adapter for iPhone, iPad, and AirPods.",
    category: "accessories"
  },
  "type-c-cable": {
    id: "type-c-cable",
    brand: "Apple",
    name: "Apple Type C to C Cable",
    image: "images/c-to-c-cable.jpg",
    images: [
      "images/Accessories-images/C to C cable/1.webp",
      "images/Accessories-images/C to C cable/2.webp",
      "images/Accessories-images/C to C cable/3.webp",
      "images/Accessories-images/C to C cable/4.webp",
    ],
    price: "₹450",
    description: "High-quality USB-C to USB-C cable for fast charging and data transfer.",
    category: "accessories"
  },
  "type-c-lightning-cable": {
    id: "type-c-lightning-cable",
    brand: "Apple",
    name: "Apple Type C to Lightning Cable",
    image: "images/c-to-lightning-cable.jpg",
    images: [
      "images/Accessories-images/C to lightining Cable/1.webp",
      "images/Accessories-images/C to lightining Cable/2.webp",
      "images/Accessories-images/C to lightining Cable/3.webp",
      "images/Accessories-images/C to lightining Cable/4.webp",
    ],
    price: "₹450",
    description: "Original Apple USB-C to Lightning cable for fast charging your iPhone or iPad.",
    category: "accessories"
  },
  "magsafe": {
    id: "magsafe",
    brand: "Apple",
    name: "Apple MagSafe Battery Pack 5000 Mah",
    image: "images/apple-magsafe.jpg",
    images: [
      "images/Accessories-images/Magsafe/1.webp",
      "images/Accessories-images/Magsafe/2.webp",
      "images/Accessories-images/Magsafe/3.webp",
      "images/Accessories-images/Magsafe/4.webp",
      "images/Accessories-images/Magsafe/5.webp",
    ],
    price: "₹799",
    description: "MagSafe Battery Pack for iPhone with 5000mAh capacity for on-the-go charging.",
    category: "accessories"
  },
  "airpods-pro2-magsafe": {
    id: "airpods-pro2-magsafe",
    brand: "Apple",
    name: "Airpods Pro 2 & MagSafe Battery Pack",
    image: "images/airpods+magsafe.jpg",
    images: [
      "images/Offer-images/airpods-&-magsafe/1.webp",
      "images/Offer-images/airpods-&-magsafe/2.webp",
      "images/Offer-images/airpods-&-magsafe/3.webp",
      "images/Offer-images/airpods-&-magsafe/4.webp",
      "images/Offer-images/airpods-&-magsafe/5.webp",
      "images/Offer-images/airpods-&-magsafe/6.webp",
      "images/Offer-images/airpods-&-magsafe/7.webp",
      "images/Offer-images/airpods-&-magsafe/8.webp",
    ],
    price: "₹1,499",
    description: "Unlock the ultimate convenience with our AirPods Pro 2 & MagSafe Battery Pack combo. Enjoy immersive sound quality, active noise cancellation, and seamless wireless charging wherever you go. Perfect for music lovers and those who need power on the move.",
    category: "combo-offers",
    detailedDescription: {
      sections: [
        { type: 'text', content: 'Experience the pinnacle of wireless audio technology with our AirPods Pro (2nd generation) wireless earbuds. Designed to provide an extraordinary listening experience, these earbuds offer the same features, packaging, and design as the leading brand, but at a fraction of the cost.' },
        { type: 'image', src: 'images/Offer-images/airpods-&-magsafe/desc-1.webp' },
        { type: 'text', content: 'Immerse yourself in exceptional sound quality and crystal-clear audio with our premium wireless earbuds. Whether you\'re a music enthusiast, podcast lover, or simply seeking an enhanced audio experience, our earbuds deliver unparalleled performance.' },
        { type: 'image', src: 'images/Offer-images/airpods-&-magsafe/desc-2.webp' },
        { type: 'text', content: '<b>Key Features:</b><br>1. Superior Sound Quality: Enjoy immersive sound with dynamic range and rich bass response, bringing your favorite music and media to life.<br><br> 2. Seamless Connectivity: Effortlessly connect to your device via Bluetooth, ensuring a stable and hassle-free wireless experience.<br><br>3. Sleek Design and Comfort: Designed for both style and comfort, our earbuds boast a sleek and ergonomic design that fits snugly in your ears for extended listening sessions.<br><br>4. Long Battery Life: Enjoy hours of uninterrupted listening with our long-lasting battery, ensuring you never miss a beat.' },
        { type: 'image', src: 'images/Offer-images/airpods-&-magsafe/desc-3.webp' },
        { type: 'text', content: 'Our wireless earbuds come in the same high-quality box and packaging as the leading brand, giving you a premium unboxing experience.<br><br>Priced at an incredible ₹1,499, our AirPods Pro (2nd generation) wireless earbuds offer unmatched value for money. Say goodbye to overpriced alternatives and experience the same technology, performance, and style without straining your budget.' },
        { type: 'image', src: 'images/Offer-images/airpods-&-magsafe/desc-4.png' },
        { type: 'text', content: 'Upgrade your audio game with our AirPods Pro (2nd generation) wireless earbuds and embrace the freedom of wireless sound. Order now and immerse yourself in a world of exceptional audio experiences.<br><br>Powerbank is wireless and magsafe which works well with iPhones. It charges upto 35% as it is wireless and can be used while using phone hassle free.<br><br><b>Note:</b> If it is defective on arrival you can complain on azizsphonehub@gmail.com with an unboxing video and not charging video. (Only this complaints will be taken care of)' },
      ]
    }
  },
  "series9-gold-with-straps": {
    id: "series9-gold-with-straps",
    brand: "Apple",
    name: "Apple Watch Series 9 Gold with Straps",
    image: "images/series9gold.jpg",
    images: [
      "images/Offer-images/series9-pro-gold/1.webp",
      "images/Offer-images/series9-pro-gold/2.webp",
      "images/Offer-images/series9-pro-gold/3.webp",
      "images/Offer-images/series9-pro-gold/4.webp",
      "images/Offer-images/series9-pro-gold/5.webp",
      "images/Offer-images/series9-pro-gold/6.webp",
      "images/Offer-images/series9-pro-gold/7.webp",
    ],
    price: "₹1,699",
    description: "Elevate your style and functionality with the Apple Watch Series 9 Gold, bundled with a premium set of straps. Track your health, stay connected, and match your look for any occasion with this exclusive combo offer.",
    category: "combo-offers"
  },
  "7in1-apple-ultra-smartwatch": {
    id: "7in1-apple-ultra-smartwatch",
    brand: "Apple",
    name: "Apple Ultra Smartwatch with 7 straps",
    image: "images/7in1ultra.jpg",
    images: [
      "images/Offer-images/7in1-ultra-smartwatch/1.webp",
      "images/Offer-images/7in1-ultra-smartwatch/2.webp",
      "images/Offer-images/7in1-ultra-smartwatch/3.webp",
      "images/Offer-images/7in1-ultra-smartwatch/4.webp",
      "images/Offer-images/7in1-ultra-smartwatch/5.webp",
      "images/Offer-images/7in1-ultra-smartwatch/6.webp",
      
    ],
    price: "₹999",
    description: "Experience versatility and innovation with the Apple Ultra Smartwatch 7-in-1 combo. Includes a feature-rich smartwatch and 7 interchangeable straps for every mood and activity. The perfect bundle for fitness enthusiasts and trendsetters.",
    category: "combo-offers"
  },
};

/**
 * Get all products as an array
 * @returns {Array} Array of all product objects
 */
function getAllProducts() {
  return Object.values(window.products || {});
}

/**
 * Get products filtered by category
 * @param {string} category - Category name to filter by
 * @returns {Array} Array of product objects in the specified category
 */
function getProductsByCategory(category) {
  return Object.values(window.products || {}).filter(product => product.category === category);
}

/**
 * Get a product by its ID
 * @param {string} id - Product ID to look up
 * @returns {Object|null} Product object or null if not found
 */
function getProductById(id) {
  return (window.products || {})[id] || null;
}

/**
 * Get a list of all available categories
 * @returns {Array} Array of unique category names
 */
function getAllCategories() {
  const categories = new Set(Object.values(window.products || {}).map(product => product.category));
  return Array.from(categories);
}
