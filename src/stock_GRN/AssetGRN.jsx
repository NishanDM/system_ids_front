// GRN.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import StockUpdateOverlay from "./StockUpdateOverlay";
import CatalogModalForAssetParts from "./CatalogModalForAssetParts";
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

export default function AssetGRN({ open = true, onClose = () => {}, onSave = (payload) => {} }) {

const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
const [overlayOpen, setOverlayOpen] = useState(false);
const [overlayMessage, setOverlayMessage] = useState("");
const [partModalOpen, setPartModalOpen] = useState(false);
const [productModalOpen, setProductModalOpen] = useState(false);
const [assetPartQty, setAssetPartQty] = useState(1);
const [assetPartCost, setAssetPartCost] = useState("");
const [assetPartPopupOpen, setAssetPartPopupOpen] = useState(false);
// holds checkbox + qty + price per spare
const [selectedAssetParts, setSelectedAssetParts] = useState({});



function handleAttemptClose() {
  if (assetPartsList.length > 0) {
    setConfirmCloseOpen(true);
  } else {
    onClose();
  }
}


  // Item entry state
  const [category, setCategory] = useState(""); // "spare", "accessory", "product"
  const [selectedItemKey, setSelectedItemKey] = useState(""); // key from itemOptions
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [attributes, setAttributes] = useState({});
  const [grnDate, setGrnDate] = useState("");


  // GRN table
  const [items, setItems] = useState([]);
  const [stockUpdated, setStockUpdated] = useState(false);
const [assetPartsList, setAssetPartsList] = useState([]);

 // ======================== ITEM OPTIONS ==========================
  const [itemOptions, setItemOptions] = useState({
    asset:[],
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
      spare: sparesRes.data.find(d => d.category === "asset_spare")?.items || [],
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
  setAssetPartQty(1);
  setAssetPartCost("");
  setAssetPartsList([]); // ✅ clear table
  }

  const [loading, setLoading] = useState(false); // loading state

  if (!open) return null;

  // small icon components
  const CloseIcon = () => (
    <svg className="w-4 h-4 font-bold" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  async function handleSaveAssets() {
  try {
    // basic frontend validation
    if (!attributes.serialNumber || !attributes.compatibility) {
      alert("Serial Number and Compatibility are required");
      return;
    }

    if (assetPartsList.length === 0) {
      alert("Please add at least one asset part");
      return;
    }

    setLoading(true);
    setOverlayMessage("Saving asset details...");
    setOverlayOpen(true);

    // build payload EXACTLY for backend schema
      const payload = {
  category: "asset",

  grnDate: grnDate || new Date().toISOString().split("T")[0],

  compatibility: attributes.compatibility,

  serialNumber: attributes.serialNumber,
  ram: attributes.ram,
  capacity: attributes.capacity,
  color: attributes.color,
  processor: attributes.processor,
  displaySize: attributes.displaySize,
  workingParts: attributes.workingParts,
  faultyParts: attributes.faultyParts,
  faults: attributes.faults,
  assetRemark: attributes.assetRemark,

  assetParts: assetPartsList.map((part) => ({
    partKey: part.partKey,
    partLabel: part.partLabel,
    qty: Number(part.qty),
    costPrice: Number(part.costPrice),
  })),

  // createdBy is optional (schema default applies)
  // createdBy: "Tharindu Sandaruwan"
};


    // POST to backend
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/asset-grn`,
      payload
    );

    setOverlayMessage("Assets saved successfully ✔");

    // optional callback
    onSave?.(res.data.data);

    // reset everything
    resetItemForm();
    setAttributes({});
    setStockUpdated(false);

    // close modal after short delay
    setTimeout(() => {
      setOverlayOpen(false);
      onClose();
    }, 800);

  } catch (err) {
    console.error("Save Asset GRN Error:", err);
    setOverlayMessage(
      err.response?.data?.message || "Failed to save assets"
    );

    setTimeout(() => {
      setOverlayOpen(false);
    }, 1500);
  } finally {
    setLoading(false);
  }
}

  
  return (
    // overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-fulls w-full mx-12 p-6 text-sm min-h-[800px]">
        {/* header */}
        <div className="flex items-start justify-between space-x-4">
          <div>
            <h2 className="font-semibold text-xs text-cyan-700">MacBook & iMac Asset GRN (Goods Received Note)</h2>
            <p className="text-gray-600 text-[11px]">Enter the MacBook & iMac Parts here to update the asset stock</p>
          </div>
          <button
            onClick={() => { handleAttemptClose(); }}
            className="p-1 rounded hover:bg-red-400 text-gray-700 cursor-pointer"
            aria-label="Close"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <hr className="my-2" />

        {/* item entry area */}
        <div className="grid grid-cols-5 gap-3 items-end">
          {/* category */}
          <div>
            <label className="block text-gray-700 text-xs mb-1">Category</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="asset">Asset</option>
            </select>
          </div>
          {/* qty & price compact */}
          <div className="grid grid-cols-1 gap-2">
           <div>
            <label className="block text-gray-700 text-xs mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1 text-xs"
              value={grnDate}
              onChange={(e) => setGrnDate(e.target.value)}
            />
          </div>
          </div>
          <div>
  <label className="block text-gray-700 text-xs mb-1">
    Compatibility
  </label>

  <select
    className="w-full border rounded px-2 py-1 text-xs"
    value={attributes.compatibility || ""}
    onChange={(e) => setAttribute("compatibility", e.target.value)}
  >
    <option value="">-- Select Compatible Model --</option>
    {(itemOptions.product || []).map((opt) => (
      <option key={opt.key} value={opt.key}>
        {opt.label}
      </option>
    ))}
  </select>
</div>

        </div>
<div className="mt-3 grid grid-cols-5 gap-3">
  {[
    { name: "serialNumber", label: "Serial Number", placeholder: "Enter Serial Number" },
    { name: "ram", label: "RAM", placeholder: "Enter RAM" },
    { name: "capacity", label: "Capacity" }, // no placeholder needed
    { name: "color", label: "Color", placeholder: "Enter Color" },
    { name: "processor", label: "Processor", placeholder: "Enter Processor" },
    { name: "displaySize", label: "Display Size", placeholder: "Enter Display Size" },
    { name: "workingParts", label: "Working Parts", placeholder: "Enter Working Parts" },
    { name: "faultyParts", label: "Faulty Parts", placeholder: "Enter Faulty Parts" },
    { name: "faults", label: "Faults", placeholder: "Enter Faults" },
    { name: "assetRemark", label: "Asset Remark", placeholder: "Enter Remark" },
  ].map((field) => (
    <div key={field.name}>
      <label className="block text-gray-700 text-xs mb-1">
        {field.label}
      </label>

      {field.name === "capacity" ? (
        <select
          className="w-full border rounded px-2 py-1 text-xs"
          value={attributes.capacity || ""}
          onChange={(e) => setAttribute("capacity", e.target.value)}
        >
          <option value="">Select Capacity</option>
          <option value="In-Built 128GB">In-Built 128GB</option>
          <option value="In-Built 256GB">In-Built 256GB</option>
          <option value="In-Built 512GB">In-Built 512GB</option>
          <option value="In-Built 1TB">In-Built 1TB</option>
          <option value="In-Built 2TB">In-Built 2TB</option>
          <option value="Seperate with SSD 128GB">Seperate with SSD 128GB</option>
          <option value="Seperate with SSD 256GB">Seperate with SSD 256GB</option>
          <option value="Seperate with SSD 512GB">Seperate with SSD 512GB</option>
          <option value="Seperate with SSD 1TB">Seperate with SSD 1TB</option>
          <option value="Seperate with SSD 2TB">Seperate with SSD 2TB</option>
          <option value="Seperate without SSD">Seperate without SSD</option>
        </select>
      ) : (
        <input
          type="text"
          className="w-full border rounded px-2 py-1 text-xs"
          placeholder={field.placeholder}
          value={attributes[field.name] || ""}
          onChange={(e) => setAttribute(field.name, e.target.value)}
        />
      )}
    </div>
  ))}
</div>

<hr className="mt-4 font-semibold"/><br />
<div className="grid grid-cols-7 gap-3 items-end">
  <div className="col-span-2">
  <label className="block text-gray-700 text-xs mb-1">
    Asset Parts
  </label>

  <select
    className="w-full border rounded px-2 py-1 text-xs"
    value={attributes.assetParts || ""}
    onChange={(e) => setAttribute("assetParts", e.target.value)}
  >
    <option value="">-- Select Asset Part --</option>
    {(itemOptions.spare || []).map((opt) => (
      <option key={opt.key} value={opt.key}>
        {opt.label}
      </option>
    ))}
  </select>
</div>
  <div>
    <label className="block text-gray-700 text-xs mb-1">
      Asset Part Qty
    </label>
    <input
  type="number"
  min="1"
  className="w-full border rounded px-2 py-1 text-xs"
  placeholder="Enter Quantity"
  value={assetPartQty}
  onChange={(e) => setAssetPartQty(Number(e.target.value))}
/>

  </div>
    <div>
    <label className="block text-gray-700 text-xs mb-1">
      Cost Price
    </label>
<input
  type="number"
  min="0"
  step="1"
  className="w-full border rounded px-2 py-1 text-xs"
  placeholder="Enter Cost Price"
  value={assetPartCost}
  onChange={(e) => setAssetPartCost(e.target.value)}
/>
  </div>
  <div className="col-span-3 flex gap-2">
     <button className="px-3 py-1 border rounded text-xs cursor-pointer hover:bg-cyan-700 hover:text-white hover:font-semibold" onClick={() => setAssetPartPopupOpen(true)} >Open Asset Parts</button>
 <button className="px-3 py-1 border rounded text-xs cursor-pointer hover:bg-cyan-700 hover:text-white hover:font-semibold" onClick={() => setPartModalOpen(true)}>Add Asset Part</button>
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
  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 cursor-pointer"
  title="Add item to GRN table"
  onClick={() => {
    if (!attributes.assetParts || !assetPartQty || !assetPartCost) return;

    const selectedPart = (itemOptions.spare || []).find(
      p => p.key === attributes.assetParts
    );

    setAssetPartsList(prev => [
      ...prev,
      {
        partKey: attributes.assetParts,
        partLabel: selectedPart?.label || attributes.assetParts,
        qty: assetPartQty,
        costPrice: assetPartCost
      }
    ]);

    // reset part-only fields
    setAttribute("assetParts", "");
    setAssetPartQty(1);
    setAssetPartCost("");
  }}
>
  Add Item
</button>

  </div>
</div>


        <hr className="my-3" />
   {/* DISPLAYING ASSET ITEMS  */}
<div className="mt-2">
  <h3 className="font-semibold mb-3 text-green-600">GRN Item List (Asset Parts)</h3>

  {assetPartsList.length === 0 ? (
    <p className="text-xs text-gray-500">No asset parts added yet.</p>
  ) : (
    <table className="w-full border text-xs">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1 text-left">No</th>
          <th className="border px-2 py-1 text-left">Asset Part</th>
          <th className="border px-2 py-1 text-right">Qty</th>
          <th className="border px-2 py-1 text-right">Cost Price</th>
          <th className="border px-2 py-1 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {assetPartsList.map((part, index) => (
          <tr key={index}>
            <td className="border px-2 py-1">{index + 1}</td>
            <td className="border px-2 py-1">{part.partLabel}</td>
            <td className="border px-2 py-1 text-right">{part.qty}</td>
            <td className="border px-2 py-1 text-right">{part.costPrice}</td>
            <td className="border px-2 py-1 text-center">
              <button
                className="text-red-500 hover:underline cursor-pointer hover:font-bold"
                onClick={() =>
                  setAssetPartsList(prev =>
                    prev.filter((_, i) => i !== index)
                  )
                }
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

        {/* totals and actions */}
        <div className="flex items-center justify-between mt-4">
         
       <div className="flex items-center space-x-2">

           <button
  disabled={loading || assetPartsList.length === 0}
  onClick={handleSaveAssets}
  className={`px-3 py-1 rounded text-xs cursor-pointer ${
    loading || assetPartsList.length === 0
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-green-600 text-white hover:bg-green-700"
  }`}
>
  {loading ? "Please wait..." : "Save Assets"}
</button>


            <button
              onClick={() => { handleAttemptClose(); }}
              className="px-3 py-1 border rounded text-xs hover:bg-gray-50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>



<StockUpdateOverlay
  open={overlayOpen}
  message={overlayMessage}
/>


<CatalogModalForAssetParts
  open={partModalOpen}
  onClose={() => setPartModalOpen(false)}
  type="spare"
/>

<CatalogModalForAssetParts
  open={productModalOpen}
  onClose={() => setProductModalOpen(false)}
  type="product"
/>

{confirmCloseOpen && (
  <div className="fixed inset-0 z-60 flex items-center justify-center">
    <div className="absolute inset-0 bg-black opacity-50"></div>

    <div className="relative bg-white rounded-lg shadow-xl p-5 w-[400px] text-xs">
      <h3 className="font-semibold text-red-600 mb-2">
        Unsaved Items Detected
      </h3>

      <p className="text-gray-700 mb-4">
        You have asset parts added in the GRN table.
        <br />
        Closing now will <span className="font-semibold">clear all items</span>.
        <br />
        Are you sure you want to continue?
      </p>

      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-1 border rounded hover:bg-gray-100"
          onClick={() => setConfirmCloseOpen(false)}
        >
          Cancel
        </button>

        <button
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => {
            setAssetPartsList([]);   // ✅ clear table
            resetItemForm();         // ✅ reset all fields
            setConfirmCloseOpen(false);
            onClose();               // ✅ finally close modal
          }}
        >
          Yes, Clear & Close
        </button>
      </div>
    </div>
  </div>
)}

{assetPartPopupOpen && (
  <div className="fixed inset-0 z-60 flex items-center justify-center">
    <div className="absolute inset-0 bg-black opacity-40"></div>

    <div className="relative bg-white rounded-lg shadow-xl p-5 w-[700px] max-h-[80vh] overflow-y-auto text-xs">
      <h3 className="font-semibold text-cyan-700 mb-3">
        Select Asset Spare Parts
      </h3>

      {/* Header */}
      <div className="grid grid-cols-6 gap-2 font-semibold border-b pb-1 mb-2">
        <div className="col-span-2">Asset Part</div>
        <div className="text-center">Select</div>
        <div>Qty</div>
        <div>Cost Price</div>
      </div>

      {/* Spare parts list */}
      {(itemOptions.spare || []).map((part) => {
        const current = selectedAssetParts[part.key] || {
          checked: false,
          qty: 1,
          costPrice: ""
        };

        return (
          <div
            key={part.key}
            className="grid grid-cols-6 gap-2 items-center mb-2"
          >
            <div className="col-span-2">{part.label}</div>

            <div className="text-center">
              <input
               className="cursor-pointer"
                type="checkbox"
                checked={current.checked}
                onChange={(e) =>
                  setSelectedAssetParts((prev) => ({
                    ...prev,
                    [part.key]: {
                      ...current,
                      checked: e.target.checked
                    }
                  }))
                }
              />
            </div>

            <input
              type="number"
              min="1"
              disabled={!current.checked}
              className="border rounded px-2 py-1 text-xs"
              value={current.qty}
              onChange={(e) =>
                setSelectedAssetParts((prev) => ({
                  ...prev,
                  [part.key]: {
                    ...current,
                    qty: Number(e.target.value)
                  }
                }))
              }
            />

            <input
              type="number"
              min="0"
              disabled={!current.checked}
              className="border rounded px-2 py-1 text-xs"
              value={current.costPrice}
              onChange={(e) =>
                setSelectedAssetParts((prev) => ({
                  ...prev,
                  [part.key]: {
                    ...current,
                    costPrice: e.target.value
                  }
                }))
              }
            />
          </div>
        );
      })}

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"
          onClick={() => setAssetPartPopupOpen(false)}
        >
          Cancel
        </button>

        <button
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
          onClick={() => {
            const newItems = Object.entries(selectedAssetParts)
              .filter(([_, v]) => v.checked && v.qty && v.costPrice)
              .map(([key, v]) => {
                const part = itemOptions.spare.find(p => p.key === key);
                return {
                  partKey: key,
                  partLabel: part?.label || key,
                  qty: v.qty,
                  costPrice: v.costPrice
                };
              });

            setAssetPartsList((prev) => [...prev, ...newItems]);

            setSelectedAssetParts({});
            setAssetPartPopupOpen(false);
          }}
        >
          Add
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
