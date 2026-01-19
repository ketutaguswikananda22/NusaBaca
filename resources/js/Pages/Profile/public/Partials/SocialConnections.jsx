// resources/js/Pages/Profile/public/Partials/SocialConnections.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import UserAvatar from '@/Components/UserAvatar';

export default function SocialConnections({ title, users }) {
    return (
        <div className="bg-white rounded-[35px] p-10 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-800 mb-10 text-center">
                {title}
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8">
                {users && users.length > 0 ? (
                    users.map((user) => (
                        <Link 
                            key={user.id} 
                            href={route('author.profile', user.id)} 
                            className="flex flex-col items-center group"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 rounded-[25px] overflow-hidden border-4 border-transparent group-hover:border-orange-500 transition-all shadow-md mb-4 bg-neutral-50">
                                    <UserAvatar 
                                        user={user} 
                                        className="w-20 h-20 rounded-[25px] object-cover" 
                                    />
                                </div>
                            </div>
                            <span className="text-xs font-black text-neutral-800 group-hover:text-orange-500 uppercase italic tracking-tighter transition-colors text-center line-clamp-1">
                                {user.name}
                            </span>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <div className="text-neutral-300 uppercase font-black text-[10px] tracking-[0.3em]">
                            Belum Ada {title}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}