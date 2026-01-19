// resources/js/Pages/Profile/public/Partials/PublishedBooks.jsx
import React from 'react';
import { Link } from '@inertiajs/react';

export default function PublishedBooks({ books }) {
    const getStorageUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `/storage/${path}`;
    };

    return (
        <div className="bg-white rounded-[35px] p-8 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-10 border-b border-neutral-50 pb-6">
                <h2 className="text-xl font-black text-neutral-800 italic uppercase">Karya <span className="text-orange-500 font-black">Terbit</span></h2>
                <span className="bg-neutral-900 text-[10px] font-black text-white px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {books?.length || 0} Cerita
                </span>
            </div>

            <div className="space-y-12">
                {books?.length > 0 ? books.map((book) => (
                    <div key={book.id} className="group flex flex-col md:flex-row gap-8 items-start">
                        {/* Cover Section */}
                        <div className="relative w-full md:w-40 h-56 rounded-2xl overflow-hidden shadow-xl flex-shrink-0 bg-neutral-100 border border-neutral-100">
                            <img 
                                src={getStorageUrl(book.cover_path)} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                alt={book.title} 
                                onError={(e) => e.target.src = '/images/default-cover.jpg'} 
                            />
                            <div className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex flex-col items-center justify-center border border-white">
                                <span className="text-[10px] font-black text-neutral-800 leading-none">{book.ratings_avg_rating ? Number(book.ratings_avg_rating).toFixed(1) : '0.0'}</span>
                                <i className="fas fa-star text-[8px] text-orange-500 mt-0.5"></i>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 flex flex-col pt-2">
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {book.genres?.map((g, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 px-3 py-1 rounded-md">{g.name}</span>
                                ))}
                            </div>
                            <h3 className="text-xl font-black text-neutral-800 leading-tight mb-3 group-hover:text-orange-500 transition-colors uppercase italic tracking-tighter">{book.title}</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2 mb-6 font-medium">{book.description}</p>
                            
                            <div className="flex items-center gap-8 mb-8 border-t border-neutral-50 pt-6">
                                <StatItem icon="far fa-eye" color="blue" label="Reads" value={book.views_count} />
                                <StatItem icon="far fa-star" color="orange" label="Rating" value={book.ratings_avg_rating} isFloat />
                                <StatItem icon="fas fa-layer-group" color="green" label="Part" value={book.parts_count} />
                                
                                <Link href={route('books.show', book.id)} className="ml-auto bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-neutral-100">
                                    Baca Sekarang
                                </Link>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-neutral-400 uppercase font-bold text-xs tracking-widest">Belum ada karya yang diterbitkan</div>
                )}
            </div>
        </div>
    );
}

// Sub-component internal untuk merapikan statistik
function StatItem({ icon, color, label, value, isFloat = false }) {
    const bgColors = { blue: 'bg-blue-50 text-blue-500', orange: 'bg-orange-50 text-orange-500', green: 'bg-green-50 text-green-500' };
    return (
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgColors[color]}`}><i className={`${icon} text-xs`}></i></div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-neutral-400 uppercase leading-none tracking-tighter">{label}</span>
                <span className="text-xs font-black text-neutral-700">{isFloat ? (value ? Number(value).toFixed(1) : '0.0') : (value || 0)}</span>
            </div>
        </div>
    );
}