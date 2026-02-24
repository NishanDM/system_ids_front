import React, { useState, useMemo } from "react";

export default function BulkGRN({
  open,
  onClose,
  onAdd,
  itemOptions
}) {

  // ================= STATE =================
  const [category, setCategory] = useState("");
  const [selectedItemKey, setSelectedItemKey] = useState("");
  const [qty, setQty] = useState("");
  const [unitPrice, setUnitPrice] = useState("");   // ✅ NEW
  const [serialInput, setSerialInput] = useState("");
  const [serialNumbers, setSerialNumbers] = useState([]);

  // ================= MEMO =================
  const currentOptions = useMemo(() => {
    if (!category) return [];
    return itemOptions?.[category] || [];
  }, [category, itemOptions]);

  const selectedItem = useMemo(() => {
    return currentOptions.find(o => o.key === selectedItemKey);
  }, [currentOptions, selectedItemKey]);

  if (!open) return null;

  // ================= FUNCTIONS =================

  const addSerial = () => {
    const value = serialInput.trim();
    if (!value) return;

    setSerialNumbers(prev => [...prev, value]);
    setSerialInput("");
  };

  const removeSerial = (index) => {
    setSerialNumbers(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddBulk = () => {
    if (!category || !selectedItemKey) {
      alert("Select category and item");
      return;
    }

    if (serialNumbers.length === 0) {
      alert("Enter at least one serial number");
      return;
    }

    if (unitPrice === "" || isNaN(unitPrice) || Number(unitPrice) < 0) {
      alert("Enter valid cost price");
      return;
    }

    const price = Number(unitPrice);

    // Create individual GRN items (1 per serial)
    const bulkItems = serialNumbers.map(sn => ({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      category,
      key: selectedItemKey,
      label: selectedItem?.label || selectedItemKey,
      qty: 1,
      unitPrice: price,
      attributes: {
        description: sn
      },
      lineTotal: price
    }));

    onAdd(bulkItems);

    // reset form
    setCategory("");
    setSelectedItemKey("");
    setQty("");
    setUnitPrice("");
    setSerialInput("");
    setSerialNumbers([]);

    onClose();
  };

  const CloseIcon = () => (
    <svg className="w-4 h-4 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );

  // ================= UI =================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[1000px] p-4 text-xs">

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Bulk GRN Entry</h3>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Selection Row */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <select
            className="border rounded px-2 py-1 cursor-pointer"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSelectedItemKey("");
            }}
          >
            <option value="">Category</option>
            <option value="spare">Spare</option>
            <option value="accessory">Accessory</option>
          </select>

          <select
            className="border rounded px-2 py-1 cursor-pointer"
            value={selectedItemKey}
            onChange={(e) => setSelectedItemKey(e.target.value)}
            disabled={!category}
          >
            <option value="">Item</option>
            {currentOptions.map(opt => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Qty (optional)"
            className="border rounded px-2 py-1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />

          {/* ✅ NEW Cost Price */}
          <input
            type="number"
            step="0.01"
            placeholder="Cost Price"
            className="border rounded px-2 py-1"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>

        {/* Serial Entry */}
        <div className="flex gap-2 mb-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            placeholder="Enter Serial Number"
            value={serialInput}
            onChange={(e) => setSerialInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addSerial();
            }}
          />
          <button
            onClick={addSerial}
            className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer"
          >
            Add
          </button>
        </div>

        {/* Serial List */}
        <div className="max-h-40 overflow-auto border rounded p-2 mb-3">
          {serialNumbers.length === 0 ? (
            <div className="text-gray-400 text-center">
              No serial numbers added
            </div>
          ) : (
            serialNumbers.map((sn, i) => (
              <div key={i} className="flex justify-between py-1 border-b">
                <span>{sn}</span>
                <button
                  onClick={() => removeSerial(i)}
                  className="text-red-600 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleAddBulk}
            className="px-3 py-1 bg-green-600 text-white rounded cursor-pointer"
          >
            Add Bulk Items
          </button>
        </div>

      </div>
    </div>
  );
}
