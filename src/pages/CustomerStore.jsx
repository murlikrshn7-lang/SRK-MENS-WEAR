import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function CustomerStore() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('details'); // 'details' | 'payment' | 'success'
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [activeOrderId, setActiveOrderId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  const categories = [
    { name: 'Kurta Sets', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200' },
    { name: 'Sherwanis', img: 'https://images.unsplash.com/photo-1597983073493-88cd35cf03b0?w=200' },
    { name: 'Nehru Jackets', img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=200' },
    { name: 'Bandhgalas', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200' },
    { name: 'Kurtas', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200' },
    { name: 'Shirts', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200' },
    { name: 'Suits & Tuxedos', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) {
      setProducts(data);
      setFilteredProducts(data);
    }
  }

  function handleCategoryFilter(catName) {
    setSelectedCategory(catName);
    if (catName === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === catName || p.name.toLowerCase().includes(catName.toLowerCase())));
    }
  }

  function addToCart(product, size) {
    const existingIndex = cart.findIndex((i) => i.id === product.id && i.selectedSize === size);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { ...product, selectedSize: size, quantity: 1 }]);
    }
    setShowCartModal(true);
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalSavings = cart.reduce((sum, item) => sum + ((item.mrp - item.price) * item.quantity), 0);

  function startCheckout(e) {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert('Please fill out all address details.');
      return;
    }
    const orderId = 'SKR-' + Math.floor(100000 + Math.random() * 900000);
    setActiveOrderId(orderId);
    setCheckoutStep('payment');
  }

  async function finalizePayment() {
    const { error } = await supabase.from('orders').insert([
      {
        id: activeOrderId,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        items: cart,
        total_amount: totalAmount,
        status: 'Paid (Pending Admin Verification)',
        payment_method: 'PhonePe UPI (6302347068-3@ybl)',
      },
    ]);

    if (error) {
      alert('Error recording order: ' + error.message);
    } else {
      setCart([]);
      setCheckoutStep('success');
    }
  }

  const upiPayUrl = `upi://pay?pa=6302347068-3@ybl&pn=SKR%20Mens%20Wear&am=${totalAmount}&cu=INR&tn=Order%20${activeOrderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayUrl)}`;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e5e5e5] font-serif selection:bg-amber-500 selection:text-black">
      
      {/* Top Banner Notice */}
      <div className="bg-[#171717] text-[#a3a3a3] text-[11px] uppercase tracking-[0.2em] py-2 text-center border-b border-[#262626]">
        Keesara Luxury Flagship Store — Free Express Delivery Across India
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-[#262626] px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-[0.25em] text-[#d4af37]">SKR LUXURY</h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#737373]">Men's Couture — Keesara</p>
        </div>

        <nav className="hidden lg:flex gap-6 text-xs uppercase tracking-[0.15em] text-[#a3a3a3]">
          <button onClick={() => handleCategoryFilter('All')} className={selectedCategory === 'All' ? 'text-[#d4af37] font-bold border-b border-[#d4af37] pb-1' : 'hover:text-[#d4af37]'}>New Arrivals</button>
          {categories.slice(0, 5).map(cat => (
            <button key={cat.name} onClick={() => handleCategoryFilter(cat.name)} className={selectedCategory === cat.name ? 'text-[#d4af37] font-bold border-b border-[#d4af37] pb-1' : 'hover:text-[#d4af37]'}>
              {cat.name}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setShowCartModal(true)}
          className="relative bg-[#171717] hover:bg-[#262626] border border-[#d4af37]/40 text-[#d4af37] px-4 py-2 rounded-full text-xs uppercase tracking-widest transition flex items-center gap-2"
        >
          <span>Bag</span>
          <span className="bg-[#d4af37] text-black font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
        </button>
      </header>

      {/* Hero Banner Section */}
      <section className="relative bg-[#17171d] border-b border-[#262626] overflow-hidden my-4 mx-4 rounded-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 items-center min-h-[380px]">
          <div className="p-8 md:p-12 md:col-span-6 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-sans font-semibold">Festive & Wedding Collection 2026</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-wide text-white leading-tight">
              ROYAL HERITAGE <br /><span className="text-[#d4af37] font-serif italic">Fiza Collection</span>
            </h2>
            <p className="text-xs text-[#a3a3a3] font-sans leading-relaxed max-w-md">
              Handcrafted bandhgalas, silk kurtas, and tailored indowestern ensembles designed for royalty.
            </p>
            <button 
              onClick={() => handleCategoryFilter('All')}
              className="mt-4 bg-[#d4af37] hover:bg-[#b89628] text-black font-sans font-bold text-xs uppercase tracking-[0.2em] px-8 py-3 rounded-full transition"
            >
              Explore Collection
            </button>
          </div>
          <div className="md:col-span-6 h-full flex justify-end">
            <img 
              src="https://images.unsplash.com/photo-1597983073493-88cd35cf03b0?w=1000" 
              alt="Hero Banner" 
              className="h-[380px] w-full object-cover rounded-r-3xl opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Shop By Category Circle Avatars */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h3 className="text-center font-serif text-lg tracking-[0.2em] uppercase text-white mb-6">Shop By Category</h3>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none justify-start md:justify-center">
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              onClick={() => handleCategoryFilter(cat.name)}
              className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
            >
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 p-1 transition duration-300 ${selectedCategory === cat.name ? 'border-[#d4af37] scale-105' : 'border-[#333333] group-hover:border-[#d4af37]'}`}>
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-500" />
              </div>
              <span className="text-[11px] font-sans tracking-wider uppercase text-[#a3a3a3] group-hover:text-white transition">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Product Grid Catalog */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8 border-b border-[#262626] pb-4">
          <h3 className="text-xl font-light uppercase tracking-[0.15em] text-white">
            {selectedCategory === 'All' ? 'Curated Designs' : selectedCategory}
          </h3>
          <span className="text-xs font-sans text-[#737373]">{filteredProducts.length} Designs Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((p) => {
            const discountPercent = Math.round(((p.mrp - p.price) / p.mrp) * 100);
            return (
              <div key={p.id} className="bg-[#121212] border border-[#222222] rounded-2xl overflow-hidden hover:border-[#d4af37]/50 transition duration-300 flex flex-col justify-between group">
                <div className="relative overflow-hidden bg-[#1a1a1a]">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1597983073493-88cd35cf03b0?w=500'; }}
                  />
                  {discountPercent > 0 && (
                    <span className="absolute top-3 left-3 bg-[#171717]/90 text-[#10b981] font-sans font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#10b981]/30">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3 font-sans">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#737373]">{p.category || 'SKR Exclusive'}</span>
                    <h4 className="font-serif text-sm text-white truncate mt-0.5">{p.name}</h4>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-amber-400 font-extrabold text-base">₹{p.price?.toLocaleString('en-IN')}</span>
                    {p.mrp > p.price && (
                      <span className="text-[#666666] line-through text-xs">₹{p.mrp?.toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  {/* Size Selector Buttons */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#a3a3a3]">Select Size & Add:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.sizes?.map((size) => (
                        <button
                          key={size}
                          onClick={() => addToCart(p, size)}
                          className="bg-[#1d1d1d] hover:bg-[#d4af37] hover:text-black border border-[#333333] text-[#d4af37] text-[11px] font-bold px-2.5 py-1 rounded-md transition"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cart & PhonePe Payment Slideout Drawer / Modal */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#121212] border-l border-[#262626] h-full p-6 flex flex-col justify-between overflow-y-auto font-sans">
            
            <div>
              <div className="flex justify-between items-center border-b border-[#262626] pb-4">
                <h3 className="font-serif text-lg text-[#d4af37] tracking-wider uppercase">Shopping Bag</h3>
                <button onClick={() => { setShowCartModal(false); setCheckoutStep('details'); }} className="text-[#a3a3a3] hover:text-white text-lg">✕</button>
              </div>

              {checkoutStep === 'details' && (
                <div className="space-y-6 mt-6">
                  {cart.length === 0 ? (
                    <p className="text-xs text-[#737373] text-center py-12">Your shopping bag is currently empty.</p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl border border-[#262626] text-xs">
                            <div>
                              <p className="font-serif font-bold text-white">{item.name}</p>
                              <p className="text-[#a3a3a3] text-[10px]">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#d4af37] font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                              <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-400 text-[10px] hover:underline">Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#1a1a1a] p-4 rounded-xl space-y-1.5 text-xs border border-[#262626]">
                        <div className="flex justify-between text-[#a3a3a3]">
                          <span>Subtotal:</span>
                          <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        {totalSavings > 0 && (
                          <div className="flex justify-between text-[#10b981]">
                            <span>Bag Discount:</span>
                            <span>- ₹{totalSavings.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-white text-sm border-t border-[#333333] pt-2 mt-2">
                          <span>Total Amount:</span>
                          <span className="text-[#d4af37]">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <form onSubmit={startCheckout} className="space-y-3 pt-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#d4af37]">Shipping Address</p>
                        <input
                          type="text"
                          placeholder="Full Name"
                          required
                          value={customer.name}
                          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                          className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number (WhatsApp)"
                          required
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                        />
                        <textarea
                          placeholder="Full Delivery Address with Pincode"
                          required
                          rows="3"
                          value={customer.address}
                          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                          className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                        />
                        <button
                          type="submit"
                          className="w-full bg-[#d4af37] hover:bg-[#b89628] text-black font-bold uppercase tracking-widest text-xs py-3 rounded-xl transition mt-2"
                        >
                          Proceed to Payment (₹{totalAmount.toLocaleString('en-IN')})
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* PhonePe UPI Payment Screen */}
              {checkoutStep === 'payment' && (
                <div className="space-y-6 mt-6 text-center">
                  <div className="bg-[#1a1a1a] border border-[#d4af37]/40 p-4 rounded-2xl space-y-3">
                    <span className="bg-[#5f259f] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      PhonePe UPI Integrated
                    </span>
                    <p className="text-xs text-[#a3a3a3]">Scan QR code with PhonePe, Google Pay, or Paytm:</p>
                    
                    <div className="flex justify-center p-2 bg-white rounded-xl max-w-[200px] mx-auto">
                      <img src={qrCodeUrl} alt="PhonePe QR Code" className="w-44 h-44" />
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-[#a3a3a3]">UPI ID: <span className="text-amber-400 font-mono font-bold select-all">6302347068-3@ybl</span></p>
                      <p className="text-white font-extrabold text-sm">Amount: ₹{totalAmount.toLocaleString('en-IN')}</p>
                    </div>

                    <a 
                      href={upiPayUrl} 
                      className="block w-full bg-[#5f259f] hover:bg-[#4a1c7f] text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition"
                    >
                      Open PhonePe App Directly
                    </a>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={finalizePayment}
                      className="w-full bg-[#10b981] hover:bg-[#059669] text-black font-bold uppercase tracking-widest text-xs py-3 rounded-xl transition"
                    >
                      I Have Completed Payment
                    </button>
                    <button
                      onClick={() => setCheckoutStep('details')}
                      className="text-xs text-[#737373] hover:text-white"
                    >
                      ← Back to Address Details
                    </button>
                  </div>
                </div>
              )}

              {/* Order Success Screen */}
              {checkoutStep === 'success' && (
                <div className="space-y-6 mt-12 text-center">
                  <div className="text-5xl">👑</div>
                  <h4 className="font-serif text-xl text-[#d4af37]">Order Confirmed!</h4>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Thank you, <span className="text-white font-bold">{customer.name}</span>. Your order <span className="text-amber-400 font-mono">{activeOrderId}</span> has been transmitted to our Keesara store team.
                  </p>
                  <button
                    onClick={() => {
                      setCheckoutStep('details');
                      setShowCartModal(false);
                    }}
                    className="bg-[#d4af37] text-black font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-xl"
                  >
                    Continue Browsing
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}