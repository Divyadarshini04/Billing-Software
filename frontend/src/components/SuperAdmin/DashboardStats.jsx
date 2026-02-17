import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  Users, CheckCircle, CreditCard, DollarSign, TrendingUp,
  AlertCircle, Building2, Activity
} from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import authAxios from "../../api/authAxios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 shadow-xl ${color}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">{title}</p>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${trend > 0 ? 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                {trend > 0 ? '↑' : '↓'}
              </span>
              <p className={`text-xs font-bold ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {Math.abs(trend)}% <span className="text-slate-400 dark:text-slate-500 font-normal">vs last month</span>
              </p>
            </div>
          )}
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/5 dark:bg-white/10 shadow-inner">
          <Icon className="w-8 h-8 text-slate-900 dark:text-white opacity-80" />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardStats() {
  const { addNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeOwners: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    newSignups: 0,
    failedPayments: 0,
    expiredSubscriptions: 0,
    systemHealth: "Healthy"
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topBusinesses, setTopBusinesses] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch main stats
      const statsRes = await authAxios.get('/api/super-admin/dashboard-stats/');
      if (statsRes.data) {
        setStats({
          totalUsers: statsRes.data.total_users || 0,
          activeOwners: statsRes.data.active_owners || 0,
          activeSubscriptions: statsRes.data.active_subscriptions || 0,
          totalRevenue: statsRes.data.total_revenue || 0,
          newSignups: statsRes.data.new_signups || 0,
          failedPayments: statsRes.data.failed_payments || 0,
          expiredSubscriptions: statsRes.data.expired_subscriptions || 0,
          systemHealth: "Healthy"
        });
      }

      // Fetch revenue trend
      const revRes = await authAxios.get('/api/super-admin/reports/?type=revenue');
      if (revRes.data?.data) {
        setRevenueData(revRes.data.data);
      }

      // Fetch plan distribution
      const planRes = await authAxios.get('/api/super-admin/reports/?type=plans');
      if (planRes.data?.data) {
        setSubscriptionData(planRes.data.data);
      }

      // Fetch top businesses
      const bizRes = await authAxios.get('/api/super-admin/reports/?type=businesses');
      if (bizRes.data?.data) {
        setTopBusinesses(bizRes.data.data);
      } else {
        setTopBusinesses([]);
      }

    } catch (error) {

      addNotification("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-white dark:bg-blue-500/10 border-slate-200 dark:border-blue-500/20"
          trend={5}
        />
        <StatCard
          title="Active Owners"
          value={stats.activeOwners}
          icon={Building2}
          color="bg-white dark:bg-cyan-500/10 border-slate-200 dark:border-cyan-500/20"
          trend={3}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CreditCard}
          color="bg-white dark:bg-emerald-500/10 border-slate-200 dark:border-green-500/20"
          trend={8}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-white dark:bg-indigo-500/10 border-slate-200 dark:border-purple-500/20"
          trend={12}
        />
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">New Signups</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.newSignups}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Failed Payments</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.failedPayments}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Expired Subs</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.expiredSubscriptions}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-4 h-4 text-green-500 dark:text-green-400" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">System Health</p>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.systemHealth}</p>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Revenue Trend</h3>
          {revenueData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" darkStroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropBlur: '8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No data available</p>
          )}
        </motion.div>

        {/* Subscription Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Subscription Plans</h3>
          {subscriptionData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={subscriptionData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" paddingAngle={4} dataKey="value">
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropBlur: '8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No data available</p>
          )}
        </motion.div>
      </div>

      {/* Top Performing Businesses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Performing Businesses</h3>
        {topBusinesses.length > 0 ? (
          <div className="space-y-3">
            {topBusinesses.map((business, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 border border-transparent dark:border-slate-600/50 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold">{business.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{business.subscriptions} active subscriptions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">₹{business.revenue.toLocaleString()}</p>
                  <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mt-1">Monthly</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No businesses with revenue yet</p>
        )}
      </motion.div>
    </div>
  );
}
