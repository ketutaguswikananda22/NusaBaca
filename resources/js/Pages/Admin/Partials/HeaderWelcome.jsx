// Filename: HeaderWelcome.jsx
import React from 'react';
import DarkModeToggle from '@/Components/DarkModeToggle';

const HeaderWelcome = ({ user, theme, currentTime }) => (
    <>
        <div className={`md:col-span-3 ${theme?.card} rounded-[2.5rem] p-10 border flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg`}>
            <h3 className="text-3xl font-medium leading-tight italic uppercase tracking-tighter text-center md:text-left">
                nusabaca management<span className="text-indigo-500 font-black"> ecosystem</span>
            </h3>
            <DarkModeToggle autoDarkSetting={user?.auto_dark} />
        </div>

        <div className={`${theme?.card} rounded-[2.5rem] p-6 border flex flex-col justify-center overflow-hidden shadow-md`}>
            <span className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.3em] mb-3">Local Time</span>
            <h4 className="text-3xl font-black text-indigo-500 uppercase tracking-tighter">
                {currentTime.split('|')[0]}
            </h4>
            <div className="w-12 h-[2px] bg-indigo-500/30 my-2 rounded-full"></div>
            <h4 className="text-xl font-mono font-bold text-indigo-400/80">
                {currentTime.split('|')[1]}
            </h4>
        </div>
    </>
);

export default HeaderWelcome;