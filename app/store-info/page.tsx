"use client"
import React, { useState } from 'react';
import { MapPin, Clock, Star, Camera, Video, ExternalLink, ShieldCheck, Map as MapIcon, Fish, Anchor, Heart, X, ChevronRight, ChevronLeft } from 'lucide-react';

export default function StoreInfoPage() {
    const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Ksr+Aqua+World+Cherthala-Arookutty+Rd,+near+Chenganda+Bridge,+Kerala+688541&query_place_id=ChIJ43QfzrJ7CDsRJIz2eKSKUEk";
    
    const [activeGallery, setActiveGallery] = useState<'aquatic' | 'tackle' | null>(null);

    const openingHours = [
        { day: 'Monday', hours: '9:00 AM – 9:00 PM' },
        { day: 'Tuesday', hours: '9:00 AM – 9:00 PM' },
        { day: 'Wednesday', hours: '9:00 AM – 9:00 PM' },
        { day: 'Thursday', hours: '9:00 AM – 9:00 PM' },
        { day: 'Friday', hours: '9:00 AM – 9:00 PM' },
        { day: 'Saturday', hours: '9:00 AM – 9:00 PM' },
        { day: 'Sunday', hours: '10:00 AM – 4:00 PM' },
    ];

    const reviews = [
        { name: 'Aby World', rating: 5, text: 'Nice shop. Good collection', time: 'a year ago' },
        { name: 'ALL IS WELL MALAYALAM', rating: 5, text: 'All items will get in fare rate, and lots of collection\'s too. Need to show all items in good display, customer dealing is very good.', time: '2 years ago' },
        { name: 'Vysagh.T.s', rating: 5, text: 'Good service', time: 'a year ago' },
    ];

    const galleries = {
        aquatic: [
            { url: 'https://media.istockphoto.com/id/672477898/photo/set-of-pink-fighting-fish.webp?a=1&b=1&s=612x612&w=0&k=20&c=vv1klb-3qMAUhRs3vns-LkhhV4XvdoUUTzm7Tgxu484=', title: 'Exotic Betta Collection' },
            { url: 'https://plus.unsplash.com/premium_photo-1722857069244-0a5944491d9d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fEdvbGRmaXNoJTIwJTI2JTIwQ2FycHxlbnwwfHwwfHx8MA%3D%3D', title: 'Goldfish & Carp' },
            { url: 'https://images.unsplash.com/photo-1754848158756-d81726b57617?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fEFxdWFyaXVtJTIwUGxhbnRzfGVufDB8fDB8fHww', title: 'Aquarium Plants' },
            { url: 'https://plus.unsplash.com/premium_photo-1725400833844-002996739d10?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8VHJvcGljYWwlMjBTcGVjaWVzfGVufDB8fDB8fHww', title: 'Tropical Species' }
        ],
        tackle: [
            { url: 'https://images.unsplash.com/photo-1619054976487-7198b8924922?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fFJvZHMlMjBhbmQlMjBSZWVsc3xlbnwwfHwwfHx8MA%3D%3D', title: 'Premium Rods & Reels' },
            { url: 'https://media.istockphoto.com/id/955256342/photo/fishing-lures-on-white-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=V2GvXnfICTF9C72LhsTmF_ZJhLYsxSUcwj32-ijGMB4=', title: 'Hooks & Lures' },
            { url: 'https://media.istockphoto.com/id/539124204/photo/fishing-box.webp?a=1&b=1&s=612x612&w=0&k=20&c=RMbkkHuWPUxNwGB0PHpBQjR0KSMNpyjD6cj8S42iQMI=', title: 'Frog Lures & Shads' },
            { url: 'https://media.istockphoto.com/id/2215840308/photo/fishing-tackles-and-fishing-baits-in-box-classic-colored-fishing-lure-beautiful-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=arWPjKToM-Cx6MPBKUedRo9q6ZLSqkMZzPCHEUcGL54=', title: 'Artificial Baits' }
        ]
    };

    return (
        <div className="bg-white min-h-screen">
            {/* GALLERY OVERLAY */}
            {activeGallery && (
                <div className="fixed inset-0 z-[500] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto animate-in fade-in duration-300">
                    <div className="w-full max-w-7xl flex justify-end mb-8">
                        <button 
                            onClick={() => setActiveGallery(null)}
                            className="text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-8 h-8 md:w-10 md:h-10" />
                        </button>
                    </div>
                    
                    <div className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        {galleries[activeGallery].map((img, i) => (
                            <div key={i} className="group relative aspect-square rounded-[2rem] overflow-hidden bg-white/5 border border-white/10">
                                <img src={img.url} alt={img.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110" />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white font-black text-xs uppercase tracking-widest">{img.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="pb-12 text-center mt-auto">
                        <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em]">KSR {activeGallery === 'aquatic' ? 'Aquarium' : 'Tackle'} Collection</p>
                    </div>
                </div>
            )}

            {/* HER0 SECTION */}
            <div className="relative h-[60vh] md:h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-slate-900">
                    <img 
                        src="/insta_logo.jpg" 
                        alt="KSR Store" 
                        className="w-full h-full object-cover pb-10 pt-10 opacity-100 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-white"></div>
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 px-4 py-2 rounded-full mb-6 italic">
                        <ShieldCheck className="text-blue-400 w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="text-blue-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Verified Physical Business</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic leading-[0.9] sm:leading-tight">
                        KSR <span className="text-blue-500">Bait & Tackle</span>
                    </h1>
                    <p className="text-slate-300 text-sm sm:text-base md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
                        Cherthala-Arookutty Rd, near Chenganda Bridge, Kerala. <br className="hidden sm:block"/>
                        Exotic ornamental fish, custom aquariums, and professional-grade KastKing fishing tackle.
                    </p>
                </div>
            </div>

            {/* LOCATION & HOURS GRID */}
            <div className="max-w-7xl mx-auto px-4 -mt-10 md:-mt-20 relative z-20 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* INFO CARD */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-6 md:p-12 border-b border-slate-50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Heritage Physical Location</h2>
                                    <div className="flex items-start md:items-center gap-2 text-slate-500">
                                        <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5 md:mt-0" />
                                        <span className="text-sm font-bold">Cherthala-Arookutty Rd, near Chenganda Bridge, Kerala 688541</span>
                                    </div>
                                </div>
                                <a 
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 md:px-8 py-4 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
                                >
                                    <MapIcon className="w-[18px] h-[18px]" />
                                    Get Directions
                                    <ExternalLink className="w-[14px] h-[14px] group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto sm:mx-0 mb-4">
                                        <Fish className="text-blue-600 w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-slate-900">Aquatic Experts</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Exotic Ornamental Fish & Custom Aquarium Setup</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto sm:mx-0 mb-4">
                                        <Anchor className="text-green-600 w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-slate-900">Professional Gear</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Premium Rods, Reels & Baits for Serious Anglers</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto sm:mx-0 mb-4">
                                        <Star className="text-purple-600 w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-slate-900">Top Rated</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">4.5+ Stars with Trusted Local Community Support</p>
                                </div>
                            </div>
                        </div>

                        {/* MAP PLACEHOLDER / EMBED */}
                        <div className="flex-1 bg-slate-100 relative min-h-[300px] md:min-h-[400px]">
                             <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3932.676343564998!2d76.35477107412797!3d9.708647078345155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087bb2ce1f74e3%3A0x49508aa478f68c24!2sKsr%20Aqua%20World!5e0!3m2!1sen!2sin!4v174219097787" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen={true} 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 grayscale contrast-[1.1]"
                            ></iframe>
                        </div>
                    </div>

                    {/* OPENING HOURS CARD */}
                    <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                                <Clock className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Open Times</h3>
                        </div>

                        <div className="space-y-6">
                            {openingHours.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center group">
                                    <span className={`text-xs md:text-sm font-black uppercase tracking-widest ${item.day === 'Sunday' ? 'text-blue-400' : 'text-slate-400'}`}>
                                        {item.day}
                                    </span>
                                    <span className="h-px bg-slate-800 flex-1 mx-4 group-hover:bg-blue-500/30 transition-colors"></span>
                                    <span className="text-xs md:text-sm font-bold">{item.hours}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Note</p>
                            <p className="text-xs text-slate-300 font-medium">Holiday hours may vary. Please contact us via WhatsApp to confirm.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="bg-slate-50 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Voices of Our Community 💬</h2>
                        <p className="text-slate-500 font-medium text-sm md:text-base px-4">Real reviews from our valued customers on Google Maps</p>
                        <div className="flex items-center justify-center gap-1 mt-6">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="#2563eb" className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />)}
                            <span className="ml-3 text-lg md:text-xl font-black text-slate-900">4.5 / 5.0</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {reviews.map((rev, idx) => (
                            <div key={idx} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 hover:-translate-y-2 transition-transform duration-500 text-left">
                                <div className="flex items-center gap-1 mb-4 md:mb-6">
                                    {[...Array(rev.rating)].map((_, i) => <Star key={i} fill="#2563eb" className="text-blue-600 w-3.5 h-3.5 md:w-4 md:h-4" />)}
                                </div>
                                <p className="text-slate-600 font-medium italic mb-6 md:mb-8 leading-relaxed text-sm">"{rev.text}"</p>
                                <div className="flex items-center justify-between border-t border-slate-50 pt-4 md:pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-sm">
                                            {rev.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-xs md:text-sm leading-none mb-1">{rev.name}</p>
                                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Google Review</p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] md:text-[10px] text-slate-300 font-bold">{rev.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 md:mt-16">
                        <a 
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-4 text-blue-600 font-black text-xs uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
                        >
                            Read all reviews on Maps →
                        </a>
                    </div>
                </div>
            </div>

            {/* GALLERIES / VISUAL PROOF */}
            <div className="py-16 md:py-24 max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16 text-center md:text-left">
                    <div>
                        <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic leading-tight">The KSR Experience</h2>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto md:mx-0 text-sm md:text-base">
                            We pride ourselves on maintaining a clean, professional, and well-stocked physical store. Click below to explore our sections.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:grid-rows-2 h-auto md:h-[800px]">
                    <button 
                        onClick={() => setActiveGallery('aquatic')}
                        className="md:col-span-2 md:row-span-2 bg-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group relative text-left h-[350px] md:h-auto"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=2000" 
                            alt="Aquarium Interior" 
                            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 bg-gradient-to-t from-black/90 to-transparent">
                            <span className="text-blue-400 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-2 md:mb-4 block">Interactive Gallery</span>
                            <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2 italic">Exotic Aquatic Life</h3>
                            <p className="text-slate-300 text-xs md:text-sm font-medium">Click to view our tanks, exotic fish, and aquarium setups.</p>
                        </div>
                    </button>
                    
                    <button 
                         onClick={() => setActiveGallery('tackle')}
                         className="md:col-span-2 bg-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group relative text-left h-[250px] md:h-auto"
                    >
                        <img 
                            src="https://plus.unsplash.com/premium_photo-1723568452446-0c8ce2461a08?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8aG9va3MlMjBhbmQlMjB0YWNrbGVzJTIwZmlzaGluZ3xlbnwwfHwwfHx8MA%3D%3D" 
                            alt="Fishing Tackle" 
                            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-black/90 to-transparent">
                            <span className="text-blue-400 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-2 block">Interactive Gallery</span>
                            <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tighter italic">Hook & Tackle Shop</h3>
                            <p className="text-slate-300 text-[10px] md:text-xs font-medium">Browse our collection of rods, reels, frog lures, and shads.</p>
                        </div>
                    </button>
                    
                    <div className="bg-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group relative h-[200px] md:h-auto">
                        <img 
                            src="/insta_logo.jpg" 
                            alt="Storefront" 
                            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-white font-black text-[8px] md:text-xs uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">KSR Branding</span>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col items-center justify-center text-center p-6 md:p-8 group overflow-hidden relative h-[200px] md:h-auto">
                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Camera className="text-blue-500 mb-4 md:mb-6 group-hover:scale-110 transition-transform w-8 h-8 md:w-10 md:h-10" />
                        <h4 className="text-white font-black uppercase tracking-tighter text-lg md:text-xl mb-3 md:mb-4 relative z-10">See More on Maps</h4>
                        <a 
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2rem] text-blue-400 relative z-10 hover:text-white transition-colors"
                        >
                            Open Gallery →
                        </a>
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-16 md:py-20 px-4">
                <div className="max-w-4xl mx-auto bg-blue-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/40">
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-48 md:w-64 h-48 md:h-64 bg-black/10 rounded-full blur-3xl"></div>
                    
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-6 md:mb-8 tracking-tight uppercase italic relative z-10 leading-tight">Ready to Visit?</h2>
                    <p className="text-blue-100 text-sm md:text-lg mb-8 md:mb-12 relative z-10 font-medium">We're located conveniently on the Cherthala-Arookutty road. Feel free to message us on WhatsApp for live stock availability!</p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 relative z-10">
                        <a 
                            href="https://wa.me/919778796424" 
                            className="w-full sm:w-auto bg-white text-blue-600 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
                        >
                            Chat via WhatsApp
                        </a>
                        <a 
                            href={mapsUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto bg-blue-700 text-white border border-blue-500 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl"
                        >
                            Open Google Maps
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
