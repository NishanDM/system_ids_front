import React, { useEffect, useState } from "react";

export default function AddSupplierPayment({ open, onClose, onSaved }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalPaid: 0, totalOutstanding: 0 });
  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().slice(0, 10),
    supplierName: "",
    paymentMethod: "CASH",
    amount: "",
    remark: ""
  });

  useEffect(() => {
    if (!open) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`)
      .then(r => r.json())
      .then(setSuppliers)
      .catch(console.error);

          setForm({
      paymentDate: new Date().toISOString().slice(0, 10),
      supplierName: "",
      paymentMethod: "CASH",
      amount: "",
      remark: ""
    });
  }, [open]);

    // Fetch supplier summary when a supplier is selected
  useEffect(() => {
    if (!form.supplierName) {
      setSummary({ totalPaid: 0, totalOutstanding: 0 });
      return;
    }

    const fetchOutstanding = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/outstandings/${encodeURIComponent(form.supplierName)}`
        );
        if (!res.ok) throw new Error("Failed to fetch outstanding");
        const data = await res.json();
        setSummary({
          totalPaid: data.totalPaidAmount || 0,
          totalOutstanding: data.outstandingAmount || 0
        });
      } catch (err) {
        console.error(err);
        setSummary({ totalPaid: 0, totalOutstanding: 0 });
      }
    };

    fetchOutstanding();
  }, [form.supplierName]);

  const handleChange = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
  };

  const handleSubmit = async () => {
    if (!form.supplierName || !form.amount) {
      alert("Supplier and amount required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/supplier-payments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      if (!res.ok) throw new Error("Failed to save payment");

      alert("✅ Supplier payment added");
          // Reset form to default values
    setForm({
      paymentDate: new Date().toISOString().slice(0, 10),
      supplierName: "",
      paymentMethod: "CASH",
      amount: "",
      remark: ""
    });
      onSaved?.();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40"  />

      <div className="relative bg-white rounded-xl shadow-lg w-[500px] p-5">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">Add Supplier Payment</h3>
          <button onClick={onClose} className="text-red-600 font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="date"
            className="w-full border rounded p-2"
            value={form.paymentDate}
            onChange={e => handleChange("paymentDate", e.target.value)}
          />

          <select
            className="w-full border rounded p-2"
            value={form.supplierName}
            onChange={e => handleChange("supplierName", e.target.value)}
          >
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s._id} value={s.supplierName}>
                {s.supplierName}
              </option>
            ))}
          </select>

          <select
            className="w-full border rounded p-2"
            value={form.paymentMethod}
            onChange={e => handleChange("paymentMethod", e.target.value)}
          >
            <option value="CASH">Cash</option>
            <option value="BANKTRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
          </select>

          <input
            type="number"
            placeholder="Amount"
            className="w-full border rounded p-2"
            value={form.amount}
            onChange={e => handleChange("amount", e.target.value)}
          />

          <textarea
            placeholder="Remark"
            className="w-full border rounded p-2"
            value={form.remark}
            onChange={e => handleChange("remark", e.target.value)}
          />

          {/* Supplier summary */}
          {form.supplierName && (
            <div className="flex justify-between items-center mt-4 p-2 border-t font-semibold">
              <div>
                Total Outstanding:{" "}
                <span className="text-red-600">{summary.totalOutstanding.toLocaleString()}</span>
              </div>
              <div>
                Total Paid:{" "}
                <span className="text-green-600">{summary.totalPaid.toLocaleString()}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded cursor-pointer"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
