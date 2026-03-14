"use client"
import Link from 'next/link';
import { Mail, Phone, MapPin, Fish } from 'lucide-react';
import { useState, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';

interface BrandEntry {
    name: string;
    image: string | null;
}

export default function Footer() {
    const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Ksr+Aqua+World+Thirunalloor+Kerala+688541&query_place_id=ChIJ43QfzrJ7CDsRJIz2eKSKUEk";
    const router = useRouter();
    const [brands, setBrands] = useState<BrandEntry[]>([]);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const { isLoggedIn } = useContext(AuthContext);

    const handleProtectedLink = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        if (!isLoggedIn) {
            router.push(`/login?redirect=${href.replace('/', '')}&message=login_required`);
        } else {
            router.push(href);
        }
    };

    useEffect(() => {
        // Fetch from dedicated /api/brands/ (admin-managed logos) + products (fallback images)
        Promise.all([
            axios.get('https://alnroy.pythonanywhere.com/api/brands/').catch(() => ({ data: [] })),
            axios.get('https://alnroy.pythonanywhere.com/api/products/').catch(() => ({ data: [] })),
        ]).then(([brandsRes, productsRes]) => {
            const brandData: any[] = brandsRes.data?.results || (Array.isArray(brandsRes.data) ? brandsRes.data : []);
            const products: any[] = productsRes.data?.results || (Array.isArray(productsRes.data) ? productsRes.data : []);

            // Build product image fallback: brand_name (lowercase) → first product image
            const productImageMap = new Map<string, string>();
            products.forEach((p: any) => {
                if (p.brand_name && !productImageMap.has(p.brand_name.toLowerCase()) && p.image) {
                    productImageMap.set(p.brand_name.toLowerCase(), p.image);
                }
            });

            if (brandData.length > 0) {
                // Use dedicated Brand records from /api/brands/
                const entries: BrandEntry[] = brandData.map((b: any) => ({
                    name: b.name,
                    // Prefer admin-uploaded logo, otherwise use first product image of that brand
                    image: b.logo_url || productImageMap.get(b.name.toLowerCase()) || null,
                }));
                setBrands(entries);
            } else {
                // Fallback: derive brands from product brand_name field
                const brandMap = new Map<string, string | null>();
                products.forEach((p: any) => {
                    if (p.brand_name?.trim() && !brandMap.has(p.brand_name.trim())) {
                        brandMap.set(p.brand_name.trim(), p.image || null);
                    }
                });
                const entries: BrandEntry[] = Array.from(brandMap.entries()).map(([name, image]) => ({ name, image }));
                setBrands(entries);
            }
        });
    }, []);

    // Center detection logic
    useEffect(() => {
        if (brands.length === 0) return;

        let rafId: number;
        const checkCenter = () => {
            if (!marqueeRef.current) return;
            
            const items = marqueeRef.current.querySelectorAll('.marquee-item');
            const containerRect = marqueeRef.current.getBoundingClientRect();
            const center = containerRect.left + containerRect.width / 2;

            let closestIdx = -1;
            let minDiff = Infinity;

            items.forEach((item, idx) => {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.left + rect.width / 2;
                const diff = Math.abs(center - itemCenter);

                if (diff < minDiff) {
                    minDiff = diff;
                    closestIdx = idx;
                }
            });

            // If it's within a reasonable distance of the center, make it active
            if (minDiff < 100) {
                setActiveIndex(closestIdx);
            } else {
                setActiveIndex(null);
            }

            rafId = requestAnimationFrame(checkCenter);
        };

        rafId = requestAnimationFrame(checkCenter);
        return () => cancelAnimationFrame(rafId);
    }, [brands.length]);

    const handleBrandClick = (brandName: string) => {
        router.push(`/?search=${encodeURIComponent(brandName.toLowerCase())}#products`);
    };

    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">

            {/* ===== BRAND MARQUEE ===== */}
            {brands.length > 0 && (
                <div className="w-full bg-slate-900/50 border-y border-slate-800/50 py-12 mb-16 overflow-hidden relative group/marquee">
                    {/* Background Glow */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                    
                    <div className="text-center mb-8">
                        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-500 flex items-center justify-center gap-4">
                            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-slate-700"></span>
                            Industry Leading Partners
                            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-slate-700"></span>
                        </p>
                    </div>

                    <div className="relative flex items-center h-40 md:h-48 overflow-hidden group" ref={marqueeRef}>
                        <div className="flex animate-marquee-custom whitespace-nowrap gap-12 md:gap-24 px-12 md:px-24 items-center">
                            {/* Duplicate brands for infinite loop */}
                            {[...brands, ...brands].map((brand, i) => {
                                const isActive = activeIndex === i;
                                return (
                                    <button
                                        key={`${brand.name}-${i}`}
                                        onClick={() => handleBrandClick(brand.name)}
                                        className={`marquee-item flex flex-col items-center gap-4 cursor-pointer transition-all duration-700 select-none outline-none group/item
                                            ${isActive ? 'scale-125 z-20' : 'scale-90 z-10'}`}
                                    >
                                        <div className="relative">
                                            {/* Logo Container */}
                                            <div className={`w-32 h-16 md:w-48 md:h-24 flex items-center justify-center p-4 transition-all duration-700 
                                                ${isActive ? 'grayscale-0' : 'grayscale group-hover/item:grayscale-0 group-focus/item:grayscale-0'}`}>
                                                {brand.image ? (
                                                    <img
                                                        src={brand.image}
                                                        alt={brand.name}
                                                        className={`max-w-full max-h-full object-contain filter drop-shadow-lg transition-transform duration-700
                                                            ${isActive ? 'scale-110' : 'group-hover/item:scale-110'}`}
                                                    />
                                                ) : (
                                                    <span className={`text-xl md:text-3xl font-black transition-colors uppercase tracking-widest
                                                        ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover/item:text-blue-400'}`}>
                                                        {brand.name}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Center Highlighting & Hover Glow */}
                                            <div className={`absolute inset-0 -z-10 rounded-full blur-3xl transition-all duration-700 scale-150
                                                ${isActive ? 'bg-blue-500/20' : 'bg-blue-500/0 group-hover/item:bg-blue-500/10'}`}></div>
                                        </div>

                                        {/* Brand Label */}
                                        <div className={`flex flex-col items-center transition-all duration-500
                                            ${isActive ? 'opacity-100' : 'opacity-40 group-hover/item:opacity-100'}`}>
                                            <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-colors
                                                ${isActive ? 'text-white' : 'group-hover/item:text-white'}`}>
                                                {brand.name}
                                            </span>
                                            <div className={`h-1 bg-blue-500 mt-1 rounded-full transition-all duration-500
                                                ${isActive ? 'w-full' : 'w-0 group-hover/item:w-full'}`}></div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Left/Right Fade Gradients for "Idle Space" transition */}
                    <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10"></div>
                </div>
            )}

            {/* ===== FOOTER COLUMNS ===== */}
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 px-4 md:px-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                        <Fish className="text-blue-500" size={32} />
                        <span className="text-2xl font-black tracking-tighter uppercase">KSR Bait & Tackle</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-400">
                        Premium tackle and gear for the modern angler. Owned and managed by <span className="text-white font-bold">Sajeevan</span>.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Navigation</h4>
                    <ul className="space-y-4 text-sm font-medium">
                        <li><Link href="/" className="hover:text-blue-400 transition">Shop Home</Link></li>
                        <li><a href="/my-orders" onClick={(e) => handleProtectedLink(e, '/my-orders')} className="hover:text-blue-400 transition">Order History</a></li>
                        <li><a href="/profile" onClick={(e) => handleProtectedLink(e, '/profile')} className="hover:text-blue-400 transition">My Account</a></li>
                        <li><Link href="/contact" className="hover:text-blue-400 transition">Support</Link></li>
                    </ul>
                </div>

                <div className="md:col-span-2">
                    <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Reach Our Crew</h4>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex gap-4">
                            <MapPin className="text-blue-500 shrink-0" size={20} />
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm leading-relaxed hover:text-white transition">
                                KSR Bait & Tackle,<br />Thirunalloor, Kerala 688541
                            </a>
                        </div>
                        <div className="space-y-3">
                            <a href="tel:7511136171" className="flex items-center gap-4 text-sm hover:text-white transition">
                                <Phone className="text-blue-500" size={18} /> 7511136171
                            </a>
                            <a href="mailto:alanroyff101@gmail.com" className="flex items-center gap-4 text-sm hover:text-white transition underline decoration-blue-500/50">
                                <Mail className="text-blue-500" size={18} /> alanroyff101@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1500px] mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">© 2026 KSR Bait & Tackle. All Rights Reserved.</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">
                    Engineered by <a href="https://www.linkedin.com/in/alan-roy-a87887315/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors underline decoration-slate-700">Alan Roy</a>
                </p>
            </div>
        </footer>
    );
}