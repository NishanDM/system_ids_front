// GRN.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import devicesList from "./devices.json";
import StockUpdateOverlay from "./StockUpdateOverlay";
import AddGRNItemManualForMac from "./AddGRNItemManualForMac";
import CatalogModal from "./CatalogModal";
/**
 * GRN.jsx
 *
 * Props:
 *  - open (bool) : whether modal is visible
 *  - onClose (fn) : called when modal closed
 *  - onSave (fn)  : called with GRN payload when Save GRN is clicked
 *
 * This component uses Tailwind CSS classes only. All text uses `text-xs`.
 *
 * Customize `itemOptions` and `attributeConfigs` to reflect your real catalog.
 */

export default function MacGRN({ open = true, onClose = () => {}, onSave = (payload) => {} }) {

//===================FETCHING SUPPLIERS====================
  // Suppliers dropdown
  const [suppliers, setSuppliers] = useState([]);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
//===============ADD A NEW SUPPLIER===========
// Add at the top with other useState hooks
const [newSupplierName, setNewSupplierName] = useState("");
const [newSupplierPhone, setNewSupplierPhone] = useState("");
const [newSupplierEmail, setNewSupplierEmail] = useState("");
const [newSupplierLocation, setNewSupplierLocation] = useState("");
const [paymentMethodOfGRN, setpaymentMethodOfGRN] = useState("");
const [currentStockQty, setCurrentStockQty] = useState(null);
const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
const [overlayOpen, setOverlayOpen] = useState(false);
const [overlayMessage, setOverlayMessage] = useState("");
const [manualItemOpen, setManualItemOpen] = useState(false);
const [partModalOpen, setPartModalOpen] = useState(false);
const [productModalOpen, setProductModalOpen] = useState(false);

// const valuesForAccessories = require("./devices.json");


// const valuesForAccessories = require("./devices.json");
function handleAttemptClose() {
  if (items.length > 0) {
    // There are items in table, show confirmation modal
    setConfirmCloseOpen(true);
  } else {
    // Safe to close
    onClose();
  }
}

const handleAddSupplier = async () => {
  if (!newSupplierName.trim()) {
    alert("Supplier name is required.");
    return;
  }

  const newSupplier = {
    supplierName: newSupplierName,
    contactPhone: newSupplierPhone,
    contactEmail: newSupplierEmail || "N/A",
    location: newSupplierLocation,
  };

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/suppliers`, newSupplier);
    if (!response.data) throw new Error("Failed to add supplier");

    // Close modal
    setAddSupplierOpen(false);
    // Reset form
    setNewSupplierName("");
    setNewSupplierPhone("");
    setNewSupplierEmail("");
    setNewSupplierLocation("");

    // Update suppliers list with new supplier
    setSuppliers(prev => [...prev, response.data]);
    setSupplier(response.data.supplierName); // optionally auto-select new supplier

    alert("Supplier added successfully!");
  } catch (error) {
    console.error(error);
    alert("Error adding supplier");
  }
};

  // Fetch suppliers from backend
  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/suppliers`);
        setSuppliers(res.data); // assuming res.data is array of suppliers
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      }
    }
    fetchSuppliers();
  }, []);

  useEffect(() => {
  if (addSupplierOpen) {
    document.getElementById("newSupplierName")?.focus();
  }
}, [addSupplierOpen]);


  // Header fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [invoice, setInvoice] = useState("");
  const [supplier, setSupplier] = useState("");

  // Item entry state
  const [category, setCategory] = useState(""); // "spare", "accessory", "product"
  const [selectedItemKey, setSelectedItemKey] = useState(""); // key from itemOptions
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [attributes, setAttributes] = useState({});

  // GRN table
  const [items, setItems] = useState([]);
  const [stockUpdated, setStockUpdated] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);


  const [matchedDescriptions, setMatchedDescriptions] = useState([]); // list of options
const [selectDescriptionModalOpen, setSelectDescriptionModalOpen] = useState(false); // show/hide modal

 // ======================== ITEM OPTIONS ==========================
  const [itemOptions, setItemOptions] = useState({
    spare: [],
    accessory: [],
    product: [],
  });

