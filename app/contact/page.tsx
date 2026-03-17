"use client"
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
    const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Ksr+Aqua+World+Cherthala-Arookutty+Rd,+near+Chenganda+Bridge,+Kerala+688541&query_place_id=ChIJ43QfzrJ7CDsRJIz2eKSKUEk";

    return (
        <div className="max-w-6xl mx-auto py-20 px-4">
            <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Contact KSR Bait & Tackle</h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">Get in touch with Us for product inquiries or order support.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Phone */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm text-center">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                        <Phone size={28} />
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mb-3">Call Support</h3>
                    <p className="text-slate-500 text-sm mb-6">Direct line for quick help.</p>
                    <a href="tel:9778796424" className="text-2xl font-black text-slate-900 hover:text-blue-600 transition">9778796424</a>
                </div>

                {/* Email */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm text-center">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                        <Mail size={28} />
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mb-3">Email Us</h3>
                    <p className="text-slate-500 text-sm mb-6">For detailed order inquiries.</p>
                    <a href="mailto:ksraquaworld@gmail.com" className="text-sm font-bold text-blue-600 underline">ksraquaworld@gmail.com</a>
                </div>

                {/* Location with Google Maps Link */}
                <a 
                    href={mapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm text-center block hover:border-blue-400 transition-all group"
                >
                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <MapPin size={28} />
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mb-3">Visit Store</h3>
                    <p className="text-slate-500 text-sm mb-4">Cherthala-Arookutty Rd, near Chenganda Bridge, Kerala 688541</p>
                    <p className="font-black text-slate-900 mb-2">KSR Bait & Tackle</p>
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Get Directions →</span>
                </a>
            </div>
        </div>
    );
}