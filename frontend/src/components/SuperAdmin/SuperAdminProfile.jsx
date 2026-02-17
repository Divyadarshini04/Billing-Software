import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Mail, Phone, Shield, Moon, Sun, Monitor,
    Edit2, Lock, Clock, Calendar, Hash, Layers,
    Camera, Check, X, LogOut, Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import authAxios from "../../api/authAxios";
import { toast } from "react-hot-toast";

export default function SuperAdminProfile() {
    const { user, refreshProfile } = useAuth();
    const { theme, setTheme } = useTheme();

    React.useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
        phone: user?.phone || "",
    });

    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [profilePicture, setProfilePicture] = useState(null);

    React.useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                phone: user.phone || ""
            });
        }
    }, [user]);

    const themeOptions = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'system', icon: Monitor, label: 'System' }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('first_name', profileData.first_name);
            formData.append('last_name', profileData.last_name);
            formData.append('email', profileData.email);
            formData.append('phone', profileData.phone);
            if (profilePicture) {
                formData.append('profile_picture', profilePicture);
            }

            const response = await authAxios.patch('/api/auth/profile/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Refresh user in context if needed - assuming login(token, userData)
            // But usually, we might just need to update the local state or trigger a re-fetch
            await refreshProfile();
            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData) {
                // If the error is a dict of field errors, join them
                const messages = Object.entries(errorData)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join(' | ');
                toast.error(messages || "Failed to update profile");
            } else {
                toast.error("Failed to update profile: Network error or server crashed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await authAxios.post('/api/auth/profile/change-password/', passwordData);
            toast.success("Password changed successfully");
            setIsChangingPassword(false);
            setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your administrative identity and security</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg shadow-slate-900/10 dark:shadow-white/5 transition-all active:scale-95 border border-slate-900 dark:border-white"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Identity Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-xl"
                    >
                        <div className="h-20 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700" />
                        <div className="px-8 pb-8 -mt-8">
                            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-900 p-1 shadow-2xl">
                                        <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                            {user?.profile_picture ? (
                                                <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                                            )}
                                        </div>
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-2 right-2 p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg shadow-lg cursor-pointer hover:scale-110 transition-transform border border-slate-800 dark:border-slate-200">
                                            <Camera className="w-4 h-4" />
                                            <input type="file" className="hidden" onChange={(e) => setProfilePicture(e.target.files[0])} />
                                        </label>
                                    )}
                                </div>
                                <div className="space-y-1 py-1">
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                                        {user?.first_name} {user?.last_name}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-600">
                                            Super Admin
                                        </span>
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-600">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.form
                                        key="edit-form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleProfileUpdate}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                            <input
                                                type="text"
                                                value={profileData.first_name}
                                                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                value={profileData.last_name}
                                                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg shadow-slate-900/10 flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                Save Changes
                                            </button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="view-grid"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                    >
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                                            <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                                                    <Phone className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="text-lg font-medium">{user?.phone || "Not Set"}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                                            <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                                                    <Mail className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="text-lg font-medium">{user?.email || "Not Set"}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Account Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Details</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                        <Hash className="w-4 h-4" />
                                        <span>Super Admin ID</span>
                                    </div>
                                    <span className="font-mono text-slate-900 dark:text-white font-bold">SA-{user?.id?.toString().padStart(4, '0')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        <span>Created On</span>
                                    </div>
                                    <span className="text-slate-900 dark:text-white font-bold">{formatDate(user?.date_joined)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span>System Version</span>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">v2.4.0 (Stable)</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Activity Log</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700/50">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">Current Session Start</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{formatDate(new Date().toISOString())}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700/50">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">Last Successful Login</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{formatDate(user?.last_login)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">Login Method</span>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">Phone + Password</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Column: Security & Settings */}
                <div className="space-y-8">
                    {/* Security Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-lg relative overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h3>
                        </div>

                        <div className="space-y-4">
                            {!isChangingPassword ? (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-slate-400 group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                        <span className="font-bold text-slate-700 dark:text-slate-200">Change Password</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-900 dark:group-hover:bg-white" />
                                </button>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                    onSubmit={handleChangePassword}
                                >
                                    <input
                                        type="password"
                                        placeholder="Current Password"
                                        required
                                        value={passwordData.old_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                                    />
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        required
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        required
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsChangingPassword(false)}
                                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/10 dark:shadow-white/5 disabled:opacity-50"
                                        >
                                            {loading ? "Updating..." : "Update"}
                                        </button>
                                    </div>
                                </motion.form>
                            )}

                            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Login Security</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Two-Factor Auth</span>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-tighter">Enabled</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Display Settings Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-lg">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Display Settings</h3>
                        <div className="space-y-3">
                            {themeOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setTheme(opt.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${theme === opt.id
                                        ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/10"
                                        : "bg-gray-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 font-semibold">
                                        <opt.icon className={`w-5 h-5 ${theme === opt.id ? "text-white dark:text-slate-900" : "text-slate-400 dark:text-slate-500"}`} />
                                        <span>{opt.label}</span>
                                    </div>
                                    {theme === opt.id && (
                                        <motion.div layoutId="active-theme-v2" className="w-2 h-2 rounded-full bg-white dark:bg-slate-900 shadow-lg" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
