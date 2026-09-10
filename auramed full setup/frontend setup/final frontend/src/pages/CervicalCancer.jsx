import React, { useState, useContext } from 'react';
import { Dna, CheckCircle } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import ResultPanel from '../components/ResultPanel';
import { predictCervical, savePatientTest } from '../services/api';
import { PatientContext } from '../context/PatientContext';

const CervicalCancer = () => {
    const { patient } = useContext(PatientContext);
    const isPatientValid = patient && patient.name && patient.age && patient.phone && patient.patientId;
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!file) {
            setError('Please upload a microscopy image');
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

            const response = await predictCervical(data);
            const resData = response.data;
            setResult(resData);

            // Save test to backend (DynamoDB)
            try {
                await savePatientTest({
                    patient_id: patient.patientId,
                    test_type: 'Cervical Cancer',
                    model_input: {},
                    prediction: resData.predicted_stage || resData.prediction || resData.diagnosis || null,
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
                disease: 'Cervical Cancer',
                result: resData.predicted_stage,
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
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Dna size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Cervical Cancer Classification</h1>
                    <p className="text-slate-500 text-sm">Deep learning analysis of cervical microscopy images into 5 morphological stages</p>
                </div>
            </div>

            {isPatientValid && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider mb-1">Active Patient</p>
                        <p className="text-slate-800 font-medium">Patient: {patient.name} | Age: {patient.age} | ID: {patient.patientId}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="max-w-2xl mx-auto space-y-8">
                    <ImageUploader
                        onUpload={setFile}
                        fileType="bmp"
                        title="Upload Cervical Cytology Image (.BMP)"
                    />

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
                        {!error && <span className="text-slate-500 text-sm font-medium">Ready to classify stage</span>}

                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !file || !isPatientValid}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing AI...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    Classify Stage
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {result && (
                <div className="max-w-2xl mx-auto mt-6">
                    <ResultPanel result={result} type="cervical" />
                </div>
            )}
        </div>
    );
};

export default CervicalCancer;
