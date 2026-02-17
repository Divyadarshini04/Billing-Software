import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    ArrowLeft,
    CheckCircle,
    Smartphone,
    Building,
    QrCode,
    ChevronRight,
    Wallet,
    Banknote,
    X,
    Lock,
    Shield,
    Receipt,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { salesAPI } from '../api/apiService';

export default function POSPaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { addNotification } = useContext(NotificationContext);

    // Bill Details
    const billDetails = location.state || {};
    const totalAmount = billDetails.total || 0;
    const invoiceNo = billDetails.invoiceNo || "INV-0000";

    // State
    const [step, setStep] = useState(1); // 1: Select, 2: Details, 3: Success
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Input States
    const [upiMode, setUpiMode] = useState('qr'); // 'qr' or 'id'
    const [upiId, setUpiId] = useState('');
    const [amountReceived, setAmountReceived] = useState(''); // For Cash

    // Mixed Payment State
    const [splitCash, setSplitCash] = useState('');
    const [splitUpi, setSplitUpi] = useState('');
    const [cardRefNo, setCardRefNo] = useState(''); // New: For external card machine RRN

    // Derived State for Success Screen
    const [successDetails, setSuccessDetails] = useState(null);

    // Handlers
    const handleMethodSelect = (methodId) => {
        setSelectedMethod(methodId);
        setStep(2);
        // Reset Inputs
        setAmountReceived('');
        setSplitCash('');
        setSplitUpi('');
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setSelectedMethod(null);
        } else {
            navigate(-1);
        }
    };

    // Auto-fill split balance
    useEffect(() => {
        if (selectedMethod === 'split') {
            const cash = parseFloat(splitCash) || 0;
            if (cash <= totalAmount) {
                setSplitUpi((totalAmount - cash).toFixed(2));
            } else {
                setSplitUpi('0');
            }
        }
    }, [splitCash, totalAmount, selectedMethod]);

    const processPayment = async () => {
        // Validation
        if (selectedMethod === 'cash') {
            const received = parseFloat(amountReceived) || 0;
            if (received < totalAmount) {
                addNotification(`Amount must be at least ₹${totalAmount}`, "error");
                return;
            }
        }
        if (selectedMethod === 'split') {
            const cash = parseFloat(splitCash) || 0;
            const upi = parseFloat(splitUpi) || 0;
            // Allow 1 rupee tolerance for rounding
            if (Math.abs((cash + upi) - totalAmount) > 1) {
                addNotification(`Total must equal ₹${totalAmount}`, "error");
                return;
            }
        }

        setProcessing(true);

        try {
            // Construct Payload
            const isGstBill = billDetails.billingType === "GST Bill";
            const invoiceData = {
                customer: billDetails.customer?.id || null,
                customer_id: billDetails.customer?.id || null,
                status: "completed",
                payment_status: "paid", // Direct payment on this page is always paid
                billing_mode: isGstBill ? 'with_gst' : 'without_gst',
                payment_mode: selectedMethod === 'split' ? 'Split' : (selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)), // Capitalize

                // Default Tax Rate (Backend defaults to 18 if not sent, or 0 if without_gst)
                tax_rate: isGstBill ? 18 : 0,

                items: billDetails.items.map(i => ({
                    id: i.id,
                    qty: i.qty,
                    price: i.price,
                    name: i.name,
                    discount: i.discount || 0,
                    tax: 0
                })),

                // Pass explicit payment details if needed? 
                // Backend 'paid_amount' logic:
                paid_amount: totalAmount
            };

            // Call API
            console.log("Sending Invoice Data:", invoiceData);
            const response = await salesAPI.createSale(invoiceData);
            console.log("Invoice Created:", response.data);

            setProcessing(false);

            // Navigate to Success Page with REAL backend response data
            const received = parseFloat(amountReceived) || 0;
            const formattedMethod = selectedMethod === 'upi' ? 'UPI / Online' :
                selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1);

            navigate('/pos/invoice-success', {
                state: {
                    totalAmount: response.data.total_amount, // Use backend total
                    invoiceNo: response.data.invoice_number, // Use backend invoice no
                    items: billDetails.items,
                    customer: billDetails.customer,
                    billingType: billDetails.billingType || "Standard",
                    billerName: response.data.created_by_name,
                    billerId: response.data.created_by_salesman_id,
                    successDetails: {
                        method: selectedMethod,
                        paymentMethod: formattedMethod,
                        cardRefNo: selectedMethod === 'card' ? cardRefNo : null, // Pass RRN to success page
                        cashHandover: selectedMethod === 'cash' ? received : (selectedMethod === 'split' ? parseFloat(splitCash) : totalAmount),
                        changeDue: selectedMethod === 'cash' ? received - totalAmount : 0,
                        splitDetails: selectedMethod === 'split' ? { cash: parseFloat(splitCash) || 0, upi: parseFloat(splitUpi) || 0 } : null,
                        paidAmount: response.data.paid_amount
                    }
                }
            });
            addNotification("Payment Successful!", "success");

        } catch (error) {
            console.error("Payment Error:", error);
            setProcessing(false);
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Payment Failed. Please try again.";
            addNotification(errorMsg, "error");
            // Optionally stay on step 2 or move to step 4 (failure screen)
            // setStep(4); // Uncomment if we want to show the full error screen
        }
    };

    // --- Components ---

    const PaymentOption = ({ id, icon: Icon, title, subline, logos, onClick }) => (
        <div
            onClick={() => onClick(id)}
            className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all mb-4"
        >
            <div className="flex items-start gap-5">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                    <Icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                    {subline && <p className="text-sm text-gray-500 mt-1">{subline}</p>}
                    {logos && (
                        <div className="flex items-center gap-2 mt-2 opacity-60 grayscale group-hover:grayscale-0 transition-all">
                            {logos}
                        </div>
                    )}
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
        </div>
    );

    // --- Render Views ---

    if (!billDetails.total) return <div className="p-10 text-center">No Bill Found</div>;

    return (
        <div className="min-h-screen bg-white flex font-sans overflow-hidden">

            {/* LEFT PANEL: Summary (Dark) / Desktop */}
            <div className="hidden md:flex w-1/3 bg-[#0f172a] text-white p-10 flex-col justify-between relative shadow-2xl z-10">
                <div>
                    <button onClick={() => navigate('/pos')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12">
                        <ArrowLeft className="w-5 h-5" /> Back to POS
                    </button>

                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 text-3xl font-bold">
                        Z
                    </div>

                    <div className="space-y-2 mb-8">
                        <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Total Payable</p>
                        <h1 className="text-5xl font-bold">₹{totalAmount.toLocaleString()}</h1>
                    </div>

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Order ID</span>
                            <span className="font-mono">{invoiceNo}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Customer</span>
                            <span>+91 98765 43210</span>
                        </div>
                        <div className="h-px bg-white/10 my-2"></div>
                        <div className="flex items-center text-xs text-gray-400 gap-2">
                            <Shield className="w-3 h-3" /> Secure Payment Processing
                        </div>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-500">
                    &copy; 2024 Your Company. All rights reserved.
                </div>
            </div>


            {/* RIGHT PANEL: Content Area */}
            <div className="flex-1 bg-gray-50 relative flex flex-col h-screen overflow-hidden">

                {/* Mobile Header (Only visible on small screens) */}
                <div className="md:hidden bg-[#0f172a] text-white p-6 pb-12">
                    <button onClick={() => navigate('/pos')} className="absolute top-6 left-6 text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="mt-8">
                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Total Payable</p>
                        <h1 className="text-4xl font-bold">₹{totalAmount.toLocaleString()}</h1>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16 flex justify-center">
                    <div className="w-full max-w-2xl bg-gray-50 md:bg-transparent"> {/* Limit width on desktop right panel */}

                        {/* STEP 1: Select Method */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 -mt-6 md:mt-0">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <Wallet className="w-6 h-6 text-blue-600" /> Select Payment Method
                                </h2>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-0 overflow-hidden">
                                    <PaymentOption
                                        id="upi"
                                        icon={QrCode}
                                        title="Pay via any UPI app"
                                        subline="Google Pay, PhonePe, Paytm & more"
                                        logos={<div className="flex gap-2">
                                            <div className="w-6 h-4 bg-gray-200 rounded"></div>
                                            <span className="text-[10px] font-bold text-gray-500">GPay</span>
                                            <span className="text-[10px] font-bold text-gray-500">PhonePe</span>
                                        </div>}
                                        onClick={handleMethodSelect}
                                    />

                                    <PaymentOption
                                        id="card"
                                        icon={CreditCard}
                                        title="Credit / Debit Cards"
                                        subline="Visa, Mastercard, RuPay"
                                        onClick={handleMethodSelect}
                                    />


                                    <PaymentOption
                                        id="cash"
                                        icon={Banknote}
                                        title="Cash Payment"
                                        subline="Record clean cash transaction"
                                        onClick={handleMethodSelect}
                                    />

                                    <PaymentOption
                                        id="split"
                                        icon={Wallet}
                                        title="Split Payment"
                                        subline="Cash + UPI Mixed Mode"
                                        onClick={handleMethodSelect}
                                    />
                                </div>
                            </motion.div>
                        )}


                        {/* STEP 2: Details */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col max-w-lg mx-auto md:mx-0">
                                <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 w-fit">
                                    <ArrowLeft className="w-4 h-4" /> Choose other method
                                </button>

                                {/* Wrappers for Forms */}
                                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">

                                    {/* UPI Flow */}
                                    {selectedMethod === 'upi' && (
                                        <div className="space-y-8">
                                            <h3 className="text-xl font-bold text-gray-900">UPI Payment</h3>
                                            <div className="flex p-1 bg-gray-100 rounded-xl">
                                                <button onClick={() => setUpiMode('qr')} className={`flex-1 py-3 rounded-lg font-medium transition-all ${upiMode === 'qr' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Scan QR</button>
                                                <button onClick={() => setUpiMode('id')} className={`flex-1 py-3 rounded-lg font-medium transition-all ${upiMode === 'id' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>UPI ID</button>
                                            </div>

                                            {upiMode === 'qr' ? (
                                                <div className="text-center">
                                                    <div className="w-64 h-64 bg-gray-900 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                                        <QrCode className="w-40 h-40 text-white" />
                                                    </div>
                                                    <p className="text-gray-500 mb-6">Scan with any UPI App (GPay, Paytm, PhonePe)</p>
                                                    <button onClick={processPayment} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                                        {processing ? 'Verifying...' : 'Simulate Payment Success'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="text-sm font-bold text-gray-700 block mb-2">Enter UPI ID</label>
                                                        <input
                                                            type="text"
                                                            placeholder="username@bankname"
                                                            value={upiId}
                                                            onChange={(e) => setUpiId(e.target.value)}
                                                            className="w-full p-4 rounded-xl border border-gray-200 font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                    <button onClick={processPayment} disabled={!upiId || processing} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50">
                                                        {processing ? 'Verifying...' : 'Verify & Pay'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Card Flow (Offline/Machine) */}
                                    {selectedMethod === 'card' && (
                                        <div className="space-y-8">
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CreditCard className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900">Pay using Card Machine</h3>
                                                <p className="text-gray-500 text-sm mt-2 px-6">
                                                    Please enter the amount in the external card machine. After the transaction is successful, confirm here.
                                                </p>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                                <div>
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Reference Number (Optional)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Last 4 digits or RRN"
                                                        value={cardRefNo}
                                                        onChange={(e) => setCardRefNo(e.target.value)}
                                                        className="w-full mt-1.5 p-4 rounded-xl border border-gray-200 font-mono text-base outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
                                                    />
                                                </div>

                                                <button
                                                    onClick={processPayment}
                                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3"
                                                >
                                                    {processing ? (
                                                        <> <RefreshCw className="w-5 h-5 animate-spin" /> Recording... </>
                                                    ) : (
                                                        <> <CheckCircle className="w-5 h-5" /> Confirm Payment </>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={handleBack}
                                                    disabled={processing}
                                                    className="w-full py-4 bg-white text-gray-400 font-bold rounded-xl hover:text-gray-600 hover:bg-gray-50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Cash Flow */}
                                    {selectedMethod === 'cash' && (
                                        <div className="space-y-6">
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Banknote className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">Cash Details</h3>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Amount Received</label>
                                                    {((parseFloat(amountReceived) || 0) - totalAmount) > 0 && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Return: ₹{((parseFloat(amountReceived) || 0) - totalAmount).toFixed(0)}</span>}
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₹</span>
                                                    <input
                                                        type="number"
                                                        value={amountReceived}
                                                        onChange={(e) => setAmountReceived(e.target.value)}
                                                        placeholder={totalAmount.toString()}
                                                        className="w-full pl-12 p-5 rounded-2xl border-2 border-green-100 text-3xl font-bold text-gray-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 placeholder:text-gray-200 transition-all bg-white"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            <button onClick={processPayment} className="w-full py-5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-xl shadow-green-200 text-lg">
                                                {processing ? 'Recording...' : 'Record Payment'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Split Flow */}
                                    {selectedMethod === 'split' && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <Wallet className="w-6 h-6 text-purple-600" /> Split Payment
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Cash Part</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                        <input
                                                            type="number"
                                                            value={splitCash}
                                                            onChange={(e) => setSplitCash(e.target.value)}
                                                            className="w-full pl-10 p-3 rounded-lg border border-gray-200 font-bold text-lg outline-none focus:border-purple-500 bg-white"
                                                            placeholder="0"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                                    <label className="text-xs font-bold text-purple-700 uppercase block mb-2">UPI Part (Auto)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">₹</span>
                                                        <input
                                                            type="number"
                                                            value={splitUpi}
                                                            onChange={(e) => setSplitUpi(e.target.value)}
                                                            className="w-full pl-10 p-3 rounded-lg border border-purple-200 font-bold text-lg outline-none focus:border-purple-500 bg-white text-purple-700"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl">
                                                <span className="font-medium opacity-80">Total Paid</span>
                                                <span className={`text-xl font-bold ${Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitUpi) || 0) - totalAmount) < 1 ? "text-green-400" : "text-red-400"}`}>
                                                    ₹{((parseFloat(splitCash) || 0) + (parseFloat(splitUpi) || 0)).toLocaleString()} / ₹{totalAmount.toLocaleString()}
                                                </span>
                                            </div>

                                            <button
                                                onClick={processPayment}
                                                disabled={Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitUpi) || 0) - totalAmount) > 1}
                                                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? 'Processing...' : 'Complete Split Payment'}
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </motion.div>
                        )}

                    </div>
                </div>

                {/* Secure Badge Footer - Desktop */}
                <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400 pointer-events-none hidden md:block">
                    <span className="inline-flex items-center gap-1 bg-white/80 px-3 py-1 rounded-full border border-gray-100 shadow-sm backdrop-blur-sm">
                        <Lock className="w-3 h-3" /> End-to-End Encrypted Secure Payment
                    </span>
                </div>

                {/* Step 3: Success Visual (Full Screen Overlay) */}
                <AnimatePresence>
                    {step === 3 && (
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            className="absolute inset-0 z-50 bg-[#00bfa5] flex flex-col items-center justify-center text-white"
                        >
                            <div className="w-full max-w-lg p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl mx-auto text-[#00bfa5]"
                                >
                                    <CheckCircle className="w-16 h-16" />
                                </motion.div>

                                <h2 className="text-4xl font-bold mb-2">Payment Successful!</h2>
                                <p className="text-lg opacity-90 mb-12">Transaction ID: {invoiceNo}</p>

                                {/* Success Card logic similar to before but scaled up */}
                                {successDetails?.method === 'cash' ? (
                                    <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 max-w-sm mx-auto shadow-xl">
                                        <div className="mb-6 pb-6 border-b border-white/10">
                                            <p className="text-sm uppercase tracking-widest opacity-70 mb-2">Cash Handover</p>
                                            <h1 className="text-5xl font-extrabold">₹{successDetails.cashHandover.toLocaleString()}</h1>
                                        </div>
                                        {successDetails.changeDue > 0 && (
                                            <div>
                                                <p className="text-sm uppercase tracking-widest opacity-70 mb-2">Change To Return</p>
                                                <h2 className="text-4xl font-bold text-yellow-300">₹{successDetails.changeDue.toLocaleString()}</h2>
                                            </div>
                                        )}
                                    </div>
                                ) : successDetails?.method === 'split' ? (
                                    <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 max-w-sm mx-auto shadow-xl space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg">Cash</span>
                                            <span className="text-2xl font-bold">₹{successDetails.splitDetails.cash.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg">UPI</span>
                                            <span className="text-2xl font-bold">₹{successDetails.splitDetails.upi.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/20 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg opacity-80">Total</span>
                                            <span className="text-3xl font-bold text-yellow-300">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <h1 className="text-6xl font-bold opacity-90">₹{totalAmount.toLocaleString()}</h1>
                                )}

                                <div className="mt-16 opacity-60">
                                    <p className="text-sm">Redirecting to Dashboard...</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            className="absolute inset-0 z-50 bg-red-500 flex flex-col items-center justify-center text-white"
                        >
                            <div className="w-full max-w-md p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl mx-auto text-red-500"
                                >
                                    <AlertCircle className="w-12 h-12" />
                                </motion.div>

                                <h2 className="text-3xl font-bold mb-2">Transaction Failed</h2>
                                <p className="text-white/80 mb-8">
                                    The payment could not be processed.<br />
                                    Please try again or use a different method.
                                </p>

                                <div className="bg-black/20 p-6 rounded-2xl backdrop-blur-sm mb-8 border border-white/10">
                                    <div className="flex justify-between text-sm mb-2 opacity-75">
                                        <span>Error Code</span>
                                        <span className="font-mono">ERR_PAY_DECLINED</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Amount</span>
                                        <span>₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full py-4 bg-white text-red-600 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Retry Payment
                                    </button>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="w-full py-4 bg-red-600 border border-white/30 text-white rounded-xl font-bold hover:bg-red-700"
                                    >
                                        Cancel Transaction
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
