"use client"
import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    X, Heart, ChevronRight, Award, Package, 
    ChevronDown, User, LogOut, LayoutDashboard 
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { WishlistContext } from '@/context/WishlistContext';
import axios from 'axios';

interface SidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
    const router = useRouter();
    const { isLoggedIn, logout, user } = useContext(AuthContext);
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const [products, setProducts] = useState<any[]>([]);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Deep Menu State
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeAttribute, setActiveAttribute] = useState<string | null>(null);
    
    // Custom Price Range State
    const [maxPriceRange, setMaxPriceRange] = useState<number>(10000);

    useEffect(() => {
        if (isOpen) {
            axios.get('https://alnroy.pythonanywhere.com/api/products/')
                .then(res => setProducts(res.data.results || res.data))
                .catch(err => console.error(err));
            
            if (isLoggedIn) {
                const token = localStorage.getItem('access_token');
                axios.get('https://alnroy.pythonanywhere.com/api/auth/me/', {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(res => setIsAdmin(res.data.is_staff));
            }
        }
    }, [isOpen, isLoggedIn]);

    const toggleSection = (id: string) => {
        setExpandedSections(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

  const handleBudgetFilter = (min: number, max: number) => {
    onClose();
    router.push(`/?min_price=${min}&max_price=${max}#products`);
  };

  const handleFrequentFilter = () => {
    onClose();
    router.push(`/?filter=frequently_bought#products`);
  };

  const getProductsInBudget = (min: number, max: number) => {
    return products.filter(p => {
      const price = parseFloat(p.offer_price || p.price);
      return price >= min && price <= max;
    });
  };

    // --- NESTED ATTRIBUTE LOGIC ---
    const categories = Array.from(new Set(products.map(p => p.category_name).filter(Boolean)));
    const getAttributesForCategory = (cat: string) => {
        const catProducts = products.filter(p => p.category_name === cat);
        const attrs: Record<string, Set<string>> = {};
        catProducts.forEach(p => {
            p.variants?.forEach((v: any) => {
                if (!attrs[v.attribute_name]) attrs[v.attribute_name] = new Set();
                attrs[v.attribute_name].add(v.value);
            });
        });
        return attrs;
    };

    const getProductsForAttribute = (cat: string, attrName: string, attrVal: string) => {
        return products.filter(p => 
            p.category_name === cat && 
            p.variants?.some((v: any) => v.attribute_name === attrName && v.value === attrVal)
        );
    };

    return (
        <div className={`fixed inset-0 z-[200] overflow-hidden transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
                onClick={onClose} 
            />
            
            <div 
                className={`absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black" suppressHydrationWarning>
                            {!mounted ? 'G' : (isLoggedIn ? user?.username?.[0] || 'U' : 'G')}
                        </div>
                        <div suppressHydrationWarning>
                            <p className="text-sm font-black tracking-tight">{!mounted ? 'Guest Angler' : (isLoggedIn ? `Captain ${user?.username}` : 'Guest Angler')}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{!mounted ? 'Limited Access' : (isLoggedIn ? 'Member' : 'Limited Access')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    
                    {/* Main Actions */}
                    <div className="p-4 border-b border-slate-100 pb-2">
                        <Link href="/" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all">
                            🏠 Home Feed
                        </Link>
                    </div>

                    {/* Admin/User Links */}
                    <div className="p-4 space-y-2 border-b border-slate-100">
                        {mounted ? (
                            isLoggedIn ? (
                                <>
                                    {isAdmin && (
                                        <Link href="/admin-dashboard" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all">
                                            <LayoutDashboard size={18} /> Admin Dashboard
                                        </Link>
                                    )}
                                    <Link href="/my-orders" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all">
                                        <Package size={18} /> My Orders
                                    </Link>
                                    <Link href="/profile" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all">
                                        <User size={18} /> My Account
                                    </Link>
                                    <button onClick={() => { logout(); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-500 font-bold text-sm transition-all">
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" onClick={onClose} className="flex items-center gap-3 p-4 rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                                    <User size={18} /> Login to KSR Bait & Tackle
                                </Link>
                            )
                        ) : (
                            <div className="h-[52px] w-full bg-slate-50 animate-pulse rounded-xl"></div>
                        )}
                    </div>

                    {/* Navigation Menu */}
                    <div className="p-4 space-y-6">
                        
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Budget Tackle</p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Pocket Friendly', min: 0, max: 500 },
                                    { label: 'Standard Gear', min: 500, max: 5000 },
                                    { label: 'Pro Equipment', min: 5000, max: 999999 }
                                ].map((b) => (
                                    <div key={b.label} className="space-y-2">
                                        <button 
                                            onClick={() => toggleSection(`budget-${b.label}`)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition-all ${expandedSections.includes(`budget-${b.label}`) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                                        >
                                            <div className="flex flex-col items-start">
                                                <span>{b.label}</span>
                                                <span className={`text-[9px] uppercase tracking-widest ${expandedSections.includes(`budget-${b.label}`) ? 'text-blue-200' : 'text-slate-400'}`}>₹{b.min} - ₹{b.max}</span>
                                            </div>
                                            <ChevronDown size={14} className={`transition-transform ${expandedSections.includes(`budget-${b.label}`) ? 'rotate-180' : ''}`} />
                                        </button>

                                        {expandedSections.includes(`budget-${b.label}`) && (
                                            <div className="pl-2 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-2" id={`scroll-budget-${b.label}`}>
                                                    {getProductsInBudget(b.min, b.max).map(p => (
                                                        <div 
                                                            key={p.id} 
                                                            onClick={() => { router.push(`/?product_id=${p.id}#products`); onClose(); }}
                                                            className="flex items-center gap-3 p-2 rounded-xl border border-slate-50 hover:border-blue-100 bg-white group cursor-pointer transition-all"
                                                        >
                                                            <img src={p.image} className="w-10 h-10 object-cover rounded-lg" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{p.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">₹{p.offer_price || p.price}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button 
                                                    onClick={() => handleBudgetFilter(b.min, b.max)}
                                                    className="w-full py-2 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
                                                >
                                                    View All in shop →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Custom Price Range Slider */}
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Custom Price Limit</p>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Starting at</p>
                                            <p className="text-sm font-black text-slate-900">₹0</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase">Up to</p>
                                            <p className="text-xl font-black text-blue-600">₹{maxPriceRange.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    <input 
                                        type="range" 
                                        min="100" 
                                        max="20000" 
                                        step="100"
                                        value={maxPriceRange}
                                        onChange={(e) => setMaxPriceRange(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    
                                    <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                                        <span>₹100</span>
                                        <span>₹5k</span>
                                        <span>₹10k</span>
                                        <span>₹15k</span>
                                        <span>₹20k+</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleBudgetFilter(0, maxPriceRange)}
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Apply Filter ⚡
                                </button>
                                
                                {maxPriceRange !== 10000 && (
                                    <button 
                                        onClick={() => { setMaxPriceRange(10000); handleBudgetFilter(0, 999999); }}
                                        className="w-full text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors pt-1"
                                    >
                                        Reset to Default
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* Special Collections */}
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Collections</p>
                            <button onClick={handleFrequentFilter} className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 transition-all mb-2">
                                <Award size={18} /> Frequently Bought Items
                            </button>
                            <button onClick={() => toggleSection('wishlist')} className="w-full flex items-center justify-between p-3 rounded-xl bg-pink-50 text-pink-600 font-bold text-sm hover:bg-pink-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <Heart size={18} /> My Wishlist ({wishlist.length})
                                </div>
                                <ChevronDown size={16} className={`transition-transform ${expandedSections.includes('wishlist') ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Wishlist Dropdown Content */}
                            {expandedSections.includes('wishlist') && (
                                <div className="mt-2 space-y-2 pl-2">
                                    {wishlist.length === 0 ? (
                                        <p className="text-[10px] text-slate-400 italic p-2 text-center">No gear wishlisted yet.</p>
                                    ) : (
                                        wishlist.map((item: any) => (
                                            <div 
                                                key={item.id} 
                                                onClick={() => { router.push(`/?product_id=${item.id}#products`); onClose(); }}
                                                className="flex items-center gap-3 p-2 rounded-lg border border-slate-50 hover:border-pink-100 group cursor-pointer"
                                            >
                                                <img src={item.image} className="w-10 h-10 object-cover rounded-md" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{item.name}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold">₹{item.offer_price || item.price}</p>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }} className="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Hierarchical Categories */}
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Browse by Category</p>
                            <div className="space-y-4">
                                {categories.map(cat => (
                                    <div key={cat} className="space-y-2">
                                        <button 
                                            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition-all ${activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                                        >
                                            {cat} 
                                            <ChevronDown size={14} className={`transition-transform ${activeCategory === cat ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Attributes Sub-menu */}
                                        {activeCategory === cat && (
                                            <div className="pl-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                                {Object.entries(getAttributesForCategory(cat)).map(([attrName, values]) => (
                                                    <div key={attrName} className="space-y-2">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{attrName}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Array.from(values).map(val => (
                                                                <div key={val} className="relative group">
                                                                    <button 
                                                                        onClick={() => setActiveAttribute(activeAttribute === `${cat}-${attrName}-${val}` ? null : `${cat}-${attrName}-${val}`)}
                                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all ${activeAttribute === `${cat}-${attrName}-${val}` ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-400'}`}
                                                                    >
                                                                        {val}
                                                                    </button>

                                                                    {/* NESTED PRODUCTS */}
                                                                    {activeAttribute === `${cat}-${attrName}-${val}` && (
                                                                        <div className="fixed left-full top-20 ml-2 w-64 bg-white shadow-2xl rounded-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-left-4 hidden lg:block">
                                                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">{attrName}: {val}</p>
                                                                            <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                                                                                {getProductsForAttribute(cat, attrName, val).map(p => (
                                                                                    <div onClick={() => { router.push(`/?search=${p.name}#products`); onClose(); }} key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer group">
                                                                                        <img src={p.image} className="w-12 h-12 object-cover rounded-lg" />
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="text-[10px] font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{p.name}</p>
                                                                                            <p className="text-[10px] text-slate-400 font-bold">₹{p.offer_price || p.price}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Mobile Nested View */}
                                                                    {activeAttribute === `${cat}-${attrName}-${val}` && (
                                                                        <div className="w-full mt-2 pl-4 space-y-2 lg:hidden">
                                                                            {getProductsForAttribute(cat, attrName, val).map(p => (
                                                                                <div onClick={() => { router.push(`/?search=${p.name}#products`); onClose(); }} key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                                                                                    <img src={p.image} className="w-10 h-10 object-cover rounded-md" />
                                                                                    <div className="flex-1 min-w-0 text-[10px] font-bold text-slate-700 truncate">{p.name}</div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                <button 
                                                    onClick={() => { router.push(`/?category=${cat}#products`); onClose(); }}
                                                    className="w-full py-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-t border-slate-100 mt-2"
                                                >
                                                    View All {cat} Gear →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

            </div>
        </div>
    );
}
