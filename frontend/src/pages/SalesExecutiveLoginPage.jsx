import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Lock, CheckCircle, Globe, ShieldCheck, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import { authAPI } from "../api/apiService";
import { tokenManager } from "../utils/tokenManager";

export default function SalesExecutiveLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { companySettings } = useCompanySettings();
  const [step, setStep] = useState(2); // Start at Step 2: Phone number
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole] = useState("SALES_EXECUTIVE");
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const countries = [
    { code: "IN", name: "India", prefix: "+91", dialLength: 10 },
  ];
  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];

  useEffect(() => {
    console.log("DEBUG: SalesExecutiveLoginPage MOUNTED");
    // Clear any existing session to ensure a fresh login
    tokenManager.removeToken();
    localStorage.removeItem("user");
    return () => console.log("DEBUG: SalesExecutiveLoginPage UNMOUNTED");
  }, []);

  const handlePhoneSubmit = async () => {
    console.log("DEBUG: handlePhoneSubmit called");
    setError("");
    if (!phone || phone.length !== currentCountry.dialLength) {
      setError(`Please enter a valid ${currentCountry.dialLength}-digit ${currentCountry.name} phone number`);
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.lookupUser({ phone });
      console.log("DEBUG: lookupUser response", response.data);
      if (response.data.found) {
        setEmployeeName(response.data.found ? response.data.name : "");
        setStep(4);
      } else {
        setError("Phone number not registered.");
      }
    } catch (err) {
      console.error("DEBUG: lookupUser error", err);
      if (err.response && err.response.status === 404) {
        setError("Phone number not registered.");
      } else {
        console.error("Lookup Error:", err);
        setError("Error verifying phone number.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    console.log("DEBUG: handlePasswordSubmit called");
    setError("");
    if (!password) {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    try {
      console.log("DEBUG: calling authAPI.login");
      const response = await authAPI.login({ phone, password, role: "SALES_EXECUTIVE" });
      console.log("DEBUG: login response", response.data);

      // FORCE CLEAR OLD SESSION
      tokenManager.removeToken();
      localStorage.removeItem("user");

      if (response.data.token) {
        console.log("DEBUG: Setting token");
        tokenManager.setToken(response.data.token);
      }

      const backendUser = response.data.user;
      const hasRole = backendUser.roles?.some(r => r.name === "SALES_EXECUTIVE");
      if (!hasRole) {
        console.error("DEBUG: Role check failed. User roles:", backendUser.roles);
        throw new Error("Access Denied: You are not authorized as a SALES EXECUTIVE.");
      }

      const userData = {
        ...backendUser,
        role: "SALES_EXECUTIVE",
        is_super_admin: backendUser?.is_super_admin || false,
        name: backendUser?.first_name || backendUser?.name || 'User'
      };

      console.log("DEBUG: calling login() context");
      login(userData, response.data.token);
      console.log("DEBUG: navigating to /pos");
      navigate("/pos");

    } catch (err) {
      console.error("Login Error:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Login failed.";
      setError(errorMsg);
      setPassword(""); // Clear password on failure
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOTP = async () => {
    setError("");
    setSuccessMessage("");
    if (!phone || phone.length !== currentCountry.dialLength) {
      setError(`Please enter your registered ${currentCountry.dialLength}-digit phone number`);
      return;
    }

    setLoading(true);
    try {
      const resp = await authAPI.sendOTP(phone);
      console.log("DEBUG: sendOTP Response:", resp.data);
      // In DEBUG mode, backend might return OTP in detail or another field
      if (resp.data.otp) {
        console.log("DEBUG: Recieved OTP from server (Debug Mode):", resp.data.otp);
        alert(`Development Mode - OTP: ${resp.data.otp}`);
      }
      setSuccessMessage("OTP sent successfully to your phone.");
      setStep(6);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(err.response?.data?.detail || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    setError("");
    if (!otp || !newPassword) {
      setError("Please enter both OTP and your new password.");
      return;
    }

    setLoading(true);
    try {
      const resp = await authAPI.resetPassword({
        phone,
        otp,
        new_password: newPassword
      });
      console.log("DEBUG: resetPassword Response:", resp.data);
      setSuccessMessage("Password reset successful! Please login with your new password.");
      setStep(4); // Back to password step
      setOtp("");
      setNewPassword("");
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-inter bg-gray-50">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-purple-500 to-indigo-600 relative overflow-hidden text-white p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="w-32 h-32 mx-auto mb-6">
              <img
                src="/brand-logo.png"
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-wider font-outfit">GEO BILLING</h1>
            <p className="text-purple-100/80 text-lg">Sales & POS Portal</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Staff Login</h2>
            <p className="text-gray-500 text-sm">Access the Sales & Billing system.</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Sign In</h3>
                <p className="text-xs text-purple-500 font-medium">SALES EXECUTIVE</p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 min-w-[3rem]">
                    <span className="text-gray-500 font-medium text-sm">{currentCountry.prefix}</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-16 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <button
                onClick={handlePhoneSubmit}
                disabled={loading}
                className="w-full mt-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-md shadow-purple-500/20 disabled:bg-purple-400"
              >
                {loading ? "Checking..." : "Continue"}
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  {employeeName && <h3 className="text-lg font-bold text-green-700 mb-2">Hi, {employeeName}!</h3>}
                  <h3 className="text-sm font-semibold text-gray-900">Enter Password</h3>
                  <p className="text-xs text-gray-500">Phone: {phone}</p>
                </div>
                <button onClick={() => { setStep(2); setPassword(""); setError(""); setSuccessMessage(""); }} className="text-xs text-purple-600 font-medium">Edit</button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-gray-700">Password</label>
                  <button
                    onClick={() => { setStep(5); setError(""); setSuccessMessage(""); }}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <button
                onClick={handlePasswordSubmit}
                disabled={loading}
                className="w-full mt-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md transition-colors"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Reset Password</h3>
                <p className="text-xs text-gray-500">We'll send an OTP to your phone.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Registered Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 min-w-[3rem]">
                    <span className="text-gray-500 font-medium text-sm">{currentCountry.prefix}</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-16 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendResetOTP}
                  disabled={loading}
                  className="flex-[2] py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:bg-purple-400"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Verify OTP</h3>
                <p className="text-xs text-gray-500">Enter the OTP sent to {phone}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 text-center tracking-widest font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <button
                onClick={handleResetPasswordSubmit}
                disabled={loading}
                className="w-full mt-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md transition-colors"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
