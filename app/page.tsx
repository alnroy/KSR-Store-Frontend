"use client"
import React, { useEffect, useState, useContext, Suspense, useMemo } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { CartContext } from '@/context/CartContext';
import { AuthContext } from '@/context/AuthContext';
import { Heart, Search, X, Star, ShoppingCart, Zap, Filter, ArrowRight, ArrowLeft, Anchor, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { WishlistContext } from '@/context/WishlistContext';
import ProductSection from '@/components/ProductSection';
import ShoppableVideos from '@/components/ShoppableVideos';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// --- LOADING OVERLAY COMPONENT ---
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 flex flex-col items-center justify-center transition-all animate-in fade-in duration-500 text-center px-4">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-blue-500/20 rounded-full animate-spinner"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Anchor className="text-blue-500 animate-pulse" size={32} />
        </div>
      </div>
      <h3 className="mt-8 text-white font-black text-2xl tracking-tighter uppercase italic">KSR Aqua World</h3>
      <p className="mt-2 text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Casting the Line...</p>
    </div>
  );
}

// --- PRODUCT SKELETON ---
function ProductSkeleton() {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100 h-full">
      <div className="aspect-square skeleton w-full bg-slate-200"></div>
      <div className="h-4 skeleton w-2/3 bg-slate-200"></div>
      <div className="h-3 skeleton w-1/3 bg-slate-200"></div>
      <div className="h-10 skeleton w-full bg-slate-200 mt-4 rounded-xl"></div>
    </div>
  );
}

