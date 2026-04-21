"use client"
import { useState, useContext } from 'react'; // 1. Added useContext
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext'; // 2. Imported AuthContext
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';


function LoginContent() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const message = searchParams.get('message');

    // 3. Bring in the login function from context
    const { login } = useContext(AuthContext);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('https://alnroy.pythonanywhere.com/api/token/', {
                username,
                password
            });

            // 4. CRITICAL FIX: Use the context function, NOT localStorage directly
            login(res.data.access, res.data.refresh);

            // 5. CRITICAL FIX: Redirect to home page instead of my-orders
            if (redirect === 'checkout') {
                router.push('/checkout');
            } else {
                router.push('/');
            }

        } catch (err) {
            console.error(err);
            setError('Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative pt-20">
            {/* Back to Dashboard Button */}
            <Link 
                href="/" 
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-all bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
            >
                <ArrowLeft size={18} />
                Back to Dashboard
            </Link>

            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to track your fishing gear.</p>
                </div>

                {message === 'login_required' && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-2xl text-xs mb-6 text-center">
                        <span className="block text-lg mb-1">🔒 Security Check</span>
                        <p className="font-black uppercase tracking-widest">Logging in is strictly required to make a purchase for security reasons.</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                        <input
                            suppressHydrationWarning
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <input
                                suppressHydrationWarning
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition pr-12"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        suppressHydrationWarning
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition disabled:bg-slate-300"
                    >
                        {loading ? 'Verifying...' : 'Sign In'}
                    </button>

                </form>

                <div className="mt-8 flex flex-col items-center gap-3">
                    <p className="text-sm text-slate-500">
                        Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Register here</Link>
                    </p>
                    <Link href="/forgot-password" key="forgot-pass" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                        Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading secure portal...</div>}>
            <LoginContent />
        </Suspense>
    );
}