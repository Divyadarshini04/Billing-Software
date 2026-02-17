import React, { useState, useEffect, useContext } from "react";
import { Lock, Save, ChevronDown, ChevronUp, LayoutDashboard, Receipt, FileText, Package, Users, CreditCard, DollarSign } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import authAxios from "../../api/authAxios";

export default function FeatureControls() {
  const { addNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    billing: true,
    invoices: true,
    inventory: true,
    customers: true,
    payments: true,
    tax: true,
  });

  const [settings, setSettings] = useState({
    // 1. Dashboard Module
    dashboard_enable: true,
    dashboard_kpi_cards: true,
    dashboard_recent_orders: true,

    // 2. POS Billing Module
    billing_create_invoice: true,
    billing_cancel_invoice: true,
    billing_complete_payment: true,
    billing_print_pdf: true,

    // 3. Invoice Management Module
    invoices_history_access: true,
    invoices_reprint_download: true,
    invoices_number_lock: true,

    // 4. Products & Inventory Module
    inventory_module_enable: true,
    inventory_add_edit_products: true,
    inventory_stock_deduction: true,

    // 5. Customers Module
    customers_module_enable: true,
    customers_add_view: true,
    customers_outstanding_tracking: true,

    // 6. Payments Module
    payments_cash: true,
    payments_upi_digital: true,
    payments_credit_pay_later: true,
    payments_refund: true,

    // 7. Tax & GST Module
    tax_gst_enable: true,
    tax_calculation: true,
    tax_display_on_invoice: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await authAxios.get('/api/super-admin/settings/');
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setSettings(data);
    } catch (error) {

      addNotification("Error loading feature controls", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        // Dashboard
        dashboard_enable: settings.dashboard_enable,
        dashboard_kpi_cards: settings.dashboard_kpi_cards,
        dashboard_recent_orders: settings.dashboard_recent_orders,

        // POS Billing
        billing_create_invoice: settings.billing_create_invoice,
        billing_cancel_invoice: settings.billing_cancel_invoice,
        billing_complete_payment: settings.billing_complete_payment,
        billing_print_pdf: settings.billing_print_pdf,

        // Invoice Management
        invoices_history_access: settings.invoices_history_access,
        invoices_reprint_download: settings.invoices_reprint_download,
        invoices_number_lock: settings.invoices_number_lock,

        // Products & Inventory
        inventory_module_enable: settings.inventory_module_enable,
        inventory_add_edit_products: settings.inventory_add_edit_products,
        inventory_stock_deduction: settings.inventory_stock_deduction,

        // Customers
        customers_module_enable: settings.customers_module_enable,
        customers_add_view: settings.customers_add_view,
        customers_outstanding_tracking: settings.customers_outstanding_tracking,

        // Payments
        payments_cash: settings.payments_cash,
        payments_upi_digital: settings.payments_upi_digital,
        payments_credit_pay_later: settings.payments_credit_pay_later,
        payments_refund: settings.payments_refund,

        // Tax & GST
        tax_gst_enable: settings.tax_gst_enable,
        tax_calculation: settings.tax_calculation,
        tax_display_on_invoice: settings.tax_display_on_invoice,
      };

      await authAxios.patch('/api/super-admin/settings-api/', payload);
      addNotification("Feature controls saved successfully", "success");
    } catch (error) {

      addNotification(error.response?.data?.detail || "Error saving feature controls", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const ToggleSwitch = ({ field, label, description }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-white dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700/50 transition-all duration-300">
      <div className="flex-1">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-2">
          {label}
        </label>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{description}</p>}
      </div>
      <button
        onClick={() => handleToggle(field)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-sm ${settings[field] ? "bg-green-500 shadow-green-500/20" : "bg-slate-300 dark:bg-slate-600"
          }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${settings[field] ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );

  const SectionHeader = ({ title, subtitle, icon: Icon, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800/80 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 shadow-sm dark:shadow-none"
    >
      <div className="flex items-center gap-4 text-left">
        <div className="p-2.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">{title}</h3>
          {subtitle && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 transition-transform duration-300 ${expandedSections[section] ? 'rotate-180' : ''}`}>
        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-400">Loading feature controls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Super Admin – Feature Control</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Manage platform modules and feature availability</p>
        </div>
      </div>

      {/* 1. Dashboard Module */}
      <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
        <SectionHeader
          title="Dashboard"
          subtitle="Business analytics and KPI monitoring"
          icon={LayoutDashboard}
          section="dashboard"
        />
        {expandedSections.dashboard && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="dashboard_enable"
              label="Dashboard Enable"
              description="Enable/disable entire dashboard"
            />
            <ToggleSwitch
              field="dashboard_kpi_cards"
              label="KPI Cards"
              description="Revenue, Customers, Products cards"
            />
            <ToggleSwitch
              field="dashboard_recent_orders"
              label="Recent Orders"
              description="Show latest billing transactions"
            />
          </div>
        )}
      </div>

      {/* 2. POS Billing Module */}
      <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
        <SectionHeader
          title="POS Billing"
          subtitle="Core billing and checkout engine"
          icon={Receipt}
          section="billing"
        />
        {expandedSections.billing && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">Critical Modules</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">These settings directly impact real-time store transactions.</p>
            </div>
            <ToggleSwitch
              field="billing_create_invoice"
              label="Create Invoice"
              description="Allow creating new invoices"
            />
            <ToggleSwitch
              field="billing_cancel_invoice"
              label="Cancel / Void Invoice"
              description="Allow canceling invoices"
            />
            <ToggleSwitch
              field="billing_complete_payment"
              label="Complete Payment"
              description="Mark payments as complete"
            />
            <ToggleSwitch
              field="billing_print_pdf"
              label="Print / PDF Invoice"
              description="Generate and print invoices"
            />
          </div>
        )}
      </div>

      {/* 3. Invoice Management Module */}
      <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
        <SectionHeader
          title="Invoice Management"
          subtitle="Compliance, history and records"
          icon={FileText}
          section="invoices"
        />
        {expandedSections.invoices && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="invoices_history_access"
              label="Invoice History Access"
              description="View past invoices"
            />
            <ToggleSwitch
              field="invoices_reprint_download"
              label="Reprint / Download Invoice"
              description="Get copies of old invoices"
            />
            <ToggleSwitch
              field="invoices_number_lock"
              label="Invoice Number Lock"
              description="Prevent changing invoice numbers"
            />
          </div>
        )}
      </div>

      {/* 4. Products & Inventory Module */}
      <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
        <SectionHeader
          title="Products & Inventory"
          subtitle="Stock tracking and catalog management"
          icon={Package}
          section="inventory"
        />
        {expandedSections.inventory && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="inventory_module_enable"
              label="Inventory Module Enable"
              description="Full inventory management access"
            />
            <ToggleSwitch
              field="inventory_add_edit_products"
              label="Add / Edit Products"
              description="Create and modify products"
            />
            <ToggleSwitch
              field="inventory_stock_deduction"
              label="Stock Deduction on Billing"
              description="Automatically reduce stock on sale"
            />
          </div>
        )}
      </div>

      {/* 5. Customers Module */}
      <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
        <SectionHeader
          title="Customers"
          subtitle="CRM and account receivable"
          icon={Users}
          section="customers"
        />
        {expandedSections.customers && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="customers_module_enable"
              label="Customer Module Enable"
              description="Full customer management access"
            />
            <ToggleSwitch
              field="customers_add_view"
              label="Add / View Customers"
              description="Create and manage customers"
            />
            <ToggleSwitch
              field="customers_outstanding_tracking"
              label="Outstanding Amount Tracking"
              description="Track customer dues & credits"
            />
          </div>
        )}
      </div>

      {/* 6. Payments Module */}
      <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
        <SectionHeader
          title="Payments"
          subtitle="Transaction methods and money flow"
          icon={CreditCard}
          section="payments"
        />
        {expandedSections.payments && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="payments_cash"
              label="Cash Payment"
              description="Accept cash payments"
            />
            <ToggleSwitch
              field="payments_upi_digital"
              label="UPI / Digital Payment"
              description="Accept digital payment methods"
            />
            <ToggleSwitch
              field="payments_credit_pay_later"
              label="Credit / Pay Later"
              description="Allow customer credit/due system"
            />
            <ToggleSwitch
              field="payments_refund"
              label="Refund Enable"
              description="Allow refunding transactions"
            />
          </div>
        )}
      </div>

      {/* 7. Tax & GST Module */}
      <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
        <SectionHeader
          title="Tax / GST"
          subtitle="Taxation rules and legal compliance"
          icon={DollarSign}
          section="tax"
        />
        {expandedSections.tax && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            <ToggleSwitch
              field="tax_gst_enable"
              label="GST Enable / Disable"
              description="Turn GST calculations on/off"
            />
            <ToggleSwitch
              field="tax_calculation"
              label="Tax Calculation on Invoice"
              description="Automatically calculate tax amounts"
            />
            <ToggleSwitch
              field="tax_display_on_invoice"
              label="GST Display on Invoice"
              description="Show tax breakdown on invoice"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex gap-4 justify-end pt-8 border-t border-slate-200 dark:border-slate-700 transition-colors">
        <button
          onClick={() => fetchSettings()}
          className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm"
          disabled={saving}
        >
          Reset Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-300 flex items-center gap-3 shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving Configuration..." : "Apply Feature Controls"}
        </button>
      </div>
    </div>
  );
}
