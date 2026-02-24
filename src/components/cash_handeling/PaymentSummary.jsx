import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PaymentSummary({ onClose, defaultDate }) {
  const [bills, setBills] = useState([]);
  const [dateFrom, setDateFrom] = useState(defaultDate || "");
  const [dateTo, setDateTo] = useState(defaultDate || "");
  const [filteredBills, setFilteredBills] = useState([]);
  const [paymentTotals, setPaymentTotals] = useState({});

  const paymentMethods = [
    "Card - Visa",
    "Card - MasterCard",
    "Bank Transfer",
    "KOKO",
    "Cash",
    "Cheque",
    "Credit",
    "Half-Payment",
  ];

  // Fetch all bills
  const fetchBills = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bills`);
      setBills(res.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Filter bills by date range
  useEffect(() => {
    if (!dateFrom || !dateTo) {
      setFilteredBills([]);
      setPaymentTotals({});
      return;
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    const filtered = bills.filter((bill) => {
      const billDate = new Date(bill.date);
      return billDate >= from && billDate <= to;
    });

    setFilteredBills(filtered);

    // Calculate payment totals
    const totals = {};
    paymentMethods.forEach((m) => (totals[m] = 0));
    filtered.forEach((bill) => {
      bill.payments?.forEach((p) => {
        if (totals[p.method] !== undefined) totals[p.method] += p.amount || 0;
      });
    });

    setPaymentTotals(totals);
  }, [dateFrom, dateTo, bills]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-[11px]">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-xl w-11/12 max-w-3xl p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Payment Summary of IDS BILL INVOICES</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white hover:bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-[10px] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
  <div className="flex flex-col">
    <label className="mb-1 text-gray-700 font-medium text-xs">From</label>
    <input
      type="date"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
    />
  </div>

  <div className="flex flex-col">
    <label className="mb-1 text-gray-700 font-medium text-xs">To</label>
    <input
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
    />
  </div>
</div>


        {/* Payment Table */}
        <div className="overflow-x-auto max-h-80 border border-gray-200 rounded-lg shadow-sm">
  <table className="min-w-full border-collapse">
    <thead className="bg-blue-100 sticky top-0 z-10">
      <tr>
        <th className="border-b border-gray-300 px-4 py-1 text-left text-sm font-semibold text-gray-700">Payment Method</th>
        <th className="border-b border-gray-300 px-4 py-1 text-right text-sm font-semibold text-gray-700">Total (LKR)</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {paymentMethods.map((method, idx) => (
        <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150">
          <td className="px-4 py-1 text-sm text-gray-800">{method}</td>
          <td className="px-4 py-1 text-sm text-right font-medium text-gray-900">
            {paymentTotals[method]?.toLocaleString() || 0}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      </div>
    </div>
  );
}
