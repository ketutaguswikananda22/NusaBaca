import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useRef, useMemo, useState, useEffect } from 'react';
import AdminDashboard from "@/Pages/Admin/AdminDashboard";
import UserProfile from './Partials/UserProfile'; 
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    ArcElement, 
    Title, 
    Tooltip, 
    Legend, 
    Filler 
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, 
    ArcElement, Title, Tooltip, Legend, Filler
);

export default function Edit({ auth, mustVerifyEmail, status, authors = [], stats = {}, userData, conversations = [], reportChartData, statusStats }) {
    // Gunakan userData dari controller jika ada, jika tidak gunakan auth.user
    const user = userData || auth.user;
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [currentTime, setCurrentTime] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-GB', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleProfileUpdate = (formData) => {
        router.patch(route('profile.update'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Berhasil!");
                setIsEditing(false); 
            },
            onError: (err) => {
                console.error("Gagal:", err);
            },
            onFinish: () => {
                setIsEditing(false);
            }
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            router.post(route('profile.avatar.update'), { _method: 'POST', avatar: file }, {
                forceFormData: true, 
                preserveScroll: true,
            });
        }
    };

    // render dashboard profile admin
const renderActiveForm = (lineData, doughnutData) => {

    const isLineDataEmpty = !reportChartData?.totals || reportChartData.totals.every(item => item === 0);
    const isDoughnutEmpty = !statusStats || (Number(statusStats.pending) === 0 && Number(statusStats.resolved) === 0);

    switch (activeTab) {
        case 'profile':
            return <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />;
        case 'security':
            return <UpdatePasswordForm />;
        case 'analytics':
            return (
                <div className="space-y-10 animate-in fade-in zoom-in duration-300">
                    {/* Line Chart Section */}
                    <div className="h-[250px] w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-[10px] font-black uppercase text-neutral-400 italic">
                                Report <span className="text-indigo-500">Analytics</span>
                            </h5>
                            {isLineDataEmpty && (
                                <span className="text-[8px] bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md font-bold animate-pulse">
                                    DEMO DATA
                                </span>
                            )}
                        </div>
                        <Line 
                            data={lineData} 
                            options={{ 
                                maintainAspectRatio: false, 
                                responsive: true,
                                scales: { y: { beginAtZero: true, min: 0, ticks: { stepSize: 1 } } },
                                plugins: { legend: { display: false } }
                            }} 
                        />
                    </div>

                    {/* Doughnut Chart Section */}
                    <div className="h-[250px] w-full pt-10 border-t border-neutral-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-[10px] font-black uppercase text-neutral-400 italic">
                                Status <span className="text-indigo-500">Ratio</span>
                            </h5>
                            {isDoughnutEmpty && (
                                <span className="text-[8px] bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md font-bold">
                                    NO DATA YET
                                </span>
                            )}
                        </div>
                        <div className="h-full flex justify-center pb-6">
                            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, responsive: true }} />
                        </div>
                    </div>

                    {isLineDataEmpty && (
                        <p className="text-center text-[9px] text-neutral-400 italic mt-4">
                            *Belum ada aktivitas laporan minggu ini. Menampilkan visualisasi contoh.
                        </p>
                    )}
                </div>
            );
        case 'danger':
            return <DeleteUserForm />;
        default:
            return null;
    }
};

    const theme = useMemo(() => {
        return user.role === 'admin' 
            ? { wrapper: 'bg-[#F9F7F2] dark:bg-[#050505]', card: 'bg-white dark:bg-[#121212] border-[#E8E2D6] dark:border-white/5', textMain: 'text-[#1a1a1a] dark:text-[#EFEFEF]' }
            : { wrapper: 'bg-[#0F0F0F]', card: 'bg-[#1A1A1A] border-neutral-800 shadow-sm', textMain: 'text-[#EFEFEF]' };
    }, [user.role]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Profil ${user.name}`} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />

            <div className={`min-h-screen transition-colors duration-300 ${theme.wrapper} ${theme.textMain}`}>
                {user.role === 'admin' ? (
                    <AdminDashboard 
                        user={user}
                        stats={stats}
                        reportChartData={reportChartData}
                        statusStats={statusStats}
                        authors={authors} 
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        renderActiveForm={renderActiveForm}
                        fileInputRef={fileInputRef} 
                        theme={theme}
                        currentTime={currentTime}
                    />
                ) : (
                    <div className="flex flex-col">
                        <UserProfile 
                            user={user} 
                            theme={theme} 
                            stats={stats}
                            conversations={conversations} // <--- INI KUNCINYA: DATA DIOPER KE USERPROFILE
                            auth={auth}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            onUpdateProfile={handleProfileUpdate}
                            renderActiveForm={renderActiveForm} 
                            fileInputRef={fileInputRef} 
                        />
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 10px; }
            `}</style>
        </AuthenticatedLayout>
    );
}