import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, ShieldAlert, BookOpen } from 'lucide-react';
import { getClinicalInterpretation } from '../utils/ClinicalInterpretation';

const ResultPanel = ({ result, type }) => {
    if (!result) return null;

    const interpretation = getClinicalInterpretation(type, result);

    const getStatusColor = (res) => {
        const val = (res.diagnosis || res.predicted_stage || res.class || res.prediction || '').toLowerCase();
        if (val.includes('healthy') || val.includes('low risk') || val.includes('normal')) return 'text-green-600';
        if (val.includes('high risk') || val.includes('pcos')) return 'text-red-600';
        return 'text-orange-600';
    };

    const getBgColor = (res) => {
        const val = (res.diagnosis || res.predicted_stage || res.class || res.prediction || '').toLowerCase();
        if (val.includes('healthy') || val.includes('low risk') || val.includes('normal')) return 'bg-green-50 border-green-200';
        if (val.includes('high risk') || val.includes('pcos')) return 'bg-red-50 border-red-200';
        return 'bg-orange-50 border-orange-200';
    };

    const formattedChartData = result.risk_timeline
        ? Object.entries(result.risk_timeline).map(([key, value]) => ({
            month: key,
            risk: value * 100
        }))
        : [];

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mt-6">
            <div className={`p-6 border-b ${getBgColor(result)}`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                        {(result.diagnosis || result.predicted_stage || result.class || result.prediction || '').toLowerCase().includes('healthy')
                            ? <CheckCircle className={getStatusColor(result)} size={24} />
                            : <AlertCircle className={getStatusColor(result)} size={24} />
                        }
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Analysis Complete</h2>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 items-end">
                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-slate-100 flex-1">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Primary Diagnosis</span>
                        <span className={`text-2xl font-bold ${getStatusColor(result)}`}>
                            {result.diagnosis || result.predicted_stage || result.class || result.prediction || 'Unknown'}
                        </span>
                    </div>
                    {(result.final_score !== undefined || result.confidence !== undefined || result.ovarian_volume !== undefined) && (
                        <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-slate-100">
                            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                {type === 'breast' ? 'Risk Score' : type === 'cervical' ? 'Confidence' : 'Ovarian Volume'}
                            </span>
                            <span className="text-2xl font-bold text-slate-800">
                                {result.final_score
                                    ? `${(result.final_score * 100).toFixed(1)}%`
                                    : result.confidence
                                        ? `${(result.confidence * 100).toFixed(1)}%`
                                        : `${result.ovarian_volume} ml`}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {interpretation && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-teal-600" />
                            Clinical Interpretation
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Explanation</span>
                                <p className="text-sm text-slate-700 leading-relaxed">{interpretation.explanation}</p>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Clinical Significance</span>
                                <p className="text-sm text-slate-700 leading-relaxed">{interpretation.significance}</p>
                            </div>
                            <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-100">
                                <span className="block text-xs font-bold text-teal-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <ShieldAlert size={14} />
                                    Recommended Next Step
                                </span>
                                <p className="text-sm font-medium text-teal-900">{interpretation.recommendation}</p>
                            </div>
                        </div>
                    </div>
                )}

                {result.explanation && !interpretation && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Clinical Explanation</h3>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            {Array.isArray(result.explanation) ? (
                                <ul className="list-disc pl-5 space-y-1 text-slate-700 text-sm">
                                    {result.explanation.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            ) : (
                                <p className="text-slate-700 text-sm">{result.explanation}</p>
                            )}
                        </div>
                    </div>
                )}

                {result.recommended_actions && !interpretation && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShieldAlert size={16} className="text-teal-600" />
                            Recommended Actions
                        </h3>
                        <div className="bg-teal-50/50 rounded-lg p-4 border border-teal-100">
                            <ul className="list-disc pl-5 space-y-1 text-teal-900 text-sm font-medium">
                                {result.recommended_actions.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                )}

                {type === 'breast' && result.risk_timeline && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Risk Timeline Forecast</h3>
                        <div className="h-64 mt-4 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={formattedChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`${value}%`, 'Risk Probability']}
                                    />
                                    <Line type="monotone" dataKey="risk" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {result.heatmap_overlay && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Heatmap Visualization</h3>
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex justify-center p-2">
                            <img src={`data:image/jpeg;base64,${result.heatmap_overlay}`} alt="Heatmap" className="max-w-full h-auto rounded-lg shadow-sm" />
                        </div>
                    </div>
                )}

                {type === 'cervical' && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Cervical Disease Progression Overview</h3>
                        <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-4 py-3 font-semibold text-slate-700">Stage</th>
                                        <th className="px-4 py-3 font-semibold text-slate-700">Risk Level</th>
                                        <th className="px-4 py-3 font-semibold text-slate-700">Clinical Meaning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { stage: 'Normal', risk: 'Very Low', meaning: 'Healthy cervical epithelial cells with no abnormal dysplasia.', color: 'bg-green-50/60' },
                                        { stage: 'CIN1', risk: 'Low', meaning: 'Mild dysplasia affecting the lower epithelial layer, often associated with HPV infection.', color: 'bg-yellow-50/60' },
                                        { stage: 'CIN2', risk: 'Moderate', meaning: 'Moderate precancerous changes extending through two-thirds of the epithelial thickness.', color: 'bg-orange-50/60' },
                                        { stage: 'CIN3', risk: 'High', meaning: 'Severe dysplasia involving most of the epithelial layer and high risk of progression to cancer.', color: 'bg-red-50/60' },
                                        { stage: 'Cancer', risk: 'Critical', meaning: 'Invasive cervical carcinoma where malignant cells penetrate beyond the epithelial layer.', color: 'bg-rose-100/60' }
                                    ].map((row, idx) => {
                                        const rawVal = (result.diagnosis || result.predicted_stage || result.class || result.prediction || '').toLowerCase();
                                        let isMatch = false;
                                        if (row.stage === 'Normal' && (rawVal.includes('normal') || rawVal.includes('healthy'))) isMatch = true;
                                        if (row.stage === 'CIN1' && (rawVal.includes('cin1') || rawVal.includes('cin 1') || rawVal.includes('stage 1'))) isMatch = true;
                                        if (row.stage === 'CIN2' && (rawVal.includes('cin2') || rawVal.includes('cin 2') || rawVal.includes('stage 2'))) isMatch = true;
                                        if (row.stage === 'CIN3' && (rawVal.includes('cin3') || rawVal.includes('cin 3') || rawVal.includes('stage 3'))) isMatch = true;
                                        if (row.stage === 'Cancer' && (rawVal.includes('cancer') || rawVal.includes('carcinoma') || rawVal.includes('stage 4') || rawVal.includes('stage 5'))) isMatch = true;

                                        return (
                                            <tr key={idx} className={`border-b border-slate-100 last:border-0 transition-colors ${isMatch ? row.color : 'bg-white hover:bg-slate-50/50'}`}>
                                                <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                                                    {isMatch && <CheckCircle size={14} className={row.stage === 'Normal' ? 'text-green-600' : 'text-red-600'} />}
                                                    {row.stage}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 font-medium">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${isMatch ? 'bg-white/60 shadow-sm' : 'bg-slate-100'}`}>
                                                        {row.risk}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{row.meaning}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultPanel;
