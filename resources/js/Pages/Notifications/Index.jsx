import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Index({ auth, allNotifications }) {
    
    const handleRead = (n) => {
        // Jika belum dibaca, kirim post ke server, jika sudah langsung redirect
        if (!n.read_at) {
            router.post(route('notifications.read', n.id));
        } else {
            router.visit(n.data.url || route('dashboard'));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kotak Masuk Notifikasi" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header ala Gmail */}
                    <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
                        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
                            Notifikasi
                            {auth.user.unread_notifications_count > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                    {auth.user.unread_notifications_count} Baru
                                </span>
                            )}
                        </h1>
                        <button 
                            onClick={() => router.post(route('notifications.markAllRead'))}
                            className="text-sm text-gray-500 hover:text-blue-600 transition"
                        >
                            Tandai semua dibaca
                        </button>
                    </div>

                    {/* Container List */}
                    <div className="bg-white shadow-sm border border-gray-200 sm:rounded-lg overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {allNotifications.data.length > 0 ? (
                                allNotifications.data.map((n) => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => handleRead(n)}
                                        className={`group flex items-center px-4 py-3 cursor-pointer transition-all duration-75 border-l-4 ${
                                            !n.read_at 
                                            ? 'bg-white border-blue-600' 
                                            : 'bg-gray-50/50 border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        {/* Dot Indikator */}
                                        <div className="flex-shrink-0 mr-4">
                                            <div className={`h-2.5 w-2.5 rounded-full ${!n.read_at ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                        </div>

                                        {/* Content ala Gmail Row */}
                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                            {/* Pengirim/Judul */}
                                            <div className={`text-sm truncate ${!n.read_at ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                                {n.data.title}
                                            </div>

                                            {/* Pesan Singkat (Span 2 kolom di Desktop) */}
                                            <div className="md:col-span-2">
                                                <p className={`text-sm truncate ${!n.read_at ? 'text-gray-800' : 'text-gray-400'}`}>
                                                    {n.data.message}
                                                </p>
                                            </div>

                                            {/* Waktu */}
                                            <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                                                {new Date(n.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <p className="text-gray-400 text-sm">Kotak masuk kosong</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Sederhana */}
                        {allNotifications.links && (
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                                {allNotifications.prev_page_url && (
                                    <Link href={allNotifications.prev_page_url} className="px-3 py-1 bg-white border rounded text-xs hover:bg-gray-100">Sebelumnya</Link>
                                )}
                                {allNotifications.next_page_url && (
                                    <Link href={allNotifications.next_page_url} className="px-3 py-1 bg-white border rounded text-xs hover:bg-gray-100">Berikutnya</Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}