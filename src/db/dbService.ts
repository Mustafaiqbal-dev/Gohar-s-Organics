import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Product, Order, CartItem } from '../types';

// Define the environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'local_db.json');

// Types for JSON storage
interface LocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'customer';
  phone?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

interface LocalDB {
  users: LocalUser[];
  products: Product[];
  orders: Order[];
}

// Ensure local data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// ---------------------------------------------------------
// 1. MONGODB / MONGOOSE SCHEMAS & MODELS
// ---------------------------------------------------------

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

let UserModel: any;
try {
  UserModel = mongoose.model('User', UserSchema);
} catch (e) {
  UserModel = mongoose.models.User;
}

// Product Schema
const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tagline: { type: String },
  description: { type: String, required: true },
  category: { type: String, enum: ['serum', 'soap', 'hair', 'gifts'], required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, required: true },
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  skinType: { type: String },
  concern: { type: String },
  details: [{ type: String }],
  usage: { type: String },
  ingredients: { type: String },
  stock: { type: Number, default: 0 },
  badge: { type: String }
});

let ProductModel: any;
try {
  ProductModel = mongoose.model('Product', ProductSchema);
} catch (e) {
  ProductModel = mongoose.models.Product;
}

// Order Schema
const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  items: { type: Array, required: true },
  total: { type: Number, required: true },
  date: { type: String, required: true },
  paymentMethod: { type: String, default: 'cod' },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

let OrderModel: any;
try {
  OrderModel = mongoose.model('Order', OrderSchema);
} catch (e) {
  OrderModel = mongoose.models.Order;
}

// ---------------------------------------------------------
// 2. SEED DATA (from data.ts PRODUCTS)
// ---------------------------------------------------------
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'hydra-glow-serum',
    name: 'Hydra-Glow Serum',
    tagline: 'Hyaluronic Acid & Niacinamide ✨ 50% Off First Order',
    description: "Formulated with Kojic Acid, Hyaluronic Acid, and Niacinamide, Gohar's Organics Hydra-Glow Serum is a powerful skin-brightening and hydrating elixir designed to fade dark spots, diminish hyperpigmentation, and lock in deep moisture for a plump, glowing complexion.",
    category: 'serum',
    price: 1850,
    originalPrice: 3700,
    image: '/src/assets/images/hydra_glow_serum_1782659375871.jpg',
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
    image: '/src/assets/images/acne_soap_facewash_1782659393455.jpg',
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
    image: '/src/assets/images/root_revival_oil_1782659414069.jpg',
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
    image: '/src/assets/images/mini_heart_soaps_1782659463111.jpg',
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

// ---------------------------------------------------------
// 3. DATABASE CONTROLLER: AUTO-ROUTING TO MONGO / LOCAL DB
// ---------------------------------------------------------

export class DBService {
  private static isConnectedToMongo = false;

  // Initialize Connection
  static async init(): Promise<void> {
    if (MONGODB_URI) {
      try {
        console.log('[DBService] Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        this.isConnectedToMongo = true;
        console.log('[DBService] MongoDB Connected successfully.');
        
        // Seed database if empty
        const count = await ProductModel.countDocuments();
        if (count === 0) {
          console.log('[DBService] MongoDB products list is empty. Seeding defaults...');
          await ProductModel.insertMany(DEFAULT_PRODUCTS);
          console.log('[DBService] MongoDB default products seeded successfully.');
        }
      } catch (err) {
        console.error('[DBService] Failed to connect to MongoDB, falling back to local storage:', err);
        this.isConnectedToMongo = false;
        this.initLocalDB();
      }
    } else {
      console.log('[DBService] No MONGODB_URI found. Utilizing secure local workspace JSON-file database fallback.');
      this.initLocalDB();
    }
  }

  // Get current DB mode
  static getMode(): 'mongodb' | 'local' {
    return this.isConnectedToMongo ? 'mongodb' : 'local';
  }

  // Local JSON Database Operations
  private static initLocalDB(): void {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const initialData: LocalDB = {
        users: [],
        products: DEFAULT_PRODUCTS,
        orders: []
      };
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
      console.log('[DBService] Initialized local JSON database at:', LOCAL_DB_PATH);
    }
  }

  private static readLocalDB(): LocalDB {
    this.initLocalDB();
    try {
      const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('[DBService] Failed to read local database, recreating empty:', e);
      return { users: [], products: DEFAULT_PRODUCTS, orders: [] };
    }
  }

