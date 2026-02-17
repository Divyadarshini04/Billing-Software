import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smartphone, ShieldCheck, Clock } from 'lucide-react';
import { authAPI, api as mainApi } from '../api/apiService'; // Using mainApi as fallback or api from axios

// We need the api instance to make the call
import api from '../api/axios';

export default function PaymentProcessingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { plan, method, paymentDetails } = location.state || {};

    const [status, setStatus] = useState('processing'); // processing, finalizing

    useEffect(() => {
        if (!plan || !method) {
            navigate('/owner/subscription-management');
            return;
        }

        const processPayment = async () => {
            try {
                // Stage 1: Initial Sending (Artificial delay for UX)
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Stage 2: Actual API Call
                await api.post("/api/subscriptions/upgrade/", {
                    plan_id: plan.id,
                    payment_method: method.toUpperCase(),
                    payment_details: paymentDetails || {}
                });

                setStatus('finalizing');

                // Stage 3: Final Polishing (Artificial delay)
                await new Promise(resolve => setTimeout(resolve, 1500));

                navigate('/owner/payment-success', { state: { planName: plan.name } });

            } catch (error) {
                console.error("Payment processing error:", error);
                const errorMsg = error.response?.data?.message || error.response?.data?.detail || "We couldn't verify your payment. Please try again.";
                navigate('/owner/payment-failure', { state: { error: errorMsg, plan } });
            }
        };

        processPayment();
    }, [plan, method, paymentDetails, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 text-center border border-gray-100 dark:border-slate-700">
                <div className="space-y-8">
                    {/* Dynamic Icon */}
                    <div className="relative w-24 h-24 mx-auto">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-600 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            {status === 'processing' ? (
                                <Smartphone className="w-10 h-10 text-blue-600 animate-pulse" />
                            ) : (
                                <ShieldCheck className="w-10 h-10 text-blue-600" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={status}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <p className="text-[#052e16]/60 text-sm font-medium">Selected Plan</p>
                                <p className="text-[#052e16] text-2xl font-bold">{(plan?.name || '').replace(/\(Monthly\)|\(Yearly\)/gi, '').trim()}</p>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                    {status === 'processing' ? 'Processing UPI Request' : 'Almost Done!'}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 px-4">
                                    {status === 'processing'
                                        ? "Please wait while we establish a secure connection with your UPI provider."
                                        : "Payment confirmed. We're now activating your new subscription features."}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Security Badge */}
                    <div className="pt-4 flex items-center justify-center gap-4 border-t border-gray-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <ShieldCheck className="w-4 h-4" /> 256-bit Encryption
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Clock className="w-4 h-4" /> Real-time Verification
                        </div>
                    </div>
                </div>

                {/* Warning Footer */}
                <p className="mt-10 text-[11px] text-red-500/70 font-medium bg-red-50 dark:bg-red-900/10 py-3 px-4 rounded-xl border border-red-100 dark:border-red-900/20">
                    ⚠️ DO NOT REFRESH OR CLICK BACK BUTTON
                </p>
            </div>
        </div>
    );
}
