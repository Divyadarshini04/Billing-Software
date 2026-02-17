import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { ExportSuccessProvider } from "./context/ExportSuccessContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CompanySettingsProvider } from "./context/CompanySettingsContext";
import Navbar from "./components/Navbar";
import ExportSuccessModal from "./components/ExportSuccessModal";
import NotificationBootstrap from "./components/NotificationBootstrap";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import OwnerLoginPage from "./pages/OwnerLoginPage";
import SalesExecutiveLoginPage from "./pages/SalesExecutiveLoginPage";
import SuperAdminLoginPage from "./pages/SuperAdminLoginPage";
import LeadsManagementPage from "./pages/SuperAdmin/LeadsManagementPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardDesignPage from "./pages/DashboardDesignPage";
import POSBillingPage from "./pages/POSBillingPage";
import POSPaymentPage from "./pages/POSPaymentPage";
import InvoiceSuccessPage from "./pages/InvoiceSuccessPage";
import InvoiceHistoryPage from "./pages/InvoiceHistoryPage";
import LoyaltyManagementPage from "./pages/LoyaltyManagementPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import ReportsPage from "./pages/ReportsPage";
import SellerReportsPage from "./pages/SellerReportsPage";
import StockReportsPage from "./pages/StockReportsPage";
import TransitReportsPage from "./pages/TransitReportsPage";
import TaxReportsPage from "./pages/TaxReportsPage";
import SalesReportPage from "./pages/SalesReportPage";
import ItemwiseSalesReportPage from "./pages/ItemwiseSalesReportPage";
import ProfileSettings from "./pages/ProfileSettings";
import TeamAccessPage from "./pages/TeamAccessPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import DiscountPage from "./pages/DiscountPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";

// import OwnerSubscriptionManagement from "./pages/OwnerSubscriptionManagement";
import SubscriptionPage from "./components/Owner/SubscriptionPage";
import PaymentPage from "./components/Owner/PaymentPage";
import OwnerSubscriptionPurchase from "./pages/OwnerSubscriptionPurchase";
import RolesPermissions from "./pages/RolesPermissions";
import SuperAdminPage from "./pages/SuperAdminPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import OwnerSupportPage from "./pages/OwnerSupportPage";
import NotificationPage from "./pages/NotificationPage";
import SalesExecutivePage from "./pages/SalesExecutivePage";
import SupplierManagementPage from "./pages/SupplierManagementPage";
import StockInwardPage from "./pages/StockInwardPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import SubscriptionFailurePage from "./pages/SubscriptionFailurePage";
import PaymentProcessingPage from "./pages/PaymentProcessingPage";
import Layout from "./components/Layout";
// Public Website Imports
import PublicLayout from "./components/public/PublicLayout";
import HomePage from "./pages/public/HomePage";
import SolutionsPage from "./pages/public/SolutionsPage";
import FeaturesPage from "./pages/public/FeaturesPage";
import PricingPage from "./pages/public/PricingPage";
import AboutPage from "./pages/public/AboutPage";
import DemoPage from "./pages/public/DemoPage";
import ContactPage from "./pages/public/ContactPage";
import PrivacyPage from "./pages/public/PrivacyPage";
import TermsPage from "./pages/public/TermsPage";
import HelpCenterPage from "./pages/public/HelpCenterPage";

const RootRoute = () => {
  const { user, userRole } = useAuth();

  if (user?.is_super_admin) {
    return <Navigate to="/super-admin" replace />;
  }

  if (userRole === "SALES_EXECUTIVE") {
    // Sales Executive defaults to their tailored dashboard -> POS
    return <Navigate to="/pos" replace />;
  }

  // Owner/Others default to dashboard
  return <Navigate to="/owner/dashboard" replace />;
};

