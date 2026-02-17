import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Phone, Mail, Calendar, CheckCircle, Clock, XCircle, MoreVertical, RefreshCw } from 'lucide-react';
import { leadsAPI } from '../../api/apiService';
import { toast } from 'react-hot-toast';

const LeadsManagementPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedLead, setSelectedLead] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await leadsAPI.getAllRequests();
            setLeads(response.data);
        } catch (error) {
            console.error("Error fetching leads:", error);
            toast.error("Failed to load leads");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedLead) return;
        try {
            await leadsAPI.updateRequestStatus(selectedLead.id, newStatus);
            toast.success("Lead status updated");
            fetchLeads(); // Refresh list
            setIsStatusModalOpen(false);
            setSelectedLead(null);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'NEW': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
            case 'CONTACTED': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
            case 'SCHEDULED': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
            case 'CONVERTED': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
            case 'CLOSED': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
            default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm);

        const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track and manage demo requests</p>
                </div>
                <button
                    onClick={fetchLeads}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                >
                    <RefreshCw size={20} className="text-gray-600 dark:text-slate-400" />
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center transition-all bg-opacity-50 backdrop-blur-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by business, person, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all text-sm appearance-none cursor-pointer pr-10"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                    >
                        <option value="ALL">All Status</option>
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Business</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Info</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500 dark:text-slate-400 italic">Loading leads...</td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500 dark:text-slate-400 italic">No leads found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all border-l-4 border-transparent hover:border-slate-900 dark:hover:border-white">
                                        <td className="p-5">
                                            <div className="font-bold text-slate-900 dark:text-white mb-0.5">{lead.business_name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{lead.contact_person}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                                <Phone size={12} className="text-slate-400" /> {lead.phone}
                                            </div>
                                            {lead.email && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                                    <Mail size={12} className="text-slate-400" /> {lead.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-sm">
                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                {lead.business_type}
                                            </span>
                                        </td>
                                        <td className="p-5 text-sm">
                                            <div className="text-slate-900 dark:text-white font-bold">{new Date(lead.created_at).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedLead(lead);
                                                    setIsStatusModalOpen(true);
                                                }}
                                                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-white text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Modal */}
            {isStatusModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-700"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Update Status</h2>
                        <div className="mb-6 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedLead.business_name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">{selectedLead.contact_person}</p>
                            {selectedLead.message && (
                                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 italic">
                                    "{selectedLead.message}"
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 mb-8">
                            {['NEW', 'CONTACTED', 'SCHEDULED', 'CONVERTED', 'CLOSED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(status)}
                                    className={`p-4 rounded-xl text-left text-[10px] font-black uppercase tracking-[0.15em] transition-all flex justify-between items-center ${selectedLead.status === status
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-[1.02]'
                                        : 'bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                                        }`}
                                >
                                    {status}
                                    {selectedLead.status === status && <CheckCircle size={14} />}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsStatusModalOpen(false)}
                            className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default LeadsManagementPage;
