import React, { useState } from "react";
import axios from "axios";

export default function CashExpenses({ defaultDate, onClose, onSaved }) {
  const [date, setDate] = useState(defaultDate);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Misc");
  const [preset, setPreset] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [loading, setLoading] = useState(false);

  const presetDescriptions = {
    "Salary Advance": ["Sajid", "Ashan", "Wazeem","Israth","Tharindu","Kaushalya","Nishan","Dilini"],
    "Pick Me": ["Mobo", "Lux X", "Muwas", "Masthur", "Other"],
    "Other Expence": [],
    "Director Current Account": [],
    "Asset Purchase": [],
    "Staff Welfare": []
  };

  const finalDescription = () => {
    let desc = preset;
    if (paidBy) desc += ` - ${paidBy}`;
    if (customDesc) desc += ` | ${customDesc}`;
    return desc;
  };

  const handleSubmit = async () => {
    if (!amount || amount <= 0 || !preset) return;

    try {
      setLoading(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cash-expenses`,
        {
          date,
          amount: Number(amount),
          category,
          description: finalDescription(),
          paidBy
        }
      );

      onSaved();
      onClose();
    } catch (err) {
      console.error("Expense save failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-20"/>

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-5 text-xs">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Add Cash Expense</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-black cursor-pointer">
            ✕
          </button>
        </div>

        <hr className="mb-4" />

        {/* Date */}
        <div className="mb-3">
          <label className="block mb-1 font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Preset Expense */}
        <div className="mb-3">
          <label className="block mb-1 font-medium">Expense Type</label>
          <select
            value={preset}
            onChange={e => {
              setPreset(e.target.value);
              setPaidBy("");
            }}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select expense</option>
            {Object.keys(presetDescriptions).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Sub Options */}
        {presetDescriptions[preset]?.length > 0 && (
          <div className="mb-3">
            <label className="block mb-1 font-medium">Related Person / Service</label>
            <select
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Select</option>
              {presetDescriptions[preset].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Description */}
        <div className="mb-3">
          <label className="block mb-1 font-medium">Additional Description</label>
          <input
            type="text"
            value={customDesc}
            onChange={e => setCustomDesc(e.target.value)}
            placeholder="Optional notes"
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Amount */}
        <div className="mb-3">
          <label className="block mb-1 font-medium">Amount (Rs.)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shop">Shop</option>
            <option value="Misc">Misc</option>
          </select>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1 bg-blue-600 text-white rounded font-semibold cursor-pointer"
          >
            {loading ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
