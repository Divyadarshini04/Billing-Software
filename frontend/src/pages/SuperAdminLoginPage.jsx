import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Lock, CheckCircle, Globe, ShieldCheck, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import { authAPI } from "../api/apiService";
import { tokenManager } from "../utils/tokenManager";

export default function SuperAdminLoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { companySettings } = useCompanySettings();
    const [step, setStep] = useState(1); // 1: Role, 2: Phone, 3: OTP (Reset), 4: Password (Login)
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("IN");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isResetMode, setIsResetMode] = useState(false);

    const roles = [
        {
            id: "SUPERADMIN",
            name: "SUPER ADMIN",
            color: "from-purple-600 to-indigo-600",
            icon: <Lock className="w-8 h-8" />,
        }
    ];

    const currentRole = roles[0];
    const currentCountry = { code: "IN", name: "India", prefix: "+91", dialLength: 10 };

    const handleRoleSubmit = () => {
        if (!selectedRole) {
            setError("Please confirm the role to continue");
            return;
        }
        setError("");
        setStep(2);
    };

    const handlePhoneSubmit = async () => {
        setError("");
        if (!phone || phone.length !== currentCountry.dialLength) {
            setError(`Please enter a valid ${currentCountry.dialLength}-digit ${currentCountry.name} phone number`);
            return;
        }

        if (isResetMode) {
            // Send OTP for Reset
            setLoading(true);
            try {
                await authAPI.sendOTP(phone);
                setSuccessMessage("OTP sent successfully to your phone.");
                setStep(3); // Go to OTP step
            } catch (err) {
                setError(err.response?.data?.detail || "Failed to send OTP.");
            } finally {
                setLoading(false);
            }
        } else {
            // Normal Login Flow
            setStep(4);
        }
    };

    const handlePasswordSubmit = async () => {
        setError("");
        if (!password) {
            setError("Please enter a password");
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.login({ phone, password, role: "SUPERADMIN" });

            if (response.data.token) {
                tokenManager.setToken(response.data.token);
            }

            const backendUser = response.data.user;

            if (!backendUser.is_super_admin && !backendUser.roles?.some(r => r.name === "SUPERADMIN")) {
                throw new Error("Access Denied: You do not have Super Admin privileges.");
            }

            const userData = {
                ...backendUser,
                role: "SUPERADMIN",
                is_super_admin: true,
                name: backendUser?.first_name || backendUser?.name || 'Super Admin'
            };

            login(userData);
            navigate("/super-admin");

        } catch (err) {
            console.error("Login Error:", err);
            const errorMsg = err.response?.data?.detail ||
                err.message ||
                "Login failed. Please check your credentials.";
            setError(errorMsg);
            setPassword("");
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async () => {
        setError("");
        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword({
                phone,
                otp,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            setSuccessMessage("Password reset successfully! Please login with your new password.");
            setIsResetMode(false);
            setPassword("");
            setStep(4); // Go to login password step
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    const startForgotFlow = () => {
        setIsResetMode(true);
        setStep(2); // Go back to phone input context but in reset mode
        setPhone("");
        setError("");
        setSuccessMessage("");
    };

    const cancelForgotFlow = () => {
        setIsResetMode(false);
        setStep(4); // Back to password login (assuming we have phone) or step 2
        // Actually if they cancel from phone input (step 2), we go to step 2 normal mode?
        // But cancel button is only shown in step 2 if isResetMode is true.
        // If they are in step 4 (password) and click forgot, they go to step 2 (phone) with reset mode.
        // If they cancel there, they should go back to step 4.
        setStep(4);
        setError("");
        setSuccessMessage("");
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-inter bg-gray-50">
            {/* Left Panel */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden text-white p-12">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-400 rounded-full mix-blend-overlay blur-3xl"></div>
                </div>

                <div className="z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                            <img
                                src="/brand-logo.png"
                                alt="Logo"
                                className="w-full h-full object-contain filter drop-shadow-lg"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/150?text=Logo";
                                }}
                            />
                        </div>
                        <h1 className="text-4xl font-bold mb-2 tracking-wider font-outfit">GEO BILLING</h1>
                        <p className="text-blue-100/80 text-lg">Smart Billing Solutions for Modern Business</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="grid grid-cols-3 gap-8 mt-12 opacity-60"
                    >
                        <div className="flex flex-col items-center">
                            <Globe className="w-8 h-8 mb-2" />
                            <span className="text-xs uppercase tracking-wider">Global</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <ShieldCheck className="w-8 h-8 mb-2" />
                            <span className="text-xs uppercase tracking-wider">Secure</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <CheckCircle className="w-8 h-8 mb-2" />
                            <span className="text-xs uppercase tracking-wider">Reliable</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    {/* Public Header */}
                    <div className="text-center mb-8 lg:hidden">
                        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <img src="/brand-logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 font-outfit tracking-wide">GREENHEAP</h1>
                        <p className="text-blue-500 text-xs font-semibold tracking-wider mt-1 uppercase">Super Admin Portal</p>
                    </div>

                    <div className="mb-8 hidden lg:block">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {isResetMode ? "Reset Password" : "System Login"}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {isResetMode ? "Verify your identity to reset password." : "Restricted access. Authorized personnel only."}
                        </p>
                    </div>

                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Select Role</p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setSelectedRole("SUPERADMIN")}
                                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center group ${selectedRole === "SUPERADMIN"
                                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                                        : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className={`p-2 rounded-md mr-3 ${selectedRole === "SUPERADMIN" ? "bg-blue-100 text-blue-500" : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"}`}>
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-semibold text-sm ${selectedRole === "SUPERADMIN" ? "text-blue-800" : "text-gray-700"}`}>
                                            SUPER ADMIN
                                        </h3>
                                    </div>
                                    {selectedRole === "SUPERADMIN" && <CheckCircle className="w-5 h-5 text-blue-500" />}
                                </button>
                            </div>
                            {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
                            <button onClick={handleRoleSubmit} className="w-full mt-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm shadow-md">
                                Continue
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Phone Input (Used for both Login and Reset) */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">{isResetMode ? "Identify Account" : "Login"}</h3>
                                    <p className="text-xs text-blue-500 font-medium">SUPER ADMIN</p>
                                </div>
                                <button onClick={() => { setStep(1); setPhone(""); setError(""); setIsResetMode(false); }} className="text-xs text-gray-400 hover:text-gray-600">
                                    Change Role
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 min-w-[3rem]">
                                        <span className="text-gray-500 font-medium text-sm">{currentCountry.prefix}</span>
                                        <div className="h-4 w-px bg-gray-300"></div>
                                    </div>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                        placeholder="Admin Phone"
                                        className="w-full pl-16 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
                            <button onClick={handlePhoneSubmit} disabled={loading} className="w-full mt-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md transition-colors">
                                {loading ? "Processing..." : (isResetMode ? "Send OTP" : "Continue")}
                            </button>
                            {isResetMode && (
                                <button onClick={cancelForgotFlow} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: OTP & New Password (Reset Mode Only) */}
                    {step === 3 && isResetMode && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="mb-6 pb-4 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900">Reset Password</h3>
                                <p className="text-xs text-gray-500">OTP Sent to {phone}</p>
                            </div>

                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> {successMessage}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Enter OTP</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="6-digit OTP"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Min 6 chars"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

                            <button onClick={handleResetSubmit} disabled={loading} className="w-full mt-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md transition-colors">
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                            <button onClick={() => setStep(2)} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">Back</button>
                        </motion.div>
                    )}


                    {/* Step 4: Password (Login Mode Only) */}
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Enter Password</h3>
                                    <p className="text-xs text-gray-500">For {phone}</p>
                                </div>
                                <button onClick={() => { setStep(2); setPassword(""); setError(""); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                    Change
                                </button>
                            </div>

                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> {successMessage}
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <label className="text-xs font-medium text-gray-700">Password</label>
                                    <button onClick={startForgotFlow} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="System Password"
                                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => { setStep(2); setPassword(""); setError(""); }} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm transition-colors">
                                    Back
                                </button>
                                <button onClick={handlePasswordSubmit} disabled={loading} className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md transition-colors">
                                    {loading ? "Verifying..." : "Access System"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
