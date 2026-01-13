import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function ManageGenreForm({ genres = [] }) {
    const { data, setData, post, patch, delete: destroy, processing, reset, errors } = useForm({
        name: '',
    });

    const [editId, setEditId] = useState(null);

    // Style yang disesuaikan dengan Admin Dashboard kamu
    const theme = {
        card: 'bg-[#F9F7F2] dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white',
        input: 'w-full rounded-xl bg-white dark:bg-[#1a1a1a] border-neutral-200 dark:border-white/10 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white'
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            patch(route('genres.update', editId), {
                onSuccess: () => { setEditId(null); reset(); }
            });
        } else {
            post(route('genres.store'), {
                onSuccess: () => { reset(); }
            });
        }
    };

    const handleEdit = (genre) => {
        setEditId(genre.id);
        setData('name', genre.name);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Section */}
            <div className={`${theme.card} p-6 rounded-[2rem] border shadow-sm`}>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4 italic">
                    {editId ? 'Modify Existing' : 'Create New'} Genre
                </h4>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Type genre name..."
                            className={theme.input}
                        />
                        {errors.name && <p className="text-red-500 text-[9px] font-bold mt-2 uppercase px-2">{errors.name}</p>}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            {editId ? 'Update' : 'Save Genre'}
                        </button>
                        {editId && (
                            <button 
                                onClick={() => {setEditId(null); reset();}}
                                className="bg-neutral-200 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 px-4 rounded-xl font-black text-[10px] uppercase"
                            >
                                X
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-black/20 rounded-[2rem] border border-neutral-200 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100 dark:border-white/5">
                                <th className="px-8 py-4 text-[9px] font-black uppercase text-neutral-400 tracking-widest">Genre Name</th>
                                <th className="px-8 py-4 text-right text-[9px] font-black uppercase text-neutral-400 tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                            {genres.map((genre) => (
                                <tr key={genre.id} className="group hover:bg-indigo-500/[0.02] transition-all">
                                    <td className="px-8 py-4">
                                        <span className="text-xs font-bold tracking-tight dark:text-neutral-200">{genre.name}</span>
                                    </td>
                                    <td className="px-8 py-4 text-right space-x-4">
                                        <button 
                                            onClick={() => handleEdit(genre)}
                                            className="text-indigo-500 font-black text-[9px] uppercase tracking-widest hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => destroy(route('genres.destroy', genre.id))}
                                            className="text-rose-500 font-black text-[9px] uppercase tracking-widest hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {genres.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="px-8 py-10 text-center text-neutral-400 text-[10px] font-bold uppercase">No Genres Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}