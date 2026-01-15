// Filename: AuthorManagement.jsx
import React from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

const AuthorManagement = ({ authors, theme }) => {
    const handleToggle = (author) => {
        const isSuspended = author.status === 'suspended' || author.is_banned;
        Swal.fire({
            title: isSuspended ? 'Aktifkan Akun?' : 'Tangguhkan Akun?',
            text: `Apakah Anda yakin ingin ${isSuspended ? 'mengaktifkan' : 'menangguhkan'} akun ${author.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isSuspended ? '#22c55e' : '#ef4444',
            confirmButtonText: 'Ya!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.users.toggle', author.id), {}, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Berhasil!', '', 'success')
                });
            }
        });
    };

    return (
        <div className={`md:col-span-2 md:row-span-1 ${theme?.card} rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-[420px] shadow-2xl relative overflow-hidden`}>
            <div className="flex justify-between items-center mb-8 shrink-0">
                <h4 className="text-sm font-black uppercase tracking-tighter italic text-neutral-800 dark:text-neutral-100">
                    Author<span className="text-[#ff6122] italic"> Management</span>
                </h4>
                <div className="bg-indigo-500/10 text-indigo-500 px-4 py-1 rounded-full border border-indigo-500/20 text-[10px] font-black">
                    {authors?.length || 0} Accounts
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {authors?.map((author) => (
                    <div key={author.id} className="flex items-center justify-between p-4 rounded-[2rem] bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 transition-all duration-300">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-sm font-black shrink-0">
                                {author.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-black truncate">{author.name}</p>
                                <p className="text-[9px] text-neutral-500 lowercase truncate">{author.email}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleToggle(author)} 
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                                (author.status === 'suspended' || author.is_banned)
                                    ? 'bg-green-500 text-white border-green-500' 
                                    : 'text-red-500 border-red-500/10 hover:bg-red-500 hover:text-white'
                            }`}
                        >
                            {(author.status === 'suspended' || author.is_banned) ? 'Active' : 'Suspend'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuthorManagement;