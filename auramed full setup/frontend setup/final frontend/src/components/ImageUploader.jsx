import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

const ImageUploader = ({ onUpload, fileType, title = 'Upload Medical Image' }) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const validateAndProcessFile = (file) => {
        setError('');
        if (!file) return;

        // Type validation based on constraints
        if (fileType === 'bmp' && !file.name.toLowerCase().endsWith('.bmp') && file.type !== 'image/bmp') {
            setError('Invalid file type. Please upload a BMP image.');
            return;
        } else if (fileType === 'jpg/png' && !['image/jpeg', 'image/png'].includes(file.type)) {
            setError('Invalid file type. Please upload a JPG or PNG image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
            onUpload(file);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndProcessFile(e.dataTransfer.files[0]);
        }
    }, [fileType]);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndProcessFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setPreview(null);
        onUpload(null);
        setError('');
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">{title}</label>

            {!preview ? (
                <div
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer text-center
            ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-teal-500 mb-4 border border-slate-100">
                        <UploadCloud size={28} />
                    </div>
                    <p className="text-slate-800 font-medium mb-1">
                        <span className="text-teal-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                        Accepted formats: {fileType === 'bmp' ? 'BMP only' : 'JPG, PNG'}
                    </p>

                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept={fileType === 'bmp' ? '.bmp,image/bmp' : 'image/jpeg,image/png'}
                        onChange={handleChange}
                    />
                </div>
            ) : (
                <div className="border border-slate-200 rounded-xl p-4 bg-white relative shadow-sm">
                    <button
                        onClick={removeFile}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors z-10"
                    >
                        <X size={16} />
                    </button>

                    <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                        <img src={preview} alt="Medical scan preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                        <ImageIcon size={16} className="text-teal-500" />
                        <span className="truncate font-medium">Image ready for analysis</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
