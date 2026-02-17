import React, { useState, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailModal({ isOpen, onClose, product, onAddToCart }) {
    const [qty, setQty] = useState(1);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (isOpen) {
            setQty(1);
            setNotes("");
        }
    }, [isOpen]);

    if (!isOpen || !product) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-black/5 rounded-full z-10"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>

                    {/* Left: Image (40%) */}
                    <div className="w-full md:w-5/12 bg-gray-50 flex items-center justify-center p-8">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full object-contain drop-shadow-xl" />
                        ) : (
                            <span className="text-8xl">🍔</span>
                        )}
                    </div>

                    {/* Right: Content (60%) */}
                    <div className="w-full md:w-7/12 p-8 flex flex-col">
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
                            </div>

                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                {product.description || "Premium butter croissant with a crispy pastry crust and soft inside will melt away on your mouth!"}
                            </p>

                            <div className="text-3xl font-bold text-blue-600 mb-8">₹{product.price.toFixed(2)}</div>

                            {/* Note Input */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Add notes to your order..</label>
                                <textarea
                                    className="w-full bg-gray-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                                    rows="3"
                                    placeholder="e.g. Less spicy, Extra cheese..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between mb-8 p-1 bg-gray-50 rounded-full border border-gray-100">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="text-xl font-bold text-gray-900 w-12 text-center">{qty}</span>
                                <button
                                    onClick={() => setQty(qty + 1)}
                                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                onAddToCart({ ...product, qty, notes });
                                onClose();
                            }}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
                        >
                            Add to Cart (₹{(product.price * qty).toFixed(2)})
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
