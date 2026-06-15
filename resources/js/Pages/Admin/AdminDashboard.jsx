import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import DarkModeToggle from '@/Components/DarkModeToggle';
import Swal from 'sweetalert2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import ProfileCard from './Partials/ProfileCard';
import HeaderWelcome from './Partials/HeaderWelcome';
import StatCards from './Partials/StatCards';
import NavAndMiniStats from './Partials/NavAndMiniStats';
import AuthorManagement from './Partials/AuthorManagement';
import ActiveFormSection from './Partials/ActiveFormSection';
import SystemIntegrityLayout from './Partials/SystemIntegrityLayout'

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

const [systemStats, setSystemStats] = useState({
    api: 'OPTIMAL', 
    operational: 'HEALTHY',
    db: 'HEALTHY', 
    storage: 'AVAILABLE', 
    storage_p: 10
});

// Listener System Integrity & Recent Audit
useEffect(() => {
    if (window.Echo) {
        const channel = window.Echo.channel('admin-logs');            
        channel.listen('.AuditUpdated', (e) => {
            setLogs((prevLogs) => {
                const isExist = prevLogs.some(log => log.id === e.log.id);
                if (isExist) return prevLogs;
                const newLogs = [e.log, ...prevLogs];
                return newLogs.slice(0, 6);
            });
        });

        const statusChannel = window.Echo.channel('system-status');
        statusChannel.listen('SystemStatusUpdated', (e) => {
            setSystemStats({
                api: e.api_gateway,
                operational: e.operational || 'HEALTHY',
                db: e.database,
                storage: e.s3_storage,
                storage_p: e.storage_percentage
            });
        });

        return () => {
            window.Echo.leave('admin-logs');
            window.Echo.leave('system-status');
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ProfileCard user={user} theme={theme} fileInputRef={fileInputRef} />
                <HeaderWelcome user={user} theme={theme} currentTime={currentTime} />
                <StatCards stats={stats} theme={theme} />
                <NavAndMiniStats activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} theme={theme} />
                <AuthorManagement authors={authors} theme={theme} />
                <ActiveFormSection activeTab={activeTab} renderActiveForm={renderActiveForm} lineData={lineData} doughnutData={doughnutData} theme={theme} />
                <SystemIntegrityLayout systemStats={systemStats} logs={logs} theme={theme} />
            </div>
        </div>
    );
}