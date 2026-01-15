// Filename: StatCards.jsx
import React from 'react';

const StatCards = ({ stats, theme }) => (
    <>
        <div className="bg-indigo-600 rounded-[2.5rem] p-6 flex flex-col justify-between text-white shadow-xl">
            <h4 className="text-5xl font-black">{stats?.pendingAuthors || 0}</h4>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">New Authors Pending</p>
        </div>

        <div className={`${theme?.card} rounded-[2.5rem] p-6 border flex flex-col justify-between shadow-md`}>
            <span className="text-[10px] font-black uppercase text-neutral-500 block mb-3 tracking-widest">System Status</span>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase">Server: Operational</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-bold uppercase">Database: Healthy</span>
                </div>
            </div>
        </div>
    </>
);

export default StatCards;