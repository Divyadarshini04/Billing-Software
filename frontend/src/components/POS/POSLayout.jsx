import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

export default function POSLayout({ leftPanel, rightPanel }) {
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full bg-[#f3f4f6] dark:bg-gray-900 overflow-hidden font-sans relative">
            {/* Left Panel - Product Grid & Navigation */}
            <div className="flex-1 flex flex-col h-full min-w-0 border-r border-gray-200 dark:border-gray-800 overflow-hidden relative">
                {leftPanel}

                {/* Mobile Cart Toggle Button */}
                <button
                    onClick={() => setIsMobileCartOpen(true)}
                    className="lg:hidden absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-transform active:scale-95"
                >
                    <ShoppingCart className="w-6 h-6" />
                </button>
            </div>

            {/* Desktop Right Panel */}
            <div className="hidden lg:flex w-[400px] flex-shrink-0 bg-white dark:bg-gray-800 h-full flex-col shadow-xl z-30 border-l border-gray-200 dark:border-gray-700">
                {rightPanel}
            </div>

            {/* Mobile Right Panel (Drawer) */}
            {isMobileCartOpen && (
                <div className="lg:hidden absolute inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileCartOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative w-[90%] sm:w-[400px] h-full bg-white dark:bg-gray-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <button
                            onClick={() => setIsMobileCartOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-700 z-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {rightPanel}
                    </div>
                </div>
            )}
        </div>
    );
}
