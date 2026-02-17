import React, { useState, useMemo, useEffect, useContext } from "react";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useCompanySettings } from "../context/CompanySettingsContext";
import { NotificationContext } from "../context/NotificationContext";
import { useTaxConfiguration } from "../hooks/useTaxConfiguration";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { productAPI, customerAPI, salesAPI } from "../api/apiService";
import authAxios from "../api/authAxios";
import { numberToWords } from "../utils/numberToWords";
import { useNavigate } from "react-router-dom";

// New Modular Components
import POSLayout from "../components/POS/POSLayout";
import POSHeader from "../components/POS/POSHeader";
import ProductCard from "../components/POS/ProductCard";
import CartSidebar from "../components/POS/CartSidebar";
import ProductDetailModal from "../components/POS/ProductDetailModal";
import CustomerSelectionModal from "../components/POS/CustomerSelectionModal";
import BarcodeScanner from "../components/POS/BarcodeScanner";

export default function POSBillingPage() {
  const navigate = useNavigate();
  // ... existing hooks ...
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const { companySettings } = useCompanySettings();
  const { taxSettings } = useTaxConfiguration();
  const { addNotification } = useContext(NotificationContext);
  const exportSuccess = useExportSuccess();

  // State
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null); // For modal
  const [showCustomerModal, setShowCustomerModal] = useState(false); // For customer modal
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now()}`);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  // -- Fix Session Persistence --
  // Initialize from user context, but also listen for changes
  const [salesmanId, setSalesmanId] = useState(user?.salesman_id || "");

  useEffect(() => {
    if (user?.salesman_id) {
      console.log("Setting Salesman ID from User Context:", user.salesman_id);
      setSalesmanId(user.salesman_id);
    }
  }, [user]);
  // -----------------------------


  // ... fetch logic ...



  // Fetch Data
  useEffect(() => {
    fetchProductsAndCustomers();
    fetchNextInvoiceNumber();
  }, []);

  async function fetchProductsAndCustomers() {
    setLoading(true);
    try {
      const [productsRes, customersRes] = await Promise.all([
        productAPI.getAllProducts(),
        customerAPI.getAllCustomers()
      ]);

      // Normalize Products
      let productsData = productsRes.data?.data?.products || productsRes.data?.results || productsRes.data || [];
      const normalizedProducts = productsData.map(p => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.unit_price || p.price || 0),
        image: p.image
          ? (p.image.startsWith('http') ? p.image : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${p.image}`)
          : null,
        category: p.category?.name || p.category || "Uncategorized",
        sku: p.product_code || p.sku,
        barcode: p.barcode || "",
        hsn: p.hsn_code || "",
        description: p.description,
        stock: p.stock || 0 // Added stock mapping
      }));
      setProducts(normalizedProducts);

      // Normalize Customers
      let customersData = customersRes.data?.data?.customers || customersRes.data?.results || customersRes.data || [];
      const normalizedCustomers = customersData.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email
      }));
      setCustomers(normalizedCustomers);

      if (normalizedCustomers.length > 0) setSelectedCustomer(normalizedCustomers[0]);

    } catch (error) {
      console.error("Failed to load POS data", error);
      addNotification("error", "Error", "Failed to load products/customers");
    } finally {
      setLoading(false);
    }
  }

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await authAxios.get('/api/billing/invoices/next-number/');
      if (response.data?.next_invoice_number) {
        setInvoiceNo(response.data.next_invoice_number);
      }
    } catch (e) { console.warn("Using fallback invoice number"); }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset pagination when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);


  // Filtering (Existing)
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (activeCategory !== "All") {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.hsn?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [products, activeCategory, searchQuery]);

  // Derived Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats);
  }, [products]);

  // Cart Logic
  const addToCart = (productWithQty) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productWithQty.id);
      const currentQty = existing ? existing.qty : 0;
      const requestedQty = currentQty + productWithQty.qty;

      // Stock Check
      if (requestedQty > productWithQty.stock) {
        addNotification("error", "Stock Limit", `Only ${productWithQty.stock} stock available!`);
        return prev;
      }

      if (existing) {
        return prev.map(item =>
          item.id === productWithQty.id
            ? { ...item, qty: requestedQty, notes: productWithQty.notes }
            : item
        );
      }
      return [...prev, { ...productWithQty, discount: 0 }];
    });
    // Notification handled inside set if updated, but here we can just show success if passed check?
    // Actually set state is async, so better simple notification outside if valid.
    // Let's rely on the check above.
    // Wait, I can't check the result of setPrev easily here without logic duplication.
    // I will simplify: Check BEFORE setCart.
  };

  // Refined addToCartwrapper due to closure scope of cart? No, setCart `prev` is safe.
  // But to trigger notification only on success is tricky.
  // Let's rewrite addToCart to be cleaner.
  /*
  const addToCart = (productWithQty) => {
    // We need to look up current cart state or rely on functional update
    // But functional update can't return "no change" effectively while notifying outside.
    // It's better to check against `cart` state if we depend on it, but `cart` might be stale in closure?
    // `addToCart` is recreated on render so `cart` is fresh? No, `fetched` logic doesn't depend on cart.
    // But `addToCart` is NOT wrapped in useCallback, so it captures current `cart`.
    
    const existing = cart.find(item => item.id === productWithQty.id);
    const currentQty = existing ? existing.qty : 0;
            
    if (currentQty + productWithQty.qty > productWithQty.stock) {
        addNotification("error", "Stock Limit", `Only ${productWithQty.stock} available`);
        return;
    }

    setCart(prev => {
        // ... update logic
    });
    addNotification("success", "Added", ...);
  }
  */

  // Re-implementing addToCart below in ReplaceContent correctly


  const updateQty = (id, newQty) => {
    if (newQty < 1) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
    }
  };

  const updateItemDiscount = (id, discountAmount) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, discount: discountAmount } : item));
  };

  // New State for Enhanced UI
  const [billingType, setBillingType] = useState("Walk-in Bill");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [gstEnabled, setGstEnabled] = useState(false);

  // Sync Salesman ID when user user updates (async)
  // Sync Salesman ID when user user updates (async) -> Already handled above

  // Billing Type Logic - The Core Rule
  useEffect(() => {
    switch (billingType) {
      case "Walk-in Bill":
        setPaymentMode("Cash");
        setGstEnabled(false);
        setSelectedCustomer(null);
        break;
      case "Customer Bill":
        // Defaults, but editable
        if (paymentMode === "Pending") setPaymentMode("Cash");
        break;
      case "Credit / Pending Bill":
        setPaymentMode("Pending");
        break;
      case "GST Bill":
        setGstEnabled(true);
        break;
      case "Non-GST Bill":
        setGstEnabled(false);
        break;
      default:
        break;
    }
  }, [billingType]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate('/login');
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Clear entire cart?")) {
      setCart([]);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      addNotification("error", "Empty Cart", "Please add items to cart");
      return;
    }

    // Validation Rules
    if (billingType === "Credit / Pending Bill" && !selectedCustomer) {
      addNotification("error", "Validation Error", "Customer details required for credit bill");
      setShowCustomerModal(true);
      return;
    }

    if (billingType === "Customer Bill" && !selectedCustomer) {
      addNotification("error", "Validation Error", "Select a customer for Customer Bill");
      setShowCustomerModal(true);
      return;
    }

    try {
      // Logic with item discounts
      const subtotal = cart.reduce((sum, item) => sum + ((item.price * item.qty) - (item.discount || 0)), 0);
      const effectiveTaxRate = gstEnabled ? (taxSettings?.taxRate || 18) : 0; // Default GST 18% if enabled but not configured

      // Note: Backend handles tax calculation if 'tax_rate' is passed. 
      // We pass tax_rate effectively.

      const invoiceData = {
        customer: selectedCustomer?.id || null, // Allow null for walk-in
        customer_id: selectedCustomer?.id || null, // Backend looking for customer_id? Serializer usually accepts 'customer' as ID or object. Let's send 'customer' as ID.

        status: "completed",
        payment_status: paymentMode === "Pending" ? "unpaid" : "paid", // Backend expects 'paid' or 'unpaid' usually, or 'pending' if mapped. let's check backend enum. Backend seems to use 'paid', 'unpaid', 'partial'. 'pending' might be 'unpaid'.
        // Backend View line 275: requested_payment_status = self.request.data.get('payment_status', 'unpaid')

        billing_mode: gstEnabled ? 'with_gst' : 'without_gst', // Backend expects 'billing_mode'
        payment_mode: paymentMode, // Cash, Card, UPI, etc.

        // Tax Rate
        tax_rate: effectiveTaxRate,

        // Map items
        items: cart.map(i => ({
          id: i.id, // Product ID
          qty: i.qty,
          price: i.price, // Unit Price
          name: i.name,
          discount: i.discount || 0,
          tax: 0 // Item level tax if any specific
        }))
      };

      if (paymentMode === "Pending") {
        invoiceData.payment_status = 'unpaid';
      }

      console.log("Sending Order to Backend:", invoiceData);

      // Actual API Call
      const response = await salesAPI.createSale(invoiceData);

      console.log("Order Success:", response.data);

      addNotification("success", "Order Placed", `Invoice ${response.data.invoice_number} generated!`);

      // Navigate to Success Page with REAL data
      navigate('/invoice-success', {
        state: {
          invoiceNo: response.data.invoice_number,
          totalAmount: response.data.total_amount,
          items: cart, // Or response.data.items if we want detailed backend response
          customer: selectedCustomer,
          billingType: billingType,
          successDetails: {
            paidAmount: response.data.paid_amount,
            balanceAmount: response.data.total_amount - response.data.paid_amount
          }
        }
      });

      setCart([]);
      fetchNextInvoiceNumber();

      // Reset to default for next bill (optional)
      if (!billingType.includes("Walk-in")) {
        setBillingType("Walk-in Bill");
      }

    } catch (e) {
      console.error("Order Failed:", e);
      // Extract backend error message if available
      const errorMsg = e.response?.data?.detail || e.response?.data?.message || "Failed to place order";
      addNotification("error", "Error", errorMsg);
    }
  };

  // ... rest of effect hooks ...

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + ((item.price * item.qty) - (item.discount || 0)), 0);
  const effectiveTaxRate = gstEnabled ? (taxSettings?.taxRate || 5) : 0;
  const tax = subtotal * (effectiveTaxRate / 100);
  const total = subtotal + tax;

  // Render
  return (
    <>
      <POSLayout
        leftPanel={
          <div className="flex flex-col h-full">
            <POSHeader
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categories={categories}
              onCloseOrder={() => {
                if (user?.role === 'SALES_EXECUTIVE') {
                  window.location.reload();
                } else {
                  navigate('/owner/dashboard');
                }
              }}
              // New Props
              salesmanId={salesmanId}
              setSalesmanId={setSalesmanId}
              onLogout={handleLogout}
              onShowScanner={() => setShowScanner(true)}
            />

            {/* Product Grid */}
            {/* Product Display Area */}
            <div className="flex-1 overflow-y-auto p-6 pt-6">
              {activeCategory === "All" ? (
                /* Recommendation / All View - GRID */
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                  {paginatedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={setSelectedProduct}
                    />
                  ))}
                </div>
              ) : (
                /* Specific Category View - POLISHED LIST */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                  {/* List Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                    <div className="col-span-5 pl-2">Product Details</div>
                    <div className="col-span-3 text-right">Price</div>
                    <div className="col-span-2 text-center">Stock</div>
                    <div className="col-span-2 text-center">Action</div>
                  </div>

                  {/* List Content */}
                  <div className="overflow-y-auto pb-4 custom-scrollbar">
                    {paginatedProducts.map(product => {
                      const isOutOfStock = product.stock <= 0;
                      return (
                        <div
                          key={product.id}
                          onClick={() => !isOutOfStock && setSelectedProduct(product)}
                          className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-50 items-center group transition-all duration-200
                                ${isOutOfStock
                              ? 'opacity-60 bg-gray-50/50 cursor-not-allowed'
                              : 'hover:bg-blue-50/50 hover:shadow-sm cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500'
                            }`}
                        >
                          {/* Product Name & SKU */}
                          <div className="col-span-5 pl-2">
                            <h4 className={`font-bold text-sm ${isOutOfStock ? 'text-gray-500' : 'text-gray-800 group-hover:text-blue-700'}`}>
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                {product.sku || 'NO SKU'}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-3 text-right">
                            <span className="font-bold text-gray-900 text-sm">₹{product.price.toLocaleString()}</span>
                          </div>

                          {/* Stock Status */}
                          <div className="col-span-2 flex justify-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${isOutOfStock ? 'bg-gray-200 text-gray-500' :
                              (product.stock < 10 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600')
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-gray-400' :
                                (product.stock < 10 ? 'bg-orange-500' : 'bg-emerald-500')
                                }`}></span>
                              {isOutOfStock ? 'Out' : product.stock}
                            </span>
                          </div>

                          {/* Action Button */}
                          <div className="col-span-2 flex justify-center">
                            <button
                              disabled={isOutOfStock}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${isOutOfStock ? 'bg-gray-200 text-gray-400' : 'bg-white border border-gray-200 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-md'
                                }`}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {paginatedProducts.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <Search className="w-6 h-6 opacity-50" />
                        </div>
                        <p className="text-sm font-medium">No items found in this section</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-4 mt-auto bg-white/50 backdrop-blur-sm rounded-xl shrink-0">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 px-4 rounded-lg border border-gray-200 hover:bg-white bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-gray-600 text-sm flex items-center gap-2"
                >
                  <span>Prev</span>
                </button>
                <span className="text-sm font-bold text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 px-4 rounded-lg border border-gray-200 hover:bg-white bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-gray-600 text-sm flex items-center gap-2"
                >
                  <span>Next</span>
                </button>
              </div>
            )}
          </div>
        }
        rightPanel={
          <CartSidebar
            cart={cart}
            customer={selectedCustomer}
            onSelectCustomer={() => setShowCustomerModal(true)}
            onRemoveCustomer={() => setSelectedCustomer(null)}
            onUpdateQty={updateQty}
            onUpdateDiscount={updateItemDiscount} // Passed Here
            subtotal={subtotal}
            tax={tax}
            total={total}
            onRemoveItem={(id) => updateQty(id, 0)}
            onPlaceOrder={handlePlaceOrder}
            // New Props
            billingType={billingType}
            setBillingType={setBillingType}
            paymentMode={paymentMode}
            setPaymentMode={setPaymentMode}
            gstEnabled={gstEnabled}
            setGstEnabled={setGstEnabled}
            invoiceNo={invoiceNo}
            onClearCart={handleClearCart}
          />
        }
      />

      {/* Modal */}
      <ProductDetailModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onAddToCart={addToCart}
      />
      <CustomerSelectionModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customers={customers}
        onSelect={setSelectedCustomer}
        onAddNew={() => {
          setShowCustomerModal(false);
          navigate('/customers');
        }}
      />

      {showScanner && (
        <BarcodeScanner
          onResult={(barcode) => {
            setSearchQuery(barcode);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
