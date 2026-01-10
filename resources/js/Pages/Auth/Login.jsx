import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react'; 

export default function Login({ status, canResetPassword }) {
    // Mengambil data flash dari props dengan pengamanan object kosong
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false); 

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };
    
    return (
        <GuestLayout>
            <Head title="Log in - NusaBaca" />
            
            <div className="mb-8 text-center sm:text-left text-white italic">
                Nusa<span className="text-[#ff6122] bold italic">Baca</span>
                <h2 className="text-2xl font-black text-white not-italic">Selamat Datang Kembali!</h2>
                <p className="text-slate-400 text-sm mt-1 font-medium not-italic">Masuk untuk melanjutkan bacaan favoritmu.</p>
            </div>

            {/* ERROR BOX - Menggunakan Optional Chaining (?.) agar tidak crash */}
            {flash?.error_suspended && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-red-500/20 p-2.5 rounded-xl border border-red-500/50 flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h5 className="text-red-500 font-black text-xs uppercase tracking-wider">Maaf, akses Ditolak</h5>
                        <p className="text-red-200/70 text-[11px] font-medium leading-tight mt-0.5">
                            {flash.error_suspended}
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-300" />
                    <TextInput 
                        id="email" type="email" name="email" value={data.email} 
                        className="mt-1 block w-full bg-white/5 border-white/10 text-white focus:ring-indigo-500" 
                        isFocused={true} onChange={(e) => setData('email', e.target.value)} 
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4 relative">
                    <InputLabel htmlFor="password" value="Password" className="text-slate-300" />
                    <TextInput
                        id="password" type={showPassword ? 'text' : 'password'}
                        name="password" value={data.password}
                        className="mt-1 block w-full pr-12 bg-white/5 border-white/10 text-white focus:ring-indigo-500"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-slate-500 hover:text-white transition-colors">
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                        <span className="ms-2 text-sm text-slate-400">remember me</span>
                    </label>
                    {canResetPassword && <Link href={route('password.request')} className="text-sm text-indigo-400 hover:text-indigo-300 font-bold">Lupa Password?</Link>}
                </div>

                <button 
                    className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                    disabled={processing}
                >
                    {processing ? 'PROCESSING...' : 'LOGIN'}
                </button>

                 <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-700"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#1a1c2e] px-2 text-slate-400">Login dengan</span>
                    </div>
                </div>
                    <a 
                        href={route('google.login')} 
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-transparent py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google Logo" />
                        Google
                    </a>

                <p className="text-center mt-8 text-slate-400 text-sm font-medium">
                    Belum punya akun? <Link href={route('register')} className="text-indigo-400 font-black hover:underline">Register</Link>
                </p>
            </form>
        </GuestLayout>
    );
}