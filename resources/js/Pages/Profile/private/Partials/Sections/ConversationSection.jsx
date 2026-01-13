import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ConversationSection({ 
    user, conversations, conversationText, setConversationText, 
    replyTo, setReplyTo, handleSendMessage, isSubmittingMessage, renderMessageWithLinks 
}) {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-0 pb-20">
            <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-xl border border-neutral-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-neutral-50 flex justify-between items-center">
                    <h3 className="text-lg font-black uppercase tracking-tighter">Papan <span className="text-[#ff6122]">Percakapan</span></h3>
                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full uppercase">{conversations?.length || 0} Pesan</span>
                </div>
                
                <div className="p-6 md:p-10">
                    <div className="relative mb-12">
                        {replyTo && (
                            <div className="mb-3 flex justify-between items-center bg-neutral-50 px-4 py-2 rounded-xl border-l-4 border-[#ff6122]">
                                <p className="text-[11px] text-neutral-500 font-medium">Membalas <span className="font-bold text-neutral-800">@{replyTo.user.name}</span></p>
                                <button onClick={() => setReplyTo(null)} className="text-neutral-400 hover:text-red-500"><i className="fas fa-times"></i></button>
                            </div>
                        )}
                        <textarea 
                            value={conversationText}
                            onChange={(e) => setConversationText(e.target.value)}
                            placeholder={replyTo ? `Tulis balasan...` : `Tinggalkan pesan untuk ${user.name}...`}
                            className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-[24px] p-6 text-sm focus:border-[#ff6122]/30 focus:ring-0 transition-all min-h-[140px] resize-none"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={isSubmittingMessage || !conversationText.trim()}
                            className="absolute bottom-4 right-4 bg-[#ff6122] text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#ff6122]/30 disabled:opacity-50"
                        >
                            {isSubmittingMessage ? 'Mengirim...' : 'Kirim Pesan'}
                        </button>
                    </div>

                    <div className="space-y-8">
                        {conversations?.length > 0 ? (
                            conversations.map((msg) => (
                                <div key={msg.id} className="space-y-4">
                                    <div className="flex gap-4">
                                        <img src={msg.user?.avatar || '/images/default-avatar.png'} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm">{msg.user?.name}</span>
                                                <span className="text-[10px] text-neutral-400 uppercase">
                                                    {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id }) : 'Baru saja'}
                                                </span>
                                            </div>
                                            <div className="bg-white border border-neutral-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                                <p className="text-neutral-600 text-[14px]">{renderMessageWithLinks(msg.message)}</p>
                                            </div>
                                            <button onClick={() => setReplyTo(msg)} className="text-[10px] font-bold text-[#ff6122] mt-1 hover:underline ml-1">Balas</button>
                                        </div>
                                    </div>
                                    {msg.replies?.map((reply) => (
                                        <div key={reply.id} className="ml-12 flex gap-3 border-l-2 border-neutral-100 pl-4">
                                            <img src={reply.user?.avatar || '/images/default-avatar.png'} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-xs">{reply.user?.name}</span>
                                                    <span className="text-[9px] text-neutral-400">{reply.created_at ? formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: id }) : 'Baru saja'}</span>
                                                </div>
                                                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                                    <p className="text-neutral-600 text-[13px]">{renderMessageWithLinks(reply.message)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-30 italic text-sm">Belum ada percakapan.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}