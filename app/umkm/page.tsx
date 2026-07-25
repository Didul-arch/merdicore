"use client";

import { useState, FormEvent } from 'react';
import { Star, Eye, ShoppingBag, Search, Filter, Phone, Tag, Building, User, PlusCircle, CheckCircle, ArrowRight, X } from 'lucide-react';
import { PRODUCTS_DATA } from '@/lib/data';
import { ProductItem } from '@/lib/types';

export default function UmkmPage() {
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<string>('default');
  
  // Modal for detail view
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  
  // Registration Form state
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    seller: '',
    price: '',
    phone: '',
    category: 'Kuliner' as ProductItem['category'],
    description: '',
    imageOption: 'kerajinan' // Predefined high quality photos for new merchants
  });

  const categories = ['Semua', 'Kuliner', 'Kerajinan', 'Pertanian', 'Madu & Herbal'];

  const imagePresets = {
    kerajinan: 'https://images.unsplash.com/photo-1595475242261-2742edb41391?auto=format&fit=crop&w=800&q=80',
    kuliner: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80',
    madu: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    kopi: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
    pertanian: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    kue: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
  };

  // Handle registration submission
  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.seller || !newProduct.price || !newProduct.phone || !newProduct.description) {
      alert('Mohon lengkapi seluruh kolom formulir pendaftaran!');
      return;
    }

    const priceNum = parseInt(newProduct.price.replace(/[^0-9]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Mohon masukkan harga produk yang valid!');
      return;
    }

    // Format phone number to clean WhatsApp format (628...)
    let formattedPhone = newProduct.phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    const newlyCreated: ProductItem = {
      id: `prod-custom-${Date.now()}`,
      name: newProduct.name,
      seller: newProduct.seller,
      price: priceNum,
      rating: 5.0, // New items get default excellent rating
      image: imagePresets[newProduct.imageOption as keyof typeof imagePresets] || imagePresets.kuliner,
      phone: formattedPhone,
      category: newProduct.category,
      description: newProduct.description
    };

    setProducts([newlyCreated, ...products]);
    setFormSuccess(true);

    // Reset form after 3 seconds success banner
    setTimeout(() => {
      setShowRegisterForm(false);
      setFormSuccess(false);
      setNewProduct({
        name: '',
        seller: '',
        price: '',
        phone: '',
        category: 'Kuliner',
        description: '',
        imageOption: 'kerajinan'
      });
    }, 2500);
  };

  // Filter & Sort Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.seller.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating-desc') return b.rating - a.rating;
    return 0; // default sort (by order of entry)
  });

  // Handle WhatsApp Ordering
  const handleWhatsAppOrder = (product: ProductItem) => {
    const cleanPhone = product.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Halo *${product.seller}*,\nsaya melihat produk *${product.name}* (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}) di Portal UMKM Desa Pulung Merdiko dan tertarik untuk memesan.\n\nApakah stok masih tersedia?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Title & Promo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">PASAR EKONOMI LOKAL</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              Galeri UMKM Desa Pulung Merdiko
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
              Mendukung penuh perekonomian kerakyatan melalui digitalisasi promosi karya kreasi terbaik warga kami. Hubungi pedagang secara langsung via WhatsApp untuk pemesanan yang mudah dan terpercaya.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterForm(true)}
            className="flex-shrink-0 inline-flex items-center space-x-2.5 bg-teal-600 hover:bg-teal-500 text-white px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-teal-600/10 hover:scale-[1.01] transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-teal-100" />
            <span>Daftarkan UMKM Anda</span>
          </button>
        </div>

        {/* Search, Filter, & Sort Controls */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
          {/* Search bar */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama produk, toko, atau bahan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Category selection */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div className="flex items-center space-x-2 w-full lg:w-auto justify-start lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-gray-200 text-xs text-gray-600 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              <option value="default">Default Terbaru</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
              <option value="rating-desc">Rating Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Product Catalog Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-teal-500/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full group animate-in fade-in zoom-in-95 duration-200"
              >
                {/* Image & Category Overlay */}
                <div className="relative h-60 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-[1.03] transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category Badge overlay */}
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-teal-700 shadow-sm border border-gray-100">
                    {product.category}
                  </span>
                  {/* Price Tag overlay */}
                  <span className="absolute bottom-4 right-4 bg-slate-900 text-white px-3 py-1 rounded-xl text-xs font-extrabold shadow-md border border-slate-800">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                  </span>
                </div>

                {/* Content info */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center space-x-1 uppercase">
                        <Building className="w-3 h-3 text-teal-600/50 mr-0.5" />
                        <span>{product.seller}</span>
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-teal-600 transition-colors mt-0.5 leading-tight">
                        {product.name}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-lg text-xs font-bold flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 font-light line-clamp-3 leading-relaxed flex-grow">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="border border-teal-600 text-teal-700 hover:bg-teal-50/50 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                    <button
                      onClick={() => handleWhatsAppOrder(product)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 fill-emerald-100/20" />
                      <span>Pesan WA</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">Tidak Ada Produk Cocok</p>
            <p className="text-xs text-gray-500 mt-1">Coba sesuaikan pencarian atau gunakan kategori produk yang lain.</p>
          </div>
        )}

      </div>

      {/* 1. Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-12">
              {/* Product Image Cover */}
              <div className="sm:col-span-5 relative h-56 sm:h-auto bg-slate-50 p-2 flex items-center justify-center">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Product details */}
              <div className="sm:col-span-7 p-6 sm:p-8 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[9px] font-bold uppercase tracking-wider border border-teal-200/40">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-gray-950 mt-1 leading-tight">
                      {selectedProduct.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="h-0.5 w-12 bg-teal-600 rounded" />

                {/* Price Display */}
                <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-50/80">
                  <span className="block text-[10px] text-teal-700 font-bold uppercase tracking-widest leading-none">Harga Eceran Wajar:</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-teal-800 leading-none mt-1.5 block">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedProduct.price)}
                  </span>
                </div>

                {/* Seller & Contact */}
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-teal-600" />
                    <span><strong>Pemilik / Toko:</strong> {selectedProduct.seller}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span><strong>No. WhatsApp:</strong> +{selectedProduct.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span><strong>Rating Ulasan:</strong> {selectedProduct.rating.toFixed(1)} / 5.0 (Sangat Bagus)</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deskripsi Produk:</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-light">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Order trigger */}
                <div className="pt-3 border-t border-gray-50 flex gap-3">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="border border-gray-200 hover:bg-slate-50 text-gray-600 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex-1"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(selectedProduct)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-emerald-600/10 flex items-center justify-center space-x-2 flex-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 fill-emerald-100/20" />
                    <span>Hubungi & Pesan Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Register Merchant Modal Form */}
      {showRegisterForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => { if (!formSuccess) setShowRegisterForm(false); }} />
          
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {formSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border border-teal-100">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-950">Pendaftaran Berhasil!</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Produk UMKM Anda telah sukses ditambahkan ke etalase portal desa dan langsung dapat dipromosikan.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-950">Daftarkan Produk UMKM</h3>
                    <p className="text-[11px] text-gray-400 font-light">Hubungkan usaha mandiri Anda ke portal promosi desa digital.</p>
                  </div>
                  <button 
                    onClick={() => setShowRegisterForm(false)} 
                    className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-slate-50 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Seller Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Nama Toko / Pemilik</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Kripik Ibu Ida"
                        value={newProduct.seller}
                        onChange={(e) => setNewProduct({...newProduct, seller: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    {/* Product Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Nama Produk</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Keripik Pisang Keju"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Harga Jual (IDR)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: 15000"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    {/* WhatsApp */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">No. WhatsApp Toko</label>
                      <input 
                        type="tel" 
                        placeholder="Contoh: 08123456789"
                        value={newProduct.phone}
                        onChange={(e) => setNewProduct({...newProduct, phone: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Kategori Produk</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value as ProductItem['category']})}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                      >
                        <option value="Kuliner">Kuliner / Makanan</option>
                        <option value="Kerajinan">Kerajinan Tangan</option>
                        <option value="Pertanian">Pertanian / Hasil Bumi</option>
                        <option value="Madu & Herbal">Madu & Herbal</option>
                      </select>
                    </div>

                    {/* Image preset selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Gambar Ilustrasi Sesuai</label>
                      <select
                        value={newProduct.imageOption}
                        onChange={(e) => setNewProduct({...newProduct, imageOption: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                      >
                        <option value="kerajinan">Kerajinan (Anyaman/Gantungan)</option>
                        <option value="kuliner">Kuliner Camilan Renyah</option>
                        <option value="kue">Roti / Kue Tradisional</option>
                        <option value="kopi">Kopi Pegunungan</option>
                        <option value="madu">Madu Murni Botol</option>
                        <option value="pertanian">Beras / Hasil Pertanian</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Deskripsi Keunggulan Produk</label>
                    <textarea 
                      placeholder="Jelaskan bahan baku, ukuran, khasiat, atau proses pembuatan produk..."
                      rows={3}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none"
                      maxLength={300}
                      required
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-3 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => setShowRegisterForm(false)}
                      className="flex-1 border border-gray-200 text-gray-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-center"
                    >
                      Simpan Pendaftaran
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
