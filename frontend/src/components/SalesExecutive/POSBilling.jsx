import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Trash2, Plus, X, Check, Printer } from "lucide-react";

export default function POSBilling() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [discountPercent, setDiscountPercent] = useState(0);

  // New State for Payments
  const [amountReceived, setAmountReceived] = useState(""); // For Cash mode
  const [cashAmount, setCashAmount] = useState(""); // For Mixed mode
  const [onlineAmount, setOnlineAmount] = useState(""); // For Mixed mode
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [referenceId, setReferenceId] = useState(""); // For Zoho/Online ref
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = (cartTotal * discountPercent) / 100;
  const finalTotal = cartTotal - discountAmount;

  // Calculations
  let changeDue = 0;
  let cashHandover = 0;
  let balanceToPay = 0;

  if (paymentMode === "cash") {
    const received = parseFloat(amountReceived) || 0;
    changeDue = received - finalTotal;
    cashHandover = finalTotal; // We keep the bill amount, rest is change
  } else if (paymentMode === "mixed") {
    const cash = parseFloat(cashAmount) || 0;
    const online = parseFloat(onlineAmount) || 0;
    balanceToPay = finalTotal - (cash + online);
    cashHandover = cash;
  } else if (paymentMode === "zoho" || paymentMode === "upi" || paymentMode === "card") {
    cashHandover = 0;
  }

  const handleCompleteSale = () => {
    // Validation
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (paymentMode === "credit" && !selectedCustomer) {
      alert("Please select a customer for Credit sales.");
      return;
    }
    if (paymentMode === "mixed" && balanceToPay > 0) {
      alert("Please collect the full amount (Cash + Online).");
      return;
    }
    if (paymentMode === "cash" && (parseFloat(amountReceived) || 0) < finalTotal) {
      alert("Amount received is less than total!");
      return;
    }

    // Capture details for modal
    setLastOrderDetails({
      total: finalTotal,
      mode: paymentMode,
      cashHandover: paymentMode === "credit" ? 0 : cashHandover,
      changeDue: changeDue > 0 ? changeDue : 0,
    });

    // Simulate API Call
    setTimeout(() => {
      setShowSuccessModal(true);
      // Reset logic would go here after modal close usually
    }, 500);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setCart([]);
    setAmountReceived("");
    setCashAmount("");
    setOnlineAmount("");
    setReferenceId("");
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">POS Billing</h2>
          <p className="text-slate-400">Create invoices and process payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search & Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Placeholder Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 min-h-[300px]">
              {/* Quick Add Buttons for Demo */}
              <button onClick={() => setCart([...cart, { name: "Demo Product A", price: 100, qty: 1 }])} className="p-4 bg-slate-700 rounded text-white hover:bg-slate-600">
                Add Product A (₹100)
              </button>
              <button onClick={() => setCart([...cart, { name: "Demo Product B", price: 500, qty: 1 }])} className="p-4 bg-slate-700 rounded text-white hover:bg-slate-600">
                Add Product B (₹500)
              </button>
              <p className="col-span-full text-slate-500 text-center py-4 text-sm mt-auto">Click buttons to simulate scanning</p>
            </div>
          </div>

          {/* Invoice / Payment Section */}
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 h-fit sticky top-4 space-y-4">
            <h3 className="text-lg font-bold text-white">Invoice</h3>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Customer (Optional)</label>
              <input
                type="text"
                placeholder="Search Customer..."
                value={selectedCustomer || ""}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Cart Items */}
            <div className="max-h-48 overflow-y-auto bg-slate-900/30 rounded-lg p-3">
              {cart.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Cart is empty</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                      <div className="flex-1">
                        <p className="text-white text-sm">{item.name}</p>
                        <p className="text-slate-400 text-xs">{item.qty} x ₹{item.price}</p>
                      </div>
                      <button
                        onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-700">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="upi">📱 UPI</option>
                  <option value="card">💳 Card</option>
                  <option value="zoho">💳 Zoho Payments</option>
                  <option value="all_zoho">🌐 All Zoho Modes</option>
                  <option value="mixed">🔀 Mixed (Cash + Online)</option>
                  <option value="credit">📝 Credit / Pay Later</option>
                </select>
              </div>

              {/* Dynamic Inputs based on Mode */}
              {paymentMode === "cash" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Amount Received</label>
                  <input
                    type="number"
                    placeholder="Enter amount given by customer"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg font-bold focus:outline-none focus:border-green-500"
                  />
                  {changeDue > 0 && (
                    <div className="mt-2 text-right">
                      <span className="text-slate-400 text-sm">Change to Return: </span>
                      <span className="text-green-400 font-bold text-lg">₹{changeDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMode === "mixed" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400">Cash Amount</label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">Online Amount</label>
                    <input
                      type="number"
                      value={onlineAmount}
                      onChange={(e) => setOnlineAmount(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-700 rounded text-white text-sm"
                    />
                  </div>
                  {balanceToPay !== 0 && (
                    <p className={`col-span-2 text-xs text-right ${balanceToPay > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {balanceToPay > 0 ? `Remaining: ₹${balanceToPay}` : `Excess: ₹${Math.abs(balanceToPay)}`}
                    </p>
                  )}
                </div>
              )}

              {(paymentMode === "zoho" || paymentMode === "upi" || paymentMode === "card") && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Transaction / Ref ID</label>
                  <input
                    type="text"
                    placeholder="Optional: Ref No."
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  />
                  {paymentMode === "zoho" && (
                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                      ℹ️ Collect payment via Zoho Terminal / Link
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-700 pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="text-white font-medium">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Discount (%):</span>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-16 px-1 py-0.5 bg-slate-700 rounded border border-slate-600 text-white text-sm"
                />
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2">
                <span className="text-white font-bold">Total Payable:</span>
                <span className="text-white text-2xl font-bold">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCompleteSale}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Complete Sale
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && lastOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 p-6 shadow-2xl space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Sale Completed!</h3>
              <p className="text-slate-400">Invoice Generated Successfully</p>
            </div>

            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Total Amount</span>
                <span className="text-white font-bold text-lg">₹{lastOrderDetails.total.toFixed(2)}</span>
              </div>

              {/* CASH HANDOVER HIGHLIGHT */}
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300 text-sm uppercase font-semibold">Cash to Hand Over</span>
                  <span className="text-emerald-400 font-bold text-xl">₹{lastOrderDetails.cashHandover.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500">Put this amount in the cash drawer.</p>
              </div>

              {lastOrderDetails.changeDue > 0 && (
                <div className="bg-red-900/20 p-3 rounded-lg border border-red-900/30">
                  <div className="flex justify-between items-center">
                    <span className="text-red-300 text-sm uppercase font-semibold">Change to Return</span>
                    <span className="text-red-400 font-bold text-xl">₹{lastOrderDetails.changeDue.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-red-400/70">Return this to customer.</p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <span className="text-slate-400 text-sm">Payment Mode</span>
                <span className="text-purple-400 font-medium uppercase">{lastOrderDetails.mode}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeSuccessModal}
                className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition"
              >
                Close
              </button>
              <button
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-500 transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
