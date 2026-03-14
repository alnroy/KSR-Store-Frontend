"use client"
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Play, ShoppingBag } from 'lucide-react';

interface ShoppableVideo {
    id: number;
    title: string;
    video_file: string;
    product: number;
    product_name: string;
    product_price: string;
    product_offer_price: string | null;
    product_image: string;
}

export default function ShoppableVideos({ onProductSelect }: { onProductSelect: (productId: number) => void }) {
    const [videos, setVideos] = useState<ShoppableVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios.get('https://alnroy.pythonanywhere.com/api/videos/')
            .then(res => {
                const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
                setVideos(data);
            })
            .catch(err => console.error("Error fetching videos:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="my-20 px-4 max-w-[1500px] mx-auto">
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-[2.5rem] animate-pulse">
                    <p className="font-black text-slate-300 uppercase tracking-widest">Loading Action Gear...</p>
                </div>
            </div>
        );
    }

    if (videos.length === 0) return null;

    return (
        <div className="my-20 px-4 max-w-[1500px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Gear in Action 🎣</h2>
                  <p className="text-slate-500 font-bold mt-1 text-sm md:text-base">Real anglers, real performance. Tap to play and shop.</p>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x pb-4"
            >
                {videos.map((vid) => (
                    <div 
                        key={vid.id}
                        className="relative w-[280px] md:w-[350px] aspect-[9/16] shrink-0 rounded-[2.5rem] overflow-hidden group snap-start shadow-xl bg-slate-100"
                    >
                        <video 
                            src={vid.video_file}
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            onClick={(e) => {
                                const video = e.currentTarget;
                                if (video.paused) {
                                    video.play();
                                } else {
                                    video.pause();
                                }
                            }}
                            className="w-full h-full object-cover cursor-pointer"
                        />
                        
                        {/* Overlay Gradient - Added pointer-events-none so it doesn't block clicks to the video */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        {/* Product Tag */}
                        <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent video play/pause when clicking the shop button
                                    onProductSelect(vid.product);
                                }}
                                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex items-center gap-4 hover:bg-white/20 transition-all text-white text-left overflow-hidden"
                                suppressHydrationWarning
                            >
                                <img src={vid.product_image} className="w-12 h-12 rounded-xl object-cover bg-white shrink-0" alt="" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">Featured gear</p>
                                    <p className="font-bold text-xs truncate text-white">{vid.product_name}</p>
                                    <p className="text-sm font-black text-white">₹{vid.product_offer_price || vid.product_price}</p>
                                </div>
                                <div className="bg-blue-600 p-2 rounded-xl shrink-0">
                                    <ShoppingBag size={16} />
                                </div>
                            </button>
                        </div>


                    </div>
                ))}

                {/* Info Card at end */}
                <div 
                    className="relative w-[280px] md:w-[350px] aspect-[9/16] shrink-0 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center p-8 text-center text-white snap-start shadow-2xl"
                    style={{ 
                        backgroundImage: `url('/insta_logo.jpg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Glassmorphic Overlay */}
                    <div className="absolute inset-0  backdrop-blur-[2px] backdrop-brightness-75"></div>

                    <div className="relative z-10 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 border border-white/30 backdrop-blur-md">
                        <ShoppingBag size={40} className="text-white" />
                    </div>
                    <h3 className="relative z-10 text-2xl font-black mb-4 italic tracking-tight uppercase">Want to see more gear in action?</h3>
                    <p className="relative z-10 text-white font-bold mb-8 text-sm">Checkout our Insta profile and follow for the latest catch reports!</p>
                    <a 
                        href="https://www.instagram.com/ksr_bait_and_tackle?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform"
                    >
                        Join the Dock →
                    </a>
                </div>
            </div>
        </div>
    );
}

