"use client"
import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ProductSectionProps {
    title: string;
    products: any[];
    itemsPerPage?: number;
    layout?: 'grid' | 'scroll';
    showPagination?: boolean;
    onSelect: (product: any) => void;
    onAddToCart: (e: React.MouseEvent, product: any) => void;
    onToggleWishlist: (product: any) => void;
    isInWishlist: (id: number) => boolean;
}

export default function ProductSection({ 
    title, 
    products, 
    itemsPerPage = 30, 
    layout = 'grid', 
    showPagination = true,
    onSelect, 
    onAddToCart, 
    onToggleWishlist, 
    isInWishlist 
}: ProductSectionProps) {
    const [currentPage, setCurrentPage] = useState(1);
    
    if (!products || products.length === 0) return null;

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentItems = products.slice(indexOfFirstProduct, indexOfLastProduct);

    if (layout === 'scroll') {
        return (
            <div className="mb-16">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <div className="flex gap-2">
                         <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Explore More</span>
                    </div>
                </div>
                <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-6 px-1 snap-x">
                    {products.map((product) => (
                        <div key={product.id} className="w-[180px] md:w-[280px] shrink-0 snap-start">
                            <ProductCard 
                                product={product} 
                                onSelect={onSelect} 
                                onAddToCart={onAddToCart} 
                                onToggleWishlist={onToggleWishlist} 
                                isInWishlist={isInWishlist} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-16 scroll-mt-24" id={title.replace(/\s+/g, '-')}>
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">Page {currentPage} of {totalPages}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {currentItems.map((product) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onSelect={onSelect} 
                        onAddToCart={onAddToCart} 
                        onToggleWishlist={onToggleWishlist} 
                        isInWishlist={isInWishlist} 
                    />
                ))}
            </div>
            
            {showPagination && totalPages > 1 && (
                <div className="flex flex-col items-center gap-6 mt-16 pt-10 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); document.getElementById(title.replace(/\s+/g, '-'))?.scrollIntoView({ behavior: 'smooth' }); }}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                        >
                            <ArrowLeft size={16} /> Previous
                        </button>

                        <div className="flex gap-1 mx-4 hidden md:flex">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button 
                                key={p}
                                onClick={() => { setCurrentPage(p); document.getElementById(title.replace(/\s+/g, '-'))?.scrollIntoView({ behavior: 'smooth' }); }}
                                className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === p ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-500'}`}
                            >
                                {p}
                            </button>
                        ))}
                        </div>

                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); document.getElementById(title.replace(/\s+/g, '-'))?.scrollIntoView({ behavior: 'smooth' }); }}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-black text-xs uppercase tracking-widest"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
