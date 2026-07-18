import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Users, Package, RefreshCw, Check, Edit2, Trash2, Plus, X, Save } from 'lucide-react';
import { Product, Order } from '../types';
import { PAKISTAN_CITIES } from '../data';

interface AdminDashboardViewProps {
  token: string | null;
  currentUser: any;
  onProductsUpdated: () => void;
}

export default function AdminDashboardView({ token, currentUser, onProductsUpdated }: AdminDashboardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Product Form states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [prodId, setProdId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodTagline, setProdTagline] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState<'serum' | 'soap' | 'hair' | 'gifts'>('serum');
  const [prodPrice, setProdPrice] = useState(1000);
  const [prodOriginalPrice, setProdOriginalPrice] = useState(1500);
  const [prodImage, setProdImage] = useState('/src/assets/images/hydra_glow_serum_1782659375871.jpg');
  const [prodSkinType, setProdSkinType] = useState('All Skin Types');
  const [prodConcern, setProdConcern] = useState('Glow & Texture');
  const [prodDetails, setProdDetails] = useState('');
  const [prodUsage, setProdUsage] = useState('');
  const [prodIngredients, setProdIngredients] = useState('');
  const [prodStock, setProdStock] = useState(25);
  const [prodBadge, setProdBadge] = useState('');

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      // Fetch Orders
      const ordRes = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!ordRes.ok) throw new Error('Could not fetch store orders.');
      const ordData = await ordRes.json();
      setOrders(ordData);

      // Fetch Products
      const prodRes = await fetch('/api/products');
      if (!prodRes.ok) throw new Error('Could not fetch store products.');
      const prodData = await prodRes.json();
      setProducts(prodData);
    } catch (err: any) {
      setError(err.message || 'Error pulling administrator telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        throw new Error('Failed to update status.');
      }
      setSuccess('Order status updated successfully.');
      setTimeout(() => setSuccess(''), 2500);
      fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Status update issue.');
    }
  };

  // Open product creator or editor
  const openProductForm = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProdId(product.id);
      setProdName(product.name);
      setProdTagline(product.tagline || '');
      setProdDesc(product.description);
      setProdCategory(product.category);
      setProdPrice(product.price);
      setProdOriginalPrice(product.originalPrice || 0);
      setProdImage(product.image);
      setProdSkinType(product.skinType || 'All Skin Types');
      setProdConcern(product.concern || 'Glow & Texture');
      setProdDetails(product.details ? product.details.join('\n') : '');
      setProdUsage(product.usage || '');
      setProdIngredients(product.ingredients || '');
      setProdStock(product.stock || 0);
      setProdBadge(product.badge || '');
    } else {
      setEditingProduct(null);
      setProdId('prod_' + Math.floor(1000 + Math.random() * 9000));
      setProdName('');
      setProdTagline('');
      setProdDesc('');
      setProdCategory('serum');
      setProdPrice(1000);
      setProdOriginalPrice(1500);
      setProdImage('/src/assets/images/hydra_glow_serum_1782659375871.jpg');
      setProdSkinType('All Skin Types');
      setProdConcern('Glow & Texture');
      setProdDetails('Deeply cleanses pores\nBrightens skin texture\nOrganic & vegan');
      setProdUsage('Apply onto damp face, lather, and rinse.');
      setProdIngredients('Pure Aloe Vera extract, Essential Oils.');
      setProdStock(30);
      setProdBadge('New Arrival');
    }
    setIsProductModalOpen(true);
  };

  // Save product (create or edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const detailsArr = prodDetails.split('\n').filter(line => line.trim() !== '');
    
    const payload: Product = {
      id: prodId,
      name: prodName,
      tagline: prodTagline || undefined,
      description: prodDesc,
      category: prodCategory,
      price: prodPrice,
      originalPrice: prodOriginalPrice > 0 ? prodOriginalPrice : undefined,
      image: prodImage,
      rating: editingProduct ? editingProduct.rating : 5,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      isFeatured: editingProduct ? editingProduct.isFeatured : false,
      skinType: prodSkinType || undefined,
      concern: prodConcern || undefined,
      details: detailsArr,
      usage: prodUsage,
      ingredients: prodIngredients,
      stock: prodStock,
      badge: prodBadge || undefined
    };

    try {
      const endpoint = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to preserve product state.');
      }

      setSuccess(editingProduct ? 'Product details updated successfully.' : 'New product created successfully.');
      setIsProductModalOpen(false);
      setTimeout(() => setSuccess(''), 2500);
      fetchDashboardData();
      onProductsUpdated(); // Refresh App state list
    } catch (err: any) {
      setError(err.message || 'Catalog saving error.');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product from the database?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Could not delete product.');
      
      setSuccess('Product deleted successfully.');
      setTimeout(() => setSuccess(''), 2500);
      fetchDashboardData();
      onProductsUpdated();
    } catch (err: any) {
      setError(err.message || 'Catalog removal issue.');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4 animate-fadeIn">
        <h2 className="text-2xl font-serif text-red-600 font-bold">Access Denied</h2>
        <p className="text-xs text-neutral-500">
          This portal is reserved strictly for Gohar's Organics administrators. Please sign in with an Administrator profile to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-8 animate-fadeIn text-left">
      {/* Header Summary Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-600 font-bold">Seller Administration Control Panel</span>
          <h1 className="text-3xl font-serif text-[#2D332D] font-bold">Management Dashboard</h1>
          <p className="text-xs text-neutral-500 mt-1">Configure your organic pharmacy, review shipments, and inspect Pakistan-wide clients.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="bg-white border border-neutral-200 text-[#5A635A] hover:bg-neutral-50 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Stats</span>
          </button>
          
          <button
            onClick={() => openProductForm(null)}
            className="bg-[#788F76] text-white hover:bg-[#5E725C] font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Analytics Widgets row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-neutral-100/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-[#788F76]/10 text-[#788F76] rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-mono font-bold block">TOTAL STORE ORDERS</span>
            <strong className="text-2xl font-bold text-neutral-800">{orders.length}</strong>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-3xl border border-neutral-100/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-mono font-bold block">PRODUCTS IN CATALOG</span>
            <strong className="text-2xl font-bold text-neutral-800">{products.length}</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-100/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-mono font-bold block">REVENUE ESTIMATE (COD)</span>
            <strong className="text-2xl font-bold text-neutral-800">
              ₨ {orders.reduce((sum, o) => sum + (o.status === 'delivered' ? o.total : 0), 0).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl text-xs font-medium text-center">⚠️ {error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-4 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> {success}</div>}

      {/* Sub Tabs Selection */}
      <div className="flex border-b border-neutral-100 text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-6 py-4 font-bold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'orders' ? 'border-[#788F76] text-[#788F76] bg-[#788F76]/5' : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          Customer Orders Log ({orders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-6 py-4 font-bold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'products' ? 'border-[#788F76] text-[#788F76] bg-[#788F76]/5' : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          Manage Store Catalog ({products.length})
        </button>
      </div>

      {/* Table layouts */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#788F76] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-neutral-400">Loading admin operations records...</p>
        </div>
      ) : activeSubTab === 'orders' ? (
        /* ORDERS LOG PANEL */
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 font-mono">No customer orders have been logged yet.</div>
          ) : (
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-[#FAF8F5] text-neutral-400 font-mono font-bold uppercase border-b border-neutral-100 text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Purchased Products</th>
                  <th className="p-4">Grand Total (COD)</th>
                  <th className="p-4">Status & Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-neutral-800 text-[13px] uppercase">{order.id}</td>
                    <td className="p-4 space-y-1">
                      <strong className="block text-neutral-800 text-sm">{order.name}</strong>
                      <span className="block text-[10px] text-neutral-400 font-mono">{order.email || 'No Email Provided'}</span>
                      <span className="block font-medium text-[#788F76]">{order.phone}</span>
                      <span className="block text-neutral-500 text-[11px] leading-relaxed max-w-[200px]">{order.address}, {order.city}</span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 max-h-[120px] overflow-y-auto pr-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-4 py-0.5 border-b border-neutral-50/40 text-[11px]">
                            <span className="text-neutral-700">{item.quantity}x {item.product.name}</span>
                            <span className="font-mono text-neutral-400">₨ {item.product.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[#788F76] text-sm">₨ {order.total.toLocaleString()}</td>
                    <td className="p-4">
                      <select
                        id={`admin-status-select-${order.id}`}
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`w-32 bg-[#FAF8F5] border border-neutral-200 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#788F76] font-bold font-mono uppercase ${
                          order.status === 'delivered' ? 'text-emerald-700 border-emerald-300 bg-emerald-50' :
                          order.status === 'shipped' ? 'text-blue-700 border-blue-300 bg-blue-50' :
                          order.status === 'processing' ? 'text-amber-700 border-amber-300 bg-amber-50' : 'text-neutral-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* PRODUCTS MANAGER CATALOG PANEL */
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-x-auto">
          {products.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 font-mono">Store catalog is empty.</div>
          ) : (
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-[#FAF8F5] text-neutral-400 font-mono font-bold uppercase border-b border-neutral-100 text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Product Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Discount</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden bg-neutral-100 shrink-0 border border-neutral-100">
                        <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-0.5">
                        <strong className="block text-neutral-800 text-sm">{p.name}</strong>
                        <span className="block text-[10px] font-mono text-neutral-400 uppercase">{p.id}</span>
                        {p.badge && <span className="inline-block text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{p.badge}</span>}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-neutral-500 uppercase">{p.category}</td>
                    <td className="p-4 space-y-0.5">
                      <span className="block font-bold text-[#788F76] text-sm">₨ {p.price.toLocaleString()}</span>
                      {p.originalPrice && <span className="block text-[10px] text-neutral-400 line-through">₨ {p.originalPrice.toLocaleString()}</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                        p.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-[#788F76]/10 text-[#788F76]'
                      }`}>
                        {p.stock} Units left
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          id={`edit-prod-${p.id}`}
                          onClick={() => openProductForm(p)}
                          className="p-2 border border-neutral-200 hover:border-[#788F76] text-neutral-500 hover:text-[#788F76] bg-white hover:bg-[#788F76]/5 rounded-lg transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-prod-${p.id}`}
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 border border-neutral-200 hover:border-red-500 text-neutral-500 hover:text-red-500 bg-white hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PRODUCT CREATION/EDITION MODAL DIALOG */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Backdrop */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsProductModalOpen(false)} />
          
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp text-left border border-neutral-100">
            {/* Header */}
            <div className="bg-[#788F76] text-white p-6 relative flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-bold tracking-wide uppercase">
                  {editingProduct ? 'Edit Product Details' : 'Introduce New Botanical Product'}
                </h3>
                <p className="text-[10px] text-neutral-100 uppercase tracking-widest font-mono mt-0.5">Catalog Admin Control</p>
              </div>
              <button
                id="close-prod-modal-btn"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 bg-white/15 hover:bg-white/25 rounded-full text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              
              {/* Product ID (Disabled if editing) */}
              <div className="col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Product Unique ID *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingProduct}
                  placeholder="e.g. skin-brightening-cream"
                  value={prodId}
                  onChange={(e) => setProdId(e.target.value.toLowerCase().trim().replace(/ /g, '-'))}
                  className="w-full bg-[#FAF8F5] disabled:bg-neutral-100 border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 font-mono font-bold"
                />
              </div>

              {/* Product Name */}
              <div className="col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saffron Glow Cream"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 font-medium"
                />
              </div>

              {/* Tagline */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Tagline / Key Promo Accents</label>
                <input
                  type="text"
                  placeholder="e.g. 100% Organic Saffron & Almond Extract ✨ 20% Discount"
                  value={prodTagline}
                  onChange={(e) => setProdTagline(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide precise details of product value, natural compounds, etc."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 leading-relaxed"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Category *</label>
                <select
                  value={prodCategory}
                  onChange={(e: any) => setProdCategory(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 font-medium"
                >
                  <option value="serum">Serum</option>
                  <option value="soap">Soap</option>
                  <option value="hair">Hair Care</option>
                  <option value="gifts">Gifts & Packets</option>
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Units Stock Level *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={prodStock}
                  onChange={(e) => setProdStock(parseInt(e.target.value, 10))}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 font-mono"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Price in PKR (₨) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={prodPrice}
                  onChange={(e) => setProdPrice(parseFloat(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 font-mono font-bold"
                />
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Original Price (For showing discount)</label>
                <input
                  type="number"
                  min={0}
                  value={prodOriginalPrice}
                  onChange={(e) => setProdOriginalPrice(parseFloat(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 font-mono"
                />
              </div>

              {/* Image Path */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Product Image URL / Relative Path *</label>
                <input
                  type="text"
                  required
                  placeholder="/src/assets/images/hydra_glow_serum_1782659375871.jpg"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 font-mono"
                />
              </div>

              {/* Skin Type */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Target Skin Type</label>
                <input
                  type="text"
                  placeholder="e.g. Oily & Sensitive"
                  value={prodSkinType}
                  onChange={(e) => setProdSkinType(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                />
              </div>

              {/* Concern */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Target Skin Concern</label>
                <input
                  type="text"
                  placeholder="e.g. Hyperpigmentation & Dark Spots"
                  value={prodConcern}
                  onChange={(e) => setProdConcern(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                />
              </div>

              {/* Product Details (Bullet points) */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Core Bullet Details (One item per line) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Fades acne scars&#10;Repairs skin lipid barrier&#10;Gives 24-hour hydration"
                  value={prodDetails}
                  onChange={(e) => setProdDetails(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 leading-relaxed font-mono"
                />
              </div>

              {/* Usage Instructions */}
              <div className="col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Usage Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Apply 3 drops onto clean dry face..."
                  value={prodUsage}
                  onChange={(e) => setProdUsage(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 leading-normal"
                />
              </div>

              {/* Ingredients List */}
              <div className="col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">Active Ingredients</label>
                <textarea
                  rows={2}
                  placeholder="Pure Saffron water, Honey extract, Niacinamide (3%)..."
                  value={prodIngredients}
                  onChange={(e) => setProdIngredients(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800 leading-normal"
                />
              </div>

              {/* Badge */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono font-mono">Aesthetic Badge (e.g. Best Seller, Pure Glow)</label>
                <input
                  type="text"
                  placeholder="e.g. Best Seller"
                  value={prodBadge}
                  onChange={(e) => setProdBadge(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#788F76] text-neutral-800"
                />
              </div>

              {/* Footer Save Controls */}
              <div className="col-span-2 border-t border-neutral-100 pt-5 flex justify-end gap-3 mt-2">
                <button
                  id="cancel-prod-save-btn"
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 px-5 py-2.5 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-prod-save-btn"
                  type="submit"
                  className="bg-[#788F76] text-white hover:bg-[#5E725C] px-6 py-2.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Preserve Catalog State</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
