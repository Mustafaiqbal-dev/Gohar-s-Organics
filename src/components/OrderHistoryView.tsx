import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, RefreshCw, ShoppingBag, Eye, Heart, MapPin } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryViewProps {
  token: string | null;
  currentUser: any;
  setActiveTab: (tab: string) => void;
}

export default function OrderHistoryView({ token, currentUser, setActiveTab }: OrderHistoryViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Could not retrieve order history.');
      }
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Server connection issue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getTrackingStep = (status: string) => {
    switch (status) {
      case 'delivered': return 5;
      case 'shipped': return 4;
      case 'processing': return 2;
      default: return 1;
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-[#788F76]/10 rounded-full flex items-center justify-center text-[#788F76] mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif text-[#2D332D] font-bold">Please Sign In to View Order History</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Create an account or login to view your historic purchases, track active Leopard/TCS shipping logs, and manage profile settings.
        </p>
        <button
          onClick={() => {
            const btn = document.getElementById('sign-in-prompt-btn');
            if (btn) btn.click();
          }}
          className="bg-[#788F76] text-white hover:bg-[#5E725C] font-semibold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#788F76] font-bold">Customer Portal</span>
          <h1 className="text-3xl font-serif text-[#2D332D] font-bold">My Order History</h1>
          <p className="text-xs text-neutral-500 mt-1">Hello, {currentUser.name}! Here are your past botanical skincare orders.</p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="bg-white border border-neutral-200 text-[#5A635A] hover:bg-neutral-50 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#788F76] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-neutral-400">Loading your purchase records...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl text-xs font-medium text-center">
          ⚠️ {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-neutral-100 shadow-xs text-center space-y-5">
          <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400 mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-neutral-700">No Orders Placed Yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            You have not placed any Cash on Delivery orders yet. Explore our fresh, handcrafted products!
          </p>
          <button
            onClick={() => setActiveTab('shop')}
            className="bg-[#788F76] text-white hover:bg-[#5E725C] font-semibold px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            Go Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const currentStep = getTrackingStep(order.status);
            
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-hidden transition-all duration-300"
              >
                {/* Order Summary Line */}
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-50/50">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 font-bold block">ORDER REFERENCE ID</span>
                    <strong className="text-neutral-800 font-bold font-mono text-sm uppercase">{order.id}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 font-bold block">DATE PLACED</span>
                    <span className="text-xs font-medium text-neutral-700">{order.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 font-bold block">TOTAL VALUE</span>
                    <span className="text-xs font-bold text-[#788F76]">₨ {order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase border ${getStatusColorClass(order.status)}`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="text-neutral-500 hover:text-[#788F76] transition-colors p-1 rounded-lg border border-neutral-200/60 hover:border-[#788F76] bg-white text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide' : 'Details'}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-6 border-t border-neutral-100 space-y-6 animate-fadeIn bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: Product List */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-neutral-500">Purchased Items</h4>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                          {order.items.map((item) => (
                            <div key={item.product.id} className="flex gap-3 text-xs border-b border-neutral-50 pb-2">
                              <div className="w-10 h-10 rounded overflow-hidden bg-neutral-100 shrink-0">
                                <img src={item.product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex-1">
                                <strong className="block text-neutral-800">{item.product.name}</strong>
                                <span className="text-neutral-400 font-mono text-[10px]">{item.quantity}x • ₨ {item.product.price.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Shipping details */}
                      <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-neutral-100 text-xs">
                        <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-[#788F76]">Shipping Information</h4>
                        <div className="space-y-1.5 text-neutral-600">
                          <p><strong className="text-neutral-700">Recipient Name:</strong> {order.name}</p>
                          <p><strong className="text-neutral-700">Contact Number:</strong> {order.phone}</p>
                          <p><strong className="text-neutral-700">Full Destination Address:</strong> {order.address}, {order.city}, Pakistan 🇵🇰</p>
                          <p><strong className="text-neutral-700">Payment Status:</strong> Pending Cash on Delivery (COD)</p>
                        </div>
                      </div>

                    </div>

                    {/* Leopard Stepper */}
                    <div className="border-t border-neutral-100 pt-6 mt-4 space-y-4 text-left">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#788F76] font-bold">SHIPMENT TRACKING LOGS</span>
                        <h4 className="font-sans text-sm font-bold text-neutral-800">Leopard Express Real-Time Carrier Details</h4>
                      </div>

                      <div className="relative flex flex-col md:flex-row justify-between items-stretch md:items-center gap-5 md:gap-2 pl-3 md:pl-0 pt-2">
                        {/* Connecting line */}
                        <div className="absolute left-3 md:left-0 top-0 bottom-0 md:top-3 md:bottom-auto w-[2px] md:w-full h-full md:h-[2px] bg-neutral-200 md:-translate-y-1/2 -z-0" />
                        
                        {[
                          { step: 1, label: 'Order Placed', desc: 'Handcrafted weekly in small batches', done: currentStep >= 1 },
                          { step: 2, label: 'Assured', desc: 'Dermatologist formulation verification', done: currentStep >= 2 },
                          { step: 3, label: 'Dispatched', desc: 'Dispatched via Leopards Karachi Hub', done: currentStep >= 4 }, // shipped
                          { step: 4, label: 'In Transit', desc: `En-route to ${order.city} center`, done: currentStep >= 4 },
                          { step: 5, label: 'Delivered', desc: 'Signed successfully by recipient', done: currentStep >= 5 }
                        ].map((m) => (
                          <div key={m.step} className="relative z-10 flex md:flex-col items-start md:items-center gap-3 md:gap-2 md:flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                              m.done
                                ? 'bg-[#788F76] border-[#788F76] text-white'
                                : 'bg-white border-neutral-200 text-neutral-400'
                            }`}>
                              {m.done ? '✓' : m.step}
                            </div>
                            <div className="space-y-0.5 md:text-center text-left">
                              <h5 className={`font-bold text-[11px] ${m.done ? 'text-neutral-800' : 'text-neutral-400'}`}>{m.label}</h5>
                              <p className="text-[9px] text-neutral-400 max-w-[130px] leading-tight mt-0.5">{m.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
