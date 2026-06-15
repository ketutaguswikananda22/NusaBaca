// resources/js/Pages/Profile/public/Partials/SocialConnections.jsx
import React from 'react';
import { Link, router } from '@inertiajs/react';
import UserAvatar from '@/Components/UserAvatar';

export default function SocialConnections({ title, users, auth }) {
    
    // FIX MASALAH 3: Handler klik tombol follow/unfollow
    const handleFollowToggle = (e, targetUser) => {
        e.preventDefault();
        e.stopPropagation(); // Mencegah klik tembus ke Link profil

        const isCurrentlyFollowed = targetUser.is_followed ?? false;
        const routeName = isCurrentlyFollowed ? 'profile.unfollow' : 'profile.follow';

        // Eksekusi post ke Laravel
        router.post(route(routeName, targetUser.id), {}, {
            preserveScroll: true,
        });
    };
    
    return (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {users && users.length > 0 ? (
                    users.map((user) => (
                        <div key={user.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 flex flex-col relative group transition-all hover:shadow-md">
                            
                            <Link href={route('author.profile', user.id)} className="flex flex-col w-full h-full">
                                {/* Header Hijau Card */}
                                <div className="bg-[#56805D] w-full h-20"></div>
                                
                                {/* Avatar */}
                                <div className="absolute top-10 left-1/2 -translate-x-1/2">
                                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm">
                                        <UserAvatar 
                                            user={user} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                </div>

                                {/* Info Teks */}
                                <div className="pt-12 pb-4 px-4 text-center flex-grow flex flex-col justify-center">
                                    <h3 className="font-black text-sm text-neutral-800 uppercase tracking-wide line-clamp-1">
                                        {user.name}
                                    </h3>
                                    
                                    {/* FIX MASALAH 1: Fallback pintar agar tidak mentok di @user */}
                                    <span className="text-[10px] text-neutral-400 font-medium lowercase tracking-wider mt-1">
                                        @{
                                            (user.username && user.username !== 'user')
                                                ? user.username
                                                : (user.email && !user.email.startsWith('user@') 
                                                    ? user.email.split('@')[0] 
                                                    : user.name.toLowerCase().replace(/\s+/g, ''))
                                        }
                                    </span>
                                </div>
                            </Link>

                            {/* Tombol Follow Dinamis */}
                            {auth?.user?.id !== user.id && (
                                <div className="px-4 pb-5 w-full">
                                    <button
                                        onClick={(e) => handleFollowToggle(e, user)}
                                        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                            user.is_followed 
                                                ? 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300' // Tampilan jika DIIKUTI
                                                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'    // Tampilan jika IKUTI
                                        }`}
                                    >
                                        {user.is_followed ? 'Diikuti' : 'Ikuti'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-neutral-100">
                        <div className="text-neutral-400 uppercase font-black text-[11px] tracking-[0.2em]">
                            Belum Ada {title}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}