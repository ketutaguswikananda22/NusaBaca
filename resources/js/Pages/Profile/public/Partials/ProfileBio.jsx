// resources/js/Pages/Profile/public/Partials/ProfileBio.jsx
import React from 'react';

export default function ProfileBio({ author }) {
    return (
        <div className="bg-white rounded-[35px] p-8 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3 mb-6 border-b border-neutral-50 pb-4">
                <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-800">Bio Singkat</h2>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed mb-10 font-medium">
                {author.bio || "Welcome to my creative space! ✨"}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-8 border-t border-neutral-50">
                {author.instagram && (
                    <a href={`https://instagram.com/${author.instagram}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#E4405F] flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg shadow-pink-100">
                        <i className="fab fa-instagram"></i>
                    </a>
                )}
                {author.tiktok && (
                    <a href={`https://tiktok.com/@${author.tiktok}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-all">
                        <i className="fab fa-tiktok text-xs"></i>
                    </a>
                )}
                {author.linkedin && (
                    <a href={`https://linkedin.com/in/${author.linkedin}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                        <i className="fab fa-linkedin-in text-lg"></i>
                    </a>
                )}
                {author.website && (
                    <a href={author.website} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg shadow-orange-100">
                        <i className="fas fa-link text-xs"></i>
                    </a>
                )}
            </div>
        </div>
    );
}