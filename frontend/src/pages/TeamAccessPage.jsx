
import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Filter, Search, Plus, X, AlertCircle, Check, RefreshCw, Smartphone, Mail, Shield, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import { staffAPI, authAPI } from "../api/apiService";
import authAxios from "../api/authAxios";
import { Link } from "react-router-dom";

const MemberModal = ({ member, onClose, onSuccess, isLimitReached, limitMessage }) => {
    const isEditing = !!member;
    const [formData, setFormData] = useState({
        first_name: member?.first_name || '',
        last_name: member?.last_name || '',
        email: member?.email || member?.username || '',
        phone: member?.phone || '',
        password: '',
        role: member?.role || 'SALES_EXECUTIVE'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Show subscription prompt if limit is reached and we're not editing
    if (isLimitReached && !isEditing) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Subscription Required</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Upgrade Your Plan</h4>
                            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                                {limitMessage || "You've reached your staff limit. Please upgrade to add more team members."}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-2">
                            <Link
                                to="/owner/subscription-management"
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-center"
                            >
                                View Subscription Plans
                            </Link>
                            <button
                                onClick={onClose}
                                className="w-full py-3 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLimitReached && !isEditing) return;

        setLoading(true);
        setError('');

        try {
            if (isEditing) {
                // For editing, only send populated fields or changed fields
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // Don't send empty password

                await staffAPI.updateStaff(member.id, payload);
            } else {
                await staffAPI.createStaff({
                    ...formData,
                    username: formData.email, // Use email as username by default
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Staff creation failed:", err.response?.data);
            const detail = err.response?.data?.detail;
            const fieldErrors = err.response?.data;

            if (detail) {
                setError(detail);
            } else if (fieldErrors) {
                // Construct error message from field errors
                const messages = Object.entries(fieldErrors).map(([key, val]) => {
                    const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
                    const errorMsg = Array.isArray(val) ? val.join(', ') : val;
                    return `${fieldName}: ${errorMsg}`;
                }).join(' | ');
                setError(messages || 'Failed to create staff member');
            } else {
                setError(`Failed to ${isEditing ? 'update' : 'create'} staff member`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Team Member' : 'Add New Team Member'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${isLimitReached ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-red-50 text-red-600'}`}>
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">{error}</div>
                        </div>
                    )}

                    {isEditing && member.salesman_id && (
                        <div className="mb-4">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Employee ID</label>
                            <div className="px-5 py-3.5 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 border border-transparent mt-1">
                                {member.salesman_id}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="First Name"
                            value={formData.first_name}
                            onChange={v => setFormData({ ...formData, first_name: v })}
                            placeholder="e.g. John"
                            disabled={isLimitReached}
                        />
                        <InputField
                            label="Last Name"
                            value={formData.last_name}
                            onChange={v => setFormData({ ...formData, last_name: v })}
                            placeholder="Doe"
                            disabled={isLimitReached}
                        />
                    </div>

                    <InputField
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={v => setFormData({ ...formData, email: v })}
                        placeholder="john@example.com"
                        disabled={isLimitReached}
                    />

                    <InputField
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={v => setFormData({ ...formData, phone: v })}
                        placeholder="+91 98765 43210"
                        disabled={isLimitReached}
                    />

                    <InputField
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={v => setFormData({ ...formData, password: v })}
                        placeholder="Create a password"
                        disabled={isLimitReached && !isEditing}
                    />
                    {isEditing && <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                            {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Member')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const InputField = ({ label, value, onChange, type = "text", disabled, placeholder, className }) => (
    <div className={`space-y-2 ${className}`}>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{label}</label>
        <div className="relative group">
            <input
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none
          ${disabled
                        ? "bg-gray-100 dark:bg-slate-800/50 text-gray-400 border-transparent cursor-not-allowed"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-blue-300 dark:hover:border-slate-600"
                    }
        `}
            />
        </div>
    </div>
);

export default function TeamAccessPage() {
    const { user, userRole, login } = useAuth();
    const { addNotification } = useContext(NotificationContext);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    // Calculate Limit Status
    // Fallback to 0 if max_staff_allowed is missing (most restricted state)
    // We also treat '1' as '0' if the user is an owner with no subscription (paranoid check against stale cache)
    const rawMaxStaff = user?.max_staff_allowed;
    let maxStaff = (rawMaxStaff === undefined || rawMaxStaff === null) ? 0 : parseInt(rawMaxStaff);

    const activeStaffCount = staff.filter(s => s.is_active).length;

    // Check if limit is reached (handle 0 as a strict limit)
    const isLimitReached = maxStaff !== -1 && activeStaffCount >= maxStaff;

    let limitMessage = '';
    if (isLimitReached) {
        if (maxStaff === 0) {
            limitMessage = "You must subscribe to a plan to add team members.";
        } else {
            limitMessage = `You have reached the maximum number of staff members (${maxStaff}) allowed for your current plan. Please upgrade to add more staff.`;
        }
    }

    const fetchStaff = () => {
        setLoading(true);
        staffAPI.getAllStaff()
            .then(res => setStaff(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    // Refresh user data to ensure limits are up to date
    useEffect(() => {
        authAPI.getCurrentUser()
            .then(res => {
                if (res.data) login(res.data);
            })
            .catch(err => console.error("Failed to refresh user profile", err));
    }, []);

    useEffect(() => {
        fetchStaff();
    }, []);

    const toggleStatus = async (id, status) => {
        const newStatus = !status;
        setStaff(prev => prev.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
        await staffAPI.updateStaff(id, { is_active: newStatus });
    };

    const handleDeleteStaff = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await staffAPI.deleteStaff(id);
            addNotification("Staff member deleted successfully", "success");
            fetchStaff(); // Refresh the list
        } catch (err) {
            console.error("Failed to delete staff:", err);
            addNotification("Failed to delete staff member", "error");
        }
    };

    const handleAddMemberClick = () => {
        setEditingMember(null);
        setShowModal(true);
    };

    const handleEditMemberClick = (member) => {
        setEditingMember(member);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Team Management</h1>
                            <p className="text-gray-500 dark:text-blue-200/70 font-medium">Control access for your sales executives</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Active Staff Members</h3>
                        <button
                            onClick={handleAddMemberClick}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Member
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                            <p>Loading team members...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-slate-900/50 text-xs font-bold uppercase text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {staff.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p className="font-medium">No staff members found.</p>
                                                <p className="text-sm mt-1">Add your first sales executive to get started.</p>
                                            </td>
                                        </tr>
                                    ) : staff.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                                {user.salesman_id || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">{user.first_name} {user.last_name}</div>
                                                        <div className="text-xs text-gray-500">{user.email || user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1.5 w-fit">
                                                    <Shield className="w-3 h-3" />
                                                    Sales Executive
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(user.id, user.is_active)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${user.is_active
                                                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {user.is_active ? 'Active' : 'Disabled'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEditMemberClick(user)}
                                                        className="text-blue-600 font-bold text-sm hover:underline hover:text-blue-700"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStaff(user.id, `${user.first_name} ${user.last_name}`)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Staff"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {showModal && (
                        <MemberModal
                            member={editingMember}
                            onClose={() => setShowModal(false)}
                            onSuccess={fetchStaff}
                            isLimitReached={isLimitReached}
                            limitMessage={limitMessage}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
