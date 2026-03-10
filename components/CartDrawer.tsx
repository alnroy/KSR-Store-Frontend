"use client"
import { useContext } from 'react';
import { CartContext } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                        <h2 className="text-xl font-black">Your Tackle Box</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="text-6xl block mb-4">🛶</span>
                                <p className="text-slate-400 font-bold">Your cart is empty.</p>
                            </div>
                        ) : (
                            cart.map((item: any, idx: number) => (
                                <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                                    <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.name}</h3>
                                            <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">🗑️</button>
                                        </div>

                                        {/* --- DISPLAY SELECTED VARIANTS --- */}
                                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {Object.entries(item.selectedOptions).map(([key, val]) => (
                                                    <span key={key} className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                                                        {key}: {val as string}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 bg-slate-50 hover:bg-slate-100">-</button>
                                                <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 bg-slate-50 hover:bg-slate-100">+</button>
                                            </div>
                                            <p className="font-black text-slate-900">₹{(item.offer_price || item.price) * item.quantity}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Subtotal</p>
                            <p className="text-3xl font-black text-slate-900">₹{cartTotal}</p>
                        </div>
                        <button 
                            disabled={cart.length === 0}
                            onClick={() => { onClose(); router.push('/checkout'); }}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:bg-slate-300"
                        >
                            Proceed to Checkout ⚡
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}