import React from 'react';
import { useForm } from '@inertiajs/react';
import UserAvatar from '@/Components/UserAvatar';
import ConversationItem from './ConversationItem';

export default function ConversationThread({ author, conversations }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
        parent_id: null,
    });

    const submitMessage = (e) => {
    if (e) e.preventDefault();
    
    // Gunakan objek eksplisit { id: ... } untuk mengisi parameter {id} di URL
    post(route('profile.messages.store', { id: author.id }), {
        preserveScroll: true,
        onSuccess: () => {
            reset();
            // Optional: Tambahkan notifikasi sukses sederhana
        },
        onError: (err) => {
            console.error("Gagal mengirim pesan:", err);
        }
    });
};

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* AREA 1: INPUT PESAN UTAMA */}
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
                        onChange={e => setData(prev => ({
                            ...prev,
                            parent_id: null,
                            message: e.target.value
                        }))}
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
                        onClick={submitMessage}
                        disabled={processing || data.parent_id !== null || !data.message.trim()}
                        className="bg-orange-500 text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-orange-100"
                    >
                        {processing && data.parent_id === null ? 'Mengirim...' : 'Kirim Sekarang'}
                    </button>
                </div>
            </div>

            {/* AREA 2: LIST PERCAKAPAN */}
            <div className="space-y-4 mt-6">
                {conversations?.length > 0 ? (
                    conversations.map((msg) => (
                        <ConversationItem 
                            key={msg.id} 
                            msg={msg} 
                            data={data} 
                            setData={setData} 
                            submitMessage={submitMessage} 
                            processing={processing} 
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-[28px] border border-dashed border-neutral-200 p-20 text-center">
                        <div className="text-neutral-400 uppercase font-bold text-xs tracking-widest">
                            Belum ada percakapan masuk
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}