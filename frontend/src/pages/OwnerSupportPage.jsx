import React, { useState, useEffect } from "react";
import SupportLayout from "../components/Support/SupportLayout";
import TicketList from "../components/Support/TicketList";
import CreateTicketModal from "../components/Support/CreateTicketModal";
import TicketDetailModal from "../components/Support/TicketDetailModal";
import { Plus, Search, Filter } from "lucide-react";
import { supportAPI } from "../api/apiService";
import { useAuth } from "../context/AuthContext";

export default function OwnerSupportPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("system"); // 'system' (my tickets) or 'staff' (staff tickets)
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, [activeTab]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await supportAPI.getAllTickets();
            // Filter based on tab
            const allTickets = res.data;

            // 'system' = Tickets where I am the creater (user=me)
            // 'staff' = Tickets where I am NOT the creater (user!=me) [Logic from backend: I see my staff's tickets]

            let filtered = [];
            if (activeTab === "system") {
                filtered = allTickets.filter(t => t.user.id === user.id);
            } else {
                filtered = allTickets.filter(t => t.user.id !== user.id);
            }
            setTickets(filtered);
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        } finally {
            setLoading(false);
        }
    };

    // Search filtering
    const displayTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toString().includes(searchQuery)
    );

    return (
        <SupportLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by subject or ticket ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-200/50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl outline-none transition-all text-sm font-medium"
                    />
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Ticket
                </button>
            </div>

            {/* List */}
            <TicketList
                tickets={displayTickets}
                loading={loading}
                onSelectTicket={setSelectedTicket}
            />

            {/* Modals */}
            <CreateTicketModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchTickets}
            />

            <TicketDetailModal
                ticket={selectedTicket}
                isOpen={!!selectedTicket}
                onClose={() => {
                    setSelectedTicket(null);
                    fetchTickets(); // Refresh on close to update status/messages
                }}
            />
        </SupportLayout>
    );
}
