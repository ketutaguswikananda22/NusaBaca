// Filename: ProfileCard.jsx
import React from 'react';
import { Link } from '@inertiajs/react';

const ProfileCard = ({ user, theme, fileInputRef }) => (
    <div className={`md:col-span-1 md:row-span-2 ${theme?.card} rounded-[2.5rem] p-8 border flex flex-col items-center justify-center text-center shadow-xl`}>
        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-indigo-500/20 bg-neutral-100 dark:bg-[#1c1c1c] flex items-center justify-center relative group">
            {user.avatar ? (
                <img src={user.avatar} className="h-full w-full object-cover" alt={user?.name} />
            ) : (
                <div className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No Image</div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" />
            <button 
                onClick={() => fileInputRef.current.click()} 
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase transition-all"
            >
                Update
            </button>
        </div>
        <h2 className="mt-6 text-2xl font-black tracking-tighter uppercase leading-none">{user?.name}</h2>
        <p className="text-[9px] bg-indigo-500 px-4 py-1.5 rounded-full border border-indigo-400 text-white font-bold uppercase tracking-[0.2em] mt-3">
            Admin Center
        </p>
        <div className="w-full space-y-2 pt-4 border-t border-neutral-100 dark:border-white/5 mt-4">
            <Link 
                href={route('admin.moderation')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 text-[10px] font-black uppercase transition-all"
            >
                Moderation
            </Link>
        </div>
    </div>
);

export default ProfileCard;