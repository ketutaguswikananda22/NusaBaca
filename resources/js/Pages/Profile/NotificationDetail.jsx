import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function NotificationDetail({ auth, notification }) {
    const { data } = notification;

    const isPeringatan = data.type === 'warning' || data.title?.toLowerCase().includes('peringatan');
    const isWelcome = data.title?.toLowerCase().includes('selamat datang');

    const getHeaderIcon = () => {
        if (isPeringatan) return { icon: '⚠️', bg: 'bg-yellow-50', label: 'PERINGATAN SISTEM', text: 'text-yellow-600' };
        if (isWelcome) return { icon: '👋', bg: 'bg-blue-50', label: 'SISTEM', text: 'text-blue-500' };
        return { icon: '🔔', bg: 'bg-gray-50', label: 'NOTIFIKASI', text: 'text-gray-400' };
    };

    const header = getHeaderIcon();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={data.title} />
            <div className="py-12 bg-white min-h-screen">
                <div className="max-w-3xl mx-auto px-4">
                    <Link href={route('notifications.index')} className="mb-8 inline-flex items-center text-sm text-gray-400 hover:text-black">
                        ← Kembali ke Kotak Masuk
                    </Link>

                    <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                        <div className="p-10 sm:p-20">
                            <div className="flex items-center gap-5 mb-10">
                                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${header.bg} text-3xl shadow-sm`}>
                                    {header.icon}
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${header.text}`}>
                                        {header.label}
                                    </p>
                                    <p className="text-sm text-gray-400">NusaBaca Support</p>
                                </div>
                            </div>

                            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">{data.title}</h1>

                            {/* BAGIAN INI: Akan muncul jika di Backend 'book_title' dikirimkan */}
                            {data.book_title && (
                                <div className="mb-8 p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4">
                                    <span className="text-2xl">📚</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Karya Yang Dilaporkan</p>
                                        <p className="text-lg font-bold text-red-900 italic">"{data.book_title}"</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-gray-600 text-xl leading-relaxed font-light mb-12">
                                {data.message}
                            </div>

                            {!isWelcome && data.url ? (
                                <div className="mt-12 pt-10 border-t border-gray-100">
                                    <Link 
                                        href={data.url}
                                        className={`inline-flex items-center justify-center text-white px-10 py-4 rounded-2xl font-bold transition shadow-xl hover:scale-[1.02] w-full sm:w-auto text-lg ${isPeringatan ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600'}`}
                                    >
                                        {isPeringatan ? 'Ajukan Banding' : 'Buka Halaman'}
                                    </Link>
                                    <p className="mt-4 text-xs text-gray-400 italic">*Banding dapat diajukan jika Anda merasa tidak melakukan pelanggaran.</p>
                                </div>
                            ) : isWelcome && (
                                <div className="mt-12 pt-10 border-t border-gray-50">
                                    <p className="text-sm text-gray-400 italic">Selamat bergabung di komunitas penulis.</p>
                                </div>
                            )} 
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}