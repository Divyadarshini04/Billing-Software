import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, MessageCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { useCompanySettings } from '../context/CompanySettingsContext';
import { useAuth } from '../context/AuthContext';
import { numberToWords } from '../utils/numberToWords';

export default function InvoiceSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { companySettings, refreshSettings } = useCompanySettings();
    const { user } = useAuth(); // Get current user for "Billed By"

    // Refresh settings on mount
    React.useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);

    const [isPaused, setIsPaused] = useState(false);

    const {
        totalAmount,
        invoiceNo,
        items = [],
        customer,
        billingType,
        billerName,
        billerId,
        successDetails
    } = location.state || {};

    const handlePrint = () => {
        setIsPaused(true);
        window.print();
    };

    if (!invoiceNo) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <p className="text-gray-500 mb-4">No invoice data found.</p>
                <button onClick={() => navigate('/pos')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Go to POS</button>
            </div>
        );
    }

    const handleWhatsApp = () => {
        const text = `Invoice ${invoiceNo} generated for ₹${totalAmount}.`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);

    // Date & Time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Dynamic Title
    let headerTitle = "SALES INVOICE";
    if (billingType === 'GST') headerTitle = "TAX INVOICE";
    else if (billingType === 'Credit') headerTitle = "INVOICE (PENDING)";
    else if (billingType === 'Non-GST') headerTitle = "ESTIMATE / NON-GST";

    // Payment Logic
    const paymentMode = successDetails?.paymentMethod || "Cash"; // Default to Cash if missing
    const paidAmount = successDetails?.paidAmount !== undefined ? successDetails.paidAmount : totalAmount;
    // Calculate Change Due only for Cash if not provided
    const changeDue = successDetails?.balanceAmount !== undefined && successDetails?.balanceAmount < 0
        ? Math.abs(successDetails.balanceAmount)
        : (paymentMode === 'Cash' && paidAmount > totalAmount ? paidAmount - totalAmount : 0);
    const balanceDue = successDetails?.balanceAmount > 0 ? successDetails.balanceAmount : 0;

    return (
        <div className="min-h-screen bg-gray-100 p-6 print:p-0 print:bg-white">

            {/* Action Bar */}
            <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-bold">Generated Successfully</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/app')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium whitespace-nowrap flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Dashboard
                    </button>
                    <button onClick={handleWhatsApp} className="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] flex items-center gap-2 font-medium">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                    </button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </div>

            {/* Invoice A4 Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none p-8 print:p-0 text-sm">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-4">
                        {companySettings.logo && (
                            <img
                                src={(() => {
                                    const logo = companySettings.logo;
                                    if (logo.startsWith('http') || logo.startsWith('data:')) return logo;
                                    const path = logo.startsWith('/') ? logo : `/${logo}`;
                                    return `http://127.0.0.1:8000${path}`;
                                })()}
                                alt="Company Logo"
                                className="w-40 h-40 object-contain rounded"
                                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-1 uppercase">
                                {companySettings.name || "Your Company Name"}
                            </h1>
                            <p className="text-gray-500 w-64 leading-relaxed text-xs">
                                {companySettings.street_address && <>{companySettings.street_address}<br /></>}
                                {companySettings.city && <>{companySettings.city}, {companySettings.state} {companySettings.postal_code}<br /></>}
                                {companySettings.phone && <>Phone: {companySettings.phone}<br /></>}
                                {companySettings.email && <>Email: {companySettings.email}</>}
                                {billingType === 'GST' && companySettings.tax_id && <><br />GSTIN: {companySettings.tax_id}</>}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-blue-800 uppercase tracking-wider mb-2">
                            {headerTitle}
                        </h2>
                        <div className="bg-blue-50 p-3 rounded border border-blue-100 inline-block text-left min-w-[220px]">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-gray-600">Invoice #:</span>
                                <span className="font-bold">{invoiceNo}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-gray-600">Date:</span>
                                <span>{formattedDate}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-gray-600">Time:</span>
                                <span>{formattedTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-600">Status:</span>
                                {billingType === 'Credit' ? (
                                    <span className="text-orange-600 font-bold uppercase">PENDING</span>
                                ) : (
                                    <span className="text-green-600 font-bold uppercase">Paid</span>
                                )}
                            </div>
                            <div className="flex justify-between mt-1 pt-1 border-t border-blue-200">
                                <span className="font-bold text-gray-500 text-[10px] uppercase">Billed By:</span>
                                <span className="text-xs font-medium">
                                    {(billerName && billerId) ? `${billerName} (${billerId})` : (user?.salesman_id ? `${user.name} (${user.salesman_id})` : "Staff")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill To Section */}
                <div className="mb-8">
                    <div className="bg-blue-800 text-white px-4 py-1 font-bold uppercase tracking-wider mb-2">
                        Bill To (Customer)
                    </div>
                    {billingType === 'Walk-in' || !customer ? (
                        <div className="px-2 text-gray-700 font-bold">
                            Walk-in Customer
                        </div>
                    ) : (
                        <div className="px-2">
                            <h3 className="font-bold text-lg">{customer.name}</h3>
                            <p className="text-gray-600">Phone: {customer.phone}</p>
                            {(billingType === 'GST' || billingType === 'Customer' || billingType === 'Credit') && customer.address && (
                                <p className="text-gray-600">Address: {customer.address}</p>
                            )}
                            {billingType === 'GST' && customer.gstin && (
                                <p className="text-gray-600 font-bold">GSTIN: {customer.gstin}</p>
                            )}
                            {billingType === 'Credit' && (
                                <p className="text-red-500 text-xs font-bold mt-1">Pending Balance: ₹{balanceDue.toFixed(2)}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <div className="mb-8 p-1">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-blue-800 text-white text-xs uppercase tracking-wider">
                                <th className="p-2 text-center border-r border-blue-700 w-10">#</th>
                                <th className="p-2 text-left border-r border-blue-700">Item Description</th>
                                <th className="p-2 text-center border-r border-blue-700 w-20">HSN</th>
                                <th className="p-2 text-center border-r border-blue-700 w-16">Qty</th>
                                <th className="p-2 text-right border-r border-blue-700 w-24">Rate</th>
                                {billingType === 'GST' && <th className="p-2 text-center border-r border-blue-700 w-16">Tax %</th>}
                                <th className="p-2 text-right w-24">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                            {items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-2 text-center border-r border-gray-200">{index + 1}</td>
                                    <td className="p-2 text-left border-r border-gray-200">
                                        <div className="font-bold">{item.name}</div>
                                    </td>
                                    <td className="p-2 text-center border-r border-gray-200">{item.hsn || "-"}</td>
                                    <td className="p-2 text-center border-r border-gray-200">{item.qty}</td>
                                    <td className="p-2 text-right border-r border-gray-200">₹{item.price.toLocaleString()}</td>
                                    {billingType === 'GST' && <td className="p-2 text-center border-r border-gray-200">
                                        {item.tax_percent ? `${item.tax_percent}%` : "0%"}
                                    </td>}
                                    <td className="p-2 text-right font-bold">₹{((item.price * item.qty) - (item.discount || 0)).toLocaleString()}</td>
                                </tr>
                            ))}
                            {[...Array(Math.max(0, 5 - items.length))].map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-200 h-10">
                                    <td className="border-r border-gray-200"></td>
                                    <td className="border-r border-gray-200"></td>
                                    <td className="border-r border-gray-200"></td>
                                    <td className="border-r border-gray-200"></td>
                                    <td className="border-r border-gray-200"></td>
                                    {billingType === 'GST' && <td className="border-r border-gray-200"></td>}
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="flex gap-8 items-start">
                    {/* Terms / Bank */}
                    <div className="flex-1">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg h-full">
                            <h4 className="font-bold text-blue-800 text-xs uppercase mb-2">Terms & Bank Details</h4>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed whitespace-pre-wrap">
                                {companySettings.invoice_appearance?.terms || "Goods once sold cannot be taken back.\nThank you for your business!"}
                            </p>
                            {billingType !== 'Walk-in' && (
                                <div className="text-xs">
                                    <p className="font-bold text-gray-700">Bank Name: <span className="font-normal">{companySettings.bank_name || "Your Bank"}</span></p>
                                    <p className="font-bold text-gray-700">Account #: <span className="font-normal">{companySettings.bank_account || "XXXXXXXXX"}</span></p>
                                    <p className="font-bold text-gray-700">IFS Code: <span className="font-normal">{companySettings.ifsc_code || "XXXX0000"}</span></p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="w-80">
                        <div className="bg-blue-800 text-white px-4 py-1 font-bold uppercase tracking-wider text-center text-sm">
                            Financial Summary
                        </div>
                        <div className="border border-t-0 border-gray-300 bg-gray-50 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-gray-600">Subtotal:</span>
                                <span className="font-bold text-gray-800">₹{subtotal.toLocaleString()}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span className="font-bold">Discount:</span>
                                    <span className="font-bold">-₹{totalDiscount.toLocaleString()}</span>
                                </div>
                            )}

                            {billingType === 'GST' && (
                                <>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>CGST (9%):</span>
                                        <span>₹{((totalAmount - subtotal + totalDiscount) / 2).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>SGST (9%):</span>
                                        <span>₹{((totalAmount - subtotal + totalDiscount) / 2).toFixed(2)}</span>
                                    </div>
                                </>
                            )}

                            {billingType === 'Non-GST' && (
                                /* Hide Tax Lines for Non-GST */
                                null
                            )}

                            <div className="border-t border-gray-300 my-2"></div>

                            <div className="flex justify-between text-lg font-extrabold bg-blue-100 p-2 -mx-4 -mb-4 border-t border-blue-200">
                                <span className="text-blue-900">GRAND TOTAL:</span>
                                <span className="text-blue-900">₹{totalAmount.toLocaleString()}</span>
                            </div>

                            <div className="mt-6 text-right pb-2 border-b border-gray-100">
                                <p className="text-[10px] uppercase font-bold text-gray-500">Amount in Words</p>
                                <p className="text-xs font-bold text-gray-700 italic">{function () {
                                    try { return numberToWords(totalAmount); } catch (e) { return ""; }
                                }()}</p>
                            </div>

                            {/* Payment Details Section */}
                            <div className="mt-6 pt-2 border-t border-dashed border-gray-300">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 font-bold">Payment Mode:</span>
                                    <span className="font-bold">{paymentMode}</span>
                                </div>
                                {successDetails?.cardRefNo && (
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span className="font-bold">Ref No:</span>
                                        <span className="font-mono">{successDetails.cardRefNo}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-green-700 font-bold mb-1">
                                    <span>Paid Amount:</span>
                                    <span>₹{parseFloat(paidAmount).toLocaleString()}</span>
                                </div>
                                {changeDue > 0 && (
                                    <div className="flex justify-between text-xs text-gray-500 font-bold mb-1">
                                        <span>Change Return:</span>
                                        <span>₹{parseFloat(changeDue).toLocaleString()}</span>
                                    </div>
                                )}
                                {balanceDue > 0 && (
                                    <div className="flex justify-between text-sm text-red-600 font-bold bg-red-50 p-1 rounded mt-1">
                                        <span>Balance Due:</span>
                                        <span>₹{parseFloat(balanceDue).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                    <p>Computer Generated Invoice. No Signature Required.</p>
                </div>
            </div>
        </div>
    );
}
