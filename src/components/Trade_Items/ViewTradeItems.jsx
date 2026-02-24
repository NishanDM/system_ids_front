import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewTradeItems = ({ open, onClose }) => {
  const [tradeItems, setTradeItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch all trade items
  const fetchTradeItems = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/trade-items`);
      setTradeItems(res.data || []);
    } catch (err) {
      console.error("Failed to load trade items:", err);
    }
  };

  useEffect(() => {
    if (open) fetchTradeItems();
  }, [open]);

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          
          <div className="w-full max-w-5xl mx-4 bg-white rounded-xl shadow-xl border border-gray-200 animate-fadeIn">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-800">
                Trade Items
              </h2>

              <button
                onClick={onClose}
                className="px-3 py-1 text-sm font-medium text-gray-600 rounded hover:bg-gray-200 transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Table */}
            <div className="p-6">
              <div className="overflow-y-auto max-h-[500px] border rounded-lg">
                <table className="w-full text-sm text-left">
                  
                  <thead className="sticky top-0 bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-3 border-b font-semibold">No</th>
                      <th className="p-3 border-b font-semibold">Date</th>
                      <th className="p-3 border-b font-semibold">Customer</th>
                      <th className="p-3 border-b font-semibold">Item</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tradeItems.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-10 text-gray-500">
                          No trade items found
                        </td>
                      </tr>
                    ) : (
                      tradeItems.map((trade, index) => (
                        <tr
                          key={trade._id}
                          onClick={() => setSelectedItem(trade)}
                          className="cursor-pointer hover:bg-blue-50 transition"
                        >
                          <td className="p-3 border-b">{index + 1}</td>

                          <td className="p-3 border-b">
                            {trade.payment?.date}
                          </td>

                          <td className="p-3 border-b">
                            {trade.customer?.firstName}{" "}
                            {trade.customer?.lastName}
                          </td>

                          <td className="p-3 border-b font-medium text-gray-700">
                            {trade.item?.label}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= DETAILS MODAL ================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none">

          <div className="w-full max-w-2xl mx-4 bg-white rounded-xl shadow-xl border border-gray-200">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-800">
                Trade Item Details
              </h2>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-sm">

              {/* Customer */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Customer Details
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedItem.customer.prefix}{" "}
                    {selectedItem.customer.firstName}{" "}
                    {selectedItem.customer.lastName}
                  </p>

                  <p>
                    <span className="font-medium">Mobile:</span>{" "}
                    {selectedItem.customer.mobile}
                  </p>
                </div>
              </div>

              {/* Item */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Item Details
                </h3>

                <div className="grid grid-cols-2 gap-2">

                  <p><span className="font-medium">Label:</span> {selectedItem.item.label}</p>
                  <p><span className="font-medium">Category:</span> {selectedItem.item.category}</p>

                  <p><span className="font-medium">Qty:</span> {selectedItem.item.qty}</p>
                  <p><span className="font-medium">Unit Price:</span> {selectedItem.item.unitPrice}</p>

                  <p><span className="font-medium">Model:</span> {selectedItem.item.attributes?.model}</p>
                  <p><span className="font-medium">Color:</span> {selectedItem.item.attributes?.color}</p>

                  <p><span className="font-medium">Region:</span> {selectedItem.item.attributes?.region}</p>
                  <p><span className="font-medium">Serial:</span> {selectedItem.item.attributes?.serialNumber}</p>

                  <p><span className="font-medium">IMEI:</span> {selectedItem.item.attributes?.imeiNumber}</p>
                  <p><span className="font-medium">Condition:</span> {selectedItem.item.attributes?.condition}</p>

                </div>
              </div>

              {/* Payment */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Payment Details
                </h3>

                <div className="grid grid-cols-2 gap-2">

                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {selectedItem.payment.date}
                  </p>

                  <p>
                    <span className="font-medium">Method:</span>{" "}
                    {selectedItem.payment.method}
                  </p>

                  <p>
                    <span className="font-medium">Amount:</span>{" "}
                    {selectedItem.payment.amount}
                  </p>

                  <p>
                    <span className="font-medium">Bill Maker:</span>{" "}
                    {selectedItem.payment.billMaker}
                  </p>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ViewTradeItems;
