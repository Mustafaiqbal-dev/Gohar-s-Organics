import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Check, Shield, AlertCircle, Info } from 'lucide-react';
import { Product } from '../types';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite
}: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop Close Click */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Modal Container */}
      <div className="bg-[#FAF8F5] text-[#2D332D] rounded-2xl overflow-hidden w-full max-w-4xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row animate-scaleUp">
        
        {/* Close Button */}
        <button
          id="close-quickview-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-neutral-700 hover:text-black rounded-full shadow-md transition-all z-20"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image & Details Sidebar */}
        <div className="w-full md:w-1/2 bg-white relative p-6 flex flex-col justify-between items-center border-r border-neutral-100">
          <div className="w-full h-[280px] md:h-[380px] flex items-center justify-center rounded-xl overflow-hidden mb-6 bg-neutral-50 relative group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-[#788F76] text-[#FAF8F5] text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
                {product.badge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Quick Technical Specs */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
              <span className="text-neutral-500">Skin Concerns:</span>
              <span className="font-semibold text-[#788F76]">{product.concern || 'All Concerns'}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
              <span className="text-neutral-500">Ideal For:</span>
              <span className="font-semibold text-neutral-800">{product.skinType || 'All Skin Types'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Status:</span>
              <span className="font-semibold text-emerald-600">
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Product Sales Pitch & Formulation */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Category and Rating */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#788F76] font-semibold bg-[#788F76]/10 px-2 py-0.5 rounded">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                <div className="flex items-center text-[#D1A066]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-neutral-700">({product.rating})</span>
                <span className="text-[11px] text-neutral-400">| {product.reviewsCount} reviews</span>
              </div>
            </div>

            {/* Product Title */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#2D332D] font-sans">
                {product.name}
              </h2>
              {product.tagline && (
                <p className="text-xs font-semibold text-[#D1A066] mt-1 font-mono tracking-wide">
                  {product.tagline}
                </p>
              )}
            </div>

            {/* Price section */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-[#788F76]">₨ {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  ₨ {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Key Benefits */}
            <div className="space-y-1.5 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                <Check className="w-4.5 h-4.5 text-[#788F76]" />
                Key Benefits:
              </h4>
              <ul className="grid grid-cols-1 gap-1 pl-1">
                {product.details.map((detail, idx) => (
                  <li key={idx} className="text-xs text-neutral-600 flex items-start gap-1.5">
                    <span className="text-[#788F76] font-bold mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Active Formulation */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100 space-y-1">
              <h4 className="text-xs font-bold text-neutral-700 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Info className="w-4 h-4 text-[#788F76]" />
                Ingredients list:
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed italic">
                {product.ingredients}
              </p>
            </div>

            {/* Usage Guide */}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-neutral-700 uppercase font-mono tracking-wider">How to Use:</h4>
              <p className="text-neutral-500 leading-relaxed">{product.usage}</p>
            </div>

          </div>

          {/* Action Footer */}
          <div className="border-t border-neutral-100 pt-6 mt-6 space-y-4">
            <div className="flex items-center gap-4">
              
              {/* Quantity selector */}
              <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-neutral-500 hover:bg-neutral-50 font-bold text-sm transition-colors cursor-pointer"
                  title="Decrease"
                >
                  -
                </button>
                <span className="px-4 py-2 font-semibold text-sm w-12 text-center text-neutral-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-neutral-500 hover:bg-neutral-50 font-bold text-sm transition-colors cursor-pointer"
                  title="Increase"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                id="modal-add-to-cart-btn"
                onClick={handleAddToCart}
                className="flex-1 bg-[#788F76] text-[#FAF8F5] hover:bg-[#5E725C] font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.01] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart • ₨ {(product.price * quantity).toLocaleString()}
              </button>

              {/* Favorite Toggle Button */}
              <button
                id="modal-fav-toggle-btn"
                onClick={() => onToggleFavorite(product.id)}
                className={`p-3 rounded-lg border transition-all ${
                  isFavorite
                    ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                    : 'border-neutral-200 text-neutral-400 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

            </div>

            {/* Success Feedback message */}
            {addedMessage && (
              <div className="text-xs text-center font-semibold text-emerald-600 bg-emerald-50 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 animate-fadeIn border border-emerald-100">
                <Check className="w-4 h-4" />
                <span>Superb choice! {quantity}x {product.name} added to your organic cart. 🌸</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-neutral-400" />
                Dermatologist Tested
              </span>
              <span>•</span>
              <span>100% Organic Ingredients</span>
              <span>•</span>
              <span>Karachi Base</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
