import React, { useState } from 'react';
import { Star, Check, Send, AlertCircle } from 'lucide-react';
import { PRODUCTS } from '../data';

interface ReviewFormProps {
  onSubmit: (review: { name: string; rating: number; text: string; productName: string }) => void;
}

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [productName, setProductName] = useState(PRODUCTS[0].name);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && text.trim()) {
      onSubmit({ name, rating, text, productName });
      setSuccess(true);
      setName('');
      setRating(5);
      setText('');
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 shadow-sm">
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-bold text-[#2D332D] font-sans">
          Share Your Love 🌸
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed">
          "Stress kam karegi tabhi skin calm karegi." Let the sisterhood know how Gohar's Organics worked for you! Share your thoughts, results, or beautiful routines.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name input */}
        <div>
          <label htmlFor="review-name" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
            Your Beautiful Name
          </label>
          <input
            id="review-name"
            type="text"
            required
            placeholder="e.g. Sana Alvi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] focus:border-[#788F76] text-neutral-800"
          />
        </div>

        {/* Product selector */}
        <div>
          <label htmlFor="review-product" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
            Skincare Product Used
          </label>
          <select
            id="review-product"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] focus:border-[#788F76] text-neutral-800"
          >
            {PRODUCTS.map((prod) => (
              <option key={prod.id} value={prod.name}>
                {prod.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rating star picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
            Your Rating
          </label>
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="text-[#D1A066] hover:scale-110 transition-transform cursor-pointer p-0.5"
                title={`Rate ${star} Stars`}
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoverRating ?? rating) ? 'fill-[#D1A066]' : 'text-neutral-200'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs text-neutral-400 font-mono ml-2">
              ({rating} / 5 Stars)
            </span>
          </div>
        </div>

        {/* Review commentary */}
        <div>
          <label htmlFor="review-text" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
            Your Skincare Journey
          </label>
          <textarea
            id="review-text"
            required
            rows={4}
            placeholder="Tell us everything! E.g. 'Mera Hydra-glow serum experience buhut hi amazing raha...'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#788F76] focus:border-[#788F76] text-neutral-800"
          />
        </div>

        {/* Submit action */}
        <button
          id="submit-review-btn"
          type="submit"
          className="w-full bg-[#788F76] text-[#FAF8F5] hover:bg-[#5E725C] font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:scale-[1.01] cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Publish My Review</span>
        </button>

        {success && (
          <div className="text-xs text-center font-semibold text-emerald-600 bg-emerald-50 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 animate-fadeIn border border-emerald-100">
            <Check className="w-4 h-4" />
            <span>Thank you so much! Your organic review has been posted. 🌸</span>
          </div>
        )}
      </form>
    </div>
  );
}
