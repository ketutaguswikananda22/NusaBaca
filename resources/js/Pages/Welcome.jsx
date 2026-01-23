import { Link, Head } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth, recentBooks }) {
    return (
        <div className="bg-slate-900 min-h-screen text-white selection:bg-indigo-500">
            <Head title="Selamat Datang di E-Katalog" />
            
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <ApplicationLogo className="h-10 w-auto group-hover:scale-105 transition-all" />
                    <h2 className="text-white text-3xl font-black tracking-tighter italic">Nusa<span className="text-[#ff6122]">Baca</span></h2>
                </div>
               <div className="space-x-4">
                    {auth?.user ? ( // Tambahkan tanda tanya di sini
                        <Link href={route('dashboard')} className="font-bold hover:text-indigo-400 transition">Dashboard</Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="font-bold hover:text-indigo-400 transition">Log in</Link>
                            <Link href={route('register')} className="bg-indigo-600 px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">Register</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                    Jelajahi Dunia Lewat <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Koleksi Digital Kami</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    Akses ribuan buku berkualitas, baca kapan saja, dan unduh dalam format PDF secara gratis. Bergabunglah dengan komunitas penulis dan pembaca kami.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <Link href={route('register')} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition shadow-xl">
                        Mulai Membaca Sekarang
                    </Link>
                    <Link href={route('katalog.index') + '#daftar-buku'} className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-700 transition border border-slate-700">
                        Lihat Katalog
                    </Link>
                </div>
            </header>

            {/* Preview Section */}
            <section id="preview" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-black mb-2">Buku Terbaru</h2>
                        <p className="text-slate-500">Koleksi yang baru saja diterbitkan minggu ini</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Mapping buku dari database*/}
                    {recentBooks && recentBooks.length > 0 ? (
                        recentBooks.map((book) => (
                            <div key={book.id} className="group cursor-pointer">
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 ring-1 ring-slate-800 group-hover:ring-indigo-500 transition duration-500 shadow-2xl">
                                    <img src={book.cover_path} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={book.title} />
                                </div>
                                <h3 className="font-bold text-lg truncate group-hover:text-indigo-400 transition">{book.title}</h3>
                                <p className="text-slate-500 text-sm">Oleh: {book.user?.name}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-600 italic">Belum ada buku untuk ditampilkan.</p>
                    )}
                </div>
            </section>

            <footer className="selection:bg-indigo-500 text-gray-400 py-12 border-t border-white/5 font-sans">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                            
                        {/* Bagian 1: Brand & Visi */}
                        <div className="col-span-1 md:col-span-2">
                            <h2 className="text-white text-4xl font-black tracking-tighter mb-4 italic">
                                Nusa<span className="text-[#ff6122]">Baca</span>.
                            </h2>
                            <p className="text-sm-2xl leading-relaxed max-w-sm">
                                Platform literasi digital terdepan di Indonesia. Kami menghubungkan penulis dan pembaca 
                                dalam satu ekosistem kreatif untuk memajukan budaya membaca nusantara.
                            </p>
                        </div>
                            
                        {/* Bagian 2: Navigasi Cepat */}
                        <div>
                            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Navigasi</h3>
                            <ul className="space-y-4 text-sm">
                                <li>
                                    <Link href={route('katalog.index')} className="hover:text-[#ff6122] transition-colors">Jelajahi Karya</Link>
                                </li>
                                <li><a href="#" className="hover:text-[#ff6122] transition-colors">Komunitas</a></li>
                                <li><a href="#" className="hover:text-[#ff6122] transition-colors">Menjadi Penulis</a></li>
                            </ul>
                        </div>
                            
                        {/* Bagian 3: Dukungan & Hukum */}
                        <div>
                            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Informasi</h3>
                            <ul className="space-y-4 text-sm">
                                <li><a href="#" className="hover:text-[#ff6122] transition-colors">Ketentuan Layanan</a></li>
                                <li><a href="#" className="hover:text-[#ff6122] transition-colors">Kebijakan Privasi</a></li>
                                <li><a href="#" className="hover:text-[#ff6122] transition-colors">Bantuan</a></li>
                                <li>
                                    <Link href="#" className="hover:text-[#ff6122] transition-colors flex items-center gap-2">
                                        <span>Syarat & Ketentuan</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                            
                    </div>
                            
                    {/* Bagian Bawah: Copyright & Stack */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-[11px] font-medium tracking-wide">
                            &copy; 2026 <span className="text-white font-bold italic">NusaBaca</span>. Hak Cipta Dilindungi.
                        </div>
                            
                        {/* Tech Stack Badge (Opsional, tapi keren untuk portfolio) */}
                        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest opacity-50">
                            <span>STACK</span>
                            <div className="flex gap-3 text-white font-bold">
                                <span>Laravel</span>
                                <span className="text-gray-600">/</span>
                                <span>React</span>
                                <span className="text-gray-600">/</span>
                                <span>Inertia</span>
                                <span className="text-gray-600">/</span>
                                <span>MySQL</span>
                                <span className="text-gray-600">/</span>
                                <span>Python</span>
                            </div>
                        </div>
                            
                        {/* Sosmed */}
                        <div className="flex gap-5 text-lg">
                            <a href="https://www.instagram.com/nusabacaa?igsh=MWoyb3l4bzU4MmFtdw==" className="hover:text-[#ff6122] transition-all"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="hover:text-[#006BFF] transition-all"><i className="fab fa-facebook"></i></a>
                            <a href="#" className="hover:text-[#008DDA] transition-all"><i className="fab fa-linkedin"></i></a>
                            <a href="#" className="hover:text-black transition-all"><i className="fab fa-x-twitter"></i></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}