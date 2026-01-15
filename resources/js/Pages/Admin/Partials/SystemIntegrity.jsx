import React from 'react';

const SystemIntegrity = ({ systemStats }) => {
    const integrityItems = [
        { 
            label: 'API Gateway', 
            status: systemStats.api, 
            val: systemStats.api === 'OPTIMAL' ? 75 : 100, 
            color: systemStats.api === 'OPTIMAL' ? 'bg-green-500' : 'bg-red-500',
            icon: '⚡'
        },
        { 
            label: 'Operational', 
            status: systemStats.operational, 
            val: 90, 
            color: 'bg-green-400',
            icon: '📡'
        },
        { 
            label: 'Database', 
            status: systemStats.db, 
            val: systemStats.db === 'HEALTHY' ? 45 : 100, 
            color: systemStats.db === 'HEALTHY' ? 'bg-indigo-500' : 'bg-red-500',
            icon: '🗄️'
        },
        { 
            label: 'S3 Storage', 
            status: systemStats.storage, 
            val: systemStats.storage_p,
            color: systemStats.storage === 'FULL' ? 'bg-red-500' : 
                   (systemStats.storage === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'),
            icon: '☁️'       
        }
    ];

    return (
        <div className="space-y-8 flex flex-col justify-between">
            <div>
                <div className="flex flex-col mb-6">
                    <h4 className="text-[12px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-1">System Integrity</h4>
                    <p className="text-[10px] text-neutral-500 font-medium tracking-tight">Dynamic real-time status use Laravel Reverb</p>
                </div>
                <div className="space-y-6">
                    {integrityItems.map((item, i) => (
                        <div key={i} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px]">{item.icon}</span>
                                    <span className="text-[11px] font-bold text-neutral-300 group-hover:text-white transition-colors">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase text-neutral-500 tracking-tighter">{item.status}</span>
                                    <span className={`h-2 w-2 rounded-full ${item.color} shadow-[0_0_8px_${item.color.replace('bg-', '')}]`}></span>
                                </div>
                            </div>
                            <div className="h-[4px] w-full bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-in-out`} style={{ width: `${item.val}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Uptime Mini Chart */}
            <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase text-neutral-300 mb-4 tracking-widest">Uptime (24h)</p>
                <div className="relative h-16 w-full flex items-center">
                    <svg className="w-full h-full" viewBox="0 0 200 60">
                        <path d="M0,50 Q20,20 40,45 T80,30 T120,50 T160,20 T200,40" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                        {[0, 40, 80, 120, 160, 200].map((x, i) => (
                            <circle key={i} cx={x} cy={i % 2 === 0 ? 50 : 25} r="3" fill="#10b981" />
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default SystemIntegrity;