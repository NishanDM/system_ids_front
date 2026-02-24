import React, { useEffect, useState } from "react";

const ViewWhatsAppMsg = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMsg, setSelectedMsg] = useState(null);

  // ---------------- Fetch WhatsApp Messages ----------------
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/`);
      if (!res.ok) throw new Error("Failed to fetch WhatsApp messages");

      const data = await res.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ---------------- Format Date ----------------
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  return (
    <>
      {/* Main Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black opacity-40"></div>

        {/* Popup Window */}
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-7xl p-4 ml-60 text-xs max-h-[85vh] flex flex-col">

          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              WhatsApp Messages
            </h2>

            <div className="flex items-center gap-2">

              {/* Refresh Button */}
              <button
                onClick={fetchMessages}
                className="px-3 py-1 bg-cyan-700 text-white rounded hover:bg-cyan-800 cursor-pointer"
              >
                Refresh
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer font-bold"
              >
                X
              </button>

            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto border rounded-lg">

            {loading ? (
              <div className="text-center py-6 text-gray-600">
                Loading messages...
              </div>
            ) : error ? (
              <div className="text-center py-6 text-red-600">
                ⚠️ {error}
              </div>
            ) : (
              <table className="min-w-full text-xs">

                {/* Table Head */}
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">No</th>
                    <th className="px-3 py-2 text-left">Job Ref</th>
                    <th className="px-3 py-2 text-left">Customer</th>
                    <th className="px-3 py-2 text-left">Phone</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Sent At</th>
                    <th className="px-3 py-2 text-left">Created</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y">

                  {messages.map((msg, index) => (
                    <tr
                      key={msg._id}
                      onClick={() => setSelectedMsg(msg)}
                      className="hover:bg-gray-200 cursor-pointer"
                    >
                      <td className="px-3 py-2">{index + 1}</td>

                      <td className="px-3 py-2 font-medium">
                        {msg.jobRef}
                      </td>

                      <td className="px-3 py-2">
                        {msg.customerName}
                      </td>

                      <td className="px-3 py-2">
                        {msg.customerPhone}
                      </td>

                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-white text-[10px]
                          ${msg.status === "sent"
                            ? "bg-green-500"
                            : "bg-gray-500"}
                        `}>
                          {msg.status}
                        </span>
                      </td>

                      <td className="px-3 py-2">
                        {formatDate(msg.sentAt)}
                      </td>

                      <td className="px-3 py-2">
                        {formatDate(msg.createdAt)}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            )}

          </div>

        </div>
      </div>


      {/* Message View Popup */}
      {selectedMsg && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setSelectedMsg(null)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-4 text-xs">

            {/* Header */}
            <div className="flex justify-between items-center mb-2 border-b pb-1">

              <h3 className="font-semibold">
                WhatsApp Message
              </h3>

              <button
                onClick={() => setSelectedMsg(null)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer font-bold"
              >
                X
              </button>

            </div>

            {/* Message Info */}
            <div className="space-y-1 mb-2">

              <div>
                <strong>Job Ref:</strong> {selectedMsg.jobRef}
              </div>

              <div>
                <strong>Customer:</strong> {selectedMsg.customerName}
              </div>

              <div>
                <strong>Phone:</strong> {selectedMsg.customerPhone}
              </div>

              <div>
                <strong>Status:</strong> {selectedMsg.status}
              </div>

              <div>
                <strong>Sent At:</strong> {formatDate(selectedMsg.sentAt)}
              </div>

            </div>

            {/* Message Body */}
            <div className="border rounded p-2 bg-gray-50 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {selectedMsg.messageBody}
            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default ViewWhatsAppMsg;