function RandomProductSlideshow({ products, onSelect, variant = 'card' }: { products: any[], onSelect: (p: any) => void, variant?: 'hero' | 'card' }) {
  // Use a ref to store the randomized subset so it doesn't reshuffle on every timer tick
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (products.length === 0) return;
    // Shuffle and take a subset (max 12 for variety)
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    setDisplayProducts(shuffled.slice(0, 12));
    setIndex(0);
  }, [products]);

  useEffect(() => {
    if (displayProducts.length <= 1) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % displayProducts.length);
    }, 7000); // Slower speed: 7 seconds
    return () => clearInterval(interval);
  }, [displayProducts.length]);

  if (displayProducts.length === 0) return null;
  const p = displayProducts[index];

  const containerClasses = variant === 'hero' 
    ? "relative w-full min-h-[450px] md:h-[550px] bg-slate-950 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-none rounded-none mb-0"
    : "my-16 bg-slate-950 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden relative min-h-[500px] md:min-h-[550px] h-auto flex flex-col items-center justify-center cursor-pointer group shadow-2xl transition-all active:scale-[0.98] border border-white/5";

  return (
    <div 
        onClick={() => onSelect(p)}
        className={containerClasses}
    >
        {/* CINEMATIC BACKGROUND */}
        <div key={`bg-${index}`} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img 
                src={p.image} 
                className={variant === 'hero' 
                    ? "w-full h-full object-cover opacity-80 animate-ken-burns scale-110" 
                    : "w-full h-full object-cover blur-3xl opacity-20 animate-ken-burns"} 
                alt="" 
            />
            {variant === 'hero' 
                ? <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/20 to-slate-950/80"></div>
                : <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-transparent"></div>
            }
        </div>

        {/* HERO CONTENT LAYOUT */}
        {variant === 'hero' ? (
            <div className="relative z-20 w-full max-w-[1500px] mx-auto px-6 md:px-20 h-full flex flex-col justify-start pt-12 md:pt-20 items-start text-left">
                <div key={`labels-${index}`} className="animate-in fade-in slide-in-from-top-12 duration-1000">
                    <div className="inline-flex items-center gap-2 bg-blue-600/20 backdrop-blur-xl border border-blue-400/30 px-5 py-2 rounded-full mb-6">
                        <Zap className="text-blue-400 w-4 h-4 fill-blue-400" />
                        <span className="text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Dispatch Spotlight</span>
                    </div>
                    
                    <h1 className="text-2xl md:text-[clamp(1.8rem,5vw,4.2rem)] font-black text-white leading-[0.9] tracking-tighter uppercase italic mb-8 drop-shadow-2xl max-w-4xl line-clamp-2 break-words">
                        {p.name}
                    </h1>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                        <div className="flex items-center gap-6">
                            <p className="text-blue-500 text-4xl md:text-7xl font-black italic drop-shadow-lg">₹{p.offer_price || p.price}</p>
                            {p.offer_price && (
                                <p className="text-slate-400 text-xl md:text-3xl line-through font-bold opacity-70">₹{p.price}</p>
                            )}
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 hidden md:block">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Gear Specs</p>
                            <p className="text-white font-bold text-sm italic">{p.category_name} • Professional Grade</p>
                        </div>
                    </div>

                    <div className="mt-10 md:mt-16 flex items-center gap-6">
                        <button className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95">
                            Inspect Gear Now ⚓
                        </button>
                        <div className="hidden md:flex flex-col">
                            <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">Angler Verified</span>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-amber-400 fill-amber-400" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            /* STANDARD CARD GRID */
            <div className="relative z-20 w-full flex flex-col md:flex-row items-center justify-center px-8 md:px-20 gap-8 md:gap-12 py-16 md:py-0">
                {/* ... existing card grid content ... */}
                <div className="w-full flex items-center justify-center order-1 md:order-2 mb-4 md:mb-0">
                    <div 
                        key={`img-cont-${index}`} 
                        className="relative w-full max-w-[260px] md:max-w-[450px] aspect-square flex items-center justify-center bg-white/5 rounded-full animate-in fade-in duration-700 p-6 z-30"
                    >
                        <img 
                            src={p.image || '/insta_logo.jpg'} 
                            className="max-w-full max-h-full object-contain drop-shadow-2xl transition-all duration-700 hover:scale-105 z-40 relative" 
                            alt={p.name} 
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/40 blur-3xl rounded-full -z-10 animate-pulse"></div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center text-center md:text-left order-2 md:order-1 z-30">
                    <div key={`tag-${index}`} className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 px-4 py-1.5 rounded-full mb-6 w-fit mx-auto md:mx-0 animate-in fade-in slide-in-from-left-4 duration-700">
                        <Zap className="text-blue-400 w-3.5 h-3.5 fill-blue-400" />
                        <span className="text-blue-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Premium Spotlight Gear</span>
                    </div>
                    
                    <h3 key={`name-${index}`} className="text-3xl md:text-7xl font-black text-white mb-4 md:mb-6 leading-[0.9] tracking-tighter uppercase italic animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                        {p.name}
                    </h3>
                    
                    <div key={`price-${index}`} className="flex items-center gap-4 md:gap-6 justify-center md:justify-start animate-in fade-in slide-in-from-left-12 duration-700 delay-200">
                        <p className="text-blue-500 text-2xl md:text-5xl font-black italic">₹{p.offer_price || p.price}</p>
                        {p.offer_price && (
                            <p className="text-slate-500 text-lg md:text-xl line-through font-bold">₹{p.price}</p>
                        )}
                    </div>

                    <div className="mt-8 md:mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <button className="bg-white text-slate-950 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95">
                            Claim This Gear →
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* PROGRESS INDICATORS */}
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
            {displayProducts.map((_, i) => (
                <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-700 ${i === index ? 'bg-blue-500 w-16 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/10 w-4 hover:bg-white/20'}`} 
                />
            ))}
        </div>
    </div>
  );
}

function HomeContent() {
  const detailScrollRef = React.useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<any[]>([]);
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const router = useRouter();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const categoryQuery = searchParams.get('category') || 'All';
  const isNewArrivals = searchParams.get('new') === 'true';
  const filterQuery = searchParams.get('filter') || 'all';
  const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : 0;
  const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : Infinity;

  // Modal & Selection States
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  
  // --- SYNC SELECTED PRODUCT TO URL ---
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedProduct) {
      params.set('product', selectedProduct.id.toString());
    } else {
      params.delete('product');
    }
    // Use window.history to avoid unnecessary re-mounts from router.push
    const newPath = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newPath);
  }, [selectedProduct]);

  // Auto-open product from URL
  useEffect(() => {
    const productId = searchParams.get('product_id');
    if (productId && products.length > 0) {
      const product = products.find(p => p.id.toString() === productId);
      if (product) setSelectedProduct(product);
    }
  }, [searchParams, products]);

  // Review States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { isLoggedIn, user } = useContext(AuthContext);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get('https://alnroy.pythonanywhere.com/api/products/')
      .then(res => {
        const fetchedData = res.data.results || (Array.isArray(res.data) ? res.data : []);
        setProducts(fetchedData);
        setTimeout(() => setIsLoading(false), 800); // Give it a tiny bit more feel
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setIsLoading(false);
      });
  }, []);

  const uniqueCategories = Array.from(new Set(products.map((p: any) => p.category_name).filter(Boolean)));
  const uniqueBrands = Array.from(new Set(products.map((p: any) => p.brand_name).filter(Boolean)));

  const now = React.useMemo(() => hasMounted ? new Date() : null, [hasMounted]);
  
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery) ||
      (product.brand_name && product.brand_name.toLowerCase().includes(searchQuery))
      : true;
    const matchesCategory = categoryQuery === 'All' ||
      (product.category_name && product.category_name.toLowerCase() === categoryQuery.toLowerCase());

    let matchesNew = true;
    if (isNewArrivals && product.created_at && now) {
      const productDate = new Date(product.created_at);
      const diffInHours = Math.abs(now.getTime() - productDate.getTime()) / (1000 * 60 * 60);
      matchesNew = diffInHours <= 48;
    } else if (isNewArrivals) {
      matchesNew = false;
    }

    let matchesSpecialFilter = true;
    if (filterQuery === 'offers') matchesSpecialFilter = !!product.offer_price;
    else if (filterQuery === 'combos') matchesSpecialFilter = !!product.is_combo;
    else if (filterQuery === 'frequently_bought') matchesSpecialFilter = product.is_frequently_bought || (product.average_rating >= 4.5);

    const activePrice = product.offer_price ? parseFloat(product.offer_price) : parseFloat(product.price);
    const matchesPrice = activePrice >= minPrice && activePrice <= maxPrice;

    return matchesSearch && matchesCategory && matchesNew && matchesSpecialFilter && matchesPrice;
  });

  // Handle Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle URL-based product selection
  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId && products.length > 0) {
      const p = products.find(prod => prod.id === parseInt(productId));
      if (p) {
        setSelectedProduct(p);
        setTimeout(() => detailScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    }
  }, [searchParams, products]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryQuery, isNewArrivals, filterQuery]);

  // Variant Grouping Logic
  const getGroupedVariants = (product: any) => {
    if (!product || !product.variants) return {};
    return product.variants.reduce((acc: any, v: any) => {
      if (!acc[v.attribute_name]) acc[v.attribute_name] = [];
      acc[v.attribute_name].push(v);
      return acc;
    }, {});
  };

  const getActivePrice = (product: any, options: Record<string, string>) => {
    let price = parseFloat(product.offer_price || product.price);
    if (!product.variants) return price;
    Object.entries(options).forEach(([attr, val]) => {
      const v = product.variants.find((variant: any) => variant.attribute_name === attr && variant.value === val);
      if (v) price += parseFloat(v.price_modifier || 0);
    });
    return price;
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

    const finalPrice = getActivePrice(product, selectedOptions);
    const cartProduct = { 
      ...product, 
      selectedOptions,
      price: product.offer_price ? product.price : finalPrice, // Keep original if offer exists, or set modified
      offer_price: product.offer_price ? finalPrice : null // Set modified as offer if offer exists
    };
    addToCart(cartProduct);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Added to Cart!', background: '#1e293b', color: '#fff', timer: 2000, showConfirmButton: false });
  };

  const submitReview = async () => {
    if (!isLoggedIn) return Swal.fire({ icon: 'warning', title: 'Login Required', text: 'You must be logged in to leave a review.' });
    
    // Validation
    if (rating < 1 || rating > 5) return Swal.fire({ icon: 'warning', title: 'Invalid Rating', text: 'Please select a star rating.' });
    if (!comment.trim()) return Swal.fire({ icon: 'warning', title: 'Empty Comment', text: 'Please write a comment.' });
    if (comment.length > 500) return Swal.fire({ icon: 'warning', title: 'Comment Too Long', text: 'Comments must be under 500 characters.' });

    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `https://alnroy.pythonanywhere.com/api/products/${selectedProduct.id}/review/`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({ icon: 'success', title: 'Tight Lines!', text: 'Review posted successfully.', timer: 2000, showConfirmButton: false });
      
      // Refresh products list
      const res = await axios.get('https://alnroy.pythonanywhere.com/api/products/');
      const updatedProducts = res.data.results || (Array.isArray(res.data) ? res.data : []);
      setProducts(updatedProducts);

      // --- INSTANT UI UPDATE: Refresh the selected product reviews ---
      const updatedSelected = updatedProducts.find((p: any) => p.id === selectedProduct.id);
      if (updatedSelected) {
        setSelectedProduct(updatedSelected);
      }
      
      setComment('');
    } catch (err: any) {
      let errorMessage = "Failed to submit review.";
      
      if (err.response?.data) {
        const data = err.response.data;
        if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'object') {
          // Handle DRF field-specific errors (e.g., { comment: ["This field is required"] })
          errorMessage = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        }
      }

      if (errorMessage.toLowerCase().includes("purchased")) {
        Swal.fire({ icon: 'error', title: 'Verified Buyers Only', text: 'You can only review items you have successfully purchased and paid for.' });
      } else {
        Swal.fire({ icon: 'error', title: 'Submission Failed', text: errorMessage });
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const result = await Swal.fire({
      title: 'Delete Report?',
      text: "Are you sure you want to remove this catch report? This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Confirm Disposal ⚓',
      background: '#ffffff',
      color: '#0f172a'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`https://alnroy.pythonanywhere.com/api/reviews/${reviewId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire({ icon: 'success', title: 'Removed', text: 'Report successfully discarded.', timer: 1500, showConfirmButton: false });

        if (selectedProduct) {
          const updatedReviews = selectedProduct.reviews.filter((r: any) => r.id !== reviewId);
          const updatedProduct = { ...selectedProduct, reviews: updatedReviews };
          setSelectedProduct(updatedProduct);
          
          setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to discard the report.', 'error');
      }
    }
  };

  const marqueeProducts = useMemo(() => products.filter((p: any) => p.is_hero_marquee), [products]);
  const heroProducts = useMemo(() => marqueeProducts.length >= 3 ? marqueeProducts : products.slice(0, 10), [marqueeProducts, products]);
  
  const remainingProducts = useMemo(() => products.filter(p => !heroProducts.some(h => h.id === p.id)), [products, heroProducts]);
  // Split remaining products into two pools for different breaks to ensure ZERO repetition
  const break1Pool = useMemo(() => remainingProducts.slice(0, Math.ceil(remainingProducts.length / 2)), [remainingProducts]);
  const breakLoopPool = useMemo(() => remainingProducts.slice(Math.ceil(remainingProducts.length / 2)), [remainingProducts]);

  const handleCategoryClick = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', cat);
    params.delete('search');
    router.push(`/?${params.toString()}#products`);
    setCurrentPage(1);
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
    <>
    {isLoading && <LoadingOverlay />}
    <div className="pb-20 bg-white pt-0">
      {/* ===== HERO SPOTLIGHT (True Hero Style) ===== */}
      <div className="w-full">
        {!isLoading && heroProducts.length > 0 && (
          <RandomProductSlideshow 
            variant="hero"
            products={heroProducts} 
            onSelect={(p) => { setSelectedProduct(p); setSelectedOptions({}); }} 
          />
        )}
        {isLoading && products.length === 0 && (
          <div className="bg-slate-950 h-[500px] md:h-[650px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-spinner mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Casting Spotlight Gear...</p>
              </div>
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
          {isLoading && products.length === 0 ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col items-center gap-4 shrink-0">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full skeleton bg-slate-100 italic"></div>
                <div className="h-3 w-12 skeleton bg-slate-100"></div>
              </div>
            ))
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
 


      {/* ===== PRODUCTS SECTION ===== */}
      <div id="products" className="max-w-[1500px] mx-auto px-4 scroll-mt-24">
        {isLoading && products.length === 0 ? (
          <div className="py-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <ProductSkeleton key={i} />)}
            </div>
          </div>
        ) : searchQuery || categoryQuery !== 'All' || isNewArrivals || filterQuery !== 'all' || minPrice > 0 || maxPrice < Infinity ? (
          <ProductSection 
            title={searchQuery ? `Search Results: ${searchQuery}` : categoryQuery !== 'All' ? `${categoryQuery} Gear` : "Filtered Results"}
            products={filteredProducts}
            itemsPerPage={32}
            onSelect={(p) => { setSelectedProduct(p); setSelectedOptions({}); }}
            onAddToCart={handleAddToCartWithCheck}
            onToggleWishlist={toggleWishlist}
            isInWishlist={isInWishlist}
          />
        ) : (
          <>
            {/* 1. Whole Products (Grid with pagination) */}
            <ProductSection 
              title="Our Complete Gear Collection"
              products={products.slice(0, 120)}
              itemsPerPage={32}
              showPagination={true}
              onSelect={(p) => { setSelectedProduct(p); setSelectedOptions({}); }}
              onAddToCart={handleAddToCartWithCheck}
              onToggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
            />

            {/* 2. Budget Items (Horizontal Scroll) - NO BUTTONS */}
            <div className="bg-slate-50 -mx-4 px-4 py-12 mb-16 border-y border-slate-100">
               <div className="max-w-[1500px] mx-auto">
                <ProductSection 
                  title="Pocket Friendly Tackle"
                  products={products.filter(p => (parseFloat(p.offer_price || p.price)) <= 1000).slice(0, 40)}
                  layout="scroll"
                  showPagination={false}
                  onSelect={(p) => { setSelectedProduct(p); setSelectedOptions({}); }}
                  onAddToCart={handleAddToCartWithCheck}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                />
               </div>
            </div>

            {/* Random Slideshow Break 1: UNIQUE SPOTLIGHT (Excluding Hero & Loop items) */}
            <RandomProductSlideshow 
                products={break1Pool} 
                onSelect={(p) => { setSelectedProduct(p); setSelectedOptions({}); }}
            />

            {/* Shoppable Videos Section */}
            <ShoppableVideos 
                onProductSelect={(id) => {
                    const p = products.find(prod => prod.id === id);
                    if (p) { setSelectedProduct(p); setSelectedOptions({}); }
                }} 
            />

            {/* 3. Dynamic Category Sections (Alternating Layouts) */}
            {uniqueCategories.map((cat: any, idx: number) => (
              <React.Fragment key={cat}>
                <ProductSection 
                  title={`${cat} Collections`}
                  products={products.filter(p => p.category_name === cat).slice(0, 40)}
                  itemsPerPage={28}
                  // Mix of layouts: 1 grid, 1 scroll, 1 grid... etc.
                  layout={idx % 3 === 1 ? 'scroll' : 'grid'}
                  showPagination={idx % 3 !== 1}
                  onSelect={(p) => { setSelectedProduct(p); setSelectedOptions({}); }}
                  onAddToCart={handleAddToCartWithCheck}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                />
                
                {/* Insert another slideshow after every 3 categories: DIVERSE SELECTION (Final Pool) */}
                {idx % 3 === 2 && (
                    <RandomProductSlideshow 
                        products={breakLoopPool.filter(p => p.category_name !== cat)} 
                        onSelect={(p) => { setSelectedProduct(p); setSelectedOptions({}); }}
                    />
                )}
              </React.Fragment>
            ))}

            {/* 4. New Arrivals Banner Style */}
            <div className="relative rounded-[2.5rem] p-8 md:p-20 mb-16 text-white overflow-hidden group min-h-[400px] flex items-center">
                <img 
                  src="/new-arrivalsbg.jpg" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Fishing Background"
                />
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
                <div className="relative z-10 flex flex-col items-start gap-8 max-w-3xl">
                    <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full">New Arrivals</span>
                    <div>
                        <h2 className="text-4xl md:text-7xl font-black mb-6 leading-tight">Latest to the Dock ⚓</h2>
                        <p className="text-xl text-blue-50 font-bold max-w-xl leading-relaxed">Discover the freshest arrivals in the shop. High quality gear that just landed and is ready for your next big catch.</p>
                    </div>
                    <Link href="/?new=true#products"
                      className="inline-block bg-white text-blue-600 px-12 py-5 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-2xl hover:scale-105 active:scale-95 text-lg"
                    >
                      Explore New Arrivals →
                    </Link>
                </div>
            </div>
          </>
        )}
      </div>
    </div>

      {/* ===== FULL-PAGE PRODUCT DETAIL OVERLAY ===== */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-white z-[300] flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500"
        >
          {/* Header Bar */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md z-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="font-black text-slate-900 text-lg md:text-xl truncate max-w-[200px] md:max-w-md">
                {selectedProduct.name}
              </h2>
            </div>
            <button
              onClick={() => setSelectedProduct(null)}
              className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-600 transition-all"
            >
              Close
            </button>
          </div>

          <div ref={detailScrollRef} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            <div className="max-w-[1400px] mx-auto p-4 md:p-12">
              <div className="flex flex-col lg:flex-row gap-12 mb-20">
                {/* Left: Image & Gallery */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                  <div className="aspect-square bg-slate-50 rounded-[3rem] flex items-center justify-center p-8 md:p-16 relative overflow-hidden group">
                    <img
                      src={selectedProduct.selectedImage || selectedProduct.image}
                      alt={selectedProduct.name}
                      className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    />
                    {selectedProduct.offer_price && (
                      <span className="absolute top-10 left-10 bg-red-500 text-white font-black px-6 py-2 rounded-full rotate-[-5deg] shadow-xl">
                        SPECIAL OFFER
                      </span>
                    )}
                  </div>
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                       <button
                        onClick={() => setSelectedProduct({ ...selectedProduct, selectedImage: selectedProduct.image })}
                        className={`w-24 h-24 rounded-2xl border-2 shrink-0 overflow-hidden bg-white transition-all ${(!selectedProduct.selectedImage || selectedProduct.selectedImage === selectedProduct.image) ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                      >
                        <img src={selectedProduct.image} className="w-full h-full object-contain p-2" />
                      </button>
                      {selectedProduct.images.map((imgObj: any) => (
                        <button
                          key={imgObj.id}
                          onClick={() => setSelectedProduct({ ...selectedProduct, selectedImage: imgObj.image })}
                          className={`w-24 h-24 rounded-2xl border-2 shrink-0 overflow-hidden bg-white transition-all ${selectedProduct.selectedImage === imgObj.image ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                        >
                          <img src={imgObj.image} className="w-full h-full object-contain p-2" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Detailed Info */}
                <div className="lg:w-1/2 flex flex-col">
                  <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-4">Professional Gear / {selectedProduct.category_name}</span>
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{selectedProduct.name}</h1>
                  
                  <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100">
                    <div className="flex flex-col">
                      <p className="text-3xl md:text-5xl font-black text-slate-900">₹{selectedProduct ? getActivePrice(selectedProduct, selectedOptions).toLocaleString() : '0'}</p>
                      {selectedProduct.offer_price && <p className="text-lg text-slate-400 line-through">Base: ₹{selectedProduct.price}</p>}
                    </div>
                    <div className="h-12 w-px bg-slate-100"></div>
                    <div className="flex flex-col gap-1">
                      <div className="flex text-amber-400 text-xl">
                        {'★'.repeat(Math.round(selectedProduct.average_rating || 0))}
                        {'☆'.repeat(5 - Math.round(selectedProduct.average_rating || 0))}
                      </div>
                      <p className="text-xs font-bold text-slate-400">Verified Angler Rating</p>
                    </div>
                  </div>

                  {/* Specifications */}
                  {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-10">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{key}</p>
                          <p className="font-bold text-slate-900">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Variants Selector */}
                  {Object.keys(getGroupedVariants(selectedProduct)).length > 0 && (
                    <div className="space-y-8 mb-10 bg-slate-50 p-6 md:p-8 rounded-[2rem]">
                      {Object.entries(getGroupedVariants(selectedProduct)).map(([attrName, variants]: [string, any]) => (
                        <div key={attrName}>
                          <p className="text-xs font-black uppercase text-slate-900 mb-4 tracking-widest flex items-center gap-2">
                             Choose {attrName} <span className="h-px flex-1 bg-slate-200"></span>
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {variants.map((v: any) => (
                              <button
                                key={v.id}
                                onClick={() => setSelectedOptions(prev => ({ ...prev, [attrName]: v.value }))}
                                className={`px-6 py-3 rounded-2xl text-sm font-black border-2 transition-all ${selectedOptions[attrName] === v.value
                                  ? 'border-blue-600 bg-white text-blue-600 shadow-xl shadow-blue-100 scale-105'
                                  : 'border-white bg-white text-slate-500 hover:border-slate-200 shadow-sm'
                                  }`}
                              >
                                {v.value}
                                {v.price_modifier > 0 && <span className="ml-2 py-0.5 px-2 bg-green-100 text-green-700 rounded-lg text-[10px]">+₹{v.price_modifier}</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Integrated Purchase Actions (Moved from Sticky Footer) */}
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={(e) => {
                          handleAddToCartWithCheck(e, selectedProduct);
                        }}
                        disabled={selectedProduct.stock === 0}
                        className="flex-1 bg-slate-900 text-white py-6 rounded-3xl font-black transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 disabled:bg-slate-300 text-lg shadow-xl uppercase tracking-tighter"
                      >
                        Add to Tackle Box
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const grouped = getGroupedVariants(selectedProduct);
                          if (Object.keys(grouped).length !== Object.keys(selectedOptions).length) {
                            return Swal.fire({ icon: 'info', title: 'Pick an option', text: 'Select size/color before checkout' });
                          }

                          localStorage.setItem('instant_buy_item', JSON.stringify([{ 
                            ...selectedProduct, 
                            selectedOptions, 
                            quantity: 1,
                            price: getActivePrice(selectedProduct, selectedOptions) // Pass the modified price
                          }]));

                          if (!isLoggedIn) {
                            router.push('/login?redirect=checkout&message=login_required');
                          } else {
                            router.push('/checkout');
                          }
                        }}
                        disabled={selectedProduct.stock === 0}
                        className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-black shadow-xl shadow-blue-200 transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-95 disabled:bg-slate-200 text-lg flex items-center justify-center gap-2 uppercase tracking-tighter"
                      >
                        {selectedProduct.stock > 0 ? <>Instant Buy Now ⚡</> : 'Sold Out'}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedProduct.stock} units currently at the dock</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Products Gallery (Infinite Horizontal Scroll) */}
              <div className="mt-20 pt-20 border-t border-slate-100">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Anglers also viewed...</h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Slide for more</span>
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-10 snap-x">
                   {products
                    .filter(p => p.category_name === selectedProduct.category_name && p.id !== selectedProduct.id)
                    .map(rp => (
                      <div 
                        key={rp.id}
                        onClick={() => { 
                          setSelectedProduct(rp); 
                          setSelectedOptions({}); 
                          detailScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-[180px] md:w-[240px] shrink-0 snap-start group cursor-pointer"
                      >
                        <div className="aspect-square bg-slate-50 rounded-[2rem] mb-4 overflow-hidden relative border border-slate-50 group-hover:border-blue-200 transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-blue-50 group-hover:-translate-y-1">
                            <img src={rp.image} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                            {rp.offer_price && (
                                <span className="absolute top-3 left-3 bg-red-500 text-[8px] text-white font-black px-2 py-0.5 rounded-full">DEAL</span>
                            )}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tighter">{rp.name}</h4>
                        <p className="text-sm font-black text-blue-600 italic">₹{rp.offer_price || rp.price}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div className="mt-20 pt-20 border-t border-slate-100 max-w-4xl">
                <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-widest text-sm">Product Deep Dive</h3>
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line mb-20">{selectedProduct.description}</p>
                
                {/* Full Reviews Section */}
                <div className="space-y-12">
                   <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-widest text-sm">Community Catch Report ({selectedProduct.reviews?.length || 0})</h3>
                   {selectedProduct.reviews?.length === 0 ? (
                    <div className="bg-slate-50 p-12 rounded-[2rem] text-center border border-dashed border-slate-200">
                      <p className="text-slate-500 font-bold">No reports yet. Be the first to share your experience!</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                      {selectedProduct.reviews?.map((rev: any) => (
                        <div key={rev.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-black text-blue-600">
                                {rev.user_name?.[0] || 'A'}
                              </div>
                              <span className="font-black text-slate-900">{rev.user_name}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <span className="text-amber-400 text-sm tracking-tighter">{'★'.repeat(rev.rating)}</span>
                                {(user?.id === rev.user || user?.is_staff) && (
                                  <div className="relative group/menu">
                                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500">
                                      <MoreVertical size={16} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-xl py-2 px-2 hidden group-hover/menu:block z-50 min-w-[120px]">
                                      <button 
                                        onClick={() => handleDeleteReview(rev.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 size={12} /> Delete Report
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                          </div>
                          <p className="text-slate-600 italic leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Review Button */}
                  {isLoggedIn && (
                    <div className="bg-blue-600 rounded-[2.5rem] p-8 md:p-12 text-white">
                       <h4 className="text-xl md:text-2xl font-black mb-2 px-1">How's the gear performing?</h4>
                       <p className="text-blue-100 mb-8 px-1">Your feedback helps fellow anglers choose the right tackle.</p>
                       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                          <div className="flex gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} onClick={() => setRating(s)} className={`text-3xl transition-transform active:scale-90 ${rating >= s ? 'text-amber-400' : 'text-white/20'}`}>★</button>
                            ))}
                          </div>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your catch report..."
                            className="w-full p-6 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-white/10 outline-none focus:border-white/40 transition-all h-32 mb-6"
                          />
                          <button
                            onClick={submitReview}
                            disabled={isSubmittingReview || !comment.trim()}
                            className="w-full bg-white text-blue-600 py-4 rounded-xl font-black hover:bg-blue-50 transition-all disabled:opacity-50"
                          >
                            {isSubmittingReview ? 'Reporting...' : 'Submit Catch Report ⚓'}
                          </button>
                       </div>
                    </div>
                  )}

                  {!isLoggedIn && (
                    <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center text-white border border-slate-800 mt-10">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="text-amber-400" size={32} />
                      </div>
                      <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">Share your catch experience!</h4>
                      <p className="text-slate-400 mb-8 max-w-sm mx-auto">Only verified anglers can post catch reports. Sign in to join the community.</p>
                      <button 
                        onClick={() => { setSelectedProduct(null); router.push('/login?redirect=profile'); }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl"
                      >
                        Sign In to Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400 animate-pulse">Loading KSR Gear...</div>}>
      <HomeContent />
    </Suspense>
  );
}