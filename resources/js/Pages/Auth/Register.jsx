import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Buat Akun - NusaBaca" />

            <div className="mb-8 text-center text-white italic">
                Nusa<span className="text-[#ff6122] italic">Baca</span>
                <h2 className="text-2xl font-black text-white not-italic bold">REGISTER FORM</h2>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-slate-300" />
                    <TextInput 
                        id="name" name="name" value={data.name} 
                        className="mt-1 block w-full bg-white/5 border-white/10 text-white focus:ring-indigo-500" 
                        autoComplete="name" isFocused={true} onChange={(e) => setData('name', e.target.value)} required 
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" className="text-slate-300" />
                    <TextInput 
                        id="email" type="email" name="email" value={data.email} 
                        className="mt-1 block w-full bg-white/5 border-white/10 text-white focus:ring-indigo-500" 
                        onChange={(e) => setData('email', e.target.value)} required 
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4 relative">
                    <InputLabel htmlFor="password" value="Password" className="text-slate-300" />
                    <TextInput
                        id="password" type={showPassword ? 'text' : 'password'}
                        name="password" value={data.password}
                        className="mt-1 block w-full bg-white/5 border-white/10 text-white focus:ring-indigo-500"
                        onChange={(e) => setData('password', e.target.value)} required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-slate-500">
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" className="text-slate-300" />
                    <TextInput
                        id="password_confirmation" type="password"
                        name="password_confirmation" value={data.password_confirmation}
                        className="mt-1 block w-full bg-white/5 border-white/10 text-white focus:ring-indigo-500"
                        onChange={(e) => setData('password_confirmation', e.target.value)} required
                    />
                </div>

                <button 
                    className="w-full mt-8 bg-indigo-00 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                    disabled={processing}
                >
                    REGISTER
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-700"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#1a1c2e] px-2 text-slate-400">Daftar menggunakan</span>
                    </div>
                </div>
                    <a 
                        href={route('google.login')} 
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-transparent py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google Logo" />
                        Google
                    </a>

                <p className="text-center mt-8 text-white text-sm font-medium">
                    Sudah punya akun? <Link href={route('login')} className="text-indigo-400 font-black hover:underline">Login</Link>
                </p>
            </form>
        </GuestLayout>
    );
}