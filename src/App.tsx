import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Heart,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Check,
  Phone,
  Mail,
  MapPin,
  Shield,
  Instagram,
  Facebook,
  Award,
  Truck,
  RotateCcw,
  Users,
  Search,
  Filter,
  Eye,
  Percent,
  TrendingUp,
  X,
  CreditCard,
  ChevronRight
} from 'lucide-react';

import { Product, Review, CartItem, Order } from './types';
import { PRODUCTS, REVIEWS, PAKISTAN_CITIES } from './data';
import Header from './components/Header';
import Footer from './components/Footer';
import QuickViewModal from './components/QuickViewModal';
import CartDrawer from './components/CartDrawer';
import ReviewForm from './components/ReviewForm';
import RoutineQuizModal from './components/RoutineQuizModal';
import AuthModal from './components/AuthModal';
import OrderHistoryView from './components/OrderHistoryView';
import AdminDashboardView from './components/AdminDashboardView';

export default function App() {
  // State variables
  const [activeTab, setActiveTab] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<{ discountCode: string, discountAmount: number } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkinConcern, setSelectedSkinConcern] = useState<string>('all');
  
  // Checkout & Order success state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutCity, setCheckoutCity] = useState(PAKISTAN_CITIES[0]);
  const [checkoutDiscountCode, setCheckoutDiscountCode] = useState('');
  const [checkoutDiscountAmount, setCheckoutDiscountAmount] = useState(0);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Active quick view image modal for Instagram items
  const [activeInstaModal, setActiveInstaModal] = useState<any | null>(null);

  // Interactive features states
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dynamic products list fetching
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        setProducts(PRODUCTS);
      }
    } catch (err) {
      setProducts(PRODUCTS);
    }
  };

  // Load reviews & database sessions on initial render
  useEffect(() => {
    setReviews(REVIEWS);
    fetchProducts();

    const savedToken = localStorage.getItem('gohar_token');
    const savedUser = localStorage.getItem('gohar_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      
      setCheckoutName(parsedUser.name || '');
      setCheckoutEmail(parsedUser.email || '');
      setCheckoutPhone(parsedUser.phone || '');
      setCheckoutAddress(parsedUser.address || '');
      setCheckoutCity(parsedUser.city || PAKISTAN_CITIES[0]);
    }
    
    // Check if search query was injected via header
    const interval = setInterval(() => {
      const q = (window as any)._shopSearchQuery;
      if (q !== undefined) {
        setSearchQuery(q);
        setActiveTab('shop');
        delete (window as any)._shopSearchQuery;
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setCurrentUser(newUser);
    localStorage.setItem('gohar_token', newToken);
    localStorage.setItem('gohar_user', JSON.stringify(newUser));

    setCheckoutName(newUser.name || '');
    setCheckoutEmail(newUser.email || '');
    setCheckoutPhone(newUser.phone || '');
    setCheckoutAddress(newUser.address || '');
    setCheckoutCity(newUser.city || PAKISTAN_CITIES[0]);

    // If there was a checkout pending, resume it now
    if (pendingCheckout) {
      setCheckoutDiscountCode(pendingCheckout.discountCode);
      setCheckoutDiscountAmount(pendingCheckout.discountAmount);
      setIsCheckoutOpen(true);
      setPendingCheckout(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('gohar_token');
    localStorage.removeItem('gohar_user');
    setActiveTab('home');
  };

  // Sync favorites & cart count with title or state
  const handleToggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = Math.min(
        product.stock,
        updatedCart[existingIndex].quantity + quantity
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity }]);
    }
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const updatedCart = cart.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(item.product.stock, quantity) };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Trigger checkout phase
  const handleInitiateCheckout = (discountCode: string, discountAmount: number) => {
    setIsCartOpen(false);
    
    if (!currentUser) {
      setPendingCheckout({ discountCode, discountAmount });
      setIsAuthModalOpen(true);
      return;
    }

    setCheckoutDiscountCode(discountCode);
    setCheckoutDiscountAmount(discountAmount);
    setIsCheckoutOpen(true);
  };

  // Submit complete order
  const [placingOrder, setPlacingOrder] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone || !checkoutAddress) {
      alert('Please fill out all required shipping details!');
      return;
    }

    setPlacingOrder(true);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingFee = subtotal >= 3000 ? 0 : 200;
    const finalTotal = Math.max(0, subtotal + shippingFee - checkoutDiscountAmount);

    const newOrder: Order = {
      id: `GOH-${Math.floor(100000 + Math.random() * 900000)}`,
      name: checkoutName,
      email: checkoutEmail,
      phone: checkoutPhone,
      address: checkoutAddress,
      city: checkoutCity,
      items: [...cart],
      total: finalTotal,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      paymentMethod: 'cod',
      status: 'pending'
    };

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(newOrder)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit order to server.');
      }

      const savedOrder = await res.json();
      setPlacedOrder(savedOrder);
      setCart([]); // Clear cart
      setIsCheckoutOpen(false);

      // Reset checkout form fields
      setCheckoutName('');
      setCheckoutEmail('');
      setCheckoutPhone('');
      setCheckoutAddress('');
    } catch (err: any) {
      alert(err.message || 'An error occurred during order submission. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Handle addition of reviews
  const handleAddReview = (newReviewData: { name: string; rating: number; text: string; productName: string }) => {
    const freshReview: Review = {
      id: `rev-${Date.now()}`,
      name: newReviewData.name,
      rating: newReviewData.rating,
      text: newReviewData.text,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verified: true,
      productName: newReviewData.productName
    };
    setReviews([freshReview, ...reviews]);
  };

  // Shipment tracking handler
  const handleTrackOrder = async () => {
    setTrackingError('');
    setTrackingResult(null);

    const tid = trackingId.trim().toUpperCase();
    if (!tid) {
      setTrackingError('Please enter a valid Order Reference ID!');
      return;
    }

    try {
      const res = await fetch(`/api/orders/track/${tid}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Shipment not found.');
      }
      const order = await res.json();
      
      const stepNum = order.status === 'delivered' ? 5 :
                     order.status === 'shipped' ? 4 :
                     order.status === 'processing' ? 2 : 1;

      setTrackingResult({
        currentHub: stepNum >= 3 ? `${order.city} Hub` : 'Karachi Processing Center',
        estArrival: stepNum === 5 ? 'Delivered Successfully' : '2-4 working days',
        step: stepNum,
        city: order.city
      });
    } catch (err: any) {
      setTrackingError(err.message || 'Error tracking shipment. Confirm formatting.');
    }
  };

  // Instagram Feed Mock Data representing the images
  const INSTAGRAM_POSTS = [
    {
      id: 'post-1',
      image: '/src/assets/images/acne_soap_facewash_1782659393455.jpg',
      tag: 'Acne Soap & Facewash',
      caption: 'If you have active breakouts, blemishes, or excess sebum, this Neem & Tea Tree soap is a lifesaver. Natural skincare made with love. 🌿',
      likes: '142',
      date: '2 hours ago'
    },
    {
      id: 'post-2',
      image: '/src/assets/images/Neela-Soap.jpeg',
      tag: 'Brand Philosophy',
      caption: 'Dekh Behan! Stress kam karegi tabhi skin calm karegi. Take care of yourself, because self-care is skincare! 🌸💅',
      likes: '286',
      date: '1 day ago'
    },
    {
      id: 'post-3',
      image: '/src/assets/images/hydra_glow_serum_1782659375871.jpg',
      tag: 'Hydra-Glow Serum',
      caption: 'Formulated with Kojic Acid, Hyaluronic Acid, and Niacinamide. Enjoy a plump, radiant glow without toxic chemicals. 50% Off on first order! ✨',
      likes: '341',
      date: '3 days ago'
    },
    {
      id: 'post-4',
      image: '/src/assets/images/root_revival_oil_1782659414069.jpg',
      tag: 'Root Revival Hair Oil',
      caption: 'Stronger roots and thick, shiny hair in just 3 months! Infused with 100% organic Rosemary and Sweet Cinnamon bark. 🪵',
      likes: '198',
      date: '5 days ago'
    },
    {
      id: 'post-5',
      image: '/src/assets/images/mini_heart_soaps_1782659463111.jpg',
      tag: 'Mini Heart Soaps',
      caption: 'Introducing our cute, pocket-sized Mini Heart Soaps. Made for school, college, and university girls to easily carry in their bags. Hydrating rose extracts included! 💕',
      likes: '254',
      date: '1 week ago'
    }
  ];

  // Filters for Shop page
  const filteredProducts = (products.length > 0 ? products : PRODUCTS).filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesConcern = selectedSkinConcern === 'all' || product.concern?.toLowerCase().includes(selectedSkinConcern.toLowerCase());
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesConcern && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D332D] font-sans antialiased flex flex-col justify-between">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        favoritesCount={favorites.length}
        openFavorites={() => {
          setActiveTab('shop');
          // Filter to items that are favorites
          setActiveCategory('all');
          setSelectedSkinConcern('all');
          setSearchQuery('');
          // Temporary flag to filter only favorites on shop
          (window as any)._showOnlyFavorites = true;
          // Trigger a re-render by appending something to state
          setSearchQuery(' ');
          setTimeout(() => setSearchQuery(''), 50);
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Sections with elegant AnimatePresence transition */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full"
          >
            {/* ==================================== */}
            {/* 1. HOMEPAGE VIEW                    */}
            {/* ==================================== */}
            {activeTab === 'home' && (
              <div className="space-y-28 pb-16">
                
                {/* Cinematic Hero Section */}
                <section className="relative w-full min-h-[660px] lg:min-h-[740px] flex items-center bg-[#FAF8F5] overflow-hidden">
                  {/* Premium airy leaf-shadow & ambient green glow background */}
                  <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-bl from-[#788F76]/10 via-[#FAF8F5]/0 to-[#FAF8F5] rounded-bl-[160px] pointer-events-none" />
                  <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#788F76]/4 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 left-10 w-96 h-96 bg-[#FAF8F5] rounded-full blur-3xl pointer-events-none" />

                  <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center py-16 relative z-10">
                    
                    {/* Hero copy details with staggered fade-in animations */}
                    <div className="lg:col-span-6 space-y-8 text-left">
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#788F76]/10 text-[#788F76] rounded-full text-[10px] font-bold uppercase tracking-widest font-mono"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#788F76]" />
                        Karachi's Artisanal Skincare Studio
                      </motion.div>
                      
                      <div className="space-y-4">
                        <motion.h1 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#2D332D] leading-[1.1] tracking-tight"
                        >
                          Thank You for <br />
                          <span className="text-[#788F76] italic font-normal">Choosing Natural</span>
                        </motion.h1>
                        
                        <motion.p 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-lg font-light"
                        >
                          Gohar's Organics brings you high-performance, dermatologist-tested skincare handcrafted locally in Karachi, Pakistan. Free from harsh chemicals, sulfates, and parabens — formulated with pure organic love for a natural, authentic glow.
                        </motion.p>
                      </div>

                      {/* Premium Accent Banner */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-neutral-100 flex items-center gap-4 max-w-lg shadow-xs"
                      >
                        <div className="w-11 h-11 bg-[#D1A066]/10 rounded-full flex items-center justify-center shrink-0">
                          <Percent className="w-5 h-5 text-[#D1A066]" />
                        </div>
                        <div className="text-xs text-left">
                          <strong className="text-[#2D332D] block font-semibold">Special First Order Gift</strong>
                          <span className="text-neutral-500">Enjoy <strong>flat 50% off</strong> our award-winning Hydra-Glow Serum! Apply code: <strong className="text-[#788F76]">GLOW50</strong> at checkout.</span>
                        </div>
                      </motion.div>

                      {/* Primary CTA Buttons */}
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-wrap items-center gap-4 pt-2"
                      >
                        <button
                          id="hero-shop-btn"
                          onClick={() => {
                            setActiveTab('shop');
                            setActiveCategory('all');
                          }}
                          className="bg-[#2D332D] text-[#FAF8F5] hover:bg-[#788F76] font-semibold px-8 py-4 rounded-xl flex items-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-sm"
                        >
                          <span>Explore Skincare Catalog</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          id="hero-about-btn"
                          onClick={() => setActiveTab('about')}
                          className="border border-neutral-200 hover:border-[#788F76] text-neutral-700 hover:text-[#788F76] font-semibold px-6 py-4 rounded-xl transition-all cursor-pointer bg-white/50 hover:bg-white text-sm"
                        >
                          Our Ingredients Story
                        </button>
                      </motion.div>
                    </div>

                    {/* Luxurious Interactive Floating Showcase */}
                    <div className="lg:col-span-6 relative flex justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-md"
                      >
                        {/* Botanical floating particle accents */}
                        <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#788F76]/20 rounded-full blur-xl animate-pulse" />
                        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-[#D1A066]/10 rounded-full blur-2xl animate-pulse" />

                        <motion.div 
                          animate={{ y: [0, -12, 0] }}
                          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
                          className="relative w-full aspect-[4/5] sm:h-[480px] rounded-[32px] overflow-hidden shadow-2xl border-8 border-white/80 backdrop-blur-xs transform hover:rotate-1 transition-transform duration-500 bg-[#FAF8F5]"
                        >
                          <img
                            src="/src/assets/images/hero_skincare_banner_1782659352903.jpg"
                            alt="Gohar's Organics Skincare Bottle Showcase"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {/* Premium Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                          
                          {/* Interactive Glassmorphic Float Badge */}
                          <div className="absolute bottom-6 left-6 right-6 bg-white/85 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#788F76]/25 rounded-full flex items-center justify-center shrink-0">
                              <Award className="w-5 h-5 text-[#788F76]" />
                            </div>
                            <div className="text-left">
                              <span className="text-[9px] uppercase font-mono tracking-widest text-[#788F76] block font-bold">Dermatologist Tested</span>
                              <span className="text-xs font-bold text-neutral-800">100% Non-Toxic & Safe</span>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>

                  </div>
                </section>

                {/* Minimalist Trust & Brand Promise Badges */}
                <section className="bg-white border-y border-neutral-100 py-12 px-6">
                  <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    
                    <div className="flex flex-col items-center text-center space-y-3 group cursor-default">
                      <div className="w-12 h-12 bg-[#FAF8F5] border border-neutral-100 rounded-full flex items-center justify-center text-[#788F76] group-hover:bg-[#788F76] group-hover:text-white transition-colors duration-300">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-xs text-neutral-800 uppercase tracking-wider font-mono">Dermatologist Tested</h3>
                      <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">Fully approved formulations for Pakistani weather and high skin sensitivity.</p>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3 group cursor-default">
                      <div className="w-12 h-12 bg-[#FAF8F5] border border-neutral-100 rounded-full flex items-center justify-center text-[#788F76] group-hover:bg-[#788F76] group-hover:text-white transition-colors duration-300">
                        <Truck className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-xs text-neutral-800 uppercase tracking-wider font-mono">Delivery Nationwide</h3>
                      <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">Handcrafted and dispatched directly from Karachi. Stress-free Cash on Delivery.</p>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3 group cursor-default">
                      <div className="w-12 h-12 bg-[#FAF8F5] border border-neutral-100 rounded-full flex items-center justify-center text-[#788F76] group-hover:bg-[#788F76] group-hover:text-white transition-colors duration-300">
                        <Award className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-xs text-neutral-800 uppercase tracking-wider font-mono">100% Certified Clean</h3>
                      <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">Zero parabens, zero phthalates, zero silicones. Sourced with pure organic passion.</p>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3 group cursor-default">
                      <div className="w-12 h-12 bg-[#FAF8F5] border border-neutral-100 rounded-full flex items-center justify-center text-[#788F76] group-hover:bg-[#788F76] group-hover:text-white transition-colors duration-300">
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-xs text-neutral-800 uppercase tracking-wider font-mono">Artisanal Batches</h3>
                      <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">Handmade weekly in small, sustainable batches to guarantee active potency.</p>
                    </div>

                  </div>
                </section>

                {/* Brand Storytelling / Editorial - "Stress kam karegi tabhi skin calm karegi" */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
                  <div className="bg-[#788F76]/5 rounded-[36px] p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden border border-[#788F76]/10">
                    <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/40 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex-1 space-y-5 text-left">
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#788F76] font-bold">
                        A Message of Mindful Skincare
                      </span>
                      <h2 className="text-3xl md:text-4xl font-serif text-[#2D332D] leading-tight">
                        "Stress kam karegi, <br />
                        tabhi skin calm karegi." 🌸
                      </h2>
                      <p className="text-sm text-neutral-600 leading-relaxed font-light">
                        A beautiful complexion isn't just about topical serums — it starts with self-care and everyday healing. At <strong>Gohar's Organics</strong>, we believe skincare is a sacred form of relaxation. Our products invite you to pause, breathe, and let pure botanicals restore your confidence naturally.
                      </p>
                      
                      <div className="pt-2">
                        <button
                          id="philosophy-about-btn"
                          onClick={() => setActiveTab('about')}
                          className="text-xs font-bold text-[#788F76] hover:text-[#5E725C] flex items-center gap-1.5 group transition-colors"
                        >
                          <span>Discover Our Organic Values</span>
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>

                    {/* Editorial Memoji / Wisdom Widget */}
                    <div className="w-full md:w-[320px] bg-white rounded-3xl shadow-xl p-6 border border-neutral-100 flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-3.5xl shadow-inner border border-rose-100/50">
                        👩🏻‍🎨
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm text-neutral-800">"Dekh Behan!"</h4>
                        <p className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase">Skincare with Sisterly Love</p>
                      </div>
                      <p className="bg-[#FAF8F5] p-3.5 rounded-xl text-xs italic text-neutral-600 border border-neutral-100/50 leading-relaxed">
                        "Your daily routine shouldn't feel like a chore. Light a candle, put on your serum, and love yourself first."
                      </p>
                    </div>
                  </div>
                </section>

                {/* Featured Products Showcase */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 space-y-12">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2 text-left">
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#788F76] font-bold">
                        Curated Apothecary
                      </span>
                      <h2 className="text-3xl font-serif text-[#2D332D] tracking-tight">
                        Our Signature Skincare Essentials
                      </h2>
                      <p className="text-xs text-neutral-500 max-w-xl font-light leading-relaxed">
                        Each formulation is hand-blended in small batches with premium, fresh ingredients and organic active complexes.
                      </p>
                    </div>
                    
                    <button
                      id="view-all-shop-btn"
                      onClick={() => {
                        setActiveTab('shop');
                        setActiveCategory('all');
                      }}
                      className="text-xs font-bold text-[#788F76] hover:text-[#5E725C] flex items-center gap-1 shrink-0 bg-white border border-neutral-200 hover:border-[#788F76] px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <span>View Complete Catalog</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Curated Product Cards with Premium Shadows, Hover Lifts, and Visual Spacing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(products.length > 0 ? products : PRODUCTS).filter(p => p.isFeatured).slice(0, 3).map((product) => {
                      const isProductInFav = favorites.includes(product.id);
                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-2xl overflow-hidden border border-neutral-100/60 shadow-xs hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group"
                        >
                          {/* Image Container with Hover Scale */}
                          <div className="relative h-64 bg-[#FAF8F5] overflow-hidden shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            {product.badge && (
                              <span className="absolute top-4 left-4 bg-[#788F76] text-[#FAF8F5] text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded shadow-xs font-mono">
                                {product.badge}
                              </span>
                            )}
                            
                            {/* Favorite Button Overlay */}
                            <button
                              id={`fav-btn-${product.id}`}
                              onClick={() => handleToggleFavorite(product.id)}
                              className="absolute top-4 right-4 p-2 bg-white/95 text-neutral-400 hover:text-red-500 rounded-full shadow-md hover:scale-105 transition-all cursor-pointer z-10"
                              title={isProductInFav ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                              <Heart className={`w-4 h-4 ${isProductInFav ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>

                            {/* Hover Quick View Button */}
                            <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                id={`quickview-btn-${product.id}`}
                                onClick={() => setSelectedProduct(product)}
                                className="bg-[#FAF8F5] text-neutral-800 hover:bg-[#788F76] hover:text-[#FAF8F5] text-xs font-bold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all transform translate-y-3 group-hover:translate-y-0 cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Quick View</span>
                              </button>
                            </div>
                          </div>

                          {/* Product Card Details */}
                          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2 text-left">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest font-bold">{product.category}</span>
                                <div className="flex items-center gap-1 text-[#D1A066]">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                  <span className="text-xs font-bold text-neutral-700">{product.rating}</span>
                                </div>
                              </div>
                              <h3 className="font-serif text-lg text-neutral-800 group-hover:text-[#788F76] transition-colors leading-tight">
                                {product.name}
                              </h3>
                              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-light">
                                {product.description}
                              </p>
                            </div>

                            {/* Purchase Trigger Block */}
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                              <div className="flex flex-col text-left">
                                <span className="text-base font-bold text-[#788F76]">₨ {product.price.toLocaleString()}</span>
                                {product.originalPrice && (
                                  <span className="text-[11px] text-neutral-400 line-through font-mono">₨ {product.originalPrice.toLocaleString()}</span>
                                )}
                              </div>
                              <button
                                id={`featured-add-cart-btn-${product.id}`}
                                onClick={() => handleAddToCart(product, 1)}
                                className="bg-[#788F76]/10 text-[#788F76] hover:bg-[#788F76] hover:text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Interactive Botanical Apothecary / Ingredients Grid */}
                <section className="bg-white py-20 px-6 border-y border-neutral-100">
                  <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#788F76] font-bold">
                        Honest Ingredients
                      </span>
                      <h2 className="text-3xl font-serif text-[#2D332D]">
                        Our Botanical Pharmacy
                      </h2>
                      <p className="text-xs text-neutral-500 font-light leading-relaxed">
                        Transparency is our foundational standard. Discover the clean, active natural complexes that power Gohar's formulas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      
                      <div className="space-y-4 p-8 bg-[#FAF8F5] rounded-3xl text-left border border-neutral-50 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2.5xl group-hover:scale-105 transition-transform">
                          🌱
                        </div>
                        <h4 className="font-serif text-lg text-neutral-800">Organic Neem & Charcoal</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed font-light">
                          Potent hand-harvested organic neem leaves provide powerful antimicrobial defense to soothe acne redness, while active charcoal absorbs excess sebum without drying local pores.
                        </p>
                        <div className="text-[10px] font-mono font-bold text-[#788F76] uppercase tracking-wider">
                          Active in: Acne Clarifying Soap
                        </div>
                      </div>

                      <div className="space-y-4 p-8 bg-[#FAF8F5] rounded-3xl text-left border border-neutral-50 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2.5xl group-hover:scale-105 transition-transform">
                          🪵
                        </div>
                        <h4 className="font-serif text-lg text-neutral-800">Rosemary & Cinnamon Bark</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed font-light">
                          Our cinnamon bark extract stimulates blood circulation to wake up dormant follicles, while pure rosemary essential oil strengthens roots and clears dry dandruff flakes.
                        </p>
                        <div className="text-[10px] font-mono font-bold text-[#788F76] uppercase tracking-wider">
                          Active in: Root Revival Hair Oil
                        </div>
                      </div>

                      <div className="space-y-4 p-8 bg-[#FAF8F5] rounded-3xl text-left border border-neutral-50 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-2.5xl group-hover:scale-105 transition-transform">
                          🌸
                        </div>
                        <h4 className="font-serif text-lg text-neutral-800">Rosehip & Hyaluronic Acid</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed font-light">
                          Pure organic rosehip hydrosol combined with moisture-binding hyaluronic acid creates an incredible skin hydration barrier that illuminates skin texture.
                        </p>
                        <div className="text-[10px] font-mono font-bold text-[#788F76] uppercase tracking-wider">
                          Active in: Hydra-Glow Serum
                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                {/* Handcrafted Craftsmanship Narrative Section */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-6 space-y-6 text-left">
                    <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#788F76] font-bold">
                      Family Passion & Heritage
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif text-[#2D332D] leading-tight">
                      Crafted by Hand in <br />
                      <span className="text-[#788F76] italic font-normal">Our Karachi Studio</span>
                    </h2>
                    <p className="text-sm text-neutral-600 leading-relaxed font-light">
                      At Gohar's Organics, we began with a simple belief: Pakistani skin needs specialized, clean care to thrive in our unique climates. Standard mass-produced products are often filled with harsh synthetic stabilizers that irritate sensitive skin over time.
                    </p>
                    <p className="text-sm text-neutral-600 leading-relaxed font-light">
                      That is why we hand-blend, saponify, and pack every single product right in Karachi. By manufacturing locally in small weekly batches, we guarantee absolute freshness and keep the natural botanicals highly potent and effective.
                    </p>
                    
                    <div className="border-l-2 border-[#788F76] pl-4 italic text-xs text-neutral-500 font-mono py-1">
                      No shortcuts. No chemical colors. Just honest botanical therapy delivered nationwide with love.
                    </div>
                  </div>

                  <div className="lg:col-span-6 relative aspect-video md:h-[320px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
                    <img
                      src="/src/assets/images/hero_skincare_banner_1782659352903.jpg"
                      alt="Handcrafting pure botanical soaps in Karachi studio"
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-[#2D332D]/10 pointer-events-none" />
                  </div>
                </section>

                {/* Interactive Skincare Routine Quiz Promo */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
                  <div className="bg-gradient-to-r from-[#2D332D] to-[#455244] text-[#FAF8F5] rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between text-left shadow-xl relative overflow-hidden group">
                    {/* Glowing decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#788F76]/15 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute -bottom-10 left-10 w-36 h-36 bg-black/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="space-y-4 max-w-xl z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFE6A3] animate-pulse" />
                        60-Second Skin Matrix Consultation
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-serif tracking-tight leading-tight">
                        Confused about your skin's botanical needs?
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed">
                        Our customized routine quiz analyzes your skin sensitivity, environment, and hydration levels to suggest the perfect organic skincare regimen matching your lifestyle.
                      </p>
                    </div>

                    <button
                      id="open-quiz-home-btn"
                      onClick={() => setIsQuizOpen(true)}
                      className="bg-[#FAF8F5] text-[#2D332D] hover:bg-[#788F76] hover:text-[#FAF8F5] font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all shrink-0 cursor-pointer text-xs uppercase tracking-wider font-mono z-10"
                    >
                      Find My Routine
                    </button>
                  </div>
                </section>

                {/* Verified Customer Testimonials Marquee */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 space-y-12">
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#788F76] font-bold">
                      Loved Across Pakistan
                    </span>
                    <h2 className="text-3xl font-serif text-[#2D332D]">
                      Verified Skincare Journeys
                    </h2>
                    <p className="text-xs text-neutral-500 font-light">
                      Real, authentic feedback from our active community. Discover why thousands trust Gohar's Organics.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <div className="bg-white p-6 rounded-3xl border border-neutral-100/60 shadow-xs text-left space-y-4 flex flex-col justify-between">
                      <p className="text-xs md:text-sm text-neutral-600 leading-relaxed italic font-light">
                        "Mera Hydra-Glow Serum experience buhut hi amazing raha! It is extremely lightweight and literally gave my face a plump look in just 10 days."
                      </p>
                      <div className="flex items-center gap-3 pt-3 border-t border-neutral-50">
                        <div className="w-10 h-10 bg-[#788F76]/10 text-[#788F76] font-bold rounded-full flex items-center justify-center text-xs">
                          AK
                        </div>
                        <div className="text-left text-xs">
                          <strong className="block text-neutral-800">Aisha Khan</strong>
                          <span className="text-[10px] text-neutral-400 font-mono">Karachi • Verified Client 🌸</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-neutral-100/60 shadow-xs text-left space-y-4 flex flex-col justify-between">
                      <p className="text-xs md:text-sm text-neutral-600 leading-relaxed italic font-light">
                        "Dekh Behan! Agar acne se pareshan ho, to this Acne soap is a literal life-saver. My oily skin feels clean but not tight. Truly natural skincare."
                      </p>
                      <div className="flex items-center gap-3 pt-3 border-t border-neutral-50">
                        <div className="w-10 h-10 bg-[#788F76]/10 text-[#788F76] font-bold rounded-full flex items-center justify-center text-xs">
                          ZF
                        </div>
                        <div className="text-left text-xs">
                          <strong className="block text-neutral-800">Zainab Fatima</strong>
                          <span className="text-[10px] text-neutral-400 font-mono">Lahore • Verified Client 🌸</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-neutral-100/60 shadow-xs text-left space-y-4 flex flex-col justify-between">
                      <p className="text-xs md:text-sm text-neutral-600 leading-relaxed italic font-light">
                        "Root Revival Hair Oil is magic! My hair fall has stopped by almost 80%. Scalp and roots feel stronger, and the scent is therapeutic."
                      </p>
                      <div className="flex items-center gap-3 pt-3 border-t border-neutral-50">
                        <div className="w-10 h-10 bg-[#788F76]/10 text-[#788F76] font-bold rounded-full flex items-center justify-center text-xs">
                          MJ
                        </div>
                        <div className="text-left text-xs">
                          <strong className="block text-neutral-800">Mariam Jameel</strong>
                          <span className="text-[10px] text-neutral-400 font-mono">Islamabad • Verified Client 🌸</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>

                {/* Community Instagram Bento Grid */}
                <section className="bg-white py-16 border-y border-neutral-100 px-6">
                  <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#788F76] font-bold">
                        Follow @gohars_organics
                      </span>
                      <h2 className="text-3xl font-serif text-[#2D332D]">
                        Skincare on Instagram
                      </h2>
                      <p className="text-xs text-neutral-500 font-light">
                        Join our digital sisterhood for routine tutorials, skin wisdom updates, and seasonal product releases.
                      </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {INSTAGRAM_POSTS.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setActiveInstaModal(post)}
                          className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
                        >
                          <img
                            src={post.image}
                            alt={post.tag}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-left">
                            <span className="text-[9px] font-mono text-[#D1A066] font-bold uppercase tracking-wider">{post.tag}</span>
                            <p className="text-[10px] text-white leading-snug line-clamp-2 mt-1">
                              {post.caption}
                            </p>
                            <span className="text-[9px] text-white/70 mt-1.5 font-mono">
                              ♥ {post.likes} likes
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Frequently Asked Questions (FAQ) Accordion */}
                <section className="max-w-4xl mx-auto px-6 space-y-8">
                  <div className="text-center space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#788F76] font-bold">
                      Customer Assistance
                    </span>
                    <h2 className="text-3xl font-serif text-[#2D332D]">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-xs text-neutral-500 font-light">
                      Have queries about custom routines, shipping timelines, or checkout codes? We have answers.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        q: "How soon will my order arrive in Karachi, Lahore, or Islamabad?",
                        a: "We dispatch our fresh, handmade organic skincare batches weekly from our Karachi production studio. Standard shipping nationwide takes 2-4 working days. You will receive an SMS with your TCS or Leopards tracking reference ID once dispatched."
                      },
                      {
                        q: "Do you offer Cash on Delivery (COD) all over Pakistan?",
                        a: "Yes, absolutely! We support tension-free Cash on Delivery (COD) for every city and town in Pakistan. You only make payments to our courier partner once the fresh package reaches your doorstep."
                      },
                      {
                        q: "Are Gohar's Organics products safe for sensitive and acne-prone skin?",
                        a: "Every single item in our lineup is completely free of chemical colorants, parabens, sulfates, and heavy mineral oils. We formulate with gentle, raw plant-based active complexes and trial our products under expert dermatologists to ensure absolute compatibility."
                      },
                      {
                        q: "How do I store my handcrafted organic skincare products?",
                        a: "Because we refuse to use strong synthetic chemical preservatives, we recommend keeping our cold-processed bars on a well-drained dry soap dish away from stagnant water, and storing our Hydra-Glow Serum in a cool, dark cabinet away from direct Pakistani sunlight."
                      }
                    ].map((faq, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-neutral-100 overflow-hidden transition-all duration-300 shadow-xs"
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="w-full px-6 py-5 flex justify-between items-center text-left text-neutral-800 hover:text-[#788F76] transition-colors focus:outline-none"
                          >
                            <span className="font-serif text-sm sm:text-base font-medium">{faq.q}</span>
                            <span className="text-xs font-mono ml-4 shrink-0 font-bold">
                              {isOpen ? '−' : '+'}
                            </span>
                          </button>
                          
                          {isOpen && (
                            <div className="px-6 pb-6 text-xs sm:text-sm text-neutral-500 font-light leading-relaxed border-t border-neutral-50 pt-3 text-left animate-fadeIn">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Exclusive Seasonal Offer Block */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
                  <div className="bg-[#1E251E] text-white rounded-[32px] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 border border-white/5">
                    
                    <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center space-y-6 text-left relative">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-[#788F76]/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="inline-flex items-center gap-1.5 text-[#D1A066] font-mono text-xs uppercase tracking-widest font-bold">
                        <Sparkles className="w-4 h-4 text-[#D1A066]" />
                        Seasonal Release Special
                      </div>
                      <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-[#FAF8F5] leading-tight">
                        Spread skincare love with Gohar's <br className="hidden md:inline" />
                        <span className="text-[#788F76] italic font-normal">Mini Heart Soaps</span>
                      </h2>
                      <p className="text-sm text-neutral-300 leading-relaxed max-w-xl font-light">
                        Enriched with organic vegetable glycerine and real rosehip hydrosol extracts, these adorable travel-sized soaps fit perfectly inside school, college, or university bags. Keep your skin hydrated and clean on-the-go.
                      </p>

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                        <div className="text-left">
                          <span className="text-xs text-neutral-400 font-mono block">Promo Price:</span>
                          <span className="text-2xl font-bold text-[#788F76]">₨ 650 <span className="text-xs text-neutral-500 line-through font-normal">₨ 900</span></span>
                        </div>
                        <button
                          id="promo-add-cart-btn"
                          onClick={() => {
                            const heartProd = (products.length > 0 ? products : PRODUCTS).find(p => p.id === 'mini-heart-soaps');
                            if (heartProd) handleAddToCart(heartProd, 1);
                          }}
                          className="bg-[#D1A066] text-[#1E251E] hover:bg-[#C18E54] hover:text-white font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer text-xs uppercase tracking-wider font-mono shadow-md"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add Soaps to Cart</span>
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-5 h-[280px] lg:h-auto min-h-[320px] relative">
                      <img
                        src="/src/assets/images/mini_heart_soaps_1782659463111.jpg"
                        alt="Handcrafted Mini Heart Soaps Package"
                        className="absolute inset-0 w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                  </div>
                </section>

              </div>
            )}

            {/* ==================================== */}
            {/* 2. SHOP PAGE CATALOG VIEW            */}
            {/* ==================================== */}
            {activeTab === 'shop' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-8">
                
                {/* Shop Header banner */}
                <div className="space-y-4 text-center max-w-xl mx-auto">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2D332D]">
                    Shop Skincare & Haircare
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Sustainably sourced, lovingly formulated organic solutions designed to purify pores, strengthen hair roots, and elevate your skin to its dynamic glowing state.
                  </p>
                </div>

                {/* Filter and search panel */}
                <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-xs">
                  
                  {/* Category Filtering Tabs */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: 'All Formulations' },
                      { id: 'serum', label: 'Serums' },
                      { id: 'soap', label: 'Soaps & Cleansers' },
                      { id: 'hair', label: 'Hair Care' },
                      { id: 'gifts', label: 'Special Releases' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        id={`cat-btn-${cat.id}`}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          // Clear favorites-only flag if custom clicked
                          if ((window as any)._showOnlyFavorites) {
                            delete (window as any)._showOnlyFavorites;
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                          activeCategory === cat.id && !(window as any)._showOnlyFavorites
                            ? 'bg-[#788F76] text-[#FAF8F5] shadow-xs'
                            : 'bg-[#FAF8F5] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}

                    {favorites.length > 0 && (
                      <button
                        id="favorites-filter-btn"
                        onClick={() => {
                          (window as any)._showOnlyFavorites = true;
                          // Force state trigger
                          setSearchQuery(searchQuery + ' ');
                          setTimeout(() => setSearchQuery(searchQuery.trim()), 20);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                          (window as any)._showOnlyFavorites
                            ? 'bg-red-500 text-[#FAF8F5] shadow-xs'
                            : 'bg-red-50/70 text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>My Wishlist ({favorites.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Right side concern filter and search input */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    
                    {/* Skin concern filter selector */}
                    <div className="relative">
                      <select
                        id="concern-filter-select"
                        value={selectedSkinConcern}
                        onChange={(e) => setSelectedSkinConcern(e.target.value)}
                        className="bg-[#FAF8F5] border border-neutral-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-700 font-medium cursor-pointer"
                      >
                        <option value="all">Filter Concern: All</option>
                        <option value="acne">Active Acne</option>
                        <option value="glow">Dullness & Glow</option>
                        <option value="hair">Hair Fall & Roots</option>
                        <option value="hygiene">Portable Hygiene</option>
                      </select>
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="shop-search-input"
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#FAF8F5] border border-neutral-200 text-xs pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 w-full sm:w-48 lg:w-56"
                      />
                    </div>

                  </div>

                </div>

                {/* Interactive Routine Finder Banner inside Shop */}
                <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#788F76]/10 rounded-full flex items-center justify-center text-[#788F76] shrink-0 text-xl">
                      🌸
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-neutral-800 font-sans">Find Your Customized Skincare Pair</h3>
                      <p className="text-xs text-neutral-400">Answer 3 simple questions to unlock dermatologist-approved organic formulas matching your skin challenges.</p>
                    </div>
                  </div>
                  <button
                    id="open-quiz-shop-btn"
                    onClick={() => setIsQuizOpen(true)}
                    className="bg-[#788F76]/10 text-[#788F76] hover:bg-[#788F76] hover:text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    Start Routine Quiz
                  </button>
                </div>

                {/* Catalog Counts */}
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>
                    Showing {
                      filteredProducts.filter(p => {
                        if ((window as any)._showOnlyFavorites) return favorites.includes(p.id);
                        return true;
                      }).length
                    } of {(products.length > 0 ? products : PRODUCTS).length} natural skincare products
                  </span>
                  {((window as any)._showOnlyFavorites || activeCategory !== 'all' || selectedSkinConcern !== 'all' || searchQuery) && (
                    <button
                      id="clear-filters-btn"
                      onClick={() => {
                        setActiveCategory('all');
                        setSelectedSkinConcern('all');
                        setSearchQuery('');
                        delete (window as any)._showOnlyFavorites;
                      }}
                      className="text-[#788F76] hover:underline font-semibold cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredProducts.filter(p => {
                    if ((window as any)._showOnlyFavorites) return favorites.includes(p.id);
                    return true;
                  }).length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-3xl border border-neutral-100">
                      <div className="w-14 h-14 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400">
                        <Filter className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-700">No skincare products match your criteria</h4>
                        <p className="text-xs text-neutral-400 mt-1">Try resetting your skin concern, category filter, or search query.</p>
                      </div>
                      <button
                        id="reset-filters-grid-btn"
                        onClick={() => {
                          setActiveCategory('all');
                          setSelectedSkinConcern('all');
                          setSearchQuery('');
                          delete (window as any)._showOnlyFavorites;
                        }}
                        className="bg-[#788F76] text-white hover:bg-[#5E725C] text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    filteredProducts.filter(p => {
                      if ((window as any)._showOnlyFavorites) return favorites.includes(p.id);
                      return true;
                    }).map((product) => {
                      const isProductInFav = favorites.includes(product.id);
                      const discountPercent = product.originalPrice
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : 0;
                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                        >
                          {/* Image */}
                          <div className="relative aspect-square bg-neutral-50 overflow-hidden shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            {product.badge && (
                              <span className="absolute top-3 left-3 bg-[#788F76] text-white text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
                                {product.badge}
                              </span>
                            )}
                            {discountPercent > 0 && (
                              <span className="absolute top-3 left-3 mt-7 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs">
                                -{discountPercent}% OFF
                              </span>
                            )}
                            
                            {/* Favorite Button Overlay */}
                            <button
                              id={`shop-fav-btn-${product.id}`}
                              onClick={() => handleToggleFavorite(product.id)}
                              className="absolute top-3 right-3 p-2 bg-white/95 text-neutral-400 hover:text-red-500 rounded-full shadow-md hover:scale-105 transition-all cursor-pointer"
                              title={isProductInFav ? "Remove from Favorites" : "Add to Favorites"}
                            >
                              <Heart className={`w-4 h-4 ${isProductInFav ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>

                            {/* Hover Quick View Button */}
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button
                                id={`shop-quick-btn-${product.id}`}
                                onClick={() => setSelectedProduct(product)}
                                className="bg-white text-neutral-800 hover:bg-[#788F76] hover:text-[#FAF8F5] text-xs font-semibold px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-1.5 transition-all transform translate-y-2 group-hover:translate-y-0 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Quick View</span>
                              </button>
                            </div>
                          </div>

                          {/* Info section */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-1.5 text-left">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-mono text-neutral-400 uppercase tracking-wider">{product.category}</span>
                                <div className="flex items-center gap-1 text-[#D1A066]">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="font-semibold text-neutral-700">{product.rating}</span>
                                </div>
                              </div>
                              <h3 className="font-bold text-sm text-neutral-800 font-sans group-hover:text-[#788F76] transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                              <p className="text-xs text-neutral-400 font-mono tracking-wide italic">
                                {product.tagline}
                              </p>
                              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            </div>

                            {/* Purchase control block */}
                            <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#788F76]">₨ {product.price.toLocaleString()}</span>
                                {product.originalPrice && (
                                  <span className="text-[10px] text-neutral-400 line-through">₨ {product.originalPrice.toLocaleString()}</span>
                                )}
                              </div>
                              <button
                                id={`shop-add-cart-btn-${product.id}`}
                                onClick={() => handleAddToCart(product, 1)}
                                className="bg-[#788F76]/10 text-[#788F76] hover:bg-[#788F76] hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}

            {/* ==================================== */}
            {/* 3. ABOUT PAGE (OUR STORY VIEW)       */}
            {/* ==================================== */}
            {activeTab === 'about' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-16">
                
                {/* About Banner */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  <div className="lg:col-span-6 space-y-6 text-left">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#788F76] font-bold bg-[#788F76]/10 px-3 py-1 rounded">
                      Since 2024 • Karachi
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans text-[#2D332D] tracking-tight leading-tight">
                      Natural Skincare <br className="hidden md:inline" />
                      <span className="text-[#788F76] italic font-serif">Made with Pure Love</span>
                    </h1>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      At Gohar's Organics, we began with a simple yet passionate mandate: to produce high-performance skincare formulated directly from Nature's richest apothecary. We believe that Pakistani skin needs specific care to battle regional heat, humidity, dust, and environmental stressors.
                    </p>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Every single bar, serum droplet, and oil infusion is crafted by hand in Karachi, Pakistan, using raw plant extracts, active botanicals, and cold-pressed bases. No shortcuts. No toxic chemicals.
                    </p>
                    
                    <div className="border-l-4 border-[#788F76] pl-4 italic text-xs md:text-sm text-neutral-500 bg-[#788F76]/5 py-3 pr-2 rounded-r-xl">
                      "We stand by our words: Use Natural. Dermatologist Tested. Delivered Nationwide with Love."
                    </div>
                  </div>

                  <div className="lg:col-span-6 h-[340px] md:h-[420px] rounded-3xl overflow-hidden shadow-xl border-4 border-white relative">
                    <img
                      src="/src/assets/images/hero_skincare_banner_1782659352903.jpg"
                      alt="Handcrafting organic skincare"
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                </section>

                {/* Our Botanical Ingredients Grid */}
                <section className="space-y-8 bg-white rounded-3xl p-8 md:p-12 border border-neutral-100">
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-[#2D332D]">
                      Our Pure Botanical Pharmacy
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Transparency is our commitment. Here are the active natural ingredients that power Gohar's formulas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <div className="space-y-3 p-4 bg-[#FAF8F5] rounded-2xl text-left border border-neutral-50">
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-xl">
                        🌱
                      </div>
                      <h4 className="font-bold text-sm text-neutral-800">Organic Neem & Charcoal</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Hand-harvested and dried neem leaves provide potent antimicrobial protection, clearing skin inflammation, and purging pores while raw organic charcoal absorbs excess micro-impurities.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-[#FAF8F5] rounded-2xl text-left border border-neutral-50">
                      <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-xl">
                        🪵
                      </div>
                      <h4 className="font-bold text-sm text-neutral-800">Rosemary & Cinnamon Bark</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Cinnamon bark stimulates scalp blood circulation, forcing dormant hair follicles to activate, while pure rosemary extract strengthens roots and locks in moisture for thick hair growth.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-[#FAF8F5] rounded-2xl text-left border border-neutral-50">
                      <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-xl">
                        🌸
                      </div>
                      <h4 className="font-bold text-sm text-neutral-800">Rosehip & Hyaluronic Acid</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        We blend pure rose hydrosol with organic hyaluronic acid to create a dynamic moisture-binding matrix that keeps skin hydrated, supple, and glowing, eliminating dullness on first application.
                      </p>
                    </div>

                  </div>
                </section>

                {/* Our Quality Standards & Certifications */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-4">
                  
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-[#788F76]/10 rounded-full flex items-center justify-center text-[#788F76] mx-auto">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-neutral-800">Dermatologist Tested</h3>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      Every formulation is clinically trialed under expert dermatologists to ensure optimal compatibility for sensitive and acne-prone skin.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-[#788F76]/10 rounded-full flex items-center justify-center text-[#788F76] mx-auto">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-neutral-800">100% Organic & Clean</h3>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      Zero parabens, zero phthalates, zero mineral oils, zero synthetic colorants. Only pure goodness from mother earth.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-[#788F76]/10 rounded-full flex items-center justify-center text-[#788F76] mx-auto">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-neutral-800">Sustainable Batching</h3>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      We handcraft our skincare products in sustainable, small batches weekly in Karachi to preserve the absolute potency of botanical active ingredients.
                    </p>
                  </div>

                </section>

              </div>
            )}

            {/* ==================================== */}
            {/* 4. REVIEWS PAGE                      */}
            {/* ==================================== */}
            {activeTab === 'reviews' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-12">
                
                {/* Reviews Header */}
                <div className="text-center max-w-xl mx-auto space-y-4">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2D332D]">
                    Customer Love & Reviews
                  </h1>
                  <p className="text-xs text-neutral-500">
                    "Dekh Behan! Stress kam karegi tabhi skin calm karegi." Read the authentic skincare journeys from our dynamic sisterhood across Pakistan!
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  
                  {/* Left Column: Average Ratings & Form */}
                  <div className="lg:col-span-5 space-y-8">
                    
                    {/* Scorecard */}
                    <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex items-center gap-6 shadow-xs">
                      <div className="text-left space-y-1">
                        <div className="text-4xl font-extrabold text-[#788F76] font-sans">
                          4.9
                        </div>
                        <div className="flex items-center text-[#D1A066]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium">
                          Based on {reviews.length} reviews
                        </span>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <button
                          id="rating-filter-5-btn"
                          onClick={() => setRatingFilter(ratingFilter === 5 ? null : 5)}
                          className={`flex items-center gap-2 text-xs w-full text-left p-1 rounded-lg hover:bg-[#788F76]/5 transition-all cursor-pointer ${
                            ratingFilter === 5 ? 'bg-[#788F76]/10 text-[#788F76] font-bold' : 'text-neutral-500'
                          }`}
                          title="Filter 5 Star Reviews"
                        >
                          <span className="w-4 shrink-0 font-bold">5★</span>
                          <div className="flex-1 bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#788F76] h-full w-[90%]" />
                          </div>
                          <span className="w-8 text-right shrink-0">90%</span>
                        </button>
                        <button
                          id="rating-filter-4-btn"
                          onClick={() => setRatingFilter(ratingFilter === 4 ? null : 4)}
                          className={`flex items-center gap-2 text-xs w-full text-left p-1 rounded-lg hover:bg-[#788F76]/5 transition-all cursor-pointer ${
                            ratingFilter === 4 ? 'bg-[#788F76]/10 text-[#788F76] font-bold' : 'text-neutral-500'
                          }`}
                          title="Filter 4 Star Reviews"
                        >
                          <span className="w-4 shrink-0 font-bold">4★</span>
                          <div className="flex-1 bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#788F76] h-full w-[8%]" />
                          </div>
                          <span className="w-8 text-right shrink-0">8%</span>
                        </button>
                        <button
                          id="rating-filter-3-btn"
                          onClick={() => setRatingFilter(ratingFilter === 3 ? null : 3)}
                          className={`flex items-center gap-2 text-xs w-full text-left p-1 rounded-lg hover:bg-[#788F76]/5 transition-all cursor-pointer ${
                            ratingFilter === 3 ? 'bg-[#788F76]/10 text-[#788F76] font-bold' : 'text-neutral-500'
                          }`}
                          title="Filter 3 Star Reviews"
                        >
                          <span className="w-4 shrink-0 font-bold">3★</span>
                          <div className="flex-1 bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#788F76] h-full w-[2%]" />
                          </div>
                          <span className="w-8 text-right shrink-0">2%</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive review adding form */}
                    <ReviewForm onSubmit={handleAddReview} />

                  </div>

                  {/* Right Column: Reviews Timeline Feed */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                      <h3 className="font-bold text-lg text-[#2D332D] text-left">
                        Reviews Timeline ({reviews.filter(r => ratingFilter === null || r.rating === ratingFilter).length})
                      </h3>
                      {ratingFilter !== null && (
                        <button
                          id="clear-reviews-filter"
                          onClick={() => setRatingFilter(null)}
                          className="text-xs text-[#788F76] hover:underline font-bold cursor-pointer"
                        >
                          Show All Reviews
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {reviews
                        .filter(r => ratingFilter === null || r.rating === ratingFilter)
                        .map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs text-left space-y-3"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-bold text-sm text-neutral-800 flex items-center gap-1.5">
                                <span>{rev.name}</span>
                                {rev.verified && (
                                  <span className="bg-[#788F76]/10 text-[#788F76] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                    Verified purchaser 🌸
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-neutral-400 mt-0.5">Purchased: <strong className="text-neutral-500">{rev.productName}</strong></p>
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono">{rev.date}</span>
                          </div>

                          {/* rating stars */}
                          <div className="flex items-center text-[#D1A066]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-current' : 'text-neutral-200'
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-xs md:text-sm text-neutral-600 leading-relaxed italic">
                            "{rev.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ==================================== */}
            {/* 5. CONTACT PAGE                      */}
            {/* ==================================== */}
            {activeTab === 'contact' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-12">
                
                {/* Contact Header */}
                <div className="text-center max-w-xl mx-auto space-y-4">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2D332D]">
                    Contact Our Studio
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Have questions about skin compatibility, shipment tracking, or corporate gifting? Get in touch with Gohar's Organics. We are always ready to assist!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
                  
                  {/* Left Column: Details */}
                  <div className="space-y-8 text-left bg-white rounded-3xl p-8 border border-neutral-100 flex flex-col justify-between">
                    <div className="space-y-6">
                      <h3 className="font-bold text-lg text-neutral-800">Reach Us Directly</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Our skincare studio is based in the heart of Karachi. We handcraft and dispatch nationwide all over Pakistan with standard delivery times of 2-4 working days.
                      </p>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#788F76] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">Address</strong>
                            <span className="text-sm text-neutral-600">Skincare Production Studio, Gulshan-e-Iqbal, Karachi, Pakistan</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-[#788F76] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">WhatsApp Helpline</strong>
                            <span className="text-sm text-neutral-600">+92 (312) 123-4567 (10 AM to 7 PM)</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-[#788F76] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">Email Address</strong>
                            <span className="text-sm text-neutral-600">hello@goharsorganics.com</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Instagram className="w-5 h-5 text-[#788F76] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">Instagram Handler</strong>
                            <a
                              href="https://instagram.com/gohars_organic"
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-neutral-600 underline hover:text-[#788F76]"
                            >
                              @gohars_organic
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trust banner */}
                    <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-neutral-100 space-y-2">
                      <h4 className="font-bold text-xs text-neutral-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                        <Shield className="w-4 h-4 text-[#788F76]" />
                        Secure Cash On Delivery
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Enjoy tension-free shopping! Inspect your order at your doorstep anywhere in Pakistan before making payments to courier partners.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Form */}
                  <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-xs text-left">
                    <h3 className="font-bold text-lg text-neutral-800 mb-6">Send Us a Message 🌸</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        alert('Message sent successfully! Our customer service representative will contact you via WhatsApp or Email within 24 hours. Shukriya! ❤️');
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                          Full Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          placeholder="e.g. Ayesha Alvi"
                          className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-[#2D332D]"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                          Email Address
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          placeholder="e.g. ayesha@gmail.com"
                          className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-[#2D332D]"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                          WhatsApp / Phone Number
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          required
                          placeholder="e.g. +92 312 1234567"
                          className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-[#2D332D]"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                          Your Inquiry
                        </label>
                        <textarea
                          id="contact-message"
                          required
                          rows={4}
                          placeholder="How can we help you? Let us know if you need customized skin recommendation advice!"
                          className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-[#2D332D]"
                        />
                      </div>

                      <button
                        id="contact-submit-btn"
                        type="submit"
                        className="w-full bg-[#788F76] text-[#FAF8F5] hover:bg-[#5E725C] font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                      >
                        <span>Send Message</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                </div>

                {/* Interactive Order Shipment Tracker */}
                <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-xs text-left space-y-6 mt-12">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#788F76] font-bold">Nationwide Shipping</span>
                    <h3 className="font-sans text-xl font-bold text-neutral-800">Track Gohar's Organic Shipment 🇵🇰</h3>
                    <p className="text-xs text-neutral-500">Enter your 6-digit Order Reference ID (e.g. GOH-xxxxxx) received at checkout to view real-time Leopard/TCS tracking milestones.</p>
                  </div>

                  <div className="max-w-md">
                    <div className="flex gap-3">
                      <input
                        id="track-order-input"
                        type="text"
                        placeholder="Enter Order ID (e.g. GOH-123456)"
                        value={trackingId}
                        onChange={(e) => {
                          setTrackingId(e.target.value);
                          setTrackingResult(null); // Clear previous
                        }}
                        className="flex-1 bg-[#FAF8F5] border border-neutral-200 text-xs px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 uppercase font-mono font-bold tracking-wider"
                      />
                      <button
                        id="track-order-submit-btn"
                        onClick={handleTrackOrder}
                        className="bg-[#2D332D] text-white hover:bg-neutral-800 font-semibold px-6 py-3 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Track Order
                      </button>
                    </div>
                    {trackingError && <p className="text-[11px] text-red-500 mt-2 font-medium">{trackingError}</p>}
                  </div>

                  {/* Live interactive tracking display output */}
                  {trackingResult && (
                    <div className="border-t border-neutral-100 pt-6 mt-6 space-y-8 animate-fadeIn">
                      
                      {/* Tracking header status */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF8F5] p-5 rounded-2xl border border-neutral-50 text-xs">
                        <div>
                          <span className="text-neutral-400 font-mono block mb-0.5">SHIPMENT CARRIER</span>
                          <strong className="text-neutral-700 font-bold font-sans">Leopard Express Logistics</strong>
                        </div>
                        <div>
                          <span className="text-neutral-400 font-mono block mb-0.5">CURRENT HUB</span>
                          <strong className="text-neutral-700 font-bold font-sans">{trackingResult.currentHub}</strong>
                        </div>
                        <div>
                          <span className="text-neutral-400 font-mono block mb-0.5">ESTIMATED ARRIVAL</span>
                          <strong className="text-[#788F76] font-bold font-sans">{trackingResult.estArrival}</strong>
                        </div>
                      </div>

                      {/* step tracker */}
                      <div className="relative flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 md:gap-4 pl-4 md:pl-0 pt-2">
                        
                        {/* Background connector line */}
                        <div className="absolute left-3.5 md:left-0 top-0 bottom-0 md:top-3 md:bottom-auto w-[2px] md:w-full h-full md:h-[2px] bg-neutral-200 md:-translate-y-1/2 -z-0" />
                        
                        {[
                          { step: 1, label: 'Order Placed', desc: 'Saponified & curated at Karachi Studio', done: true },
                          { step: 2, label: 'Quality Assured', desc: 'Dermatologist formulation checklist', done: trackingResult.step >= 2 },
                          { step: 3, label: 'Dispatched', desc: 'Dispatched via Leopards Karachi Hub', done: trackingResult.step >= 3 },
                          { step: 4, label: 'In Transit', desc: `En-route to ${trackingResult.city} center`, done: trackingResult.step >= 4 },
                          { step: 5, label: 'Delivered', desc: 'Successfully signed by recipient', done: trackingResult.step >= 5 }
                        ].map((milestone) => (
                          <div key={milestone.step} className="relative z-10 flex md:flex-col items-start md:items-center gap-4 md:gap-2 text-left md:text-center md:flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                              milestone.done
                                ? 'bg-[#788F76] border-[#788F76] text-white shadow-xs'
                                : 'bg-white border-neutral-200 text-neutral-400'
                            }`}>
                              {milestone.done ? '✓' : milestone.step}
                            </div>
                            <div className="space-y-0.5">
                              <h4 className={`font-bold text-xs ${milestone.done ? 'text-neutral-800' : 'text-neutral-400'}`}>{milestone.label}</h4>
                              <p className="text-[10px] text-neutral-400 md:max-w-[120px] mt-0.5 leading-snug">{milestone.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ==================================== */}
            {/* 6. CUSTOMER ORDER HISTORY VIEW       */}
            {/* ==================================== */}
            {activeTab === 'order-history' && (
              <OrderHistoryView
                token={token}
                currentUser={currentUser}
                setActiveTab={setActiveTab}
              />
            )}

            {/* ==================================== */}
            {/* 7. ADMIN DASHBOARD CONTROL PANEL     */}
            {/* ==================================== */}
            {activeTab === 'admin-dashboard' && (
              <AdminDashboardView
                token={token}
                currentUser={currentUser}
                onProductsUpdated={fetchProducts}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quick View Interactive Overlay Modal */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isFavorite={favorites.includes(selectedProduct.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Sliding Cart Drawer Panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleInitiateCheckout}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Instagram Bento Grid Detailed Mockup Modal */}
      {activeInstaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveInstaModal(null)} />
          <div className="bg-[#FAF8F5] text-[#2D332D] rounded-2xl overflow-hidden w-full max-w-lg relative z-10 shadow-2xl animate-scaleUp">
            <button
              id="close-insta-modal-btn"
              onClick={() => setActiveInstaModal(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-neutral-700 hover:text-black rounded-full shadow-md transition-all z-20"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative aspect-square">
              <img
                src={activeInstaModal.image}
                alt={activeInstaModal.tag}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-5 space-y-3 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[#788F76] font-bold uppercase tracking-wider">@{activeInstaModal.tag}</span>
                <span className="text-neutral-400">{activeInstaModal.date}</span>
              </div>
              <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-sans">
                {activeInstaModal.caption}
              </p>
              <div className="flex justify-between items-center border-t border-neutral-100 pt-3 text-xs">
                <span className="text-[#D1A066] font-mono font-bold">♥ {activeInstaModal.likes} Likes</span>
                <span className="text-neutral-400 font-mono">Comments are locked</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Form Modal (Slide-in / Interactive Overlay) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* backdrop */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsCheckoutOpen(false)} />
          
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-scaleUp flex flex-col md:flex-row">
            
            {/* Close Button */}
            <button
              id="close-checkout-modal-btn"
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-neutral-700 hover:text-black rounded-full shadow-md transition-all z-20"
              title="Close Checkout"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Form Details */}
            <form onSubmit={handlePlaceOrder} className="w-full md:w-3/5 p-6 md:p-8 space-y-4 text-left border-r border-neutral-100">
              <h3 className="font-sans text-xl font-bold tracking-tight text-[#2D332D]">
                Shipping Address 🇵🇰
              </h3>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Provide your accurate street address and contact number for fast Cash on Delivery nationwide.
              </p>

              {/* Name */}
              <div>
                <label htmlFor="checkout-name" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Recipient Name *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  placeholder="e.g. Sana Alvi"
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="checkout-phone" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  placeholder="e.g. +92 312 1234567"
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="checkout-email" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Email Address
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  placeholder="e.g. sana@gmail.com"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="checkout-address" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Complete Delivery Address *
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  placeholder="Street, Block, Area, Apartment number..."
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                />
              </div>

              {/* City Selection */}
              <div>
                <label htmlFor="checkout-city" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Select City *
                </label>
                <select
                  id="checkout-city"
                  value={checkoutCity}
                  onChange={(e) => setCheckoutCity(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 font-medium"
                >
                  {PAKISTAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="place-order-checkout-btn"
                type="submit"
                className="w-full bg-[#788F76] text-white hover:bg-[#5E725C] font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer mt-4"
              >
                <Check className="w-4.5 h-4.5" />
                <span>Place Order (COD)</span>
              </button>
            </form>

            {/* Right Column: Calculations Breakdown Summary */}
            <div className="w-full md:w-2/5 p-6 md:p-8 bg-[#FAF8F5] flex flex-col justify-between text-left">
              <div className="space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider font-mono text-[#788F76]">
                  Order Summary
                </h4>
                
                {/* Scrollable list of items being purchased */}
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3 text-xs border-b border-neutral-200/40 pb-2">
                      <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-neutral-100">
                        <img src={item.product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong className="block text-neutral-800 truncate text-[11px]">{item.product.name}</strong>
                        <span className="text-neutral-400 font-mono text-[10px]">{item.quantity}x • ₨ {item.product.price.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation math */}
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-neutral-700">₨ {cart.reduce((s, i) => s + i.product.price * i.quantity, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold text-neutral-700">
                      {cart.reduce((s, i) => s + i.product.price * i.quantity, 0) >= 3000 ? 'FREE' : '₨ 200'}
                    </span>
                  </div>
                  {checkoutDiscountAmount > 0 && (
                    <div className="flex justify-between text-[#788F76] font-semibold">
                      <span>Discount ({checkoutDiscountCode}):</span>
                      <span>- ₨ {checkoutDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-neutral-200 pt-2 text-[#2D332D]">
                    <span>Total Amount:</span>
                    <span className="text-[#788F76]">
                      ₨ {(
                        cart.reduce((s, i) => s + i.product.price * i.quantity, 0) +
                        (cart.reduce((s, i) => s + i.product.price * i.quantity, 0) >= 3000 ? 0 : 200) -
                        checkoutDiscountAmount
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Static Security notes */}
              <div className="border-t border-neutral-200/50 pt-4 mt-4 space-y-2.5 text-[10px] text-neutral-400 leading-relaxed font-mono">
                <div className="flex items-start gap-1.5">
                  <Truck className="w-4 h-4 text-[#D1A066] shrink-0" />
                  <span>Est Delivery: 2-4 working days.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Shield className="w-4 h-4 text-[#D1A066] shrink-0" />
                  <span>Dermatologist Approved. Pure botanical value.</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Placed Order Success Modal Screen (Thank You For Your Order) */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl relative z-10 shadow-2xl overflow-hidden animate-scaleUp">
            
            {/* Logo and Thank You cover header */}
            <div className="bg-[#788F76] text-[#FAF8F5] p-8 text-center space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white shadow-inner animate-pulse">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="font-sans text-2xl font-bold tracking-tight uppercase">
                Thank You For Your Order
              </h2>
              <p className="text-xs text-neutral-200 italic max-w-md mx-auto">
                "Natural skincare made with love ❤️ Dermatologist Tested 🍑 Delivery all over Pakistan 🇵🇰"
              </p>
            </div>

            {/* Summary Details */}
            <div className="p-6 md:p-8 space-y-6 text-left">
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-neutral-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-neutral-400 block font-mono">Order Reference ID</span>
                  <strong className="text-neutral-800 font-bold">{placedOrder.id}</strong>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 block font-mono">Placed Date</span>
                  <strong className="text-neutral-800 font-bold">{placedOrder.date}</strong>
                </div>
              </div>

              {/* Shipping Recipient information block */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-neutral-600 font-mono">
                  Shipping Destination
                </h4>
                <div className="text-xs text-neutral-500 space-y-1">
                  <p><strong className="text-neutral-700">Recipient Name:</strong> {placedOrder.name}</p>
                  <p><strong className="text-neutral-700">Contact Number:</strong> {placedOrder.phone}</p>
                  <p><strong className="text-neutral-700">Full Address:</strong> {placedOrder.address}, {placedOrder.city}, Pakistan 🇵🇰</p>
                  <p><strong className="text-neutral-700">Payment Status:</strong> Pending COD (Cash on Delivery)</p>
                </div>
              </div>

              {/* Items in purchase */}
              <div className="space-y-2 border-t border-neutral-100 pt-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-neutral-600 font-mono">
                  Purchased Items
                </h4>
                <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                  {placedOrder.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center text-xs text-neutral-600">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span className="font-mono font-bold">₨ {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-sm font-bold border-t border-neutral-100 pt-2 text-[#788F76]">
                    <span>Grand Total:</span>
                    <span>₨ {placedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Standard button call to action to close success layout */}
              <button
                id="close-success-btn"
                onClick={() => setPlacedOrder(null)}
                className="w-full bg-[#788F76] text-white hover:bg-[#5E725C] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Interactive Skincare Routine Quiz Modal */}
      <RoutineQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onAddToCart={handleAddToCart}
        openCart={() => setIsCartOpen(true)}
      />

      {/* Branded Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onSubscribe={(email) => {
          alert(`Awesome! ${email} has been subscribed to Gohar's Organics. We've sent a 10% discount promo WELCOME10 to your inbox. 🌸`);
        }}
      />
    </div>
  );
}
