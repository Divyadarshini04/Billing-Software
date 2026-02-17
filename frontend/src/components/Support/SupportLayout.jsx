import React, { useState } from "react";
import { Ticket, Users, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SupportLayout({ children, activeTab, onTabChange }) {
    const { userRole } = useAuth();
    const isOwner = userRole === 'OWNER';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Hero */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-10 pb-20 px-6 sm:px-10">
                <h1 className="text-4xl font-extrabold mb-2">How can we help you?</h1>
                <p className="text-blue-100 opacity-90 mb-8">Track your support requests or create a new ticket for assistance.</p>

                {/* Navigation Tabs (Floating) */}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 rounded-xl w-fit border border-white/20">
                    <button
                        onClick={() => onTabChange("system")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "system"
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                            : "text-white hover:bg-white/10"
                            }`}
                    >
                        <Ticket className="w-4 h-4" />
                        System Support
                    </button>

                    {isOwner && (
                        <button
                            onClick={() => onTabChange("staff")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "staff"
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                                : "text-white hover:bg-white/10"
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Staff Tickets
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area - Overlapping */}
            <div className="flex-1 px-6 sm:px-10 -mt-10 pb-10">
                <div className="bg-white rounded-2xl shadow-xl min-h-[500px] border border-gray-100 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}
