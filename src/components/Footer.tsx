import React, { useState } from 'react';
import { Instagram, Facebook, ArrowRight, Heart, Shield, HelpCircle, Mail, MapPin, Truck, HelpCircle as HelpIcon } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onSubscribe: (email: string) => void;
}

export default function Footer({ setActiveTab, onSubscribe }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubscribe(email);
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#1E251E] text-[#FAF8F5]/80 border-t border-[#2D332D] pt-20 pb-10 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="space-y-5">
          <div className="flex flex-col select-none">
            <span className="font-serif text-2xl font-bold tracking-widest text-[#FAF8F5] uppercase">
              Gohar's Organics
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#788F76] font-bold mt-1">
              Botanical Harmony
            </span>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed font-serif italic pr-4">
            "Stress kam karegi tabhi skin calm karegi. Self-care is skincare, darling!" 🌸
          </p>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Dermatologist-tested skincare crafted by hand in small batches in Karachi, Pakistan. Engineered using cold-pressed, wild-harvested raw organic ingredients.
          </p>
          <div className="flex space-x-3 pt-1">
            <a
              href="https://instagram.com/gohars_organic"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-[#2D332D] text-[#FAF8F5] hover:text-[#788F76] hover:bg-white/10 transition-all duration-300"
              title="Instagram Profile"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="p-2.5 rounded-full bg-[#2D332D] text-[#FAF8F5] hover:text-[#788F76] hover:bg-white/10 transition-all duration-300"
              title="Facebook Page"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-5">
          <h4 className="text-xs font-bold text-[#FAF8F5] uppercase tracking-[0.2em] font-mono">
            The Collection
          </h4>
          <ul className="space-y-3.5 text-xs text-neutral-300 font-mono uppercase tracking-wider">
            <li>
              <button
                onClick={() => setActiveTab('home')}
                className="hover:text-[#788F76] transition-colors text-left"
              >
                Home / Main
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('shop')}
                className="hover:text-[#788F76] transition-colors text-left"
              >
                Shop Remedies
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('about')}
                className="hover:text-[#788F76] transition-colors text-left"
              >
                The Philosophy
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('reviews')}
                className="hover:text-[#788F76] transition-colors text-left"
              >
                Verified Reviews
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('contact')}
                className="hover:text-[#788F76] transition-colors text-left"
              >
                Direct Helpline
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Info & Shipping Column */}
        <div className="space-y-5">
          <h4 className="text-xs font-bold text-[#FAF8F5] uppercase tracking-[0.2em] font-mono">
            Our Studio
          </h4>
          <ul className="space-y-3 text-xs text-neutral-300 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#788F76] shrink-0 mt-0.5" />
              <span>Karachi, Pakistan (Dispatching Nationwide 🇵🇰)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#788F76] shrink-0" />
              <span>hello@goharsorganics.com</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-[#788F76] text-xs font-mono font-bold">IG DM:</span>
              <a
                href="https://instagram.com/gohars_organic"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#788F76]"
              >
                @gohars_organic
              </a>
            </li>
            <li className="border-t border-[#2D332D] pt-4 mt-2 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-[#D1A066]" />
                <span>Dermatologist Approved</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-[#788F76]" />
                <span>Cash on Delivery (COD)</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup Column */}
        <div className="space-y-5">
          <h4 className="text-xs font-bold text-[#FAF8F5] uppercase tracking-[0.2em] font-mono">
            Join the Sisterhood
          </h4>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Subscribe to receive sweet skincare wisdom, custom seasonal discount alerts, and instant 10% off your next checkout.
          </p>
          <form onSubmit={handleSubmit} className="relative">
            <input
              id="footer-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-[#2D332D] border border-neutral-700 text-[#FAF8F5] placeholder-neutral-500 text-xs px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] focus:border-[#788F76] pr-12 transition-all"
            />
            <button
              id="footer-subscribe-btn"
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#788F76] text-[#FAF8F5] hover:bg-[#5E725C] rounded-lg transition-colors"
              title="Subscribe"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
          {isSubscribed && (
            <p className="text-xs text-[#788F76] font-mono font-bold animate-fadeIn">
              ✓ Shukriya! Use code WELCOME10 for 10% off! 🌸
            </p>
          )}
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-[#2D332D] pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-neutral-400">
        <div>
          <span>© {new Date().getFullYear()} Gohar's Organics. Handcrafted beautifully </span>
          <Heart className="w-3.5 h-3.5 inline text-red-500 fill-red-500 animate-pulse mx-0.5" />
          <span>in Pakistan.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-wider">
          <button onClick={() => setActiveTab('about')} className="hover:text-[#FAF8F5] transition-colors">
            Terms & Conditions
          </button>
          <span>•</span>
          <button onClick={() => setActiveTab('about')} className="hover:text-[#FAF8F5] transition-colors">
            Privacy Policy
          </button>
          <span>•</span>
          <button onClick={() => setActiveTab('contact')} className="hover:text-[#FAF8F5] transition-colors">
            Shipping & COD FAQ
          </button>
        </div>
      </div>
    </footer>
  );
}
