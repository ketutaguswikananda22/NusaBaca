import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { router } from '@inertiajs/react';

export default function Moderation({ auth, books }) {
    const { delete: destroy } = useForm();
    const [searchTerm, setSearchTerm] = useState('');
    
    // State untuk Modal Preview
    const [selectedBook, setSelectedBook] = useState(null);
    const [isReadMore, setIsReadMore] = useState(false);

    const pendingBooks = books ? books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const handleApprove = (bookId, bookTitle) => {
        Swal.fire({
            title: 'Terbitkan Buku?',
            text: `Apakah Anda yakin ingin menyetujui dan menerbitkan "${bookTitle}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Terbitkan!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            customClass: { popup: 'rounded-[24px]' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.books.approve', bookId), {}, {
                    onSuccess: () => {
                        setSelectedBook(null);
                        Swal.fire({
                            title: 'Berhasil!',
                            text: 'Buku Berhasil Terpublikasi',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            customClass: { popup: 'rounded-[24px]' }
                        });
                    }
                });
            }
        });
    };

    const handleReject = (bookId, bookTitle) => {
        Swal.fire({
            title: 'Tolak Karya?',
            text: `Berikan alasan penolakan untuk "${bookTitle}"`,
            icon: 'warning',
            input: 'select',
            inputOptions: {
                'Konten Tidak Pantas (18+)': 'Konten Tidak Pantas (18+)',
                'Plagiarisme': 'Plagiarisme',
                'Kualitas Gambar/Cover Rendah': 'Kualitas Gambar/Cover Rendah',
                'Lainnya': 'Lainnya'
            },
            inputPlaceholder: '-- Pilih Alasan Penolakan --',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            customClass: { popup: 'rounded-[24px]' },
            inputValidator: (value) => {
                if (!value) {
                    return 'Anda harus memilih atau memberikan alasan!'
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.books.reject.action', bookId), {
                    reason: result.value
                }, {
                    onSuccess: () => {
                        setSelectedBook(null);
                        Swal.fire({
                            title: 'Ditolak',
                            text: 'Penulis akan menerima email alasan penolakan.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            customClass: { popup: 'rounded-[24px]' }
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin Center</h2>}
        >
            <Head title="Moderasi Karya" />

            <div className="py-12 bg-[#f8fafc] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">Manajemen Moderasi Buku</h3>
                            <p className="text-sm text-slate-500 mt-1">Setujui atau tolak karya baru yang diajukan penulis.</p>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari judul atau penulis..." 
                            className="w-full md:w-80 rounded-xl border-gray-200 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Info Karya & Penulis</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Preview Cover</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingBooks.map((book) => (
                                        <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-6">
                                                <div className="font-bold text-slate-900 text-base mb-0.5">{book.title}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold uppercase">Penulis</span>
                                                    <span className="text-sm text-slate-500 font-medium">{book.user?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <img 
                                                    src={book.cover_path} 
                                                    onClick={() => setSelectedBook(book)}
                                                    className="w-12 h-16 mx-auto object-cover rounded-lg shadow-md border border-gray-200 transition-all hover:scale-110 cursor-pointer hover:border-emerald-400" 
                                                    alt="Cover" 
                                                />
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"></span> Pending
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleApprove(book.id, book.title)} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl text-[11px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all">Approve</button>
                                                    <button onClick={() => handleReject(book.id, book.title)} className="bg-white text-rose-500 border border-rose-100 px-4 py-2 rounded-xl text-[11px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all">Reject</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Preview Buku Sesuai Desain Baru */}
            {selectedBook && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all overflow-y-auto">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-4xl w-full overflow-hidden relative animate-in fade-in zoom-in duration-300 my-auto">
                        <button 
                            onClick={() => { setSelectedBook(null); setIsReadMore(false); }}
                            className="absolute top-8 right-8 p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all z-10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="flex flex-col md:flex-row min-h-[500px]">
                            {/* Sisi Kiri: Cover Art */}
                            <div className="w-full md:w-5/12 bg-slate-50 p-12 flex items-center justify-center border-r border-slate-100">
                                <img 
                                    src={selectedBook.cover_path} 
                                    alt="Cover" 
                                    className="w-full aspect-[3/4.5] object-cover rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-500" 
                                />
                            </div>

                            {/* Sisi Kanan: Detail & Sinopsis */}
                            <div className="w-full md:w-7/12 p-12 flex flex-col justify-center">
                                <div className="mb-8">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 block">Detail Pengajuan</span>
                                    <h3 className="text-3xl font-bold text-slate-900 leading-tight mb-3">
                                        {selectedBook.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-400 italic">Oleh</span>
                                        <span className="font-bold text-slate-700 underline decoration-emerald-200 underline-offset-4 decoration-2">
                                            {selectedBook.user?.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Box Sinopsis */}
                                <div className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-100 mb-10">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Sinopsis</h4>
                                    <div className="relative">
                                        <p className={`text-slate-600 text-[14px] leading-relaxed transition-all duration-300 ${!isReadMore ? 'line-clamp-4' : ''}`}>
                                            {selectedBook.description || "Tidak ada sinopsis untuk karya ini."}
                                        </p>
                                        
                                        {selectedBook.description?.length > 180 && (
                                            <button 
                                                onClick={() => setIsReadMore(!isReadMore)}
                                                className="text-emerald-500 text-[11px] font-black mt-4 hover:text-emerald-600 uppercase tracking-wider flex items-center gap-1 transition-colors"
                                            >
                                                {isReadMore ? 'Tutup' : 'readmore...'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handleApprove(selectedBook.id, selectedBook.title)} 
                                        className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-2xl text-[13px] font-bold transition-all shadow-lg shadow-emerald-100"
                                    >
                                        APPROVE
                                    </button>
                                    <button 
                                        onClick={() => handleReject(selectedBook.id, selectedBook.title)} 
                                        className="px-10 flex-1  bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white py-4 rounded-2xl text-[13px] font-bold transition-all"
                                    >
                                        REJECT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}