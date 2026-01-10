import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2'; // Pastikan sudah di-install via npm

export default function ControlCenter({ auth, pendingBooks, stats }) {
    const { post, delete: destroy } = useForm();
    const [selectedBook, setSelectedBook] = useState(null);

    // --- FUNGSI POP-UP BARU ---

    const handleApprove = (bookId) => {
        post(route('books.approve', bookId), {
            onSuccess: () => {
                setSelectedBook(null);
                Swal.fire({
                    icon: 'success',
                    title: 'Buku Diterbitkan!',
                    text: 'Karya berhasil dipublikasikan ke katalog.',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-3xl' }
                });
            }
        });
    };

    const handleReject = (bookId) => {
        Swal.fire({
            title: 'Tolak Karya?',
            text: "Karya ini akan dihapus permanen dari sistem.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48', // rose-600
            cancelButtonColor: '#64748b', // slate-500
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            customClass: { popup: 'rounded-3xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('books.destroy', bookId), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Dihapus!',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            customClass: { popup: 'rounded-3xl' }
                        });
                    }
                });
            }
        });
    };

    // --------------------------

    const handleImageError = (e) => {
        e.target.src = 'https://ui-avatars.com/api/?name=No+Cover&background=f1f5f9&color=94a3b8';
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-bold text-2xl text-slate-800">Admin Control Center</h2>}
        >
            <Head title="Moderasi Buku" />
            <div className="py-12 bg-slate-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
                            <p className="text-slate-500 text-xs font-bold uppercase">Perlu Moderasi</p>
                            <h4 className="text-3xl font-black">{stats.pending_books}</h4>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                        <div className="p-6 bg-slate-800 text-white font-bold">Daftar Antrian Moderasi</div>
                        <table className="w-full text-left">
                            <tbody className="divide-y">
                                {pendingBooks.map((book) => (
                                    <tr key={book.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <img 
                                                src={`/storage/${book.cover_path}`} 
                                                className="w-10 h-14 object-cover rounded shadow-sm"
                                                onError={handleImageError}
                                            />
                                            <div>
                                                <span className="font-bold block text-slate-900">{book.title}</span>
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">
                                                    {Array.isArray(book.genre) ? book.genre.join(', ') : book.genre}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedBook(book)}
                                                className="text-indigo-600 font-bold text-xs mr-4 hover:underline"
                                            >
                                                PREVIEW
                                            </button>

                                            {/* Ganti post(...) ke handleApprove */}
                                            <button onClick={() => handleApprove(book.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold mr-2 hover:bg-emerald-700">APPROVE</button>
                                            
                                            {/* Ganti destroy(...) ke handleReject */}
                                            <button 
                                                onClick={() => handleReject(book.id)} 
                                                className="text-rose-600 font-bold text-xs hover:text-rose-800"
                                            >
                                                REJECT
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={selectedBook !== null} onClose={() => setSelectedBook(null)} maxWidth="2xl">
                {selectedBook && (
                    <div className="p-8">
                        {/* ... (Konten Modal Sama Seperti Sebelumnya) ... */}
                        <div className="flex gap-6 mb-6">
                            <img src={`/storage/${selectedBook.cover_path}`} className="w-32 h-44 object-cover rounded-xl shadow-md" onError={handleImageError} />
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">{selectedBook.title}</h3>
                                <p className="text-indigo-600 font-bold text-sm uppercase mb-3">
                                    {Array.isArray(selectedBook.genre) ? selectedBook.genre.join(', ') : selectedBook.genre}
                                </p>
                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">{selectedBook.description}</p>
                            </div>
                        </div>
                        
                        <div className="mb-8">
                            <h4 className="font-bold text-slate-800 mb-2 text-sm">Preview Naskah</h4>
                            {selectedBook.file_path ? (
                                <iframe src={`/storage/${selectedBook.file_path}`} className="w-full h-96 rounded-xl border border-slate-200"></iframe>
                            ) : (
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-xl text-center">
                                    <p className="text-slate-400 text-sm">File naskah PDF belum diunggah.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-6">
                            <button onClick={() => setSelectedBook(null)} className="px-4 py-2 text-slate-500 font-bold text-sm">TUTUP</button>
                            {/* Tambahkan handleApprove di tombol Modal juga */}
                            <button 
                                onClick={() => handleApprove(selectedBook.id)}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100"
                            >
                                APPROVE SEKARANG
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}