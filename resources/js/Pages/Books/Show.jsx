import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Show({ auth, book, initialIsInLibrary, recommendations }) {
    const { props } = usePage();
    const { flash } = props;
    
    const [isInLibrary, setIsInLibrary] = useState(initialIsInLibrary);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isExpanded, setIsExpanded] = useState(false);

    const isOwner = auth.user.id === book.user_id;
    const canManage = isOwner || auth.user.role === 'admin';
    
    // 2. useEffect diperbaiki untuk memantau props.flash secara mendalam
    useEffect(() => {
        if (flash?.message) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#fff',
                color: '#1e293b',
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });

            Toast.fire({
                icon: flash.type === 'error' ? 'error' : 'success',
                title: flash.message,
            });
        }
    }, [flash, props.flash]); // Memantau perubahan flash message

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const toggleLibrary = () => {
        router.post(route('library.toggle', book.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsInLibrary(!isInLibrary);
            },
        });
    };

    // FUNGSI HAPUS BUKU
    const handleDelete = () => {
        Swal.fire({
            title: 'Hapus Buku?',
            text: "Seluruh isi buku dan chapter akan dihapus secara permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus Permanen',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('books.destroy', { id: book.id }), {
                    onBefore: () => Swal.close(),
                    onError: () => {
                        Swal.fire('Gagal!', 'Tidak dapat menghapus buku.', 'error');
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={book.title} />

            <div className="bg-white min-h-screen">
                {/* --- HEADER BANNER --- */}
                <div className="relative w-full min-h-[500px] md:h-[450px] flex items-center bg-slate-900 overflow-hidden">
                    <img src={book.cover_path} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:via-slate-900/40" />
                    
                    <div className="relative max-w-6xl mx-auto px-6 py-12 w-full flex flex-col md:flex-row items-center md:items-end gap-8 text-slate-800 md:text-white">
                        <div className="w-48 h-72 md:w-56 md:h-80 shadow-2xl rounded-lg overflow-hidden flex-shrink-0 border-4 border-white bg-white">
                            <img src={book.cover_path} className="w-full h-full object-cover" alt={book.title} />
                        </div>

                        <div className="flex-1 text-center md:text-left z-10">
                            <h1 className="text-3xl md:text-5xl font-black mb-6 uppercase leading-tight tracking-tighter italic">
                                {book.title}
                            </h1>
                            
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-8 mb-8">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">👁️</span>
                                    <div className="flex flex-col text-left leading-none">
                                        <span className="text-[10px] uppercase font-bold opacity-60">Reads</span>
                                        <span className="font-bold">{book.views_count || 0}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">⭐</span>
                                    <div className="flex flex-col text-left leading-none">
                                        <span className="text-[10px] uppercase font-bold opacity-60">Votes</span>
                                        <span className="font-bold">
                                            {book.ratings_avg_rating ? parseFloat(book.ratings_avg_rating).toFixed(1) : '0.0'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">📚</span>
                                    <div className="flex flex-col text-left leading-none">
                                        <span className="text-[10px] uppercase font-bold opacity-60">Part</span>
                                        <span className="font-bold">
                                            {book.parts?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-white">
                                <Link 
                                    href={book.parts?.length > 0 ? route('books.read', { id: book.id, part_id: book.parts[0].id }) : '#'}
                                    className="w-full sm:w-auto bg-slate-900 md:bg-white md:text-slate-900 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                    📖 Start Reading
                                </Link>
                                <button 
                                    onClick={toggleLibrary}
                                    className={`w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all shadow-lg ${
                                        isInLibrary 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : 'bg-white/10 border-white text-white hover:bg-white hover:text-slate-900'
                                    }`}
                                >
                                    {isInLibrary ? '✓' : '+'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTENT SECTION --- */}
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* LEFT COLUMN: Main Info */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
    {/* Box Foto Profil Author */}
    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 overflow-hidden shadow-sm">
        {book.user?.profile_photo_url ? (
            <img 
                src={book.user.profile_photo_url} 
                alt={book.user.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://ui-avatars.com/api/?name=${book.user.name}&color=7F9CF5&background=EBF4FF`;
                }}
            />
        ) : (
            <span className="text-lg uppercase">
                {book.user?.name?.charAt(0)}
            </span>
        )}
    </div>

    <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Author</p>
        <Link 
            href={route('author.profile', book.user_id)} 
            className="text-indigo-600 font-bold hover:text-[#ff6122] transition-colors cursor-pointer"
        >
            {book.user.name}
        </Link>
    </div>
</div>
                                <div className="flex gap-2">
                                    {book.genre?.map((g, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-bold rounded-md uppercase border border-slate-100">#{g}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border-b border-slate-100 pb-10">
                                <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-4">Sinopsis</h3>
                                <div className="text-slate-600 leading-relaxed text-sm">
                                    <p className="whitespace-pre-line inline">
                                        {isExpanded || (book.description && book.description.length <= 250)
                                            ? book.description
                                            : `${book.description?.slice(0, 250)}...`}
                                    </p>
                                    {book.description && book.description.length > 250 && (
                                        <button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 text-indigo-600 font-bold hover:underline italic">
                                            {isExpanded ? '[ Sembunyikan ]' : '[ Baca Selengkapnya ]'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Table of contents</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">
                                        {book.parts?.length} Chapters
                                    </span>
                                </div>
                                <div className="grid gap-3">
                                    {book.parts?.map((part, index) => (
                                        <Link 
                                            key={part.id} 
                                            href={route('books.read', { id: book.id, part_id: part.id })}
                                            className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{part.title}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{part.created_at_human || 'Published recently'}</p>
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 group-hover:text-emerald-500">
                                                {part.is_read ? '✓ Read' : 'Unread'}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {canManage && (
                                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-50">
                                    <Link 
                                        href={route('parts.create', book.id)} 
                                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
                                    >
                                        Add New Chapter
                                    </Link>
                                    <Link 
                                        href={route('books.edit', book.id)} 
                                        className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                                    >
                                        Settings
                                    </Link>
                                    <button 
                                        onClick={handleDelete}
                                        className="bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Delete Book
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="sticky top-8">
                                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">You May Also Like</h3>
                                <div className="space-y-6">
                                    {recommendations?.map((rec) => (
                                        <Link key={rec.id} href={route('books.show', rec.id)} className="flex gap-4 group">
                                            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow bg-slate-100">
                                                <img src={rec.cover_path} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={rec.title} />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-600 leading-tight mb-1 uppercase tracking-tighter italic">
                                                    {rec.title}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase">By {rec.user?.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-amber-500 font-black">★ {rec.ratings_avg_rating || '5.0'}</span>
                                                    <span className="text-[10px] text-slate-300 font-bold">|</span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Read</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    
                                    {(!recommendations || recommendations.length === 0) && (
                                        <div className="p-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-100 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No similar books yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}