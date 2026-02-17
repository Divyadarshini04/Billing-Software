import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Eye, Download, Trash2, Search, FileText, Filter, Calendar, X, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import { NotificationContext } from "../context/NotificationContext";
import { useTaxConfiguration } from "../hooks/useTaxConfiguration";
import * as XLSX from "xlsx";
import { salesAPI, paymentAPI } from "../api/apiService";
import { numberToWords } from "../utils/numberToWords";

export default function InvoiceHistoryPage() {
  const { userRole, user } = useAuth(); // Destructure user for company details
  const { companySettings } = useCompanySettings();
  const taxSettings = useTaxConfiguration();

  const { hasPermission } = usePermissions();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const { addNotification } = useContext(NotificationContext);

  // Get current invoice prefix from company settings
  const getInvoicePrefix = () => {
    return companySettings?.billing_settings?.invoice_prefix || "INV";
  };

  useEffect(() => {
    fetchPaymentMethods();
    fetchInvoices();
  }, [companySettings?.billing_settings?.invoice_prefix]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentAPI.getAllPayments();
      // Get payment methods from the API or set defaults
      setPaymentMethods([
        { id: 1, name: 'cash', display: 'Cash' },
        { id: 2, name: 'card', display: 'Credit/Debit Card' },
        { id: 3, name: 'upi', display: 'UPI' }
      ]);
    } catch (error) {

      // Set default payment methods
      setPaymentMethods([
        { id: 1, name: 'cash', display: 'Cash' },
        { id: 2, name: 'card', display: 'Credit/Debit Card' },
        { id: 3, name: 'upi', display: 'UPI' }
      ]);
    }
  };

  const fetchInvoices = async () => {
    try {

      const response = await salesAPI.getAllSales();

      if (response.data) {
        // Handle pagination 'results' if present
        const rawData = Array.isArray(response.data) ? response.data : (response.data.results || []);

        // Normalize fields (backend uses snake_case, frontend uses camelCase)
        const normalized = rawData.map(inv => {
          const invoiceNo = inv.invoice_number || inv.invoiceNo || `INV-${inv.id}`;

          // Build customer object from various possible sources
          let customerData = {
            name: "Unknown",
            phone: ""
          };

          if (typeof inv.customer === 'object' && inv.customer) {
            // Customer is already an object from backend
            customerData = {
              name: inv.customer.name || inv.customer_name || "Unknown",
              phone: inv.customer.phone || inv.customer_phone || "",
              email: inv.customer.email || inv.customer_email || "",
              gstin: inv.customer.gstin || inv.customer_gstin || ""
            };
          } else {
            // Customer is just an ID, use the flattened fields from serializer
            customerData = {
              name: inv.customer_name || "Unknown",
              phone: (inv.customer_phone && inv.customer_phone.trim()) ? inv.customer_phone : "",
              email: inv.customer_email || "",
              gstin: inv.customer_gstin || ""
            };
          }

          return {
            ...inv,
            id: inv.id,
            invoiceNo: invoiceNo,
            date: inv.invoice_date || inv.date || inv.created_at,
            customer: customerData,
            companyDetails: inv.company_details || {},
            items: (inv.items || []).map((item) => ({
              name: item.product_name || item.name || `Product #${item.product || "?"}`,
              qty: parseFloat(item.quantity || item.qty || 1),
              price: parseFloat(item.unit_price || item.price || 0),
              total: parseFloat(item.line_total || item.total || 0)
            })),
            subtotal: parseFloat(inv.subtotal || 0),
            cgst: parseFloat(inv.cgst_amount || inv.cgst || 0),
            sgst: parseFloat(inv.sgst_amount || inv.sgst || 0),
            total: parseFloat(inv.total_amount || inv.total || 0),
            taxRate: parseFloat(inv.tax_rate || taxSettings.gst_percentage || 18),
            paidAmount: parseFloat(inv.paid_amount || inv.paidAmount || 0),
            paymentStatus: (inv.payment_status === 'paid' || inv.payment_status === 'completed') ? 'Completed' : (inv.payment_status || 'Pending'),
            paymentMode: inv.notes?.includes("Payment Mode:") ? inv.notes.replace("Payment Mode: ", "") : "Cash",
            // companyDetails: inv.company_details || {} // Removed duplicate
          };
        });

        // Sort by date descending
        const sorted = normalized.sort((a, b) => new Date(b.date) - new Date(a.date));

        setInvoices(sorted);
        setFilteredInvoices(sorted);

      } else {

      }
    } catch (error) {

      addNotification("error", "Error", "Failed to load invoices");
    }
  };

  // Filter invoices based on search, filter, and date range
  useEffect(() => {
    let filtered = invoices;

    // Apply search filter
    if (searchQuery.trim()) {

      filtered = filtered.filter(
        (inv) => {
          // Check multiple fields for invoice number
          const invoiceNo = (inv.invoiceNo || inv.invoice_number || "").toString().toLowerCase();
          const customerName = (inv.customer?.name || "").toLowerCase();
          const phoneNumber = (inv.customer?.phone || "").toString();

          const searchLower = searchQuery.toLowerCase();

          const invoiceMatch = invoiceNo.includes(searchLower);
          const customerNameMatch = customerName.includes(searchLower);
          const phoneMatch = phoneNumber.includes(searchQuery);

          if (invoiceMatch || customerNameMatch || phoneMatch) {

            return true;
          }
          return false;
        }
      );

    }

    // Apply payment/status filter
    if (filterBy === "paid") {
      filtered = filtered.filter(
        (inv) => inv.paymentStatus === "Completed" || inv.total === inv.paidAmount
      );
    } else if (filterBy === "pending") {
      filtered = filtered.filter(
        (inv) => inv.paymentStatus !== "Completed" && inv.total !== inv.paidAmount
      );
    }

    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((inv) => new Date(inv.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((inv) => new Date(inv.date) <= end);
    }

    setFilteredInvoices(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchQuery, filterBy, startDate, endDate, invoices]);

  function clearDateFilters() {
    setStartDate("");
    setEndDate("");
    addNotification("success", "Filters Cleared", "Date filters cleared");
  }

  async function deleteInvoice(invoiceId) {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await salesAPI.deleteSale(invoiceId);
        const updated = invoices.filter((inv) => inv.id !== invoiceId && inv.invoiceNo !== invoiceId);
        setInvoices(updated);
        // We need to re-filter or just update filtered state as well simply:
        setFilteredInvoices(updated.filter(inv => filteredInvoices.find(fi => fi.id === inv.id)));

        setSelectedInvoice(null);
        addNotification("success", "Invoice Deleted", `Invoice deleted successfully`);
        // Refresh full list to be safe
        fetchInvoices();
      } catch (error) {

        addNotification("error", "Error", "Failed to delete invoice");
      }
    }
  }

  async function handleRecordPayment() {
    if (!selectedInvoice) return;

    const amount = parseFloat(paymentAmount);
    const pendingAmount = selectedInvoice.total - selectedInvoice.paidAmount;

    if (!amount || amount <= 0) {
      addNotification("error", "Error", "Please enter a valid amount");
      return;
    }

    if (amount > pendingAmount) {
      addNotification("error", "Error", `Payment amount cannot exceed pending amount of ₹${pendingAmount.toFixed(2)}`);
      return;
    }

    try {

      const paymentData = {
        invoice: selectedInvoice.id,
        amount: amount,
        payment_method: paymentMethod,  // Send as string: 'cash', 'card', 'upi'
        notes: `Payment recorded from Invoice History - ${paymentMethod.toUpperCase()}`
      };

      // Create payment via API
      const response = await paymentAPI.createPayment(paymentData);

      if (response) {
        const newPaidAmount = selectedInvoice.paidAmount + amount;
        const newStatus = newPaidAmount >= selectedInvoice.total ? "Completed" : "Pending";

        addNotification(
          "success",
          "Payment Recorded",
          `₹${amount.toFixed(2)} payment recorded successfully. ${newStatus === "Completed" ? "Invoice fully paid!" : `Pending: ₹${(selectedInvoice.total - newPaidAmount).toFixed(2)}`}`
        );

        // Update the selected invoice with new payment details
        const updatedInvoice = {
          ...selectedInvoice,
          paidAmount: newPaidAmount,
          paymentStatus: newStatus
        };
        setSelectedInvoice(updatedInvoice);

        // Reset payment form
        setPaymentAmount("");
        setPaymentMethod("cash");
        setShowPaymentModal(false);

        // Refresh invoices
        fetchInvoices();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {

      const errorMsg = error.response?.data?.detail || error.response?.data?.payment_method?.[0] || error.message || "Failed to record payment";
      addNotification("error", "Payment Error", errorMsg);
    }
  }

  function exportInvoice(invoice) {
    const data = [{
      "Invoice #": invoice.invoiceNo,
      "Date": new Date(invoice.date).toLocaleDateString(),
      "Customer": invoice.customer?.name || "N/A",
      "Phone": invoice.customer?.phone || "N/A",
      "Items": invoice.items?.length || 0,
      "Subtotal": invoice.subtotal?.toFixed(2) || 0,
      "Tax": ((invoice.cgst || 0) + (invoice.sgst || 0))?.toFixed(2) || 0,
      "Total": invoice.total?.toFixed(2) || 0,
      "Payment Mode": invoice.paymentMode || "N/A",
    }];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");
    XLSX.writeFile(workbook, `Invoice_${invoice.invoiceNo}.xlsx`);
    addNotification("success", "Exported", "Invoice exported to Excel");
  }

  function viewInvoiceDetails(invoice) {
    setSelectedInvoice(invoice);
  }

  function printInvoice(invoice) {
    const printWindow = window.open("", "_blank");

    // Helper to resolve logo
    const getLogoUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('http') || url.startsWith('data:')) return url;
      const path = url.startsWith('/') ? url : `/${url}`;
      return `http://127.0.0.1:8000${path}`;
    };

    const hasBrand = (obj) => obj && Object.keys(obj).length > 1;
    const company = (hasBrand(invoice.companyDetails) ? invoice.companyDetails : null) ||
      (hasBrand(user?.company_profile) ? user.company_profile : null) ||
      (hasBrand(companySettings) ? companySettings : null) || {};

    const companyName = company.company_name || company.name || "YOUR BUSINESS NAME";
    const logoUrl = getLogoUrl(company.logo_url || company.logo);

    const addressParts = [];
    if (company.street_address) addressParts.push(company.street_address);
    if (company.city) addressParts.push(company.city);
    if (company.state) addressParts.push(company.state);
    if (company.postal_code) addressParts.push(company.postal_code);

    const address = addressParts.length > 0 ? addressParts.join(", ") : "";
    const phone = company.phone || "";
    const email = company.email || "";
    const gstin = company.tax_id || "";

    // Bank Details
    const bankName = company.bank_name || "";
    const bankAccount = company.bank_account || "";
    const ifscCode = company.ifsc_code || "";
    const terms = company.invoice_appearance?.terms || "Goods once sold cannot be taken back.\nThank you for your business!";

    // Date & Time
    const invoiceDate = new Date(invoice.invoice_date || invoice.date);
    const formattedDate = invoiceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    const formattedTime = invoiceDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Dynamic Header Title
    let headerTitle = "SALES INVOICE";
    const mode = invoice.billing_mode || "Walk-in";
    if (mode === 'GST') headerTitle = "TAX INVOICE";
    else if (mode === 'Credit') headerTitle = "INVOICE (PENDING)";
    else if (mode === 'Non-GST') headerTitle = "ESTIMATE / NON-GST";

    // Billed By
    const billerName = invoice.created_by_name || invoice.owner_name || "Staff";
    const billerId = invoice.created_by_salesman_id || invoice.owner_salesman_id;
    const billedBy = billerId ? `${billerName} (${billerId})` : "Staff";

    // Payment Logic
    const paymentMode = invoice.payment_mode || invoice.paymentMode || "Cash";
    const paidAmount = invoice.paid_amount || invoice.paidAmount || 0;
    const balanceDue = (invoice.total - paidAmount) > 0 ? (invoice.total - paidAmount) : 0;
    const changeDue = (invoice.total - paidAmount) < 0 ? Math.abs(invoice.total - paidAmount) : 0;

    // Items HTML
    const itemsHtml = invoice.items.map((item, index) => {
      // Normalize Item Data
      const name = item.product_name || item.name || item.product?.name || "Item";
      const hsn = item.hsn || item.product_code || (item.product?.hsn) || "-";
      const qty = parseFloat(item.quantity || item.qty || 0);
      const price = parseFloat(item.unit_price || item.price || item.rate || 0);
      const taxRate = parseFloat(item.tax_rate || item.tax_percent || 0);
      const discount = parseFloat(item.discount_amount || item.discount || 0);

      const itemTax = taxRate > 0 ? `${taxRate}%` : "0%";
      const itemTotal = ((price * qty) - discount).toFixed(2);

      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px; text-align: center; border-right: 1px solid #e5e7eb;">${index + 1}</td>
            <td style="padding: 8px; text-align: left; border-right: 1px solid #e5e7eb;">
                <div style="font-weight: bold;">${name}</div>
            </td>
            <td style="padding: 8px; text-align: center; border-right: 1px solid #e5e7eb;">${hsn}</td>
            <td style="padding: 8px; text-align: center; border-right: 1px solid #e5e7eb;">${qty}</td>
            <td style="padding: 8px; text-align: right; border-right: 1px solid #e5e7eb;">₹${price.toLocaleString()}</td>
            ${mode === 'GST' ? `<td style="padding: 8px; text-align: center; border-right: 1px solid #e5e7eb;">${itemTax}</td>` : ''}
            <td style="padding: 8px; text-align: right; font-weight: bold;">₹${parseFloat(itemTotal).toLocaleString()}</td>
        </tr>`;
    }).join('');

    // Empty Rows
    const emptyRowsCount = Math.max(0, 5 - (invoice.items?.length || 0));
    const emptyRows = Array(emptyRowsCount).fill(0).map(() => `
        <tr style="border-bottom: 1px solid #e5e7eb; height: 40px;">
            <td style="border-right: 1px solid #e5e7eb;"></td>
            <td style="border-right: 1px solid #e5e7eb;"></td>
            <td style="border-right: 1px solid #e5e7eb;"></td>
            <td style="border-right: 1px solid #e5e7eb;"></td>
            <td style="border-right: 1px solid #e5e7eb;"></td>
            ${mode === 'GST' ? `<td style="border-right: 1px solid #e5e7eb;"></td>` : ''}
            <td></td>
        </tr>
    `).join('');

    // CSS Styles
    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: white; margin: 0; padding: 0; color: #1f2937; }
        .container { max-width: 210mm; margin: 0 auto; padding: 32px; }
        
        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .logo-section { display: flex; gap: 16px; flex: 1; }
        .logo { width: 140px; height: 140px; object-fit: contain; border-radius: 4px; }
        .company-info { flex: 1; }
        .company-name { font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: -0.025em; }
        .company-details { font-size: 12px; color: #6b7280; line-height: 1.6; }
        
        .invoice-info { text-align: right; min-width: 240px; }
        .invoice-title { font-size: 30px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0; }
        .invoice-details-box { background-color: #eff6ff; padding: 12px; border-radius: 4px; border: 1px solid #dbeafe; display: inline-block; text-align: left; width: 100%; box-sizing: border-box; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
        .detail-label { font-weight: 700; color: #4b5563; }
        .detail-value { font-weight: 500; }
        
        /* Bill To */
        .bill-to-section { margin-bottom: 32px; }
        .section-header { background-color: #1e40af; color: white; padding: 4px 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; font-size: 14px; display: inline-block; width: 100%; box-sizing: border-box; }
        .customer-info { padding: 0 8px; }
        .customer-name { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0; }
        .customer-detail { font-size: 14px; color: #4b5563; margin: 2px 0; }
        
        /* Table */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 14px; }
        .items-table th { background-color: #1e40af; color: white; text-align: center; padding: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-right: 1px solid #1d4ed8; }
        .items-table th:last-child { border-right: none; }
        
        /* Footer Layout */
        .footer-section { display: flex; gap: 32px; align-items: flex-start; }
        .terms-box { flex: 1; background-color: #eff6ff; border: 1px solid #dbeafe; padding: 16px; border-radius: 8px; min-height: 180px; }
        .terms-header { font-weight: 700; color: #1e40af; font-size: 12px; text-transform: uppercase; margin: 0 0 8px 0; }
        .terms-text { font-size: 11px; color: #6b7280; line-height: 1.6; white-space: pre-wrap; margin: 0 0 16px 0; }
        .bank-details { font-size: 11px; color: #374151; }
        
        .financial-summary { width: 320px; }
        .summary-header { background-color: #1e40af; color: white; padding: 4px 16px; font-weight: 700; text-transform: uppercase; font-size: 14px; text-align: center; }
        .summary-box { border: 1px solid #d1d5db; border-top: none; background-color: #f9fafb; padding: 16px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
        .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; background-color: #dbeafe; padding: 8px; margin: 8px -16px -16px -16px; border-top: 1px solid #bfdbfe; color: #1e3a8a; }
        
        .payment-details { margin-top: 24px; border-top: 1px dashed #d1d5db; padding-top: 8px; }
        .amount-in-words { margin-top: 24px; text-align: right; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }

        .print-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }

        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .container { padding: 0; }
        }
      </style>
    `;

    // Render Window
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.invoiceNo || invoice.invoice_number}</title>
          ${styles}
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo-section">
                    ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo" onerror="this.style.display='none'"/>` : ''}
                    <div class="company-info">
                        <h1 class="company-name">${companyName}</h1>
                        <div class="company-details">
                            ${address}<br/>
                            ${phone ? `Phone: ${phone}<br/>` : ''}
                            ${email ? `Email: ${email}<br/>` : ''}
                            ${gstin && mode === 'GST' ? `GSTIN: ${gstin}` : ''}
                        </div>
                    </div>
                </div>
                <div class="invoice-info">
                    <div class="invoice-title">${headerTitle}</div>
                    <div class="invoice-details-box">
                        <div class="detail-row">
                            <span class="detail-label">Invoice #:</span>
                            <span class="detail-value">${invoice.invoiceNo || invoice.invoice_number}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${formattedDate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Time:</span>
                            <span class="detail-value">${formattedTime}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value ${invoice.paymentStatus === 'Pending' || invoice.total > invoice.paidAmount ? 'status-pending' : 'status-paid'}" style="color: ${invoice.paymentStatus === 'Pending' || invoice.total > invoice.paidAmount ? '#ea580c' : '#16a34a'}; font-weight: bold; text-transform: uppercase;">
                                ${invoice.paymentStatus || (invoice.total > invoice.paidAmount ? "Pending" : "Paid")}
                            </span>
                        </div>
                        <div class="detail-row" style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #bfdbfe;">
                            <span class="detail-label" style="font-size: 10px; text-transform: uppercase;">Billed By:</span>
                            <span class="detail-value" style="font-size: 11px;">${billedBy}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bill To -->
            <div class="bill-to-section">
                <div class="section-header">Bill To (Customer)</div>
                <div class="customer-info">
                    ${(!invoice.customer || mode === 'Walk-in') ?
        '<h3 class="customer-name" style="font-size: 16px;">Walk-in Customer</h3>' :
        `
                        <h3 class="customer-name">${invoice.customer_name || invoice.customer.name}</h3>
                        <div class="customer-detail">Phone: ${invoice.customer_phone || invoice.customer.phone}</div>
                        ${(mode !== 'Walk-in' && invoice.customer_email) ? `<div class="customer-detail">Email: ${invoice.customer_email}</div>` : ''} 
                        ${(mode === 'GST' && invoice.customer_gstin) ? `<div class="customer-detail" style="font-weight: bold;">GSTIN: ${invoice.customer_gstin}</div>` : ''}
                        ${balanceDue > 0 ? `<div class="customer-detail" style="color: #dc2626; font-weight: bold; margin-top: 4px;">Pending Balance: ₹${parseFloat(balanceDue).toLocaleString()}</div>` : ''}
                        `
      }
                </div>
            </div>

            <!-- Items -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">#</th>
                        <th style="text-align: left;">Item Description</th>
                        <th style="width: 80px;">HSN</th>
                        <th style="width: 60px;">Qty</th>
                        <th style="width: 100px; text-align: right;">Rate</th>
                        ${mode === 'GST' ? '<th style="width: 80px; text-align: right;">Tax %</th>' : ''}
                        <th style="width: 100px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    ${emptyRows}
                </tbody>
            </table>

            <!-- Footer -->
            <div class="footer-section">
                <!-- Terms & Bank -->
                <div class="terms-box">
                    <div class="terms-header">Terms & Bank Details</div>
                    <div class="terms-text">${terms}</div>
                    
                    ${bankName ? `
                        <div class="bank-details">
                            <div style="font-weight: bold; margin-bottom: 2px;">Bank Name: <span style="font-weight: normal;">${bankName}</span></div>
                            <div style="font-weight: bold; margin-bottom: 2px;">Account #: <span style="font-weight: normal;">${bankAccount}</span></div>
                            <div style="font-weight: bold;">IFS Code: <span style="font-weight: normal;">${ifscCode}</span></div>
                        </div>
                    ` : ''}
                </div>

                <!-- Financials -->
                <div class="financial-summary">
                    <div class="summary-header">Financial Summary</div>
                    <div class="summary-box">
                        <div class="summary-row">
                            <span style="font-weight: bold; color: #4b5563;">Subtotal:</span>
                            <span style="font-weight: bold; color: #1f2937;">₹${(invoice.subtotal || 0).toLocaleString()}</span>
                        </div>
                        
                        ${(invoice.cgst || 0) > 0 ? `
                             <div class="summary-row">
                                <span style="color: #4b5563;">CGST (${(invoice.taxRate || 18) / 2}%):</span>
                                <span>₹${(invoice.cgst).toFixed(2)}</span>
                             </div>
                          ` : ''}
                        ${(invoice.sgst || 0) > 0 ? `
                             <div class="summary-row">
                                <span style="color: #4b5563;">SGST (${(invoice.taxRate || 18) / 2}%):</span>
                                <span>₹${(invoice.sgst).toFixed(2)}</span>
                             </div>
                          ` : ''}
                        ${(invoice.igst || 0) > 0 ? `
                             <div class="summary-row">
                                <span style="color: #4b5563;">IGST (${invoice.taxRate || 18}%):</span>
                                <span>₹${(invoice.igst).toFixed(2)}</span>
                             </div>
                          ` : ''}

                         <div class="total-row">
                             <span>GRAND TOTAL</span>
                             <span>₹${(invoice.total || 0).toLocaleString()}</span>
                         </div>

                         <div class="amount-in-words">
                             <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Amount in Words</div>
                             <div style="font-size: 11px; font-weight: 700; color: #374151; font-style: italic;">
                                ${numberToWords(invoice.total || 0)}
                             </div>
                         </div>
                         
                         <div class="payment-details">
                             <div class="summary-row">
                                <span style="font-weight: bold; color: #4b5563;">Payment Mode:</span>
                                <span style="font-weight: bold;">${paymentMode}</span>
                             </div>
                             <div class="summary-row" style="color: #15803d;">
                                <span style="font-weight: bold;">Paid Amount:</span>
                                <span style="font-weight: bold;">₹${parseFloat(paidAmount).toLocaleString()}</span>
                             </div>
                             ${changeDue > 0 ? `
                                 <div class="summary-row" style="color: #6b7280; font-size: 12px;">
                                    <span style="font-weight: bold;">Change Return:</span>
                                    <span style="font-weight: bold;">₹${changeDue.toFixed(2)}</span>
                                 </div>
                             ` : ''}
                             ${balanceDue > 0 ? `
                                 <div class="summary-row" style="background-color: #fef2f2; padding: 4px; border-radius: 4px; color: #dc2626;">
                                    <span style="font-weight: bold;">Balance Due:</span>
                                    <span style="font-weight: bold;">₹${balanceDue.toFixed(2)}</span>
                                 </div>
                             ` : ''}
                         </div>
                    </div>
                </div>
            </div>
            
            <div class="print-footer">
               Computer Generated Invoice. No Signature Required.
            </div>

          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  // Check if user has permission to view invoices
  if (!hasPermission(userRole, 'view_invoices')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center max-w-md">
          <FileText className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">You don't have permission to view invoices. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Invoice History</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">View and manage all saved invoices</p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-card rounded-xl border border-blue-200 dark:border-dark-border p-6 mb-6 shadow-sm"
        >
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice #, customer name, or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Stats */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{filteredInvoices.length}</p>
            </div>
          </div>

          {/* Second Row - Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {/* Start Date */}
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <label className="absolute -top-5 left-4 text-xs text-gray-600 font-medium">From Date</label>
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <label className="absolute -top-5 left-4 text-xs text-gray-600 font-medium">To Date</label>
            </div>

            {/* Clear Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearDateFilters}
              disabled={!startDate && !endDate}
              className="px-4 py-2.5 bg-blue-200 dark:bg-blue-900/40 hover:bg-blue-300 dark:hover:bg-blue-800/60 disabled:bg-blue-100 dark:disabled:bg-blue-900/20 text-blue-700 dark:text-blue-200 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Dates
            </motion.button>

            {/* Date Range Info */}
            {(startDate || endDate) && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 flex items-center">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {startDate && endDate
                    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                    : startDate
                      ? `From ${new Date(startDate).toLocaleDateString()}`
                      : `Until ${new Date(endDate).toLocaleDateString()}`}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-dark-card rounded-xl border border-blue-200 dark:border-dark-border p-12 text-center shadow-sm"
          >
            <FileText className="w-16 h-16 text-blue-200 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No invoices found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first invoice in POS Billing</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoices List */}
            <div className="lg:col-span-2 space-y-3">
              {filteredInvoices
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((invoice, index) => (
                  <motion.div
                    key={invoice.invoiceNo}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => viewInvoiceDetails(invoice)}
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-lg border-2 p-5 cursor-pointer transition-all ${selectedInvoice?.invoiceNo === invoice.invoiceNo
                      ? "bg-blue-100 dark:bg-blue-900/40 border-blue-500 shadow-md"
                      : "bg-white dark:bg-dark-card border-blue-200 dark:border-dark-border hover:border-blue-300 dark:hover:border-blue-700 shadow-sm"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Invoice #{invoice.invoiceNo}
                          </h3>
                          <span className="text-xs px-2.5 py-1 bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
                            {invoice.paymentMode || "Cash"}
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {invoice.customer?.name || "Walk-in Customer"}
                          </p>
                          {invoice.customer?.phone && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📱 {invoice.customer.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(invoice.date).toLocaleDateString()}
                          </span>
                          <span>{invoice.items?.length || 0} items</span>
                          <span className={`font-bold ${invoice.paymentStatus === "Completed"
                            ? "text-gray-800 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                            }`}>
                            {invoice.paymentStatus === "Completed" ? "✓ Paid" : "Pending"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          ₹{invoice.total?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

              {/* Pagination Controls */}
              {filteredInvoices.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white dark:bg-dark-card border border-blue-200 dark:border-dark-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>

                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Page {currentPage} of {Math.ceil(filteredInvoices.length / itemsPerPage)}
                  </span>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(curr => Math.min(Math.ceil(filteredInvoices.length / itemsPerPage), curr + 1))}
                    disabled={currentPage === Math.ceil(filteredInvoices.length / itemsPerPage)}
                    className="p-2 rounded-lg bg-white dark:bg-dark-card border border-blue-200 dark:border-dark-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>

            {/* Invoice Details Panel */}
            {selectedInvoice && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-indigo-50 dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-slate-700 p-6 shadow-sm h-fit sticky top-6"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Invoice Details</h3>

                {/* Customer Info */}
                <div className="space-y-3 mb-6 pb-6 border-b border-indigo-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Customer</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {selectedInvoice.customer?.name || "Walk-in"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Phone</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {selectedInvoice.customer?.phone || "N/A"}
                    </p>
                  </div>
                  {selectedInvoice.customer?.gst && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">GST</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {selectedInvoice.customer.gst}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2 mb-6 pb-6 border-b border-indigo-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Items</p>
                  {selectedInvoice.items?.map((item, idx) => item ? (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{item.name || "Product"}</span>
                      <span className="text-gray-800 dark:text-white font-semibold">
                        ₹{((item.price || 0) * (item.qty || 1)).toFixed(2)}
                      </span>
                    </div>
                  ) : null)}
                </div>

                {/* Summary */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      ₹{selectedInvoice.subtotal?.toFixed(2) || 0}
                    </span>
                  </div>
                  {(selectedInvoice.cgst || 0) > 0 && (
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>CGST ({(selectedInvoice.taxRate || 18) / 2}%):</span>
                      <span className="font-semibold">
                        ₹{selectedInvoice.cgst?.toFixed(2) || 0}
                      </span>
                    </div>
                  )}
                  {(selectedInvoice.sgst || 0) > 0 && (
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>SGST ({(selectedInvoice.taxRate || 18) / 2}%):</span>
                      <span className="font-semibold">
                        ₹{selectedInvoice.sgst?.toFixed(2) || 0}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white pt-2 border-t border-indigo-200 dark:border-slate-700">
                    <span>Total:</span>
                    <span>₹{selectedInvoice.total?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}</span>
                  </div>
                  {selectedInvoice.paidAmount !== undefined && (
                    <>
                      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 pt-2">
                        <span>Paid Amount:</span>
                        <span className="font-semibold">₹{selectedInvoice.paidAmount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}</span>
                      </div>
                      {(selectedInvoice.total - selectedInvoice.paidAmount) > 0 && (
                        <div className="flex justify-between text-sm font-bold bg-orange-50 p-2 rounded mt-2 border border-orange-200">
                          <span className="text-orange-700">Pending Amount:</span>
                          <span className="text-orange-700">₹{(selectedInvoice.total - selectedInvoice.paidAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {selectedInvoice.paidAmount !== undefined && (selectedInvoice.total - selectedInvoice.paidAmount) > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Record Payment
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => printInvoice(selectedInvoice)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View & Print
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportInvoice(selectedInvoice)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => deleteInvoice(selectedInvoice.id || selectedInvoice.invoiceNo)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Record Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Invoice Info */}
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600">Invoice #</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedInvoice.invoiceNo}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="font-bold text-gray-800 dark:text-white">₹{selectedInvoice.total?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Paid</p>
                      <p className="font-bold text-green-600 dark:text-green-400">₹{selectedInvoice.paidAmount?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      ₹{(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-600 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedInvoice.total - selectedInvoice.paidAmount}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Max: ₹{(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['cash', 'card', 'upi'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${paymentMethod === method
                          ? 'bg-green-600 text-white border-2 border-green-600'
                          : 'bg-gray-100 text-gray-800 border-2 border-gray-200 hover:border-green-300'
                          }`}
                      >
                        {method.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRecordPayment}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Record Payment
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
