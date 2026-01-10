import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function UserProfile({ author, stats, books, isFollowing }) {
    const [activeTab, setActiveTab] = useState('Perihal');

    // Mencegah error jika author tidak terkirim
    if (!author) {
        return <div className="min-h-screen flex items-center justify-center">Memuat profil...</div>;
    }

    const joinDate = author.created_at 
        ? new Date(author.created_at).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })
        : '-';

    return (
        <div className="flex flex-col text-[#222] bg-[#F3F3F3] min-h-screen relative font-sans">
            
            {/* --- HEADER SECTION --- */}
            <div 
                className="min-h-[450px] relative flex flex-col items-center justify-center pt-20 pb-12 overflow-hidden transition-all duration-700 bg-cover bg-center shadow-inner"
                style={{ 
                    backgroundColor: author.profile_bg_color,
                    backgroundImage: author.profile_bg_image ? `url(${author.profile_bg_image})` : 'none'
                }}
            >
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-0"></div>

                <button 
                    onClick={() => window.history.back()} 
                    className="absolute top-8 left-8 text-[11px] px-6 py-2.5 rounded-full font-black uppercase tracking-widest bg-black/20 text-white border border-white/20 backdrop-blur-md hover:bg-white/40 z-20 transition-all shadow-xl"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Kembali
                </button>
                
                <div className="z-10 flex flex-col items-center w-full max-w-4xl px-6">
                    <div className="relative group mb-8">
                        <div className="w-40 h-40 rounded-full border-[6px] border-white/20 overflow-hidden shadow-2xl relative">
                            {author.avatar ? (
                                <img src={author.avatar} className="w-full h-full object-cover" alt={author.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/20 backdrop-blur-xl text-white">
                                    <i className="fas fa-user text-7xl opacity-50"></i>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] text-center text-white shadow-2xl w-full max-w-2xl transition-all duration-700">
                        <h1 className="text-5xl font-black tracking-tighter mb-2">{author.name}</h1>
                        <p className="text-white/70 text-sm font-medium mb-8">@{author.username}</p>

                        <div className="flex gap-4 sm:gap-12 justify-center items-center">
                            <div className="text-center">
                                <p className="text-3xl font-black leading-none mb-1">{books?.length || 0}</p>
                                <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">Karya</p>
                            </div>
                            <div className="h-10 w-[1px] bg-white/20"></div>
                            <div className="text-center">
                                <p className="text-3xl font-black leading-none mb-1">{stats?.readingLists || 0}</p>
                                <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">Bacaan</p>
                            </div>
                            <div className="h-10 w-[1px] bg-white/20"></div>
                            <div className="text-center">
                                <p className="text-3xl font-black leading-none mb-1">{author.followers_count || 0}</p>
                                <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">Pengikut</p>
                            </div>
                        </div>

                        {/* Tombol Follow */}
                        <Link 
                            href={route('author.follow', author.id)} 
                            method="post" 
                            as="button"
                            className={`mt-6 px-8 py-2 rounded-full font-bold uppercase text-xs tracking-widest transition-all ${
                                isFollowing ? 'bg-white/20 text-white' : 'bg-[#ff6122] text-white hover:scale-105'
                            }`}
                        >
                            {isFollowing ? 'Diikuti' : 'Ikuti'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- NAV TAB --- */}
            <div className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 flex gap-12 text-[11px] font-black uppercase tracking-[0.2em]">
                    {['Perihal', 'Percakapan', 'Mengikuti'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-6 border-b-2 transition-all ${
                                activeTab === tab ? 'border-[#ff6122] text-[#ff6122]' : 'border-transparent text-neutral-400'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            <div className="max-w-6xl mx-auto w-full py-12 px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {activeTab === 'Perihal' && (
                        <>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200">
                                    <p className="text-sm mb-8 whitespace-pre-line leading-relaxed italic text-neutral-600">
                                        {author.bio}
                                    </p>
                                    <div className="w-full space-y-5 border-t border-neutral-100 pt-6 text-[13px]">
                                        {author.location && (
                                            <div className="text-neutral-500 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500"><i className="fas fa-map-marker-alt"></i></div> 
                                                {author.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><i className="fas fa-calendar-alt"></i></div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-neutral-400 leading-none">Bergabung</span>
                                                <span className="text-neutral-600 font-bold">{joinDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8">
                                <div className="bg-white p-10 rounded-3xl shadow-sm border border-neutral-200 min-h-[500px]">
                                    <h2 className="text-3xl font-black tracking-tight mb-10">Daftar Karya</h2>
                                    {books?.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-12">
                                            {books.map(book => (
                                                <div key={book.id} className="flex flex-col sm:flex-row gap-8 group">
                                                    <Link href={route('books.show', book.id)} className="relative flex-shrink-0 overflow-hidden rounded-xl shadow-lg">
                                                        <img src={book.cover_path || '/default-cover.png'} className="w-40 h-56 object-cover" alt={book.title} />
                                                    </Link>
                                                    <div className="flex flex-col justify-center flex-1">
                                                        <h3 className="text-xl font-black uppercase text-[#222] mb-2">{book.title}</h3>
                                                        <div className="flex gap-4 mb-4 text-[11px] font-bold text-neutral-400">
                                                            <span><i className="fas fa-eye text-[#ff6122]"></i> {book.views_count || 0}</span>
                                                            <span><i className="fas fa-list-ul"></i> {book.parts_count || 0} Part</span>
                                                        </div>
                                                        <p className="text-sm text-neutral-500 line-clamp-3 mb-6 italic">{book.description}</p>
                                                        <Link href={route('books.show', book.id)} className="text-[#ff6122] text-[10px] font-black uppercase tracking-widest">Baca Selengkapnya</Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 opacity-20 italic">Belum ada karya.</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}