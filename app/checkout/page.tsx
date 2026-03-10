"use client"
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useContext(CartContext);
    const router = useRouter();

    // --- NEW: Saved Address State ---
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // --- Manual Shipping Details State ---
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    // --- Payment State ---
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const upiId = "alanroyff101@oksbi";
    const upiUrl = `upi://pay?pa=${upiId}&pn=ProFish%20Gear&am=${totalPrice}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

    // --- NEW: Fetch Saved Addresses on Load ---
    useEffect(() => {
        const fetchAddresses = async () => {
            setLoadingAddresses(true);
            try {
                // Using the instance with built-in headers
                const res = await API.get('addresses/');

                const fetchedData = res.data.results || (Array.isArray(res.data) ? res.data : []);
                setSavedAddresses(fetchedData);

                if (fetchedData.length > 0) {
                    setSelectedAddressId(fetchedData[0].id);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return alert("Your cart is empty!");
        if (!screenshot) return alert("Please upload your payment screenshot to confirm.");

        // Determine which address data to use
        let finalFullName = fullName;
        let finalEmail = email;
        let finalAddress = address;

        if (!isAddingNew && selectedAddressId) {
            // Using a saved address
            const selected = savedAddresses.find(a => a.id === selectedAddressId);
            if (selected) {
                finalFullName = selected.full_name;
                finalEmail = selected.email;
                finalAddress = selected.address;
            }
        } else {
            // Validating new manual address
            if (!finalFullName || !finalEmail || !finalAddress) {
                return alert("Please fill out all shipping details.");
            }
        }

        setLoading(true);

        try {
            // 1. SMART UX: Save address if new
            if (isAddingNew) {
                try {
                    await API.post('addresses/', {
                        full_name: finalFullName,
                        email: finalEmail,
                        address: finalAddress
                    });
                } catch (saveErr) {
                    console.error("Failed to save address for future use", saveErr);
                }
            }

            // 2. Format Items
            const formattedItems = cart.map((item: any) => ({
                product: item.id,
                quantity: item.quantity || 1,
                price: item.offer_price ? parseFloat(item.offer_price) : parseFloat(item.price)
            }));

            // 3. Build Payload
            const formData = new FormData();
            formData.append('full_name', finalFullName);
            formData.append('email', finalEmail);
            formData.append('address', finalAddress);
            formData.append('total_amount', totalPrice.toString());
            formData.append('payment_screenshot', screenshot);
            formData.append('items', JSON.stringify(formattedItems));

            // 4. THE CRITICAL SEND: Use the API instance
            await API.post('orders/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Order placed successfully!");
            clearCart();
            router.push('/my-orders');

        } catch (error: any) {
            // This will now catch the "token_not_valid" error if it happens
            const errorData = error.response?.data;
            console.error("Checkout Error Detail:", errorData);

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                router.push('/login');
            } else {
                alert(`Error: ${JSON.stringify(errorData || "Failed to submit order.")}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate if the button should be disabled
    const isSubmitDisabled = loading || !screenshot ||
        (!isAddingNew && !selectedAddressId) ||
        (isAddingNew && (!fullName || !email || !address));

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">

            <div className="bg-red-50 border-l-8 border-red-600 p-6 rounded-r-2xl mb-8 shadow-sm">
                <h2 className="text-red-800 font-black text-xl mb-2">⚠️ STRICT NO-REFUND POLICY</h2>
                <p className="text-red-700 font-medium">
                    By proceeding to pay, you agree that all sales are final. Please review your total amount (₹{totalPrice}) before scanning the QR code.
                </p>
            </div>

            <div className="flex justify-center mb-8">
                <button onClick={() => router.back()} className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 px-8 py-3 rounded-xl font-bold transition-all shadow-sm">
                    ✕ Cancel & Return to Shop
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 bg-slate-900 text-white text-center">
                    <h1 className="text-2xl font-bold">Secure Checkout</h1>
                </div>

                <div className="p-8 grid lg:grid-cols-2 gap-12">

                    {/* LEFT COLUMN: Shipping Details */}
                    <div className="space-y-6 border-r-0 lg:border-r border-slate-200 lg:pr-8">
                        <div>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Step 1: Delivery Address</span>
                        </div>

                        {loadingAddresses ? (
                            <div className="animate-pulse flex flex-col gap-4">
                                <div className="h-24 bg-slate-100 rounded-xl"></div>
                                <div className="h-24 bg-slate-100 rounded-xl"></div>
                            </div>
                        ) : (
                            <>
                                {/* Display Saved Addresses if any exist and we aren't forcing "New" */}
                                {!isAddingNew && savedAddresses.length > 0 && (
                                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                        {savedAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-100 bg-white hover:border-blue-200'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="font-bold text-slate-900">{addr.full_name}</p>
                                                    {selectedAddressId === addr.id && <span className="text-blue-600 text-xl leading-none">✅</span>}
                                                </div>
                                                <p className="text-sm text-slate-500 mb-1">{addr.email}</p>
                                                <p className="text-sm text-slate-600 line-clamp-2">{addr.address}</p>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setIsAddingNew(true)}
                                            className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-800 transition-colors mt-2"
                                        >
                                            ＋ Add a new delivery address
                                        </button>
                                    </div>
                                )}

                                {/* Manual Entry Form */}
                                {isAddingNew && (
                                    <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h3 className="font-bold text-slate-800">New Address Details</h3>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required={isAddingNew} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required={isAddingNew} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Full Delivery Address</label>
                                            <textarea value={address} onChange={(e) => setAddress(e.target.value)} required={isAddingNew} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"></textarea>
                                        </div>

                                        {/* Back button if they change their mind */}
                                        {savedAddresses.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingNew(false)}
                                                className="text-slate-500 text-sm font-bold hover:text-slate-700 underline"
                                            >
                                                Cancel and use a saved address
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Payment Details */}
                    <div className="space-y-6 flex flex-col justify-between">
                        <div>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Step 2: Scan & Upload Proof</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
                                <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                            </div>
                            <p className="text-3xl font-black text-slate-900 mb-6">Total: ₹{totalPrice}</p>
                        </div>

                        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors group bg-slate-50 cursor-pointer">
                            <input
                                type="file"
                                required
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => e.target.files && setScreenshot(e.target.files[0])}
                            />
                            <div className="text-slate-500 group-hover:text-blue-600 transition-colors">
                                {screenshot ? <p className="font-bold text-green-600">✅ {screenshot.name}</p> : <p className="font-medium">Click here to attach screenshot</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitDisabled}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-md mt-4 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                "Submit Order"
                            )}
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
}