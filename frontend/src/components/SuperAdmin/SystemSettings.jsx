import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, AlertCircle, Loader, Settings } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import authAxios from "../../api/authAxios";

export default function SystemSettings() {
  const { addNotification } = useContext(NotificationContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get('/api/super-admin/settings-api/');
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      setSettings(data);
    } catch (error) {

      addNotification('Failed to load settings', 'error');
      setMessageType('error');
      setMessage('Failed to load settings: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      // Sanitize payload: Ensure numeric fields are not empty strings
      const payload = {
        ...settings,
        default_trial_days: settings.default_trial_days === '' ? 0 : settings.default_trial_days,
        grace_period_days: settings.grace_period_days === '' ? 0 : settings.grace_period_days,
        gst_percentage: settings.gst_percentage === '' ? 0 : settings.gst_percentage,
        tax_percentage: settings.tax_percentage === '' ? 0 : settings.tax_percentage,
        invoice_starting_number: settings.invoice_starting_number === '' ? 1001 : settings.invoice_starting_number,
        password_min_length: settings.password_min_length === '' ? 8 : settings.password_min_length,
        session_timeout_minutes: settings.session_timeout_minutes === '' ? 30 : settings.session_timeout_minutes,
        max_login_attempts: settings.max_login_attempts === '' ? 5 : settings.max_login_attempts,
        data_retention_days: settings.data_retention_days === '' ? 730 : settings.data_retention_days,
      };

      console.log('Saving Settings Payload:', payload);
      await authAxios.patch('/api/super-admin/settings-api/', payload);
      console.log('Settings Saved Successfully');
      addNotification("Settings saved successfully", "success");
      setMessageType('success');
      setMessage('✅ All Settings saved Successfully');
      setShowToast(true);
      setTimeout(() => setMessage(''), 8000);
      setTimeout(() => setShowToast(false), 8000);
    } catch (error) {
      console.error('Save Settings Error:', error);
      console.error('Error Details:', error.response?.data);
      addNotification("Error saving settings", "error");
      setMessageType('error');
      setMessage('❌ Failed to save settings. Please try again.');
      setShowToast(true);
      setTimeout(() => setMessage(''), 8000);
      setTimeout(() => setShowToast(false), 8000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800">
        <AlertCircle className="inline w-5 h-5 mr-2" />
        Failed to load settings
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto pb-32 px-4"
    >
      {/* Header Section */}
      <div className="mb-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-slate-900 dark:bg-white rounded-xl shadow-lg border border-slate-900 dark:border-white">
              <Settings className="w-6 h-6 text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Configure platform-wide configuration and security</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Message Alert - Removed: Using toast notification instead */}

      {/* Quick Stats */}
      {/* Quick Stats - Removed */}

      {/* TAX CONFIGURATION */}
      <motion.div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 shadow-xl transition-all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tax Configuration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Set default tax rules for all businesses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">GST Percentage (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={settings.gst_percentage || 0}
                onChange={(e) => handleInputChange('gst_percentage', parseFloat(e.target.value))}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-black">%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'gst_enabled', label: 'Enable GST Globally' }
          ].map(option => (
            <motion.label key={option.key} className="flex items-center p-5 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all duration-200 group" whileHover={{ x: 4 }}>
              <div className="relative flex items-center h-6 w-6">
                <input
                  type="checkbox"
                  checked={settings[option.key] || false}
                  onChange={() => handleToggle(option.key)}
                  className="w-6 h-6 rounded-lg cursor-pointer accent-slate-900 dark:accent-white appearance-none bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 checked:bg-slate-900 dark:checked:bg-white checked:border-slate-900 dark:checked:border-white transition-all hover:border-slate-400 dark:hover:border-slate-500"
                />
                {settings[option.key] && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white dark:text-slate-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
              <span className="ml-5 text-base font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">{option.label}</span>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* 3. INVOICE CONFIGURATION */}
      <motion.div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 shadow-xl transition-all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Invoice Configuration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Global invoice numbering rules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">INV Prefix</label>
            <input
              type="text"
              value={settings.invoice_prefix || 'INV'}
              onChange={(e) => handleInputChange('invoice_prefix', e.target.value.toUpperCase())}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-mono font-bold"
              maxLength="10"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Starting Sequence</label>
            <input
              type="number"
              value={settings.invoice_starting_number || 1001}
              onChange={(e) => handleInputChange('invoice_starting_number', parseInt(e.target.value))}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Reset Frequency</label>
            <select
              value={settings.auto_reset_frequency || 'MONTHLY'}
              onChange={(e) => handleInputChange('auto_reset_frequency', e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem' }}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="NEVER">Never</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* 4. SUBSCRIPTION & ACCESS */}
      <motion.div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 shadow-xl transition-all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Subscription & Access</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Control trial periods and billing access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Default Trial Days</label>
            <input
              type="number"
              value={settings.default_trial_days === 0 ? 0 : (settings.default_trial_days || '')}
              onChange={(e) => handleInputChange('default_trial_days', e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="7"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Grace Period (days)</label>
            <input
              type="number"
              value={settings.grace_period_days === 0 ? 0 : (settings.grace_period_days || '')}
              onChange={(e) => handleInputChange('grace_period_days', e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="3"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold"
            />
          </div>
        </div>

        <motion.label className="flex items-center p-5 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all duration-200 group" whileHover={{ x: 4 }}>
          <div className="relative flex items-center h-6 w-6">
            <input
              type="checkbox"
              checked={settings.auto_block_on_expiry || false}
              onChange={() => handleToggle('auto_block_on_expiry')}
              className="w-6 h-6 rounded-lg cursor-pointer accent-slate-900 dark:accent-white appearance-none bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 checked:bg-slate-900 dark:checked:bg-white checked:border-slate-900 dark:checked:border-white transition-all hover:border-slate-400 dark:hover:border-slate-500"
            />
            {settings.auto_block_on_expiry && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white dark:text-slate-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>
          <span className="ml-5 text-base font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">Auto-block billing on expiry</span>
        </motion.label>
      </motion.div>

      {/* 5. REGISTRATION CONTROL - Removed */}



      {/* 7. DATA & BACKUP */}
      <motion.div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 shadow-xl transition-all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Data & Backup</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Configure backup and data retention policies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Backup Frequency</label>
            <select
              value={settings.backup_frequency || 'DAILY'}
              onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem' }}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Data Retention (days)</label>
            <div className="relative">
              <input
                type="number"
                value={settings.data_retention_days || 730}
                onChange={(e) => handleInputChange('data_retention_days', parseInt(e.target.value))}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider">(0=indefinite)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'auto_backup_enabled', label: 'Enable auto-backup' },
            { key: 'allow_data_export', label: 'Allow data export' }
          ].map(option => (
            <motion.label key={option.key} className="flex items-center p-5 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all duration-200 group" whileHover={{ x: 4 }}>
              <div className="relative flex items-center h-6 w-6">
                <input
                  type="checkbox"
                  checked={settings[option.key] || false}
                  onChange={() => handleToggle(option.key)}
                  className="w-6 h-6 rounded-lg cursor-pointer accent-slate-900 dark:accent-white appearance-none bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 checked:bg-slate-900 dark:checked:bg-white checked:border-slate-900 dark:checked:border-white transition-all hover:border-slate-400 dark:hover:border-slate-500"
                />
                {settings[option.key] && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white dark:text-slate-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
              <span className="ml-5 text-base font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">{option.label}</span>
            </motion.label>
          ))}
        </div>
      </motion.div>



      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/30 border border-amber-200 dark:border-amber-500/30 rounded-xl p-6 flex items-start gap-4 shadow-sm transition-colors"
      >
        <AlertCircle className="w-6 h-6 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold mb-1 text-amber-900 dark:text-amber-200">Important Notice</p>
          <p className="text-amber-700 dark:text-amber-100/80 leading-relaxed font-medium">These settings affect ALL businesses on the platform. Changes apply immediately across the entire system.</p>
        </div>
      </motion.div>

      {/* Save Button - Sticky Footer */}
      <div className="fixed bottom-0 right-0 left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 border-t border-slate-200 dark:border-slate-800 transition-all z-30">
        <div className="flex justify-end gap-4 max-w-7xl mx-auto px-4">
          <motion.button
            onClick={handleSaveSettings}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.05)] active:scale-95 border-2 border-slate-900 dark:border-white"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save All Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl font-semibold ${messageType === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
              }`}>
              <span>{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
