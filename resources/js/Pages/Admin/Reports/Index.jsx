import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ auth, reports }) {
    
    // Fungsi Hapus Laporan
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Laporan?',
            text: "Laporan ini akan dihapus permanen dari sistem.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.reports.destroy', id));
            }
        });
    };

    // Fungsi Update Status (Triggers Email & Auto-Banned di Backend)
    const handleStatusChange = (id, newStatus) => {
        const statusText = newStatus === 'resolved' ? 'Selesaikan & Kirim Email?' : 'Ubah Status?';
        
        Swal.fire({
            title: statusText,
            text: "Tindakan ini akan mengirim notifikasi email ke pihak terkait.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            confirmButtonText: 'Ya, Proses!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // --- 1. Tampilkan Loading Pop-up ---
                Swal.fire({
                    title: 'Memproses...',
                    text: 'Sedang memperbarui status dan mengirim email notifikasi.',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading(); // Animasi spinner bawaan SweetAlert2
                    }
                });

                // --- 2. Jalankan Request ---
                router.patch(route('admin.reports.update', id), { 
                    status: newStatus 
                }, {
                    preserveScroll: true,
                    // Memaksa Inertia mengambil ulang props 'reports' dari server
                    only: ['reports', 'flash'], 
                    onSuccess: (page) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Berhasil!',
                            text: page.props.flash.success || 'Status diperbarui!',
                            confirmButtonColor: '#f97316',
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops!',
                            text: 'Gagal memperbarui status.',
                            confirmButtonColor: '#ef4444',
                        });
                    }
                });
            }
      });
  };

    return (
      
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Laporan" />
            
            <div className="py-12 bg-[#F8F9FA] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-[35px] p-8 border border-neutral-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-neutral-800 uppercase italic">
                                Daftar <span className="text-orange-500">Laporan Masuk</span>
                            </h2>
                            <div className="px-4 py-2 bg-neutral-900 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest">
                                Admin Control Center
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100">
                                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Pelapor</th>
                                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Dilaporkan</th>
                                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Alasan</th>
                                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">Status Moderasi</th>
                                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="group hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-4">
                                                <div className="text-sm font-bold text-neutral-800">{report.user?.name}</div>
                                                <div className="text-[10px] text-neutral-400 uppercase font-bold">ID: {report.user_id}</div>
                                            </td>
                                            <td className="py-4">
                                                <div className="text-sm font-bold text-red-500">{report.reported_user?.name || 'User'}</div>
                                                <div className="text-[10px] text-neutral-400 uppercase font-bold">ID: {report.reported_user_id}</div>
                                            </td>
                                            <td className="py-4">
                                                <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    {report.reason}
                                                </span>
                                                <p className="text-xs text-neutral-500 mt-1 italic leading-relaxed">
                                                    {report.description ? `"${report.description}"` : "Tidak ada detail tambahan"}
                                                </p>
                                            </td>
                                            <td className="py-4 text-center">
                                                <select 
                                                    key={`${report.id}-${report.status}`}
                                                    value={report.status} 
                                                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                                    className={`text-[10px] font-black uppercase rounded-xl border-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all ${
                                                        report.status === 'resolved' ? 'bg-green-100 text-green-600' : 
                                                        report.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                                                        'bg-yellow-100 text-yellow-600'
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="resolved">Resolved (Clear)</option>
                                                    <option value="rejected">Rejected (Ignore)</option>
                                                </select>
                                            </td>
                                            <td className="py-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(report.id)}
                                                    className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center ml-auto shadow-sm"
                                                    title="Hapus Laporan"
                                                >
                                                    <i className="fas fa-trash-alt text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}