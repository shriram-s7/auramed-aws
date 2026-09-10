import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Beaker, Dna, FileCheck2, ArrowRight, Lock, Trash2 } from 'lucide-react';
import PatientForm from '../components/PatientForm';
import UsageStats from '../components/UsageStats';
import HistoryTable from '../components/HistoryTable';
import { PatientContext } from '../context/PatientContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const { isSessionActive } = useContext(PatientContext);

    useEffect(() => {
        // Load history from localStorage
        const savedHistory = JSON.parse(localStorage.getItem('auramed_history')) || [];
        setHistory(savedHistory);
    }, []);

    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to completely clear all patient history?")) {
            localStorage.removeItem('auramed_history');
            setHistory([]);
        }
    };

    const diseaseModules = [
        {
            title: 'Breast Cancer Detection',
            description: 'Analyze mammogram images and clinical risk factors for early breast cancer detection using our multimodal AI.',
            path: '/breast',
            icon: <Activity size={32} className="text-pink-600" />,
            bg: 'bg-pink-50',
            border: 'border-pink-100',
            hover: 'hover:border-pink-300 hover:shadow-pink-100'
        },
        {
            title: 'Cervical Cancer Classification',
            description: 'Classify cervical microscopy images into five distinct stages with high-confidence predictive modeling.',
            path: '/cervical',
            icon: <Dna size={32} className="text-blue-600" />,
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            hover: 'hover:border-blue-300 hover:shadow-blue-100'
        },
        {
            title: 'PCOS Detection',
            description: 'Analyze ovarian ultrasound volume combined with hormonal clinical profiles to detect PolyCystic Ovary Syndrome.',
            path: '/pcos',
            icon: <FileCheck2 size={32} className="text-teal-600" />,
            bg: 'bg-teal-50',
            border: 'border-teal-100',
            hover: 'hover:border-teal-300 hover:shadow-teal-100'
        }
    ];


    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Diagnostic Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Select a module to begin patient analysis or review recent records.</p>
                </div>
            </div>

            <PatientForm />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {diseaseModules.map((module, index) => (
                    <div
                        key={index}
                        onClick={() => isSessionActive && navigate(module.path)}
                        className={`bg-white rounded-xl shadow-sm border ${module.border} p-6 transition-all duration-200 group relative
                            ${isSessionActive
                                ? `${module.hover} hover:-translate-y-1 shadow-md cursor-pointer`
                                : 'opacity-60 cursor-not-allowed grayscale-[50%]'
                            }`}
                    >
                        {!isSessionActive && (
                            <div className="absolute top-4 right-4 text-slate-400 bg-slate-100 p-1.5 rounded-full">
                                <Lock size={16} />
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl ${module.bg} flex items-center justify-center mb-6 transition-transform ${isSessionActive ? 'group-hover:scale-110' : ''}`}>
                            {module.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{module.title}</h3>
                        <p className="text-slate-500 text-sm mb-6 line-clamp-3">
                            {module.description}
                        </p>
                        <div className={`flex items-center text-sm font-semibold ${isSessionActive ? 'text-teal-600 group-hover:text-teal-700' : 'text-slate-400'}`}>
                            {isSessionActive ? 'Launch Module' : 'Session Required'}
                            {isSessionActive && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 mb-4">System Usage & Analytics</h2>
                <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                    Clear History
                </button>
            </div>

            <UsageStats history={history} />

            <div className="mt-8 space-y-6">
                <HistoryTable title="Breast Cancer History" history={history.filter(h => h.disease === 'Breast Cancer')} />
                <HistoryTable title="Cervical Cancer History" history={history.filter(h => h.disease === 'Cervical Cancer')} />
                <HistoryTable title="PCOS History" history={history.filter(h => h.disease === 'PCOS')} />
            </div>
        </div >
    );
};

export default Dashboard;
