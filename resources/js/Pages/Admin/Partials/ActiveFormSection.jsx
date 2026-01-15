import React from 'react';

const ActiveFormSection = ({ activeTab, renderActiveForm, lineData, doughnutData, theme }) => (
    <div className={`md:col-span-2 ${theme?.card} rounded-[3rem] p-10 border shadow-2xl overflow-hidden`}>
        <h4 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-indigo-500 border-b pb-4 border-neutral-100 dark:border-white/5">
            {activeTab} <span className="text-neutral-400 font-light italic">Settings</span>
        </h4>
        <div className="max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
            {renderActiveForm(lineData, doughnutData)}
        </div>
    </div>
);

export default ActiveFormSection;