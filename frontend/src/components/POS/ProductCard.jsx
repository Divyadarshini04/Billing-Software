import React from "react";
import { motion } from "framer-motion";
import { Flame, Plus } from "lucide-react";

export default function ProductCard({ product, onClick }) {
    const [imageError, setImageError] = React.useState(false);
    const isOutOfStock = product.stock <= 0;

    return (
        <motion.div
            whileHover={!isOutOfStock ? { y: -5 } : {}}
            whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
            onClick={() => !isOutOfStock && onClick(product)}
            className={`bg-white rounded-3xl p-5 shadow-sm border border-transparent transition-all flex flex-col items-center relative group
                ${isOutOfStock ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:shadow-xl hover:border-red-100 cursor-pointer'}
            `}
        >
            {/* Stock Badge */}
            <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1
                ${isOutOfStock ? 'bg-gray-200 text-gray-500' : 'bg-green-50 text-green-600'}
            `}>
                <span>{isOutOfStock ? 'No Stock' : `${product.stock} Left`}</span>
            </div>

            {/* Favourite Badge (Mock) */}
            <div className="absolute top-4 left-4 bg-red-50 text-red-500 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 fill-red-500" />
            </div>

            {/* Image Area - Expanded */}
            <div className="w-full h-40 rounded-2xl bg-gray-50 mb-4 flex items-center justify-center overflow-hidden mt-2 p-2">
                {product.image && !imageError ? (
                    <img
                        src={product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image.startsWith('/') ? '' : '/'}${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                            console.error("Image load failed:", e.target.src);
                            setImageError(true);
                        }}
                    />
                ) : (
                    <span className="text-4xl">🥘</span>
                )}
            </div>

            {/* Content */}
            <div className="w-full text-center">
                <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[2.5rem] items-center flex justify-center leading-tight">
                    {product.name}
                </h3>

                <div className="flex items-end justify-between w-full mt-2">
                    <div className="text-left">
                        <p className="text-xs text-gray-400 font-medium">Price</p>
                        <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    </div>

                    <button
                        disabled={isOutOfStock}
                        className={`w-10 h-10 rounded-xl text-white flex items-center justify-center transition-colors shadow-lg
                            ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}
                        `}
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
