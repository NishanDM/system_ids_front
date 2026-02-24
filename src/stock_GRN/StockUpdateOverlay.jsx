import React from "react";

export default function StockUpdateOverlay({ open, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Popup */}
      <div className="relative bg-white rounded-xl shadow-xl px-6 py-4 text-xs flex flex-col items-center space-y-3">
        {/* Spinner */}
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>

        <p className="font-semibold text-gray-800">
          {message || "Waiting for stock updating & Saving the GRN Properly..."}
        </p>

        <p className="text-[11px] text-gray-500 text-center">
          Please do not close or refresh this window.
        </p>
      </div>
    </div>
  );
}
