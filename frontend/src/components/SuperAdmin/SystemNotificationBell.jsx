import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, ExternalLink, AlertCircle, Info, ShieldAlert } from "lucide-react";
import { superAdminAPI } from "../../api/apiService";
import { formatDistanceToNow } from "date-fns";

export default function SystemNotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await superAdminAPI.getNotifications({ is_read: false });
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await superAdminAPI.markNotificationRead(id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error("Error marking notification read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await superAdminAPI.markAllNotificationsRead();
            setNotifications([]);
            setIsOpen(false);
        } catch (error) {
            console.error("Error marking all read", error);
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case "CRITICAL": return <ShieldAlert className="w-4 h-4 text-red-500" />;
            case "WARNING": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border-2 border-white dark:border-slate-900">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Alerts</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 p-1 uppercase tracking-wider"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {unreadCount === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">No new alerts</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition relative group">
                                        <div className="flex gap-3">
                                            <div className="mt-1">{getSeverityIcon(n.severity)}</div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{n.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{n.message}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                    </span>
                                                    <button
                                                        onClick={() => handleMarkRead(n.id)}
                                                        className="p-1 text-slate-400 hover:text-green-500 transition opacity-0 group-hover:opacity-100"
                                                        title="Dismiss"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <button className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition uppercase tracking-widest">
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
