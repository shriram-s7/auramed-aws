export const getClinicalInterpretation = (type, result) => {
    if (!result) return null;

    const rawPrediction = (result.diagnosis || result.predicted_stage || result.class || result.prediction || '').toLowerCase();

    if (type === 'breast') {
        const isMalignant = rawPrediction.includes('high risk') || rawPrediction.includes('malignant') || rawPrediction.includes('moderate risk');

        if (isMalignant) {
            return {
                explanation: "Describes malignant tumors including potential invasive growth, typical mammographic features such as spiculated margins and irregular mass shape.",
                significance: "High probability of malignancy requiring immediate clinical attention.",
                recommendation: "Recommended diagnostic confirmation such as biopsy."
            };
        } else {
            return {
                explanation: "Describes benign breast lesions including non-cancerous nature, typical imaging characteristics such as smooth margins and homogeneous density.",
                significance: "Features are consistent with normal or benign tissue.",
                recommendation: "Recommended follow-up screening."
            };
        }
    }

    if (type === 'cervical') {
        if (rawPrediction.includes('normal')) {
            return {
                explanation: "Normal cervical epithelium with no signs of dysplasia. Cellular features represent typical healthy tissue.",
                significance: "Healthy cervical status with no suspected precancerous activity.",
                recommendation: "Routine medical follow-up as per age screening guidelines."
            };
        }
        if (rawPrediction.includes('cin1') || rawPrediction.includes('cin 1') || rawPrediction.includes('stage 1')) {
            return {
                explanation: "CIN1 (Cervical Intraepithelial Neoplasia 1) indicates mild dysplasia. Cellular features show abnormal growth restricted to the lower third of the epithelial layer.",
                significance: "Low-grade lesion. Often an active HPV infection that may clear spontaneously.",
                recommendation: "Recommended medical follow-up with repeat cytology in 12 months."
            };
        }
        if (rawPrediction.includes('cin2') || rawPrediction.includes('cin 2') || rawPrediction.includes('stage 2')) {
            return {
                explanation: "CIN2 indicates moderate dysplasia. Cellular features show abnormal cells extending into the middle third of the cervical epithelium.",
                significance: "High-grade lesion indicating elevated risk of progression if untreated.",
                recommendation: "Recommended medical follow-up with colposcopy and potential preventative treatment."
            };
        }
        if (rawPrediction.includes('cin3') || rawPrediction.includes('cin 3') || rawPrediction.includes('stage 3')) {
            return {
                explanation: "CIN3 indicates severe dysplasia. Cellular features show abnormal cells encompassing more than two-thirds of the epithelial layer.",
                significance: "Precancerous condition presenting a high risk for developing into invasive carcinoma.",
                recommendation: "Recommended immediate medical follow-up with colposcopy and excisional treatment."
            };
        }
        if (rawPrediction.includes('cancer') || rawPrediction.includes('carcinoma') || rawPrediction.includes('stage 4') || rawPrediction.includes('stage 5')) {
            return {
                explanation: "Cancer indicates invasive carcinoma. Cellular features show neoplastic tissue extending beyond the basement membrane.",
                significance: "Invasive malignancy confirmed requiring immediate comprehensive staging.",
                recommendation: "Recommended immediate medical follow-up with gynecologic oncologist."
            };
        }

        // Default cervical
        return {
            explanation: "Indeterminate cervical cellular features detected.",
            significance: "Requires further clinical review.",
            recommendation: "Recommended medical follow-up."
        };
    }

    if (type === 'pcos') {
        const isPositive = rawPrediction.includes('pcos') || rawPrediction.includes('positive') || rawPrediction.includes('high risk');

        if (isPositive) {
            return {
                explanation: "Ovarian volume > 10 ml. Ovarian volume exceeding 10 ml is one of the Rotterdam diagnostic criteria for PCOS.",
                significance: "Positive indicator for Polycystic Ovary Syndrome morphology.",
                recommendation: "Clinical correlation with androgen levels and menstrual history."
            };
        } else {
            return {
                explanation: "Ovarian volume < 10 ml. Ovarian morphology remains within normal range.",
                significance: "No significant polycystic morphology detected.",
                recommendation: "No immediate PCOS-specific intervention required based on ultrasound."
            };
        }
    }

    return null;
};
