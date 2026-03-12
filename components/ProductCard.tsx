"use client"
import { Heart } from 'lucide-react';
import React from 'react';

interface ProductCardProps {
    product: any;
    onSelect: (product: any) => void;
    onAddToCart: (e: React.MouseEvent, product: any) => void;
    onToggleWishlist: (product: any) => void;
    isInWishlist: (id: number) => boolean;
}

export default function ProductCard({ product, onSelect, onAddToCart, onToggleWishlist, isInWishlist }: ProductCardProps) {
    const [currentImgIndex, setCurrentImgIndex] = React.useState(0);
    const [isHovered, setIsHovered] = React.useState(false);
    const images = product.images && product.images.length > 0 
        ? [product.image, ...product.images.map((img: any) => img.image)]
        : [product.image];

    React.useEffect(() => {
        let interval: any;
        if (isHovered && images.length > 1) {
            interval = setInterval(() => {
                setCurrentImgIndex((prev) => (prev + 1) % images.length);
            }, 1200);
        } else {
            setCurrentImgIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    return (
        <div
            onClick={() => onSelect(product)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
        >
            <div className="aspect-square overflow-hidden bg-slate-50 relative shrink-0">
                <img
                    src={images[currentImgIndex]}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    alt={product.name}
                />
                
                {/* Slideshow dots */}
                {images.length > 1 && isHovered && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {images.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-1 rounded-full transition-all ${i === currentImgIndex ? 'bg-blue-600 w-4' : 'bg-slate-300 w-1'}`} 
                            />
                        ))}
                    </div>
                )}

                {/* Heart Icon for Wishlist */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg transition-all active:scale-90 hover:bg-white z-20 group/heart"
                >
                    <Heart
                        size={18}
                        className={`transition-all ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover/heart:text-red-400'}`}
                    />
                </button>

                {product.stock > 0 && (
                    <button
                        onClick={(e) => onAddToCart(e, product)}
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
    );
}
