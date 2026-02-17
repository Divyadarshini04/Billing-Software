import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ShieldCheck, ArrowRight, PartyPopper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionSuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshProfile } = useAuth();
    const planName = location.state?.planName || "New Plan";

    // Stages: 1 = Payment Successful, 2 = Plan Subscribed Successfully
    const [stage, setStage] = useState(1);

    useEffect(() => {
        // Sync user data once on mount
        refreshProfile();
    }, []); // Run once on mount

    useEffect(() => {
        // Transition from Stage 1 to Stage 2 after 2.5 seconds
        const stageTimer = setTimeout(() => {
            setStage(2);
        }, 2500);

        // Final redirect to Current Plan after 5.5 seconds total
        const finalRedirectTimer = setTimeout(() => {
            navigate('/owner/subscription-management');
        }, 5500);

        return () => {
            clearTimeout(stageTimer);
            clearTimeout(finalRedirectTimer);
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden border border-gray-100 dark:border-slate-700">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />

                <AnimatePresence mode="wait">
                    {stage === 1 ? (
                        <motion.div
                            key="stage1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Payment Successful</h1>
                                <p className="text-gray-500 dark:text-gray-400">Your transaction has been verified.</p>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5, ease: "linear" }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stage2"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <motion.div
                                initial={{ rotate: -10 }}
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto"
                            >
                                <PartyPopper className="w-12 h-12 text-blue-600" />
                            </motion.div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Plan Subscribed Successfully!</h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Welcome to the <span className="font-bold text-blue-600">{planName}</span>
                                </p>
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={() => navigate('/owner/subscription-management')}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-xl hover:scale-105 transition-transform"
                                >
                                    Go to Current Plan <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 italic">Redirecting you in a moment...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
