
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import CashExpenses from "./CashExpenses";
import ViewExpenses from "./ViewExpenses";
import PaymentSummary from "./PaymentSummary";

export default function CashHandeling({ onClose }) {
  // small icon components
  const CloseIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

 const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  });
  const [cashData, setCashData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExpensePopup, setShowExpensePopup] = useState(false);
  const [showViewExpenses, setShowViewExpenses] = useState(false);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);


const fetchDailyExpenses = async (date) => {
  try {
    setExpensesLoading(true);
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/cash-expenses?date=${date}`
    );
    setDailyExpenses(res.data || []);
  } catch (err) {
    setDailyExpenses([]);
  } finally {
    setExpensesLoading(false);
  }
};

  const fetchCashBalance = async (date) => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cash-balance/${date}`
      );

      setCashData(res.data);
    } catch (err) {
      setError("Failed to load cash balance");
      setCashData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashBalance(selectedDate);
    fetchDailyExpenses(selectedDate);
  }, [selectedDate]);

  return (
    // overlay
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 p-6 text-sm min-h-[600px]">
        {/* header */}
        <div className="flex items-start justify-between space-x-4">
          <div>
            <h2 className="font-semibold text-xs">Cash Handeling</h2>
            <p className="text-gray-600 text-[11px]">Please use this to handel expences and cash handeling.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
            aria-label="Close"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <hr className="my-3" />

    {/* Date Picker */}
    <div className="flex items-center gap-3 mb-5">
      <label className="text-xs font-medium text-gray-700">
        Select Date
      </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="border rounded px-2 py-1 text-xs"
      />

      <button onClick={() => setShowExpensePopup(true)} className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700 transition cursor-pointer">Add an Expence</button>
      <button onClick={() => setShowViewExpenses(true)} className="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded hover:bg-green-800 transition cursor-pointer">View Cash Expences</button>
      <button onClick={() => setShowPaymentSummary(true)}  className="px-4 py-2 bg-purple-500 text-white font-bold text-xs rounded hover:bg-purple-700 transition cursor-pointer">All Transactions</button>
    </div>
  {/* Content */}
    {loading && (
      <p className="text-xs text-gray-500">Loading cash balance...</p>
    )}

    {error && (
      <p className="text-xs text-red-500">{error}</p>
    )}

    {cashData && (
      <div className="grid grid-cols-2 gap-4">
        {/* Cash In */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-xs mb-3">Cash In</h3>

          <div className="flex justify-between text-xs mb-1">
            <span>Bill Payments</span>
            <span>Rs. {cashData.cashIn.bills.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs mb-1">
            <span>Advance Payments (Cash Only)</span>
            <span>Rs. {cashData.cashIn.advances.toLocaleString()}</span>
          </div>

          <hr className="my-2" />

          <div className="flex justify-between text-xs font-semibold">
            <span>Total Cash In</span>
            <span>Rs. {cashData.cashIn.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Cash Out */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-xs mb-3">Cash Out</h3>

          <div className="flex justify-between text-xs">
            <span>Expenses</span>
            <span>Rs. {cashData.cashOut.expenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Closing Cash */}
        <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg p-5 text-center">
          <p className="text-xs text-green-700 mb-1">
            Closing Cash Balance
          </p>
          <p className="text-2xl font-bold text-green-800">
            Rs. {cashData.closingCash.toLocaleString()}
          </p>
        </div>
      </div>
    )}
    {showExpensePopup && (
  <CashExpenses
    defaultDate={selectedDate}
    onClose={() => setShowExpensePopup(false)}
    onSaved={() => {fetchCashBalance(selectedDate); fetchDailyExpenses(selectedDate);}} // refresh balance
  />
)}

{showViewExpenses && (
  <ViewExpenses
    date={selectedDate}
    onClose={() => setShowViewExpenses(false)}
  />
)}

{/* Daily Expenses – Tiny Scroll View */}
<div className="col-span-2 border rounded-md bg-gray-50 p-2 mt-3">
  <p className="text-[10px] font-semibold text-gray-700 mb-1">
    Expenses for {selectedDate}
  </p>

  <div className="max-h-[120px] overflow-y-auto border rounded bg-white">
    {expensesLoading && (
      <p className="text-[10px] text-gray-400 text-center py-2">
        Loading expenses...
      </p>
    )}

    {!expensesLoading && dailyExpenses.length === 0 && (
      <p className="text-[11px] text-gray-400 text-center py-2">
        No expenses recorded
      </p>
    )}

    {!expensesLoading &&
      dailyExpenses.map((exp) => (
        <div
          key={exp._id}
          className="flex justify-between px-2 py-1 border-b last:border-b-0 text-[10px]"
        >
          <span className="truncate max-w-[70%] text-gray-700">
            {exp.description || "—"}
          </span>
          <span className="font-medium text-red-600">
            Rs. {Number(exp.amount).toLocaleString()}
          </span>
        </div>
      ))}
  </div>
</div>
      {/* Render the modal only when the flag is true */}
      {showPaymentSummary && (
        <PaymentSummary onClose={() => setShowPaymentSummary(false)} defaultDate={selectedDate} />
      )}
        </div>
    </div>
  );
}
