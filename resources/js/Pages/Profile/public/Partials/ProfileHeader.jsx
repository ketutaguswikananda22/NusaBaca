// resources/js/Pages/Profile/public/Partials/ProfileHeader.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import UserAvatar from '@/Components/UserAvatar';

export default function ProfileHeader({ 
    auth, 
    author, 
    isFollowing, 
    followProcessing, 
    onFollow, 
    isMenuOpen, 
    setIsMenuOpen, 
    onReport,
    booksCount
}) {
    const getStorageUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `/storage/${path}`;
    };

    return (
        <>
            {/* --- BANNER --- */}
            <div 
                className="relative h-[350px] w-full bg-cover bg-center transition-all duration-500"
                style={{ 
                    backgroundColor: author.profile_bg_color || '#9ca3af',
                    backgroundImage: author.profile_bg_image ? `url(${getStorageUrl(author.profile_bg_image)})` : 'none' 
                }}
            >
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* --- KARTU PROFIL UTAMA --- */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="relative -mt-40 bg-white rounded-[50px] shadow-sm border border-white p-10 text-center">
                    
                    {/* FOLLOW & MENU BUTTONS */}
                    <div className="absolute top-8 right-8 flex items-center gap-3">
                        {auth.user.id !== author.id && (
                            <>
                                <button 
                                    onClick={onFollow}
                                    disabled={followProcessing}
                                    className={`${
                                        isFollowing 
                                        ? 'bg-neutral-200 text-neutral-600' 
                                        : 'bg-orange-500 text-white shadow-orange-100' 
                                    } hover:opacity-90 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-lg min-w-[120px]`}
                                >
                                    {followProcessing ? '...' : (isFollowing ? 'Berhenti Mengikuti' : 'Ikuti')}
                                </button>
                                
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                                    >
                                        <i className="fas fa-ellipsis-v text-neutral-400"></i>
                                    </button>

                                    {isMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-[50]" onClick={() => setIsMenuOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-3 z-[60] animate-in fade-in zoom-in-95 duration-200">
                                                <button className="w-full text-left px-5 py-2.5 text-[11px] font-bold uppercase text-neutral-600 hover:bg-neutral-50 flex items-center gap-3 transition-colors">
                                                    <i className="fas fa-volume-mute w-4"></i> Mute
                                                </button>
                                                <button className="w-full text-left px-5 py-2.5 text-[11px] font-bold uppercase text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
                                                    <i className="fas fa-ban w-4"></i> Block
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={onReport} 
                                                    className="w-full text-left px-5 py-2.5 text-[11px] font-bold uppercase text-neutral-600 hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <i className="fas fa-flag w-4"></i> Laporkan
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* AVATAR */}
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                        <div className="w-40 h-40 rounded-full border-[8px] border-white shadow-xl overflow-hidden bg-neutral-100">
                            <UserAvatar user={author} className="w-full h-full" />
                        </div>
                    </div>

                    <div className="mt-20 space-y-1">
                        <h1 className="text-4xl font-black text-neutral-800 tracking-tight uppercase">{author.name}</h1>
                        <p className="text-neutral-400 text-sm font-bold tracking-widest uppercase">
    @ {
        (author.username && author.username.trim().toLowerCase() !== 'user')
            ? author.username.trim().toLowerCase()
            : (author.email && !author.email.toLowerCase().startsWith('user@') 
                ? author.email.split('@')[0].toLowerCase()
                : (author.name ? author.name.toLowerCase().replace(/\s+/g, '') : 'anonim'))
    }
</p>
                    </div>

                    {/* STATS */}
                    <div className="flex justify-center items-center gap-12 mt-10">
                        {[
                            { label: 'Karya', value: booksCount },
                            { label: 'Bacaan', value: author.reading_lists_count || 0 },
                            { label: 'Pengikut', value: author.followers_count || 0 },
                            { label: 'Mengikuti', value: author.following_count || 0 },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-2xl font-black text-neutral-800 tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}