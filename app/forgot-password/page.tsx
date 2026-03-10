"use client"
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    
    // UI State
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // STEP 1: Request the OTP
    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post('https://alnroy.pythonanywhere.com/api/auth/password-reset-request/', {
                email: email
            });
            // We move to step 2 even if the email doesn't exist to prevent email enumeration hacking
            setStep(2); 
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to request OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verify OTP and set New Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (newPassword.length < 8) {
            return setError("Password must be at least 8 characters long.");
        }

        setLoading(true);

        try {
            await axios.post('https://alnroy.pythonanywhere.com/api/auth/password-reset-confirm/', {
                email: email,
                otp: otp,
                new_password: newPassword
            });
            
            alert("Password successfully reset! You can now log in.");
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid OTP or failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
                
                <h1 className="text-3xl font-black text-slate-900 mb-2">Reset Password</h1>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 border border-red-100">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    // --- STEP 1 FORM: GET EMAIL ---
                    <form onSubmit={handleRequestOTP} className="space-y-5">
                        <p className="text-slate-500 text-sm mb-6">Enter your email address and we will send you a 6-digit OTP to reset your password.</p>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                                placeholder="angler@example.com"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !email}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:bg-slate-300"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    // --- STEP 2 FORM: VERIFY OTP & RESET ---
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <p className="text-slate-500 text-sm mb-6">We've sent a 6-digit code to <span className="font-bold text-slate-800">{email}</span>. Please enter it below along with your new password.</p>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">6-Digit OTP</label>
                            <input 
                                type="text" 
                                required 
                                maxLength={6}
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-center text-2xl tracking-widest font-mono" 
                                placeholder="••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                            <input 
                                type="password" 
                                required 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                                placeholder="Min. 8 characters"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !otp || !newPassword}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all disabled:bg-slate-300"
                        >
                            {loading ? 'Verifying...' : 'Set New Password'}
                        </button>
                        
                        <div className="text-center mt-4">
                            <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-slate-500 hover:text-blue-600">
                                Didn't receive the code? Try again.
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800">
                        ← Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
}