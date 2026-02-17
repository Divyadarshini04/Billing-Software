import React, { useState, useEffect, useRef } from "react";
import { X, Send, User, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { supportAPI } from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";

export default function TicketDetailModal({ ticket: initialTicket, isOpen, onClose }) {
    const { user } = useAuth();
    const [ticket, setTicket] = useState(initialTicket);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && initialTicket?.id) {
            loadTicketDetails(initialTicket.id);
        }
    }, [isOpen, initialTicket]);

    const loadTicketDetails = async (id) => {
        setLoading(true);
        try {
            const res = await supportAPI.getTicket(id);
            setTicket(res.data);
            // Mark all notifications for this ticket as read
            await supportAPI.markTicketRead(id);
        } catch (err) {
            console.error("Failed to load ticket details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            const res = await supportAPI.replyToTicket(ticket.id, { message });
            setMessage("");
            // Optimistically update or reload
            // Ideally append to list, but reloading for safety for now or update local state
            loadTicketDetails(ticket.id);
        } catch (err) {
            console.error("Failed to send message", err);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleEscalate = async () => {
        if (!window.confirm("Are you sure you want to escalate this ticket to Super Admin?")) return;
        try {
            await supportAPI.escalateTicket(ticket.id);
            loadTicketDetails(ticket.id); // Refresh to see status change
        } catch (err) {
            console.error("Escalation failed", err);
            alert("Failed to escalate ticket");
        }
    };

    const handleResolve = async () => {
        if (!window.confirm("Mark this ticket as resolved?")) return;
        try {
            await supportAPI.updateStatus(ticket.id, { status: 'resolved' });
            loadTicketDetails(ticket.id);
        } catch (err) {
            console.error("Resolve failed", err);
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

    if (!isOpen || !ticket) return null;

    const isOwner = user?.role === 'OWNER';
    // Can escalate if Owner AND ticket is from Staff AND not already escalated
    const canEscalate = isOwner && ticket.level === 'owner' && ticket.user.id !== user.id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${ticket.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                            <span className="text-gray-400 text-xs font-mono">#{ticket.id}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{ticket.subject}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Chat/Thread */}
                    <div className="flex-1 flex flex-col border-r border-gray-100 bg-gray-50/50">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Original Description */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="space-y-1 max-w-[85%]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">{ticket.user?.username || "User"}</span>
                                        <span className="text-[10px] text-gray-400">{formatDate(ticket.created_at)}</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                        {ticket.description}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            {ticket.messages && ticket.messages.map(msg => {
                                const senderId = typeof msg.sender === 'object' ? msg.sender.id : msg.sender;
                                const isMe = senderId === user.id;
                                return (
                                    <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-indigo-100' : 'bg-gray-200'}`}>
                                            <User className={`w-4 h-4 ${isMe ? 'text-indigo-600' : 'text-gray-500'}`} />
                                        </div>
                                        <div className={`space-y-1 max-w-[85%] ${isMe ? 'items-end flex flex-col' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-900">{msg.sender_name || 'User'}</span>
                                                <span className="text-[10px] text-gray-400">{formatDate(msg.created_at)}</span>
                                            </div>
                                            <div className={`p-3 rounded-2xl shadow-sm border text-sm leading-relaxed whitespace-pre-wrap ${isMe
                                                ? 'bg-indigo-600 text-white border-indigo-600 rounded-tr-none'
                                                : 'bg-white text-gray-700 border-gray-100 rounded-tl-none'
                                                }`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Box */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a reply..."
                                    rows="1"
                                    className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none custom-scrollbar"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || sending}
                                    className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Sidebar Actions */}
                    <div className="w-72 bg-white flex flex-col p-6 border-l border-gray-100 space-y-6">

                        {/* Status Actions */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</h4>

                            {ticket.status !== 'resolved' && (
                                <button
                                    onClick={handleResolve}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-colors text-sm"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark as Resolved
                                </button>
                            )}

                            {canEscalate && (
                                <button
                                    onClick={handleEscalate}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition-colors text-sm"
                                >
                                    <ShieldAlert className="w-4 h-4" />
                                    Escalate to Super Admin
                                </button>
                            )}
                        </div>

                        {/* Info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Details</h4>

                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Category</span>
                                <span className="font-medium text-sm text-gray-800 bg-gray-50 px-2 py-1 rounded inline-block">
                                    {ticket.category}
                                </span>
                            </div>

                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Priority</span>
                                <span className={`font-medium text-sm px-2 py-1 rounded inline-block capitalize ${ticket.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-800'
                                    }`}>
                                    {ticket.priority}
                                </span>
                            </div>

                            {ticket.level === 'super_admin' && (
                                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                    <div className="flex items-center gap-2 text-purple-700 font-bold text-xs mb-1">
                                        <ShieldAlert className="w-3 h-3" />
                                        Escalated
                                    </div>
                                    <p className="text-[10px] text-purple-600 leading-tight">
                                        This ticket is currently escalated to Super Admin level.
                                    </p>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
