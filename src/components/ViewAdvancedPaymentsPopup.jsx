import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ViewAdvancedPaymentsPopup({ onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/api/advanced-payments`;

  // Fetch all advanced payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setPayments(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch advanced payments:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

    // Filter payments by customer name
  const filteredPayments = payments.filter((p) =>
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-xs">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black opacity-20"></div>

      {/* Modal container */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 p-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-center w-full">
            All Advanced Payments
          </h2>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-white hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto max-h-[20vh]">
          {loading ? (
            <p className="text-center mt-10">Loading...</p>
          ) : filteredPayments.length === 0 ? (
            <p className="text-center mt-10">No matching advanced payments found.</p>
          ) : (
            filteredPayments.map((p) => (
              <div
                key={p._id}
                className="border rounded-md p-3 mb-3 flex justify-between items-center hover:shadow-md"
              >
                <div className="flex flex-col">
                  <p><strong>Name:</strong> {p.customerName}</p>
                  <p><strong>Phone:</strong> {p.phone}</p>
                  <p><strong>Email:</strong> {p.email}</p>
                  <p><strong>Date:</strong> {new Date(p.date).toLocaleDateString()}</p>
                  <p><strong>Amount:</strong> {p.amount}</p>
                  <p><strong>Remarks:</strong> {p.remarks}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
