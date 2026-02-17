import React, { useContext } from "react";
import { CheckCheck, Trash2, Bell, Filter, X } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";

export default function NotificationPage() {
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications
    } = useContext(NotificationContext);

    const getIcon = (type) => {
        switch (type) {
            case "sale": return "🛍️";
            case "product": return "📦";
            case "transit": return "🚚";
            case "alert": return "⚠️";
            case "success": return "✅";
            default: return "📢";
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case "alert": return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30";
            case "success": return "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30";
            default: return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
        }
    }

    const formatTime = (isoString) => {
        if (!isoString) return 'Just now';
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: true
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-600" />
                        Notifications
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        View and manage all your system alerts and updates
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllAsRead}
                        disabled={notifications.length === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900/20 dark:text-blue-400"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark all read
                    </button>
                    <button
                        onClick={clearAllNotifications}
                        disabled={notifications.length === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/20 dark:text-red-400"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear all
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No notifications yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            When you receive alerts, they will appear here.
                        </p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`group relative p-6 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${getBgColor(notif.type)} ${!notif.read ? 'ring-2 ring-blue-500/20' : 'opacity-80'}`}
                        >
                            <div className="flex gap-4">
                                <span className="text-3xl flex-shrink-0">
                                    {getIcon(notif.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className={`text-lg font-semibold ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {notif.title}
                                                {!notif.read && (
                                                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        New
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mt-1 text-base leading-relaxed">
                                                {typeof notif.message === 'string' ? notif.message : JSON.stringify(notif.message)}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                                            {formatTime(notif.timestamp)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearNotification(notif.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Dismiss"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Timestamp */}
                            <div className="sm:hidden mt-3 text-xs text-gray-400">
                                {formatTime(notif.timestamp)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
