"use client"
import { Mail, Phone, MapPin, Navigation } from 'lucide-react';

export default function ContactPage() {
    const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Ksr+Aqua+World+Cherthala-Arookutty+Rd,+near+Chenganda+Bridge,+Kerala+688541&query_place_id=ChIJ43QfzrJ7CDsRJIz2eKSKUEk";

    return (
        <div className="max-w-6xl mx-auto py-20 px-4">
            <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Contact KSR Bait & Tackle</h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">Get in touch with Us for product inquiries or order support.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
                {/* Phone */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm text-center transform hover:-translate-y-2 transition-all">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                        <Phone size={28} />
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mb-3">Call Support</h3>
                    <p className="text-slate-500 text-sm mb-6">Direct line for quick help.</p>
                    <a href="tel:9778796424" className="text-2xl font-black text-slate-900 hover:text-blue-600 transition">9778796424</a>
                </div>

                {/* Email */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm text-center transform hover:-translate-y-2 transition-all">
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
                    className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm text-center block hover:border-blue-400 transform hover:-translate-y-2 transition-all group"
                >
                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <MapPin size={28} />
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mb-3">Visit Store</h3>
                    <p className="text-slate-500 text-sm mb-4">Cherthala-Arookutty Rd, near Chenganda Bridge, Kerala 688541</p>
                    <p className="font-black text-slate-900 mb-2">KSR Bait & Tackle</p>
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center justify-center gap-1">Get Directions <Navigation size={10} className="rotate-45" /></span>
                </a>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full bg-white p-4 md:p-8 rounded-[40px] border border-slate-100 shadow-xl overflow-hidden h-[400px] md:h-[600px]">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.13280145834!2d76.3263!3d9.8669!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087bb2ced074e3%3A0x49504a9478f68c24!2sKsr%20Aqua%20World!5e0!3m2!1sen!2sin!4v1711867169000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="KSR Bait & Tackle Location"
                    className="rounded-[32px]"
                />
            </div>
        </div>
    );
}