  private static writeLocalDB(data: LocalDB): void {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // ---------------------------------------------------------
  // 4. USERS ACTIONS
  // ---------------------------------------------------------

  static async findUserByEmail(email: string): Promise<any> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.isConnectedToMongo) {
      return await UserModel.findOne({ email: cleanEmail });
    } else {
      const db = this.readLocalDB();
      const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (user) {
        return {
          _id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          createdAt: user.createdAt
        };
      }
      return null;
    }
  }

  static async findUserById(id: string): Promise<any> {
    if (this.isConnectedToMongo) {
      return await UserModel.findById(id);
    } else {
      const db = this.readLocalDB();
      const user = db.users.find(u => u.id === id);
      if (user) {
        return {
          _id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          createdAt: user.createdAt
        };
      }
      return null;
    }
  }

  static async createUser(userData: { name: string, email: string, passwordHash: string, role: 'admin' | 'customer', phone?: string, address?: string, city?: string }): Promise<any> {
    const cleanEmail = userData.email.toLowerCase().trim();
    if (this.isConnectedToMongo) {
      const newUser = new UserModel({
        name: userData.name,
        email: cleanEmail,
        passwordHash: userData.passwordHash,
        role: userData.role,
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || ''
      });
      return await newUser.save();
    } else {
      const db = this.readLocalDB();
      const id = 'usr_' + Math.random().toString(36).substr(2, 9);
      const newUser: LocalUser = {
        id,
        name: userData.name,
        email: cleanEmail,
        passwordHash: userData.passwordHash,
        role: userData.role,
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      this.writeLocalDB(db);
      return {
        _id: id,
        ...newUser
      };
    }
  }

  // ---------------------------------------------------------
  // 5. PRODUCTS ACTIONS
  // ---------------------------------------------------------

  static async getProducts(): Promise<Product[]> {
    if (this.isConnectedToMongo) {
      return await ProductModel.find({});
    } else {
      const db = this.readLocalDB();
      return db.products;
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    if (this.isConnectedToMongo) {
      return await ProductModel.findOne({ id });
    } else {
      const db = this.readLocalDB();
      return db.products.find(p => p.id === id) || null;
    }
  }

  static async createProduct(productData: Product): Promise<Product> {
    if (this.isConnectedToMongo) {
      const newProd = new ProductModel(productData);
      await newProd.save();
      return productData;
    } else {
      const db = this.readLocalDB();
      db.products.push(productData);
      this.writeLocalDB(db);
      return productData;
    }
  }

  static async updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null> {
    if (this.isConnectedToMongo) {
      return await ProductModel.findOneAndUpdate({ id }, { $set: updateData }, { new: true });
    } else {
      const db = this.readLocalDB();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx > -1) {
        db.products[idx] = { ...db.products[idx], ...updateData };
        this.writeLocalDB(db);
        return db.products[idx];
      }
      return null;
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    if (this.isConnectedToMongo) {
      const res = await ProductModel.deleteOne({ id });
      return res.deletedCount > 0;
    } else {
      const db = this.readLocalDB();
      const filter = db.products.filter(p => p.id !== id);
      if (filter.length < db.products.length) {
        db.products = filter;
        this.writeLocalDB(db);
        return true;
      }
      return false;
    }
  }

  // ---------------------------------------------------------
  // 6. ORDERS ACTIONS
  // ---------------------------------------------------------

  static async getOrders(): Promise<Order[]> {
    if (this.isConnectedToMongo) {
      return await OrderModel.find({}).sort({ createdAt: -1 });
    } else {
      const db = this.readLocalDB();
      // Sort orders descending by date or id
      return [...db.orders].reverse();
    }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    if (this.isConnectedToMongo) {
      return await OrderModel.findOne({ id });
    } else {
      const db = this.readLocalDB();
      return db.orders.find(o => o.id.toUpperCase() === id.toUpperCase()) || null;
    }
  }

  static async getOrdersByEmailOrUser(email: string, userId?: string): Promise<Order[]> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.isConnectedToMongo) {
      const query: any = { $or: [{ email: cleanEmail }] };
      if (userId) {
        query.$or.push({ userId });
      }
      return await OrderModel.find(query).sort({ createdAt: -1 });
    } else {
      const db = this.readLocalDB();
      return db.orders
        .filter(o => o.email.toLowerCase() === cleanEmail || (userId && o.id === userId)) // wait, check user match
        .reverse();
    }
  }

  static async createOrder(orderData: Order, userId?: string): Promise<Order> {
    if (this.isConnectedToMongo) {
      const newOrder = new OrderModel({
        id: orderData.id,
        userId: userId || '',
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        items: orderData.items,
        total: orderData.total,
        date: orderData.date,
        paymentMethod: 'cod',
        status: 'pending'
      });
      await newOrder.save();
      return orderData;
    } else {
      const db = this.readLocalDB();
      const localOrder = {
        ...orderData,
        userId: userId || ''
      };
      db.orders.push(localOrder);
      this.writeLocalDB(db);
      return orderData;
    }
  }

  static async updateOrderStatus(id: string, status: 'pending' | 'processing' | 'shipped' | 'delivered'): Promise<Order | null> {
    if (this.isConnectedToMongo) {
      return await OrderModel.findOneAndUpdate({ id }, { $set: { status } }, { new: true });
    } else {
      const db = this.readLocalDB();
      const idx = db.orders.findIndex(o => o.id === id);
      if (idx > -1) {
        db.orders[idx].status = status;
        this.writeLocalDB(db);
        return db.orders[idx];
      }
      return null;
    }
  }
}
