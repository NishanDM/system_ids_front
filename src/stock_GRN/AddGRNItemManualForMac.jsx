import React, { useState } from "react";

export default function AddGRNItemManual({ open, onClose, onAdd }) {
  const [category, setCategory] = useState("spare");
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");

  const [fields, setFields] = useState({
    description: "",
    brand: "",
    color: "",
    compatibility: "",
    condition: "",
    model: "",
    region: "",
    serialNumber: "",
    imeiNumber: "",
    otherValue: "",
  });

  if (!open) return null;

  const updateField = (key, value) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  const handleAdd = () => {
    if (!qty || qty <= 0) return alert("Invalid quantity");
    if (unitPrice === "" || unitPrice < 0) return alert("Invalid unit price");

    // Build attributes per category
    let attributes = {};
    let label = "";

    if (category === "accessory") {
      if (!fields.description) return alert("Description required");
      attributes = {
        description: fields.description,
        brand: fields.brand,
        color: fields.color,
        otherValue: fields.otherValue,
      };
      label = fields.description;
    }

    if (category === "spare") {
      if (!fields.description || !fields.compatibility || !fields.condition)
        return alert("Description, compatibility & condition required");

      attributes = {
        description: fields.description,
        compatibility: fields.compatibility,
        condition: fields.condition,
        otherValue: fields.otherValue,
      };
      label = fields.description;
    }

    if (category === "product") {
      if (!fields.model || !fields.serialNumber)
        return alert("Model & Serial Number required");

      attributes = {
        model: fields.model,
        color: fields.color,
        region: fields.region,
        serialNumber: fields.serialNumber,
        imeiNumber: fields.imeiNumber,
        condition: fields.condition,
        otherValue: fields.otherValue,
      };
      label = `${fields.model} (${fields.serialNumber})`;
    }

    // GRN table compatible item
    const item = {
      id: Date.now().toString(36),
      category,
      key: `manual_${Date.now()}`, // unique key
      label,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      attributes,
      lineTotal: Number(qty) * Number(unitPrice),
    };

    onAdd(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-xl w-[600px] p-4 text-xs">
        <h3 className="font-semibold text-sm mb-3">Add Manual GRN Item</h3>

        {/* Category */}
        {/* <div className="flex gap-4 mb-3">
          {["accessory", "spare", "product"].map(c => (
            <label key={c} className="flex items-center gap-1 cursor-pointer font-bold">
              <input
                type="radio"
                checked={category === c}
                onChange={() => setCategory(c)}
                className="cursor-pointer"
              />
              {c.toUpperCase()}
            </label>
          ))}
        </div> */}
        <div className="flex gap-4 mb-3">
            {[ "spare",].map(c => (
                <label
                key={c}
                className={`flex items-center gap-1 cursor-pointer font-bold mt-2
                    ${c === "accessory" ? "text-red-800" : ""}
                    ${c === "spare" ? "text-green-700" : ""}
                    ${c === "product" ? "text-gray-600" : ""}
                `}
                >
                <input
                    type="radio"
                    checked={category === c}
                    onChange={() => setCategory(c)}
                    className="cursor-pointer"
                />
                {c.toUpperCase()}
                </label>
            ))}
            </div>

        {/* SPARE */}
        {category === "spare" && (
            <>
                <Input label="Description | Part (Battery - Display etc.)*" value={fields.description} onChange={v => updateField("description", v)} />
                <Input label="Compatibility | MacBook Pro/Air AXXXX 16 M4 etc.*" value={fields.compatibility} onChange={v => updateField("compatibility", v)} />
                <Input label="Condition | New - Used - Refurb*" value={fields.condition} onChange={v => updateField("condition", v)} />
                <Input label="Other Value" value={fields.otherValue} onChange={v => updateField("otherValue", v)} />
            </>
            )}

        {/* Qty & Price */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Input type="number" label="Qty*" value={qty} onChange={setQty} />
          <Input type="number" label="Cost Price*" value={unitPrice} onChange={setUnitPrice} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="border px-3 py-1 rounded cursor-pointer font-bold">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer font-bold"
          >
            Add to GRN
          </button>
        </div>
      </div>
    </div>
  );
}

/* Small reusable input */
function Input({ label, onChange, value = "", type = "text" }) {
  return (
    <div className="mb-2">
      <label className="block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1 text-xs"
      />
    </div>
  );
}
