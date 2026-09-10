import React, { createContext, useState, useEffect } from 'react';
import { startPatientSession } from '../services/api';

export const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
    const [patient, setPatient] = useState(() => {
        const saved = localStorage.getItem('auramed_current_patient');
        return saved ? JSON.parse(saved) : null;
    });

    const [isSessionActive, setIsSessionActive] = useState(() => {
        const active = localStorage.getItem('auramed_session_active');
        return active === 'true';
    });

    useEffect(() => {
        if (patient) {
            localStorage.setItem('auramed_current_patient', JSON.stringify(patient));
        } else {
            localStorage.removeItem('auramed_current_patient');
        }
        localStorage.setItem('auramed_session_active', isSessionActive);
    }, [patient, isSessionActive]);

    const startSession = async (patientData) => {
        try {
            await startPatientSession({
                patient_id: patientData.patientId,
                name: patientData.name,
                age: patientData.age,
                phone: patientData.phone
            });
            setPatient(patientData);
            setIsSessionActive(true);
            return { success: true };
        } catch (error) {
            console.error('Failed to start patient session:', error);
            return { success: false, error: 'Failed to communicate with diagnostic server' };
        }
    };

    const clearSession = () => {
        setPatient(null);
        setIsSessionActive(false);
    };

    return (
        <PatientContext.Provider value={{ patient, setPatient, isSessionActive, startSession, clearSession }}>
            {children}
        </PatientContext.Provider>
    );
};
