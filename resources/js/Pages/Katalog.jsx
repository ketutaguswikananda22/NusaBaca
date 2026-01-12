import { Link, Head, useForm } from '@inertiajs/react';

export default function Katalog({ auth, books = [] }) {
    const { data, setData, get } = useForm({ search: '' });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('katalog.index'), {
            search: data.search
        }, {
            preserveState: true, 
            replace: true        
        });
    };

    return (
        <div className="bg-white min-h-screen">
            <Head title="Katalog Buku - NusaBaca" />
            
            <div id="daftar-buku" className="max-w-7xl mx-auto px-6 py-12">
                {/* Header & Navigation */}
                <div className="flex justify-between items-center mb-10">
                    <Link href={route('dashboard')} className="flex items-center gap-2 text-red-500 hover:text-red-900 font-bold transition-all text-sm">
                        ← KEMBALI KE DASHBOARD UTAMA
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        {!auth.user && (
                            <Link href={route('register')} className="text-sm font-bold text-indigo-600 uppercase">
                                Login/Register
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase">Katalog Nusa Baca</h1>
                        <p className="text-slate-400 font-medium">Selamat datang di katalog NusaBaca, mau baca buku apa hari ini?</p>
                    </div>

                    {/* Search Bar SEO - Sudah difungsikan */}
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <input 
                            type="text" 
                            placeholder="Cari judul buku..."
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-indigo-500 font-medium"
                            value={data.search}
                            onChange={e => setData('search', e.target.value)}
                        />
                        <button type="submit" className="absolute right-5 top-4 text-xl hover:scale-110 transition-transform">
                            🔍
                        </button>
                    </form>
                </div>

                {/* Grid Buku - Akan terfilter otomatis dari Server */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                    {books.length > 0 ? (
                        books.map((book) => (
                            <div key={book.id} className="flex flex-col">
                                {/* PROTEKSI: Klik Cover -> Login (jika belum login) */}
                                <Link 
                                    href={auth.user ? route('books.show', book.id) : route('register')}
                                    className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl mb-4 group border border-slate-100"
                                >
                                    <img 
                                        src={book.cover_path} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        alt={book.title} 
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-[#10b981] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                                            PUBLISHED
                                        </span>
                                    </div>
                                    {/* Overlay Hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-bold text-xs border-2 border-white px-4 py-2 rounded-full uppercase tracking-widest">
                                            {auth.user ? 'Baca Sekarang' : 'Login untuk Baca'}
                                        </span>
                                    </div>
                                </Link>

                                {/* Judul & Genre */}
                                <h3 className="font-extrabold text-slate-900 text-sm mb-1 uppercase line-clamp-1">{book.title}</h3>
                                <div className="flex flex-wrap gap-1">
                                    <span className="text-indigo-600 text-[10px] font-black uppercase tracking-tight">
                                        {Array.isArray(book.genre) ? book.genre.join(' ') : book.genre.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Tidak ada buku ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}