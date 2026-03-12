"use client"
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartContext } from '@/context/CartContext';
import { AuthContext } from '@/context/AuthContext';

export default function CartDrawer({ isOpen, onClose, onItemClick }: { isOpen: boolean, onClose: () => void, onItemClick?: (item: any) => void }) {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
    const { isLoggedIn } = useContext(AuthContext);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleCheckout = () => {
        onClose();
        if (!isLoggedIn) {
            router.push('/login?redirect=checkout&message=login_required');
        } else {
            router.push('/checkout');
        }
    };

    // Calculate savings
    const totalSavings = cart.reduce((acc: number, item: any) => {
        const price = parseFloat(item.price || 0);
        const offerPrice = parseFloat(item.offer_price || 0);
        if (offerPrice > 0 && price > offerPrice) {
            return acc + (price - offerPrice) * (item.quantity || 1);
        }
        return acc;
    }, 0);

    if (!mounted) return null;

    return (
        <div className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
            <div 
                className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
                onClick={onClose} 
            />
            
            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div 
                    className={`w-screen max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🎒</span>
                            <h2 className="text-xl font-black uppercase tracking-tighter">Your Tackle Box</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="text-6xl block mb-4">🛶</span>
                                <p className="text-slate-400 font-bold">Your tackle box is empty.</p>
                            </div>
                        ) : (
                            cart.map((item: any, idx: number) => (
                                <div key={`${item.id}-${idx}`} className="flex gap-5 group bg-slate-50/50 p-4 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                                    <div 
                                        onClick={() => { onItemClick?.(item); onClose(); }}
                                        className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-white cursor-pointer relative"
                                    >
                                        <img src={item.image} className="w-full h-full object-contain p-2" alt={item.name} />
                                        {item.offer_price && (
                                            <span className="absolute top-1 left-1 bg-red-500 text-[8px] text-white font-black px-1.5 py-0.5 rounded">SALE</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 
                                                    onClick={() => { onItemClick?.(item); onClose(); }}
                                                    className="font-black text-slate-900 text-xs md:text-sm leading-tight line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                                                >
                                                    {item.name}
                                                </h3>
                                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">🗑️</button>
                                            </div>

                                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {Object.entries(item.selectedOptions).map(([key, val]) => (
                                                        <span key={key} className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-900 text-white rounded-md">
                                                            {key}: {val as string}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-2 mt-4">
                                            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition-colors font-black">-</button>
                                                <span className="w-8 text-center text-xs font-black border-x border-slate-100">{item.quantity || 1}</span>
                                                <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition-colors font-black">+</button>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 text-sm md:text-lg">
                                                    ₹{((parseFloat(item.offer_price || item.price || 0)) * (item.quantity || 1)).toLocaleString('en-IN')}
                                                </p>
                                                {item.offer_price && item.price > item.offer_price && (
                                                    <p className="text-[10px] text-slate-400 font-bold line-through">₹{(parseFloat(item.price) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                        {totalSavings > 0 && (
                             <div className="flex justify-between items-center mb-2 px-2">
                                <p className="text-green-600 font-black uppercase tracking-widest text-[9px]">Angler's Discount Saved</p>
                                <p className="text-sm font-black text-green-600">- ₹{totalSavings.toLocaleString('en-IN')}</p>
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-6 px-2">
                            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Tackle Subtotal</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{(cartTotal || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <button 
                            disabled={cart.length === 0}
                            onClick={handleCheckout}
                            className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:bg-slate-300 uppercase tracking-widest"
                        >
                            Checkout Now ⚡
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}