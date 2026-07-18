import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, Check, Sparkles, Chrome } from 'lucide-react';
import { PAKISTAN_CITIES } from '../data';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeMode, setActiveMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(PAKISTAN_CITIES[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Listen for Google OAuth callback message from the popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token: oauthToken, user: oauthUser } = event.data;
        setSuccess('Successfully authenticated via Google!');
        setError('');
        setTimeout(() => {
          onAuthSuccess(oauthToken, oauthUser);
          onClose();
        }, 1200);
      } else if (event.data?.type === 'OAUTH_AUTH_FAILURE') {
        setError(event.data.error || 'Google Authentication failed.');
        setSuccess('');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [onAuthSuccess, onClose]);

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Get origin of current window to pass to backend so it constructs the exact matching redirect URI
      const clientOrigin = window.location.origin;
      const res = await fetch(`/api/auth/google/url?origin=${encodeURIComponent(clientOrigin)}`);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Google login is currently unavailable.');
      }

      const { url } = await res.json();

      // Open the Google OAuth authorization URL directly in a popup window
      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        url,
        'google_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
      );

      if (!authWindow) {
        setError('Popup blocker active! Please allow popups for Gohar\'s Organics to sign in with Google.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start Google login flow.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = activeMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = activeMode === 'login' 
        ? { email, password } 
        : { name, email, password, role, phone, address, city };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred during authentication.');
      }

      setSuccess(activeMode === 'login' ? 'Successfully logged in!' : 'Account registered successfully!');
      
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        onClose();
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* backdrop clicks close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-scaleUp border border-neutral-100">
        
        {/* Close button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-black rounded-full transition-all z-20 cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-[#788F76] text-white p-6 text-center space-y-1 relative">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto text-white mb-2 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-xl font-bold tracking-wider uppercase">Gohar's Account Center</h2>
          <p className="text-[10px] text-neutral-100 font-mono tracking-widest uppercase">Pure Skincare Studio</p>
        </div>

        {/* Error / Success Notices */}
        {error && (
          <div className="bg-red-50 text-red-600 border-b border-red-100 text-xs py-2.5 px-5 font-medium text-center">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 border-b border-emerald-100 text-xs py-2.5 px-5 font-bold text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-100 text-xs font-mono uppercase tracking-wider">
          <button
            id="auth-tab-login"
            onClick={() => { setActiveMode('login'); setError(''); }}
            className={`flex-1 py-4 font-bold border-b-2 transition-colors cursor-pointer ${
              activeMode === 'login' 
                ? 'border-[#788F76] text-[#788F76] bg-[#788F76]/5' 
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Sign In
          </button>
          <button
            id="auth-tab-signup"
            onClick={() => { setActiveMode('signup'); setError(''); }}
            className={`flex-1 py-4 font-bold border-b-2 transition-colors cursor-pointer ${
              activeMode === 'signup' 
                ? 'border-[#788F76] text-[#788F76] bg-[#788F76]/5' 
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Join / Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-left">
          
          {activeMode === 'signup' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="e.g. Sana Alvi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                  />
                </div>
              </div>

              {/* Secure Role Switcher for dev testing */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">
                  Account Type (Role) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="signup-role-customer"
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      role === 'customer'
                        ? 'bg-[#788F76] text-white border-[#788F76] shadow-xs'
                        : 'bg-[#FAF8F5] text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    Buyer (Customer)
                  </button>
                  <button
                    id="signup-role-admin"
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-[#FAF8F5] text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    Seller (Admin)
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="e.g. sana@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="auth-password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
              />
            </div>
          </div>

          {activeMode === 'signup' && (
            <>
              {/* WhatsApp Phone */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">
                  WhatsApp / Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="signup-phone"
                    type="tel"
                    placeholder="e.g. +92 312 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">
                  Delivery Address (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="signup-address"
                    type="text"
                    placeholder="Street number, sector, block, area..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">
                  City (Optional)
                </label>
                <select
                  id="signup-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 font-medium"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-[#788F76] text-white hover:bg-[#5E725C] disabled:bg-neutral-300 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer mt-3"
          >
            {loading ? 'Processing...' : activeMode === 'login' ? 'Sign In Securely' : 'Register Account'}
          </button>

          {/* Elegant Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <span className="absolute left-0 right-0 h-[1px] bg-neutral-200" />
            <span className="relative bg-white px-3 text-[10px] font-mono uppercase tracking-wider text-neutral-400">or</span>
          </div>

          {/* Google Auth Button */}
          <button
            id="google-auth-btn"
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full bg-white text-neutral-700 hover:bg-neutral-50 disabled:bg-neutral-100 border border-neutral-200 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer text-xs"
          >
            <Chrome className="w-4 h-4 text-neutral-500" />
            <span>Continue with Google</span>
          </button>

          <p className="text-[10px] text-neutral-400 font-mono text-center tracking-wide mt-2">
            * Google Sign-In is secure &amp; available for buyer accounts.
          </p>
        </form>
      </div>
    </div>
  );
}
