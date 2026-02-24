import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DamageRecordsPopup({ onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [techniciansMap, setTechniciansMap] = useState({}); // Map _id -> username

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Fetch all damaged parts records
        const resRecords = await axios.get(`${import.meta.env.VITE_API_URL}/api/damagedparts`);
        const recordsData = resRecords.data;

        // Fetch technicians to map _id -> username
        const resTechs = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/technicians`);
        const techMap = {};
        resTechs.data.forEach((tech) => {
          techMap[tech._id] = tech.username;
        });

        setTechniciansMap(techMap);
        setRecords(recordsData);
      } catch (err) {
        console.error("Error fetching damage records:", err);
        setError(err.message || "Failed to fetch records");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Popup Container */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 p-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-base font-semibold text-gray-800">Damage Records</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[500px] space-y-4">
          {loading ? (
            <p className="text-gray-600 text-center">Loading records...</p>
          ) : error ? (
            <p className="text-red-600 text-center">⚠️ {error}</p>
          ) : records.length === 0 ? (
            <p className="text-gray-500 text-center">No damage records found.</p>
          ) : (
            records.map((record) => (
              <div key={record._id} className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-semibold">
                  Technician: {record.technician?.username || "Unknown"}
                </p>
                <p className="text-sm">
                  Date: {new Date(record.date).toLocaleDateString()} | Job No: {record.jobNumber} | Total: Rs. {record.damageTotal}
                </p>
                {record.remark && <p className="text-sm italic">Remark: {record.remark}</p>}

                <div className="mt-2 space-y-1 border-t pt-2">
                  {record.damagedItems.map((item) => (
                    <div key={item._id || item.id} className="text-xs bg-white p-2 rounded border">
                      <p>
                        <span className="font-semibold">{item.label}</span> | Qty: {item.qty} | Rs. {item.unitPrice}
                      </p>
                      <p>
                        {item.description && `Description: ${item.description} | `}
                        {item.compatibility && `Compatibility: ${item.compatibility} | `}
                        {item.brand && `Brand: ${item.brand} | `}
                        {item.color && `Color: ${item.color} | `}
                        {item.model && `Model: ${item.model} | `}
                        {item.condition && `Condition: ${item.condition} | `}
                        {item.serialNumber && `S/N: ${item.serialNumber} | `}
                        {item.imeiNumber && `IMEI: ${item.imeiNumber}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
