import React from 'react';
import { Clock, CheckCircle, AlertTriangle, AlertCircle, Activity } from 'lucide-react';

const HistoryTable = ({ title, history }) => {

    const getResultBadge = (result) => {
        const resValue = result.toString().toLowerCase();
        if (resValue.includes('healthy') || resValue.includes('low') || resValue.includes('normal')) {
            return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle size={12} /> {result}
                </span>
            );
        } else if (resValue.includes('high') || resValue.includes('pcos') || resValue.includes('dyskeratotic')) {
            return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    <AlertCircle size={12} /> {result}
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                <AlertTriangle size={12} /> {result}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title || 'Recent Analyses'}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Patient ID</th>
                            <th className="px-6 py-3 font-semibold">Name</th>
                            <th className="px-6 py-3 font-semibold">Disease Type</th>
                            <th className="px-6 py-3 font-semibold">Result</th>
                            <th className="px-6 py-3 font-semibold text-right">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {history && history.length > 0 ? (
                            history.slice().reverse().map((record, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{record.patient_id}</td>
                                    <td className="px-6 py-4">{record.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-slate-700">{record.disease}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getResultBadge(record.result || 'Unknown')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="flex items-center justify-end gap-1.5 text-slate-500">
                                            <Clock size={14} />
                                            {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Activity className="text-slate-300 mb-2" size={32} />
                                        <p>No analysis history available.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryTable;
