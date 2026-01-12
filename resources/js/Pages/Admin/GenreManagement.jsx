import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import DarkModeToggle from '@/Components/DarkModeToggle';

export default function GenreManagement({ auth, genres }) {
    const { data, setData, post, patch, delete: destroy, processing, reset, errors } = useForm({
        name: '',
    });

    const [editId, setEditId] = useState(null);

    // Tema yang disamakan dengan AdminDashboard kamu
    const theme = {
        card: 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-white/5 text-neutral-900 dark:text-white',
        input: 'w-full rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border-neutral-200 dark:border-white/5 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white'
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            patch(route('genres.update', editId), {
                onSuccess: () => {
                    setEditId(null);
                    reset();
                    Swal.fire({ 
                        icon: 'success', 
                        title: 'BERHASIL!', 
                        text: 'Genre telah diperbarui.',
                        background: '#111111',
                        color: '#fff',
                        confirmButtonColor: '#6366f1',
                        customClass: { popup: 'rounded-[2rem]' }
                    });
                }
            });
        } else {
            post(route('genres.store'), {
                onSuccess: () => {
                    reset();
                    Swal.fire({ 
                        icon: 'success', 
                        title: 'DITAMBAHKAN!', 
                        text: 'Genre baru siap digunakan.',
                        background: '#111111',
                        color: '#fff',
                        confirmButtonColor: '#6366f1',
                        customClass: { popup: 'rounded-[2rem]' }
                    });
                }
            });
        }
    };

    const handleEdit = (genre) => {
        setEditId(genre.id);
        setData('name', genre.name);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'HAPUS GENRE?',
            text: "Pastikan tidak ada buku yang menggunakan genre ini.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#333',
            confirmButtonText: 'YA, HAPUS',
            background: '#111111',
            color: '#fff',
            customClass: { popup: 'rounded-[2rem]' }
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('genres.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-black text-2xl uppercase tracking-tighter dark:text-white">Genre <span className="text-indigo-500">Ecosystem</span></h2>}
        >
            <Head title="Manage Genres" />

            <div className="py-12 bg-neutral-50 dark:bg-[#0a0a0a] min-h-screen relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -z-0"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-10 relative z-10">
                    
                    {/* Header Row */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <Link href={route('dashboard')} className="text-[10px] font-black uppercase text-indigo-500 hover:underline tracking-widest">
                                ← Back to Dashboard
                            </Link>
                            <h3 className="text-4xl font-black dark:text-white tracking-tighter uppercase italic">
                                Genre <span className="text-indigo-500">Management</span>
                            </h3>
                        </div>
                        <DarkModeToggle autoDarkSetting={auth.user?.auto_dark} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* FORM CARD */}
                        <div className={`${theme.card} rounded-[2.5rem] p-8 border h-fit shadow-xl`}>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mb-6 italic">
                                {editId ? 'Modify' : 'Create New'} Genre
                            </h4>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-400 ml-2 mb-2 block">Genre Name</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="e.g. Science Fiction"
                                        className={theme.input}
                                    />
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase tracking-wide">{errors.name}</p>}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        type="submit" 
                                        disabled={processing} 
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        {editId ? 'Update Genre' : 'Save Genre'}
                                    </button>
                                    {editId && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setEditId(null); reset(); }} 
                                            className="w-full bg-neutral-100 dark:bg-white/5 text-neutral-500 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* LIST CARD (BENTO BOX STYLE) */}
                        <div className={`md:col-span-2 ${theme.card} rounded-[3rem] border shadow-xl flex flex-col`}>
                            <div className="p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center">
                                <h4 className="text-sm font-black uppercase tracking-tighter">Active <span className="text-indigo-500 italic">Categories</span></h4>
                                <span className="bg-indigo-500/10 text-indigo-500 px-4 py-1 rounded-full border border-indigo-500/20 text-[10px] font-black">
                                    {genres.length} Genres
                                </span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-white/5">
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Name</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Slug</th>
                                            <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-neutral-400 tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                                        {genres.map((genre) => (
                                            <tr key={genre.id} className="group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-all">
                                                <td className="px-8 py-5">
                                                    <span className="text-sm font-black tracking-tight">{genre.name}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-[11px] font-mono text-neutral-500">/{genre.slug}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right space-x-4">
                                                    <button 
                                                        onClick={() => handleEdit(genre)} 
                                                        className="text-indigo-500 font-black text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-100 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(genre.id)} 
                                                        className="text-rose-500 font-black text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-100 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {genres.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-20 text-center text-neutral-500 text-xs font-bold uppercase tracking-widest">
                                                    No genres found in system.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}