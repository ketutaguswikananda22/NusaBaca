import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Library({ auth, books }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Perpustakaan Saya" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Library</h1>
                            <p className="text-slate-500">Koleksi buku yang sedang kamu baca</p>
                        </div>
                        <Link href={route('katalog.index')} className="text-indigo-600 font-bold hover:underline">
                            + Cari Buku Lain
                        </Link>
                    </div>

                    {books.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {books.map((book) => (
                                <Link key={book.id} href={route('books.show', book.id)} className="group">
                                    <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                                        <img 
                                            src={book.cover_path} 
                                            alt={book.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=f1f5f9&color=94a3b8&size=512&bold=true`;
                                            }}
                                        />
                                    </div>
                                    <h3 className="mt-3 font-bold text-slate-800 text-sm truncate uppercase">{book.title}</h3>
                                    <p className="text-xs text-slate-500">{book.user?.name}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-20 text-center shadow-sm border border-dashed border-slate-200">
                            <div className="text-5xl mb-4">📚</div>
                            <h2 className="text-xl font-bold text-slate-400">Belum ada buku di perpustakaanmu</h2>
                            <Link href={route('katalog.index')} className="mt-4 inline-block bg-indigo-600 text-white px-8 py-3 rounded-full font-bold">
                                Jelajahi Katalog
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}