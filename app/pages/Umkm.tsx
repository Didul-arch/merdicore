import { useState, FormEvent } from 'react';
import { Star, Eye, ShoppingBag, Search, Phone, Building, User, PlusCircle, CheckCircle, X } from 'lucide-react';
import { PRODUCTS_DATA } from '../data';
import { ProductItem } from '../types';
import { formatCurrency, generateWhatsAppUrl } from '../utils';

const CATEGORIES = ['Semua', 'Kuliner', 'Kerajinan', 'Pertanian', 'Madu & Herbal'];

const IMAGE_PRESETS: Record<string, string> = {
  kerajinan: 'https://images.unsplash.com/photo-1595475242261-2742edb41391?auto=format&fit=crop&w=800&q=80',
  kuliner: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80',
  madu: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
  kopi: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
  pertanian: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  kue: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
};

const INITIAL_FORM = {
  name: '',
  seller: '',
  price: '',
  phone: '',
  category: 'Kuliner' as ProductItem['category'],
  description: '',
  imageOption: 'kerajinan',
};

export default function Umkm() {
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Registration form
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [newProduct, setNewProduct] = useState(INITIAL_FORM);

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { name, seller, price, phone, description, category, imageOption } = newProduct;

    if (!name || !seller || !price || !phone || !description) {
      alert('Mohon lengkapi seluruh kolom formulir pendaftaran!');
      return;
    }

    const priceNum = parseInt(price.replace(/[^0-9]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Mohon masukkan harga produk yang valid!');
      return;
    }

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1);
    else if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);

    const created: ProductItem = {
      id: `prod-${Date.now()}`,
      name,
      seller,
      price: priceNum,
      rating: 5.0,
      image: IMAGE_PRESETS[imageOption] ?? IMAGE_PRESETS.kuliner,
      phone: formattedPhone,
      category,
      description,
    };

    setProducts([created, ...products]);
    setFormSuccess(true);
    setTimeout(() => {
      setShowRegisterForm(false);
      setFormSuccess(false);
      setNewProduct(INITIAL_FORM);
    }, 2500);
  };

  const handleWhatsAppOrder = (product: ProductItem) => {
    const message = `Halo ${product.seller}, saya tertarik dengan produk "${product.name}" (${formatCurrency(product.price)}) di Portal UMKM Desa Pulung Merdiko. Apakah stok masih tersedia?`;
    window.open(generateWhatsAppUrl(product.phone, message), '_blank');
  };

  // Filter & sort
  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating-desc') return b.rating - a.rating;
    return 0;
  });

  const updateForm = (field: string, value: string) => setNewProduct({ ...newProduct, [field]: value });

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">PASAR EKONOMI LOKAL</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              Galeri UMKM Desa Pulung Merdiko
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
              Mendukung penuh perekonomian kerakyatan melalui digitalisasi promosi karya kreasi terbaik warga kami.
            </p>
          </div>
          <button
            onClick={() => setShowRegisterForm(true)}
            className="flex-shrink-0 inline-flex items-center space-x-2.5 bg-teal-600 hover:bg-teal-500 text-white px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-teal-100" />
            <span>Daftarkan UMKM Anda</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full lg:max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari produk, toko, atau bahan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start">
            {CATEGORIES.map((cat) => (
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

        {/* Product Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorted.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-teal-500/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
              >
                <div className="relative h-60 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-[1.03] transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-teal-700 shadow-sm border border-gray-100">
                    {product.category}
                  </span>
                  <span className="absolute bottom-4 right-4 bg-slate-900 text-white px-3 py-1 rounded-xl text-xs font-extrabold shadow-md border border-slate-800">
                    {formatCurrency(product.price)}
                  </span>
                </div>

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
                      <Phone className="w-3.5 h-3.5" />
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />

          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative z-10 border border-gray-100 animate-zoom-in">
            <div className="grid grid-cols-1 sm:grid-cols-12">
              <div className="sm:col-span-5 relative h-56 sm:h-auto bg-slate-50 p-2 flex items-center justify-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

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
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-0.5 w-12 bg-teal-600 rounded" />

                <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-50/80">
                  <span className="block text-[10px] text-teal-700 font-bold uppercase tracking-widest leading-none">Harga:</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-teal-800 leading-none mt-1.5 block">
                    {formatCurrency(selectedProduct.price)}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-teal-600" />
                    <span><strong>Pemilik:</strong> {selectedProduct.seller}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span><strong>WhatsApp:</strong> +{selectedProduct.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span><strong>Rating:</strong> {selectedProduct.rating.toFixed(1)} / 5.0</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deskripsi:</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-light">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-50 flex gap-3">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="border border-gray-200 hover:bg-slate-50 text-gray-600 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex-1"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(selectedProduct)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 flex-1 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Hubungi via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register UMKM Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => { if (!formSuccess) setShowRegisterForm(false); }} />

          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-gray-100 animate-zoom-in">
            {formSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border border-teal-100">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-950">Pendaftaran Berhasil!</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Produk UMKM Anda telah ditambahkan ke etalase portal desa.
                </p>
                <p className="text-[10px] text-gray-400 italic">
                  * Demo: data hanya tersimpan di sesi ini.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-950">Daftarkan Produk UMKM</h3>
                    <p className="text-[11px] text-gray-400 font-light">Demo — data disimpan sementara di browser.</p>
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
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Nama Toko / Pemilik</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kripik Ibu Ida"
                        value={newProduct.seller}
                        onChange={(e) => updateForm('seller', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Nama Produk</label>
                      <input
                        type="text"
                        placeholder="Contoh: Keripik Pisang Keju"
                        value={newProduct.name}
                        onChange={(e) => updateForm('name', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Harga Jual (IDR)</label>
                      <input
                        type="text"
                        placeholder="Contoh: 15000"
                        value={newProduct.price}
                        onChange={(e) => updateForm('price', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">No. WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="Contoh: 08123456789"
                        value={newProduct.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Kategori</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => updateForm('category', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                      >
                        <option value="Kuliner">Kuliner / Makanan</option>
                        <option value="Kerajinan">Kerajinan Tangan</option>
                        <option value="Pertanian">Pertanian / Hasil Bumi</option>
                        <option value="Madu & Herbal">Madu & Herbal</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Gambar Ilustrasi</label>
                      <select
                        value={newProduct.imageOption}
                        onChange={(e) => updateForm('imageOption', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                      >
                        <option value="kerajinan">Kerajinan</option>
                        <option value="kuliner">Kuliner Camilan</option>
                        <option value="kue">Roti / Kue</option>
                        <option value="kopi">Kopi</option>
                        <option value="madu">Madu</option>
                        <option value="pertanian">Pertanian</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Deskripsi Produk</label>
                    <textarea
                      placeholder="Jelaskan bahan baku, keunggulan, atau proses pembuatan..."
                      rows={3}
                      value={newProduct.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none"
                      maxLength={300}
                      required
                    />
                  </div>

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
                      className="flex-1 bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
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
