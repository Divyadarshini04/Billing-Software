
import React, { useState } from 'react';
import { useZxing } from "react-zxing";
import { X, Camera, Zap, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BarcodeScanner({ onResult, onClose }) {
    const [error, setError] = useState(null);
    const [torch, setTorch] = useState(false);

    const { ref } = useZxing({
        onDecodeResult(result) {
            onResult(result.getText());
        },
        onError(err) {
            if (err.name === "NotAllowedError" || err.name === "NotFoundError") {
                setError("Camera access denied or not found.");
            }
        }
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden">
            {/* Background Camera Feed */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                {error ? (
                    <div className="text-center p-8 max-w-sm">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                        <h4 className="text-white font-black text-xl mb-2">Camera Error</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20"
                        >
                            Go Back
                        </button>
                    </div>
                ) : (
                    <video ref={ref} className="w-full h-full object-cover opacity-60 svelte-1" />
                )}
            </div>

            {/* Scanner UI Overlay */}
            {!error && (
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-6">
                    {/* Header */}
                    <div className="w-full max-w-lg flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-base leading-tight">Barcode Scanner</h3>
                                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-0.5">Focusing Active</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all group"
                        >
                            <X className="w-5 h-5 text-white/70 group-hover:text-white" />
                        </button>
                    </div>

                    {/* Central Scanning Window */}
                    <div className="relative w-full max-w-sm aspect-square">
                        {/* Cut-out Visuals */}
                        <div className="absolute inset-0 border-[3px] border-white/10 rounded-3xl overflow-hidden backdrop-blur-[2px]">
                            {/* Scanning Line */}
                            <motion.div
                                animate={{
                                    top: ["10%", "90%", "10%"],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.8)] z-20"
                            />

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-red-500 rounded-tl-2xl z-20" />
                            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-red-500 rounded-tr-2xl z-20" />
                            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-red-500 rounded-bl-2xl z-20" />
                            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-red-500 rounded-br-2xl z-20" />
                        </div>

                        {/* Animated Grid Dots */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-6 grid-rows-6 gap-2 p-8">
                            {Array.from({ length: 36 }).map((_, i) => (
                                <div key={i} className="w-1 h-1 bg-white rounded-full" />
                            ))}
                        </div>
                    </div>

                    {/* Footer / Instructions */}
                    <div className="flex flex-col items-center gap-6 mb-8">
                        <div className="px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full backdrop-blur-md">
                            <p className="text-white font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                Align barcode within frame
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setTorch(!torch)}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${torch ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'
                                    } shadow-xl`}
                            >
                                <Zap className="w-6 h-6" />
                            </button>
                            <button className="w-14 h-14 rounded-full bg-white/10 text-white/50 hover:bg-white/20 flex items-center justify-center transition-all">
                                <RefreshCw className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
