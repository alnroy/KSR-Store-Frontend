"use client"
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    // UI State
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    // Form Data State
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // --- STEP 1: Request Registration ---
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('https://alnroy.pythonanywhere.com/api/auth/register/', {
                username,
                email,
                password
            });

            // Transition to OTP step
            setSuccessMessage('Registration initiated! Please check your terminal/email for the 6-digit OTP.');
            setStep(2);
        } catch (err: any) {
            console.error(err);
            // Extract the specific error message from Django if available
            const backendError = err.response?.data?.email?.[0] || err.response?.data?.username?.[0] || 'Registration failed. Please check your details.';
            setError(backendError);
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: Verify OTP & Auto-Login ---
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('https://alnroy.pythonanywhere.com/api/auth/verify-otp/', {
                email,
                otp
            });

            // Save the JWT tokens returned by our custom VerifyView
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);

            alert("Account verified and logged in successfully!");
            router.push('/my-orders'); // Redirect to their secure portal
            
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900">
                        {step === 1 ? 'Create Account' : 'Verify Account'}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {step === 1 ? 'Join ProFish Gear today.' : `We sent a code to ${email}`}
                    </p>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center font-bold">
                        {error}
                    </div>
                )}
                {successMessage && step === 2 && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-6 text-center font-bold">
                        {successMessage}
                    </div>
                )}

                {/* STEP 1: REGISTRATION FORM */}
                {step === 1 && (
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                required
                                minLength={8}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition disabled:bg-slate-300 mt-4"
                        >
                            {loading ? 'Processing...' : 'Sign Up'}
                        </button>
                    </form>
                )}

                {/* STEP 2: OTP VERIFICATION FORM */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                            <input 
                                type="text" 
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Strictly numbers only
                                className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                placeholder="------"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition disabled:bg-slate-300 mt-4"
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-slate-500 text-sm font-medium hover:text-slate-800 transition"
                        >
                            Back to Registration
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in here</Link>
                    </p>
                )}
            </div>
        </div>
    );
}