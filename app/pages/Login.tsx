import { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        
        try {
            const result = await signIn('credentials', {
                redirect: false, // Kita tangani redirect manual
                email,
                password,
            });

            if (result?.error) {
                setErrorMsg(result.error);
            } else {
                router.push('/admin'); // Redirect jika berhasil
            }
        } catch (error) {
            setErrorMsg('Terjadi kesalahan.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 bg-gradient-to-b from-teal-100/60 to-emerald-50/20 rounded-full blur-3xl opacity-70 transform rotate-12 animate-pulse" />
                <div className="absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 bg-gradient-to-t from-sky-100/50 to-teal-50/30 rounded-full blur-3xl opacity-60" />
            </div>

            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/50 relative z-10">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg mb-4 transform transition hover:scale-105 duration-300">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Portal Admin
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                        Masuk untuk mengelola sistem informasi Desa Pulung Merdiko
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl text-center font-medium animate-pulse">
                        {errorMsg}
                    </div>
                )}

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email Field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-300 shadow-sm"
                                placeholder="Alamat Email"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-300 shadow-sm"
                                placeholder="Kata Sandi"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-gray-600 cursor-pointer">
                                Ingat saya
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-bold text-teal-600 hover:text-teal-500 transition-colors">
                                Lupa sandi?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 shadow-lg shadow-teal-500/30 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <ArrowRight className="h-5 w-5 text-teal-500 group-hover:text-teal-300 transition-colors duration-300" />
                            </span>
                            {isLoading ? 'Memproses...' : 'Masuk ke Dasbor'}
                        </button>
                    </div>
                </form>

                {/* Footer Link */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                    <a href="/" className="inline-flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors group">
                        <Home className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                        <span>Kembali ke Beranda Desa</span>
                    </a>
                </div>

            </div>
        </div>
    );
}
