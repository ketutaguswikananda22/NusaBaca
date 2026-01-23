import React from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function ReportModal({ isOpen, onClose, author }) {
    // AUDIT: Key harus 'reported_author_id' agar lolos validasi di ReportController
    const { data, setData, post, processing, reset, errors } = useForm({
        reason: '',
        description: '',
        reported_author_id: author.id, // SESUAI DENGAN VALIDASI CONTROLLER
        book_id: null,                // Tambahkan null agar sesuai skema DB
    });

    const handleReportSubmit = (e) => {
        e.preventDefault();
        
        // Menggunakan route('reports.user') sesuai web.php
        post(route('reports.user'), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'LAPORAN TERKIRIM',
                    text: `Berhasil melaporkan profil ${author.name}.`,
                    confirmButtonColor: '#ef4444',
                    customClass: {
                        popup: 'rounded-[30px]',
                        confirmButton: 'rounded-full uppercase text-[10px] font-black px-8 py-4'
                    }
                });
            },
            onError: (err) => {
                console.error("Validasi Gagal:", err);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[35px] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
                <h3 className="text-xl font-black text-neutral-800 uppercase mb-2">
                    Laporkan <span className="text-red-500">Profil</span>
                </h3>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-8">
                    Beritahu kami apa yang terjadi pada profil {author.name}
                </p>

                <form onSubmit={handleReportSubmit} className="space-y-4">
                    <select
                        className="w-full bg-neutral-50 border-none rounded-2xl p-4 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-red-500/20"
                        value={data.reason}
                        onChange={e => setData('reason', e.target.value)}
                        required
                    >
                        <option value="">Pilih Alasan</option>
                        <option value="INAPPROIRATE CONTENT">Konten Tidak Pantas</option>
                        <option value="HARASSMENT">Pelecehan/Bullying</option>
                        <option value="PLAGIARISM">Plagiarism</option>
                        <option value="SPAM">Spam</option>
                        <option value="IMPERSONATION">Penyamaran Identitas</option>
                    </select>

                    <textarea
                        className="w-full bg-neutral-50 border-none rounded-3xl p-5 text-sm font-medium focus:ring-2 focus:ring-red-500/20 min-h-[120px]"
                        placeholder="Detail tambahan (opsional)..."
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                    />

                    {/* Menampilkan pesan error validasi jika ada */}
                    {errors.reported_author_id && (
                        <p className="text-red-500 text-[10px] font-bold uppercase italic">{errors.reported_author_id}</p>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-[10px] bg-neutral-100 rounded-full font-black uppercase tracking-widest text-neutral-400 hover:bg-neutral-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-4 text-[10px] bg-red-500 rounded-full font-black uppercase tracking-widest text-white hover:bg-red-600 transition-colors disabled:opacity-50 shadow-lg shadow-red-100"
                        >
                            {processing ? 'MENGIRIM...' : 'KIRIM LAPORAN'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}