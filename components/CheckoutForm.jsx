"use client"
import React, { useState, useContext, useEffect } from 'react';
import { createOrder, fetchAddresses } from '@/lib/api';
import { CartContext } from '@/context/CartContext';
import { MapPin, Phone, User, Home, Building2, Landmark, Globe, CheckCircle2, Navigation, Mail } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CheckoutForm() {
    const { cart, totalPrice, clearCart } = useContext(CartContext);
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [isLocating, setIsLocating] = useState(false);

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
        transaction_id: '',
    });

    const [screenshot, setScreenshot] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchAddresses().then(res => {
                const addresses = res.data.results || res.data;
                setSavedAddresses(addresses);
                const defaultAddr = addresses.find(a => a.is_default);
                if (defaultAddr) {
                    fillFromSaved(defaultAddr);
                }
            }).catch(err => console.error("Could not fetch addresses", err));
        }
    }, []);

    const fillFromSaved = (addr) => {
        setFormData({
            ...formData,
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
        });
    };

    const handleLocateOnMap = () => {
        setIsLocating(true);
        // Simulate Google Maps Picker
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                // In a real app, you'd use Google Reverse Geocoding API here.
                // We'll simulate it with a friendly notice.
                Swal.fire({
                    title: 'Detecting Location...',
                    text: 'In a production environment with a Google Maps API Key, this would open the map picker and auto-fill your address. For now, we have detected your GPS coordinates.',
                    icon: 'info',
                    timer: 3000,
                    showConfirmButton: false
                });
                setIsLocating(false);
            }, () => {
                Swal.fire('Error', 'Could not access your location.', 'error');
                setIsLocating(false);
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        
        // Add full address string for legacy support
        const fullAddress = `${formData.house_info}, ${formData.street_info}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
        data.append('address', fullAddress);
        data.append('total_amount', totalPrice);
        data.append('items', JSON.stringify(cart.map(item => ({
            product: item.id,
            quantity: item.quantity,
            price: item.offer_price || item.price,
            selected_options: item.selected_options || {}
        }))));

        if (screenshot) data.append('payment_screenshot', screenshot);

        try {
            await createOrder(data);
            setOrderSuccess(true);
            clearCart();
            Swal.fire({
                title: 'Order Placed!',
                text: 'Your tackle box is being prepared. Admin will verify payment soon.',
                icon: 'success',
                confirmButtonColor: '#3b82f6'
            });
        } catch (error) {
            console.error("Order failed", error);
            Swal.fire('Error', error.response?.data?.error || 'Something went wrong while placing your order.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="max-w-xl mx-auto p-12 bg-white rounded-[3rem] shadow-2xl border border-slate-100 text-center">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 italic">CATCH SECURED! 🎣</h2>
                <p className="text-slate-500 font-bold mb-10">Your order has been sent to the dock for verification. Keep an eye on your email for shipping updates.</p>
                <button onClick={() => window.location.href = '/'} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Continue Shopping</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 md:p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Final <span className="text-blue-600 not-italic">Checkpost</span></h2>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">₹{Number(totalPrice).toLocaleString()} Total</div>
            </div>

            {savedAddresses.length > 0 && (
                <div className="mb-10 overflow-x-auto no-scrollbar pb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Quick Select Saved Address</p>
                    <div className="flex gap-4">
                        {savedAddresses.map(addr => (
                            <button 
                                key={addr.id}
                                type="button"
                                onClick={() => fillFromSaved(addr)}
                                className="shrink-0 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left hover:border-blue-400 transition-all group"
                            >
                                <p className="font-bold text-xs text-slate-900 mb-1 group-hover:text-blue-600">{addr.full_name}</p>
                                <p className="text-[9px] text-slate-500 font-bold">{addr.city}, {addr.state}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Left Column: Contact & Basic Info */}
                <div className="space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            <User size={12} /> Full Name
                        </label>
                        <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            <Mail size={12} /> Email Address
                        </label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            <Phone size={12} /> Mobile Number
                        </label>
                        <input required type="tel" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            <Globe size={12} /> Country / Region
                        </label>
                        <input required type="text" value={formData.country_region} onChange={e => setFormData({...formData, country_region: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" />
                    </div>
                </div>

                {/* Right Column: Detailed Address */}
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Home size={12} /> House Details
                            </label>
                            <button type="button" onClick={handleLocateOnMap} className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all">
                                <Navigation size={10} /> {isLocating ? 'Locating...' : 'Locate on Map'}
                            </button>
                        </div>
                        <input required placeholder="Flat, House no, Building, Company, etc." type="text" value={formData.house_info} onChange={e => setFormData({...formData, house_info: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs" />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            <Building2 size={12} /> Street / Area
                        </label>
                        <input required placeholder="Area, Street, Sector, Village" type="text" value={formData.street_info} onChange={e => setFormData({...formData, street_info: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                <Landmark size={12} /> Landmark
                            </label>
                            <input  type="text" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs" />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Pincode
                            </label>
                            <input required type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Town / City
                            </label>
                            <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs" />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                State
                            </label>
                            <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-12 p-1">
                <input 
                    type="checkbox" 
                    id="make-default"
                    checked={formData.is_default}
                    onChange={e => setFormData({...formData, is_default: e.target.checked})}
                    className="w-5 h-5 rounded-lg accent-blue-600"
                />
                <label htmlFor="make-default" className="text-xs font-black text-slate-600 uppercase tracking-wider cursor-pointer">Make this my default tackle delivery address</label>
            </div>

            {/* Payment Section */}
            <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] mb-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <h3 className="text-xl font-black mb-8 italic text-blue-400 uppercase tracking-widest">Payment Verification</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Manual Verification Required</p>
                            <p className="text-xs font-bold text-slate-300 leading-relaxed mb-6">Please transfer the total amount (₹{totalPrice}) to our UPI ID/Bank and upload the screenshot here.</p>
                            <input 
                                required
                                type="file" 
                                accept="image/*"
                                onChange={e => setScreenshot(e.target.files[0])}
                                className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">UTR / Transaction ID</label>
                            <input 
                                required
                                type="text" 
                                placeholder="12-digit UPI Transaction ID"
                                value={formData.transaction_id}
                                onChange={e => setFormData({...formData, transaction_id: e.target.value})}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 font-bold text-white"
                            />
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Items in Box</p>
                        <p className="text-2xl font-black mb-6">{cart.length} Premium Gear Units</p>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/40 hover:bg-blue-500 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? "Anchoring Order..." : `SECURE MY TACKLE (₹${totalPrice})`}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}