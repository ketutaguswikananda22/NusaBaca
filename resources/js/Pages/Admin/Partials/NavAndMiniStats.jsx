// Filename: NavAndMiniStats.jsx
import React from 'react';

const NavAndMiniStats = ({ activeTab, setActiveTab, stats, theme }) => (
    <div className="md:col-span-2 flex flex-col gap-4">
        <div className={`flex-1 ${theme?.card} rounded-[2.5rem] p-6 border flex flex-col gap-2 shadow-md`}>
            {['profile', 'security', 'analytics', 'genres', 'danger'].map((tab) => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`text-left px-5 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${
                        activeTab === tab 
                        ? 'bg-indigo-500 text-white shadow-lg' 
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400'
                    }`}
                >
                    {tab === 'analytics' ? '📊 Data Analytics' : `${tab} Settings`}
                </button>
            ))}
        </div>
        <div className={`${theme?.card} rounded-[2.5rem] p-6 border flex items-stretch justify-around h-32 shadow-md`}>
            <div className="flex flex-col items-center flex-1 justify-center">
                <h4 className="text-4xl font-black leading-none">{stats?.totalBooks || 0}</h4>
                <span className="text-[9px] font-bold text-neutral-500 uppercase mt-2 tracking-widest">Books</span>
            </div>
            <div className="w-[1px] bg-neutral-200 dark:bg-white/10 mx-2"></div>
            <div className="flex flex-col items-center flex-1 justify-center">
                <h4 className="text-4xl font-black leading-none">{stats?.totalUsers || 0}</h4>
                <span className="text-[9px] font-bold text-neutral-500 uppercase mt-2 tracking-widest">Members</span>
            </div>
        </div>
    </div>
);

export default NavAndMiniStats;