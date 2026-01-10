import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2'; // Pastikan sudah install: npm install sweetalert2
import { router } from '@inertiajs/react';

export default function WriterApplication({ auth, applications }) {
    const { processing } = useForm();
    const [selectedPdf, setSelectedPdf] = useState(null);

    const updateStatus = (id, newStatus) => {
        // 1. Tampilkan Pop-up Konfirmasi SweetAlert2
        Swal.fire({
            title: 'Konfirmasi',
            text: `Apakah Anda yakin ingin ${newStatus === 'approved' ? 'menyetujui' : 'menolak'} pengajuan ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'approved' ? '#10b981' : '#ef4444', // Hijau untuk approve, merah untuk reject
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Ya, ${newStatus === 'approved' ? 'Approve' : 'Reject'}!`,
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // 2. Tampilkan Loading (Sangat penting karena kirim email butuh waktu beberapa detik)
                Swal.fire({
                    title: 'Memproses...',
                    text: 'Sedang memperbarui status dan mengirim email notifikasi.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // 3. Eksekusi request ke server
                router.post(route('admin.writer.updateStatus', { id: id }), {
                    status: newStatus 
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        // 4. Notifikasi Berhasil
                        Swal.fire({
                            title: 'Berhasil!',
                            text: `Pengajuan telah berhasil di-${newStatus}.`,
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    onError: (errors) => {
                        console.error('Gagal:', errors);
                        // 5. Notifikasi Error
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Terjadi kesalahan server saat memperbarui status.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Manajemen Penulis</h2>}>
            <Head title="Persetujuan Penulis" />
            <div className="py-12 px-6 max-w-7xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User & Bio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karya (PDF)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.length > 0 ? (
                                applications.map((app) => (
                                    <tr key={app.id}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{app.pen_name}</div>
                                            <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap max-w-md">{app.bio}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.message ? (
                                                <button 
                                                    onClick={() => setSelectedPdf(`${window.location.origin}/storage/${app.message}`)}
                                                    className="text-blue-600 hover:underline font-bold flex items-center"
                                                >
                                                    📄 Preview Karya
                                                </button>
                                            ) : (
                                                <span className="text-red-500 italic text-sm">File tidak ada</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                app.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                                app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            {app.status === 'pending' && (
                                                <>
                                                    <button 
                                                        disabled={processing}
                                                        onClick={() => updateStatus(app.id, 'approved')} 
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        disabled={processing}
                                                        onClick={() => updateStatus(app.id, 'rejected')} 
                                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">
                                        Tidak ada pengajuan penulis yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal PDF Preview */}
            {selectedPdf && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-6 backdrop-blur-sm">
                    <div className="bg-[#111] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-gray-800">
                        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-800 bg-[#181818]">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Preview Dokumen</h3>
                            <button onClick={() => setSelectedPdf(null)} className="text-gray-500 hover:text-red-500 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="bg-[#0c0c0c] p-3">
                            <iframe src={selectedPdf} className="w-full h-[500px] rounded-lg border border-gray-700" frameBorder="0"></iframe>
                        </div>
                        <div className="p-4 border-t border-gray-800 bg-[#181818] flex justify-end">
                            <button onClick={() => setSelectedPdf(null)} className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-full uppercase hover:bg-red-700 transition-colors">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}