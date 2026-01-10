import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ auth, books = [], genres = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('Semua');

    // Mencegah error jika auth atau user belum load
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    const filteredBooks = (books || []).filter(book => {
        const matchesSearch = (book.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        let bookGenres = [];
        try {
            if (Array.isArray(book.genre)) {
                bookGenres = book.genre;
            } else if (typeof book.genre === 'string') {
                bookGenres = JSON.parse(book.genre);
            }
        } catch (e) {
            bookGenres = book.genre ? [book.genre] : [];
        }

        const targetGenre = selectedGenre.toLowerCase();
        const matchesGenre = selectedGenre === 'Semua' || 
                             bookGenres.some(g => String(g).toLowerCase().includes(targetGenre));
        
        return matchesSearch && matchesGenre;
    });

    const getGenreStyle = (genreName) => {
        const name = String(genreName).toLowerCase();
        const styles = {
            fantasy: 'bg-purple-100 text-purple-700 border-purple-200',
            romance: 'bg-pink-100 text-pink-700 border-pink-200',
            mystery: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            horror: 'bg-gray-800 text-gray-100 border-gray-900',
            adventure: 'bg-orange-100 text-orange-700 border-orange-200',
            technology: 'bg-blue-100 text-blue-700 border-blue-200',
            drama: 'bg-teal-100 text-teal-700 border-teal-200',
        };
        return styles[name] || 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const dynamicGenres = ['Semua', ...(genres || []).map(g => g.name)];
    
    // Perbaikan Baris 45: Gunakan Optional Chaining agar tidak crash
    const theme = user?.role === 'admin' ? { accent: 'bg-indigo-600' } : { accent: 'bg-emerald-600' };

    return (
        <AuthenticatedLayout
            auth={auth}
            user={user}
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="font-bold text-2xl text-slate-800 tracking-tight">
                            {isAdmin ? 'Katalog Buku Terbit' : 'Katalog Buku NusaBaca'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Cari judul..." 
                            className="rounded-xl border-slate-200 text-sm focus:ring-indigo-500 w-full md:w-64"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Pengecekan role yang lebih aman */}
                        {(isAdmin || user?.role === 'author' || user?.role === 'penulis') && (
                            <Link href={route('books.create')} className={`${theme.accent} text-white px-6 py-2 rounded-xl font-bold text-xs uppercase shadow-lg`}>
                                + Upload
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Katalog Buku" />
            <div className="py-8 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Filter Genre */}
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {dynamicGenres.map(g => (
                            <button 
                                key={g} 
                                onClick={() => setSelectedGenre(g)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedGenre === g ? 'bg-slate-800 text-white shadow-md' : 'bg-white border text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>

                    {/* Grid Buku */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredBooks.map(book => (
                            <div key={book.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-md transition-all relative">
                                <Link href={route('books.show', book.id)} className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                                    <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter shadow-sm border ${
                                        book.status === 'pending' 
                                            ? 'bg-amber-400 text-amber-900 border-amber-500' 
                                            : 'bg-emerald-500 text-white border-emerald-800'
                                    }`}>
                                        {book.status === 'pending' ? 'Pending' : 'Published'}
                                    </div>

                                    <img 
                                        src={book.cover_path} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                        alt={book.title}
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=f1f5f9&color=64748b&bold=true`; 
                                        }}
                                    />
                                </Link>

                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-bold text-sm truncate text-slate-800 mb-1 uppercase">
                                        {book.title}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mb-3">Oleh: {book.user?.name || 'Anonim'}</p>
                                    
                                    <div className="flex flex-wrap gap-1 mt-auto mb-3">
                                        {(Array.isArray(book.genre) ? book.genre : (typeof book.genre === 'string' ? JSON.parse(book.genre || '[]') : [])).map((g, i) => (
                                            <span 
                                                key={i} 
                                                className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border transition-all duration-300 ${getGenreStyle(g)}`}
                                            >
                                                {g}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Proteksi tombol edit */}
                                    {(user?.id === book.user_id || isAdmin) && (
                                        <div className="pt-3 border-t border-slate-50 mt-auto">
                                            <Link 
                                                href={route('books.edit', book.id)} 
                                                className="text-indigo-600 text-[10px] font-black uppercase hover:text-indigo-800 transition"
                                            >
                                                Kelola Buku
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredBooks.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                            <p className="text-slate-400 font-medium">Buku tidak ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}