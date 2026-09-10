import React, { useContext, useState } from 'react';
import { PatientContext } from '../context/PatientContext';
import { CheckCircle2, Lock, Unlock, Loader2 } from 'lucide-react';

const PatientForm = () => {
    const { patient, setPatient, isSessionActive, startSession, clearSession } = useContext(PatientContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const currentPatient = patient || { name: '', age: '', phone: '', patientId: '' };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPatient({ ...currentPatient, [name]: value });
    };

    const isLoaded = currentPatient.name && currentPatient.patientId && currentPatient.age && currentPatient.phone;

    const handleStartSession = async () => {
        if (!isLoaded) {
            setError('Please fill in all patient details.');
            return;
        }
        setError('');
        setLoading(true);
        const result = await startSession(currentPatient);
        setLoading(false);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <div className={`w-2 h-6 ${isSessionActive ? 'bg-teal-500' : 'bg-orange-500'} rounded-full`}></div>
                    Patient Information
                </h3>
                {isSessionActive && (
                    <div className="flex items-center gap-2 text-sm font-medium text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                        <CheckCircle2 size={16} className="text-teal-600" />
                        Active Session: {currentPatient.name} | ID: {currentPatient.patientId}
                    </div>
                )}
                {!isSessionActive && error && (
                    <div className="text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Patient ID *</label>
                    <input
                        type="text"
                        name="patientId"
                        value={currentPatient.patientId}
                        onChange={handleChange}
                        disabled={isSessionActive}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow ${isSessionActive ? 'opacity-70 cursor-not-allowed' : ''}`}
                        placeholder="e.g. P10452"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={currentPatient.name}
                        onChange={handleChange}
                        disabled={isSessionActive}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow ${isSessionActive ? 'opacity-70 cursor-not-allowed' : ''}`}
                        placeholder="e.g. Jane Doe"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Age *</label>
                    <input
                        type="number"
                        name="age"
                        value={currentPatient.age}
                        onChange={handleChange}
                        disabled={isSessionActive}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow ${isSessionActive ? 'opacity-70 cursor-not-allowed' : ''}`}
                        placeholder="e.g. 45"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Phone Number *</label>
                    <input
                        type="tel"
                        name="phone"
                        value={currentPatient.phone}
                        onChange={handleChange}
                        disabled={isSessionActive}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow ${isSessionActive ? 'opacity-70 cursor-not-allowed' : ''}`}
                        placeholder="e.g. 555-0102"
                    />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                {isSessionActive ? (
                    <button
                        onClick={clearSession}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Lock size={16} />
                        End Session & Lock Modules
                    </button>
                ) : (
                    <button
                        onClick={handleStartSession}
                        disabled={!isLoaded || loading}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Unlock size={16} />}
                        Start Diagnostic Session
                    </button>
                )}
            </div>
        </div>
    );
};

export default PatientForm;

