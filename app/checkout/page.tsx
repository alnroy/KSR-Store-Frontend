"use client"
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import { MapPin, Phone, User, Home, Building2, Landmark, Globe, CheckCircle2, Navigation, Mail, ArrowLeft, Truck, ShieldAlert, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cart: globalCart, totalPrice: globalTotalPrice, clearCart } = useContext(CartContext);
    const router = useRouter();

    // --- Dynamic Cart State for Instant Buy ---
    const [cart, setCart] = useState<any[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [isInstantBuy, setIsInstantBuy] = useState(false);

    useEffect(() => {
        const instantData = localStorage.getItem('instant_buy_item');
        if (instantData) {
            try {
                const parsed = JSON.parse(instantData);
                setCart(parsed);
                let total = 0;
                parsed.forEach((item: any) => {
                    total += Number(item.offer_price || item.price) * (item.quantity || 1);
                });
                setTotalPrice(total);
                setIsInstantBuy(true);
            } catch (e) {
                setCart(globalCart);
                setTotalPrice(globalTotalPrice);
            }
        } else {
            setCart(globalCart);
            setTotalPrice(globalTotalPrice);
        }
    }, [globalCart, globalTotalPrice]);

    // --- Saved Address State ---
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [isLocating, setIsLocating] = useState(false);

    // --- Structured Mapping Fields ---
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        mobile_number: '',
        country_region: 'India',
        house_info: '',
        street_info: '',
        landmark: '',
        pincode: '',
        city: '',
        state: '',
        is_default: false,
    });

    // --- Payment State ---
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);

    const upiId = "alanroyff101@oksbi";
    const upiUrl = `upi://pay?pa=${upiId}&pn=KSR%20Bait%20%26%20Tackle&am=${totalPrice}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

    useEffect(() => {
        const fetchAddresses = async () => {
            setLoadingAddresses(true);
            try {
                const res = await API.get('addresses/');
                const fetchedData = res.data.results || (Array.isArray(res.data) ? res.data : []);
                setSavedAddresses(fetchedData);

                if (fetchedData.length > 0) {
                    const defaultAddr = fetchedData.find((a: any) => a.is_default) || fetchedData[0];
                    setSelectedAddressId(defaultAddr.id);
                    fillFromSaved(defaultAddr);
                    setIsAddingNew(false);
                } else {
                    setIsAddingNew(true);
                }
            } catch (error) {
                console.error("Failed to load addresses", error);
                setIsAddingNew(true);
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, []);

    const fillFromSaved = (addr: any) => {
        setFormData({
            full_name: addr.full_name || '',
            email: addr.email || '',
            mobile_number: addr.mobile_number || '',
            country_region: addr.country_region || 'India',
            house_info: addr.house_info || '',
            street_info: addr.street_info || '',
            landmark: addr.landmark || '',
            pincode: addr.pincode || '',
            city: addr.city || '',
            state: addr.state || '',
            is_default: addr.is_default || false,
        });
    };

    const handleLocateOnMap = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(() => {
                Swal.fire({
                    title: 'Precision GPS Ready',
                    text: 'In production, this would open full Google Maps picker. Your coords are active.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsLocating(false);
            }, () => {
                Swal.fire('Error', 'GPS Access Denied.', 'error');
                setIsLocating(false);
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return alert("Your payload is empty!");
        if (!screenshot) return alert("Please upload your payment screenshot.");

        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, (formData as any)[key]);
            });
            
            // Legacy support
            const fullAddr = `${formData.house_info}, ${formData.street_info}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
            data.append('address', fullAddr);
            data.append('total_amount', totalPrice.toString());
            data.append('payment_screenshot', screenshot);
            data.append('transaction_id', transactionId);
            
            const formattedItems = cart.map((item: any) => ({
                product: item.id,
                quantity: item.quantity || 1,
                price: item.offer_price ? parseFloat(item.offer_price) : parseFloat(item.price)
            }));
            data.append('items', JSON.stringify(formattedItems));

            await API.post('orders/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Swal.fire({
                title: 'Order Anchored! ⚓',
                text: 'Admin will verify your payment soon.',
                icon: 'success',
                confirmButtonColor: '#3b82f6'
            });

            if (isInstantBuy) {
                localStorage.removeItem('instant_buy_item');
            } else {
                clearCart();
            }
            router.push('/my-orders');

        } catch (error: any) {
            Swal.fire('Error', error.response?.data?.error || 'Failed to submit order.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[100vw] overflow-x-hidden min-h-screen bg-slate-50 py-6 md:py-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header / Nav */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
                    <div className="w-full">
                       <button onClick={() => {
                           if(isInstantBuy) localStorage.removeItem('instant_buy_item');
                           router.back();
                       }} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all mb-4">
                          <ArrowLeft size={16} /> Back
                       </button>
                       <h1 className="text-3xl md:text-5xl font-black text-slate-900 italic tracking-tight leading-none">Final Check <span className="text-blue-600 not-italic">Post</span></h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-6 md:gap-10 w-full min-w-0">
                    
                    {/* Left: Shipping & Addresses (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8 w-full min-w-0 overflow-hidden">
                        
                        {/* Saved Addresses Strip */}
                        {!loadingAddresses && savedAddresses.length > 0 && (
                            <div className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 w-full">
                                 <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-6 px-1">Dispatch to Saved Dock</p>
                                 <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 w-full">
                                    {savedAddresses.map(addr => (
                                        <button 
                                            key={addr.id}
                                            type="button"
                                            suppressHydrationWarning
                                            onClick={() => { setSelectedAddressId(addr.id); fillFromSaved(addr); setIsAddingNew(false); }}
                                            className={`shrink-0 snap-start p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 transition-all text-left w-[85%] sm:w-52 md:w-64 max-w-xs ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                                        >
                                            <p className="font-black text-[11px] md:text-sm text-slate-900 mb-1">{addr.full_name}</p>
                                            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold">{addr.city}, {addr.pincode}</p>
                                            {addr.is_default && <span className="text-[7px] md:text-[8px] font-black text-blue-600 uppercase mt-2 block">DEFAULT</span>}
                                        </button>
                                    ))}
                                    <button 
                                        type="button"
                                        suppressHydrationWarning
                                        onClick={() => { setIsAddingNew(true); setFormData({...formData, full_name: '', mobile_number: '', house_info: '', street_info: '', landmark: '', pincode: '', city: '', state: ''}); setSelectedAddressId(null); }}
                                        className="shrink-0 snap-start p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-black text-[9px] md:text-[10px] uppercase flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 transition-all w-[85%] sm:w-52 md:w-64 max-w-xs"
                                    >
                                        <span>➕ Add New Location</span>
                                    </button>
                                 </div>
                            </div>
                        )}

                        {/* The Address Form */}
                        <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[1.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 w-full overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-10">
                            <h2 className="text-lg md:text-2xl font-black text-slate-900 italic px-1">Shipping <span className="text-blue-600 not-italic">Intelligence</span></h2>
                            {isAddingNew && (
                                <button type="button" suppressHydrationWarning onClick={handleLocateOnMap} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 md:py-2 rounded-xl md:rounded-full font-black text-[9px] md:text-[10px] uppercase shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                                    <Navigation size={12} /> {isLocating ? 'Ping...' : 'Auto-Fill via Map'}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            <div className="space-y-4 md:space-y-6">
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Full Name</label>
                                    <input required type="text" suppressHydrationWarning value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-sm" />
                                </div>
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Mobile Number</label>
                                    <input required type="tel" suppressHydrationWarning value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-sm" />
                                </div>
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Email</label>
                                    <input required type="email" suppressHydrationWarning value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-sm" />
                                </div>
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Country / Region</label>
                                    <input required type="text" suppressHydrationWarning value={formData.country_region} onChange={e => setFormData({...formData, country_region: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-sm" />
                                </div>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Flat, House no, Building, Company, Apartment</label>
                                    <input required type="text" suppressHydrationWarning value={formData.house_info} onChange={e => setFormData({...formData, house_info: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-xs md:text-sm" />
                                </div>
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Area, Street, Sector, Village</label>
                                    <input required type="text" suppressHydrationWarning value={formData.street_info} onChange={e => setFormData({...formData, street_info: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-xs md:text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Landmark</label>
                                        <input type="text" suppressHydrationWarning value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-xs md:text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Pincode</label>
                                        <input required type="text" suppressHydrationWarning value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-xs md:text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Town / City</label>
                                        <input required type="text" suppressHydrationWarning value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-xs md:text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">State</label>
                                        <input required type="text" suppressHydrationWarning value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl outline-none focus:border-blue-500 font-black text-xs md:text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-3 px-1">
                             <input type="checkbox" suppressHydrationWarning checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} className="w-5 h-5 rounded-lg accent-blue-600 cursor-pointer" id="default-chk" />
                             <label htmlFor="default-chk" className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer leading-tight">Default tackle box destination</label>
                        </div>
                    </div>

                    {/* Updated Policy Section */}
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 text-blue-600">
                                <Truck size={24} />
                                <h3 className="font-black uppercase tracking-widest text-xs">Delivery Intelligence</h3>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                Deliveries are fast (1-3 days) for locations near our store. For long-distance orders or other districts, it may take up to <span className="text-slate-900">10 days</span>. 
                            </p>
                            <p className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                Note: "Shipped" status updates are triggered only after 10 days of booking for long-distance shipments.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <ShieldAlert size={24} />
                                <h3 className="font-black uppercase tracking-widest text-xs">Purchase & Replacement</h3>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                <span className="text-red-600">Strictly no refunds.</span> Replacements are only possible if the buyer visits the store with an unboxing video showing defects.
                            </p>
                            <p className="text-[10px] text-slate-400 bg-red-50/30 p-3 rounded-xl border border-red-100">
                                Since we use courier services like DTDC, remote returns/replacements are not standard. If you wish to bear all courier expenses, please <Link href="/contact" className="text-blue-600 underline">Contact Our Store</Link> to discuss options.
                            </p>
                        </div>
                    </div>
                </div>
                                {/* Right: Payment & Summary (4 cols) - Sticky on Desktop */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="lg:sticky lg:top-24 space-y-6 md:space-y-8">
                        <div className="bg-slate-900 text-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden mx-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            <h2 className="text-lg font-black mb-8 italic text-blue-400 uppercase tracking-widest">Dock Summary</h2>
                            
                            <div className="space-y-4 mb-8">
                                {cart.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center text-[10px] md:text-xs font-bold border-b border-white/5 pb-3">
                                        <span className="text-slate-400 max-w-[70%] truncate">{item.quantity}x {item.name}</span>
                                        <span>₹{Number(item.offer_price || item.price) * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Weight</span>
                                    <span className="text-2xl md:text-3xl font-black text-white">₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                             <div className="space-y-6">
                                <a 
                                    href={upiUrl}
                                    className="flex flex-col items-center gap-4 bg-white/5 p-4 md:p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group"
                                >
                                    <img src={qrCodeUrl} alt="UPI QR" className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white/10 group-hover:scale-105 transition-transform" />
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                                            Tap to pay with UPI App <Navigation size={10} className="rotate-90" />
                                        </p>
                                        <p className="text-xs font-black text-white">{upiId}</p>
                                    </div>
                                </a>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-1">Payment Proof</label>
                                        <div className="relative group">
                                            <input required type="file" suppressHydrationWarning accept="image/*" onChange={e => e.target.files && setScreenshot(e.target.files[0])} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                                            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center transition-all group-hover:bg-white/10">
                                                <p className="text-[10px] font-bold text-slate-400">{screenshot ? `✅ ${screenshot.name.substring(0, 10)}...` : 'Attach Screenshot'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-1">UTR / Transaction ID</label>
                                        <input required type="text" suppressHydrationWarning placeholder="12-digit number" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 font-bold text-white text-xs" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    suppressHydrationWarning
                                    disabled={loading || cart.length === 0}
                                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl shadow-blue-500/20 hover:bg-blue-500 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'ANCHORING...' : 'SECURE MY GEAR ⚡'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 space-y-6">
                            <div className="text-center">
                                <CheckCircle2 size={32} className="text-blue-600 mx-auto mb-4" />
                                <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">Secure Portal</h3>
                                <p className="text-[9px] text-slate-400 font-bold">Encrypted via KSR Secure Systems</p>
                            </div>
                                       <div className="pt-6 border-t border-slate-50 space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed">
                                        Deliveries within 3 days for nearby locations; up to 10 days for remote areas.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed">
                                        Local store-visit replacements only with video proof. No refunds.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed">
                                        Courier returns at buyer's expense. <Link href="/contact" className="text-blue-600 underline">Contact Us</Link> for info.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            </div>
        </div>
    );
}