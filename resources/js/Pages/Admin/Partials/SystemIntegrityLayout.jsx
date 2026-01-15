// Filename: SystemIntegrityLayout.jsx
import React from 'react';
import SystemIntegrity from './SystemIntegrity';
import RecentAudit from './RecentAudit';

const SystemIntegrityLayout = ({ systemStats, logs, theme }) => (
    <div className={`md:col-span-2 ${theme?.card} rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[550px]`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <SystemIntegrity systemStats={systemStats} />
            <RecentAudit logs={logs} />
        </div>
    </div>
);

export default SystemIntegrityLayout;