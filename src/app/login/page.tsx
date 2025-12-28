"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password,
        });

        if (error) {
            setError(error.message === 'Invalid login credentials' ? 'אימייל או סיסמה שגויים. וודא שנרשמת קודם עם המייל המדויק.' : error.message);
        } else {
            router.push('/');
        }
        setLoading(false);
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password,
            options: {
                data: {
                    full_name: 'Zaky Admin',
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            alert('נרשמת בהצלחה! כעת המערכת תהפוך אותך לאדמין.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans" dir="rtl">
            <div className="max-w-md w-full bg-slate-900 rounded-[32px] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px] rounded-full -mr-16 -mt-16"></div>

                <div className="text-center mb-10 relative">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/20 transform hover:rotate-6 transition-transform">
                        🐍
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">NextGen LMS</h1>
                    <p className="text-slate-400 mt-3 font-medium text-lg italic">The Future of Python Learning</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-2xl mb-8 text-sm flex items-center gap-3 animate-shake">
                        <span className="text-xl">⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6 relative">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mr-1">דואר אלקטרוני</label>
                        <input
                            type="email"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 outline-none transition-all shadow-inner"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mr-1">סיסמה</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 outline-none transition-all shadow-inner"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-2"
                            >
                                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-98 text-lg"
                        >
                            {loading ? 'מבצע כניסה...' : 'כניסה למערכת 🚀'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSignUp}
                            disabled={loading}
                            className="w-full bg-transparent hover:bg-slate-800 text-slate-400 font-bold py-4 rounded-2xl border border-slate-800 transition-all text-sm"
                        >
                            עדיין אין לך חשבון? צור אחד חדש
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">Powered by Antigravity v5.0</p>
                </div>
            </div>
        </div>
    );
}
