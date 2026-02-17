import React, { useState, useEffect, useContext } from "react";
import { Edit2, Users, ShoppingCart, Trash2, Plus, Minus, CreditCard, Check, Printer, X, Tag } from "lucide-react";
import ModernDropdown from './ModernDropdown';
import { useNavigate } from "react-router-dom";
import { NotificationContext } from '../../context/NotificationContext';

export default function CartSidebar({
    cart,
    customer,
    onSelectCustomer,
    onRemoveCustomer,
    onUpdateQty,
    onUpdateDiscount,
    onRemoveItem,
    subtotal,
    tax,
    total,
    onPlaceOrder,
    billingType,
    setBillingType,
    paymentMode,
    gstEnabled,
    setGstEnabled,
    invoiceNo, // New Prop
    onClearCart
}) {
    const navigate = useNavigate();
    const { addNotification } = useContext(NotificationContext);

    const [editingItemDiscount, setEditingItemDiscount] = useState(null);

    const handleProceed = () => {
        if (cart.length === 0) {
            addNotification("error", "Cart is Empty", "Please add items to the cart before proceeding.");
            return;
        }
        navigate('/pos/payment', {
            state: {
                total: total,
                items: cart,
                customer: customer,
                invoiceNo: invoiceNo
            }
        });
    };

    const handleItemDiscountUpdate = (id, value) => {
        const val = parseFloat(value);
        if (!isNaN(val) && val >= 0) {
            onUpdateDiscount(id, val);
        }
        setEditingItemDiscount(null);
    };

    return (
        <div className="flex flex-col h-full bg-white relative z-20 font-sans border-l border-gray-100/50">
            {/* Header Section */}
            <div className="px-8 py-8 border-b border-gray-100 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Current Order</h2>
                        <div className="mt-2 flex items-center">
                            <div className="flex items-center bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100">
                                <span className="text-[10px] font-bold uppercase tracking-widest mr-2 opacity-60">Inv</span>
                                <span className="text-xs font-black font-mono tracking-wider">
                                    {invoiceNo || "NEW-ORDER"}
                                </span>
                            </div>
                        </div>
                    </div>
                    {cart.length > 0 && (
                        <button
                            onClick={onClearCart}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Clear Order"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Controls Container */}
                <div className="space-y-3">
                    <ModernDropdown
                        value={billingType}
                        onChange={(val) => setBillingType(val)}
                        options={[
                            { value: "Walk-in Bill", label: "Walk-in Bill" },
                            { value: "Customer Bill", label: "Customer Bill" },
                            { value: "Credit / Pending Bill", label: "Credit / Pending Bill" },
                            { value: "GST Bill", label: "GST Bill" },
                            { value: "Non-GST Bill", label: "Non-GST Bill" },
                        ]}
                    />

                    <div
                        onClick={!customer ? onSelectCustomer : undefined}
                        className={`
                            group w-full p-2.5 rounded-xl border-2 transition-all cursor-pointer relative
                            ${customer
                                ? 'bg-gray-50 border-gray-100 hover:border-red-200'
                                : 'bg-gray-50 border-transparent hover:border-gray-200'}
                        `}
                    >
                        {customer ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden" onClick={onSelectCustomer}>
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-600 font-bold border border-gray-200 shadow-sm shrink-0">
                                        {customer.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{customer.name}</p>
                                        <p className="text-xs text-gray-500 font-medium">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); onSelectCustomer() }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onRemoveCustomer() }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"><X className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 py-2 text-gray-400 group-hover:text-gray-600 transition-all font-bold text-sm">
                                <Users className="w-4 h-4" />
                                <span>Find Customer</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-8 py-4 divide-y divide-gray-100 flex flex-col gap-0 bg-white">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-50">
                        <ShoppingCart className="w-12 h-12 text-gray-300" />
                        <p className="mt-4 font-bold text-gray-400">Cart is Empty</p>
                    </div>
                ) : (
                    cart.map((item, idx) => (
                        <div key={idx} className="py-6 flex gap-4 group items-start group">
                            {/* Simple Image */}
                            <div className="w-14 h-14 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 relative shadow-sm">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl">☕</div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">{item.name}</h4>
                                    <span className="font-bold text-gray-900 text-sm">
                                        ₹{((item.price * item.qty) - (item.discount || 0)).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-gray-400 font-medium">₹{item.price.toLocaleString()} unit</span>
                                        {item.discount > 0 && (
                                            <span className="text-[10px] text-green-600 font-bold mt-0.5">
                                                Saved ₹{item.discount}
                                            </span>
                                        )}
                                    </div>

                                    {/* Clean Qty Controls */}
                                    <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-200">
                                        <button
                                            onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-xs font-bold w-10 text-center text-gray-900">{item.qty}</span>
                                        <button
                                            onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-white transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Discount Link */}
                                <div className="mt-2">
                                    {editingItemDiscount === item.id ? (
                                        <input
                                            type="number"
                                            autoFocus
                                            defaultValue={item.discount || ""}
                                            placeholder="Discount ₹"
                                            className="w-full p-1.5 text-xs font-bold border-2 border-red-100 rounded-lg outline-none focus:border-red-400 transition-all"
                                            onBlur={(e) => handleItemDiscountUpdate(item.id, e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleItemDiscountUpdate(item.id, e.currentTarget.value)}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setEditingItemDiscount(item.id)}
                                            className="text-[10px] text-red-500 font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider"
                                        >
                                            {item.discount ? 'Adjust Discount' : 'Add Discount'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Simple Clean Footer */}
            <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                <div className="space-y-2 mb-8">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Items Subtotal</span>
                        <span className="text-gray-900 font-bold">₹{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Estimated Tax</span>
                        <span className="text-gray-900 font-bold">₹{tax.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-5 mt-4 border-t border-gray-200">
                        <span className="text-base font-bold text-gray-900">Total Payable</span>
                        <span className="text-3xl font-black text-gray-900 leading-none tracking-tight">
                            <span className="text-lg mr-1 opacity-50 font-medium">₹</span>
                            {total.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClearCart}
                        className="p-4 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center shrink-0"
                    >
                        <Trash2 className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleProceed}
                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        Proceed to Pay
                        <CreditCard className="w-5 h-5" />
                    </button>
                </div>
            </div>


        </div>
    );
}
