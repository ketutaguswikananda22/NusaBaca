import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import UserAvatar from '@/Components/UserAvatar';
import ReportModal from '../Shared/ReportModal';
import ProfileHeader from './Partials/ProfileHeader';
import ProfileBio from './Partials/ProfileBio';
import PublishedBooks from './Partials/PublishedBooks';
import ConversationThread from './Partials/ConversationThread';
import SocialConnections from './Partials/SocialConnections';

export default function Show({ auth, author: initialAuthor, books, conversations }) {
    const [activeTab, setActiveTab] = useState('perihal');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const [author, setAuthor] = useState(initialAuthor);

    const isFollowing = author.is_followed ?? author.followers?.some(follower => follower.id === auth.user.id);

    const [showReportModal, setShowReportModal] = useState(false);

    const { post: followPost, processing: followProcessing } = useForm();
    const [replyingTo, setReplyingTo] = useState(null); 
    const [activeReplyBox, setActiveReplyBox] = useState(null);

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
        user_id: auth.user.id,
        reported_author_id: author.id,
        reason: '',
        description: '',
    });

    const handleReportSubmit = (e) => {
        e.preventDefault();

        postReport(route('reports.user'), {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props.flash.error) {
                    Swal.fire({
                        title: 'Gagal!',
                        text: page.props.flash.error,
                        icon: 'error',
                        background: '#ffffff',
                        confirmButtonColor: '#3b82f6',
                        customClass: {
                            popup: 'rounded-[30px]',
                            confirmButton: 'rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-widest'
                        }
                    });
                } else {
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

    // FIX: Fungsi submit pesan diperbaiki route dan variabelnya
    const submitMessage = (e, parentId = null) => {
        if (e) e.preventDefault();
    
        post(route('profile.conversation', author.id), {
            data: { 
                message: data.message, 
                parent_id: parentId 
            },
            onSuccess: () => {
                reset('message');
                setActiveReplyBox(null);
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
                <ProfileHeader 
                    auth={auth}
                    author={author}
                    isFollowing={isFollowing}
                    followProcessing={followProcessing}
                    onFollow={handleFollow}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    onReport={() => {
                        setIsMenuOpen(false);
                        setShowReportModal(true);
                    }}
                    booksCount={books?.length || 0}
                />

                {/* --- KARTU PROFIL UTAMA --- */}
                <div className="max-w-6xl mx-auto px-4">

                    {/* --- TAB NAVIGATION --- */}
                    <div className="flex justify-center gap-12 mt-12 border-b border-neutral-200">
                        {['perihal', 'percakapan', 'pengikut', 'mengikuti'].map((tabId) => (
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
                            <ProfileBio author={author} />
                        </div>

                        {/* Kanan: Tab Content */}
                        <div className="lg:col-span-8">
                            {activeTab === 'perihal' && (
                                <PublishedBooks books={books} />
                            )}

                            {activeTab === 'percakapan' && (
                                <ConversationThread 
                                    author={author} 
                                    conversations={conversations} 
                                />
                            )}
                            
                            {/* TAB PENGIKUT */}
                            {activeTab === 'pengikut' && (
                                <SocialConnections 
                                    title="Pengikut" 
                                    users={author.followers || []} 
                                    auth={auth}
                                />
                            )}

                            {/* TAB MENGIKUTI */}
                            {activeTab === 'mengikuti' && (
                                <SocialConnections 
                                    title="Mengikuti" 
                                    users={author.following || []} 
                                    auth={auth}
                                />
                            )}

                            {/* --- MODAL LAPORAN --- */}
                            <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} author={author} />

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}