// Define fetchCatalog outside useEffect
async function fetchCatalog() {
  try {
    const [productsRes, sparesRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/macbookdata/type/product`),
      axios.get(`${import.meta.env.VITE_API_URL}/api/macbookdata/type/itemOptions`),
    ]);

    setItemOptions((prev) => ({
      ...prev,
      product: productsRes.data[0]?.items || [],
      spare: sparesRes.data.find(d => d.category === "spare")?.items || [],
    }));
  } catch (err) {
    console.error("Failed to fetch catalog:", err);
  }
}

// Call it in useEffect
useEffect(() => {
  fetchCatalog();
}, []);

  /**
   * attributeConfigs defines which extra fields to collect per catalog item.
   * Each config is an array of objects: { name: "fieldKey", label: "Label", placeholder, type }
   * Modify to suit your real attributes.
   */
  const attributeConfigs = useMemo(() => ({
    // common fields for spare parts
    spare: [
      { name: "description", label: "Description", placeholder: "color-any special remark", type: "text" },
      { name: "compatibility", label: "Compatible MacBook or iMac Model", placeholder: "e.g. iPhone 14 / 14 Pro", type: "text" },
      { name: "condition",    label: "Condition",   placeholder: "Select condition",   type: "select",   options: ["New", "Refurb", "Used"]   },
    ],

    accessory: [
      { name: "description", label: "Description", placeholder: "Color-any special remark", type: "text" },
      { name: "brand", label: "Brand", placeholder: "Brand", type: "text" },
      { name: "color", label: "Color", placeholder: "Color / Finish", type: "text" },
    ],
    product: [
  {name: "model", label: "Capacity", placeholder: "e.g. 128GB, 256GB", type: "select", options: ["NULL","64","128", "256", "512","1TB","2TB","8GB / 256GB","8GB / 512GB","16GB / 256GB","16GB / 512GB","16GB / 1TB","24GB / 512GB","24GB / 1TB","32GB / 512GB","32GB / 1TB","32GB / 2TB","36GB / 1TB","36GB / 2TB","48GB / 1TB","48GB / 2TB","64GB / 1TB","64GB / 2TB","64GB / 4TB","96GB / 2TB","96GB / 4TB","128GB / 4TB","128GB / 8TB"], },
  { name: "color", label: "Color", placeholder: "Color", type: "text" },
  {name: "region", label: "Region / Country", placeholder: "Select region", type: "select", options: ["ZPA", "XA", "HNA","AEA","QNA","LLA","JA","VIETNAM","NULL",], },
  { name: "serialNumber", label: <>Serial Number <span className="text-red-500 font-bold">*</span></>, placeholder: "Device serial number - mandatory", type: "text" },
  { name: "imeiNumber", label: "IMEI Number", placeholder: "Device IMEI number", type: "text" },
  { name: "condition",    label: "Condition",   placeholder: "Select condition",   type: "select",   options: ["New", "Refurb", "Used"]   },

    ],
  }), []);

  // Derived: options for current category
  const currentOptions = useMemo(() => {
    if (!category) return [];
    return itemOptions[category] || [];
  }, [category, itemOptions]);

  // When category changes, reset selected item and attributes
  React.useEffect(() => {
    setSelectedItemKey("");
    setAttributes({});
  }, [category]);

  // Helper to update an attribute field
  function setAttribute(name, value) {
    setAttributes(prev => ({ ...prev, [name]: value }));
  }

  function resetItemForm() {
    setCategory("");
    setSelectedItemKey("");
    setQty(1);
    setUnitPrice("");
    setAttributes({});
  }

  function validateItemEntry() {
    if (!category) return { ok: false, msg: "Select category" };
    if (!selectedItemKey) return { ok: false, msg: "Select item" };
    if (!qty || isNaN(qty) || Number(qty) <= 0) return { ok: false, msg: "Enter quantity > 0" };
    if (unitPrice === "" || isNaN(unitPrice) || Number(unitPrice) < 0) return { ok: false, msg: "Enter valid unit price" };
    // require required attributes (all attribute fields must have some value except serialOrIMEI which is optional)
    const required = (attributeConfigs[category] || []).filter(a => a.name !== "serialOrIMEI");
    for (const a of required) {
      if (!attributes[a.name] || String(attributes[a.name]).trim() === "") {
        return { ok: false, msg: `Enter ${a.label}` };
      }
    }
    return { ok: true };
  }

  function handleAddItem() {
    const v = validateItemEntry();
    if (!v.ok) {
      alert(v.msg);
      return;
    }
    const option = (currentOptions.find(o => o.key === selectedItemKey) || { label: selectedItemKey });
    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      category,
      key: selectedItemKey,
      label: option.label,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      attributes: { ...attributes },
      lineTotal: Number(qty) * Number(unitPrice),
    };
    setItems(prev => [...prev, newItem]);
    resetItemForm();
    // If you want updating stock to auto-toggle, keep it manual as per your request
    setStockUpdated(false);
  }

  function handleDeleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    setStockUpdated(false);
  }

  const grandTotal = items.reduce((s, it) => s + Number(it.lineTotal || 0), 0);
  const [loading, setLoading] = useState(false); // loading state

const handleUpdateStock = async () => {
  if (items.length === 0) {
    alert("Add at least one item before updating stock.");
    return;
  }

  try {
    setLoading(true);
    const stockRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/stock`);
    const currentStock = stockRes.data;

    for (const grnItem of items) {

// ✅ RULE: PRODUCTS ARE ALWAYS NEW (SERIAL NUMBER UNIQUE)
      if (grnItem.category === "product") {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/stock`, {
          category: grnItem.category,
          key: grnItem.key,
          label: grnItem.label,
          qty: grnItem.qty, // usually 1, but kept flexible
          unitPrice: grnItem.unitPrice,
          attributes: grnItem.attributes, // includes serialNumber / IMEI
          createdAt: new Date().toISOString(),
        });

        continue; // ⛔ skip matching logic
      }
      // 🔁 SPARES & ACCESSORIES → MERGE LOGIC
      const existing = currentStock.find(
        s =>
          s.category === grnItem.category &&
          s.key === grnItem.key &&
          s.attributes.compatibility === grnItem.attributes.compatibility &&
          s.attributes.condition === grnItem.attributes.condition &&
          s.attributes.description === grnItem.attributes.description
      );

      if (existing) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/api/stock/${existing._id}`, {
          qty: existing.qty + grnItem.qty,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/stock`, {
          category: grnItem.category,
          key: grnItem.key,
          label: grnItem.label,
          qty: grnItem.qty,
          unitPrice: grnItem.unitPrice,
          attributes: grnItem.attributes,
          createdAt: new Date().toISOString(),
        });
      }
    }

    setStockUpdated(true);
    // alert("Stock updated successfully!");
    console.log("Stock updated successfully!");
  } catch (err) {
    console.error(err);
    alert("Error updating stock. See console.");
  } finally {
    setLoading(false);
  }
};


async function handleSaveGRN() {
  if (!supplier) {
    alert("Please select a supplier before saving.");
    return;
  }
  if (items.length === 0) {
    alert("Add at least one item before saving.");
    return;
  }

  const payload = {
    date,
    invoice,
    supplier,
    items,
    grandTotal,
    paymentMethodOfGRN,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/grn`, payload);
    if (!res.data) throw new Error("Failed to save GRN");

    // alert("GRN saved successfully!");
    console.log("GRN saved successfully!");
    // Optionally, reset form
    setDate(new Date().toISOString().slice(0, 10));
    setInvoice("");
    setSupplier("");
    setItems([]);
    setpaymentMethodOfGRN(""); 
    setStockUpdated(false);
  } catch (err) {
    console.error(err);
    alert("Error saving GRN. See console for details.");
  }
finally {
    // Always reset form and close modal
    setItems([]);
    setStockUpdated(false);
    setSaveAttempted(false);
    onClose();}
}


//==================  new function that update stock and save grn ========================================
const updateStockAndSaveGRN = async () => {
  try {
    // 🔒 Lock UI
    setOverlayMessage("Updating stock, please wait...");
    setOverlayOpen(true);

    // 1️⃣ Update stock
    await handleUpdateStock();

    // small delay to ensure state sync
    await new Promise(resolve => setTimeout(resolve, 0));

    // 🔒 Update message
    setOverlayMessage("Saving GRN, please wait...");

    // 2️⃣ Save GRN
    await handleSaveGRN();

    // ✅ Success
    console.log("Stock updated and GRN saved successfully!");
    alert("Stock updated and GRN saved successfully!");
  } catch (error) {
    console.error("Update stock & save GRN failed:", error);
    alert("Something went wrong while updating stock and saving GRN.");
  } finally {
    // 🔓 Unlock UI
    setOverlayOpen(false);
    setOverlayMessage("");
  }
};



  if (!open) return null;

  // small icon components
  const CloseIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );

  // ===========================  FETCHING DATA FROM THE DB ABOUT THE PARTICULAR SPARE PART   ======================

  useEffect(() => {
  async function fetchMatchingDescriptions() {
    if (category !== "spare" || !selectedItemKey || !attributes.compatibility || !attributes.condition) return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/stock`);
      const currentStock = res.data;

      // Filter stock items for selected part
      const matches = currentStock.filter(s =>
        s.category === category &&
        s.key === selectedItemKey &&
        s.attributes.compatibility === attributes.compatibility &&
        s.attributes.condition === attributes.condition
      );

      if (matches.length > 1) {
        // multiple descriptions found → show modal
        setMatchedDescriptions(matches); 
        setSelectDescriptionModalOpen(true);
      } else if (matches.length === 1) {
        // only 1 match → auto-fill description
        setAttribute("description", matches[0].attributes.description);
      }
    } catch (err) {
      console.error(err);
    }
  }

  fetchMatchingDescriptions();
}, [category, selectedItemKey, attributes.compatibility, attributes.condition]);

  // Auto-fill Description when spare part, compatibility, and condition are selected
useEffect(() => {
  const fetchSpareDescription = async () => {
    if (
      category === "spare" &&
      selectedItemKey &&
      attributes.compatibility &&
      attributes.condition
    ) {
      try {
        // Fetch all stock items
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stock/`);
        const stockItems = await res.json();

        // Find the matching spare part
        const matchedItem = stockItems.find(
          (item) =>
            item.category === "spare" &&
            item.key === selectedItemKey &&
            item.attributes.compatibility === attributes.compatibility &&
            item.attributes.condition === attributes.condition
        );

        if (matchedItem) {
          console.log("Matched Spare Part:", matchedItem);

          // Fetch full record using _id
          const detailRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/stock/${matchedItem._id}`
          );
          const detailData = await detailRes.json();
          console.log("Full MongoDB record:", detailData);

          // ✅ Auto-fill Description input
          if (detailData.attributes?.description) {
            setAttribute("description", detailData.attributes.description);
          }
        } else {
          console.log("No matching spare part found yet.");
        }
      } catch (err) {
        console.error("Error fetching spare part description:", err);
      }
    }
  };

  fetchSpareDescription();
}, [category, selectedItemKey, attributes.compatibility, attributes.condition]);

//=======================    FETCH THE CURRENT STOCK OF THE SELECTED SPARE PART   ====================================

useEffect(() => {
  const fetchCurrentStock = async () => {
    if (
      category === "spare" &&
      selectedItemKey &&
      attributes.compatibility &&
      attributes.condition &&
      attributes.description
    ) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/stock`);
        const stockItems = res.data;

        const matchedItem = stockItems.find(
          (item) =>
            item.category === "spare" &&
            item.key === selectedItemKey &&
            item.attributes.compatibility === attributes.compatibility &&
            item.attributes.condition === attributes.condition &&
            item.attributes.description === attributes.description
        );

        setCurrentStockQty(matchedItem ? matchedItem.qty : 0);
      } catch (err) {
        console.error("Error fetching current stock:", err);
        setCurrentStockQty(null);
      }
    } else {
      setCurrentStockQty(null);
    }
  };

  fetchCurrentStock();
}, [category, selectedItemKey, attributes.compatibility, attributes.condition, attributes.description]);

  
  return (
    // overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 p-6 text-sm min-h-[600px]">
        {/* header */}
        <div className="flex items-start justify-between space-x-4">
          <div>
            <h2 className="font-semibold text-xs">MacBook & iMac GRN (Goods Received Note)</h2>
            <p className="text-gray-600 text-[11px]">Enter the MacBook & iMac Parts here to update the stock</p>
          </div>
          <button
            onClick={() => { handleAttemptClose(); }}
            className="p-1 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
            aria-label="Close"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <hr className="my-3" />

        {/* header inputs */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-gray-700 text-xs mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1 text-xs"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs mb-1">Invoice Number</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 text-xs"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="Invoice #"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs mb-1">Supplier</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup.supplierName}>
                  {sup.supplierName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-xs mb-1">Payment Method</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={paymentMethodOfGRN}
              onChange={(e) => setpaymentMethodOfGRN(e.target.value)}
            >
              <option value="">-- Select Payment Method --</option>
              <option value="cash">CASH</option>
              <option value="credit">CREDIT</option>
              <option value="cheque">CHEQUE</option>
              <option value="banktransfer">BANKTRANSFER</option>
              <option value="card">CARD</option>
              <option value="halfpayment">HALF-PAYMENT</option>
              <option value="other">OTHER</option>
            </select>
          </div>
          <button
  onClick={() => setAddSupplierOpen(true)}
  className="tracking-wider px-2 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-800 w-fit cursor-pointer"
>
  Add Supplier
</button>

{/*============== ADD ITEM MANUALLY ==================== */}
<div className="flex items-center gap-2">
  <button
  onClick={() => setManualItemOpen(true)}
  className="tracking-wider px-2 py-1 bg-cyan-700 text-white rounded text-xs font-bold cursor-pointer w-fit hover:bg-cyan-900"
>
  Manual Item
</button> 
<p className="text-xs font-bold  w-fit mt-1">Use this button when the item is not found below</p>
</div>
        </div>

        <hr className="my-2" />

        {/* item entry area */}
        <div className="grid grid-cols-3 gap-3 items-end">
          {/* category */}
          <div>
            <label className="block text-gray-700 text-xs mb-1">Category</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="spare">Spare Part</option>
            </select>
          </div>

          {/* item select */}
          <div>
            <label className="block text-gray-700 text-xs mb-1">MacBook / iMac Part</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={selectedItemKey}
              onChange={(e) => setSelectedItemKey(e.target.value)}
              disabled={!category}
            >
              <option value="">-- Select item --</option>
              {currentOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
            
          </div>

          {/* qty & price compact */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700 text-xs mb-1">Qty</label>
              <input
                type="number"
                min="1"
                className="w-full border rounded px-2 py-1 text-xs"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs mb-1">Cost Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border rounded px-2 py-1 text-xs"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* dynamic attributes */}
{category && (
  <div className="mt-3 grid grid-cols-3 gap-3">
    {(attributeConfigs[category] || []).map(attr => {
      const isAccessoryDescDropdown =
        category === "accessory" &&
        attr.name === "description" &&
        ["back_cover", "tempered_glass", "camera_lens"].includes(selectedItemKey);

      // ✅ new condition: when category = accessory & item is back_cover / tempered_glass / camera_lens
      const isAccessoryBrandDropdown =
        category === "accessory" && attr.name === "brand" && 
        ["back_cover", "tempered_glass", "camera_lens"].includes(selectedItemKey);

// ✅ new condition: when category = product & attr.name = color
      const isProductColorDropdown =
        category === "product" && attr.name === "color";

      const productColorOptions = ["NULL","MDN", "STARLIGHT", "BLUE", "BLK", "PINK","PURPLE", "GREEN", "ULTRAMINE","TEAL","WHITE","DESERT BLACK","DESERT-TITANIUM","LAVENDRA","WHITE","SAGE","MIST BLUE","ORANGE","SILVER", "BLUE","AURA PURPLE"];

      // ✅ define available brand options
      const brandOptions = (() => {
        if (selectedItemKey === "back_cover") {
          return ["SILICON", "SILICON-MAGSAFE", "ANTI-BURST", "FULL-CLEAR-CASE","FULL-CLEAR-MAGESAFE","COLORED-CLEAR-MAGESAFE","KEEPHONE","UAG","XXUNDO","COBLUE","ROCK","JC-COMM",];
        } else if (selectedItemKey === "tempered_glass") {
          return ["SUPERD", "KEEPHONE","WIWU", "LITO", "9H","JC-COMM","BLUEO","JOYROOM","NORMAL","PRIVACY","REROS","ROCK","ROCKYMILE","MIETUBL","JC-COMM",];
        } else if (selectedItemKey === "camera_lens") {
          return ["LITO", "KEEPHONE","ROCKYMILE","CAMERA-FILM","LENS-FILM","RCSTAL","JC-COMM",];
        }
        return [];
      })();

      const valuesForAccessories = devicesList;

      return (
        <div key={attr.name}>
          <label className="block text-gray-700 text-xs mb-1">{attr.label}</label>

          {/* ✅ special case 1: accessory description dropdown */}
          {isAccessoryDescDropdown ? (
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select Model --</option>
              {valuesForAccessories.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>

          ) : isAccessoryBrandDropdown ? (
            // ✅ special case 2: accessory brand dropdown
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select Brand --</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

          ) : isProductColorDropdown ? (
            // ✅ new dropdown for product colors
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select Color --</option>
              {productColorOptions.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>

          ): category === "spare" && attr.name === "compatibility" ? (
            // spare compatibility dropdown
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select --</option>
              {itemOptions.product.map((opt) => (
                <option key={opt.key} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>

          ) : attr.type === "select" ? (
            // default select type
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select --</option>
              {attr.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

          ) : (
            // default input type
            <input
              type={attr.type}
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder={attr.placeholder}
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            />
          )}
        </div>
      );
    })}
  </div>
)}



        {/* Add item button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-gray-500 text-xs">Tip: fill attributes relevant to the item before adding.</div>
          <div className="text-gray-500 text-xs">  Current Stock:{" "}  <span className="font-semibold">    {currentStockQty !== null ? currentStockQty : "-"}  </span></div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border rounded text-xs cursor-pointer hover:bg-cyan-700 hover:text-white hover:font-semibold" onClick={() => setPartModalOpen(true)}>Add Part</button>
            <button className="px-3 py-1 border rounded text-xs hover:bg-green-600 cursor-pointer hover:text-white hover:font-semibold" onClick={() => setProductModalOpen(true)}>Add Modal</button>
            <button className="px-3 py-1 border rounded text-xs cursor-pointer hover:bg-red-400 hover:text-white hover:font-semibold" onClick={fetchCatalog}>Refresh</button>
            <button
              onClick={resetItemForm}
              className="px-3 py-1 border rounded text-xs hover:bg-purple-500 cursor-pointer hover:text-white hover:font-semibold"
              title="Reset item entry"
            >
              Reset
            </button>
            <button
              onClick={handleAddItem}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 cursor-pointer"
              title="Add item to GRN table"
            >
              Add Item
            </button>
          </div>
        </div>

        <hr className="my-3" />

        {/* GRN table */}
        <div className="overflow-auto max-h-56 mb-3 text-xs">
          <table className="w-full table-auto text-left text-xs">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Category</th>
                <th className="px-2 py-2">Item</th>
                <th className="px-2 py-2">Attributes</th>
                <th className="px-2 py-2">Qty</th>
                <th className="px-2 py-2">Unit</th>
                <th className="px-2 py-2">Line Total</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-2 py-4 text-center text-gray-500">No items added</td>
                </tr>
              ) : items.map((it, idx) => (
                <tr key={it.id} className="border-b">
                  <td className="px-2 py-2 align-top">{idx + 1}</td>
                  <td className="px-2 py-2 align-top">{it.category}</td>
                  <td className="px-2 py-2 align-top">{it.label}</td>
                  <td className="px-2 py-2 align-top">
                    <div className="text-[11px]">
                      {Object.entries(it.attributes).map(([k, v]) => (
                        <div key={k}><span className="font-medium">{k}:</span> {String(v)}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 align-top">{it.qty}</td>
                  <td className="px-2 py-2 align-top">{it.unitPrice.toFixed(2)}</td>
                  <td className="px-2 py-2 align-top">{it.lineTotal.toFixed(2)}</td>
                  <td className="px-2 py-2 align-top">
                    <button
                      onClick={() => handleDeleteItem(it.id)}
                      className="p-1 rounded hover:bg-red-400 text-xs font-bold hover:text-white"
                      title="Delete item"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* totals and actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <div className="mb-1"><span className="font-medium">Grand Total:</span> {grandTotal.toFixed(2)}</div>
            <div className="text-gray-600 text-[11px]">Stock updated: <span className={stockUpdated ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{stockUpdated ? "Yes" : "No"}</span></div>
          </div>

          <div className="flex items-center space-x-2">

            <button
              onClick={updateStockAndSaveGRN}
              disabled={loading || items.length === 0}
              className={`px-3 py-1 rounded text-xs cursor-pointer ${
                loading || items.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {loading ? "Please wait..." : "Update Stock & Save GRN"}
            </button>

            <button
              onClick={() => { handleAttemptClose(); }}
              className="px-3 py-1 border rounded text-xs hover:bg-gray-50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* small footnote */}
        <p className="text-gray-500 text-[11px] mt-3">
          Note: This component simulates stock update. Replace the alert/console actions with real API calls to update stock and save GRN in backend.
        </p>
      </div>

        {/* ========================  ADD A NEW SUPPLIER POPUP MODAL  =================================== */}
        {/* Add Supplier Modal */}
        {addSupplierOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black opacity-40"
              onClick={() => setAddSupplierOpen(false)}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-96 mx-4 p-4 text-xs">
              <h3 className="font-semibold text-sm mb-3">Add New Supplier</h3>

              {/* Supplier Name */}
              <input
                type="text"
                placeholder="Supplier Name *"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2 text-xs"
              />

              {/* Contact Phone */}
              <input
                type="text"
                placeholder="Contact Phone"
                value={newSupplierPhone}
                onChange={(e) => setNewSupplierPhone(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2 text-xs"
              />

              {/* Contact Email */}
              <input
                type="email"
                placeholder="Contact Email"
                value={newSupplierEmail}
                onChange={(e) => setNewSupplierEmail(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2 text-xs"
              />

              {/* Location */}
              <input
                type="text"
                placeholder="Location"
                value={newSupplierLocation}
                onChange={(e) => setNewSupplierLocation(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-3 text-xs"
              />

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setAddSupplierOpen(false)}
                  className="px-3 py-1 border rounded text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSupplier}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {selectDescriptionModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black opacity-40"
      onClick={() => setSelectDescriptionModalOpen(false)}
    ></div>

    <div className="relative bg-white rounded-xl shadow-2xl w-96 mx-4 p-4 text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Select Correct Description</h3>
        <button
          onClick={() => setSelectDescriptionModalOpen(false)}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {matchedDescriptions.map(item => (
          <button
            key={item._id}
            className="px-3 py-1 border rounded hover:bg-gray-100 text-left cursor-pointer"
            onClick={() => {
              setAttribute("description", item.attributes.description); // fill description
              setSelectDescriptionModalOpen(false);
            }}
          >
            {item.attributes.description}
          </button>
        ))}
      </div>
    </div>
  </div>
)}


{/* Confirm Close Modal */}
{confirmCloseOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black opacity-40"
      onClick={() => setConfirmCloseOpen(false)}
    ></div>

    <div className="relative bg-white rounded-xl shadow-2xl w-80 mx-4 p-4 text-xs">
      <h3 className="font-semibold text-sm mb-2">Cannot Close GRN</h3>
      <p className="mb-4 text-gray-700 text-[11px]">
        There are items in the GRN table. Please clear the table before closing.
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setConfirmCloseOpen(false)}
          className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

<StockUpdateOverlay
  open={overlayOpen}
  message={overlayMessage}
/>

<AddGRNItemManualForMac
  open={manualItemOpen}
  onClose={() => setManualItemOpen(false)}
  onAdd={(item) => {
    setItems(prev => [...prev, item]);
    setStockUpdated(false);
  }}
/>

<CatalogModal
  open={partModalOpen}
  onClose={() => setPartModalOpen(false)}
  type="spare"
/>

<CatalogModal
  open={productModalOpen}
  onClose={() => setProductModalOpen(false)}
  type="product"
/>

    </div>
  );
}
