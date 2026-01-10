import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function MyWorks({ auth, books }) {
    
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Buku?',
            text: "Aksi ini tidak dapat dibatalkan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('books.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Karya Saya" />

            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Karya Saya</h2>
                        
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <div key={book.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group">
                                <div className="relative">
                                    <img src={book.cover_path} alt={book.title} className="w-full h-64 object-cover" />
                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                                        {book.status}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 truncate">{book.title}</h3>
                                    <div className="flex gap-2 mt-4">
                                        <Link 
                                            href={route('books.edit', book.id)}
                                            className="flex-1 text-center py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100"
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(book.id)}
                                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}