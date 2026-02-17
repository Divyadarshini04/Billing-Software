import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, AlertCircle, RefreshCcw, Headset } from 'lucide-react';

export default function SubscriptionFailurePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const errorMessage = location.state?.error || "We couldn't process your payment. Please check your payment details and try again.";
    const plan = location.state?.plan;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden border border-gray-100 dark:border-slate-700">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Payment Failed</h1>
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                            <p className="text-red-700 dark:text-red-400 text-sm font-medium flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {errorMessage}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            onClick={() => navigate('/owner/payment', { state: { plan } })}
                            className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-xl"
                        >
                            <RefreshCcw className="w-4 h-4" /> Try Again
                        </button>

                        <button
                            onClick={() => navigate('/support')}
                            className="w-full py-4 bg-white dark:bg-slate-700 text-gray-700 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-slate-600 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                        >
                            <Headset className="w-4 h-4" /> Contact Support
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/owner/subscription-management')}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                    >
                        Return to Plans
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
