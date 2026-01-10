// path: resources/js/Components/AboutMe.jsx
import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';

export default function AboutMe({ user }) {
    // 1. State untuk toggle tampilan (Preview vs Edit)
    const [isEditing, setIsEditing] = useState(false);

    // 2. Form data menggunakan Inertia useForm
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        bio: user.bio || '',
        facebook_url: user.facebook_url || '',
        twitter_url: user.twitter_url || '',
        instagram_url: user.instagram_url || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false), // Tutup form jika berhasil
        });
    };

    return (
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm overflow-hidden">
            {!isEditing ? (
                /* --- MODE PREVIEW (image_def289.png) --- */
                <div className="p-8">
                    {!user.bio ? (
                        /* Tampilan Jika Bio Kosong */
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#FF6122]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-black uppercase text-neutral-800 dark:text-white mb-2 tracking-tight">
                                Bantu pengguna lain mengenal dirimu
                            </h3>
                            <p className="text-xs text-neutral-500 mb-6">
                                Ceritakan tentang dirimu, apa yang kamu baca, atau apa yang kamu tulis.
                            </p>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="bg-[#FF6122] hover:bg-[#e5561f] text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20"
                            >
                                Tambahkan deskripsi
                            </button>
                        </div>
                    ) : (
                        /* Tampilan Jika Bio Sudah Ada */
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#FF6122]">About Me</h3>
                                <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 uppercase">Edit</button>
                            </div>
                            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 italic">
                                "{user.bio}"
                            </p>
                        </div>
                    )}

                    {/* Media Sosial Icons (Dinamis) */}
                    <div className="flex justify-center gap-5 mt-8 pt-6 border-t border-neutral-50 dark:border-white/5">
                        <SocialLink href={user.facebook_url} icon="fab fa-facebook-f" color="hover:text-blue-600" />
                        <SocialLink href={user.twitter_url} icon="fab fa-twitter" color="hover:text-sky-400" />
                        <SocialLink href={user.instagram_url} icon="fab fa-instagram" color="hover:text-pink-500" />
                        <SocialLink href={`mailto:${user.email}`} icon="fas fa-envelope" color="hover:text-orange-500" isStatic />
                    </div>
                </div>
            ) : (
                /* --- MODE EDIT (image_df4849.png) --- */
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black uppercase tracking-tight">Edit Profil Detail</h3>
                        <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-red-500 uppercase">Batal</button>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="bio" value="Deskripsi Singkat" className="text-[10px] uppercase font-black text-neutral-400" />
                            <textarea
                                id="bio"
                                className="mt-1 block w-full border-neutral-200 dark:border-zinc-800 dark:bg-zinc-950 rounded-2xl text-sm focus:ring-[#FF6122] focus:border-[#FF6122]"
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                rows="4"
                                placeholder="Siapa kamu? Apa genremu?..."
                            />
                        </div>

                        <div className="space-y-3">
                            <InputLabel value="Tautan Media Sosial" className="text-[10px] uppercase font-black text-neutral-400" />
                            <SocialInput icon="fab fa-facebook text-blue-600" placeholder="URL Facebook" value={data.facebook_url} onChange={(e) => setData('facebook_url', e.target.value)} />
                            <SocialInput icon="fab fa-twitter text-sky-400" placeholder="URL Twitter" value={data.twitter_url} onChange={(e) => setData('twitter_url', e.target.value)} />
                            <SocialInput icon="fab fa-instagram text-pink-500" placeholder="URL Instagram" value={data.instagram_url} onChange={(e) => setData('instagram_url', e.target.value)} />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <PrimaryButton disabled={processing} className="bg-[#FF6122] hover:bg-[#e5561f] rounded-full">
                                Simpan Perubahan
                            </PrimaryButton>
                            
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-xs text-green-600 font-bold uppercase">Tersimpan!</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

// Sub-Komponen Icon Sosmed
function SocialLink({ href, icon, color, isStatic = false }) {
    if (!href && !isStatic) return null;
    return (
        <a href={href || '#'} target="_blank" className={`text-neutral-300 ${color} transition-all transform hover:scale-110`}>
            <i className={`${icon} text-lg`}></i>
        </a>
    );
}

// Sub-Komponen Input Sosmed
function SocialInput({ icon, ...props }) {
    return (
        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-zinc-950 px-4 py-1 rounded-xl border border-neutral-100 dark:border-zinc-800">
            <i className={`${icon} w-5 text-center`}></i>
            <input 
                {...props}
                type="text" 
                className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white" 
            />
        </div>
    );
}