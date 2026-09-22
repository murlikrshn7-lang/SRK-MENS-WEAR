import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Kurta Sets',
    price: '',
    mrp: '',
    stock: '10',
    sizes: 'M, L, XL',
    image: '',
  });

  useEffect(() => {
    fetchData();

    const orderSub = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(orderSub);
    };
  }, []);

  async function fetchData() {
    const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: pData } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (oData) setOrders(oData);
    if (pData) setProducts(pData);
  }

  // Handle direct file upload from phone or computer
  async function handleImageUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `product-photos/${fileName}`;

      // Upload file to Supabase Storage 'products' bucket
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL of the uploaded image
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setNewProduct((prev) => ({ ...prev, image: data.publicUrl }));
    } catch (error) {
      alert('Image upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert('Please select an image and enter a title and price.');
      return;
    }

    const sizesArray = newProduct.sizes.split(',').map((s) => s.trim()).filter(Boolean);

    const { error } = await supabase.from('products').insert([
      {
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        mrp: Number(newProduct.mrp || newProduct.price),
        stock: Number(newProduct.stock || 10),
        sizes: sizesArray.length > 0 ? sizesArray : ['M', 'L', 'XL'],
        image: newProduct.image,
      },
    ]);

    if (error) {
      alert('Failed to add product: ' + error.message);
    } else {
      alert('Product successfully added!');
      setNewProduct({ name: '', category: 'Kurta Sets', price: '', mrp: '', stock: '10', sizes: 'M, L, XL', image: '' });
      fetchData();
    }
  }

  async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-2xl font-black text-amber-400">SKR Store Admin Portal</h1>
          <p className="text-xs text-slate-400">Keesara Branch Operations & Inventory Control</p>
        </div>
        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
          PhonePe Merchant: 6302347068-3@ybl
        </span>
      </div>

      {/* Mobile-Friendly Add Product Form */}
      <div className="bg-slate-900 border border-amber-500/30 p-5 md:p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <span>📸</span> Add New Product
        </h2>

        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Mobile Photo Upload Input */}
          <div className="md:col-span-3 bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
            <label className="text-amber-400 font-bold block">1. Select Product Photo (Tap below)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-slate-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
            />
            {uploading && <p className="text-amber-400 text-xs animate-pulse">Uploading photo from phone...</p>}
            {newProduct.image && (
              <div className="flex items-center gap-3 pt-2">
                <img src={newProduct.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-amber-400/50" />
                <span className="text-emerald-400 font-bold text-xs">✓ Photo uploaded & ready</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Green Plaid Casual Shirt"
              required
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Category</label>
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Shirts">Shirts</option>
              <option value="Kurta Sets">Kurta Sets</option>
              <option value="Sherwanis">Sherwanis</option>
              <option value="Nehru Jackets">Nehru Jackets</option>
              <option value="Bandhgalas">Bandhgalas</option>
              <option value="Kurtas">Kurtas</option>
              <option value="Suits & Tuxedos">Suits & Tuxedos</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Selling Price (₹)</label>
            <input
              type="number"
              placeholder="1299"
              required
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">MRP / Original Price (₹)</label>
            <input
              type="number"
              placeholder="2499"
              value={newProduct.mrp}
              onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Stock Quantity</label>
            <input
              type="number"
              placeholder="10"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Sizes (comma separated)</label>
            <input
              type="text"
              placeholder="M, L, XL"
              value={newProduct.sizes}
              onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition uppercase tracking-wider text-sm"
            >
              {uploading ? 'Uploading Photo...' : 'Publish Item to Store'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Orders Section */}
      <div>
        <h2 className="font-bold text-lg text-white mb-3">Live Customer Orders ({orders.length})</h2>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs flex justify-between items-center">
              <div>
                <p className="font-extrabold text-amber-400 text-sm">{order.id} — ₹{order.total_amount}</p>
                <p className="text-slate-200 font-bold mt-1">{order.customer_name} (📞 {order.customer_phone})</p>
                <p className="text-slate-400">📍 {order.customer_address}</p>
                <p className="text-slate-500 text-[10px] mt-1">Payment Method: {order.payment_method || 'PhonePe UPI'}</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Products Listing */}
      <div>
        <h2 className="font-bold text-lg text-white mb-3">Active Inventory ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs gap-3">
              <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-200 truncate">{p.name}</p>
                <p className="text-amber-400 font-extrabold">₹{p.price} <span className="text-slate-500 line-through">₹{p.mrp}</span></p>
                <p className="text-slate-400 text-[10px]">Stock: {p.stock}</p>
              </div>
              <button
                onClick={() => deleteProduct(p.id)}
                className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}