"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login'); // Redirect to login if they aren't authenticated
                return;
            }

            try {
                // 1. Fetch User Details
                const userRes = await axios.get('https://alnroy.pythonanywhere.com/api/auth/me/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(userRes.data);

                // 2. Fetch Saved Addresses
                const addressRes = await axios.get('https://alnroy.pythonanywhere.com/api/addresses/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Handle paginated or direct array responses
                setAddresses(addressRes.data.results || (Array.isArray(addressRes.data) ? addressRes.data : []));

            } catch (error) {
                console.error("Failed to load profile data", error);
                // If the token is invalid or expired, log them out
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [router]);

    const handleDeleteAddress = async (id: number) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`https://alnroy.pythonanywhere.com/api/addresses/${id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Remove the deleted address from the UI instantly
            setAddresses(addresses.filter(addr => addr.id !== id));
        } catch (error) {
            console.error("Failed to delete address", error);
            alert("Could not delete the address. Please try again.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/');
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-500 animate-pulse">Loading your command center...</div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-black mb-10 text-slate-900">My Account</h1>

            <div className="grid md:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Account Details & Navigation */}
                <div className="space-y-6">
                    {/* User ID Card */}
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-black mb-4 shadow-inner">
                            {user?.username ? user.username.charAt(0).toUpperCase() : '👤'}
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{user?.username || 'Angler'}</h2>
                        <p className="text-slate-400 text-sm mb-6">{user?.email}</p>

                        {user?.is_staff && (
                            <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                Admin Account
                            </span>
                        )}
                    </div>

                    {/* Quick Links Menu */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex flex-col gap-2">
                        <Link href="/my-orders" className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors font-bold text-slate-700">
                            📦 View Order History
                        </Link>
                        {/* Replace the alert button with this real link */}
                        <Link href="/forgot-password" className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors font-bold text-slate-700 text-left">
                            🔐 Change Password
                        </Link>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <button onClick={handleLogout} className="flex items-center gap-3 p-4 hover:bg-red-50 rounded-xl transition-colors font-bold text-red-600 text-left w-full">
                            🚪 Sign Out
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Address Book */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                📍 Saved Addresses
                            </h2>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                {addresses.length} Saved
                            </span>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium mb-4">You haven't saved any delivery addresses yet.</p>
                                <p className="text-sm text-slate-400">Addresses are automatically saved here when you check out.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div key={addr.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors flex flex-col justify-between group">
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">{addr.full_name}</p>
                                            <p className="text-xs text-slate-500 mb-3">{addr.email}</p>
                                            <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                                                {addr.address}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}