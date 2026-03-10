"use client"
import { useState, useContext } from 'react'; // 1. Added useContext
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext'; // 2. Imported AuthContext

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            router.push('/');

        } catch (err) {
            console.error(err);
            setError('Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to track your fishing gear.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition disabled:bg-slate-300"
                    >
                        {loading ? 'Verifying...' : 'Sign In'}
                    </button>

                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Register here</Link>
                </p>
                <Link href="/forgot-password" className="text-xs px-34 font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    Forgot Password?
                </Link>
            </div>
        </div>
    );
}