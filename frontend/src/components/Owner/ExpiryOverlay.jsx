import React from "react";
import { ShieldAlert, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ExpiryOverlay({ isOpen, onUpgrade }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-red-200 dark:border-red-900/50"
                >
                    <div className="bg-red-600 p-8 text-center text-white relative">
                        <div className="absolute top-4 right-4 text-white/50">
                            <ShieldAlert className="w-12 h-12 opacity-20" />
                        </div>
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                            <ShieldAlert className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Plan Expired</h2>
                        <p className="text-red-100 font-medium">Your subscription ended recently.</p>
                    </div>

                    <div className="p-8">
                        <p className="text-slate-600 dark:text-slate-400 text-center mb-8 leading-relaxed">
                            Your Geo Billing subscription plan has expired. Please upgrade your plan to continue accessing your business data, POS, and reports.
                        </p>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={onUpgrade}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                            >
                                <CreditCard className="w-5 h-5" />
                                Upgrade Now
                            </button>

                            <button
                                onClick={() => navigate("/support")}
                                className="w-full flex items-center justify-center gap-3 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-bold transition-all"
                            >
                                <HelpCircle className="w-5 h-5" />
                                Contact Support
                            </button>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-3 py-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-semibold"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout from System
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