export default function App() {
  React.useEffect(() => {
    const APP_VERSION = 'v1.0.4_login_debug';
    // Version check logic simplified - do not clear storage automatically
    localStorage.setItem('app_version', APP_VERSION);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <PermissionsProvider>
              <SubscriptionProvider>
                <CompanySettingsProvider>
                  <ExportSuccessProvider>
                    <NotificationBootstrap />
                    <ExportSuccessModal />
                    <ScrollToTop />
                    <Toaster position="top-right" />
                    <Routes>
                      {/* Public Website Routes */}
                      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                      <Route path="/solutions" element={<PublicLayout><SolutionsPage /></PublicLayout>} />
                      <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
                      <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
                      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
                      <Route path="/demo" element={<PublicLayout><DemoPage /></PublicLayout>} />
                      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
                      <Route path="/privacy-policy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
                      <Route path="/terms-of-service" element={<PublicLayout><TermsPage /></PublicLayout>} />
                      <Route path="/help-center" element={<PublicLayout><HelpCenterPage /></PublicLayout>} />

                      {/* Application Login Routes */}
                      <Route path="/login" element={<OwnerLoginPage />} />
                      <Route path="/super-admin-login" element={<SuperAdminLoginPage />} />
                      <Route path="/super-admin/leads" element={<ProtectedRoute element={<LeadsManagementPage />} requiredRole="SUPERADMIN" />} />
                      <Route path="/sales-login" element={<SalesExecutiveLoginPage />} />
                      <Route path="/super-admin" element={<ProtectedRoute element={<SuperAdminPage />} requiredPermission="manage_users" />} />
                      <Route path="/owner/dashboard" element={<ProtectedRoute element={<OwnerDashboardPage />} requiredRole="OWNER" />} />

                      {/* POS Routes - Standalone (No Sidebar) */}
                      <Route path="/pos" element={<ProtectedRoute element={<POSBillingPage />} requiredPermission="view_pos" />} />
                      <Route path="/pos-billing" element={<ProtectedRoute element={<POSBillingPage />} requiredPermission="view_pos" />} />
                      <Route path="/pos/payment" element={<ProtectedRoute element={<POSPaymentPage />} requiredPermission="view_pos" />} />
                      <Route path="/pos/invoice-success" element={<ProtectedRoute element={<InvoiceSuccessPage />} requiredPermission="view_pos" />} />


                      {/* Protected Application Routes */}
                      <Route
                        path="/*"
                        element={
                          <ProtectedRoute
                            element={
                              <Layout>
                                <Routes>
                                  {/* Redirect helper moved to /app */}
                                  <Route path="/app" element={<RootRoute />} />
                                  <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} requiredPermission="view_dashboard" />} />
                                  <Route path="/dashboard-design" element={<ProtectedRoute element={<DashboardDesignPage />} requiredPermission="view_dashboard" />} />
                                  <Route path="/invoices" element={<ProtectedRoute element={<InvoiceHistoryPage />} requiredPermission="view_invoices" />} />
                                  <Route path="/invoice-history" element={<ProtectedRoute element={<InvoiceHistoryPage />} requiredPermission="view_invoices" />} />
                                  <Route path="/loyalty" element={<ProtectedRoute element={<LoyaltyManagementPage />} requiredPermission="view_loyalty" />} />
                                  <Route path="/loyalty-management" element={<ProtectedRoute element={<LoyaltyManagementPage />} requiredPermission="view_loyalty" />} />
                                  <Route path="/inventory" element={<ProtectedRoute element={<InventoryPage />} requiredPermission="view_inventory" />} />
                                  <Route path="/suppliers" element={<ProtectedRoute element={<SupplierManagementPage />} requiredRole="OWNER" />} />
                                  <Route path="/stock-inward" element={<ProtectedRoute element={<StockInwardPage />} requiredRole="OWNER" />} />
                                  <Route path="/customers" element={<ProtectedRoute element={<CustomersPage />} requiredPermission="view_customers" />} />
                                  <Route path="/reports" element={<ProtectedRoute element={<ReportsPage />} requiredPermission="view_reports" />} />

                                  <Route path="/settings" element={<ProtectedRoute element={<ProfileSettings />} requiredPermission="manage_settings" />} />
                                  <Route path="/team-access" element={<ProtectedRoute element={<TeamAccessPage />} requiredRole="OWNER" />} />
                                  <Route path="/notifications" element={<ProtectedRoute element={<NotificationPage />} />} />
                                  <Route path="/company-profile" element={<ProtectedRoute element={<CompanyProfilePage />} requiredPermission="manage_settings" />} />
                                  <Route path="/owner/roles-permissions" element={<ProtectedRoute element={<RolesPermissions />} requiredPermission="manage_users" />} />
                                  <Route path="/owner/subscription-management" element={<ProtectedRoute element={<SubscriptionPage />} requiredPermission="manage_subscription" />} />
                                  <Route path="/owner/payment" element={<ProtectedRoute element={<PaymentPage />} requiredPermission="manage_subscription" />} />
                                  <Route path="/owner/payment-success" element={<ProtectedRoute element={<SubscriptionSuccessPage />} requiredPermission="manage_subscription" />} />
                                  <Route path="/owner/payment-failure" element={<ProtectedRoute element={<SubscriptionFailurePage />} requiredPermission="manage_subscription" />} />
                                  <Route path="/owner/payment-processing" element={<ProtectedRoute element={<PaymentProcessingPage />} requiredPermission="manage_subscription" />} />
                                  <Route path="/support" element={<ProtectedRoute element={<OwnerSupportPage />} />} />
                                  <Route path="/owner/categories" element={<ProtectedRoute element={<CategoryManagementPage />} requiredPermission="manage_inventory" />} />
                                  <Route path="/discounts" element={<ProtectedRoute element={<DiscountPage />} requiredRole="OWNER" />} />
                                </Routes>
                              </Layout>
                            }
                          />
                        }
                      />
                    </Routes>
                  </ExportSuccessProvider>
                </CompanySettingsProvider>
              </SubscriptionProvider>
            </PermissionsProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
