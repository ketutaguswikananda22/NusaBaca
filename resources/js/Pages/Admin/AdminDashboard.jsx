import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import DarkModeToggle from '@/Components/DarkModeToggle';
import Swal from 'sweetalert2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AdminDashboard({ 
    user = {},
    reportChartData,
    statusStats,
    theme = { card: 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-white/5 text-neutral-900 dark:text-white'}, 
    stats, 
    authors, 
    activeTab, 
    setActiveTab, 
    renderActiveForm, 
    fileInputRef,
    currentTime 
}) {

    const handleUnban = (id, name) => {
        Swal.fire({
            title: 'Pulihkan Akun?',
            text: `Apakah Anda yakin ingin mengaktifkan kembali akun ${name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Ya, Pulihkan!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.users.unban', id), {}, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Berhasil!', 'Akun telah diaktifkan kembali.', 'success')
                });
            }
        });
    };

    const isLineDataEmpty = !reportChartData?.totals || reportChartData.totals.length === 0 || reportChartData.totals.every(item => item === 0);

    const isDoughnutEmpty = !statusStats || (Number(statusStats.pending) === 0 && Number(statusStats.resolved) === 0);

    const lineData = {
        labels: isLineDataEmpty ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] : reportChartData.labels,
        datasets: [
            {
                fill: true,
                label: 'Jumlah Laporan',
                data: isLineDataEmpty ? [1, 5, 8, 15, 7] : reportChartData.totals,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: '0.4',
                borderDash: isLineDataEmpty ? [5, 5] : [],
            }],
    };

    const doughnutData = {
        labels: ['Pending', 'Resolved'],
        datasets: [{
            data: isDoughnutEmpty ? [1, 1] : [Number(statusStats?.pending || 0), Number(statusStats?.resolved || 0)],
            backgroundColor: isDoughnutEmpty ? ['#facc1520', '#10b98120'] : ['#f59e0b', '#10b981'],
            borderWidth: 0,
        }],
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Profile Card */}
                <div className={`md:col-span-1 md:row-span-2 ${theme?.card} rounded-[2.5rem] p-8 border flex flex-col items-center justify-center text-center`}>
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-indigo-500/20 bg-neutral-100 dark:bg-[#1c1c1c] flex items-center justify-center shadow-xl relative group">
                        {user.avatar ? (
                            <img src={user.avatar} className="h-full w-full object-cover" alt={user?.name} />
                        ) : (
                            <div className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No Image</div>
                        )}
                        <button 
                            onClick={() => fileInputRef.current.click()} 
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase transition-all"
                        >
                            Update
                        </button>
                    </div>
                    <h2 className="mt-6 text-2xl font-black tracking-tighter uppercase leading-none">{user?.name}</h2>
                    <p className="text-[9px] bg-indigo-500 px-4 py-1.5 rounded-full border border-indigo-400 text-white font-bold uppercase tracking-[0.2em] mt-3">
                        Admin Center
                    </p>
                    <div className="w-full space-y-2 pt-4 border-t border-neutral-100 dark:border-white/5">
                        <Link 
                            href={route('admin.genres.index')}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase transition-all shadow-lg shadow-indigo-500/20"
                        >
                            Manage Genres
                        </Link>
                        <Link 
                            href={route('admin.moderation')}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 text-[10px] font-black uppercase transition-all"
                        >
                            Moderation
                        </Link>
                    </div>
                </div>
                    
                {/* 2. Header Welcome */}
                <div className={`md:col-span-3 ${theme?.card} rounded-[2.5rem] p-10 border flex flex-col md:flex-row items-center justify-between gap-6`}>
                    <h3 className="text-3xl font-medium leading-tight italic uppercase tracking-tighter text-center md:text-left">
                        nusabaca management<span className="text-indigo-500 font-black">ecosystem</span>
                    </h3>
                    <DarkModeToggle autoDarkSetting={user?.auto_dark} />
                </div>

                {/* 3. Time Card */}
                <div className={`${theme?.card} rounded-[2.5rem] p-6 border flex flex-col justify-between`}>
                    <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Local Time</span>
                    <h4 className="text-2xl font-mono font-bold text-indigo-500">{currentTime}</h4>
                </div>

                {/* 4. Pending Authors Card */}
                <div className="bg-indigo-600 rounded-[2.5rem] p-6 flex flex-col justify-between text-white shadow-xl shadow-indigo-500/20">
                    <h4 className="text-5xl font-black">{stats?.pendingAuthors || 0}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">New Authors Pending</p>
                </div>

                {/* 5. System Status */}
                <div className={`${theme?.card} rounded-[2.5rem] p-6 border flex flex-col justify-between`}>
                    <span className="text-[10px] font-black uppercase text-neutral-500 block mb-3 tracking-widest">System Status</span>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Server: Operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Database: Healthy</span>
                        </div>
                    </div>
                </div>

                {/* 6. Settings Navigation & Mini Stats */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    <div className={`flex-1 ${theme?.card} rounded-[2.5rem] p-6 border flex flex-col gap-2`}>
                        {['profile', 'security', 'analytics', 'danger'].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`text-left px-5 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${
                                    activeTab === tab 
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400'
                                }`}
                            >
                                {tab === 'analytics' ? '📊 Data Analytics' : `${tab} Settings`}
                            </button>
                        ))}
                    </div>
                    <div className={`${theme?.card} rounded-[2.5rem] p-6 border flex flex-col justify-center h-full`}>
                        <div className="flex items-stretch justify-around">
                            <div className="flex flex-col items-center flex-1">
                                <h4 className="text-4xl font-black leading-none">{stats?.totalBooks || 0}</h4>
                                <span className="text-[9px] font-bold text-neutral-500 uppercase mt-2 tracking-widest">Books</span>
                            </div>
                            <div className="w-[1px] bg-neutral-200 dark:bg-white/10 mx-2"></div>
                            <div className="flex flex-col items-center flex-1">
                                <h4 className="text-4xl font-black leading-none">{stats?.totalUsers || 0}</h4>
                                <span className="text-[9px] font-bold text-neutral-500 uppercase mt-2 tracking-widest">Members</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. Author Management List */}
               <div className={`md:col-span-2 md:row-span-2 ${theme?.card} rounded-[rem] p-8 border flex flex-col min-h-[500px]`}>
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-sm font-black uppercase tracking-tighter italic">Author<span className="text-[#ff6122] italic"> Management</span></h4>
                        <div className="bg-indigo-500/10 text-indigo-500 px-4 py-1 rounded-full border border-indigo-500/20 text-[10px] font-black">
                            {authors?.length || 0} Accounts
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {authors?.map((author) => (
                            <div key={author.id} className="flex items-center justify-between p-4 rounded-[2rem] bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-100 dark:border-white/5 transition-hover hover:border-indigo-500/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-500/20">
                                        {author.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black leading-none mb-1">{author.name}</p>
                                        <p className="text-[9px] text-neutral-500 font-medium lowercase mb-1">{author.email}</p>
                                        <div className="flex gap-2 items-center">
                                            <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase ${author.role === 'penulis' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                                {author.role}
                                            </span>
                                            <span className={`text-[7px] font-bold uppercase tracking-widest ${author.is_online ? 'text-green-500' : 'text-neutral-500'}`}>
                                                {author.is_online ? '• Online' : '• Offline'}
                                            </span>
                                            {/* Label tambahan jika kena Banned sistem */}
                                            {author.is_banned && (
                                                <span className="text-[7px] font-black bg-red-500 text-white px-2 py-0.5 rounded-md uppercase animate-pulse">
                                                    Banned
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Logika Tombol Aksi */}
                                <div className="flex items-center gap-2">
                                    {author.is_banned ? (
                                        <button 
                                            onClick={() => handleUnban(author.id, author.name)} 
                                            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20"
                                        >
                                            Unban
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => router.post(route('admin.users.toggle', author.id))} 
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                                                author.status === 'active' 
                                                ? 'text-red-500 hover:bg-red-500 hover:text-white border border-red-500/10' 
                                                : 'text-green-500 hover:bg-green-500 hover:text-white border border-green-500/10'
                                            }`}
                                        >
                                            {author.status === 'active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 8. Active Form Section */}
                <div className={`md:col-span-2 ${theme?.card} rounded-[3rem] p-10 border`}>
                    <h4 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-indigo-500 border-b pb-4 border-neutral-100 dark:border-white/5">
                        {activeTab} <span className="text-neutral-400 font-light italic">Settings</span>
                    </h4>
                    <div className="max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                        {/* Kirim lineData dan doughnutData ke fungsi render */}
                        {renderActiveForm(lineData, doughnutData)}
                    </div>
                </div>

            </div>
        </div>
    );
}