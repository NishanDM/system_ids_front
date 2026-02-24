import React, { useEffect, useState } from "react";

export default function ViewSupplierPayments({ open, onClose }) {
  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalPaid: 0, totalOutstanding: 0 });

  const [filter, setFilter] = useState({
    supplierName: "",
    fromDate: "",
    toDate: ""
  });

  // Fetch suppliers and reset state whenever modal opens
  useEffect(() => {
    if (!open) return;

    // Reset all filters and summary
    setFilter({ supplierName: "", fromDate: "", toDate: "" });
    setSummary({ totalPaid: 0, totalOutstanding: 0 });

    // Fetch suppliers
    fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`)
      .then(r => r.json())
      .then(setSuppliers)
      .catch(console.error);

    // Fetch payments fresh
    fetchPayments();
  }, [open]);

  // Fetch suppliers when modal opens
//   useEffect(() => {
//     if (!open) return;

//     fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`)
//       .then(r => r.json())
//       .then(setSuppliers)
//       .catch(console.error);

//     fetchPayments();
//   }, [open]);

// Refresh button handler
const handleRefresh = () => {
  // Reset filters
  setFilter({
    supplierName: "",
    fromDate: "",
    toDate: ""
  });

  // Reset summary
  setSummary({ totalPaid: 0, totalOutstanding: 0 });

  // Fetch all payments again
  fetchPayments();
};


  // Fetch all payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/supplier-payments`);
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch supplier summary whenever a supplier is selected
  useEffect(() => {
    if (!filter.supplierName) {
      setSummary({ totalPaid: 0, totalOutstanding: 0 });
      return;
    }

    const fetchOutstanding = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/outstandings/${encodeURIComponent(filter.supplierName)}`
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
  }, [filter.supplierName]);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const filteredPayments = payments.filter(p => {
    const date = new Date(p.paymentDate);
    const from = filter.fromDate ? new Date(filter.fromDate) : null;
    const to = filter.toDate ? new Date(filter.toDate) : null;

    const matchSupplier = filter.supplierName ? p.supplierName === filter.supplierName : true;
    const matchFrom = from ? date >= from : true;
    const matchTo = to ? date <= to : true;

    return matchSupplier && matchFrom && matchTo;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40"  />

      <div className="relative bg-white rounded-xl shadow-lg w-[1000px] max-h-[85vh] overflow-auto p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">View Supplier Payments</h3>
          <button onClick={onClose} className="text-red-600 font-bold text-lg cursor-pointer">✕</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <select
            className="border p-2 rounded flex-1"
            value={filter.supplierName}
            onChange={e => handleFilterChange("supplierName", e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s._id} value={s.supplierName}>{s.supplierName}</option>
            ))}
          </select>
        <h3 className="font-semibold">From:</h3>
          <input
            type="date"
            className="border p-2 rounded"
            value={filter.fromDate}
            onChange={e => handleFilterChange("fromDate", e.target.value)}
            placeholder="From"
          />
        <h3 className="font-semibold">To:</h3>
          <input
            type="date"
            className="border p-2 rounded"
            value={filter.toDate}
            onChange={e => handleFilterChange("toDate", e.target.value)}
            placeholder="To"
          />

          <button
            onClick={handleRefresh} // <--- use new handler
            className="px-3 py-1 bg-gray-800 text-white rounded cursor-pointer"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-auto max-h-96 border rounded">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No payments found</div>
          ) : (
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Supplier</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Payment Method</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map(p => (
                  <tr key={p._id}>
                    <td className="px-4 py-2">{p.supplierName}</td>
                    <td className="px-4 py-2">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{p.paymentMethod}</td>
                    <td className="px-4 py-2 text-right">{Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-2">{p.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Updated Summary using backend Outstanding API */}
        <div className="flex justify-between items-center mt-4 p-2 border-t font-semibold">
          <div>Total Outstanding: <span className="text-red-600">{summary.totalOutstanding.toLocaleString()}</span></div>
          <div>Total Paid: <span className="text-green-600">{summary.totalPaid.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}
