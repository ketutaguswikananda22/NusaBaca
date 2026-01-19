import React from 'react';
import UserAvatar from '@/Components/UserAvatar';

export default function ConversationItem({ msg, data, setData, submitMessage, processing }) {
    return (
        <div className="bg-white rounded-[28px] border border-neutral-100 shadow-sm overflow-hidden">
            {/* PESAN UTAMA */}
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
                        <button 
                            type="button"
                            onClick={() => setData(prev => ({ ...prev, parent_id: msg.id, message: '' }))}
                            className="text-[9px] font-black uppercase text-orange-500 hover:underline"
                        >
                            Balas
                        </button>
                    </div>
                    <p className="text-neutral-500 text-sm font-medium leading-relaxed">{msg.message}</p>
                </div>
            </div>

            {/* INPUT BOX REPLY (DINAMIS) */}
            {data.parent_id === msg.id && (
                <div className="px-6 pb-6 ml-12 animate-in slide-in-from-top-2">
                    <div className="flex gap-3 items-start bg-neutral-50 p-4 rounded-[20px] border border-orange-100">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                            <UserAvatar user={msg.user} className="w-8 h-8 rounded-lg" />
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
                                    onClick={submitMessage}
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

            {/* AREA BALASAN (THREAD REPLIES) */}
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
    );
}