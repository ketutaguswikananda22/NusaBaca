import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';

export default function AnalyticsDashboard({ reportChartData, statusStats, lineData, doughnutData }) {
    const isLineDataEmpty = !reportChartData?.totals || reportChartData.totals.every(item => item === 0);
    const isDoughnutEmpty = !statusStats || (Number(statusStats.pending) === 0 && Number(statusStats.resolved) === 0);

    return (
        <div className="space-y-10 animate-in fade-in zoom-in duration-300">
            {/* Line Chart */}
            <div className="h-[250px] w-full">
                <div className="flex justify-between items-center mb-4">
                    <h5 className="text-[10px] font-black uppercase text-neutral-400 italic">
                        Report <span className="text-indigo-500">Analytics</span>
                    </h5>
                    {isLineDataEmpty && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md font-bold animate-pulse">
                            DEMO DATA
                        </span>
                    )}
                </div>
                <Line 
                    data={lineData} 
                    options={{ 
                        maintainAspectRatio: false, 
                        responsive: true,
                        scales: { y: { beginAtZero: true, min: 0, ticks: { stepSize: 1 } } },
                        plugins: { legend: { display: false } }
                    }} 
                />
            </div>

            {/* Doughnut Chart */}
            <div className="h-[250px] w-full pt-10 border-t border-neutral-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h5 className="text-[10px] font-black uppercase text-neutral-400 italic">
                        Status <span className="text-indigo-500">Ratio</span>
                    </h5>
                    {isDoughnutEmpty && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md font-bold">
                            NO DATA YET
                        </span>
                    )}
                </div>
                <div className="h-full flex justify-center pb-6">
                    <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, responsive: true }} />
                </div>
            </div>
        </div>
    );
}