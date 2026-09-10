import React, { useState, useContext } from 'react';
import { FileCheck2, Beaker, CheckCircle } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import ResultPanel from '../components/ResultPanel';
import { predictPCOS, savePatientTest } from '../services/api';
import { PatientContext } from '../context/PatientContext';

const PCOS = () => {
    const { patient } = useContext(PatientContext);
    const isPatientValid = patient && patient.name && patient.age && patient.phone && patient.patientId;
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        Weight: '',
        Height: '',
        LH: '',
        FSH: '',
        AMH: '',
        BMI: '',
        LH_FSH_Ratio: '',
        Androgen_Level: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError('Please upload an ultrasound image');
            return;
        }

        if (!isPatientValid) {
            setError('Please enter patient details before starting an analysis.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = new FormData();
            data.append('file', file);
            data.append('patient_id', patient.patientId);
            data.append('patient_name', patient.name);
            data.append('age', patient.age);
            data.append('phone', patient.phone);

            // Append all clinical data
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key] || 0);
            });

            const response = await predictPCOS(data);
            const resData = response.data;
            setResult(resData);

            // Save test to backend (DynamoDB)
            try {
                await savePatientTest({
                    patient_id: patient.patientId,
                    test_type: 'PCOS',
                    model_input: formData,
                    prediction: resData.class || resData.prediction || resData.diagnosis || null,
                    confidence: resData.confidence || resData.final_score || null,
                    heatmap: resData.heatmap_overlay || resData.heatmap || null,
                    overlay_map: resData.overlay_map || null
                });
            } catch (saveErr) {
                console.error('Failed to save test result to DynamoDB:', saveErr);
            }

            // Save to history
            const history = JSON.parse(localStorage.getItem('auramed_history')) || [];

            history.push({
                patient_id: patient.patientId,
                name: patient.name,
                disease: 'PCOS',
                result: resData.class,
                timestamp: new Date().toISOString()
            });

            localStorage.setItem('auramed_history', JSON.stringify(history));
        } catch (err) {
            console.error(err);
            setError('Analysis failed. Please try again or check connection to AI engine.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                    <FileCheck2 size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">PCOS Detection</h1>
                    <p className="text-slate-500 text-sm">Ovarian volumetric analysis and clinical endocrine profiling</p>
                </div>
            </div>

            {isPatientValid && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-teal-600 font-semibold uppercase tracking-wider mb-1">Active Patient</p>
                        <p className="text-slate-800 font-medium">Patient: {patient.name} | Age: {patient.age} | ID: {patient.patientId}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <ImageUploader
                            onUpload={setFile}
                            fileType="jpg/png"
                            title="Ultrasound Upload"
                        />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Beaker size={20} className="text-teal-600" />
                            Clinical Bio-Markers
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'Weight', label: 'Weight (kg)', type: 'number', step: '0.1', placeholder: 'e.g. 65' },
                                { name: 'Height', label: 'Height (cm)', type: 'number', step: '0.1', placeholder: 'e.g. 165' },
                                { name: 'BMI', label: 'BMI', type: 'number', step: '0.1', placeholder: 'e.g. 23.8' },
                                { name: 'LH', label: 'LH (mIU/mL)', type: 'number', step: '0.1', placeholder: 'e.g. 6.5' },
                                { name: 'FSH', label: 'FSH (mIU/mL)', type: 'number', step: '0.1', placeholder: 'e.g. 4.2' },
                                { name: 'LH_FSH_Ratio', label: 'LH/FSH Ratio', type: 'number', step: '0.01', placeholder: 'e.g. 1.5' },
                                { name: 'AMH', label: 'AMH (ng/mL)', type: 'number', step: '0.1', placeholder: 'e.g. 3.2' },
                                { name: 'Androgen_Level', label: 'Androgen Level', type: 'number', step: '0.1', placeholder: 'e.g. 1.2' }
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
                                    <input
                                        type={field.type}
                                        step={field.step}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleInputChange}
                                        placeholder={field.placeholder}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                            {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
                            {!error && <span className="text-slate-500 text-sm font-medium">Ready for analysis</span>}

                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !file || !isPatientValid}
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing AI...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle size={18} />
                                        Run Diagnostic
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ResultPanel result={result} type="pcos" />
        </div>
    );
};

export default PCOS;
