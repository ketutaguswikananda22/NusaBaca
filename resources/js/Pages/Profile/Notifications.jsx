import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Notifications({ auth, notifications }) {
    
    const handleNotificationClick = (id) => {
        router.get(route('notifications.show', id));
    };

    const markAllRead = () => {
        router.post(route('notifications.markAllRead'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kotak Masuk Notifikasi" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
                            <p className="text-gray-500 text-sm">Anda memiliki {notifications.data.filter(n => !n.read_at).length} pesan belum dibaca</p>
                        </div>
                        <button 
                            onClick={markAllRead}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                            Tandai semua dibaca
                        </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        {notifications.data.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {notifications.data.map((n) => (
                                    <div 
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n.id)}
                                        className={`p-4 transition cursor-pointer flex justify-between items-center hover:bg-gray-50 ${
                                            !n.read_at ? 'bg-blue-50/30' : ''
                                        }`}
                                    >
                                        <div className="flex gap-4 items-center overflow-hidden">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                                                !n.read_at ? 'bg-blue-600' : 'bg-transparent'
                                            }`} />
                                            
                                            <div className="overflow-hidden">
                                                <h3 className={`text-sm truncate ${!n.read_at ? 'font-bold text-gray-900' : 'font-normal text-gray-600'}`}>
                                                    {n.data.title}
                                                </h3>
                                                <p className="text-gray-500 text-xs truncate">
                                                    {n.data.message}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0 ml-4">
                                            <span className="text-[11px] text-gray-400 font-medium">
                                                {new Date(n.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <p className="italic text-sm">Kotak masuk kosong.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {notifications.links && notifications.links.length > 3 && (
                        <div className="mt-6 flex justify-center gap-1">
                            {notifications.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1 rounded text-xs transition ${
                                        link.active ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}