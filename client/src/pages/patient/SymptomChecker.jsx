import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, X, Activity, AlertTriangle, Sparkles } from 'lucide-react';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { aiService } from '../../services';

const SymptomChecker = () => {
    const [step, setStep] = useState(1);
    const [symptoms, setSymptoms] = useState([]);
    const [symptomInput, setSymptomInput] = useState('');
    const [result, setResult] = useState(null);

    const predictMutation = useMutation({
        mutationFn: (symptoms) => aiService.predictDisease(symptoms),
        onSuccess: (data) => {
            setResult(data.prediction);
            setStep(3);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Prediction failed');
            setStep(1);
        },
    });

    const addSymptom = () => {
        if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
            setSymptoms([...symptoms, symptomInput.trim()]);
            setSymptomInput('');
        }
    };

    const removeSymptom = (symptom) => {
        setSymptoms(symptoms.filter((s) => s !== symptom));
    };

    const handleSubmit = () => {
        if (symptoms.length === 0) {
            toast.error('Please add at least one symptom');
            return;
        }
        setStep(2);
        predictMutation.mutate(symptoms);
    };

    const reset = () => {
        setStep(1);
        setSymptoms([]);
        setSymptomInput('');
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-8">
                    <Activity className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-900">AI Symptom Checker</h1>
                    <p className="text-slate-600 mt-2">
                        Describe your symptoms and get AI-powered health insights
                    </p>
                </div>

                {/* Step 1: Input Symptoms */}
                {step === 1 && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Enter Your Symptoms</h2>
                        <div className="mb-4">
                            <label className="label">Type a symptom and press Enter or click Add</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    className="input flex-1"
                                    placeholder="e.g., headache, fever, cough"
                                    value={symptomInput}
                                    onChange={(e) => setSymptomInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                                />
                                <button onClick={addSymptom} className="btn-primary">
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Symptoms List */}
                        {symptoms.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-slate-700 mb-2">
                                    Your symptoms ({symptoms.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {symptoms.map((symptom, index) => (
                                        <div
                                            key={index}
                                            className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center space-x-2"
                                        >
                                            <span>{symptom}</span>
                                            <button onClick={() => removeSymptom(symptom)}>
                                                <X className="h-4 w-4 hover:text-red-600" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={symptoms.length === 0}
                            className="btn-primary w-full"
                        >
                            Analyze Symptoms
                        </button>

                        {/* Disclaimer */}
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900">
                                    <strong>Disclaimer:</strong> This AI tool provides general health information
                                    only. It is NOT a substitute for professional medical advice, diagnosis, or
                                    treatment. Always consult a qualified healthcare provider for medical concerns.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Loading */}
                {step === 2 && (
                    <div className="card text-center py-12">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <Activity className="h-16 w-16 text-indigo-600 animate-pulse" />
                                <Sparkles className="h-8 w-8 text-teal-500 absolute -top-2 -right-2 animate-spin" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Symptoms...</h2>
                        <p className="text-slate-600">Our AI is processing your symptoms</p>
                        <LoadingSpinner className="mt-6" />
                    </div>
                )}

                {/* Step 3: Results */}
                {step === 3 && result && (
                    <div className="space-y-6">
                        {/* Main Result */}
                        <div className="card">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-indigo-100 p-3 rounded-lg">
                                    <Activity className="h-8 w-8 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
                                    <p className="text-sm text-slate-600">Based on your symptoms</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-600 font-medium mb-1">Possible Condition</p>
                                    <h3 className="text-2xl font-bold text-blue-900">{result.predictedDisease}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                                        <p className="text-sm text-slate-600 mb-1">Confidence Range</p>
                                        <p className="text-xl font-bold text-slate-900">{result.confidence}%</p>
                                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full"
                                                style={{ width: `${result.confidence}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                                        <p className="text-sm text-slate-600 mb-1">Urgency Level</p>
                                        <p className="text-xl font-bold text-slate-900 capitalize">{result.urgency}</p>
                                    </div>
                                </div>

                                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                    <p className="text-sm text-teal-600 font-medium mb-2">
                                        Recommended Specialist
                                    </p>
                                    <p className="text-lg font-bold text-teal-900">{result.recommendedSpecialty}</p>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <p className="text-sm text-slate-600 font-medium mb-2">Health Advice</p>
                                    <p className="text-slate-900">{result.advice}</p>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-900">
                                    <strong className="block mb-1">⚠️ IMPORTANT MEDICAL DISCLAIMER</strong>
                                    <p>
                                        This is an AI-generated prediction and NOT a medical diagnosis. This tool cannot
                                        replace professional medical consultation. Please consult a licensed healthcare
                                        professional for accurate diagnosis and treatment.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-4">
                            <button onClick={reset} className="btn-outline flex-1">
                                Check Again
                            </button>
                            <button
                                onClick={() => (window.location.href = '/patient/appointments')}
                                className="btn-primary flex-1"
                            >
                                Find {result.recommendedSpecialty} Doctors
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SymptomChecker;
