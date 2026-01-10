import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function UserProfile({ user, conversations, stats, isEditing, setIsEditing, onUpdateProfile, auth }) {
    // Tambahkan di dalam function UserProfile
useEffect(() => {
    console.log("Data user berubah:", user);
    console.log("Data buku:", user.books);
}, [user]);
    const [activeTab, setActiveTab] = useState('Perihal');
    const DEFAULT_AVATAR = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dbdbdb&color=5e5e5e`;
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        instagram: '',
        tiktok: '',
        linkedin: '',
        twitter: '',
        website: '',
        location: '',
        gender: '',
        email: '',
        profile_bg_color: '#4A7c59', 
        profile_bg_image: null,        
        profile_bg_image_preview: null,
        profile_bg_image_file: null,
        avatar_preview: null,
        avatar_file: null,
        remove_avatar: false,
        remove_profile_bg: false          
    });
    
    const [conversationText, setConversationText] = useState('');
    const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedSinopsis, setExpandedSinopsis] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                instagram: user.instagram || '',
                tiktok: user.tiktok || '',
                linkedin: user.linkedin || '',
                twitter: user.twitter || '',
                website: user.website || '',
                location: user.location || '',
                gender: user.gender || '',
                email: user.email || '',
                profile_bg_color: user.profile_bg_color || '#4A7c59',
                profile_bg_image: user.profile_bg_image || null,
                profile_bg_image_preview: null,
                profile_bg_image_file: null,
                avatar_preview: null,
                avatar_file: null,
                remove_avatar: false,
                remove_profile_bg: false
            });
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
                    setFormData(prev => ({
                        ...prev,
                        avatar_file: file,
                        avatar_preview: reader.result,
                        remove_avatar: false
                    }));
                } else if (name === 'profile_bg_image') {
                    setFormData(prev => ({
                        ...prev,
                        profile_bg_image_file: file,
                        profile_bg_image_preview: reader.result,
                        remove_profile_bg: false
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = (type) => {
        if (type === 'avatar') {
            setFormData(prev => ({
                ...prev,
                avatar_file: null,
                avatar_preview: '/images/default-avatar.png',
                remove_avatar: true
            }));
        } else if (type === 'bg') {
            setFormData(prev => ({
                ...prev,
                profile_bg_image_file: null,
                profile_bg_image_preview: 'none',
                profile_bg_image: null,
                remove_profile_bg: true
            }));
        }
    };

    const handleSendMessage = () => {
        if (!conversationText.trim()) return;
        setIsSubmittingMessage(true);
        router.post(`/user/${user.id}/conversation`, {
            message: conversationText
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setConversationText('');
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Pesan terkirim',
                    showConfirmButton: false,
                    timer: 2000
                });
            },
            onFinish: () => setIsSubmittingMessage(false)
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

    const handleFollowAction = (targetUserId, actionType) => {
        const url = actionType === 'follow' ? `/follow/${targetUserId}` : `/unfollow/${targetUserId}`;
        router.post(url, {}, {
            preserveScroll: true,
            onError: () => Swal.fire('Error', 'Gagal melakukan aksi.', 'error')
        });
    };

    const toggleSinopsis = (e, bookId) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedSinopsis(prev => ({ ...prev, [bookId]: !prev[bookId] }));
    };

    const UserCard = ({ userData, isActuallyFollowed }) => (
        <div className="bg-white rounded-[32px] border border-neutral-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
            <div 
                className="w-full h-20 bg-cover bg-center relative shrink-0"
                style={{ 
                    backgroundColor: userData.profile_bg_color || '#450a0a',
                    backgroundImage: userData.profile_bg_image ? `url(/storage/${userData.profile_bg_image})` : 'none' 
                }}
            >
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="flex justify-center -mt-10 relative z-10">
                <Link href={`/author/${userData.id}`}>
                    <img
                        src={userData.avatar || '/images/default-avatar.png'}
                        className="w-20 h-20 rounded-full border-4 border-white object-cover bg-neutral-100 shadow-md"
                        alt={userData.name}
                    />
                </Link>
            </div>

            <div className="p-6 pt-3 text-center flex-grow">
                <Link href={`/author/${userData.id}`}>
                    <h4 className="font-black text-sm uppercase tracking-tight truncate hover:text-[#ff6122] transition-colors">{userData.name}</h4>
                </Link>
                <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                    @{userData.username || 'user'}
                </p>

                <button 
                    onClick={() => handleFollowAction(userData.id, isActuallyFollowed ? 'unfollow' : 'follow')}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                        isActuallyFollowed 
                        ? 'bg-neutral-50 text-neutral-400 border-neutral-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100' 
                        : 'bg-neutral-900 text-white border-transparent hover:bg-[#ff6122] shadow-lg'
                    }`}
                >
                    <i className={`fas ${isActuallyFollowed ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                    {isActuallyFollowed ? 'Diikuti' : 'Ikuti'}
                </button>
            </div>

            <div className="grid grid-cols-3 border-t border-neutral-50 py-3 bg-neutral-50/50">
                <div className="text-center border-r border-neutral-100">
                    <p className="text-[10px] font-black">{userData.books_count || 0}</p>
                    <p className="text-[8px] text-neutral-400 uppercase font-bold">Karya</p>
                </div>
                <div className="text-center border-r border-neutral-100">
                    <p className="text-[10px] font-black">{userData.following_count || 0}</p>
                    <p className="text-[8px] text-neutral-400 uppercase font-bold">Daftar</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black">{userData.followers_count || 0}</p>
                    <p className="text-[8px] text-neutral-400 uppercase font-bold">Fans</p>
                </div>
            </div>
        </div>
    );

    const joinDate = user?.created_at 
        ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })
        : '-';

    const StatItem = ({ label, value, onClick }) => (
        <div className="text-center cursor-pointer hover:scale-110 transition-transform group" onClick={onClick}>
            <p className="text-3xl font-black leading-none mb-1 group-hover:text-[#ff6122] transition-colors">{value || 0}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">{label}</p>
        </div>
    );

    return (
        <div className="flex flex-col text-[#222] bg-[#F3F3F3] min-h-screen relative font-sans">
            {/* Header Profil */}
            <div 
                className="min-h-[450px] relative flex flex-col items-center justify-center pt-20 pb-12 overflow-hidden bg-cover bg-center transition-all duration-500"
                style={{ 
                    backgroundColor: formData.profile_bg_color,
                    backgroundImage: formData.profile_bg_image_preview && formData.profile_bg_image_preview !== 'none' 
                        ? `url(${formData.profile_bg_image_preview})` 
                        : (formData.profile_bg_image && !formData.remove_profile_bg ? `url(${formData.profile_bg_image})` : 'none')
                }}
            >
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-0"></div>
                
                {isEditing ? (
                    <div className="absolute top-0 left-0 w-full bg-black/60 backdrop-blur-md p-4 flex justify-between items-center z-50 text-white">
                        <span className="text-sm font-bold ml-4">Mode Edit Profil</span>
                        <div className="flex gap-2">
                            <label className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold border border-white/20 cursor-pointer transition-all">
                                <i className="fas fa-image mr-2"></i> Ganti Background
                                <input type="file" name="profile_bg_image" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                            {(formData.profile_bg_image || formData.profile_bg_image_preview) && (
                                <button onClick={() => handleRemovePhoto('bg')} className="bg-red-500/20 hover:bg-red-500 px-4 py-2 rounded-full text-xs font-bold border border-red-500/50 transition-all">
                                    Hapus BG
                                </button>
                            )}
                            <button onClick={handleSubmit} disabled={loading} className="bg-[#ff6122] px-6 py-2 rounded-full text-sm font-bold disabled:opacity-50">
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button onClick={() => setIsEditing(false)} className="bg-white/10 px-6 py-2 rounded-full text-sm font-bold border border-white/20">Batal</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="absolute top-8 right-8 text-[11px] px-6 py-2.5 rounded-full font-black uppercase tracking-widest bg-black/20 text-white border border-white/20 backdrop-blur-md z-20 hover:bg-black/40 transition-all">
                        <i className="fas fa-cog mr-2"></i> Pengaturan Profil
                    </button>
                )}
                
                <div className="z-10 flex flex-col items-center w-full max-w-4xl px-6">
                    <div className="w-40 h-40 rounded-full border-[6px] border-white/20 overflow-hidden shadow-2xl relative mb-8 group/avatar">
                        <img 
                            src={formData.avatar_preview || user.avatar || '/images/default-avatar.png'} 
                            className="w-full h-full object-cover" 
                            alt="" 
                        />
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                <label className="cursor-pointer text-white text-[10px] font-bold uppercase tracking-tighter bg-[#ff6122] px-3 py-1.5 rounded-full">
                                    Upload
                                    <input type="file" name="avatar" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                                <button onClick={() => handleRemovePhoto('avatar')} className="text-white text-[10px] font-bold uppercase tracking-tighter bg-red-600 px-3 py-1.5 rounded-full">
                                    Hapus
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] text-center text-white shadow-2xl w-full max-w-2xl">
                        {isEditing ? (
                            <div className="space-y-4">
                                <input 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-3xl font-black text-center w-full focus:outline-none focus:ring-2 focus:ring-[#ff6122]"
                                    placeholder="Nama Anda"
                                />
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-xs font-bold">Warna Tema:</span>
                                    <input 
                                        type="color" 
                                        name="profile_bg_color" 
                                        value={formData.profile_bg_color} 
                                        onChange={handleChange}
                                        className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        ) : (
                            <h1 className="text-5xl font-black mb-2">{user.name}</h1>
                        )}
                        <p className="text-white/70 text-sm mb-8 mt-2">{user.email}</p>
                        
                        {!isEditing && (
                            <div className="flex gap-4 sm:gap-12 justify-center items-center">
                                <StatItem label="Karya" value={user.books_count} />
                                <div className="h-10 w-[1px] bg-white/20"></div>
                                <StatItem label="Bacaan" value={stats.readingLists} />
                                <div className="h-10 w-[1px] bg-white/20"></div>
                                <StatItem label="Pengikut" value={user.followers_count} onClick={() => setActiveTab('Pengikut')} />
                                <div className="h-10 w-[1px] bg-white/20"></div>
                                <StatItem label="Mengikuti" value={user.following_count} onClick={() => setActiveTab('Mengikuti')} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav Tabs */}
            <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 flex gap-12 text-[11px] font-black uppercase tracking-[0.2em]">
                    {['Perihal', 'Percakapan', 'Pengikut', 'Mengikuti'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`py-6 border-b-2 transition-all ${activeTab === tab ? 'border-[#ff6122] text-[#ff6122]' : 'text-neutral-400 hover:text-neutral-600'}`}>{tab}</button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto w-full py-12 px-6">
                {activeTab === 'Perihal' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                         {/* BOX BIO KIRI */}
                         <div className="lg:col-span-4">
                            <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm sticky top-24">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#ff6122] mb-6 flex items-center">
                                    <span className="w-8 h-[2px] bg-[#ff6122] mr-3"></span>
                                    Bio Singkat
                                </h4>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <textarea 
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-[#ff6122]/20"
                                            placeholder="Tulis bio kamu..."
                                        />
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="relative">
                                                <i className="fab fa-instagram absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                                                <input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Username Instagram" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-sm" />
                                            </div>
                                            <div className="relative">
                                                <i className="fab fa-tiktok absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                                                <input name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="Username Tiktok" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-sm" />
                                            </div>
                                            <div className="relative">
                                                <i className="fab fa-linkedin absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                                                <input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="Username LinkedIn" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-sm" />
                                            </div>
                                            <div className="relative">
                                                <i className="fab fa-x-twitter absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                                                <input name="twitter" value={formData.twitter} onChange={handleChange} placeholder="Username Twitter/X" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-sm" />
                                            </div>
                                            <div className="relative">
                                                <i className="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                                                <input name="website" value={formData.website} onChange={handleChange} placeholder="Link Website/Portfolio" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <p className="text-[15px] leading-relaxed text-neutral-600">
                                            {user.bio || "Penulis ini belum membagikan ceritanya."}
                                        </p>
                                                                    
                                        {/* Social Media Section - Ikon Bulat Berwarna */}
                                        <div className="pt-6 border-t border-neutral-100">
                                            <div className="flex flex-wrap gap-3">
                                                {/* Instagram */}
                                                {user.instagram && (
                                                    <a href={`https://instagram.com/${user.instagram}`} target="_blank" title="Instagram"
                                                       className="w-10 h-10 rounded-full bg-[#E4405F] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                                                        <i className="fab fa-instagram text-lg"></i>
                                                    </a>
                                                )}
                                    
                                                {/* Tiktok */}
                                                {user.tiktok && (
                                                    <a href={`https://tiktok.com/@${user.tiktok}`} target="_blank" title="Tiktok"
                                                       className="w-10 h-10 rounded-full bg-[#000000] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                                                        <i className="fab fa-tiktok text-lg"></i>
                                                    </a>
                                                )}
                                    
                                                {/* LinkedIn */}
                                                {user.linkedin && (
                                                    <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" title="LinkedIn"
                                                       className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                                                        <i className="fab fa-linkedin-in text-lg"></i>
                                                    </a>
                                                )}
                                    
                                                {/* Twitter/X */}
                                                {user.twitter && (
                                                    <a href={`https://x.com/${user.twitter}`} target="_blank" title="Twitter"
                                                       className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                                                        <i className="fab fa-x-twitter text-lg"></i>
                                                    </a>
                                                )}
                                    
                                                {/* Website */}
                                                {user.website && (
                                                    <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" title="Website"
                                                       className="w-10 h-10 rounded-full bg-[#ff6122] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                                                        <i className="fas fa-link text-base"></i>
                                                    </a>
                                                )}
                                            </div>
                                            
                                            {/* Info Bergabung */}
                                            <div className="mt-5 flex items-center gap-2 text-neutral-400">
                                                <i className="fas fa-calendar-alt text-xs"></i>
                                                <span className="text-[11px] font-bold uppercase tracking-tight text-[#0118D8]">
                                                    Bergabung {joinDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                         </div>

                         {/* LIST BUKU KANAN (DIJADIKAN SATU WADAH) */}
                         <div className="lg:col-span-8">
                            <div className="bg-white rounded-[40px] border border-neutral-100 overflow-hidden shadow-sm">
                                {/* Header di dalam wadah tunggal */}
                                <div className="px-8 pt-8 pb-4 border-b border-neutral-50 flex items-center justify-between">
                                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-neutral-800 flex items-center gap-2">
                                        Karya <span className="text-[#ff6122]">Terbit</span>
                                    </h3>
                                    <span className="bg-[#ff6122]/10 text-[#ff6122] px-4 py-1 rounded-full text-[10px] font-black uppercase">
                                        {user.books.length} Judul
                                    </span>
                                </div>

                                {/* List item karya */}
                                <div className="divide-y divide-neutral-50">
                                    {user.books.length > 0 ? (
                                        user.books.map((book) => (
                                            <div key={book.id} className="group p-8 hover:bg-neutral-50/50 transition-all duration-500">
                                                <div className="flex flex-col md:flex-row gap-8">
                                                    <div className="relative shrink-0 self-center md:self-start">
                                                        <div className="w-36 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-[10px_15px_30px_rgba(0,0,0,0.15)] group-hover:shadow-[#ff6122]/20 transition-all duration-500 group-hover:-translate-y-1">
                                                            <img 
                                                                src={book.cover_path} 
                                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                                                                alt={book.title} 
                                                                onError={(e) => { e.target.src = '/default-cover.png' }} 
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        </div>
                                                        <div className="absolute -top-3 -right-3 bg-white shadow-lg rounded-full w-12 h-12 flex flex-col items-center justify-center border border-neutral-100 z-10">
                                                            <span className="text-[10px] font-black leading-none">{parseFloat(book.average_rating || 0).toFixed(1)}</span>
                                                            {/* Icon Rating Bintang Kuning Sesuai Gambar */}
                                                            <i className="fas fa-star text-[10px] text-yellow-400 mt-1 drop-shadow-[0_2px_4px_rgba(250,204,21,0.4)]"></i>
                                                        </div>
                                                    </div>
                                        
                                                    <div className="flex flex-col flex-grow">
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {(Array.isArray(book.genre) ? book.genre : JSON.parse(book.genre || '[]')).map((g, i) => (
                                                                <span key={i} className="bg-neutral-100 text-neutral-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest group-hover:bg-[#ff6122]/10 group-hover:text-[#ff6122] transition-colors">
                                                                    {g}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        
                                                        <Link href={`/books/${book.id}`}>
                                                            <h3 className="text-2xl font-black text-neutral-800 leading-tight mb-4 group-hover:text-[#ff6122] transition-colors">
                                                                {book.title}
                                                            </h3>
                                                        </Link>
                                                        
                                                        <div className="mb-6">
                                                            <p className={`text-neutral-500 text-sm leading-relaxed transition-all duration-300 ${expandedSinopsis[book.id] ? '' : 'line-clamp-3'}`}>
                                                                {book.description || "Tidak ada deskripsi singkat."}
                                                            </p>
                                                            {book.description && book.description.length > 150 && (
                                                                <button onClick={(e) => toggleSinopsis(e, book.id)} className="text-[#ff6122] italic text-[10px] font-black uppercase mt-2">
                                                                    {expandedSinopsis[book.id] ? 'Tutup' : 'Selengkapnya'}
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-neutral-100">
                                                            <div className="flex gap-8">
                                                                {/* Views Section dengan Icon Mata Dinamis */}
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-xl">👁️</div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Reads</span>
                                                                        <span className="text-sm font-black text-neutral-800">{book.views_count?.toLocaleString() || 0}</span>
                                                                    </div>
                                                                </div>
                                                        
                                                                {/* Rating/Votes Section */}
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-xl">⭐</div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Rating</span>
                                                                        <span className="text-sm font-black text-neutral-800">{parseFloat(book.average_rating || 0).toFixed(1)}</span>
                                                                    </div>
                                                                </div>
                                                        
                                                                {/* Part/Episode Section */}
                                                                <div className="flex items-center gap-3">
                                                                   <div className="text-xl">📚</div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Part</span>
                                                                        <span className="text-sm font-black text-neutral-800">
                                                                            {book.parts_count ?? (book.parts ? book.parts.length : 0)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <Link href={`/books/${book.id}`} className="bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.3em] px-1 py-3 rounded-xl hover:bg-[#ff6122] transition-all shadow-lg shadow-neutral-200">
                                                                Baca Sekarang
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center opacity-30">
                                            <i className="fas fa-book-open text-4xl mb-4"></i>
                                            <p className="text-xs font-black uppercase tracking-widest">Belum ada karya terbit</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>
                    </div>
                )}

                {/* TAB LAINNYA */}
                {activeTab === 'Percakapan' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-[40px] shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
                                <h3 className="text-lg font-black uppercase tracking-tighter">Papan <span className="text-[#ff6122]">Percakapan</span></h3>
                            </div>
                            
                            <div className="p-8">
                                <div className="relative mb-10">
                                    <textarea 
                                        value={conversationText}
                                        onChange={(e) => setConversationText(e.target.value)}
                                        placeholder={`Tinggalkan pesan untuk ${user.name}...`}
                                        className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-[30px] p-6 text-sm focus:border-[#ff6122]/30 focus:ring-0 transition-all min-h-[120px]"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={isSubmittingMessage || !conversationText.trim()}
                                        className="absolute bottom-4 right-4 bg-[#ff6122] text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-[#ff6122]/20"
                                    >
                                        Kirim Pesan
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {conversations && conversations.length > 0 ? (
                                        conversations.map((msg) => (
                                            <div key={msg.id} className="flex gap-5 group">
                                                <img src={msg.user?.avatar || '/images/default-avatar.png'} className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-sm" alt="" />
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-black text-sm uppercase tracking-tight">{msg.user?.name}</span>
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">{new Date(msg.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-neutral-600 text-[15px] leading-relaxed bg-neutral-50 p-5 rounded-2xl rounded-tl-none border border-neutral-100 group-hover:border-neutral-200 transition-colors">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 opacity-30 italic text-sm">Belum ada percakapan di sini.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Pengikut' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {user.followers?.map(follower => (
                            <UserCard key={follower.id} userData={follower} isActuallyFollowed={follower.is_followed_by_auth} />
                        ))}
                    </div>
                )}

                {activeTab === 'Mengikuti' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {user.following?.map(followed => (
                            <UserCard key={followed.id} userData={followed} isActuallyFollowed={true} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}