"use client"
import React, { useRef, useState } from 'react';
import { Play, Volume2, VolumeX, ShoppingBag } from 'lucide-react';

interface ShoppableVideo {
    id: number;
    videoUrl: string;
    thumbnail: string;
    productId: number;
    productName: string;
    productPrice: string;
    productImage: string;
}

const MOCK_VIDEOS: ShoppableVideo[] = [
    {
        id: 1,
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-fishing-in-a-lake-at-sunset-1215-large.mp4",
        thumbnail: "https://images.unsplash.com/photo-1544372011-80796395b08c",
        productId: 1,
        productName: "Pro Series Spinning Rod",
        productPrice: "4500",
        productImage: "https://images.unsplash.com/photo-1611095782747-1090fbd0759f?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 2,
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-fishing-hook-in-the-water-1216-large.mp4",
        thumbnail: "https://images.unsplash.com/photo-1529230182282-7b1892fe27b7",
        productId: 2,
        productName: "Stealth Braided Line",
        productPrice: "899",
        productImage: "https://images.unsplash.com/photo-1529230182282-7b1892fe27b7?q=80&w=400&auto=format&fit=crop"
    }
];

export default function ShoppableVideos({ onProductSelect }: { onProductSelect: (productId: number) => void }) {
    const [muted, setMuted] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="my-20 px-4 max-w-[1500px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Gear in Action 🎣</h2>
                  <p className="text-slate-500 font-bold mt-1 text-sm md:text-base">Real anglers, real performance. Tap to shop the setup.</p>
                </div>
                <button 
                    onClick={() => setMuted(!muted)}
                    className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all"
                    suppressHydrationWarning
                >
                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            <div 
                ref={scrollRef}
                className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x pb-4"
            >
                {MOCK_VIDEOS.map((vid) => (
                    <div 
                        key={vid.id}
                        className="relative w-[280px] md:w-[350px] aspect-[9/16] shrink-0 rounded-[2.5rem] overflow-hidden group snap-start shadow-xl bg-slate-100"
                    >
                        <video 
                            src={vid.videoUrl}
                            autoPlay
                            loop
                            muted={muted}
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Product Tag */}
                        <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                            <button 
                                onClick={() => onProductSelect(vid.productId)}
                                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex items-center gap-4 hover:bg-white/20 transition-all text-white text-left"
                                suppressHydrationWarning
                            >
                                <img src={vid.productImage} className="w-12 h-12 rounded-xl object-cover bg-white" alt="" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">Featured gear</p>
                                    <p className="font-bold text-xs truncate">{vid.productName}</p>
                                    <p className="text-sm font-black text-white">₹{vid.productPrice}</p>
                                </div>
                                <div className="bg-blue-600 p-2 rounded-xl shrink-0">
                                    <ShoppingBag size={16} />
                                </div>
                            </button>
                        </div>

                        {/* Play Indicator */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                             <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                <Play className="text-white fill-white ml-1" size={32} />
                             </div>
                        </div>
                    </div>
                ))}

                {/* Info Card at end */}
                <div className="relative w-[280px] md:w-[350px] aspect-[9/16] shrink-0 rounded-[2.5rem] bg-blue-600 flex flex-col items-center justify-center p-8 text-center text-white snap-start">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag size={40} />
                    </div>
                    <h3 className="text-2xl font-black mb-4">Want to see more gear in action?</h3>
                    <p className="text-blue-100 font-bold mb-8">Follow our community catch reports and gear tests.</p>
                    <button 
                        className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl"
                        suppressHydrationWarning
                    >
                        Join the Dock →
                    </button>
                </div>
            </div>
        </div>
    );
}
