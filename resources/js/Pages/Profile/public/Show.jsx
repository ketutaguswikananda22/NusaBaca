import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import UserAvatar from '@/Components/UserAvatar';


export default function Show({ auth, author: initialAuthor, books, conversations }) {

    const [activeTab, setActiveTab] = useState('perihal');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const [author, setAuthor] = useState(initialAuthor);

    const isFollowing = author.is_followed ?? author.followers?.some(follower => follower.id === auth.user.id);

    const [showReportModal, setShowReportModal] = useState(false);

    const { post: followPost, processing: followProcessing } = useForm();
    const [replyingTo, setReplyingTo] = useState(null); 
    const [activeReplyBox, setActiveReplyBox] = useState(null); // Menyimpan ID pesan yang akan dibalas

    function handleFollow() {
        const routeName = isFollowing ? 'profile.unfollow' : 'profile.follow';

        followPost(route(routeName, author.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props.author) {
                    setAuthor(page.props.author);
                }
            },
        });
    }

    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
        parent_id: null,
    });

    const { data: reportData, setData: setReportData, post: postReport, processing: reporting, reset: resetReport } = useForm({
        user_id: auth.user.id, // Pelapor
        reported_author_id: author.id, // Penulis yang dilaporkan
        reason: '',
        description: '',
    });

   const handleReportSubmit = (e) => {
    e.preventDefault();

    postReport(route('reports.user'), {
        preserveScroll: true,
        onSuccess: (page) => {
            // 1. CEK DULU: Apakah ada pesan error dari Laravel?
            if (page.props.flash.error) {
                Swal.fire({
                    title: 'Gagal!',
                    text: page.props.flash.error, // Isinya: "Anda sudah melaporkan..."
                    icon: 'error',
                    background: '#ffffff',
                    confirmButtonColor: '#3b82f6', // Biru atau warna netral lainnya
                    customClass: {
                        popup: 'rounded-[30px]',
                        confirmButton: 'rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-widest'
                    }
                });
            } else {
                // 2. JIKA TIDAK ADA ERROR, baru tutup modal dan tampilkan sukses
                setShowReportModal(false);
                resetReport();

                Swal.fire({
                    title: 'Laporan Terkirim',
                    text: 'Terima kasih, laporan Anda akan segera kami tinjau.',
                    icon: 'success',
                    background: '#ffffff',
                    confirmButtonColor: '#ef4444',
                    customClass: {
                        popup: 'rounded-[30px]',
                        confirmButton: 'rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-widest'
                    }
                });
            }
        },
        onError: () => {
            Swal.fire({
                title: 'Waduh!',
                text: 'Sepertinya ada kesalahan pada formulir Anda.',
                icon: 'error',
                confirmButtonColor: '#6366f1'
            });
        }
    });
};

    const handleReply = (msg) => {
        setReplyingTo(msg);
        setData('parent_id', msg.id); 
        const element = document.getElementById('message-form');
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setData('parent_id', null);
    };

    const submitMessage = (e, parentId = null) => {
        if (e) e.preventDefault();
    
        post(route('messages.store', author.id), {
            data: { 
                message: data.message, 
                parent_id: parentId 
            },
            onSuccess: () => {
                reset('message');
                setActiveReplyId(null);
            },
        });
    };

    if (!author) return null;

    const getStorageUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `/storage/${path}`;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Profil ${author.name}`} />

            <div className="min-h-screen bg-[#F8F9FA] pb-20">
                {/* --- HEADER SECTION --- */}
                <div 
                    className="relative h-[350px] w-full bg-cover bg-center transition-all duration-500"
                    style={{ 
                        backgroundColor: author.profile_bg_color || '#9ca3af',
                        backgroundImage: author.profile_bg_image ? `url(${getStorageUrl(author.profile_bg_image)})` : 'none' 
                    }}
                >
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* --- KARTU PROFIL UTAMA --- */}
                <div className="max-w-6xl mx-auto px-4">
                    <div className="relative -mt-40 bg-white rounded-[50px] shadow-sm border border-white p-10 text-center">
                        
                        {/* --- FOLLOW & MENU BUTTONS --- */}
                        <div className="absolute top-8 right-8 flex items-center gap-3">
                            {auth.user.id !== author.id && (
                                <>
                                   <button 
                                        onClick={handleFollow}
                                        disabled={followProcessing}
                                        className={`${
                                            isFollowing 
                                            ? 'bg-neutral-200 text-neutral-600' 
                                            : 'bg-orange-500 text-white shadow-orange-100' 
                                        } hover:opacity-90 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-lg min-w-[120px]`}
                                    >
                                        {followProcessing ? '...' : (isFollowing ? 'Berhenti Mengikuti' : 'Ikuti')}
                                    </button>
                                    
                                    <div className="relative">
                                        <button 
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                                        >
                                            <i className="fas fa-ellipsis-v text-neutral-400"></i>
                                        </button>

                                      {isMenuOpen && (
                                      <>
                                        {/* Overlay transparan untuk menutup menu saat klik di luar area menu */}
                                        <div 
                                          className="fixed inset-0 z-[50]" 
                                          onClick={() => setIsMenuOpen(false)} 
                                        />
                                    
                                        <div 
                                          role="menu"
                                          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-3 z-[60] animate-in fade-in zoom-in-95 duration-200"
                                        >
                                          {/* Menu Item: Mute */}
                                          <button 
                                            className="w-full text-left px-5 py-2.5 text-[11px] font-bold uppercase text-neutral-600 hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                                            onClick={() => { /* Logika Mute */; setIsMenuOpen(false); }}
                                          >
                                            <i className="fas fa-volume-mute w-4"></i> Mute
                                          </button>
                                                                        
                                          {/* Menu Item: Block */}
                                          <button 
                                            className="w-full text-left px-5 py-2.5 text-[11px] font-bold uppercase text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                            onClick={() => { /* Logika Block */; setIsMenuOpen(false); }}
                                          >
                                            <i className="fas fa-ban w-4"></i> Block
                                          </button>
                                                                        
                                          {/* Menu Item: Report */}
                                          <button 
                                            type="button" 
                                            onClick={(e) => {
                                              e.stopPropagation(); 
                                              setIsMenuOpen(false);
                                              setShowReportModal(true); 
                                            }} 
                                            className="w-full text-left px-5 py-2.5 text-[11px] font-bold uppercase text-neutral-600 hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                                          >
                                            <i className="fas fa-flag w-4"></i> Laporkan
                                          </button>
                                        
                                          <div className="my-2 border-t border-neutral-50"></div>
                                        
                                          {/* Links Section */}
                                          {['Kode Etik', 'Kebijakan Nusabaca', 'Portal Keamanan'].map((text) => (
                                            <Link 
                                              key={text}
                                              href="#" 
                                              className="block px-5 py-2.5 text-[10px] font-black uppercase text-neutral-400 hover:text-orange-500 tracking-tighter transition-colors"
                                            >
                                              {text}
                                            </Link>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                            <div className="w-40 h-40 rounded-full border-[8px] border-white shadow-xl overflow-hidden bg-neutral-100">
                                <UserAvatar user={author} className="w-full h-full" />
                                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-neutral-300">
                                        {author.name?.charAt(0)}
                                    </div>
                            </div>
                        </div>

                        <div className="mt-20 space-y-1">
                            <h1 className="text-4xl font-black text-neutral-800 tracking-tight uppercase">{author.name}</h1>
                            <p className="text-neutral-400 text-sm font-bold tracking-widest uppercase">
                                @{author.username || author.name?.toLowerCase().replace(/\s+/g, '')}
                            </p>
                        </div>

                        <div className="flex justify-center items-center gap-12 mt-10">
                            {[
                                { label: 'Karya', value: books?.length || 0 },
                                { label: 'Bacaan', value: author.reading_lists_count || 0 },
                                { label: 'Pengikut', value: author.followers_count || 0 },
                                { label: 'Mengikuti', value: author.following_count || 0 },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-2xl font-black text-neutral-800 tracking-tighter">{stat.value}</div>
                                    <div className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- TAB NAVIGATION --- */}
                    <div className="flex justify-center gap-12 mt-12 border-b border-neutral-200">
                        {['perihal', 'percakapan', 'mengikuti'].map((tabId) => (
                            <button
                                key={tabId}
                                onClick={() => setActiveTab(tabId)}
                                className={`pb-5 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${
                                    activeTab === tabId ? 'text-orange-500 border-b-2 border-orange-500' : 'text-neutral-400 hover:text-neutral-600'
                                }`}
                            >
                                {tabId}
                            </button>
                        ))}
                    </div>

                    {/* --- CONTENT GRID --- */}
                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Kiri: Bio & Sosmed */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-[35px] p-8 shadow-sm border border-neutral-100">
                                <div className="flex items-center gap-3 mb-6 border-b border-neutral-50 pb-4">
                                    <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-800">Bio Singkat</h2>
                                </div>
                                <p className="text-neutral-500 text-sm leading-relaxed mb-10 font-medium">
                                    {author.bio || "Welcome to my creative space! ✨"}
                                </p>
                                
                                <div className="flex flex-wrap gap-4 pt-8 border-t border-neutral-50">
                                    {author.instagram && (
                                        <a href={`https://instagram.com/${author.instagram}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#E4405F] flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg shadow-pink-100">
                                            <i className="fab fa-instagram"></i>
                                        </a>
                                    )}
                                    {author.tiktok && (
                                        <a href={`https://tiktok.com/@${author.tiktok}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-all">
                                            <i className="fab fa-tiktok text-xs"></i>
                                        </a>
                                    )}
                                    {author.linkedin && (
                                        <a href={`https://linkedin.com/in/${author.linkedin}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                                                <i className="fab fa-linkedin-in text-lg"></i>
                                        </a>
                                    )}
                                    {author.website && (
                                        <a href={author.website} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg shadow-orange-100">
                                            <i className="fas fa-link text-xs"></i>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kanan: Tab Content */}
                        <div className="lg:col-span-8">
                            {activeTab === 'perihal' && (
                                <div className="bg-white rounded-[35px] p-8 shadow-sm border border-neutral-100">
                                    <div className="flex items-center justify-between mb-10 border-b border-neutral-50 pb-6">
                                        <h2 className="text-xl font-black text-neutral-800 italic uppercase">Karya <span className="text-orange-500 font-black">Terbit</span></h2>
                                        <span className="bg-neutral-900 text-[10px] font-black text-white px-4 py-1.5 rounded-full uppercase tracking-widest">
                                            {books?.length || 0} Cerita
                                        </span>
                                    </div>

                                    <div className="space-y-12">
                                        {books?.length > 0 ? books.map((book) => (
                                            <div key={book.id} className="group flex flex-col md:flex-row gap-8 items-start">
                                                <div className="relative w-full md:w-40 h-56 rounded-2xl overflow-hidden shadow-xl flex-shrink-0 bg-neutral-100 border border-neutral-100">
                                                    <img 
                                                        src={getStorageUrl(book.cover_path)} 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                        alt={book.title} 
                                                        onError={(e) => e.target.src = '/images/default-cover.jpg'} 
                                                    />
                                                    <div className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex flex-col items-center justify-center border border-white">
                                                        <span className="text-[10px] font-black text-neutral-800 leading-none">{book.ratings_avg_rating ? Number(book.ratings_avg_rating).toFixed(1) : '0.0'}</span>
                                                        <i className="fas fa-star text-[8px] text-orange-500 mt-0.5"></i>
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex flex-col pt-2">
                                                    <div className="flex gap-2 mb-4 flex-wrap">
                                                        {book.genres?.map((g, i) => (
                                                            <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 px-3 py-1 rounded-md">{g.name}</span>
                                                        ))}
                                                    </div>
                                                    <h3 className="text-xl font-black text-neutral-800 leading-tight mb-3 group-hover:text-orange-500 transition-colors uppercase italic tracking-tighter">{book.title}</h3>
                                                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2 mb-6 font-medium">{book.description}</p>
                                                    
                                                    <div className="flex items-center gap-8 mb-8 border-t border-neutral-50 pt-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><i className="far fa-eye text-xs"></i></div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-neutral-400 uppercase leading-none tracking-tighter">Reads</span>
                                                                <span className="text-xs font-black text-neutral-700">{book.views_count || 0}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500"><i className="far fa-star text-xs"></i></div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-neutral-400 uppercase leading-none tracking-tighter">Rating</span>
                                                                <span className="text-xs font-black text-neutral-700">{book.ratings_avg_rating ? Number(book.ratings_avg_rating).toFixed(1) : '0.0'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500"><i className="fas fa-layer-group text-xs"></i></div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-neutral-400 uppercase leading-none tracking-tighter">Part</span>
                                                                <span className="text-xs font-black text-neutral-700">{book.parts_count || 0}</span>
                                                            </div>
                                                        </div>
                                                        <Link href={route('books.show', book.id)} className="ml-auto bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-neutral-100">
                                                            Baca Sekarang
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-10 text-neutral-400 uppercase font-bold text-xs tracking-widest">Belum ada karya yang diterbitkan</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'percakapan' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* AREA 1: WRITE (Input Pesan Utama di Bagian Atas) */}
                        <div className="bg-white rounded-[35px] p-8 shadow-sm border border-neutral-100 mb-6">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-800 mb-8">
                                Berikan <span className="text-orange-500">Kesan & Pesan</span>
                            </h2>
                            
                            <div className="relative">
                                <textarea
                                    className={`w-full bg-neutral-50 border-none rounded-[25px] p-6 text-sm font-medium focus:ring-2 focus:ring-orange-500/20 min-h-[150px] transition-all resize-none ${
                                        errors.message ? 'ring-2 ring-red-500' : ''
                                    }`}
                                    placeholder="Ketik sesuatu yang berkesan..."
                                    value={data.parent_id === null ? data.message : ''}
                                    onChange={e => {
                                        setData(prev => ({
                                            ...prev,
                                            parent_id: null, // Reset ke pesan utama jika user mengetik di sini
                                            message: e.target.value
                                        }));
                                    }}
                                ></textarea>

                                {errors.message && (
                                    <div className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-4">
                                        {errors.message}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-4">
                                <button 
                                    type="button"
                                    onClick={(e) => submitMessage(e)}
                                    // Tombol utama mati jika user sedang mengisi kotak balasan di bawah
                                    disabled={processing || data.parent_id !== null || !data.message.trim()}
                                    className="bg-orange-500 text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-orange-100"
                                >
                                    {processing && data.parent_id === null ? 'Mengirim...' : 'Kirim Sekarang'}
                                </button>
                            </div>
                        </div>

                        {/* AREA 2: LIST PERCAKAPAN (Thread View) */}
                        <div className="space-y-4 mt-6">
                            {conversations?.length > 0 ? conversations.map((msg) => (
                                <div key={msg.id} className="bg-white rounded-[28px] border border-neutral-100 shadow-sm overflow-hidden">
                                    
                                    {/* PESAN UTAMA DALAM LIST */}
                                    <div className="p-6 flex gap-4 items-start group">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex-shrink-0 overflow-hidden shadow-sm">
                                           <UserAvatar user={msg.user} className="w-12 h-12 rounded-2xl" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black text-neutral-800 uppercase italic tracking-tighter">
                                                        {msg.user?.name}
                                                    </span>
                                                    <span className="text-[9px] text-neutral-300 font-black uppercase">
                                                        {msg.created_at_formatted || 'Baru saja'}
                                                    </span>
                                                </div>
                                                
                                                {/* Tombol Balas untuk memicu munculnya Area Input Reply */}
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setData(prev => ({ ...prev, parent_id: msg.id, message: '' }));
                                                    }}
                                                    className="text-[9px] font-black uppercase text-orange-500 hover:underline"
                                                >
                                                    Balas
                                                </button>
                                            </div>
                                            <p className="text-neutral-500 text-sm font-medium leading-relaxed">{msg.message}</p>
                                        </div>
                                    </div>

                                    {/* AREA KOTAK REPLY DINAMIS (Muncul tepat di bawah pesan yang diklik) */}
                                    {data.parent_id === msg.id && (
                                        <div className="px-6 pb-6 ml-12 animate-in slide-in-from-top-2">
                                            <div className="flex gap-3 items-start bg-neutral-50 p-4 rounded-[20px] border border-orange-100">
                                                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                                                    <UserAvatar user={msg.user} className="w-12 h-12 rounded-2xl" />
                                                </div>
                                                <div className="flex-grow">
                                                    <textarea
                                                        autoFocus
                                                        className="w-full bg-transparent border-none p-0 text-xs font-medium focus:ring-0 resize-none min-h-[40px]"
                                                        placeholder={`Balas pesan ${msg.user?.name}...`}
                                                        value={data.message}
                                                        onChange={e => setData('message', e.target.value)}
                                                    ></textarea>
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setData(prev => ({ ...prev, parent_id: null, message: '' }))}
                                                            className="text-[8px] font-bold uppercase text-neutral-400 hover:text-neutral-600"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => submitMessage(e)}
                                                            disabled={processing || !data.message.trim()}
                                                            className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm"
                                                        >
                                                            {processing ? '...' : 'Kirim'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* AREA BALASAN YANG SUDAH TERDAFTAR (Thread Replies) */}
                                    {msg.replies && msg.replies.length > 0 && (
                                        <div className="bg-neutral-50/80 border-t border-neutral-100 p-6 space-y-6">
                                            {msg.replies.map((reply) => (
                                                <div key={reply.id} className="flex gap-4 items-start ml-12 relative">
                                                    {/* Garis Vertikal Thread */}
                                                    <div className="absolute -left-6 top-[-24px] bottom-6 border-l-2 border-neutral-200"></div>
                                                    
                                                    <div className="w-9 h-9 rounded-xl bg-white flex-shrink-0 overflow-hidden shadow-sm border border-neutral-100">
                                                       <UserAvatar user={reply.user} className="w-9 h-9 rounded-xl z-10" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[11px] font-black text-neutral-800 uppercase italic tracking-tighter">
                                                                {reply.user?.name}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[7px] font-black uppercase rounded-full">
                                                                Balasan
                                                            </span>
                                                        </div>
                                                        <p className="text-neutral-500 text-xs font-medium leading-relaxed">
                                                            {reply.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="bg-white rounded-[28px] border border-dashed border-neutral-200 p-20 text-center">
                                    <div className="text-neutral-400 uppercase font-bold text-xs tracking-widest">
                                        Belum ada percakapan masuk
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                            {activeTab === 'mengikuti' && (
                                <div className="bg-white rounded-[35px] p-10 shadow-sm border border-neutral-100">
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-800 mb-10 text-center">Mengikuti</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                        {author.following?.length > 0 ? author.following.map((user) => (
                                            <Link key={user.id} href={route('profile.public', user.id)} className="flex flex-col items-center group">
                                                <div className="w-20 h-20 rounded-[25px] overflow-hidden border-4 border-transparent group-hover:border-orange-500 transition-all shadow-md mb-4 bg-neutral-50">
                                                    <UserAvatar user={user} className="w-20 h-20 rounded-[25px] group-hover:border-orange-500 border-4 border-transparent transition-all" />
                                                </div>
                                                <span className="text-xs font-black text-neutral-800 group-hover:text-orange-500 uppercase italic tracking-tighter transition-colors text-center">{user.name}</span>
                                            </Link>
                                        )) : (
                                            <div className="col-span-full text-center py-10 text-neutral-400 uppercase font-bold text-xs tracking-widest">Tidak mengikuti siapapun</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- MODAL LAPORAN --- */}
                            {showReportModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                    <div className="bg-white w-full max-w-md rounded-[35px] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                                        <h3 className="text-xl font-black text-neutral-800 uppercase italic mb-2">
                                            Laporkan <span className="text-red-500">Profil</span>
                                        </h3>
                                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-8">
                                            Beritahu kami apa yang terjadi pada profil {author.name}
                                        </p>
                                                    
                                        <form onSubmit={handleReportSubmit} className="space-y-4">
                                            <select 
                                                className="w-full bg-neutral-50 border-none rounded-2xl p-4 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-red-500/20"
                                                value={reportData.reason}
                                                onChange={e => setReportData('reason', e.target.value)}
                                                required
                                            >
                                                <option value="">Pilih Alasan</option>
                                                <option value="INAPPROIRATE CONTENT">Konten Tidak Pantas</option>
                                                <option value="HARASSMENT">Pelecehan/Bullying</option>
                                                <option value="PLAGIARISM">Plagiarism</option>
                                                <option value="SPAM">Spam</option>
                                                <option value="IMPERSONATION">Penyamaran Identitas</option>
                                            </select>
                                                    
                                            <textarea 
                                                className="w-full bg-neutral-50 border-none rounded-3xl p-5 text-sm font-medium focus:ring-2 focus:ring-red-500/20 min-h-[120px]"
                                                placeholder="Detail tambahan (opsional)..."
                                                value={reportData.description}
                                                onChange={e => setReportData('description', e.target.value)}
                                            />
                            
                                            <div className="flex gap-3 pt-4">
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowReportModal(false)}
                                                    className="flex-1 py-4 text-[10px] bg-neutral-100 rounded-full font-black uppercase tracking-widest text-neutral-400 hover:bg-neutral-200 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button 
                                                    type="submit"
                                                    disabled={reporting}
                                                    className="flex-1 py-4 text-[10px] bg-red-500 rounded-full font-black uppercase tracking-widest text-white hover:bg-red-600 transition-colors disabled:opacity-50 shadow-lg shadow-red-100"
                                                >
                                                    {reporting ? 'MENGIRIM...' : 'KIRIM LAPORAN'}
                                                </button>
                                            </div>  
                                        </form>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}