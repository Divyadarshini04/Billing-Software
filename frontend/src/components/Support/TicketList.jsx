import React from "react";
import { Clock, CheckCircle, AlertCircle, ChevronRight, User, Trash2 } from "lucide-react";

export default function TicketList({ tickets, onSelectTicket, loading, unreadTicketIds = new Set(), onDeleteTicket }) {
    if (loading) {
        return (
            <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No tickets found</h3>
                <p className="text-gray-400">Try adjusting your search or create a new ticket.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-50';
            case 'medium': return 'text-orange-500 bg-orange-50';
            default: return 'text-green-500 bg-green-50';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    return (
        <div className="divide-y divide-gray-100">
            {tickets.map(ticket => {
                const isUnread = unreadTicketIds.has(ticket.id);

                return (
                    <div
                        key={ticket.id}
                        onClick={() => onSelectTicket(ticket)}
                        className={`p-6 cursor-pointer transition-colors group flex items-start gap-4 ${isUnread ? 'bg-blue-50/50' : 'hover:bg-blue-50/50'}`}
                    >
                        {/* Icon based on status */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1
                            ${ticket.status === 'resolved' ? 'bg-green-100' : 'bg-gray-100'}
                        `}>
                            {ticket.status === 'resolved' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <Clock className="w-5 h-5 text-gray-500" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={`truncate transition-colors flex items-center gap-2 ${isUnread
                                    ? 'font-black text-gray-900 group-hover:text-blue-700'
                                    : 'font-semibold text-gray-700 group-hover:text-blue-600'
                                    }`}>
                                    {ticket.subject}
                                    {isUnread && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full uppercase font-extrabold tracking-wider">
                                            New Message
                                        </span>
                                    )}
                                </h3>
                                <span className={`text-xs font-medium whitespace-nowrap ml-4 ${isUnread ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                    {formatDate(ticket.updated_at)}
                                </span>
                            </div>

                            <p className={`text-sm line-clamp-1 mb-3 ${isUnread ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                                {ticket.messages && ticket.messages.length > 0
                                    ? <span className="text-gray-700"><span className="font-semibold text-gray-900">{ticket.messages[ticket.messages.length - 1].sender_name}:</span> {ticket.messages[ticket.messages.length - 1].message}</span>
                                    : ticket.description
                                }
                            </p>

                            <div className="flex items-center gap-3 text-xs">
                                <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                                <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority} Priority
                                </span>

                                <div className="flex items-center gap-1.5 text-gray-400 font-medium ml-auto">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                    ID: #{ticket.id}
                                </div>

                                {ticket.user_details && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 ml-2">
                                        <User className="w-3 h-3 text-gray-400" />
                                        <span className="text-gray-600 font-bold capitalize">
                                            {ticket.user_details.first_name || 'Staff'} {ticket.user_details.last_name}
                                            <span className="text-gray-400 font-normal ml-1">
                                                ({ticket.user_details.salesman_id || ticket.user_details.phone || 'No ID'})
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="self-center pl-2 flex items-center gap-3">
                            {isUnread && <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse shadow-lg shadow-blue-300"></div>}

                            {/* Delete Button */}
                            {onDeleteTicket && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTicket(ticket.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="Delete Ticket"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}

                            <ChevronRight className={`w-5 h-5 group-hover:text-blue-400 ${isUnread ? 'text-blue-600' : 'text-gray-300'}`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
