import React, { useEffect, useState } from 'react';

export default function DarkModeToggle({ autoDarkSetting = true }) {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        if (autoDarkSetting) {
            const hour = new Date().getHours();
            return hour >= 18 || hour < 6;
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <label className="relative inline-block w-[54px] h-[28px] cursor-pointer group">
            <input type="checkbox" className="sr-only peer" checked={isDark} onChange={() => setIsDark(!isDark)} />
            <div className="absolute inset-0 bg-[#ccc] dark:bg-[#212121] rounded-full transition-all duration-500 border border-transparent dark:border-gray-800"></div>
            <div className={`absolute top-[2px] left-[2px] w-[24px] h-[24px] rounded-full transition-all duration-500 transform flex items-center justify-center overflow-hidden ${isDark ? 'translate-x-[26px] bg-[#1d1d1d]' : 'bg-white shadow-sm'}`}>
                <svg className={`absolute w-3.5 h-3.5 text-yellow-500 transition-all duration-500 ${isDark ? 'translate-y-[25px] opacity-0' : 'translate-y-0 opacity-100'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
                <svg className={`absolute w-3.5 h-3.5 text-gray-300 transition-all duration-500 ${isDark ? 'translate-y-0 opacity-100' : 'translate-y-[-25px] opacity-0'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            </div>
        </label>
    );
}