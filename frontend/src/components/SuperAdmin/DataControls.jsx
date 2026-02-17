import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Database, Download, Trash2, RotateCcw } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import authAxios from "../../api/authAxios";

export default function DataControls() {
  const { addNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    database_type: "Loading...",
    database_size: "Loading...",
    last_backup: "Loading...",
    system_status: "Checking..."
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await authAxios.get('/api/super-admin/data-stats/');
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching data stats:", error);
    }
  };

  const handleBackupData = async () => {
    try {
      setLoading(true);
      const res = await authAxios.get('/api/super-admin/backup/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      addNotification("Backup downloaded successfully", "success");
      fetchStats(); // Refresh stats to show new backup time
    } catch (error) {
      addNotification("Error creating backup", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupData = async () => {
    if (!window.confirm("This will remove expired and inactive accounts. Continue?")) return;

    try {
      setLoading(true);
      const res = await authAxios.post('/api/super-admin/cleanup/');
      addNotification(res.data.message || "Cleanup completed successfully", "success");
      fetchStats();
    } catch (error) {
      addNotification("Error during cleanup", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Data Controls</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage and backup platform data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup */}
        <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-blue-500/20 shadow-xl shadow-slate-200/50 dark:shadow-blue-500/5 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Full Backup</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Download complete platform data including all users, subscriptions, and transactions.</p>
          <motion.button
            onClick={handleBackupData}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating backup...' : 'Download Backup'}
          </motion.button>
        </div>

        {/* Cleanup */}
        <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-orange-500/20 shadow-xl shadow-slate-200/50 dark:shadow-orange-500/5 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cleanup</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Remove expired subscriptions and inactive accounts to optimize database.</p>
          <motion.button
            onClick={handleCleanupData}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
          >
            {loading ? 'Running cleanup...' : 'Run Cleanup'}
          </motion.button>
        </div>
      </div>

      {/* Database Info */}
      <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl transition-colors">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Database Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Database Type</p>
            <p className="text-slate-900 dark:text-white font-semibold">{stats.database_type}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Last Backup</p>
            <p className="text-slate-900 dark:text-white font-semibold">
              {stats.last_backup !== "Never" ? new Date(stats.last_backup).toLocaleDateString() : "Never"}
            </p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Database Size</p>
            <p className="text-slate-900 dark:text-white font-semibold">{stats.database_size}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
