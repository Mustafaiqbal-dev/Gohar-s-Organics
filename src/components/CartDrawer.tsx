import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (discountCode: string, discountAmount: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const [coupon, setCoupon] = useState('');
  const [activeDiscount, setActiveDiscount] = useState({ code: '', amount: 0, type: '' });
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Calculate prices
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Free shipping above 3000 PKR, otherwise standard 200 PKR shipping
  const shippingFee = subtotal >= 3000 || subtotal === 0 ? 0 : 200;

  // Apply Coupon Code helper
  const runApplyCoupon = (codeToApply: string) => {
    setCouponError('');
    setCouponSuccess('');
    const code = codeToApply.trim().toUpperCase();

    if (code === 'WELCOME10') {
      const discount = Math.round(subtotal * 0.1);
      setActiveDiscount({ code, amount: discount, type: 'percentage' });
      setCouponSuccess('WELCOME10 (10% Off) applied successfully! 🎉');
    } else if (code === 'VALENTINE') {
      const discount = Math.min(500, subtotal);
      setActiveDiscount({ code, amount: discount, type: 'flat' });
      setCouponSuccess('VALENTINE Special (₨ 500 Off) applied! ❤️');
    } else if (code === 'GLOW50') {
      // Find Hydra Glow Serum in cart
      const serumItem = cart.find(item => item.product.id === 'hydra-glow-serum');
      if (serumItem) {
        const discount = Math.round(serumItem.product.price * 0.5 * serumItem.quantity);
        setActiveDiscount({ code, amount: discount, type: 'product' });
        setCouponSuccess('GLOW50 (50% Off Hydra-Glow Serum) applied! ✨');
      } else {
        setCouponError('GLOW50 is only valid when Hydra-Glow Serum is in your cart!');
      }
    } else {
      setCouponError('Invalid discount code. Try WELCOME10, VALENTINE, or GLOW50!');
    }
  };

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    runApplyCoupon(coupon);
  };

  // Auto-apply quiz prefilled coupon
  React.useEffect(() => {
    if (isOpen && (window as any)._prefilledCoupon) {
      const code = (window as any)._prefilledCoupon;
      setCoupon(code);
      runApplyCoupon(code);
      // Consume it
      delete (window as any)._prefilledCoupon;
    } else if (isOpen && activeDiscount.code) {
      // Recalculate discount value if items changed in cart
      runApplyCoupon(activeDiscount.code);
    }
  }, [isOpen, subtotal]);

  if (!isOpen) return null;

  const finalTotal = Math.max(0, subtotal + shippingFee - activeDiscount.amount);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Cart Container */}
      <div className="w-full max-w-md bg-[#FAF8F5] text-[#2D332D] h-full flex flex-col justify-between relative z-10 shadow-2xl animate-slideLeft">
        
        {/* Cart Header */}
        <div className="p-6 border-b border-neutral-200 bg-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#788F76]" />
            <h3 className="font-sans text-lg font-bold tracking-tight">Your Organic Cart</h3>
            <span className="text-xs bg-[#788F76]/10 text-[#788F76] font-semibold px-2 py-0.5 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-black transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-16 bg-[#788F76]/10 rounded-full flex items-center justify-center text-[#788F76]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800">Your cart is feeling empty</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-[240px]">
                  Add some natural glow with our organic, dermatologist-tested skincare formulations made with love.
                </p>
              </div>
              <button
                id="cart-shop-now-btn"
                onClick={onClose}
                className="bg-[#788F76] text-white hover:bg-[#5E725C] text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 bg-white rounded-xl border border-neutral-100 shadow-xs relative"
                >
                  {/* Product thumbnail */}
                  <div className="w-20 h-20 bg-neutral-50 rounded-lg overflow-hidden shrink-0 border border-neutral-100">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Product details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 pr-6">{item.product.name}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{item.product.skinType}</p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      {/* Quantity Toggles */}
                      <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden bg-[#FAF8F5]">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 font-bold cursor-pointer"
                          title="Decrease"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-xs font-semibold text-neutral-700 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 font-bold cursor-pointer"
                          title="Increase"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="text-sm font-bold text-[#788F76]">
                        ₨ {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="absolute top-3 right-3 text-neutral-300 hover:text-red-500 p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Promotional Tip banner (If below 3000 PKR subtotal) */}
          {cart.length > 0 && subtotal < 3000 && (
            <div className="bg-[#FAF8F5] border border-neutral-200 rounded-xl p-3 flex gap-2.5 items-start">
              <Sparkles className="w-4.5 h-4.5 text-[#D1A066] shrink-0 mt-0.5 animate-pulse" />
              <div className="text-[11px] text-neutral-600">
                Add just <strong className="text-neutral-800">₨ {(3000 - subtotal).toLocaleString()}</strong> more to get <strong className="text-neutral-800">FREE delivery</strong> nationwide! 🇵🇰
              </div>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-white space-y-4">
            
            {/* Promo code input form */}
            <form onSubmit={applyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="cart-coupon-input"
                  type="text"
                  placeholder="Promo Code (GLOW50, VALENTINE)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-9 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] focus:border-[#788F76] text-neutral-800"
                />
              </div>
              <button
                id="apply-coupon-btn"
                type="submit"
                className="bg-[#2D332D] text-[#FAF8F5] hover:bg-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>

            {/* Promo Code Alerts */}
            {couponError && <p className="text-[10px] text-red-500 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] text-[#788F76] font-medium">{couponSuccess}</p>}

            {/* Pricing Summary */}
            <div className="space-y-2 pt-1 border-t border-neutral-100">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Subtotal:</span>
                <span className="font-semibold text-neutral-800">₨ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Shipping nationwide:</span>
                <span className="font-semibold text-neutral-800">
                  {shippingFee === 0 ? 'FREE' : `₨ ${shippingFee.toLocaleString()}`}
                </span>
              </div>
              {activeDiscount.amount > 0 && (
                <div className="flex justify-between text-xs text-[#788F76] font-semibold">
                  <span className="flex items-center gap-1">
                    Discount ({activeDiscount.code}):
                  </span>
                  <span>- ₨ {activeDiscount.amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-neutral-100 pt-2 text-[#2D332D]">
                <span>Total Amount:</span>
                <span className="text-base text-[#788F76]">₨ {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Check Out Call to Action */}
            <button
              id="cart-checkout-btn"
              onClick={() => onCheckout(activeDiscount.code, activeDiscount.amount)}
              className="w-full bg-[#788F76] text-[#FAF8F5] hover:bg-[#5E725C] font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:scale-[1.01] cursor-pointer"
            >
              <span>Proceed to Checkout (COD)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Statement */}
            <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D1A066]" />
              <span>Dermatologist Approved Skincare • Cash on Delivery</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
