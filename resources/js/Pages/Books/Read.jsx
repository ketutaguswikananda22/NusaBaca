import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// PERBAIKAN: Menambahkan prev_part_id dan next_part_id ke dalam props
export default function Read({ auth, book, part, prev_part_id, next_part_id }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Membaca ${book.title} - ${part.title}`} />

            <div className="py-12 bg-[#fcfcfc] min-h-screen">
                <div className="max-w-2xl mx-auto px-6">
                    {/* Navigasi Atas */}
                    <div className="mb-10 flex justify-between items-center text-slate-400">
                        <Link href={route('books.show', book.id)} className="text-sm font-bold hover:text-indigo-600 transition">
                            ← KEMBALI KE DETAIL BUKU
                        </Link>
                        <span className="text-xs font-black text-[#ff6122] uppercase tracking-widest">{book.title}</span>
                    </div>

                    {/* Judul Part */}
                    <h1 className="text-3xl font-black text-slate-800 mb-10 text-center uppercase tracking-tight">
                        {part.title}
                    </h1>

                    {/* Konten Cerita */}
                    <article className="prose prose-slate lg:prose-lg mx-auto">
                        <div className="text-slate-700 leading-[2] text-lg font-serif whitespace-pre-line">
                            {part.content}
                        </div>
                    </article>

                    {/* Navigasi Part Selanjutnya/Sebelumnya */}
                    <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
                        {/* Tombol Part Sebelumnya */}
                        {prev_part_id ? (
                            <Link 
                                href={route('books.read', { id: book.id, part_id: prev_part_id })}
                                className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition"
                            >
                                ← PART SEBELUMNYA
                            </Link>
                        ) : (
                            <span className="text-sm font-bold text-slate-200 cursor-not-allowed">
                                PART SEBELUMNYA
                            </span>
                        )}

                        {/* Tombol Part Selanjutnya / Selesai */}
                        {next_part_id ? (
                            <Link 
                                href={route('books.read', { id: book.id, part_id: next_part_id })}
                                className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black tracking-widest uppercase hover:bg-indigo-600 transition shadow-lg"
                            >
                                PART SELANJUTNYA →
                            </Link>
                        ) : (
                            <Link 
                                href={route('books.show', book.id)}
                                className="bg-emerald-500 text-white px-8 py-3 rounded-full text-xs font-black tracking-widest uppercase hover:bg-emerald-600 transition shadow-lg"
                            >
                                SELESAI MEMBACA ✓
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}