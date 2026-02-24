
import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewGRN = ({ onClose }) => {
  const [grns, setGrns] = useState([]);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState(""); // New state for date

  const API_URL = `${import.meta.env.VITE_API_URL}/api/grn`;

  // FETCH ALL GRNs
const fetchGRNs = async () => {
  try {
    setLoading(true);
    setError("");
    const res = await axios.get(API_URL);
    setGrns(res.data || []);
    setSearchTerm("");   // Reset text search
    setSearchDate("");   // Reset date filter
  } catch (err) {
    console.error(err);
    setError("Failed to load GRNs");
  } finally {
    setLoading(false);
  }
};


const filteredGrns = grns.filter((grn) => {
  const matchesText =
    grn.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grn.invoice.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesDate = searchDate ? grn.date === searchDate : true;

  return matchesText && matchesDate;
});


  // LOAD ON COMPONENT MOUNT
  useEffect(() => {
    fetchGRNs();
  }, []);

  return (
    <>
      {/* MAIN POPUP */}
      <div className="fixed inset-0 bg-black/40 flex items-center text-sm justify-end p-4 z-50">
        <div className="bg-white w-[95%] max-w-6xl rounded-xl shadow-xl">

          {/* HEADER */}
          <div className="flex justify-between items-center border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Goods Received Notes (GRN)
            </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="search"
                placeholder="Search by supplier or invoice..."
                className="pl-10 pr-4 py-2 w-120 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                ></path>
              </svg>
            </div>

            {/* Date filter */}
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="pl-2 pr-4 py-2 w-40 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
            <div className="flex gap-2">
              <button
                onClick={fetchGRNs}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-green-500 transition cursor-pointer"
              >
                Refresh
              </button>

              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* TABLE */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-sm">
          {/* Total Count */}
          <div className="mb-2 text-gray-600 text-sm">
            Total GRN invoices: {filteredGrns.length}
          </div>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="p-3 text-left">No</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">Supplier</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-center">Payment Method</th>
              </tr>
            </thead>

            <tbody>
              {filteredGrns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No GRN records found
                  </td>
                </tr>
              ) : (
                filteredGrns.map((grn, index) => (
                  <tr
                    key={grn._id}
                    onClick={() => setSelectedGRN(grn)}
                    className="border-t hover:bg-blue-50 cursor-pointer transition text-sm"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{grn.date}</td>
                    <td className="p-3">{grn.invoice}</td>
                    <td className="p-3">{grn.supplier}</td>
                    <td className="p-3 text-right font-semibold">
                      {grn.grandTotal?.toLocaleString()}
                    </td>
                    <td className="p-3 text-center capitalize">
                      {grn.paymentMethodOfGRN}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        </div>
      </div>

      {/* DETAILS POPUP */}
      {selectedGRN && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white w-[95%] max-w-4xl rounded-xl shadow-xl">

            {/* HEADER */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold">
                  GRN Details - {selectedGRN.invoice}
                </h3>
                <p className="text-sm text-gray-500">
                  Supplier: {selectedGRN.supplier}
                </p>
              </div>

              <button
                onClick={() => setSelectedGRN(null)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* DETAILS */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span> {selectedGRN.date}
                </div>
                <div>
                  <span className="text-gray-500">Payment:</span>{" "}
                  {selectedGRN.paymentMethodOfGRN}
                </div>
                <div>
                  <span className="text-gray-500">Grand Total:</span>{" "}
                  <span className="font-semibold">
                    {selectedGRN.grandTotal?.toLocaleString()}
                  </span>
                </div>
              </div>

              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-sm">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Compatibility</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedGRN.items?.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-3">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">
                          {item.attributes?.description}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {item.attributes?.compatibility}
                      </td>
                      <td className="p-3 text-center">{item.qty}</td>
                      <td className="p-3 text-right">
                        {item.unitPrice?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {item.lineTotal?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewGRN;

