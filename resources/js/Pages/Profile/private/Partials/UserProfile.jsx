import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

// Import Sections
import BioSection from './Sections/BioSection';
import ConversationSection from './Sections/ConversationSection';
import FollowSection from './Sections/FollowSection';

export default function UserProfile({ user, conversations, stats, isEditing, setIsEditing, onUpdateProfile }) {
    const DEFAULT_AVATAR_ICON = "/image/default-avatar-icon.png";
    const getRandomAvatar = (id) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${id || 'guest'}`;
    const [activeTab, setActiveTab] = useState('Perihal');
    const [formData, setFormData] = useState({
        name: '', bio: '', instagram: '', tiktok: '', linkedin: '', twitter: '', website: '',
        location: '', gender: '', email: '', profile_bg_color: '#4A7c59',
        profile_bg_image: null, profile_bg_image_preview: null, profile_bg_image_file: null,
        avatar_preview: null, avatar_file: null, remove_avatar: false, remove_profile_bg: false          
    });
    
    const getAvatarDisplay = () => {
        if (formData.avatar_preview) return formData.avatar_preview;
        if (formData.remove_avatar) return DEFAULT_AVATAR_ICON;
        const hasAvatar = user.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== "";
        if (hasAvatar) {
            return user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`;
        }
        if (user.avatar === null) return DEFAULT_AVATAR_ICON;
        return getRandomAvatar(user.id);
    };

    const [conversationText, setConversationText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedSinopsis, setExpandedSinopsis] = useState({});

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                ...user,
                profile_bg_color: user.profile_bg_color || '#4A7c59',
                avatar_preview: null,
                profile_bg_image_preview: null,
                remove_avatar: false,
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (name === 'avatar') {
                    setFormData(prev => ({ ...prev, avatar_file: file, avatar_preview: reader.result, remove_avatar: false }));
                } else if (name === 'profile_bg_image') {
                    setFormData(prev => ({ ...prev, profile_bg_image_file: file, profile_bg_image_preview: reader.result, remove_profile_bg: false }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = (type) => {
        if (type === 'avatar') {
            setFormData(prev => ({ ...prev, avatar_file: null, avatar_preview: null, remove_avatar: true }));
        } else if (type === 'bg') {
            setFormData(prev => ({ ...prev, profile_bg_image_file: null, profile_bg_image_preview: 'none', remove_profile_bg: true }));
        }
    };

    const handleSendMessage = () => {
        if (!conversationText.trim()) return;
        setIsSubmittingMessage(true);
        router.post(`/user/${user.id}/conversation`, {
            message: conversationText,
            parent_id: replyTo ? replyTo.id : null 
        }, {
            preserveScroll: true,
            onSuccess: () => { setConversationText(''); setReplyTo(null); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Pesan terkirim', showConfirmButton: false, timer: 2000 }); },
            onFinish: () => setIsSubmittingMessage(false)
        });
    };

    const handleDeleteAccount = () => {
        Swal.fire({
            title: 'Hapus Akun Permanen?',
            text: "Tindakan ini tidak bisa dibatalkan. Semua karya dan poinmu akan hilang!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus Sekarang',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('profile.destroy'), {
                    onBefore: () => setLoading(true),
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Sampai jumpa lagi.', 'success');
                    },
                    onError: () => {
                        setLoading(false);
                        Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus akun.', 'error');
                    }
                });
            }
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (onUpdateProfile) await onUpdateProfile(formData);
            setIsEditing(false);
            Swal.fire('Berhasil!', 'Profil diperbarui.', 'success');
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderMessageWithLinks = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, i) => part.match(urlRegex) ? (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#ff6122] hover:underline font-bold break-all">{part}</a>
        ) : part);
    };

    const UserCard = ({ userData, isActuallyFollowed }) => (
        <div className="bg-white rounded-[32px] border border-neutral-100 overflow-hidden shadow-sm flex flex-col h-full">
            <div className="w-full h-20 shrink-0" style={{ backgroundColor: userData.profile_bg_color || '#450a0a', backgroundImage: userData.profile_bg_image ? `url(/storage/${userData.profile_bg_image})` : 'none', backgroundSize: 'cover' }}></div>
            <div className="flex justify-center -mt-10 relative z-10">
                <Link href={`/author/${userData.id}`}>
                    <img src={userData.avatar || DEFAULT_AVATAR_ICON} className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md bg-white" alt="" />
                </Link>
            </div>
            <div className="p-6 pt-3 text-center flex-grow">
                <h4 className="font-black text-sm uppercase truncate">{userData.name}</h4>
                <p className="text-neutral-400 text-[10px] mb-4">@{userData.username || 'user'}</p>
                <button className="w-full py-2 rounded-xl text-[10px] font-black uppercase border bg-neutral-900 text-white">
                    {isActuallyFollowed ? 'Diikuti' : 'Ikuti'}
                </button>
            </div>
        </div>
    );

    const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' }) : '-';

    return (
        <div className="flex flex-col text-[#222] bg-[#F3F3F3] min-h-screen relative font-sans">
            <div className="min-h-[450px] relative flex flex-col items-center justify-center pt-24 pb-16 bg-cover bg-center"
                style={{ 
                    backgroundColor: formData.profile_bg_color,
                    backgroundImage: formData.profile_bg_image_preview && formData.profile_bg_image_preview !== 'none' 
                        ? `url(${formData.profile_bg_image_preview})` 
                        : (formData.profile_bg_image && !formData.remove_profile_bg ? `url(${formData.profile_bg_image})` : 'none')
                }}>
                <div className="absolute inset-0 bg-black/20 z-0"></div>
                
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="absolute top-8 right-8 text-[11px] px-6 py-2.5 rounded-full font-black uppercase tracking-widest bg-black/20 text-white border border-white/20 backdrop-blur-md z-20 hover:bg-black/40 transition-all"
                    >
                        <i className="fas fa-cog mr-2"></i> Pengaturan Profil
                    </button>
                )}

                {isEditing && (
                    <div className="absolute top-0 left-0 w-full bg-black/60 p-4 flex justify-between items-center z-50 text-white">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold ml-4">Mode Edit Profil</span>
                            <button 
                                onClick={handleDeleteAccount}
                                className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-600/50 transition-all"
                            >
                                <i className="fas fa-trash-alt mr-2"></i> Hapus Akun
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <label className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold border border-white/20 cursor-pointer hover:bg-white/20 transition-all">
                                Ganti BG <input type="file" name="profile_bg_image" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                
                            {(formData.profile_bg_image_preview || (formData.profile_bg_image && !formData.remove_profile_bg)) && (
                                <button onClick={() => handleRemovePhoto('bg')} className="bg-red-500/20 hover:bg-red-500 px-4 py-2 rounded-full text-xs font-bold border border-red-500/50 transition-all">
                                    Hapus BG
                                </button>
                            )}

                            <button onClick={handleSubmit} disabled={loading} className="bg-[#ff6122] px-6 py-2 rounded-full text-sm font-bold">
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button onClick={() => setIsEditing(false)} className="bg-white/10 px-6 py-2 rounded-full text-sm font-bold">Batal</button>
                        </div>
                    </div>
                )}

                <div className="z-10 flex flex-col items-center w-full max-w-4xl px-6">
                    {/* Avatar Container */}
                    <div className="w-40 h-40 rounded-full border-[6px] border-white/20 overflow-hidden shadow-2xl relative mb-6 group/avatar bg-white shrink-0">
                        <img 
                            src={getAvatarDisplay()} 
                            className="w-full h-full object-cover" 
                            alt="Profile" 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_AVATAR_ICON;
                            }}
                        />

                        {isEditing && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                <label className="cursor-pointer text-white text-[10px] font-bold bg-[#ff6122] px-3 py-1.5 rounded-full">
                                    Upload <input type="file" name="avatar" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                                {(user.avatar || formData.avatar_preview) && !formData.remove_avatar && (
                                    <button onClick={() => handleRemovePhoto('avatar')} className="text-white text-[10px] font-bold bg-red-600 px-3 py-1.5 rounded-full">
                                        Hapus
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] text-center text-white shadow-2xl w-full max-w-2xl relative">
                        {isEditing ? (
                            <input name="name" value={formData.name} onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-3xl font-black text-center w-full focus:outline-none focus:border-[#ff6122]" />
                        ) : (
                            <h1 className="text-5xl font-black mb-1">{user.name}</h1>
                        )}
                        <p className="text-white/70 text-sm mb-6 mt-1">{user.email}</p>

                        {!isEditing && (
                            <div className="flex flex-col items-center w-full">
                                {/* Statistik Row */}
                                <div className="flex gap-4 sm:gap-12 justify-center items-center mb-6">
                                    <div className="text-center">
                                        <p className="text-3xl font-black leading-none">{user.books_count || 0}</p>
                                        <p className="text-[10px] uppercase font-bold opacity-60 mt-1">Karya</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-black leading-none">{user.followers_count || 0}</p>
                                        <p className="text-[10px] uppercase font-bold opacity-60 mt-1">Pengikut</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-black leading-none">{user.following_count || 0}</p>
                                        <p className="text-[10px] uppercase font-bold opacity-60 mt-1">Mengikuti</p>
                                    </div>
                                </div>

                                <div className="bg-[#ff6122] text-white px-6 py-2.5 rounded-full shadow-lg flex items-center gap-3 transform hover:scale-105 transition-all cursor-default">
                                    <span className="text-lg">⭐</span>
                                    <span className="text-2xl font-black leading-none">{Number(user?.points || 0)}</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] mt-0.5">Poin Nusa</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 flex gap-12 text-[11px] font-black uppercase tracking-[0.2em]">
                    {['Perihal', 'Percakapan', 'Pengikut', 'Mengikuti'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`py-6 border-b-2 transition-all ${activeTab === tab ? 'border-[#ff6122] text-[#ff6122]' : 'text-neutral-400 hover:text-neutral-600'}`}>{tab}</button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-6xl mx-auto w-full py-12 px-6">
                {activeTab === 'Perihal' && (
                    <BioSection user={user} isEditing={isEditing} formData={formData} handleChange={handleChange} joinDate={joinDate} expandedSinopsis={expandedSinopsis} toggleSinopsis={(e, id) => setExpandedSinopsis(prev => ({ ...prev, [id]: !prev[id] }))} />
                )}
                {activeTab === 'Percakapan' && (
                    <ConversationSection user={user} conversations={conversations} conversationText={conversationText} setConversationText={setConversationText} replyTo={replyTo} setReplyTo={setReplyTo} handleSendMessage={handleSendMessage} isSubmittingMessage={isSubmittingMessage} renderMessageWithLinks={renderMessageWithLinks} />
                )}
                {activeTab === 'Pengikut' && <FollowSection list={user.followers} UserCard={UserCard} />}
                {activeTab === 'Mengikuti' && <FollowSection list={user.following} UserCard={UserCard} />}
            </div>
        </div>
    );
}