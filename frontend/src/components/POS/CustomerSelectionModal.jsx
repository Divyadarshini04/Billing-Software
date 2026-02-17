import React, { useState } from "react";
import { X, Search, UserPlus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { customerAPI } from "../../api/apiService"; // Import API

export default function CustomerSelectionModal({
    isOpen,
    onClose,
    customers = [],
    onSelect,
    onAddNew // Fallback for full add page if needed, but we will use inline first
}) {
    const [query, setQuery] = useState("");
    const [mode, setMode] = useState("select"); // 'select' or 'create'
    const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "" });
    const [loading, setLoading] = useState(false);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
    );

    const handleCreate = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
            alert("Name and Phone are required");
            return;
        }
        setLoading(true);
        try {
            const res = await customerAPI.createCustomer(newCustomer);
            if (res.data) {
                // Auto-select the newly created customer
                // API response structure might vary, adjust if needed (res.data or res.data.data)
                const createdCustomer = res.data.data || res.data;
                onSelect(createdCustomer);
                onClose();
                // Reset state
                setMode("select");
                setNewCustomer({ name: "", phone: "", email: "" });
            }
        } catch (e) {
            console.error("Failed to create customer", e);
            alert("Failed to create customer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                            {mode === 'create' ? "Create New Customer" : "Select Customer"}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {mode === 'select' ? (
                        <>
                            {/* Search & Add */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search by Name or Phone..."
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setMode("create");
                                        setNewCustomer(prev => ({ ...prev, name: query })); // Pre-fill name from search
                                    }}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-blue-700"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span className="hidden sm:inline">New</span>
                                </button>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {filtered.length === 0 ? (
                                    <div className="py-4 text-center">
                                        <p className="text-gray-400 text-sm mb-3">No customers found.</p>

                                        {query.trim() && (
                                            <button
                                                onClick={() => {
                                                    // Mock customer object for walk-in
                                                    const walkInCustomer = {
                                                        id: `manual-${Date.now()}`,
                                                        name: query,
                                                        phone: "N/A",
                                                        isManual: true
                                                    };
                                                    onSelect(walkInCustomer);
                                                    onClose();
                                                }}
                                                className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 mb-4"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Use "{query}" as Customer
                                            </button>
                                        )}

                                        <div className="mt-2 border-t border-gray-100 pt-4">
                                            <p className="text-xs text-gray-400 mb-2">Or create full profile</p>
                                            <button
                                                onClick={() => setMode("create")}
                                                className="text-blue-600 font-bold text-sm hover:underline"
                                            >
                                                Create New Customer
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filtered.map(customer => (
                                            <button
                                                key={customer.id}
                                                onClick={() => {
                                                    onSelect(customer);
                                                    onClose();
                                                }}
                                                className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl flex items-center justify-between group transition-colors"
                                            >
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{customer.name}</p>
                                                    <p className="text-xs text-gray-500">{customer.phone}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 text-blue-600">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Creation Mode
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
                                <input
                                    type="text"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter full name"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                <input
                                    type="tel"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setMode("select")}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {loading ? "Creating..." : "Save Customer"}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
