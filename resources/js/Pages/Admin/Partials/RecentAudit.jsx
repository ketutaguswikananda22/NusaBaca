import React from 'react';

const RecentAudit = ({ logs }) => {
    return (
        <div className="relative">
            <div className="mb-8 pl-4">
                <h4 className="text-[12px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-1">Recent Audit</h4>
                <p className="text-[10px] text-neutral-500 font-medium tracking-tight">Latest administrative actions</p>
            </div>
            
            <div className="absolute left-[20px] top-[80px] bottom-10 w-[1px] border-l border-dashed border-indigo-500/40 z-0">
                <div className="absolute -top-1 -left-[4px] text-[8px] text-indigo-500/50">▲</div>
                <div className="absolute -bottom-1 -left-[4px] text-[8px] text-indigo-500/50">▼</div>
            </div>
            
            <div className="space-y-10 relative z-10 pl-4">
                {logs.length > 0 ? logs.map((log, i) => (
                    <div key={log.id || i} className="flex gap-6 items-start group animate-in fade-in slide-in-from-left duration-500">
                        <div className={`mt-1.5 w-3 h-3 rounded-full bg-[#111] border-2 shrink-0 z-20 ${
                            log.type === 'danger' ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                            log.type === 'success' ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 
                            log.type === 'warning' ? 'border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 
                            'border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'}`}>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] opacity-70">
                                        {log.type === 'danger' ? '🚫' : log.type === 'warning' ? '⚠️' : log.type === 'success' ? '✅' : '🏷️'} 
                                    </span>
                                    <p className="text-[11px] text-white font-black uppercase tracking-tight">{log.action_name}</p>
                                </div>
                                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">
                                    {log.time_ago || 'Just Now'}
                                </span>
                            </div>
                            <p className="text-[10px] text-neutral-500 font-medium ml-6 group-hover:text-neutral-300 transition-colors">
                                {log.details}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="pl-6 text-[10px] text-neutral-700 italic tracking-widest">
                        Waiting for system activity...
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentAudit;