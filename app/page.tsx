"use client"
import { useEffect, useState, useContext, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { CartContext } from '@/context/CartContext';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import Swal from 'sweetalert2';

function HomeContent() {
  const [products, setProducts] = useState<any[]>([]);
  const { addToCart } = useContext(CartContext);
  const router = useRouter();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const categoryQuery = searchParams.get('category') || 'All';
  const isNewArrivals = searchParams.get('new') === 'true';
  const filterQuery = searchParams.get('filter') || 'all';

  // Modal & Selection States
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Review States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    axios.get('https://alnroy.pythonanywhere.com/api/products/')
      .then(res => {
        const fetchedData = res.data.results || (Array.isArray(res.data) ? res.data : []);
        setProducts(fetchedData);
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const uniqueCategories = Array.from(new Set(products.map((p: any) => p.category_name).filter(Boolean)));
  const uniqueBrands = Array.from(new Set(products.map((p: any) => p.brand_name).filter(Boolean)));

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery) ||
      (product.brand_name && product.brand_name.toLowerCase().includes(searchQuery))
      : true;
    const matchesCategory = categoryQuery === 'All' ||
      (product.category_name && product.category_name.toLowerCase() === categoryQuery.toLowerCase());

    let matchesNew = true;
    if (isNewArrivals && product.created_at) {
      const productDate = new Date(product.created_at);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - productDate.getTime()) / (1000 * 60 * 60);
      matchesNew = diffInHours <= 48;
    }

    let matchesSpecialFilter = true;
    if (filterQuery === 'offers') matchesSpecialFilter = !!product.offer_price;
    else if (filterQuery === 'combos') matchesSpecialFilter = !!product.is_combo;

    return matchesSearch && matchesCategory && matchesNew && matchesSpecialFilter;
  });

  // Variant Grouping Logic
  const getGroupedVariants = (product: any) => {
    if (!product || !product.variants) return {};
    return product.variants.reduce((acc: any, v: any) => {
      if (!acc[v.attribute_name]) acc[v.attribute_name] = [];
      acc[v.attribute_name].push(v);
      return acc;
    }, {});
  };

  const handleAddToCartWithCheck = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    e.preventDefault();

    const grouped = getGroupedVariants(product);
    const hasVariants = Object.keys(grouped).length > 0;
    const allSelected = Object.keys(grouped).every(attr => selectedOptions[attr]);

    if (hasVariants && !allSelected) {
      Swal.fire({ icon: 'info', title: 'Selection Required', text: 'Please choose your preferred size/color options first.', timer: 2000, showConfirmButton: false });
      return;
    }

    if (product.stock <= 0) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Out of Stock!', background: '#1e293b', color: '#fff', timer: 2000, showConfirmButton: false });
      return;
    }

    const cartProduct = { ...product, selectedOptions };
    addToCart(cartProduct);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Added to Cart!', background: '#1e293b', color: '#fff', timer: 2000, showConfirmButton: false });
  };

  const submitReview = async () => {
    if (!isLoggedIn) return Swal.fire({ icon: 'warning', title: 'Login Required', text: 'You must be logged in to leave a review.' });
    if (!comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `https://alnroy.pythonanywhere.com/api/products/${selectedProduct.id}/review/`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({ icon: 'success', title: 'Tight Lines!', text: 'Review posted successfully.', timer: 2000, showConfirmButton: false });
      const res = await axios.get('https://alnroy.pythonanywhere.com/api/products/');
      setProducts(res.data.results || res.data);
      setComment('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to submit review.";
      if (errorMessage.toLowerCase().includes("purchased")) {
        Swal.fire({ icon: 'error', title: 'Verified Buyers Only', text: 'You can only review items you have successfully purchased and paid for.' });
      } else {
        Swal.fire({ icon: 'error', title: 'Submission Failed', text: errorMessage });
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const heroProducts = products.filter((p: any) => p.is_hero_marquee);

  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroProducts.length]);

  const handleCategoryClick = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', cat);
    params.delete('search');
    router.push(`/?${params.toString()}#products`);
  };

  const handleBrandClick = (brand: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.set('search', brand.toLowerCase());
    router.push(`/?${params.toString()}#products`);
  };

  const handleAllGear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('search');
    router.push(`/?${params.toString()}#products`);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/?${params.toString()}#products`);
  };

  return (
    <div className="pb-20">
      {/* ===== HERO CAROUSEL ===== */}
      <div className="bg-slate-900 relative h-[400px] md:h-[500px] mb-8 overflow-hidden">
        {heroProducts.length > 0 ? (
          heroProducts.map((product: any, index: number) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="absolute inset-0 bg-black/50 z-10"></div>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover md:object-contain bg-slate-800" />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                {product.is_combo && (
                  <span className="bg-amber-500 text-white text-xs md:text-sm font-black px-4 py-1 rounded-full uppercase tracking-widest mb-4">Special Combo</span>
                )}
                {product.offer_price && !product.is_combo && (
                  <span className="bg-red-500 text-white text-xs md:text-sm font-black px-4 py-1 rounded-full uppercase tracking-widest mb-4">Special Offer</span>
                )}
                <h1 className="text-3xl md:text-6xl font-black text-white mb-4 drop-shadow-md">{product.name}</h1>
                <p className="text-lg md:text-2xl font-bold text-white drop-shadow-md mb-6">
                  {product.offer_price ? (
                    <>
                      <span className="line-through text-slate-300 mr-3">₹{product.price}</span>
                      <span className="text-blue-400">₹{product.offer_price}</span>
                    </>
                  ) : (
                    <span>₹{product.price}</span>
                  )}
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg"
                  onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 z-10 relative">
            <h1 className="text-3xl md:text-7xl font-black mb-4 md:mb-6 tracking-tight text-white">
              Gear Up for the <span className="text-blue-500">Big Catch</span>
            </h1>
            <p className="text-xs md:text-xl text-slate-400 mb-6 md:mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
              Professional grade tackle, rods, and reels for serious anglers.
            </p>
            <Link href="#products" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base transition-all">
              Shop All Gear
            </Link>
          </div>
        )}
        {heroProducts.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30">
            {heroProducts.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                className={`h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-blue-500 w-8' : 'bg-slate-400/50 hover:bg-slate-300 w-3'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== VISUAL CATEGORY CIRCLES ===== */}
      <div className="max-w-[1500px] mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Professional Gear Categories</h2>
          <div className="h-[1px] flex-1 bg-slate-100 ml-6"></div>
        </div>
        <div className="flex gap-6 md:gap-12 overflow-x-auto no-scrollbar pb-6">
          {/* All Gear Circle */}
          <button
            suppressHydrationWarning
            onClick={handleAllGear}
            className="flex flex-col items-center gap-4 shrink-0 group"
          >
            <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full border-[3px] transition-all p-1 bg-white shadow-sm overflow-hidden ${categoryQuery === 'All' && !searchQuery ? 'border-blue-500' : 'border-slate-100 group-hover:border-blue-500'}`}>
              <div className="w-full h-full bg-slate-900 flex items-center justify-center rounded-full group-hover:bg-blue-600 transition-colors">
                <span className="text-2xl md:text-3xl">🎣</span>
              </div>
            </div>
            <span className={`text-[10px] md:text-xs font-black uppercase tracking-tighter ${categoryQuery === 'All' && !searchQuery ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`}>
              All Gear
            </span>
          </button>

          {uniqueCategories.map((cat: any) => {
            const productForCat = products.find((p: any) => p.category_name === cat && p.image);
            const imgUrl = productForCat?.image || "https://images.unsplash.com/photo-1544372011-80796395b08c?q=80&w=200&h=200&fit=crop";
            return (
              <button
                suppressHydrationWarning
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="flex flex-col items-center gap-4 shrink-0 group"
              >
                <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full border-[3px] transition-all p-1 bg-white shadow-sm overflow-hidden ${categoryQuery === cat ? 'border-blue-500' : 'border-slate-100 group-hover:border-blue-500'}`}>
                  <img src={imgUrl} alt={cat} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-125" />
                </div>
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-tighter ${categoryQuery === cat ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== PRODUCTS SECTION ===== */}
      <div id="products" className="max-w-[1500px] mx-auto px-4">

        {/* Search Status / Clear Button */}
        {searchQuery && (
          <div className="flex items-center justify-between mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">
              Showing results for: <span className="bg-blue-600 text-white px-2 py-0.5 rounded ml-1 font-black">{searchQuery}</span>
            </p>
            <button
              suppressHydrationWarning
              onClick={handleClearSearch}
              className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-2 group"
            >
              Clear Search
              <span className="text-base leading-none group-hover:scale-125 transition-transform">&times;</span>
            </button>
          </div>
        )}


        {/* PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-4">🎣</p>
            <p className="font-bold text-lg">No products found</p>
            <p className="text-sm">Try clearing the filter or selecting a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product: any) => (
              <div
                key={product.id}
                onClick={() => { setSelectedProduct(product); setSelectedOptions({}); }}
                className="group bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="aspect-square overflow-hidden bg-slate-50 relative shrink-0">
                  <img
                    src={product.image}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={product.name}
                  />
                  {product.stock > 0 && (
                    <button
                      onClick={(e) => handleAddToCartWithCheck(e, product)}
                      className="hidden md:flex absolute bottom-2 right-2 bg-blue-600 text-white w-10 h-10 rounded-xl items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ＋
                    </button>
                  )}
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <p className="text-blue-600 text-[10px] font-bold uppercase tracking-tight mb-1">{product.category_name}</p>
                  <h3 className="font-bold text-xs md:text-base text-slate-900 line-clamp-2 leading-tight mb-2 h-8 md:h-12">
                    {product.name}
                  </h3>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base md:text-xl font-black text-slate-900">₹{product.offer_price || product.price}</p>
                      {product.offer_price && <p className="text-[10px] text-slate-400 line-through">₹{product.price}</p>}
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${product.stock > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== PRODUCT DETAIL MODAL ===== */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-red-100 hover:text-red-600 w-10 h-10 rounded-full flex items-center justify-center font-bold transition z-10"
            >
              ✕
            </button>

            {/* Left: Image & Gallery */}
            <div className="md:w-1/2 bg-slate-50 flex flex-col p-4 md:p-8 border-b md:border-b-0 md:border-r border-slate-100">
              <div className="flex-1 flex items-center justify-center min-h-[30vh] md:min-h-[50vh] mb-4">
                <img
                  src={selectedProduct.selectedImage || selectedProduct.image}
                  alt={selectedProduct.name}
                  className="max-w-full max-h-[40vh] md:max-h-[60vh] object-contain drop-shadow-xl transition-all duration-300"
                />
              </div>
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 justify-center md:justify-start">
                  <button
                    onClick={() => setSelectedProduct({ ...selectedProduct, selectedImage: selectedProduct.image })}
                    className={`w-16 h-16 rounded-xl border-2 shrink-0 overflow-hidden bg-white hover:border-blue-400 transition-all ${(!selectedProduct.selectedImage || selectedProduct.selectedImage === selectedProduct.image) ? 'border-blue-600 shadow-md' : 'border-slate-200'}`}
                  >
                    <img src={selectedProduct.image} className="w-full h-full object-contain p-1" alt="main" />
                  </button>
                  {selectedProduct.images.map((imgObj: any) => (
                    <button
                      key={imgObj.id}
                      onClick={() => setSelectedProduct({ ...selectedProduct, selectedImage: imgObj.image })}
                      className={`w-16 h-16 rounded-xl border-2 shrink-0 overflow-hidden bg-white hover:border-blue-400 transition-all ${selectedProduct.selectedImage === imgObj.image ? 'border-blue-600 shadow-md' : 'border-slate-200'}`}
                    >
                      <img src={imgObj.image} className="w-full h-full object-contain p-1" alt="gallery" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="md:w-1/2 p-6 md:p-12 flex flex-col">
              <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">{selectedProduct.category_name}</p>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">{selectedProduct.name}</h2>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-amber-400 text-lg tracking-widest">
                  {'★'.repeat(Math.round(selectedProduct.average_rating || 0))}
                  {'☆'.repeat(5 - Math.round(selectedProduct.average_rating || 0))}
                </div>
                <span className="text-slate-500 font-bold text-sm bg-slate-100 px-2 py-1 rounded">
                  {selectedProduct.average_rating || 0}
                </span>
              </div>

              {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4 mb-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Technical Details</p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">{key}</span>
                        <span className="text-xs font-black text-slate-900">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {Object.keys(getGroupedVariants(selectedProduct)).length > 0 && (
                <div className="mb-6 space-y-4">
                  {Object.entries(getGroupedVariants(selectedProduct)).map(([attrName, variants]: [string, any]) => (
                    <div key={attrName}>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Select {attrName}</p>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((v: any) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [attrName]: v.value }))}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${selectedOptions[attrName] === v.value
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                              }`}
                          >
                            {v.value}
                            {v.price_modifier > 0 && <span className="ml-1 text-[10px] text-green-600">(+₹{v.price_modifier})</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed line-clamp-4 md:line-clamp-none">{selectedProduct.description}</p>

              {/* Reviews */}
              <div className="mb-6 max-h-40 overflow-y-auto pr-2 space-y-4">
                <p className="text-slate-900 font-black border-b border-slate-200 pb-2 text-sm uppercase tracking-wider sticky top-0 bg-white">Angler Feedback</p>
                {selectedProduct.reviews?.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">Be the first to review this gear!</p>
                ) : (
                  selectedProduct.reviews?.map((rev: any) => (
                    <div key={rev.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-xs text-slate-800">{rev.user_name}</span>
                        <span className="text-amber-400 text-[10px]">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p className="text-slate-600 text-xs italic">&ldquo;{rev.comment}&rdquo;</p>
                    </div>
                  ))
                )}
              </div>

              {/* Review Form */}
              {isLoggedIn && (
                <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <p className="text-blue-900 font-black mb-3 text-xs uppercase">Leave a Review</p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setRating(s)} className={`text-xl ${rating >= s ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the performance..."
                    className="w-full p-3 rounded-xl bg-white border border-blue-100 text-xs outline-none focus:ring-2 focus:ring-blue-200 h-20 mb-3"
                  />
                  <button
                    onClick={submitReview}
                    disabled={isSubmittingReview || !comment.trim()}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-xs hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                  >
                    {isSubmittingReview ? 'Posting...' : 'Post Review'}
                  </button>
                </div>
              )}

              {/* Pricing & Actions */}
              <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Price</p>
                    <p className="text-3xl md:text-4xl font-black text-slate-900">₹{selectedProduct.offer_price || selectedProduct.price}</p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${selectedProduct.stock > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={(e) => {
                      handleAddToCartWithCheck(e, selectedProduct);
                      if (Object.keys(selectedOptions).length === Object.keys(getGroupedVariants(selectedProduct)).length) setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 py-4 rounded-xl font-bold transition-all text-xs md:text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const grouped = getGroupedVariants(selectedProduct);
                      if (Object.keys(grouped).length !== Object.keys(selectedOptions).length) {
                        return Swal.fire({ icon: 'info', title: 'Pick an option', text: 'Select size/color before checkout' });
                      }
                      addToCart({ ...selectedProduct, selectedOptions });
                      router.push('/checkout');
                    }}
                    disabled={selectedProduct.stock === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                  >
                    {selectedProduct.stock > 0 ? <>Buy Now ⚡</> : 'Sold Out'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400 animate-pulse">Loading KSR Gear...</div>}>
      <HomeContent />
    </Suspense>
  );
}