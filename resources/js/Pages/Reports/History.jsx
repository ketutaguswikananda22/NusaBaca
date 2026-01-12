import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function History({ auth, reports }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Laporan" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Riwayat Laporan Anda</h2>
                            <p className="text-sm text-gray-500">Pantau status laporan yang telah Anda kirimkan.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                    <tr>
                                        {/* Nama kolom diubah menjadi lebih umum */}
                                        <th className="px-6 py-4">Objek yang Dilaporkan</th>
                                        <th className="px-6 py-4">Alasan</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reports.data.length > 0 ? (
                                        reports.data.map((report) => (
                                            <tr key={report.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        {report.book ? (
                                                            <>
                                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Buku</span>
                                                                <span className="text-sm font-medium text-gray-900">{report.book.title}</span>
                                                            </>
                                                        ) : report.reported_user ? (
                                                            <>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Author / User</span>
                                                                    {/* Badge Role Penulis/User */}
                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                                                        report.reported_user.role === 'penulis' 
                                                                        ? 'bg-orange-50 text-orange-600 border-orange-200' 
                                                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                                                    }`}>
                                                                        {report.reported_user.role}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-900">{report.reported_user.name}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm italic text-gray-400">Data telah dihapus</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                        {report.reason}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                        report.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                                                        report.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-400">
                                                    {new Date(report.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-400">Belum ada riwayat laporan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}