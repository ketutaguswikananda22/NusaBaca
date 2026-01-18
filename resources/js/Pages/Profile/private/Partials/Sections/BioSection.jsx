import React from 'react';
import { Link } from '@inertiajs/react';

export default function BioSection({ user, isEditing, formData, handleChange, joinDate, expandedSinopsis, toggleSinopsis }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* BOX BIO KIRI */}
            <div className="lg:col-span-4">
                <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm sticky top-24">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#ff6122] mb-6 flex items-center">
                        <span className="w-8 h-[2px] bg-[#ff6122] mr-3"></span>
                        Bio Singkat
                    </h4>
                    {isEditing ? (
                        <div className="space-y-4">
                            <textarea 
                                name="bio"
                                value={formData.bio ?? ''}
                                onChange={handleChange}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-[#ff6122]/20"
                                placeholder="Tulis bio kamu..."
                            />
                            <div className="grid grid-cols-1 gap-3">
                                {['instagram', 'tiktok', 'linkedin', 'twitter', 'website'].map((social) => (
                                    <div key={social} className="relative">
                                        <i className={`fab fa-${social === 'website' ? 'link' : social === 'twitter' ? 'x-twitter' : social} absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400`}></i>
                                        <input name={social} value={formData[social] ?? ''} onChange={handleChange} placeholder={`Username ${social}`} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-sm" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-[15px] leading-relaxed text-neutral-600">
                                {user.bio || "Penulis ini belum membagikan ceritanya."}
                            </p>
                            <div className="pt-6 border-t border-neutral-100">
                                <div className="flex flex-wrap gap-3">
                                    {['instagram', 'tiktok', 'linkedin', 'twitter', 'website'].map((social) => {
                                        if (!user[social]) return null;
                                        const url = social === 'website' ? (user.website.startsWith('http') ? user.website : `https://${user.website}`) : `https://${social}.com/${social === 'tiktok' ? '@' : ''}${user[social]}`;
                                        const colors = { instagram: 'bg-[#E4405F]', tiktok: 'bg-black', linkedin: 'bg-[#0A66C2]', twitter: 'bg-[#1DA1F2]', website: 'bg-[#ff6122]' };
                                        return (
                                            <a key={social} href={url} target="_blank" className={`w-10 h-10 rounded-full ${colors[social]} flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm`}>
                                                <i className={`fab fa-${social === 'website' ? 'link' : social === 'twitter' ? 'x-twitter' : social} text-lg`}></i>
                                            </a>
                                        );
                                    })}
                                </div>
                                <div className="mt-5 flex items-center gap-2 text-neutral-400">
                                    <i className="fas fa-calendar-alt text-xs"></i>
                                    <span className="text-[11px] font-bold uppercase tracking-tight text-[#0118D8]">
                                        Bergabung {joinDate}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* LIST BUKU KANAN */}
<div className="lg:col-span-8">
    {/* AUDIT: Cek apakah user punya buku ATAU rolenya adalah 'penulis' */}
    {(user.books && user.books.length > 0) || user.role === 'penulis' ? (
        <div className="bg-slate-900 bg-gradient-to-t from-[#1a202c] to-slate-900 rounded-[40px] border border-neutral-800 overflow-hidden shadow-2xl">
            <div className="px-8 pt-8 pb-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
                    Karya <span className="text-[#ff6122]">Terbit</span>
                </h3>
                <span className="bg-[#ff6122]/10 text-[#ff6122] px-4 py-1 rounded-full text-[10px] font-black uppercase border border-[#ff6122]/20">
                    {user.books?.length || 0} Judul
                </span>
            </div>

            <div className="divide-y divide-white/5">
                {user.books?.length > 0 ? (
                    user.books.map((book) => (
                        <div key={book.id} className="group p-8 transition-all duration-500 hover:bg-white/[0.02]">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="relative shrink-0 self-center md:self-start">
                                    <div className="w-36 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                                        <img 
                                            src={book.cover_path} 
                                            className="w-full h-full object-cover" 
                                            alt={book.title} 
                                            onError={(e) => { e.target.src = '/image/default-cover.png' }} 
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col flex-grow">
                                    <Link href={`/books/${book.id}`}>
                                        <h3 className="text-2xl font-black text-white mb-4 group-hover:text-[#ff6122] transition-colors leading-tight">
                                            {book.title}
                                        </h3>
                                    </Link>
                                    <p className={`text-neutral-400 text-sm mb-6 leading-relaxed ${expandedSinopsis[book.id] ? '' : 'line-clamp-3'}`}>
                                        {book.description}
                                    </p>
                                    {book.description?.length > 150 && (
                                        <button onClick={(e) => toggleSinopsis(e, book.id)} className="text-[#ff6122] text-[10px] font-black uppercase mb-6 text-left hover:underline">
                                            {expandedSinopsis[book.id] ? 'Tutup Sinopsis' : 'Baca Selengkapnya'}
                                        </button>
                                    )}
                                    
                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-dashed border-white/10">
                                        <div className="flex gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">👁️ Reads</span>
                                                <span className="text-sm font-black text-white">{book.views_count || 0}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">⭐ Rating</span>
                                                <span className="text-sm font-black text-white">{parseFloat(book.average_rating || 0).toFixed(1)}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">📚 Part</span>
                                                <span className="text-sm font-black text-white">{book.parts_count || 0}</span>
                                            </div>
                                        </div>
                                        <Link href={`/books/${book.id}`} className="bg-[#ff6122] text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-xl hover:bg-white hover:text-black transition-all shadow-lg shadow-[#ff6122]/20">
                                            Baca
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    /* TAMPILAN KHUSUS: Author baru tapi belum ada buku (Ketut Agus) */
                    <div className="py-24 text-center px-10">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <i className="fas fa-book-open text-white/20 text-2xl"></i>
                        </div>
                        <p className="text-white font-bold italic opacity-40 text-sm uppercase tracking-widest">
                            Penulis ini sedang menyiapkan karya terbaiknya.
                        </p>
                    </div>
                )}
            </div>
        </div>
    ) : (
        /* TAMPILAN KHUSUS: User biasa (Bukan Penulis & Buku 0) */
        <div className="bg-white p-12 rounded-[40px] border border-dashed border-neutral-200 text-center flex flex-col items-center shadow-sm">
            <div className="w-24 h-24 bg-orange-50 text-[#ff6122] rounded-[30px] flex items-center justify-center mb-8 rotate-3 shadow-orange-100 shadow-xl">
                <i className="fas fa-pen-nib text-3xl"></i>
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-4">
                Mulai Langkahmu <br/> <span className="text-[#ff6122]">Sebagai Penulis</span>
            </h3>
            <p className="text-neutral-500 text-[15px] mb-10 max-w-sm leading-relaxed">
                Wujudkan imajinasimu menjadi karya nyata. Ajukan dirimu menjadi penulis di NusaBaca hari ini.
            </p>
            <Link 
                href="/join-writer" 
                className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ff6122] transition-all shadow-xl shadow-black/5 hover:shadow-[#ff6122]/20"
            >
                Daftar Jadi Penulis
            </Link>
        </div>
    )}
</div>
        </div>
    );
}