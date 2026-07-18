import React, { useState } from 'react';
import { X, Sparkles, Check, ShoppingBag, ArrowRight, ShieldCheck, Heart, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data';

interface RoutineQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  openCart: () => void;
}

export default function RoutineQuizModal({
  isOpen,
  onClose,
  onAddToCart,
  openCart
}: RoutineQuizModalProps) {
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState('');
  const [concern, setConcern] = useState('');
  const [routineComplexity, setRoutineComplexity] = useState('');

  if (!isOpen) return null;

  // Calculate recommendation based on answers
  const getRecommendation = () => {
    let recommendedProducts: Product[] = [];
    let title = '';
    let description = '';

    if (concern === 'acne') {
      const soap = PRODUCTS.find(p => p.id === 'acne-soap');
      const serum = PRODUCTS.find(p => p.id === 'hydra-glow-serum');
      if (soap) recommendedProducts.push(soap);
      if (serum && routineComplexity === 'ritual') recommendedProducts.push(serum);
      title = 'Purifying Clarifying Ritual 🌿';
      description = 'Based on your concern with breakouts and oily skin, we recommend our cold-processed Neem & Tea Tree soap to purge pores, paired with a gentle hydration lock to prevent over-drying.';
    } else if (concern === 'glow' || concern === 'all') {
      const serum = PRODUCTS.find(p => p.id === 'hydra-glow-serum');
      const soap = PRODUCTS.find(p => p.id === 'acne-soap');
      if (serum) recommendedProducts.push(serum);
      if (soap && routineComplexity === 'ritual') recommendedProducts.push(soap);
      title = 'Ultra-Hydra Glow Ritual ✨';
      description = 'To address dullness and target hyperpigmentation, Gohar’s active Hydra-Glow Serum with Kojic Acid and Niacinamide is your holy grail. It creates a dynamic moisture shield for instant glass-skin radiance.';
    } else if (concern === 'hair') {
      const oil = PRODUCTS.find(p => p.id === 'root-revival');
      if (oil) recommendedProducts.push(oil);
      title = 'Root Revival Botanical Therapy 🪵';
      description = 'Karachi’s salty water and high humidity can strip hair follicles. Our Rosemary & Sweet Cinnamon infusion is clinically engineered to arrest fall, stimulate blood circulation, and double hair density.';
    } else {
      // Default / Portable self care
      const heartSoaps = PRODUCTS.find(p => p.id === 'mini-heart-soaps');
      const soap = PRODUCTS.find(p => p.id === 'acne-soap');
      if (heartSoaps) recommendedProducts.push(heartSoaps);
      if (soap && routineComplexity === 'ritual') recommendedProducts.push(soap);
      title = 'On-The-Go Botanical Protection 💕';
      description = 'Keep your hygiene gentle and beautifully aromatic. Our rose-extract travel mini-hearts keep hands soft and clear of bacteria while attending school, university, or active workplaces.';
    }

    return { products: recommendedProducts, title, description };
  };

  const handleAddRoutineToCart = () => {
    const { products } = getRecommendation();
    products.forEach(p => {
      onAddToCart(p, 1);
    });
    // Auto-fill custom coupon for quiz users
    (window as any)._prefilledCoupon = 'WELCOME10';
    
    // Close quiz and open cart
    onClose();
    setTimeout(() => {
      openCart();
    }, 400);
  };

  const handleResetQuiz = () => {
    setStep(1);
    setSkinType('');
    setConcern('');
    setRoutineComplexity('');
  };

  const recommendation = getRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Container */}
      <div className="bg-[#FAF8F5] text-[#2D332D] rounded-3xl overflow-hidden w-full max-w-2xl relative z-10 shadow-2xl animate-scaleUp max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-neutral-700 hover:text-black rounded-full shadow-md transition-all z-20 cursor-pointer"
          title="Close Quiz"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Cover */}
        <div className="bg-[#788F76] text-[#FAF8F5] p-8 text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE6A3]" />
            Gohar's Personal Skincare Finder
          </div>
          <h2 className="font-sans text-2xl font-bold tracking-tight">
            Discover Your Perfect Botanical Routine
          </h2>
          <p className="text-xs text-neutral-200 italic max-w-md mx-auto">
            "Stress kam karegi tabhi skin calm karegi." Answer 3 quick questions to unlock dermatologist-tested organic recommendations.
          </p>
        </div>

        {/* Quiz Steps Body */}
        <div className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#788F76] font-bold">Step 1 of 3</span>
                <h3 className="font-sans text-lg font-bold text-neutral-800">What is your skin type?</h3>
                <p className="text-xs text-neutral-400">Choose the description that best fits how your skin feels on an average day.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'oily', title: 'Oily & Shiny', desc: 'Prone to large pores, blackheads, and excess grease throughout the day.' },
                  { id: 'dry', title: 'Dry & Flaky', desc: 'Feels tight, rough, or shows flaky patches, especially after washing.' },
                  { id: 'sensitive', title: 'Sensitive & Red', desc: 'Easily irritated, reacts to new products, or experiences itchy redness.' },
                  { id: 'combo', title: 'Normal / Combination', desc: 'Shiny T-zone (forehead, nose) but comfortable cheeks.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSkinType(opt.id);
                      setStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:border-[#788F76] hover:bg-[#788F76]/5 cursor-pointer flex flex-col justify-between h-full group ${
                      skinType === opt.id ? 'border-[#788F76] bg-[#788F76]/10' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <span className="font-bold text-sm text-neutral-800 group-hover:text-[#788F76] transition-colors">{opt.title}</span>
                    <span className="text-xs text-neutral-500 mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#788F76] font-bold">Step 2 of 3</span>
                <h3 className="font-sans text-lg font-bold text-neutral-800">What is your primary concern?</h3>
                <p className="text-xs text-neutral-400">Select the target area you want Gohar's Organics to heal and balance.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'acne', emoji: '🌿', title: 'Active Acne & Breakouts', desc: 'Pores, pimples, inflammation, and healing dark blemish spots.' },
                  { id: 'glow', emoji: '✨', title: 'Dullness & Lack of Glow', desc: 'Uneven skin tone, sun tan, pigmentation, wanting glass-like shine.' },
                  { id: 'hair', emoji: '🪵', title: 'Hair Fall & Thin Roots', desc: 'Weak hair shafts, shedding from hard water, wanting density.' },
                  { id: 'hygiene', emoji: '💕', title: 'Portable Hygiene & Self-Care', desc: 'Cute, gentle skin and hand cleansing while traveling or studying.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setConcern(opt.id);
                      setStep(3);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:border-[#788F76] hover:bg-[#788F76]/5 cursor-pointer flex gap-4 items-start h-full group ${
                      concern === opt.id ? 'border-[#788F76] bg-[#788F76]/10' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <span className="text-2xl shrink-0 p-2 bg-[#FAF8F5] rounded-xl border border-neutral-100">{opt.emoji}</span>
                    <div>
                      <span className="font-bold text-sm text-neutral-800 group-hover:text-[#788F76] transition-colors block">{opt.title}</span>
                      <span className="text-xs text-neutral-500 mt-1 block leading-normal">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#788F76] hover:underline font-semibold cursor-pointer"
              >
                ← Back to skin type
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#788F76] font-bold">Step 3 of 3</span>
                <h3 className="font-sans text-lg font-bold text-neutral-800">What is your routine style?</h3>
                <p className="text-xs text-neutral-400">Select how much time you prefer dedicating to your daily skincare healing rituals.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'simple', title: 'Simple & Fast (1 Step)', desc: 'Just the core essentials. I want to spend less than 2 minutes on my skincare.' },
                  { id: 'ritual', title: 'Complete Ritual (2+ Steps)', desc: 'Multi-step self-care healing. I enjoy facial massages and double layers.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setRoutineComplexity(opt.id);
                      setStep(4);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:border-[#788F76] hover:bg-[#788F76]/5 cursor-pointer flex flex-col justify-between h-full group ${
                      routineComplexity === opt.id ? 'border-[#788F76] bg-[#788F76]/10' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <span className="font-bold text-sm text-neutral-800 group-hover:text-[#788F76] transition-colors">{opt.title}</span>
                    <span className="text-xs text-neutral-500 mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="text-xs text-[#788F76] hover:underline font-semibold cursor-pointer"
              >
                ← Back to concern
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-left animate-fadeIn">
              
              {/* Recommendation summary card */}
              <div className="bg-[#788F76]/5 border border-[#788F76]/20 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#788F76] font-bold">Your Ideal Routine matches:</span>
                  <button
                    onClick={handleResetQuiz}
                    className="text-[10px] font-mono text-[#788F76] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retake Quiz
                  </button>
                </div>
                <h3 className="font-sans text-xl font-bold text-neutral-800">{recommendation.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{recommendation.description}</p>
              </div>

              {/* Recommended products list */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">Recommended Botanical Products:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendation.products.map(prod => (
                    <div key={prod.id} className="bg-white border border-neutral-100 rounded-2xl p-4 flex gap-3 items-center shadow-xs">
                      <img src={prod.image} alt={prod.name} className="w-16 h-16 object-cover rounded-xl shrink-0 bg-neutral-50 border border-neutral-100" />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs text-neutral-800 truncate">{prod.name}</h5>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">{prod.skinType}</p>
                        <p className="text-xs font-bold text-[#788F76] mt-1">₨ {prod.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-neutral-100 pt-6 space-y-3">
                <button
                  onClick={handleAddRoutineToCart}
                  className="w-full bg-[#788F76] text-[#FAF8F5] hover:bg-[#5E725C] font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:scale-[1.01] cursor-pointer"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  <span>Add Recommended Routine to Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-[#788F76] font-semibold font-mono animate-pulse">
                  🎁 Flat 10% discount promo code "WELCOME10" will be auto-applied at checkout!
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-[#FAF8F5] border-t border-neutral-100 py-4 px-6 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D1A066]" />
            Dermatologist Approved
          </span>
          <span>•</span>
          <span>100% Raw Ingredients</span>
          <span>•</span>
          <span>Free Consultation via Helpline</span>
        </div>

      </div>
    </div>
  );
}
