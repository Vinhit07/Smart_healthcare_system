import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { faqService } from '../../services';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQPage = () => {
    const { data: faqs, isLoading } = useQuery({
        queryKey: ['faqs'],
        queryFn: () => faqService.getAllFAQs().then(res => res.faqs),
    });

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-8">
                    <HelpCircle className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h1>
                    <p className="mt-2 text-slate-600">Find answers to common questions about our platform.</p>
                </div>

                <div className="space-y-4">
                    {faqs?.length === 0 && (
                        <div className="text-center text-slate-500 py-8">No FAQs available yet.</div>
                    )}
                    {faqs?.map((faq, index) => (
                        <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 transition-colors"
                            >
                                <span className="font-semibold text-slate-800">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="h-5 w-5 text-indigo-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                )}
                            </button>
                            {openIndex === index && (
                                <div className="p-4 border-t border-slate-100 bg-slate-50">
                                    <p className="text-slate-600">{faq.answer}</p>
                                    <div className="mt-2 text-xs text-indigo-600 font-medium bg-indigo-50 inline-block px-2 py-1 rounded">
                                        {faq.category}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
