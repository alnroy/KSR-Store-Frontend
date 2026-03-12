"use client"
import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, Package, MapPin, Trash2, Key, ShieldCheck, Mail, Phone, Home, Building2, Globe } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login?redirect=profile&message=login_required');
                return;
            }

            try {
                // 1. Fetch User Details
                const userRes = await API.get('auth/me/');
                setUser(userRes.data);

                // 2. Fetch Saved Addresses
                const addressRes = await API.get('addresses/');
                setAddresses(addressRes.data.results || (Array.isArray(addressRes.data) ? addressRes.data : []));

            } catch (error: any) {
                console.error("Failed to load profile data", error);
                if (error.response?.status === 401) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [router]);

    const handleDeleteAddress = async (id: number) => {
        const result = await Swal.fire({
            title: 'Abandon this Dock?',
            text: "Are you sure you want to delete this delivery address?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Delete it'
        });

        if (!result.isConfirmed) return;

        try {
            await API.delete(`addresses/${id}/`);
            setAddresses(addresses.filter(addr => addr.id !== id));
            Swal.fire('Deleted!', 'The address has been removed.', 'success');
        } catch (error) {
            console.error("Failed to delete address", error);
            Swal.fire('Error', 'Could not delete the address.', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-600 tracking-tight">Accessing Command Center...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-16 px-4 min-h-screen bg-slate-50 md:bg-transparent">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">My Account <span className="text-blue-600 not-italic">Dashboard</span></h1>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* LEFT COLUMN: Identity & Intel (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* User Identity Card */}
                    <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl font-black mb-6 shadow-xl border-4 border-white/5">
                                {user?.username ? user.username.charAt(0).toUpperCase() : '👤'}
                            </div>
                            <h2 className="text-3xl font-black mb-2 italic tracking-tight">{user?.username || 'Angler'}</h2>
                            <p className="text-slate-400 font-bold text-sm mb-8 flex items-center gap-2"><Mail size={14} /> {user?.email}</p>

                            <div className="flex flex-wrap gap-3">
                                {user?.is_staff && (
                                    <span className="bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-red-500/20 flex items-center gap-1">
                                        <ShieldCheck size={10} /> Fleet Administrator
                                    </span>
                                )}
                                <span className="bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-blue-500/20">
                                    Member since 2024
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Fleet Actions */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm flex flex-col gap-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Quick Navigation</p>
                        <Link href="/my-orders" className="flex items-center gap-3 p-5 hover:bg-slate-50 rounded-2xl transition-all font-black text-slate-700 text-xs uppercase tracking-widest group">
                            <Package size={18} className="text-slate-400 group-hover:text-blue-600" /> View Tackle History
                        </Link>
                        <Link href="/forgot-password" className="flex items-center gap-3 p-5 hover:bg-slate-50 rounded-2xl transition-all font-black text-slate-700 text-xs uppercase tracking-widest group">
                            <Key size={18} className="text-slate-400 group-hover:text-amber-500" /> Secure New Password
                        </Link>
                        <div className="h-px bg-slate-100 my-2 mx-4"></div>
                        <button onClick={handleLogout} className="flex items-center gap-3 p-5 hover:bg-red-50 rounded-2xl transition-all font-black text-red-600 text-xs uppercase tracking-widest group text-left w-full">
                            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> Abandon Command
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: The Address Dock (8 cols) */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic mb-2">
                                    Saved <span className="text-blue-600 not-italic">Docks</span>
                                </h2>
                                <p className="text-xs font-bold text-slate-400">Manage your frequent delivery locations</p>
                            </div>
                            <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest">
                                {addresses.length} Active
                            </div>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                <MapPin size={48} className="text-slate-200 mx-auto mb-6" />
                                <p className="text-slate-500 font-black text-sm uppercase tracking-widest mb-2">Zero Docks Identified</p>
                                <p className="text-[10px] text-slate-400 font-bold max-w-xs mx-auto">Your delivery addresses will be automatically cached here after your next shopping trip.</p>
                                <button onClick={() => router.push('/')} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Start Fishing</button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {addresses.map((addr) => (
                                    <div key={addr.id} className="p-8 rounded-[2.5rem] border-2 border-slate-50 bg-slate-50 hover:border-blue-200 hover:bg-white transition-all flex flex-col justify-between group relative overflow-hidden">
                                        {addr.is_default && (
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1.5 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest">Default</div>
                                        )}
                                        
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                                                    <Home size={18} />
                                                </div>
                                            </div>
                                            <p className="font-black text-slate-900 text-lg mb-1">{addr.full_name}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6 flex items-center gap-1">
                                                <Phone size={10} /> {addr.mobile_number || 'No contact saved'}
                                            </p>
                                            
                                            <div className="space-y-4 text-xs font-bold text-slate-600">
                                                <div className="flex gap-2">
                                                    <Building2 size={14} className="text-slate-300 shrink-0" />
                                                    <p>{addr.house_info}, {addr.street_info}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <MapPin size={14} className="text-slate-300 shrink-0" />
                                                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Globe size={14} className="text-slate-300 shrink-0" />
                                                    <p>{addr.country_region}</p>
                                                </div>
                                                {addr.landmark && (
                                                    <p className="text-[10px] text-blue-600 italic mt-2">📍 Near {addr.landmark}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-200/50 flex justify-between items-center">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Added via Checkout</p>
                                            <button
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-all"
                                                title="Delete Address"
                                            >
                                                <Trash2 size={18} />
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