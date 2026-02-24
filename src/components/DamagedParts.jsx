import React, {  useEffect, useState  } from "react";
import StockForDamagedParts from "../stock_GRN/StockForDamagedParts";
import axios from "axios";
import DamageRecordsPopup from "./DamageRecordsPopup";


export default function DamagedParts({ onClose }) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [showRecords, setShowRecords] = useState(false);

  // items array will store objects that always include either `_id` or `id`.
  const [items, setItems] = useState([]);

  const viewStockForBill = () => {
    setShowStockModal(true);
  };

  // Fetch technicians on mount
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/technicians`);
        setTechnicians(res.data);
      } catch (err) {
        console.error("Failed to fetch technicians:", err);
      }
    };
    fetchTechnicians();
  }, []);

  // ------------------ Fixed handleDeleteItem ------------------
  const handleDeleteItem = async (item) => {
    if (!item) return;

    // Determine the identifier used in our items: prefer _id then id
    const stockId = item._id || item.id;
    // If we don't have any identifier, just remove by reference (fallback)
    if (!stockId) {
      console.warn("Item has no id; removing by reference.");
      setItems((prev) => prev.filter((it) => it !== item));
      return;
    }

    try {
      // Attempt to PATCH increment the stock quantity on the server using the resolved id
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stock/${stockId}/increment`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.ok) {
        console.log(`✓ Stock quantity updated for id: ${stockId}`);
        alert("✓ Moved Back to stock");
      } else {
        // Pull server response text if available for better debugging
        const text = await res.text().catch(() => "");
        throw new Error(`Stock increment failed: ${res.status} ${res.statusText} ${text}`);
      }
    } catch (err) {
      // If increment fails (no stock doc), recreate using fields we have in the item
      console.warn("Stock missing or increment failed — attempting to recreate document.", err);

      // Build object to POST back to stock collection.
      // Use as many existing fields as possible and normalize names.
      const recreateObject = {
        category: item.category || item.categoryName || "unknown",
        key: item.key || stockId, // fallback to stockId as key if missing
        label: item.label || item.name || "Unknown item",
        qty: 1,
        unitPrice: Number(item.unitPrice) || 0,
        attributes: {
          description: item.description || item.attributes?.description || "",
          compatibility: item.compatibility || item.attributes?.compatibility || "",
          brand: item.brand || item.attributes?.brand || "",
          color: item.color || item.attributes?.color || "",
          model: item.model || item.attributes?.model || "",
          region: item.region || item.attributes?.region || "",
          serialNumber: item.serialNumber || item.attributes?.serialNumber || "",
          imeiNumber: item.imeiNumber || item.attributes?.imeiNumber || "",
          condition: item.condition || item.attributes?.condition || "",
          // copy any nested attributes that were present
          ...((item.attributes && typeof item.attributes === "object") ? item.attributes : {}),
        },
      };

      try {
        const createRes = await fetch(`${import.meta.env.VITE_API_URL}/api/stock/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recreateObject),
        });

        if (!createRes.ok) {
          const text = await createRes.text().catch(() => "");
          throw new Error(`Failed to recreate item: ${createRes.status} ${createRes.statusText} ${text}`);
        }

        console.log("✓ Stock item recreated:", recreateObject.label);
      } catch (createErr) {
        console.error("Failed to recreate stock item:", createErr);
        // Keep user informed but don't block removal from UI
        alert("Failed to restore stock on server. Item will still be removed from this bill. See console for details.");
      }
    }

    // Finally, remove item from the local bill (matching by _id or id)
    setItems((prev) => prev.filter((it) => (it._id || it.id) !== stockId));
  };
  // ------------------ end handleDeleteItem ------------------


// Function to save damaged parts record
const saveDamageRecord = async ({
  technicianId,
  date,
  jobNumber,
  damageTotal,
  remark,
  items,
}) => {
  try {
    // Build payload according to your backend schema
    const payload = {
      technician: technicianId,           // MongoDB ObjectId of technician
      date: date || new Date(),           // Use provided date or current date
      jobNumber: jobNumber || "N/A",
      damageTotal: Number(damageTotal) || 0,
      remark: remark || "",
      damagedItems: items.map((item) => ({
        _id: item._id || undefined,
        id: item.id || undefined,
        category: item.category,
        label: item.label,
        description: item.description || "",
        compatibility: item.compatibility || "",
        brand: item.brand || "",
        color: item.color || "",
        model: item.model || "",
        condition: item.condition || "",
        serialNumber: item.serialNumber || "",
        imeiNumber: item.imeiNumber || "",
        unitPrice: Number(item.unitPrice) || 0,
        qty: Number(item.qty) || 1,
        attributes: item.attributes || {},
      })),
    };

    // Send POST request to backend
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/damagedparts`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Damage record saved successfully:", response.data);
    alert("Damage record saved successfully!");
    return response.data; // optional: return saved record
  } catch (err) {
    console.error("Failed to save damage record:", err.response || err);
    alert("Failed to save damage record. See console for details.");
    throw err;
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-xs">
      <div className="absolute inset-0 bg-black opacity-30"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 p-6 min-h-[300px] flex flex-col items-center justify-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold">DAMAGED PARTS</h2>
          <button
            onClick={() => setShowCloseConfirm(true)}
            className="absolute top-3 right-3 text-gray-600 hover:text-white hover:font-bold hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <button
          onClick={viewStockForBill}
          className="px-3 py-2 bg-gray-500 text-white font-bold rounded flex items-center justify-center gap-1 hover:bg-gray-700 cursor-pointer"
        >
          <span className="text-xs text-center">View Stock</span>
        </button>

        {/* Render Added Damaged Parts */}
        <div className="mt-4 space-y-3">
          {items.length === 0 && <p className="text-gray-500 italic">No damaged parts added.</p>}

          {items.map((item, index) => (
            <div
              key={item._id || item.id || index}
              className="border rounded-lg p-3 bg-gray-50 flex justify-between items-start"
            >
              <div className="text-xs leading-5">
                <p className="font-semibold">
                  {[
                    item.label,
                    item.description && `Description: ${item.description}`,
                    item.compatibility && `Compatibility: ${item.compatibility}`,
                    item.brand && `Brand: ${item.brand}`,
                    item.color && `Color: ${item.color}`,
                    item.model && `Model: ${item.model}`,
                    item.condition && `Condition: ${item.condition}`,
                    typeof item.unitPrice !== "undefined" && `Rs. ${item.unitPrice}`,
                  ]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
              </div>

              <button
                onClick={() => handleDeleteItem(item)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

<div className="w-full flex flex-wrap items-center justify-center gap-4 mb-4 mt-5">

  {/* Technician Dropdown */}
  <div className="flex flex-col">
    <label className="font-semibold">Technician:</label>
      <select
    className="border rounded-md px-2 py-1 cursor-pointer w-60"
    value={selectedTechnician}
    onChange={(e) => setSelectedTechnician(e.target.value)}
  >
    <option value="">Select Technician</option>

    {technicians.map((tech) => (
      <option key={tech._id} value={tech._id}>
        {tech.username}
      </option>
    ))}
  </select>
  </div>

  {/* Date */}
  <div className="flex flex-col">
    <label className="font-semibold">Date:</label>
    <input 
      type="date"
      className="border rounded-md px-2 py-1 w-30"
    />
  </div>

  {/* Job Number with auto dashes */}
  <div className="flex flex-col">
    <label className="font-semibold">Job No:</label>
    <input
      type="text"
      maxLength={9}
      placeholder="XX-XX-XXX"
      className="border rounded-md px-2 py-1 w-22"
      onChange={(e) => {
        let v = e.target.value.replace(/[^A-Za-z0-9]/g, "");

        // Auto formatting: XX-XX-XXX
        if (v.length > 2) v = v.slice(0, 2) + "-" + v.slice(2);
        if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);

        e.target.value = v.toUpperCase();
      }}
    />
  </div>

  {/* Damage Total */}
  <div className="flex flex-col">
    <label className="font-semibold">Damage Total:</label>
    <input 
      type="number"
      className="border rounded-md px-2 py-1 w-28"
      placeholder="0.00"
    />
  </div>

  {/* Remark */}
  <div className="flex flex-col">
    <label className="font-semibold">Remark:</label>
    <input 
      type="text"
      className="border rounded-md px-2 py-1 w-85"
      placeholder="Remark"
    />
  </div>

</div>

<div  className="flex justify-center gap-4 mt-4">
<button
  className="px-2 py-1 bg-green-600 text-white text-sm font-semibold rounded justify-center hover:bg-green-700 cursor-pointer w-20"
  onClick={async () => {
    if (!selectedTechnician) return alert("Please select a technician");
    if (!items.length) return alert("No damaged parts added");
    
    const dateInput = document.querySelector('input[type="date"]').value;
    const jobNumberInput = document.querySelector('input[placeholder="XX-XX-XXX"]').value;
    const damageTotalInput = document.querySelector('input[placeholder="0.00"]').value;
    const remarkInput = document.querySelector('input[placeholder="Remark"]').value;

    try {
      await saveDamageRecord({
        technicianId: selectedTechnician,
        date: dateInput,
        jobNumber: jobNumberInput,
        damageTotal: damageTotalInput,
        remark: remarkInput,
        items: items,
      });

      // Optional: clear form after successful save
      setItems([]);
      setSelectedTechnician("");
    } catch (err) {
      console.error(err);
    }
  }}
>
  Save
</button>
<button  onClick={() => setShowRecords(true)} className="px-2 py-1 bg-cyan-700 text-white text-sm font-semibold rounded justify-center hover:bg-cyan-600 cursor-pointer w-30">View Records</button>
</div>
      </div>
      

      {/* STOCK MODAL */}
      {showStockModal && (
        <StockForDamagedParts
          onClose={() => setShowStockModal(false)}
          onAddToBill={(stockItem) => {
            // Ensure the item we push into `items` contains consistent identifier fields.
            const baseItem = {
              // store both _id and id for widest compatibility with any other code
              _id: stockItem._id,
              id: stockItem._id,
              isStockItem: true,
              category: stockItem.category,
              qty: 1,
              unitPrice: Number(stockItem.unitPrice) || 0,
              amount: Number(stockItem.unitPrice) || 0,
            };

            let newItem = { ...baseItem };

            // Build readable content depending on category (kept your original mapping)
            switch (stockItem.category) {
              case "spare":
                newItem = {
                  ...newItem,
                  label: stockItem.label,
                  description: stockItem.attributes?.description || "--",
                  compatibility: stockItem.attributes?.compatibility || "--",
                  condition: stockItem.attributes?.condition || "--",
                };
                break;

              case "accessory":
                newItem = {
                  ...newItem,
                  label: stockItem.label,
                  description: stockItem.attributes?.description || "--",
                  brand: stockItem.attributes?.brand || "--",
                  color: stockItem.attributes?.color || "--",
                };
                break;

              case "product":
                newItem = {
                  ...newItem,
                  label: stockItem.label,
                  model: stockItem.attributes?.model || "--",
                  color: stockItem.attributes?.color || "--",
                  serialNumber: stockItem.attributes?.serialNumber || "--",
                };
                break;

              default:
                newItem = {
                  ...newItem,
                  label: stockItem.label || "Unknown",
                  description: stockItem.attributes?.description || "--",
                };
            }

            setItems((prev) => [...prev, newItem]);
          }}
        />
      )}

      {/* CLOSE CONFIRM */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40"></div>

          <div className="relative bg-white rounded-xl shadow-xl w-80 p-4 text-center">
            <p className="mb-4 font-semibold">Are you sure you want to close?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  onClose();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-md cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
{showRecords && <DamageRecordsPopup onClose={() => setShowRecords(false)} />}
    </div>
  );
}
