"use client"
import Link from 'next/link';
import { Mail, Phone, MapPin, Fish } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface BrandEntry {
    name: string;
    image: string | null;
}

export default function Footer() {
    const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Ksr+Aqua+World+Thirunalloor+Kerala+688541&query_place_id=ChIJ43QfzrJ7CDsRJIz2eKSKUEk";
    const router = useRouter();
    const [brands, setBrands] = useState<BrandEntry[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

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

    // Auto-advance slideshow
    useEffect(() => {
        if (brands.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % brands.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [brands.length]);

    const handleBrandClick = (brandName: string) => {
        router.push(`/?search=${encodeURIComponent(brandName.toLowerCase())}#products`);
    };

    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-4 border-t border-slate-800">

            {/* ===== BRAND SLIDESHOW ===== */}
            {brands.length > 0 && (
                <div className="bg-slate-800 border-y border-slate-700 py-10 mb-16 shadow-inner">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-8 flex items-center justify-center gap-3">
                            <span className="w-10 h-[1px] bg-slate-700 hidden md:block"></span>
                            Official Hardware Partners
                            <span className="w-10 h-[1px] bg-slate-700 hidden md:block"></span>
                        </p>

                        {/* Slide Container */}
                        <div className="relative h-48 md:h-56 overflow-hidden">
                            {brands.map((brand, i) => (
                                <button
                                    suppressHydrationWarning
                                    key={i}
                                    onClick={() => handleBrandClick(brand.name)}
                                    className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 cursor-pointer group
                    ${i === currentSlide ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 z-0'}`}
                                >
                                    {brand.image ? (
                                        <div className="relative mb-6">
                                            {/* Logo Container - Rectangular and Centered */}
                                            <div className="w-48 h-24 md:w-64 md:h-32 rounded-2xl overflow-hidden border border-white/5 bg-white/5 flex items-center justify-center p-6 group-hover:border-blue-500/50 group-hover:bg-white/10 transition-all shadow-2xl">
                                                <img
                                                    src={brand.image}
                                                    alt={brand.name}
                                                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            {/* Subtle Glow Effect */}
                                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_40px_rgba(59,130,246,0.2)]" />
                                        </div>
                                    ) : (
                                        <div className="mb-6 px-12 py-8 bg-white/5 border border-white/10 group-hover:border-blue-500/60 rounded-2xl transition-all shadow-xl">
                                            <span className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase group-hover:text-blue-400 transition-colors">
                                                {brand.name}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm md:text-lg font-black text-white uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">
                                            {brand.name}
                                        </span>
                                        <div className="w-8 h-[2px] bg-blue-600 mt-2 scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
                                        <span className="text-[10px] font-bold text-slate-500 mt-2 group-hover:text-blue-300 transition-colors uppercase tracking-[0.1em] opacity-60 group-hover:opacity-100">
                                            Tap to explore Gear →
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Navigation Dots */}
                        {brands.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4 relative z-20">
                                {brands.map((_, i) => (
                                    <button
                                        suppressHydrationWarning
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-blue-500 w-8' : 'bg-slate-600 hover:bg-slate-400 w-2'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== FOOTER COLUMNS ===== */}
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                        <Fish className="text-blue-500" size={32} />
                        <span className="text-2xl font-black tracking-tighter uppercase">KSR Store</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-400">
                        Premium tackle and gear for the modern angler. Owned and managed by <span className="text-white font-bold">Sajeevan</span>.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Navigation</h4>
                    <ul className="space-y-4 text-sm font-medium">
                        <li><Link href="/" className="hover:text-blue-400 transition">Shop Home</Link></li>
                        <li><Link href="/my-orders" className="hover:text-blue-400 transition">Order History</Link></li>
                        <li><Link href="/profile" className="hover:text-blue-400 transition">My Account</Link></li>
                        <li><Link href="/contact" className="hover:text-blue-400 transition">Support</Link></li>
                    </ul>
                </div>

                <div className="md:col-span-2">
                    <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Reach Our Crew</h4>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex gap-4">
                            <MapPin className="text-blue-500 shrink-0" size={20} />
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm leading-relaxed hover:text-white transition">
                                Ksr Aqua World,<br />Thirunalloor, Kerala 688541
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

            <div className="max-w-[1500px] mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">© 2026 KSR Store. All Rights Reserved.</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">
                    Engineered by <a href="https://www.linkedin.com/in/alan-roy-a87887315/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors underline decoration-slate-700">Alan Roy</a>
                </p>
            </div>
        </footer>
    );
}