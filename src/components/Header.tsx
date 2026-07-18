import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, Leaf, Sparkles, Truck, User, LogOut, LayoutDashboard, History, Shield } from 'lucide-react';
import { CartItem } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cart: CartItem[];
  setIsCartOpen: (isOpen: boolean) => void;
  favoritesCount: number;
  openFavorites: () => void;
  currentUser: any;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  cart,
  setIsCartOpen,
  favoritesCount,
  openFavorites,
  currentUser,
  onOpenAuthModal,
  onLogout
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Monitor scroll for premium glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop All' },
    { id: 'about', label: 'Our Story' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' }
  ];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="w-full sticky top-0 z-40 transition-all duration-300">
      {/* Top Announcement Bar - refined font and tracking */}
      <div className="w-full bg-[#788F76] text-[#FAF8F5] text-[10px] sm:text-xs font-medium py-2 px-4 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-8 tracking-wider uppercase font-mono border-b border-[#FAF8F5]/10">
        <span className="flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-neutral-100" />
          Natural Skincare Infused with Passion
        </span>
        <span className="hidden md:inline text-neutral-300/40">|</span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFE6A3]" />
          Dermatologist Tested Formula
        </span>
        <span className="hidden md:inline text-neutral-300/40">|</span>
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          Free Pakistan-Wide Shipping over ₨ 3,000 🇵🇰
        </span>
      </div>

      {/* Main Navbar with state-dependent luxury glassmorphism */}
      <div className={`w-full transition-all duration-500 py-3 sm:py-4 px-4 sm:px-6 lg:px-12 flex justify-between items-center ${
        isScrolled
          ? 'bg-[#FAF8F5]/85 backdrop-blur-xl shadow-md border-b border-[#788F76]/10'
          : 'bg-[#FAF8F5] border-b border-neutral-100'
      }`}>
        {/* Left Side: Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            id="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#2D332D] hover:text-[#788F76] transition-colors p-1 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Brand Logo - clean and luxury branding aligned */}
        <div className="flex items-center cursor-pointer" onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}>
          <div className="flex flex-col items-center md:items-start select-none">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-[#2D332D] uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[#788F76] rounded-full inline-block animate-pulse"></span>
              Gohar's Organics
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-[#788F76] font-bold mt-0.5">
              Botanical Harmony
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links with custom high-contrast styling */}
        <nav className="hidden md:flex items-center space-x-10">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`relative py-2 text-xs font-mono uppercase tracking-[0.15em] font-medium transition-all duration-300 cursor-pointer ${
                  isActive ? 'text-[#788F76] font-bold' : 'text-[#5A635A] hover:text-[#788F76]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#788F76] rounded-full animate-fadeIn" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Search, Favorites, Cart, Account */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Search Toggle */}
          <div className="relative flex items-center">
            {isSearchOpen && (
              <input
                id="header-search-input"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-28 sm:w-48 bg-white border border-neutral-200 text-xs px-3 py-1.5 rounded-full text-[#2D332D] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#788F76] mr-1 transition-all duration-300 animate-scaleUp"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab('shop');
                    (window as any)._shopSearchQuery = searchQuery;
                    setIsSearchOpen(false);
                  }
                }}
              />
            )}
            <button
              id="search-toggle-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-[#2D332D] hover:text-[#788F76] transition-all p-1.5 sm:p-2 rounded-full hover:bg-neutral-100 cursor-pointer"
              title="Search products"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Favorites Button */}
          <button
            id="favorites-btn"
            onClick={openFavorites}
            className="text-[#2D332D] hover:text-red-500 transition-all p-1.5 sm:p-2 rounded-full hover:bg-neutral-100 relative cursor-pointer"
            title="Your Favorites"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Shopping Bag Button with luxurious touch */}
          <button
            id="cart-toggle-btn"
            onClick={() => setIsCartOpen(true)}
            className="text-[#2D332D] hover:text-[#788F76] transition-all p-1.5 sm:p-2 rounded-full hover:bg-neutral-100 relative group cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#2D332D] group-hover:scale-105 transition-transform" />
            {totalCartItems > 0 && (
              <span className="absolute top-0 right-0 bg-[#D1A066] text-[#FAF8F5] text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold font-mono shadow-xs">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Sign In / Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            {currentUser ? (
              <div>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-[#788F76]/10 text-[#788F76] hover:bg-[#788F76]/20 border border-[#788F76]/20 font-bold text-xs flex items-center justify-center cursor-pointer transition-all shadow-xs"
                  title="My Account"
                >
                  {getInitials(currentUser.name)}
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100/80 py-3 text-left animate-scaleUp z-50">
                    <div className="px-4 py-2 border-b border-neutral-50 pb-2.5">
                      <span className="block text-xs font-bold text-neutral-800 truncate leading-tight">{currentUser.name}</span>
                      <span className="block text-[10px] text-neutral-400 truncate leading-relaxed">{currentUser.email}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#788F76]/15 text-[#788F76] text-[8px] font-mono rounded font-bold uppercase tracking-wider">
                        {currentUser.role === 'admin' ? 'Seller (Admin)' : 'Buyer'}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        id="user-history-btn"
                        onClick={() => {
                          setActiveTab('order-history');
                          setIsUserDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-xs text-neutral-600 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Order History</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          id="user-admin-btn"
                          onClick={() => {
                            setActiveTab('admin-dashboard');
                            setIsUserDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[#788F76]/5 text-xs text-[#788F76] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#788F76]" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-neutral-50 pt-1.5 mt-1">
                      <button
                        id="user-logout-btn"
                        onClick={() => {
                          onLogout();
                          setIsUserDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs text-red-500 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="sign-in-prompt-btn"
                onClick={onOpenAuthModal}
                className="bg-[#788F76] text-white hover:bg-[#5E725C] text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sign In / Join"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Slidedown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5]/95 backdrop-blur-xl border-b border-neutral-100 absolute w-full left-0 py-4 px-6 space-y-2.5 z-30 shadow-lg animate-fadeIn">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#788F76]/10 text-[#788F76] font-bold'
                    : 'text-[#5A635A] hover:bg-neutral-50 hover:text-[#788F76]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
