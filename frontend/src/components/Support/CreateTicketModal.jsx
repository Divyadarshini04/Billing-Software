import React, { useState } from "react";
import { X, Send } from "lucide-react";
import { supportAPI } from "../../api/apiService"; // Correct Import Path

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        category: "General",
        priority: "medium",
        description: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await supportAPI.createTicket(formData);
            onSuccess();
            onClose();
            setFormData({ subject: "", category: "General", priority: "medium", description: "" });
        } catch (err) {
            console.error("Failed to create ticket", err);
            alert("Failed to create ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">New Support Ticket</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                        <input
                            type="text"
                            required
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-200 transition-all font-medium"
                            placeholder="e.g. Cannot access reports..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-200 transition-all font-medium appearance-none"
                            >
                                <option value="General">General Inquiry</option>
                                <option value="Technical">Technical Issue</option>
                                <option value="Billing">Billing & Subscription</option>
                                <option value="Feature Request">Feature Request</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-200 transition-all font-medium appearance-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea
                            required
                            rows="4"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-200 transition-all resize-none"
                            placeholder="Describe your issue in detail..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Submitting..." : (
                                <>
                                    <span>Submit Ticket</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
