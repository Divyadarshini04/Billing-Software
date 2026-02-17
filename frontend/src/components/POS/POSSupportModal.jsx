import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Search } from "lucide-react";
import { supportAPI } from "../../api/apiService"; // Adjust import path as needed
import { useAuth } from "../../context/AuthContext"; // Adjust import path as needed
import TicketList from "../Support/TicketList";
import CreateTicketModal from "../Support/CreateTicketModal";
import TicketDetailModal from "../Support/TicketDetailModal";

export default function POSSupportModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Sub-modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ticketsRes, notifRes] = await Promise.all([
                supportAPI.getAllTickets(),
                supportAPI.getNotifications()
            ]);

            // Backend handles visibility permissions
            setTickets(ticketsRes.data);

            // Calculate unread tickets based on notifications
            const counts = {};
            if (notifRes.data && Array.isArray(notifRes.data)) {
                notifRes.data.forEach(n => {
                    if (!n.is_read && n.ticket) {
                        counts[n.ticket] = (counts[n.ticket] || 0) + 1;
                    }
                });
            }
            setUnreadCounts(counts);

        } catch (err) {
            console.error("Failed to fetch support data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;

        try {
            await supportAPI.deleteTicket(ticketId);
            fetchData(); // Refresh list
        } catch (err) {
            console.error("Failed to delete ticket", err);
            alert("Failed to delete ticket");
        }
    };

    const displayTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toString().includes(searchQuery)
    );

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Support Center</h2>
                        <p className="text-gray-500 text-sm">Raise tickets for system issues or assistance</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-8 py-4 bg-gray-50/50 flex items-center gap-4 border-b border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search your tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Ticket
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <TicketList
                        tickets={displayTickets}
                        loading={loading}
                        onSelectTicket={setSelectedTicket}
                        onDeleteTicket={handleDeleteTicket}
                        unreadCounts={unreadCounts}
                    />
                </div>

                {/* Nested Modals */}
                <CreateTicketModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSuccess={fetchData}
                />

                <TicketDetailModal
                    ticket={selectedTicket}
                    isOpen={!!selectedTicket}
                    onClose={() => {
                        setSelectedTicket(null);
                        fetchData();
                    }}
                />
            </div>
        </div>,
        document.body
    );
}
