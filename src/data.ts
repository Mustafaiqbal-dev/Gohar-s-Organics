import { Product, Review } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'hydra-glow-serum',
    name: 'Hydra-Glow Serum',
    tagline: 'Hyaluronic Acid & Niacinamide ✨ 50% Off First Order',
    description: "Formulated with Kojic Acid, Hyaluronic Acid, and Niacinamide, Gohar's Organics Hydra-Glow Serum is a powerful skin-brightening and hydrating elixir designed to fade dark spots, diminish hyperpigmentation, and lock in deep moisture for a plump, glowing complexion.",
    category: 'serum',
    price: 1850,
    originalPrice: 3700,
    image: '/src/assets/images/Hydra-glow-Serum.jpeg',
    rating: 4.9,
    reviewsCount: 148,
    isFeatured: true,
    skinType: 'All Skin Types',
    concern: 'Dullness & Dark Spots',
    details: [
      'Brightens and evens out skin tone',
      'Reduces hyperpigmentation and dark acne spots',
      'Locks in moisture for a plump, bouncy texture',
      'Dermatologist-tested, organic, and cruelty-free',
      'Soothes irritated skin and improves skin barrier'
    ],
    usage: 'Apply 3-4 drops of Hydra-Glow Serum onto a clean, damp face. Gently pat in using upward, circular motions. Follow with your favorite moisturizer. Use morning and night for ultimate glow.',
    ingredients: 'Active Niacinamide (5%), Hyaluronic Acid (2%), Kojic Acid (1.5%), Organic Aloe Vera Leaf Extract, Rose Hydrosol, Natural Glycerin, Provitamin B5.',
    stock: 24,
    badge: 'Best Seller'
  },
  {
    id: 'acne-soap',
    name: 'Acne Clarifying Soap',
    tagline: 'Deep Purifying with Neem & Tea Tree 🌿',
    description: "An artisanal cold-processed soap crafted with organic neem leaves and active tea tree essential oil. Specifically engineered to deeply cleanse clogged pores, balance excess oil production, and eliminate acne-causing bacteria without stripping natural moisture.",
    category: 'soap',
    price: 850,
    originalPrice: 1200,
    image: '/src/assets/images/Acne-Soap-2.jpeg',
    rating: 4.8,
    reviewsCount: 94,
    isFeatured: true,
    skinType: 'Oily & Acne-Prone',
    concern: 'Acne & Active Breakouts',
    details: [
      'Purges pores of excess sebum and micro-impurities',
      'Reduces inflammation, redness, and active acne breakouts',
      '100% natural, hand-crafted in Karachi in small batches',
      'Free from chemical surfactants, parabens, and synthetic colorants'
    ],
    usage: 'Lather the soap between wet hands and massage gently onto your face or body in circular motions. Rinse thoroughly with cool water. Pat dry.',
    ingredients: 'Saponified Virgin Coconut Oil, Pure Olive Oil, Raw Shea Butter, Organic Neem Leaf Powder, Tea Tree Oil, Charcoal Powder, Essential Oils.',
    stock: 45,
    badge: 'Acne Solution'
  },
  {
    id: 'root-revival',
    name: 'Root Revival Hair Oil',
    tagline: '100% Organic Rosemary & Cinnamon 🪵',
    description: "A luxury nourishing formulation designed to halt hair fall and stimulate robust new growth. Root Revival Hair Oil combines cold-pressed botanical oils with rosemary and cinnamon bark to fortify follicles, hydrate the scalp, and eliminate dandruff.",
    category: 'hair',
    price: 1950,
    originalPrice: 2800,
    image: '/src/assets/images/Root-Rivival-Hair-Oil.jpeg',
    rating: 4.9,
    reviewsCount: 215,
    isFeatured: true,
    skinType: 'All Hair Types',
    concern: 'Hair Fall & Thinning Roots',
    details: [
      'Visibly reduces hair fall and strengthens thin roots',
      'Stimulates scalp blood circulation to promote new growth',
      'Nourishes and deeply moisturizes scalp to end dry dandruff flakes',
      'Adds a rich, silky shine and sweet cinnamon aroma to your hair'
    ],
    usage: 'Dispense a generous amount of Root Revival Hair Oil. Massage into scalp using fingertips for 5-10 minutes. Distribute remaining oil through hair lengths. Leave on for 2 hours or overnight, then wash with a mild shampoo.',
    ingredients: 'Pure Rosemary Essential Oil, Cinnamon Bark Infusion, Cold-Pressed Sweet Almond Oil, Golden Jojoba Oil, Argan Oil, Castor Oil, Vitamin E Oil.',
    stock: 18,
    badge: 'Customer Favorite'
  },
  {
    id: 'mini-heart-soaps',
    name: 'Mini Heart Soaps Pack',
    tagline: 'Cute, Pocket-Sized Hand & Face Hygiene 💕',
    description: "These adorable pink and red heart-shaped mini soaps are handcrafted with moisturizing organic glycerine and sweet rose extracts. Formulated for school, college, and university girls to easily carry in their bags for gentle, aromatic sanitation on-the-go.",
    category: 'gifts',
    price: 650,
    originalPrice: 900,
    image: '/src/assets/images/Mini-heart-soap.jpeg',
    rating: 4.7,
    reviewsCount: 62,
    isFeatured: false,
    skinType: 'All Skin Types',
    concern: 'Portable Self-Care',
    details: [
      'Super cute, portable heart shapes for everyday travel',
      'Gentle on skin, leaves face and hands exceptionally soft',
      'Enriched with hydrating organic glycerine and red rose extract',
      'Comes in a beautiful, reusable compact storage container'
    ],
    usage: 'Take one mini heart soap out of the package. Lather with water to cleanse hands and face, then rinse off. Store the remaining dry soaps in the container.',
    ingredients: 'Clear Organic Glycerine Base, Virgin Coconut Oil, Sweet Almond Oil, Rosehip Hydrosol, Natural Aromatic Rose Oil, Pink Mica Colorant.',
    stock: 50,
    badge: 'Special Release'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Aisha Khan',
    rating: 5,
    text: "Mera Hydra-Glow Serum experience buhut hi amazing raha! It is extremely lightweight and literally gave my face a plump look in just 10 days. Also, love the glass dropper packaging! Gohar's Organics is definitely Karachi's best skincare find. ❤️",
    date: 'June 25, 2026',
    verified: true,
    productName: 'Hydra-Glow Serum'
  },
  {
    id: 'rev-2',
    name: 'Zainab Fatima',
    rating: 5,
    text: "Dekh Behan! Agar acne se pareshan ho, to this Acne soap is a literal life-saver. My oily skin feels clean but not tight. No side effects at all, fully dermatologist tested. Truly natural skincare made with love!",
    date: 'June 18, 2026',
    verified: true,
    productName: 'Acne Clarifying Soap'
  },
  {
    id: 'rev-3',
    name: 'Mariam Jameel',
    rating: 5,
    text: "Root Revival Hair Oil is magic! My hair fall has stopped by almost 80%. Scalp and roots feel stronger, and the cinnamon-rosemary scent is so therapeutic. Highly recommend to everyone facing Karachi's water-induced hair fall.",
    date: 'June 12, 2026',
    verified: true,
    productName: 'Root Revival Hair Oil'
  },
  {
    id: 'rev-4',
    name: 'Sara Ahmed',
    rating: 4,
    text: "These Mini Heart Soaps are the cutest thing ever. I carry them in my college bag. All my friends are obsessed! Hand wash filters are gone, now I have my own little organic hearts. 🌸",
    date: 'May 28, 2026',
    verified: true,
    productName: 'Mini Heart Soaps Pack'
  },
  {
    id: 'rev-5',
    name: 'Hina Siddiqui',
    rating: 5,
    text: "Stress kam karegi tabhi skin calm karegi. Honestly, taking care of myself with Gohar's Organics has changed my skincare game. Hydra-glow serum + Acne soap are my absolute holy grails now. Fast delivery to Lahore!",
    date: 'May 15, 2026',
    verified: true,
    productName: 'Hydra-Glow Serum'
  }
];

export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Gujranwala',
  'Sialkot',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha'
];
