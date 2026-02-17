import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Lock, CheckCircle, Globe, ShieldCheck, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import { authAPI } from "../api/apiService";
import { tokenManager } from "../utils/tokenManager";

export default function OwnerLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { companySettings } = useCompanySettings();
  const [step, setStep] = useState(2); // Start at Step 2: Phone number for Owner
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [selectedRole] = useState("OWNER");
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const countries = [
    { code: "IN", name: "India", prefix: "+91", dialLength: 10 },
    // ... add others if needed
  ];
  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];

  const handlePhoneSubmit = async () => {
    setError("");
    if (!phone || phone.length !== currentCountry.dialLength) {
      setError(`Please enter a valid ${currentCountry.dialLength}-digit ${currentCountry.name} phone number`);
      return;
    }

    setLoading(true);
    try {
      // 1. Lookup user to get name
      const lookupResponse = await authAPI.lookupUser({ phone });
      if (lookupResponse.data.found) {
        setOwnerName(lookupResponse.data.name);
      } else {
        setError("Phone number not registered.");
        setLoading(false);
        return;
      }

      // 2. Send OTP
      const response = await authAPI.sendOTP(phone);
      if (response.data.otp) {
        console.log(`Development Mode - OTP: ${response.data.otp}`);
        alert(`Development Mode - OTP: ${response.data.otp}`);
      }
      setStep(3); // Go to OTP Step
    } catch (err) {
      console.error("DEBUG: OTP Error", err);
      let errorMsg = err.response?.data?.detail || "Failed to send OTP.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    setError("");
    if (!otp.match(/^[0-9]{6}$/)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phone, otp, "OWNER");

      // FORCE CLEAR OLD SESSION
      tokenManager.removeToken();
      localStorage.removeItem("user");

      if (response.data.token) {
        tokenManager.setToken(response.data.token);
      }

      const backendUser = response.data.user;
      const hasRole = backendUser.roles?.some(r => r.name === "OWNER");
      if (!hasRole) {
        throw new Error("Access Denied: You are not authorized as an OWNER.");
      }

      const userData = {
        ...backendUser,
        role: "OWNER",
        is_super_admin: backendUser?.is_super_admin || false,
        name: backendUser?.name || 'User'
      };

      login(userData, response.data.token);
      navigate("/owner/dashboard");

    } catch (err) {
      console.error("DEBUG: Login Error:", err);
      const errorMsg = err.response?.data?.detail || "OTP verification failed.";
      setError(errorMsg);
      setOtp(""); // Clear OTP on failure to allow re-entry
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    setResendCooldown(30);

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const response = await authAPI.sendOTP(phone);
      if (response.data.otp) {
        console.log(`Development Mode - OTP (Resend): ${response.data.otp}`);
        alert(`Development Mode - OTP (Resend): ${response.data.otp}`);
      }
    } catch (err) {
      clearInterval(interval);
      setResendCooldown(0);
      let errorMsg = err.response?.data?.detail || "Failed to resend OTP.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-inter bg-gray-50">
      {/* Left Panel - Branding */}
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
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col items-center justify-start lg:justify-center p-0 lg:p-12 bg-gray-50 lg:bg-transparent">

        {/* Mobile Branding Header */}
        <div className="lg:hidden w-full bg-blue-600 py-10 rounded-b-[2rem] shadow-xl mb-6 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full p-3 shadow-lg mb-3">
            <img
              src="/brand-logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Logo"; }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider font-outfit">GEO BILLING</h1>
          <p className="text-blue-100 text-xs font-medium uppercase tracking-widest mt-1">Owner Portal</p>
        </div>

        <div className="w-full max-w-md bg-white rounded-xl shadow-none lg:shadow-lg border-x-0 border-y lg:border border-gray-100 lg:border-gray-200 p-8 mx-4 lg:mx-0">
          <div className="mb-8 hidden lg:block">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Owner Login</h2>
            <p className="text-gray-500 text-sm">Access your business dashboard.</p>
          </div>

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Sign In</h3>
                <p className="text-xs text-blue-500 font-medium">OWNER PORTAL</p>
              </div>

              <div className="space-y-4">
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
                      placeholder="0000000000"
                      className="w-full pl-16 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <button
                onClick={handlePhoneSubmit}
                disabled={loading}
                className="w-full mt-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Continue"}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  {ownerName && <h3 className="text-lg font-bold text-blue-700 mb-2">Hi, {ownerName}!</h3>}
                  <h3 className="text-sm font-semibold text-gray-900">Verify OTP</h3>
                  <p className="text-xs text-gray-500">Sent to {phone}</p>
                </div>
                <button onClick={() => { setStep(2); setOtp(""); setError(""); setOwnerName(""); }} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="— — — — — —"
                  className="w-full py-3 text-center border border-gray-300 rounded-lg text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <button
                onClick={handleOTPSubmit}
                disabled={loading}
                className="w-full mt-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className="text-xs text-blue-500 font-medium disabled:text-gray-400"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
