import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useRef, useMemo, useState, useEffect } from 'react';
import AdminDashboard from "@/Pages/Admin/AdminDashboard";
import UserProfile from './Partials/UserProfile'; 
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ auth, mustVerifyEmail, status, authors = [], stats = {}, userData, conversations = [] }) {
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

    const renderActiveForm = () => {
        switch (activeTab) {
            case 'profile':
                return <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />;
            case 'security':
                return <UpdatePasswordForm />;
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