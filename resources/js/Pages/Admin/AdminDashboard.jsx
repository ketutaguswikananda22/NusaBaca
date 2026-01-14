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
    currentTime,
    auditLogs: initialLogs
}) {
    const [logs, setLogs] = useState(initialLogs || []);
    console.log("Data awal logs dari controller:", initialLogs);

    useEffect(() => {
        if (window.Echo) {
            console.log('Mulai mendengarkan channel: admin-logs');
            
            const channel = window.Echo.channel('admin-logs');
            
            // Gunakan .AuditUpdated (dengan titik) karena kamu pakai broadcastAs()
            channel.listen('.AuditUpdated', (e) => {
                console.log('ADA EVENT MASUK:', e);
                
                setLogs((prevLogs) => {
                    // Cek agar tidak ada data ganda berdasarkan ID
                    const isExist = prevLogs.some(log => log.id === e.log.id);
                    if (isExist) return prevLogs;

                    // Tambah ke paling atas dan ambil 6 terbaru
                    const newLogs = [e.log, ...prevLogs];
                    return newLogs.slice(0, 6);
                });
            });

            // CLEANUP: Sangat penting agar tidak dizzy/double listener
            return () => {
                window.Echo.leave('admin-logs');
                console.log('Meninggalkan channel: admin-logs');
            };
        }
    }, []);


    const handleUnban = (id, name) => {
        Swal.fire({
            title: 'Pulihkan Akun?',
            text: `Apakah Anda yakin ingin mengaktifkan kembali akun ${name}?`,
            icon: 'warning',
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
            {/* Grid Utama Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Profile Card (Kiri Atas) */}
                <div className={`md:col-span-1 md:row-span-2 ${theme?.card} rounded-[2.5rem] p-8 border flex flex-col items-center justify-center text-center shadow-xl`}>
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-indigo-500/20 bg-neutral-100 dark:bg-[#1c1c1c] flex items-center justify-center relative group">
                        {user.avatar ? (
                            <img src={user.avatar} className="h-full w-full object-cover" alt={user?.name} />
                        ) : (
                            <div className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No Image</div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" />
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
                    <div className="w-full space-y-2 pt-4 border-t border-neutral-100 dark:border-white/5 mt-4">
                        <Link 
                            href={route('admin.moderation')}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 text-[10px] font-black uppercase transition-all"
                        >
                            Moderation
                        </Link>
                    </div>
                </div>
                    
                {/* 2. Header Welcome */}
                <div className={`md:col-span-3 ${theme?.card} rounded-[2.5rem] p-10 border flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg`}>
                    <h3 className="text-3xl font-medium leading-tight italic uppercase tracking-tighter text-center md:text-left">
                        nusabaca management<span className="text-indigo-500 font-black"> ecosystem</span>
                    </h3>
                    <DarkModeToggle autoDarkSetting={user?.auto_dark} />
                </div>

                {/* 3. Time Card */}
                <div className={`${theme?.card} rounded-[2.5rem] p-6 border flex flex-col justify-center overflow-hidden shadow-md`}>
                    <span className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.3em] mb-3">Local Time</span>
                    <h4 className="text-3xl font-black text-indigo-500 uppercase tracking-tighter">
                        {currentTime.split('|')[0]}
                    </h4>
                    <div className="w-12 h-[2px] bg-indigo-500/30 my-2 rounded-full"></div>
                    <h4 className="text-xl font-mono font-bold text-indigo-400/80">
                        {currentTime.split('|')[1]}
                    </h4>
                </div>

                {/* 4. Pending Authors Card */}
                <div className="bg-indigo-600 rounded-[2.5rem] p-6 flex flex-col justify-between text-white shadow-xl">
                    <h4 className="text-5xl font-black">{stats?.pendingAuthors || 0}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">New Authors Pending</p>
                </div>

                {/* 5. System Status Mini */}
                <div className={`${theme?.card} rounded-[2.5rem] p-6 border flex flex-col justify-between shadow-md`}>
                    <span className="text-[10px] font-black uppercase text-neutral-500 block mb-3 tracking-widest">System Status</span>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase">Server: Operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="text-[10px] font-bold uppercase">Database: Healthy</span>
                        </div>
                    </div>
                </div>
                
                {/* 6. Settings Navigation & Mini Stats */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    <div className={`flex-1 ${theme?.card} rounded-[2.5rem] p-6 border flex flex-col gap-2 shadow-md`}>
                        {['profile', 'security', 'analytics', 'genres', 'danger'].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`text-left px-5 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${
                                    activeTab === tab 
                                    ? 'bg-indigo-500 text-white shadow-lg' 
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400'
                                }`}
                            >
                                {tab === 'analytics' ? '📊 Data Analytics' : `${tab} Settings`}
                            </button>
                        ))}
                    </div>
                    {/* Books & Members Stats */}
                    <div className={`${theme?.card} rounded-[2.5rem] p-6 border flex items-stretch justify-around h-32 shadow-md`}>
                        <div className="flex flex-col items-center flex-1 justify-center">
                            <h4 className="text-4xl font-black leading-none">{stats?.totalBooks || 0}</h4>
                            <span className="text-[9px] font-bold text-neutral-500 uppercase mt-2 tracking-widest">Books</span>
                        </div>
                        <div className="w-[1px] bg-neutral-200 dark:bg-white/10 mx-2"></div>
                        <div className="flex flex-col items-center flex-1 justify-center">
                            <h4 className="text-4xl font-black leading-none">{stats?.totalUsers || 0}</h4>
                            <span className="text-[9px] font-bold text-neutral-500 uppercase mt-2 tracking-widest">Members</span>
                        </div>
                    </div>
                </div>
                        
                {/* 7. Author Management (Kanan Atas) */}
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
                                    onClick={() => author.is_banned ? handleUnban(author.id, author.name) : router.post(route('admin.users.toggle', author.id))} 
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${author.is_banned ? 'bg-green-500 text-white' : 'text-red-500 border-red-500/10 hover:bg-red-500 hover:text-white'}`}
                                >
                                    {author.is_banned ? 'Unban' : 'Suspend'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- BARIS BAWAH --- */}

                {/* 8. Active Form Section (KIRI BAWAH - Tetap di bawah Book & Member) */}
                <div className={`md:col-span-2 ${theme?.card} rounded-[3rem] p-10 border shadow-2xl overflow-hidden`}>
                    <h4 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-indigo-500 border-b pb-4 border-neutral-100 dark:border-white/5">
                        {activeTab} <span className="text-neutral-400 font-light italic">Settings</span>
                    </h4>
                    <div className="max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                        {renderActiveForm(lineData, doughnutData)}
                    </div>
                </div>

                {/* 9. System Integrity & Audit */}
                <div className={`md:col-span-2 ${theme?.card} h-[500px] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[550px]`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        {/* LEFT COLUMN: SYSTEM INTEGRITY */}
                        <div className="space-y-8 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col mb-6">
                                    <h4 className="text-[12px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-1">System Integrity</h4>
                                    <p className="text-[10px] text-neutral-500 font-medium tracking-tight">Dynamic real-time status use Laravel Reverb</p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { label: 'API Gateway', status: 'OPTIMAL', color: 'bg-green-500', progress: 'w-[75%]', icon: '⚡' },
                                        { label: 'Operational', status: 'HEALTHY', color: 'bg-green-400', progress: 'w-[90%]', icon: '📡' },
                                        { label: 'Database', status: 'HEALTHY', color: 'bg-indigo-500', progress: 'w-[45%]', icon: '🗄️' },
                                        { label: 'S3 Storage', status: 'AVAILABLE', color: 'bg-blue-500', progress: 'w-[30%]', icon: '☁️' }
                                    ].map((item, i) => (
                                        <div key={i} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px]">{item.icon}</span>
                                                    <span className="text-[11px] font-bold text-neutral-300 group-hover:text-white transition-colors">{item.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase text-neutral-500 tracking-tighter">{item.status}</span>
                                                    <span className={`h-2 w-2 rounded-full ${item.color} shadow-[0_0_8px_${item.color.replace('bg-', '')}]`}></span>
                                                </div>
                                            </div>
                                            <div className="h-[4px] w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full ${item.color} ${item.progress} rounded-full`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                                
                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase text-neutral-300 mb-4 tracking-widest">Uptime (24h)</p>
                                <div className="relative h-16 w-full flex items-center">
                                    <svg className="w-full h-full" viewBox="0 0 200 60">
                                        <path 
                                            d="M0,50 Q20,20 40,45 T80,30 T120,50 T160,20 T200,40" 
                                            fill="none" 
                                            stroke="#6366f1" 
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        {[0, 40, 80, 120, 160, 200].map((x, i) => (
                                            <circle key={i} cx={x} cy={i % 2 === 0 ? 50 : 25} r="3" fill="#10b981" />
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {/*Recent Audit - Dinamis dengan Laravel Reverb */}
<div className="relative">
    <div className="mb-8 pl-4">
        <h4 className="text-[12px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-1">Recent Audit</h4>
        <p className="text-[10px] text-neutral-500 font-medium tracking-tight">Latest administrative actions</p>
    </div>
            
    <div className="absolute left-[20px] top-[80px] bottom-10 w-[1px] border-l border-dashed border-indigo-500/40 z-0">
        <div className="absolute -top-1 -left-[4px] text-[8px] text-indigo-500/50">▲</div>
        <div className="absolute -bottom-1 -left-[4px] text-[8px] text-indigo-500/50">▼</div>
    </div>
            
    <div className="space-y-10 relative z-10 pl-4">
        {logs.length > 0 ? logs.map((log, i) => (
            <div key={log.id || i} className="flex gap-6 items-start group animate-in fade-in slide-in-from-left duration-500">
                {/* Dot Indikator Dinamis - DITAMBAHKAN KONDISI SUCCESS */}
               <div className={`mt-1.5 w-3 h-3 rounded-full bg-[#111] border-2 shrink-0 z-20 ${
                    log.type === 'danger' ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                    log.type === 'success' ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : // <--- TAMBAHKAN INI
                    log.type === 'warning' ? 'border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 
                    'border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                }`}></div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            {/* Icon Dinamis berdasarkan type - DITAMBAHKAN ICON SUCCESS */}
                            <span className="text-[10px] opacity-70">
                                {log.type === 'danger' ? '🚫' : 
                                 log.type === 'warning' ? '⚠️' : 
                                 log.type === 'success' ? '✅' : '🏷️'} 
                            </span>
                            <p className="text-[11px] text-white font-black uppercase tracking-tight">{log.action_name}</p>
                        </div>
                        <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">
                            {log.time_ago || 'Just Now'}
                        </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-medium ml-6 group-hover:text-neutral-300 transition-colors">
                        {log.details}
                    </p>
                </div>
            </div>
        )) : (
            <div className="pl-6 text-[10px] text-neutral-700 italic tracking-widest">
                Waiting for system activity...
            </div>
        )}
    </div>
</div>
                            
                    </div>
                </div>
            </div>
        </div>
    );
}