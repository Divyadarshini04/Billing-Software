import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Download, Upload, Package, AlertTriangle, DollarSign, Calendar, X, CheckCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { NotificationContext } from "../context/NotificationContext";
import { useExportSuccess } from "../context/ExportSuccessContext";
import { productAPI, inventoryAPI, categoryAPI, supplierAPI, purchaseAPI } from "../api/apiService";

// Mock data removed

import { useLocation } from "react-router-dom";

export default function InventoryPage() {
  const { userRole } = useAuth();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const { addNotification } = useContext(NotificationContext);
  const exportSuccess = useExportSuccess();
  const canManageInventory = userRole === 'OWNER' || userRole === 'SUPER_ADMIN';
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Effect to handle query parameters for deep linking (e.g., ?status=Low%20Stock)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status");
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [location.search]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateFilterActive, setDateFilterActive] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [alertItems, setAlertItems] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSuppliers, setAvailableSuppliers] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    category: "",
    sku: "",
    hsn_code: "",
    unit: "Piece",
    gst: 0,
    barcode: "",
    stock: 0,
    purchasePrice: "",
    sellingPrice: "",
    status: "In Stock",
    dateAdded: new Date().toISOString().split('T')[0],
    isActive: true
  });

  // Helper for safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return "Error";
    }
  };

  // Fetch products from backend on mount
  useEffect(() => {
    fetchCategoriesAndProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCategoriesAndProducts() {
    try {
      // Fetch categories from API

      const categoriesResponse = await categoryAPI.getAllCategories();

      let categoriesData = Array.isArray(categoriesResponse.data)
        ? categoriesResponse.data
        : categoriesResponse.data?.results || categoriesResponse.data?.data || [];

      if (categoriesData.length > 0) {
        setAvailableCategories(categoriesData);
      } else {

        setAvailableCategories([]);
      }
    } catch (error) {

      setAvailableCategories([]);
    }

    try {
      const suppliersResponse = await supplierAPI.getAllSuppliers();
      let suppliersData = Array.isArray(suppliersResponse.data)
        ? suppliersResponse.data
        : suppliersResponse.data?.results || suppliersResponse.data?.data || [];
      if (suppliersData.length > 0) {
        setAvailableSuppliers(suppliersData);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    }


    // Fetch products after categories
    fetchProducts();
  }

  // Helper function to generate SKU based on category and product name
  function generateSKU(productName, category, existingProducts) {
    // Create category code (first 3 letters of category, uppercase)
    const categoryCode = category.substring(0, 3).toUpperCase();

    // Create product code (first letters of each word, uppercase)
    const productCode = productName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 3);

    // Find the next sequential number for this category-product combination
    const baseCode = `${categoryCode}-${productCode}`;
    const existingCount = existingProducts.filter(p =>
      p.sku && p.sku.startsWith(baseCode)
    ).length;

    // Format: CAT-PRD-001, CAT-PRD-002, etc.
    return `${baseCode}-${String(existingCount + 1).padStart(3, '0')}`;
  }

  // Helper function to normalize products with dateAdded and isActive
  function normalizeProducts(products) {
    return products.map(p => {
      // Extract category name - handle both object and string formats
      let categoryName = "";
      if (typeof p.category === 'object' && p.category?.name) {
        categoryName = p.category.name;
      } else if (typeof p.category === 'string') {
        categoryName = p.category;
      }

      return {
        // Preserve original backend fields
        id: p.id,
        product_code: p.product_code,
        name: p.name,
        image: p.image,
        description: p.description,
        is_active: p.is_active,
        created_at: p.created_at,
        updated_at: p.updated_at,
        cost_price: p.cost_price,
        unit_price: p.unit_price,
        tax_rate: p.tax_rate,
        tax_rate: p.tax_rate,
        reorder_level: p.reorder_level,
        reorder_quantity: p.reorder_quantity,
        preferred_supplier: p.preferred_supplier,
        preferred_supplier_id: p.preferred_supplier_id || (typeof p.preferred_supplier === 'object' ? p.preferred_supplier?.id : p.preferred_supplier) || null,
        supplier_name: p.preferred_supplier_name || (typeof p.preferred_supplier === 'object' ? p.preferred_supplier?.name : null) || (p.preferred_supplier_id ? `Supplier #${p.preferred_supplier_id}` : "No Supplier"),
        stock: Number(p.stock) || 0,
        // Map to frontend field names for display
        sku: p.product_code || p.sku || "",
        hsn_code: p.hsn_code || "",
        unit: p.unit || "Piece",
        sellingPrice: Number(p.unit_price || p.selling_price || p.sellingPrice) || 0,
        purchasePrice: Number(p.cost_price || p.purchase_price || p.purchasePrice) || 0,
        tax: Number(p.tax_rate || p.tax) || 0,
        dateAdded: p.dateAdded || p.created_at || new Date().toISOString().split('T')[0],
        category: categoryName,
        status: (Number(p.stock) || 0) > 100 ? "In Stock" : (Number(p.stock) || 0) > 0 ? "Low Stock" : "Out of Stock",
        isActive: p.is_active !== undefined ? p.is_active : true
      };
    });
  }

  async function fetchProducts() {
    setLoading(true);
    try {

      // Fetch products
      const productsResponse = await productAPI.getAllProducts();

      let productsData = Array.isArray(productsResponse.data)
        ? productsResponse.data
        : productsResponse.data?.results || productsResponse.data?.data || [];

      // Fetch inventory batches
      let batchData = [];
      try {
        const batchesResponse = await inventoryAPI.getBatches();

        batchData = Array.isArray(batchesResponse.data)
          ? batchesResponse.data
          : batchesResponse.data?.results || [];
      } catch (batchError) {

      }

      if (productsData && Array.isArray(productsData) && productsData.length > 0) {
        // Normalize and enrich products with batch/inventory data if available
        const normalizedProducts = normalizeProducts(productsData);
        const enrichedProducts = normalizedProducts.map(product => {
          const productBatches = batchData.filter(b => b.product_id === product.id);
          const hasBatches = productBatches.length > 0;

          const totalStockFromBatches = productBatches.reduce((sum, b) => sum + (Number(b.remaining_quantity) || 0), 0);

          // Logic: If batches exist, they are the source of truth (even if sum is 0).
          // If no batches exist, we use the product's base stock.
          const finalStock = hasBatches ? totalStockFromBatches : (Number(product.stock) || 0);

          return {
            ...product,
            batches: productBatches,
            totalStock: totalStockFromBatches,
            stock: finalStock,
            status: finalStock > 100 ? "In Stock" : finalStock > 0 ? "Low Stock" : "Out of Stock"
          };
        });

        setProducts(enrichedProducts);
      } else {

        setProducts([]);
      }

    } catch (error) {

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch = (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "All Categories" || p.category === categoryFilter;

    // Stock Status Filter
    const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;

    // Only apply date filtering if it's active
    let matchesDate = true;
    if (dateFilterActive && p.dateAdded) {
      const productDate = new Date(p.dateAdded);
      // Ensure date is valid before comparing
      if (!isNaN(productDate.getTime())) {
        matchesDate =
          productDate.getDate() === selectedDate.getDate() &&
          productDate.getMonth() === selectedDate.getMonth() &&
          productDate.getFullYear() === selectedDate.getFullYear();
      }
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  // Reset to first page when filtering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, dateFilterActive, selectedDate]);

  // Helper function to get available categories
  function getAvailableCategories() {
    // Return state-managed categories
    return availableCategories;
  }

  const categories = ["All Categories", ...getAvailableCategories().map(c => c.name)];
  const statuses = ["All Status", "In Stock", "Low Stock", "Out of Stock"];

  async function saveProduct(updated) {
    try {
      if (!updated.name || !updated.category) {
        alert("Product Name and Category are mandatory.");
        return;
      }

      // Ensure we have an ID
      if (!updated.id) {

        alert("Error: Product ID is missing");
        return;
      }

      // Map frontend fields to backend field names
      const formData = new FormData();
      formData.append("name", updated.name);

      // Ensure product_code is not "undefined" string
      const sku = updated.product_code || updated.sku;
      if (sku) {
        formData.append("product_code", sku);
      }

      // Handle optional fields carefully for FormData
      if (updated.hsn_code) formData.append("hsn_code", updated.hsn_code);

      // Ensure unit has a valid value, default to "Piece" if missing
      formData.append("unit", updated.unit || "Piece");

      formData.append("stock", parseInt(updated.stock) || 0);
      formData.append("cost_price", parseFloat(updated.purchasePrice || updated.cost_price) || 0);
      formData.append("unit_price", parseFloat(updated.sellingPrice || updated.unit_price) || 0);
      formData.append("tax_rate", parseFloat(updated.gst || updated.tax || updated.tax_rate) || 0);

      // Handle boolean carefully - FormData converts boolean to string "true"/"false"
      // Backend BooleanField accepts "true"/"false" strings
      const isActive = updated.isActive !== undefined ? updated.isActive : (updated.is_active !== undefined ? updated.is_active : true);
      formData.append("is_active", isActive);

      formData.append("reorder_level", parseInt(updated.reorder_level) || 10);
      formData.append("reorder_quantity", parseInt(updated.reorder_quantity) || 10);

      // Only append supplier ID if it's a valid truthy value
      if (updated.preferred_supplier_id) {
        formData.append("preferred_supplier_id", updated.preferred_supplier_id);
      } else {
        // If we want to clear the supplier, we should send null (or empty string might work depending on DRF)
        // Since we are using PATCH, if we omit it, it won't change. 
        // If we explicitly want to clear it (e.g. user selected "No Supplier"), we might need to send null.
        // But FormData append('key', null) sends string "null".
        // DRF PrimaryKeyRelatedField usually handles empty string as null if valid, or we skip.
        // For now, let's skip if falsy. If user wants to clear, we might need special handling.
      }

      // Only append image if it is a NEW file
      if (updated.image instanceof File) {
        formData.append("image", updated.image);
      }

      // Add category_id if we have it
      if (updated.category_id) {
        formData.append("category_id", updated.category_id);
      } else if (updated.category && typeof updated.category === 'string') {
        // Find category ID from category name
        const selectedCategory = availableCategories.find(cat => cat.name === updated.category);
        if (selectedCategory) {
          formData.append("category_id", selectedCategory.id);
        }
      }

      // Update on backend


      // Debug: Log FormData contents
      // Note: formData.entries() returns an iterator, need to loop or spread to see content
      const debugData = {};
      for (const [key, value] of formData.entries()) {
        debugData[key] = value;
      }
      console.log("Submitting Product Update:", updated.id, debugData);

      const response = await productAPI.updateProduct(updated.id, formData);

      const data = response.data;
      if (data) {
        // Normalize the response before updating state
        const normalizedData = normalizeProducts([data])[0];

        const updatedProducts = products.map((it) => {
          if (it.id === updated.id) {
            // Preserve batch data and totalStock from the existing item
            // This prevents "Out of Stock" glitch when toggling active state if stock comes from batches
            const preservedBatches = it.batches || [];
            const preservedTotalStock = it.totalStock !== undefined ? it.totalStock : it.stock;

            // If we have batches (or had totalStock calculated), use that for the final stock/status
            // Otherwise use the returned stock from the update
            const finalStock = preservedBatches.length > 0 ? preservedTotalStock : normalizedData.stock;

            return {
              ...normalizedData,
              batches: preservedBatches,
              totalStock: preservedTotalStock,
              stock: finalStock,
              status: finalStock > 100 ? "In Stock" : finalStock > 0 ? "Low Stock" : "Out of Stock"
            };
          }
          return it;
        });

        setProducts(updatedProducts);
        addNotification("product", "Product Updated", `${updated.name} has been updated successfully`);
      }
      setEditing(null);
    } catch (error) {
      console.error("Update Product Failed:", error.response?.data || error);
      const errorData = error.response?.data || {};

      let msg = "Failed to update product on server";
      if (errorData.detail) msg = errorData.detail;
      else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
        // Format field errors
        msg = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val[0] : val}`)
          .join(", ");
      }

      addNotification("error", "Update Failed", msg);
    }
  }

  async function handleAddProduct() {

    try {
      // Check if categories exist
      if (availableCategories.length === 0) {

        alert("⚠️ Please create product categories first!\n\nGo to Admin → Categories to add categories.");
        return;
      }

      // Validate required fields
      if (!newProduct.name || !newProduct.category) {
        alert("Please fill in Product Name and Category");
        return;
      }

      // Validate numeric fields
      const sellingPrice = parseFloat(newProduct.sellingPrice);
      const stock = parseFloat(newProduct.stock);
      const purchasePrice = newProduct.purchasePrice ? parseFloat(newProduct.purchasePrice) : 0;

      if (isNaN(sellingPrice) || sellingPrice <= 0) {

        alert("❌ Selling Price is required and must be greater than 0");
        return;
      }

      if (isNaN(stock) || stock < 0) {

        alert("❌ Stock must be a valid number (0 or more)");
        return;
      }

      // Find category ID from category name
      const selectedCategory = availableCategories.find(cat => cat.name === newProduct.category);
      if (!selectedCategory) {

        alert("Please select a valid category");
        return;
      }

      // Generate product code (SKU) based on category and product name
      const productCode = newProduct.sku || generateSKU(newProduct.name, newProduct.category, products);

      // Create FormData
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("product_code", productCode);
      formData.append("hsn_code", newProduct.hsn_code || "");
      formData.append("unit", newProduct.unit);
      formData.append("category_id", selectedCategory.id);
      formData.append("stock", 0);
      formData.append("cost_price", purchasePrice || 0);
      formData.append("unit_price", sellingPrice || 0);
      formData.append("tax_rate", newProduct.gst || 0);
      formData.append("is_active", newProduct.isActive !== undefined ? newProduct.isActive : true);
      formData.append("reorder_level", 10);
      formData.append("reorder_quantity", parseInt(newProduct.reorder_quantity) || 10);
      formData.append("preferred_supplier_id", newProduct.preferred_supplier_id);

      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }

      const response = await productAPI.createProduct(formData);

      // Backend returns the created product - handle different response structures
      const savedProduct = response.data?.data || response.data;

      // Normalize the created product before adding to state
      const normalizedProduct = normalizeProducts([savedProduct])[0];
      const updatedProducts = [...products, normalizedProduct];
      setProducts(updatedProducts);
      addNotification("product", "Product Added", `${newProduct.name} added successfully to backend`);

      // Reset form and close modal
      setNewProduct({
        name: "",
        category: "",
        sku: "",
        hsn_code: "",
        unit: "Piece",
        gst: 0,
        barcode: "",
        stock: 0,
        purchasePrice: "",
        sellingPrice: "",
        status: "In Stock",
        dateAdded: new Date().toISOString().split('T')[0],
        isActive: true,
        image: null
      });
      setShowAddModal(false);

      try { exportSuccess.showExportSuccess(`Product ${newProduct.name} added successfully!`); } catch (e) { }
    } catch (error) {
      console.error("Add Product Failed:", error);
      const errorData = error.response?.data || {};

      let msg = "Failed to add product";
      if (errorData.detail) msg = errorData.detail;
      else if (errorData.message) msg = errorData.message;
      else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
        // Join field-specific errors
        msg = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors[0] : errors}`)
          .join(", ");
      } else if (error.message) msg = error.message;

      if (typeof addNotification === 'function') {
        addNotification("error", "Add Failed", msg);
      }
    }

  }

  async function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!window.confirm(`Delete ${product?.name || 'this product'}? This cannot be undone.`)) {
      return;
    }

    try {
      // Delete from backend
      await productAPI.deleteProduct(id);
      const updatedProducts = products.filter((it) => it.id !== id);
      setProducts(updatedProducts);
      addNotification("product", "Product Deleted", `${product?.name} has been removed`);
    } catch (error) {

      addNotification("error", "Delete Failed", "Failed to delete product from server");
    }

  }

  // Export Products to Excel
  function handleExportProducts() {
    try {
      const worksheet = XLSX.utils.json_to_sheet(products);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
      XLSX.writeFile(workbook, `inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
      addNotification("product", "Export Successful", `${products.length} products exported from Inventory`);
      try { exportSuccess.showExportSuccess(`${products.length} products exported from Inventory`); } catch (e) { }
    } catch (error) {
      alert("⚠️ Error exporting file: " + error.message);
    }
  }

  // Import Products from Excel
  function handleImportProducts(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newProducts = jsonData.map((item, idx) => {
          const product = {
            id: `p_${Date.now()}_${idx}`,
            name: item.name || "Unnamed",
            category: item.category || "General",
            sku: item.sku || generateSKU(item.name || "Unnamed", item.category || "General", [...products].slice(0, idx)),
            barcode: item.barcode || `BAR-${idx}`,
            stock: parseInt(item.stock) || 0,
            purchasePrice: parseFloat(item.purchasePrice) || 0,
            sellingPrice: parseFloat(item.sellingPrice) || 0,
            tax: parseFloat(item.tax) || 0,
            status: item.stock > 100 ? "In Stock" : item.stock > 0 ? "Low Stock" : "Out of Stock"
          };
          return product;
        });

        setProducts([...products, ...newProducts]);
        setTimeout(() => {
          addNotification("product", "Import Successful", `${newProducts.length} products imported into Inventory`);
          try { exportSuccess.showExportSuccess(`${newProducts.length} products imported into Inventory`); } catch (e) { }
        }, 200);
      } catch (error) {
        alert("⚠️ Error importing file: " + error.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  }

  // Calculate statistics using the pre-calculated status for consistency
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.status === "In Stock").length;
  const lowStockProducts = products.filter(p => p.status === "Low Stock").length;
  const outOfStockProducts = products.filter(p => p.status === "Out of Stock").length;
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.purchasePrice || 0)), 0);

  // Calendar helper functions

  // Check if user has permission to view inventory
  if (!hasPermission(userRole, 'view_inventory')) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg p-4 md:p-8 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">You don't have permission to view inventory. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg p-4 md:p-8 transition-colors">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Spice Garden Restaurant - Track stock levels and product information</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                try {
                  const res = await productAPI.checkStockAlerts();
                  const { alerts_generated, supplier_notifications, alert_items } = res.data;
                  addNotification("info", "Stock Check Complete", `Alerts: ${alerts_generated}, Notifications: ${supplier_notifications}`);
                  if (alert_items && alert_items.length > 0) {
                    setAlertItems(alert_items);
                    setShowAlertsModal(true);
                  } else {
                    alert("✅ All items are in stock! No new alerts generated.");
                  }
                  fetchProducts(); // Refresh to see updates
                } catch (e) {
                  addNotification("error", "Check Failed", "Could not check stock alerts");
                }
              }}
              className="px-6 py-3 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              Check Alerts
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportProducts}
              className="px-6 py-3 flex items-center gap-2 bg-white dark:bg-dark-card border-2 border-blue-200 dark:border-dark-border text-gray-900 dark:text-white rounded-lg font-bold hover:border-blue-500 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </motion.button>

            {canManageInventory && (
              <>
                <label className="px-6 py-3 flex items-center gap-2 bg-white dark:bg-dark-card border-2 border-blue-200 text-gray-900 dark:text-white rounded-lg font-bold hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Import Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImportProducts}
                    className="hidden"
                  />
                </label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (availableCategories.length === 0) {
                      alert("⚠️ Please create product categories first!\n\nGo to Admin → Categories to add categories.");
                      return;
                    }
                    setShowAddModal(true);
                  }}
                  className="px-6 py-3 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Product
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div >

      {/* Stats Cards */}
      < motion.div
        initial={{ opacity: 0 }
        }
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        {
          [
            { title: "Total Products", value: totalProducts, subtitle: "Active inventory items", icon: Package, color: "bg-blue-50", textColor: "text-blue-600", filterValue: "All Status" },
            { title: "In Stock", value: inStockProducts, subtitle: "Products available", icon: Package, color: "bg-blue-50", textColor: "text-blue-600", filterValue: "In Stock" },
            { title: "Low Stock", value: lowStockProducts, subtitle: "Items need restocking", icon: AlertTriangle, color: "bg-yellow-50", textColor: "text-yellow-600", filterValue: "Low Stock" },
            { title: "Out of Stock", value: outOfStockProducts, subtitle: "Unavailable products", icon: AlertTriangle, color: "bg-red-50", textColor: "text-red-600", filterValue: "Out of Stock" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            const isActive = statusFilter === stat.filterValue;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setStatusFilter(isActive ? "All Status" : stat.filterValue)}
                className={`${stat.color} dark:bg-opacity-10 rounded-lg p-6 border transition-all cursor-pointer ${isActive ? 'ring-2 ring-offset-2 ring-blue-500 border-blue-500 shadow-md' : 'border-blue-200 dark:border-dark-border hover:shadow-lg'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{stat.title}</p>
                    <p className={`${stat.textColor} dark:brightness-125 text-3xl font-bold mb-1`}>{stat.value}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{stat.subtitle}</p>
                  </div>
                  <div className={`${stat.textColor} opacity-20`}>
                    <Icon className="w-8 h-8" />
                  </div>
                </div>
              </motion.div>
            );
          })
        }
      </motion.div >

      {/* Inventory Value Card */}
      < motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 rounded-lg p-6 border border-indigo-200 dark:border-slate-700 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Inventory Value</p>
            <p className="text-purple-600 dark:text-purple-400 text-3xl font-bold">₹{totalInventoryValue.toLocaleString()}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Current stock valuation</p>
          </div>
          <div className="text-purple-600 opacity-20">
            <DollarSign className="w-10 h-10" />
          </div>
        </div>
      </motion.div >

      {/* Search and Filters */}
      < motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-card rounded-lg border border-blue-200 dark:border-dark-border p-6 mb-6"
      >
        <div className="flex flex-col gap-4">
          {/* Search with Calendar Dropdowns */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, SKU, or barcode..."
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            {/* Date Selector */}
            <div className="flex gap-2 items-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <select
                value={String(selectedDate.getDate())}
                onChange={(e) => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(parseInt(e.target.value));
                  setSelectedDate(newDate);
                  setDateFilterActive(true);
                }}
                className="px-2 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium w-16"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={String(day)}>{day}</option>
                ))}
              </select>
              <select
                value={String(selectedDate.getMonth())}
                onChange={(e) => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(parseInt(e.target.value));
                  setSelectedDate(newDate);
                  setDateFilterActive(true);
                }}
                className="px-2 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium w-20"
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                  <option key={idx} value={String(idx)}>{month}</option>
                ))}
              </select>
              <select
                value={String(selectedDate.getFullYear())}
                onChange={(e) => {
                  const newDate = new Date(selectedDate);
                  newDate.setFullYear(parseInt(e.target.value));
                  setSelectedDate(newDate);
                  setDateFilterActive(true);
                }}
                className="px-2 py-2.5 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium w-20"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                  <option key={year} value={String(year)}>{year}</option>
                ))}
              </select>
              <button
                onClick={() => setDateFilterActive(false)}
                className="px-3 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-card rounded-lg border border-blue-200 dark:border-dark-border overflow-hidden shadow-sm"
      >
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Products ({filtered.length})</h2>
        </div>

        {
          filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 dark:bg-slate-700/50 border-b border-blue-200 dark:border-dark-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">HSN Code</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Supplier</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Stock</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Purchase Price</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Selling Price</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Date Added</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((p, idx) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-blue-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{p.unit}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{p.hsn_code || "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{p.category}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={`text-sm font-bold italic flex items-center gap-1 ${p.preferred_supplier_id ? "text-blue-600 dark:text-blue-400" : "text-red-500"}`}>
                          {!p.preferred_supplier_id && <AlertTriangle className="w-4 h-4" />}
                          {p.supplier_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-900 dark:text-white">{p.stock}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">₹{p.purchasePrice}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">₹{p.sellingPrice}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-sm text-gray-900 dark:text-white">{formatDate(p.dateAdded)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${p.status === "In Stock"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : p.status === "Low Stock"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (!canManageInventory) return;
                            const updatedProduct = { ...p, isActive: !p.isActive };
                            saveProduct(updatedProduct);
                          }}
                          disabled={!canManageInventory}
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all ${p.isActive
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50"
                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                            } ${!canManageInventory ? 'cursor-not-allowed opacity-70' : ''}`}
                        >
                          {p.isActive ? "✓ Active" : "Inactive"}
                        </motion.button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {canManageInventory && (
                          <div className="flex items-center justify-center gap-2 transition-opacity group">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditing(p)}
                              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteProduct(p.id)}
                              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </motion.div >

      {/* Pagination Controls */}
      {filtered.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-4 border-t border-gray-200 dark:border-dark-border pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-bold">{filtered.length}</span> results
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-card dark:text-gray-300 dark:border-dark-border dark:hover:bg-slate-800"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(Math.ceil(filtered.length / itemsPerPage))].map((_, i) => {
                const pageNumber = i + 1;
                // Show current page, first, last, and surrounding pages
                if (
                  pageNumber === 1 ||
                  pageNumber === Math.ceil(filtered.length / itemsPerPage) ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === pageNumber
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-dark-card dark:text-gray-300 dark:border-dark-border dark:hover:bg-slate-800"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={i} className="text-gray-500">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filtered.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-card dark:text-gray-300 dark:border-dark-border dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-dark-card rounded-lg p-8 max-w-2xl w-full shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Product</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Tomato Soup"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                <select
                  required
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Primary Supplier *</label>
                <select
                  required
                  className="w-full px-4 py-2 rounded-lg border-2 border-orange-200 dark:border-orange-900/30 dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newProduct.preferred_supplier_id || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, preferred_supplier_id: e.target.value })}
                >
                  <option value="">Select Primary Supplier</option>
                  {availableSuppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">HSN Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct.hsn_code}
                  onChange={(e) => setNewProduct({ ...newProduct, hsn_code: e.target.value })}
                  placeholder="Enter HSN Code"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Unit</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  >
                    {["Piece", "Kg", "Litre", "Box", "Meter"].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">GST %</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newProduct.gst}
                    onChange={(e) => setNewProduct({ ...newProduct, gst: Number(e.target.value) })}
                  >
                    {[0, 5, 12, 18, 28].map(rate => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Selling Price *</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct.sellingPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddProduct}
                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
              >
                Add Product
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Modal */}
      {
        editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Product</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editing.category}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      // Auto-generate new SKU when category changes
                      const newSKU = generateSKU(editing.name, newCategory, products.filter(p => p.id !== editing.id));
                      setEditing({ ...editing, category: newCategory, sku: newSKU });
                    }}
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Primary Supplier *</label>
                  <select
                    required
                    className="w-full px-4 py-2 rounded-lg border-2 border-orange-200 dark:border-orange-900/30 dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={editing.preferred_supplier_id || ""}
                    onChange={(e) => setEditing({ ...editing, preferred_supplier_id: e.target.value })}
                  >
                    <option value="">Select Primary Supplier</option>
                    {availableSuppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">HSN Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editing.hsn_code || ""}
                    onChange={(e) => setEditing({ ...editing, hsn_code: e.target.value })}
                    placeholder="Enter HSN Code"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Unit</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editing.unit || "Piece"}
                      onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                    >
                      {["Piece", "Kg", "Litre", "Box", "Meter"].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">GST %</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editing.tax}
                      onChange={(e) => setEditing({ ...editing, tax: Number(e.target.value) })}
                    >
                      {[0, 5, 12, 18, 28].map(rate => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Current Stock (Read-Only)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 dark:border-dark-border dark:bg-dark-card dark:text-gray-400 cursor-not-allowed"
                    value={editing.stock}
                    readOnly
                    title="Stock can only be updated via Stock Inward/Sales"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Purchase Price</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editing.purchasePrice}
                    onChange={(e) => setEditing({ ...editing, purchasePrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Selling Price</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editing.sellingPrice}
                    onChange={(e) => setEditing({ ...editing, sellingPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Update Product Image</label>

                  {editing.image && (
                    <div className="mb-4 flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shadow-sm relative group">
                        <img
                          src={
                            typeof editing.image === 'string'
                              ? (editing.image.startsWith('http') ? editing.image : `http://127.0.0.1:8000${editing.image}`)
                              : URL.createObjectURL(editing.image)
                          }
                          alt="Product Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {/* Fallback emoji if image fails */}
                        <div className="absolute inset-0 flex items-center justify-center text-2xl -z-10">
                          🥘
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {typeof editing.image === 'string' ? 'Current Image' : 'New Image Selected'}
                        </span>
                        {typeof editing.image === 'object' && (
                          <span className="text-xs text-green-600 font-medium">Ready to upload</span>
                        )}
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditing({ ...editing, image: e.target.files[0] });
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                {canManageInventory && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => saveProduct(editing)}
                    className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
                  >
                    Save Changes
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 rounded-lg border-2 border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )
      }

      {/* Stock Alerts Modal */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                Low Stock Alerts
              </h2>
              <button onClick={() => setShowAlertsModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The following {alertItems.length} items are currently at or below their reorder levels. Please contact your suppliers.
            </p>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6">
              {alertItems.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30 bg-yellow-50/50 dark:bg-yellow-900/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{item.stock_status}</span>
                      <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                    </div>
                    <div className="flex gap-4 mt-1">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium font-bold">Stock: {item.stock}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reorder Level: {item.reorder_level}</p>
                    </div>
                    {item.preferred_supplier && (
                      <p className={`text-xs mt-1 font-medium italic ${item.supplier_id ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 font-bold'}`}>
                        Supplier: {item.preferred_supplier}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {item.notified ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-lg text-xs font-bold flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        Message Sent
                      </span>
                    ) : item.supplier_id ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold">
                        Pending
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-lg text-xs font-bold">
                        No Supplier
                      </span>
                    )}
                    <button
                      onClick={() => {
                        const product = products.find(p => p.id === item.id);
                        if (product) setEditing(product);
                        setShowAlertsModal(false);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleExportProducts();
                  setShowAlertsModal(false);
                }}
                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export List
              </button>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div >
  );
}