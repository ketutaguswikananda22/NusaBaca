import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function BookHistory({ auth, books = { data: [] } }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Status Buku" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Riwayat Status Buku</h2>
                            <p className="text-sm text-gray-500">Pantau detail persetujuan dan moderasi karya Anda.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-y border-gray-100">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Buku</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Tanggal Update</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.length > 0 ? (
                                        books.map((book) => (
                                            <tr key={book.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                                <td className="p-4">
                                                    <div className="font-semibold text-gray-800">{book.title}</div>
                                                    <div className="text-xs text-gray-400">ID: #{book.id}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                        book.status === 'published' ? 'bg-green-100 text-green-700' :
                                                        book.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {book.status}
                                                    </span>
                                                    {book.status === 'rejected' && (
                                                        <p className="text-[10px] text-red-500 mt-2 italic">
                                                            Ket: {book.rejection_reason || 'Melanggar pedoman komunitas.'}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right text-sm text-gray-500">
                                                    {new Date(book.updated_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="p-12 text-center text-gray-400 italic">
                                                Belum ada riwayat aktivitas buku.
                                            </td>
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