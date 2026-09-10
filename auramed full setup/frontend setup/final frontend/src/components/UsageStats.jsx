import React from 'react';
import { Activity, Beaker, Dna, FileCheck2 } from 'lucide-react';

const UsageStats = ({ history }) => {
    const total = history.length;
    const breastCount = history.filter(h => h.disease === 'Breast Cancer').length;
    const cervicalCount = history.filter(h => h.disease === 'Cervical Cancer').length;
    const pcosCount = history.filter(h => h.disease === 'PCOS').length;

    const stats = [
        { label: 'Total Analyses', value: total, icon: <Activity className="text-blue-500" />, bg: 'bg-blue-50' },
        { label: 'Breast Cancer', value: breastCount, icon: <Beaker className="text-pink-500" />, bg: 'bg-pink-50' },
        { label: 'Cervical Cancer', value: cervicalCount, icon: <Dna className="text-purple-500" />, bg: 'bg-purple-50' },
        { label: 'PCOS Detection', value: pcosCount, icon: <FileCheck2 className="text-teal-500" />, bg: 'bg-teal-50' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-slate-800">{stat.value}</h4>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                        {stat.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UsageStats;
