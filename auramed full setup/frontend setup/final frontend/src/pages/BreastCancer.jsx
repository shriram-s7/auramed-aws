import React, { useState, useContext } from 'react';
import { Activity, Beaker, CheckCircle } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import ResultPanel from '../components/ResultPanel';
import { predictBreast, savePatientTest } from '../services/api';
import { PatientContext } from '../context/PatientContext';

const BreastCancer = () => {
    const { patient } = useContext(PatientContext);
    const isPatientValid = patient && patient.name && patient.age && patient.phone && patient.patientId;
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        breast_density: '',
        family_history: '',
        hormonal_risk: '',
        obesity: '',
        menopause_status: '',
        high_risk_age: '',
        density_risk: '',
        genetic_risk_score: '',
        lifestyle_risk: '',
        combined_risk_index: ''
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
            setError('Please upload a mammogram image');
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
                data.append(key, formData[key] || 0); // fallback to 0 if empty
            });

            const response = await predictBreast(data);
            const resData = response.data;
            setResult(resData);

            // Save test to backend (DynamoDB)
            try {
                await savePatientTest({
                    patient_id: patient.patientId,
                    test_type: 'Breast Cancer',
                    model_input: formData,
                    prediction: resData.diagnosis || null,
                    confidence: resData.final_score || resData.confidence || null,
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
                disease: 'Breast Cancer',
                result: resData.diagnosis,
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
                <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
                    <Activity size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Breast Cancer Detection</h1>
                    <p className="text-slate-500 text-sm">Multimodal analysis combining mammography and clinical risk factors</p>
                </div>
            </div>

            {isPatientValid && (
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-pink-600 font-semibold uppercase tracking-wider mb-1">Active Patient</p>
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
                            title="Mammogram Upload"
                        />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Beaker size={20} className="text-teal-600" />
                            Clinical Risk Factors
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'breast_density', label: 'Breast Density (1-4)', type: 'number', placeholder: 'e.g. 2' },
                                { name: 'family_history', label: 'Family History (0/1)', type: 'number', placeholder: '0 = No, 1 = Yes' },
                                { name: 'hormonal_risk', label: 'Hormonal Risk (0/1)', type: 'number', placeholder: '0 = Low, 1 = High' },
                                { name: 'obesity', label: 'Obesity (0/1)', type: 'number', placeholder: '0 = No, 1 = Yes' },
                                { name: 'menopause_status', label: 'Menopause Status (0/1)', type: 'number', placeholder: '1 = Postmenopausal' },
                                { name: 'high_risk_age', label: 'High Risk Age Factor', type: 'number', placeholder: '0 or 1' },
                                { name: 'density_risk', label: 'Density Risk Factor', type: 'number', placeholder: '0 or 1' },
                                { name: 'genetic_risk_score', label: 'Genetic Risk Score', type: 'number', step: '0.01', placeholder: 'e.g. 0.85' },
                                { name: 'lifestyle_risk', label: 'Lifestyle Risk', type: 'number', step: '0.01', placeholder: 'e.g. 0.4' },
                                { name: 'combined_risk_index', label: 'Combined Risk Index', type: 'number', step: '0.01', placeholder: 'e.g. 0.65' }
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
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
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

            <ResultPanel result={result} type="breast" />
        </div>
    );
};

export default BreastCancer;
