import React, { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react'; // Tambah router untuk delete
import Swal from 'sweetalert2';

export default function EditProfile({ auth, user }) {
    // Menggunakan useForm dari Inertia untuk handle input dan upload file
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        profile_photo: null,
        banner_photo: null,
        _method: 'PUT', // Digunakan jika route Laravel menggunakan Route::put
    });

    const [previewProfile, setPreviewProfile] = useState(user.profile_photo_url);
    const [previewBanner, setPreviewBanner] = useState(user.banner_url || '/default-banner.jpg');

    // --- FITUR HAPUS AKUN ---
    const handleDeleteAccount = () => {
        Swal.fire({
            title: 'Hapus Akun?',
            text: "Tindakan ini permanen. Semua data karya dan poinmu akan dihapus selamanya!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus Akun',
            cancelButtonText: 'Batal',
            background: '#1a0b0b',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('profile.destroy'), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Akun kamu telah dihapus.',
                            icon: 'success',
                            background: '#1a0b0b',
                            color: '#fff'
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Gagal menghapus akun. Coba lagi nanti.',
                            icon: 'error',
                            background: '#1a0b0b',
                            color: '#fff'
                        });
                    }
                });
            }
        });
    };

    // Handle Perubahan Foto Profil
    const handleProfileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_photo', file);
            setPreviewProfile(URL.createObjectURL(file));
        }
    };

    // Handle Perubahan Banner
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('banner_photo', file);
            setPreviewBanner(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Profil berhasil diperbarui!',
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#1a0b0b',
                    color: '#fff'
                });
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#1a0b0b] text-white pb-20 font-sans">
            {/* Header / Top Bar */}
            <div className="flex items-center justify-between p-4 bg-[#1a0b0b] sticky top-0 z-50 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Personalization Mode</span>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={submit}
                        disabled={processing}
                        className="bg-[#ff5722] hover:bg-[#f44336] text-white px-6 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50"
                    >
                        {processing ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                    </button>
                    <Link 
                        href={route('profile.show', user.username)}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full text-xs font-bold transition-all"
                    >
                        BATAL
                    </Link>
                </div>
            </div>

            <form onSubmit={submit}>
                {/* Banner Section */}
                <div className="relative h-64 md:h-80 w-full bg-gray-800 overflow-hidden">
                    <img 
                        src={previewBanner} 
                        className="w-full h-full object-cover opacity-60" 
                        alt="Banner Preview" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <label className="cursor-pointer bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg border border-white/20 transition-all">
                            <span className="text-sm font-medium">📷 GANTI SAMPUL</span>
                            <input type="file" className="hidden" onChange={handleBannerChange} accept="image/*" />
                        </label>
                    </div>
                </div>

                {/* Profile Photo Section */}
                <div className="flex flex-col items-center -mt-20 relative z-10">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full border-4 border-[#1a0b0b] overflow-hidden bg-gray-700 shadow-2xl">
                            <img 
                                src={previewProfile} 
                                className="w-full h-full object-cover" 
                                alt="Profile Preview" 
                            />
                        </div>
                        <label className="absolute bottom-2 right-2 cursor-pointer bg-[#ff5722] p-3 rounded-full shadow-xl hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            <input type="file" className="hidden" onChange={handleProfileChange} accept="image/*" />
                        </label>
                    </div>
                </div>

                {/* Form Fields Section */}
                <div className="max-w-2xl mx-auto mt-10 px-6">
                    <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-inner">
                        {/* Name Input */}
                        <div className="mb-6">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[3px] mb-2 ml-4">Display Name</label>
                            <input 
                                type="text" 
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-black/40 border-none rounded-2xl py-4 px-6 text-xl font-bold text-center focus:ring-2 focus:ring-[#ff5722] transition-all"
                                placeholder="Masukkan Nama..."
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 ml-4">{errors.name}</p>}
                        </div>

                        {/* Email (Read Only) */}
                        <div className="mb-6 opacity-60">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[3px] mb-2 ml-4">Email Address</label>
                            <div className="w-full bg-black/20 border-none rounded-2xl py-3 px-6 text-sm text-center text-gray-400">
                                {user.email}
                            </div>
                        </div>

                        {/* Bio Input */}
                        <div className="mb-8">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[3px] mb-2 ml-4">Bio / Tentang Saya</label>
                            <textarea 
                                value={data.bio}
                                onChange={e => setData('bio', e.target.value)}
                                className="w-full bg-black/40 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#ff5722] transition-all min-h-[100px]"
                                placeholder="Tuliskan sesuatu tentang dirimu..."
                            />
                            {errors.bio && <p className="text-red-500 text-xs mt-1 ml-4">{errors.bio}</p>}
                        </div>

                        {/* --- DANGER ZONE / HAPUS AKUN --- */}
                        <div className="border-t border-white/10 pt-8 mt-4 text-center">
                            <p className="text-[10px] font-bold text-red-500/50 uppercase tracking-[3px] mb-4">Zona Berbahaya</p>
                            <button 
                                type="button"
                                onClick={handleDeleteAccount}
                                className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-600/30 transition-all"
                            >
                                <i className="fas fa-trash-alt mr-2"></i> Hapus Akun Selamanya
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}