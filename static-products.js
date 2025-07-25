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
    highlights: [
      "Active Noise Cancellation for immersive listening",
      "Up to 24 hours of battery with charging case",
      "Quick pairing with Apple devices"
    ],
    description: "AirPods Gen 4 (ANC) deliver a premium wireless audio experience with advanced noise cancellation and seamless integration with Apple devices. Enjoy crystal-clear calls, all-day comfort, and effortless connectivity wherever you go.",
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
    highlights: [
      "Adaptive Transparency mode",
      "Personalized spatial audio",
      "Sweat and water resistant (IPX4)"
    ],
    description: "The AirPods Pro 2 are engineered for those who demand the best in sound and comfort. With adaptive transparency, personalized spatial audio, and a secure fit, these earbuds are perfect for music, calls, and workouts.",
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
    highlights: [
      "LED display on charging case for battery status",
      "Advanced noise cancellation",
      "Ergonomic, lightweight design"
    ],
    description: "Stay updated at a glance with the LED display charging case. AirPods Pro 2 with Display offer powerful noise cancellation and a comfortable fit, making them ideal for travel, work, and everyday use.",
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
    highlights: [
      "Spatial audio with dynamic head tracking",
      "Force sensor controls",
      "Up to 6 hours of listening time"
    ],
    description: "AirPods 3rd Generation bring a new dimension to wireless listening with spatial audio and intuitive controls. Their ergonomic design and long battery life make them a great choice for music lovers on the move.",
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
    highlights: [
      "H1 chip for faster wireless connection",
      "Voice-activated “Hey Siri”",
      "Effortless device switching"
    ],
    description: "Enjoy the simplicity of wireless audio with AirPods 2nd Generation. Featuring the H1 chip and hands-free Siri, these earbuds offer reliable performance and easy switching between your Apple devices.",
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
    highlights: [
      "Intelligent Active Noise Cancellation",
      "Hi-Fi 24-bit audio support",
      "Comfortable, secure fit for all-day wear"
    ],
    description: "Samsung Galaxy Buds 2 Pro deliver high-fidelity sound and intelligent noise cancellation in a compact, comfortable design. Enjoy crystal-clear calls and music, whether at home or on the go.",
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
      "images/Headphone-images/Airpod max/5.webp"
    ],
    price: "₹1,799",
    highlights: [
      "High-fidelity audio with custom drivers",
      "Active Noise Cancellation and Transparency mode",
      "Memory foam ear cushions for comfort"
    ],
    description: "AirPods Max combine premium materials with advanced audio technology for an unmatched listening experience. Enjoy immersive sound, powerful noise cancellation, and luxurious comfort.",
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
      "images/Accessories-images/adapter/5.webp"
    ],
    price: "₹799",
    highlights: [
      "Fast charging for iPhone, iPad, and AirPods",
      "Compact and travel-friendly",
      "Universal USB-C compatibility"
    ],
    description: "Charge your devices quickly and efficiently with the Apple 20W USB-C Power Adapter. Its compact size and universal compatibility make it ideal for home, office, or travel.",
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
      "images/Accessories-images/C to C cable/4.webp"
    ],
    price: "₹450",
    highlights: [
      "Supports fast charging and data transfer",
      "Durable and tangle-free design",
      "Compatible with USB-C devices"
    ],
    description: "The Apple Type C to C Cable ensures fast charging and reliable data transfer for all your USB-C devices. Built to last, it's perfect for everyday use.",
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
      "images/Accessories-images/C to lightining Cable/4.webp"
    ],
    price: "₹450",
    highlights: [
      "Fast charging for iPhone and iPad",
      "MFi certified for safety",
      "Durable and flexible"
    ],
    description: "Charge and sync your Apple devices with the Type C to Lightning Cable. Enjoy fast, safe charging and reliable performance every time.",
    category: "accessories"
  },
  "magsafe": {
    id: "magsafe",
    brand: "Apple",
    name: "Apple MagSafe Battery Pack 10000 Mah",
    image: "images/apple-magsafe.jpg",
    images: [
      "images/Accessories-images/Magsafe/1.webp",
      "images/Accessories-images/Magsafe/2.webp",
      "images/Accessories-images/Magsafe/3.webp",
      "images/Accessories-images/Magsafe/4.webp",
      "images/Accessories-images/Magsafe/5.webp"
    ],
    price: "₹1199",
    highlights: [
      "10000mAh capacity for extended use",
      "MagSafe wireless charging compatibility",
      "Compact and portable design"
    ],
    description: "The Apple MagSafe Battery Pack offers convenient wireless charging for your iPhone. Its compact design and reliable power make it the perfect companion for travel and daily use.",
    category: "accessories"
  },
  "airpods-pro2-magsafe": {
    id: "airpods-pro2-magsafe",
    brand: "Apple",
    name: "Airpods Pro 2 & MagSafe Battery Pack 5000mah",
    image: "images/airpods+magsafe.jpg",
    images: [
      "images/Offer-images/airpods-&-magsafe/1.webp",
      "video/6.mp4",
      "images/Offer-images/airpods-&-magsafe/2.webp",
      "images/Offer-images/airpods-&-magsafe/3.webp",
      "images/Offer-images/airpods-&-magsafe/4.webp",
      "images/Offer-images/airpods-&-magsafe/5.webp",
      "images/Offer-images/airpods-&-magsafe/6.webp",
      "images/Offer-images/airpods-&-magsafe/7.webp",
      "images/Offer-images/airpods-&-magsafe/8.webp"
    ],
    price: "₹1,499",
    highlights: [
      "Includes AirPods Pro 2 and MagSafe Battery Pack",
      "Seamless wireless charging on the go",
      "Perfect for travel and busy lifestyles"
    ],
    description: "This combo brings together the immersive sound of AirPods Pro 2 and the convenience of MagSafe wireless charging. Stay powered and entertained wherever you are, with a bundle designed for ultimate mobility.",
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
  "airpods-pro2-watch-s10": {
    id: "airpods-pro2-watch-s10",
    brand: "Apple",
    name: "AirPods Pro 2 & Apple Watch Series 10 Combo",
    image: "images/airpods+watch.jpg",
    images: [
      "images/Offer-images/airpods+watch/1.png",
      "images/Offer-images/airpods+watch/2.png",
      "images/Offer-images/airpods+watch/3.png",
      "images/Offer-images/airpods+watch/4.jpg",
      "images/Offer-images/airpods+watch/5.jpg",
      "images/Offer-images/airpods+watch/6.jpg",
      "images/Offer-images/airpods+watch/7.jpg",
      "images/Offer-images/airpods+watch/8.jpg",
      "images/Offer-images/airpods+watch/9.jpg",
      "images/Offer-images/airpods+watch/11.jpg",
    ],
    price: "₹1,999",
    highlights: [
      "Ultimate tech bundle: AirPods Pro 2 and Apple Watch Series 10.",
      "Immersive audio with next-gen Active Noise Cancellation.",
      "Advanced health tracking and always-on display on your wrist.",
      "Seamless connectivity for a premium ecosystem experience."
    ],
    description: "Upgrade your tech game with the ultimate Apple ecosystem bundle. This combo includes the top-of-the-line AirPods Pro 2 for unparalleled sound quality and the new Apple Watch Series 10 to keep you connected and on top of your health goals. Perfect for professionals, fitness enthusiasts, and anyone who demands the best in performance and style.",
    category: "combo-offers"
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
    price: "₹1,499",
    description: "Elevate your style and functionality with the Apple Watch Series 9 Gold, bundled with a premium set of straps. Track your health, stay connected, and match your look for any occasion with this exclusive combo offer.",
    category: "smartwatches"
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
    category: "smartwatches"
  },
  "airpods-pro2-airpodsmax-combo": {
    id: "airpods-pro2-airpodsmax-combo",
    brand: "Apple",
    name: "AirPods Pro 2 & AirPods Max Premium Combo",
    image: "images/airpods-max+airpods.png",
    images: [
      "images/Offer-images/airpods-max+airpods/1.png",
      "images/Offer-images/airpods-max+airpods/2.png",
      "images/Offer-images/airpods-max+airpods/3.png",
      "images/Offer-images/airpods-max+airpods/4.jpg",
      "images/Offer-images/airpods-max+airpods/5.png",
      "images/Offer-images/airpods-max+airpods/6.jpg",
      "images/Offer-images/airpods-max+airpods/7.png",
      "images/Offer-images/airpods-max+airpods/8.jpg",
      "images/Offer-images/airpods-max+airpods/9.jpg",
      "images/Offer-images/airpods-max+airpods/10.jpg",
    ],
    price: "₹1,999",
    highlights: [
      "Experience the best of both worlds: in-ear and over-ear premium sound.",
      "AirPods Pro 2 for active noise cancellation and all-day comfort.",
      "AirPods Max for immersive, high-fidelity audio at home or on the go.",
      "Seamless Apple ecosystem integration for effortless switching."
    ],
    description: "Unlock the ultimate audio experience with this exclusive Apple combo. Enjoy the portability and advanced features of AirPods Pro 2, paired with the luxurious sound and comfort of AirPods Max. Whether you’re working out, traveling, or relaxing at home, this bundle delivers unmatched versatility and performance for true music lovers.",
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
