"use client"
import { useEffect, useState } from 'react';
import API from '@/lib/api'; // Using your central API instance for automatic headers
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // --- Modal States ---
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [selectedProductsInfo, setSelectedProductsInfo] = useState<any[] | null>(null);
    
    // --- Edit Address State ---
    const [editingOrder, setEditingOrder] = useState<any | null>(null);
    const [newAddress, setNewAddress] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // --- Fetch Orders on Load ---
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login?redirect=my-orders&message=login_required');
            return;
        }

        const fetchOrders = async () => {
            try {
                // API instance handles the 'Bearer' token automatically
                const res = await API.get('orders/');
                const fetchedOrders = res.data.results || (Array.isArray(res.data) ? res.data : []);
                setOrders(fetchedOrders);
            } catch (err: any) {
                console.error("Order Fetch Error:", err);
                if (err.response?.status === 401) {
                    router.push('/login?redirect=my-orders&message=login_required');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    // --- Helper: Status Styling ---
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
            case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DELIVERED': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'COMPLETED': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200';
        }
    };

    // --- Helper: Image URL Formatter ---
    const getValidImageUrl = (url: string | null | undefined): string | null => {
        if (!url) return null;
        // Handles absolute URLs and PythonAnywhere relative paths
        const cleanUrl = url.startsWith('http') ? url : `https://alnroy.pythonanywhere.com${url}`;
        return cleanUrl;
    };

    // --- Handle Address PATCH Update ---
    const submitAddressUpdate = async () => {
        if (!newAddress.trim()) return alert("Address cannot be empty.");
        setIsUpdating(true);

        try {
            await API.patch(`orders/${editingOrder.id}/`, { address: newAddress });
            
            // Update local state for instant UI feedback
            setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, address: newAddress } : o));
            setEditingOrder(null);
            alert("Delivery address updated successfully!");
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to update address.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-600 tracking-tight">Loading your tackle history...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-16 px-4 min-h-screen bg-slate-50 md:bg-transparent">
            <h1 className="text-4xl font-black mb-10 text-slate-900 tracking-tight">Order History</h1>

            {orders.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl border border-slate-100 text-center shadow-sm">
                    <span className="text-6xl mb-4 block">🎣</span>
                    <p className="text-slate-400 font-medium">You haven't placed any orders yet.</p>
                    <button onClick={() => router.push('/')} className="mt-6 text-blue-600 font-bold hover:underline">Go to Shop</button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <div key={order.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-xl transition-all duration-300 gap-4">
                            
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center shadow-sm">
                                    {order.items && order.items.length > 0 && order.items[0].product_image ? (
                                        <>
                                            {getValidImageUrl(order.items[0].product_image) && (
                                                <img src={getValidImageUrl(order.items[0].product_image) || undefined} alt="Gear" className="w-full h-full object-cover" />
                                            )}
                                            {order.items.length > 1 && (
                                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white font-black text-sm">
                                                    +{order.items.length - 1}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-2xl">📦</span>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-slate-400 font-mono mb-1">Order ID: #{order.id}</p>
                                    <h3 className="font-black text-xl text-slate-900 leading-none">Total: ₹{order.total_amount}</h3>
                                    
                                    {order.items && order.items.length > 0 && (
                                        <button 
                                            onClick={() => setSelectedProductsInfo(order.items)}
                                            className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-3 hover:text-blue-800 transition-colors flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
                                        >
                                            View {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'} <span>→</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className={`px-4 py-2 rounded-full border font-bold text-xs uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                        {order.status}
                                    </div>
                                    {order.payment_screenshot && (
                                        <button 
                                            onClick={() => setSelectedProof(getValidImageUrl(order.payment_screenshot))} 
                                            className="text-slate-600 text-sm font-bold hover:text-slate-900 transition-colors flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl shrink-0"
                                        >
                                            📷 Proof
                                        </button>
                                    )}
                                </div>

                                {/* Actions based on Automated Statuses */}
                                {order.status === 'PENDING' && (
                                    <button 
                                        onClick={() => { setEditingOrder(order); setNewAddress(order.address); }}
                                        className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                                    >
                                        ✏️ Edit Delivery Address
                                    </button>
                                )}

                                {order.status === 'DELIVERED' && (
                                    <button 
                                        onClick={() => router.push('/contact')}
                                        className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100 hover:bg-red-100 transition-all flex items-center gap-1"
                                    >
                                        ⚠️ Not Arrived Yet? Contact Support
                                    </button>
                                )}
                                
                                {order.status === 'SHIPPED' && (
                                    <button 
                                        onClick={async () => {
                                            try {
                                                await API.patch(`orders/${order.id}/`, { status: 'DELIVERED' });
                                                setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'DELIVERED' } : o));
                                                alert("Happy Catching! Order marked as Received.");
                                            } catch (err) {
                                                alert("Failed to update status.");
                                            }
                                        }}
                                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-green-500/20"
                                    >
                                        Mark as Received
                                    </button>
                                )}

                                {order.status === 'FAILED' && order.rejection_reason && (
                                    <p className="text-xs font-bold text-red-500 max-w-xs text-right bg-red-50 p-2 rounded border border-red-100">
                                        Admin Note: {order.rejection_reason}
                                    </p>
                                )}

                                <div className="text-[10px] font-bold text-slate-400 text-right space-y-0.5">
                                    <p>{order.mobile_number && `📞 ${order.mobile_number}`}</p>
                                    <p>{order.city}, {order.state} - {order.pincode}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL: Edit Address --- */}
            {editingOrder && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingOrder(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Update Delivery Address</h2>
                        <p className="text-sm text-slate-500 mb-4">Valid only while order is PENDING.</p>
                        
                        <textarea 
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none h-32 mb-4 text-sm font-medium"
                        ></textarea>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setEditingOrder(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all">Cancel</button>
                            <button onClick={submitAddressUpdate} disabled={isUpdating} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all disabled:bg-blue-300">
                                {isUpdating ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: View Items --- */}
            {selectedProductsInfo && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProductsInfo(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                            <h2 className="text-lg font-bold">Ordered Items</h2>
                            <button onClick={() => setSelectedProductsInfo(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">✕</button>
                        </div>
                        
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {selectedProductsInfo.map((item: any, idx: number) => {
                                const imgUrl = getValidImageUrl(item.product_image);
                                return (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 group hover:border-blue-200 transition-colors">
                                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-white">
                                            {imgUrl ? (
                                                <img src={imgUrl || undefined} className="w-full h-full object-cover" alt={item.product_name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl bg-slate-100">📦</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className="font-black text-slate-900 text-lg leading-tight mb-1">{item.product_name}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-sm font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-100">Qty: {item.quantity}</p>
                                                <p className="font-black text-blue-600">₹{item.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button onClick={() => setSelectedProductsInfo(null)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: Payment Proof Image --- */}
            {selectedProof && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={() => setSelectedProof(null)}>
                    <div className="relative max-w-2xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedProof(null)} className="absolute -top-12 right-0 text-white text-3xl font-light hover:text-blue-400 transition-colors p-2">✕</button>
                        <div className="bg-white p-2 rounded-[2rem] shadow-2xl">
                            <img 
                                src={selectedProof} 
                                alt="Payment Proof" 
                                className="max-w-full max-h-[80vh] rounded-[1.5rem] object-contain shadow-inner"
                            />
                        </div>
                        <p className="text-white/60 mt-6 text-sm font-medium tracking-widest uppercase tracking-[0.2em]">Verified Payment Screenshot</p>
                    </div>
                </div>
            )}
        </div>
    );
}