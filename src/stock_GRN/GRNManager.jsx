import React, { useEffect, useState, useMemo } from "react";
import {  BarChart,  Bar,  XAxis,  YAxis,  Tooltip,  ResponsiveContainer,  Legend,  Cell} from "recharts";
import AddSupplierPayment from "../supplier_payments/AddSupplierPayment";
import ViewSupplierPayments from "../supplier_payments/ViewSupplierPayments";

export default function GRNManager() {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all"); 

  const [selectedGrn, setSelectedGrn] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [returnMode, setReturnMode] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [viewPaymentsOpen, setViewPaymentsOpen] = useState(false);

  // local copy for edits
  const [local, setLocal] = useState({});

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grn/`);
      if (!res.ok) throw new Error("Failed to fetch GRNs");
      const data = await res.json();
      setGrns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (grn) => {
    setSelectedGrn(grn);
    setLocal({
      paymentMethodOfGRN: grn.paymentMethodOfGRN || "",
      paidAmount: grn.paidAmount ?? 0,
      remarks: grn.remarks || "",
    });
    setEditing(false);
    setReturnMode(false);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedGrn(null);
    setLocal({});
     setReturnMode(false);
  };

  // search logic (simple deep search on invoice, supplier, date)
const filtered = useMemo(() => {
  if (!query) return grns;
  const q = query.trim().toLowerCase();
  return grns.filter((g) => {
    if (filterBy === "invoice") return (g.invoice || "").toLowerCase().includes(q);
    if (filterBy === "supplier") return (g.supplier || "").toLowerCase().includes(q);
    if (filterBy === "date") return (g.date || "").toLowerCase().includes(q);
    if (filterBy === "imeiNumber") {
      // Check each item's IMEI number
      return (g.items || []).some(item => 
        (item.attributes?.imeiNumber || "").toLowerCase().includes(q)
      );
    }

    // default deep search including IMEI numbers
    const hay = [
      g.invoice, 
      g.supplier, 
      g.date, 
      g.remarks,
      ...(g.items || []).map(item => item.attributes?.imeiNumber)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return hay.includes(q);
  });
}, [grns, query, filterBy]);


  // handle field change in panel
  const handleLocalChange = (key, value) => {
    setLocal((p) => ({ ...p, [key]: value }));
  };

  // PATCH partial update (recommended for changing only the three fields)
  const handlePatch = async () => {
    if (!selectedGrn) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        paymentAmount: Number(local.paidAmount) || 0, // installment
        remarks: local.remarks,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grn/${selectedGrn._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to PATCH GRN");
      }
      const updated = await res.json();
      // update local list
      setGrns((prev) => prev.map((g) => (g._id === selectedGrn._id ? { ...g, ...updated } : g)));
      // reflect updated
      setSelectedGrn((s) => ({ ...s, ...updated }));
      setEditing(false);
      alert("✅ GRN updated (PATCH)");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update");
      alert("⚠️ " + (err.message || "Failed to update"));
    } finally {
      setSaving(false);
    }
  };


///===============CHART SECTION==============
const chartColors = [
  "#1E88E5", "#D81B60", "#43A047", "#FB8C00", "#8E24AA",
  "#00ACC1", "#F4511E", "#3949AB", "#7CB342", "#5E35B1"
];

const colorBySupplier = (supplierIndex) => chartColors[supplierIndex % chartColors.length];

const handleAddPaymentToRemarks = () => {
  if (!local.paymentMethodOfGRN || !local.paidAmount) return;

  const date = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY
  const entry = `${local.paymentMethodOfGRN} : RS.${local.paidAmount} : ${date}`;

  handleLocalChange(
    "remarks",
    local.remarks ? `${local.remarks}\n${entry}` : entry
  );
};


const supplierTotals = useMemo(() => {
  const map = {};

  grns.forEach((g) => {
    const supplier = g.supplier || "Unknown";
    const total = Number(g.grandTotal) || 0;
    const paid = Number(g.paidAmount) || 0;
    const unpaid = total - paid;

    if (!map[supplier]) {
      map[supplier] = { supplier, total: 0, paid: 0, unpaid: 0 };
    }

    map[supplier].total += total;
    map[supplier].paid += paid;
    map[supplier].unpaid += unpaid;
  });

  // Convert to array + sort by largest total
  return Object.values(map).sort((a, b) => b.total - a.total);
}, [grns]);

const handleRemoveItem = async (itemId) => {
  if (!selectedGrn) return;

  const item = selectedGrn.items.find((i) => i._id === itemId);
  if (!item) return;

  const isProduct = !!item.attributes?.imeiNumber;

  // 🔐 PRODUCT → IMEI confirmation
  if (isProduct) {
    const enteredImei = window.prompt(
      "This is a PRODUCT.\nPlease enter the IMEI number to confirm removal:"
    );

    if (!enteredImei) return;

    if (enteredImei.trim() !== String(item.attributes.imeiNumber).trim()) {
      alert("❌ IMEI number does not match. Item not removed.");
      return;
    }
  } 
  // 📦 NON-PRODUCT → normal confirmation
  else {
    const confirm = window.confirm(
      "Are you sure to delete this item from the GRN?"
    );
    if (!confirm) return;
  }

  // 🚀 Proceed with removal
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/grn/${selectedGrn._id}/remove-item/${itemId}`,
      { method: "PATCH" }
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to remove item");
    }

    const data = await res.json();

    setSelectedGrn(data.grn);
    setGrns((prev) =>
      prev.map((g) => (g._id === data.grn._id ? data.grn : g))
    );

    alert("✅ Item removed successfully");
    setReturnMode(false);
  } catch (err) {
    console.error(err);
    alert("❌ Failed to remove item");
  }
};


  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">GRN Invoices</h3>

        <div className="flex items-center gap-2">
        <button
        onClick={() => setViewPaymentsOpen(true)}
            className="px-3 py-1 bg-cyan-800 hover:bg-cyan-900 text-white rounded text-sm cursor-pointer"
          >
            View Supplier Payment
          </button>
          <button
          onClick={() => setAddPaymentOpen(true)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm cursor-pointer hover:bg-green-700"
          >
            Add Supplier Payment
          </button>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border rounded p-1 text-sm"
          >
            <option value="all">All (deep search)</option>
            <option value="invoice">Invoice</option>
            <option value="supplier">Supplier</option>
            <option value="date">Date</option>
            <option value="imeiNumber">EMEI</option>
          </select>

          <input
            placeholder={`Search ${filterBy === 'all' ? 'invoice/supplier/date/remarks' : filterBy}`}
            className="border rounded p-1 text-sm w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            onClick={fetchList}
            className="px-3 py-1 bg-gray-800 text-white rounded text-sm cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

     <div className="border  shadow-md h-96 overflow-auto bg-white">
  {loading ? (
    <div className="p-6 text-center text-gray-500">Loading...</div>
  ) : error ? (
    <div className="p-6 text-center text-red-600 font-medium">{error}</div>
  ) : filtered.length === 0 ? (
    <div className="p-6 text-center text-gray-400">No records found</div>
  ) : (
    <table className="min-w-full text-sm divide-y divide-gray-200">
      <thead className="bg-gray-50 sticky top-0">
        <tr>
          <th className="px-4 py-3 text-left text-gray-700 font-semibold">Invoice</th>
          <th className="px-4 py-3 text-left text-gray-700 font-semibold">Date</th>
          <th className="px-4 py-3 text-left text-gray-700 font-semibold">Supplier</th>
          <th className="px-4 py-3 text-right text-gray-700 font-semibold">Grand Total</th>
          <th className="px-4 py-3 text-left text-gray-700 font-semibold">Paid</th>
          <th className="px-4 py-3 text-left text-gray-700 font-semibold">Balance</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {filtered.map((g) => (
          <tr
            key={g._id}
            className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
            onClick={() => openDetail(g)}
          >
            <td className="px-4 py-2">{g.invoice || "—"}</td>
            <td className="px-4 py-2">{g.date || "—"}</td>
            <td className="px-4 py-2">{g.supplier || "—"}</td>
            <td className="px-4 py-2 text-right font-medium text-gray-800">
              {Number(g.grandTotal || 0).toLocaleString()}
            </td>
            <td className="px-4 py-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  g.paidAmount >= g.grandTotal
                    ? "bg-green-100 text-green-800"
                    : g.paidAmount > 0
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {g.paidAmount ? Number(g.paidAmount).toLocaleString() : "0"}
              </span>
            </td>
            <td className="px-4 py-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                g.balanceAmount >= g.grandTotal
                  ? "bg-cyan-100 text-cyan-800"
                  : g.balanceAmount > 0
                  ? "bg-cyan-50 text-cyan-700"
                  : "bg-cyan-200 text-cyan-900"
              }`}
            >
              {g.balanceAmount ? Number(g.balanceAmount).toLocaleString() : "0"}
            </span>
          </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>


      {/* Detail panel modal */}
      {detailOpen && selectedGrn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" ></div>

          <div className="relative bg-white rounded-xl shadow-lg max-w-4xl w-full overflow-auto max-h-[85vh] p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">GRN Detail — {selectedGrn.invoice || selectedGrn._id}</h4>
              <div className="flex items-center gap-2">
              <button
                onClick={() => setReturnMode((p) => !p)}
                className={`px-3 py-1 font-bold cursor-pointer rounded text-sm ${
                  returnMode ? "bg-red-600 hover:bg-red-700" : "bg-cyan-700 hover:bg-green-600"
                } text-white`}
              >
                {returnMode ? "Cancel Return" : "Return"}
              </button>

                <button
                  onClick={() => setEditing((p) => !p)}
                  className="px-3 py-1 rounded hover:border-2 border-red-500 text-sm cursor-pointer font-bold hover:bg-red-200"
                >
                  {editing ? "Cancel Edit" : "Edit"}
                </button>
                <button onClick={closeDetail} className="px-3 py-1 hover:border-2 rounded border-green-500 text-sm cursor-pointer font-bold hover:bg-green-200">Close</button>
              </div>
            </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

  {/* LEFT: Invoice Details */}
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
    <div className="text-sm font-semibold text-gray-700 border-b pb-1">
      Invoice Details
    </div>

    <div className="space-y-2 text-sm">
      <div>
        <div className="text-xs text-gray-500">Invoice</div>
        <div className="font-medium text-gray-800">
          {selectedGrn.invoice || "—"}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500">Date</div>
        <div className="font-medium text-gray-800">
          {selectedGrn.date || "—"}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500">Supplier</div>
        <div className="font-medium text-gray-800">
          {selectedGrn.supplier || "—"}
        </div>
      </div>

      <div className="pt-2 border-t">
        <div className="text-xs text-gray-500">Grand Total</div>
        <div className="text-lg font-semibold text-green-700">
          Rs. {Number(selectedGrn.grandTotal || 0).toLocaleString()}
        </div>
      </div>
    </div>
  </div>

  {/* RIGHT: Payment & Remarks */}
  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
    <div className="text-sm font-semibold text-gray-700 border-b pb-1">
      Payment & Remarks
    </div>

    {/* Payment Method */}
    <div>
      <label className="block text-xs text-gray-500 mb-1">
        Payment Method
      </label>

      {editing ? (
        <select
          className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={local.paymentMethodOfGRN}
          onChange={(e) =>
            handleLocalChange("paymentMethodOfGRN", e.target.value)
          }
        >
          <option value="">Select Payment Method</option>
          <option value="CASH">Cash</option>
          <option value="BANKTRANSFER">Bank Transfer</option>
          <option value="CHEQUE">Cheque</option>
          <option value="OTHER">Other</option>
        </select>
      ) : (
        <div className="font-medium text-gray-800">
          {selectedGrn.paymentMethodOfGRN || "—"}
        </div>
      )}
    </div>

    {/* Paid Amount */}
    <div>
      <label className="block text-xs text-gray-500 mb-1">
        Paid Amount
      </label>

      {editing ? (
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            className="flex-1 rounded-md border border-gray-300 bg-gray-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={local.paidAmount}
            onChange={(e) =>
              handleLocalChange("paidAmount", e.target.value)
            }
          />

          <button
            type="button"
            onClick={handleAddPaymentToRemarks}
            className="px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer"
          >
            Add
          </button>
        </div>
      ) : (
        <div className="font-semibold text-blue-700">
          Rs. {Number(selectedGrn.paidAmount || 0).toLocaleString()}
        </div>
      )}
    </div>

    {/* Remarks */}
    <div>
      <label className="block text-xs text-gray-500 mb-1">
        Remarks
      </label>

      {editing ? (
        <textarea
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={local.remarks}
          onChange={(e) =>
            handleLocalChange("remarks", e.target.value)
          }
        />
      ) : (
        <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 border rounded p-2">
          {selectedGrn.remarks || "—"}
        </div>
      )}
    </div>

    {/* Actions */}
    {editing && (
      <div className="flex justify-end pt-2 border-t">
        <button
          onClick={handlePatch}
          disabled={saving}
          className="px-4 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    )}
  </div>
</div>


 {/* Items table */}
  <div>
  <div className="text-sm font-semibold text-gray-700 mb-2">
    Items
  </div>

  <div className="max-h-56 overflow-auto rounded-lg border border-gray-200 bg-gray-100 p-2 space-y-2">
    {(selectedGrn.items || []).map((it) => (
      <div
        key={it._id || it.key}
        className="bg-white rounded-md border border-gray-200 shadow-sm px-3 py-2 text-xs"
      >
        {/* Header Row */}
        <div className="flex justify-between items-start gap-2">
  <div className="min-w-0">
    <div className="font-semibold text-gray-800 truncate">
      {it.label}
    </div>
    <div className="text-[11px] text-gray-500">
      {it.category}
    </div>
  </div>

  <div className="flex items-center gap-3">
    {/* PRICE INFO */}
    <div className="text-right whitespace-nowrap text-[11px]">
      <div className="text-gray-600">
        Qty:
        <span className="font-semibold text-gray-800 ml-1">
          {it.qty}
        </span>
      </div>
      <div className="text-blue-600">
        U:
        <span className="font-medium ml-1">
          {Number(it.unitPrice).toLocaleString()}
        </span>
      </div>
      <div className="text-green-700 font-semibold">
        T:
        <span className="ml-1">
          {Number(it.lineTotal).toLocaleString()}
        </span>
      </div>
    </div>

    {/* DELETE ICON */}
    {returnMode && (
      <button
        onClick={() => handleRemoveItem(it._id)}
        className="text-red-600 hover:text-red-800 text-xs cursor-pointer border-none rounded  font-semibold bg-red-100 px-2 py-1"
        title="Remove item"
      >
      Remove
      </button>
    )}
  </div>
</div>


        {/* Attributes */}
        {it.attributes && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(it.attributes).map(([k, v]) => (
              <div
                key={k}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-[2px] text-[11px] text-gray-700 truncate"
              >
                <span className="text-gray-500 mr-1">
                  {k.replace(/([A-Z])/g, " $1")}:
                </span>
                <span className="font-medium text-gray-800">
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
</div>


            {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
          </div>
        </div>
      )}
{/* Supplier Payment Overview Chart */}
<div className="mt-8 p-4 border rounded bg-white shadow">
  <h4 className="font-semibold mb-3">Supplier Payment Overview (Paid vs Unpaid)</h4>

  {supplierTotals.length === 0 ? (
    <div className="text-sm text-gray-500">No data to display</div>
  ) : (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={supplierTotals}>
        <XAxis dataKey="supplier" />
        <YAxis />
        <Tooltip formatter={(v) => `Rs. ${Number(v).toLocaleString()}`} />
        <Legend />

        {/* PAID amount */}
        <Bar dataKey="paid" stackId="total" name="Paid Amount">
          {supplierTotals.map((_, i) => (
            <Cell key={i} fill={colorBySupplier(i)} />
          ))}
        </Bar>

        {/* UNPAID amount */}
        <Bar dataKey="unpaid" stackId="total" name="Unpaid Amount" fill="#ef4444" />

      </BarChart>
    </ResponsiveContainer>
  )}
</div>
<AddSupplierPayment
  open={addPaymentOpen}
  onClose={() => setAddPaymentOpen(false)}
  onSaved={fetchList}
/>

<ViewSupplierPayments
  open={viewPaymentsOpen}
  onClose={() => setViewPaymentsOpen(false)}
/>
    </div>
  );
}
