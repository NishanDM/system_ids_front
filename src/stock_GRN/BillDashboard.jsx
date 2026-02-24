import React, { useEffect, useState } from "react";
import axios from "axios";
import { DateRangePicker } from "react-date-range";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api/bills`;

export default function BillDashboard() {
  const [selectedBill, setSelectedBill] = useState(null);
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [range, setRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get(API_URL);
        setBills(res.data);
      } catch (err) {
        console.error("Error fetching bills:", err);
      }
    };
    fetchBills();
  }, []);

  useEffect(() => {
    const start = range[0].startDate;
    const end = range[0].endDate;
    const filtered = bills.filter((b) => {
      const date = new Date(b.date);
      return date >= start && date <= end;
    });
    setFilteredBills(filtered);
  }, [range, bills]);

  // ✅ Aggregate payment totals across all bills
  const paymentTotals = filteredBills.reduce((acc, bill) => {
    bill.payments.forEach((p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
    });
    return acc;
  }, {});

  const profitTotal = filteredBills.reduce((sum, bill) => sum + bill.billProfit, 0);

  const paymentData = Object.keys(paymentTotals).map((key) => ({
    name: key,
    total: paymentTotals[key],
  }));

  const COLORS = [
    "#2563EB",
    "#16A34A",
    "#F59E0B",
    "#DC2626",
    "#9333EA",
    "#0EA5E9",
    "#059669",
    "#D946EF",
  ];

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-screen">
      <h1 className="text-lg font-semibold text-gray-800">
        Billing & Profit Dashboard
      </h1>

      {/* 🔹 Date Range Filter */}
      <div className="bg-white shadow-md rounded-xl p-4 border border-gray-100">
        <h2 className="text-xs font-semibold mb-2 text-gray-600">
          Select Date Range
        </h2>
        <DateRangePicker
          ranges={range}
          onChange={(item) => setRange([item.selection])}
        />
      </div>

      {/* 🔹 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Bills */}
        <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100 hover:shadow-lg transition">
          <p className="text-xs text-gray-500 font-medium">Total Bills</p>
          <p className="text-lg font-bold text-gray-800">{filteredBills.length}</p>
        </div>

        {/* Total Profit */}
        <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100 hover:shadow-lg transition">
          <p className="text-xs text-gray-500 font-medium">Total Profit</p>
          <p className="text-lg font-bold text-green-600">
            Rs {profitTotal.toFixed(2)}
          </p>
        </div>

        {/* Dynamic Payment Method Cards */}
        {Object.keys(paymentTotals).map((method, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100 hover:shadow-lg transition"
          >
            <p className="text-xs text-gray-500 font-medium">{method}</p>
            <p className="text-lg font-bold text-blue-600">
              Rs {paymentTotals[method].toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* 🔹 Charts Section */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-600 mb-2">
            Payment Method Breakdown
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#2563EB" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-600 mb-2">
            Payment Distribution
          </h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name }) => name}
                >
                  {paymentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🔹 Optional: Detailed Bills Table */}
       <div>
      {/* 🔹 Detailed Bills Table */}
      <div className="bg-white shadow-md rounded-xl p-4 border border-gray-100 mt-4">
  <h3 className="text-xs font-semibold text-gray-600 mb-3">
    Detailed Bill List
  </h3>

  {/* Scrollable table container */}
  <div className="overflow-x-auto max-h-96 border border-gray-100 rounded-lg">
    <table className="w-full text-xs text-left border-collapse">
      <thead className="sticky top-0 bg-gray-100 z-10">
        <tr className="text-gray-600 uppercase">
          <th className="p-2 border">Bill No</th>
          <th className="p-2 border">Customer</th>
          <th className="p-2 border">Date</th>
          <th className="p-2 border">Payments</th>
          <th className="p-2 border">Subtotal</th>
          <th className="p-2 border">Profit</th>
        </tr>
      </thead>
      <tbody>
        {filteredBills.map((bill, index) => (
          <tr
            key={index}
            className="hover:bg-gray-50 border-b transition cursor-pointer"
            onClick={() => setSelectedBill(bill)}
          >
            <td className="p-2 border text-gray-700">{bill.billNumber}</td>
            <td className="p-2 border text-gray-700">{bill.customer?.name}</td>
            <td className="p-2 border text-gray-700">
              {new Date(bill.date).toLocaleDateString()}
            </td>
            <td className="p-2 border text-gray-700">
              {bill.payments.map((p) => (
                <div key={p._id}>
                  {p.method}: Rs {p.amount}
                </div>
              ))}
            </td>
            <td className="p-2 border text-gray-700">Rs {bill.subTotal}</td>
            <td className="p-2 border text-green-600 font-semibold">
              Rs {bill.billProfit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {filteredBills.length === 0 && (
    <p className="text-center text-gray-400 text-xs mt-3">
      No bills found for this date range.
    </p>
  )}
</div>


      {/* 🔹 Modal for Selected Bill */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setSelectedBill(null)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 text-xs">
            <h3 className="text-base font-semibold mb-2">
              Bill Details - {selectedBill.billNumber}
            </h3>

            <div className="space-y-1 mb-3 text-gray-700">
              <p>
                <strong>Job Ref:</strong> {selectedBill.jobRef}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedBill.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Customer:</strong> {selectedBill.customer?.name} (
                {selectedBill.customer?.contact})
              </p>
              <p className="font-semibold mt-2">Payment Details:</p>
              <div className="ml-2 space-y-1">
                {selectedBill.payments && selectedBill.payments.length > 0 ? (
                  selectedBill.payments.map((pm, idx) => (
                    <p key={idx}>
                      • {pm.method}:{" "}
                      <strong>Rs.{pm.amount?.toLocaleString()}</strong>
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No payment information</p>
                )}
              </div>
              <p>
                <strong>Bill Maker:</strong> {selectedBill.billMaker}
              </p>
            </div>

            <div className="border-t pt-2">
              <h4 className="font-semibold mb-1">Items:</h4>
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-1 border">Item</th>
                    <th className="p-1 border text-right">Qty</th>
                    <th className="p-1 border text-right">Unit</th>
                    <th className="p-1 border text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-1 border">{it.finalLabel}</td>
                      <td className="p-1 border text-right">{it.qty}</td>
                      <td className="p-1 border text-right">
                        {it.unitPrice?.toLocaleString()}
                      </td>
                      <td className="p-1 border text-right">
                        {it.amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right mt-2 space-y-1">
                <p>
                  <strong>Subtotal:</strong>{" "}
                  {selectedBill.subTotal?.toLocaleString()} LKR
                </p>
                <p className="text-green-600 font-semibold">
                  <strong>Profit:</strong>{" "}
                  {selectedBill.billProfit?.toLocaleString() || 0} LKR
                </p>
              </div>
            </div>

            <div className="text-right mt-4">
              <button
                onClick={() => setSelectedBill(null)}
                className="px-3 py-1 border rounded-md hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
