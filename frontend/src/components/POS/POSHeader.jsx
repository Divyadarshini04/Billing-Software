import React, { useState, useEffect } from "react";
import BarcodeScanner from "./BarcodeScanner";
import { Search, Menu, Clock, User, Power, RefreshCw, X, Camera, LifeBuoy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import POSSupportModal from "./POSSupportModal";
import { supportAPI } from "../../api/apiService";

export default function POSHeader({
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    categories = [],
    onCloseOrder,
    salesmanId,
    setSalesmanId,
    onLogout,
    onShowScanner
}) {
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [activeUnreadCount, setActiveUnreadCount] = useState(0);

    const handleScanResult = (result) => {
        onSearchChange(result);
        const audio = new Audio('/beep.mp3');
        audio.play().catch(e => console.log("Audio play failed", e));
    };

    // Notification Polling
    useEffect(() => {
        const checkNotifications = async () => {
            try {
                const res = await supportAPI.getNotifications();
                // Count unread notifications linked to tickets
                const unread = res.data.filter(n => !n.is_read && n.ticket).length;

                setActiveUnreadCount(prev => {
                    // Play sound if new unread messages arrived (count increased)
                    if (unread > prev) {
                        // Simple beep sound URL
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(e => console.log("Notification sound blocked", e));
                    }
                    return unread;
                });
            } catch (e) {
                // Silent fail for polling
            }
        };

        checkNotifications(); // Initial check
        const interval = setInterval(checkNotifications, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-5 flex flex-col gap-6 shadow-sm">

            {/* Top Row: Context, Search & Actions */}
            <div className="flex items-center justify-between gap-8">

                {/* Center: Search Control Center */}
                <div className="flex-1 max-w-2xl relative">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find products by name, barcode or HSN..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-14 pr-32 py-4 h-14 bg-gray-50/50 border-2 border-transparent rounded-[20px] text-base outline-none focus:bg-white focus:border-red-500/20 focus:ring-4 focus:ring-red-500/5 transition-all font-bold placeholder:text-gray-400/80 shadow-inner"
                        />

                        {/* Integrated Actions */}
                        <div className="absolute inset-y-0 right-2 flex items-center gap-1.5 px-2">
                            {searchQuery && (
                                <button
                                    onClick={() => onSearchChange("")}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <div className="w-px h-6 bg-gray-200 mx-1" />
                            <button
                                onClick={onShowScanner}
                                className="flex items-center gap-2 pl-3 pr-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm group-focus-within:border-red-100"
                            >
                                <Camera className="w-4.5 h-4.5 text-red-500" />
                                <span className="text-xs font-black uppercase tracking-wider hidden sm:block">Scan</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Support & Identity */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* Support & Notifications */}
                    <div className="flex items-center p-1.5 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                        <button
                            onClick={() => setShowSupportModal(true)}
                            className="relative p-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 hover:shadow-sm transition-all shadow-xs border border-transparent hover:border-blue-100"
                        >
                            <LifeBuoy className="w-5 h-5 saturate-150" />
                            {activeUnreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-black flex items-center justify-center animate-bounce border-2 border-white shadow-md">
                                    {activeUnreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Staff Control Badge */}
                    <div className="flex items-center gap-4 pl-4 pr-1.5 py-1.5 bg-red-50/50 border border-red-100/50 rounded-[20px] shadow-sm hover:bg-white hover:border-red-200 transition-all group">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-red-400 uppercase tracking-[0.1em] leading-none mb-1">Session Active</span>
                            <span className="text-sm font-black text-gray-900 leading-tight tracking-tight">{salesmanId || "Unknown Staff"}</span>
                        </div>
                        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100 overflow-hidden relative">
                            <User className="w-5 h-5 opacity-20 absolute inset-0 m-auto" />
                            <div className="w-full h-full bg-gradient-to-tr from-red-500 to-orange-400 relative z-10 flex items-center justify-center font-black text-sm text-white">
                                {salesmanId?.charAt(0) || "S"}
                            </div>
                        </div>
                        <div className="w-px h-6 bg-red-200/50" />
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="w-9 h-9 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-100/50 rounded-xl transition-all"
                            >
                                <Power className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Unique Pill Category Scroll */}
            <div className="flex items-center gap-4">
                <div className="flex-1 overflow-hidden relative group">
                    <nav className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar mask-fade-right">
                        <button
                            onClick={() => onCategoryChange("All")}
                            className={`px-6 py-2.5 rounded-full border-[3px] font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === "All"
                                ? "border-red-500 bg-red-500 text-white shadow-lg shadow-red-200 scale-105"
                                : "border-transparent bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-gray-100"
                                }`}
                        >
                            Most Popular
                        </button>

                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => onCategoryChange(cat)}
                                className={`px-6 py-2.5 rounded-full border-[3px] font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat
                                    ? "border-red-500 bg-red-500 text-white shadow-lg shadow-red-200 scale-105"
                                    : "border-transparent bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-gray-100"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <POSSupportModal
                isOpen={showSupportModal}
                onClose={() => setShowSupportModal(false)}
            />
        </div >
    );
}
