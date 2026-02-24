import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineCheckCircle, AiOutlineClose } from "react-icons/ai";

const AutoRefresh = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch message from backend
    const fetchMessage = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/refresh-message`); // Update with your backend endpoint
        setMessage(res.data.message || "Refreshed successfully!");
      } catch (err) {
        console.error("Backend not connected:", err);
        setMessage("Unable to fetch message. Backend not connected!");
        setError(true);
      }
    };

    fetchMessage();

    // Auto-close popup after 2 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center bg-white shadow-lg border-l-4 rounded-md border-green-500 p-4 max-w-sm w-full animate-slide-in">
      <div className="flex items-center space-x-2">
        {error ? (
          <AiOutlineClose size={24} className="text-red-500" />
        ) : (
          <AiOutlineCheckCircle size={24} className="text-green-500" />
        )}
        <span className="text-gray-800 font-medium">{message}</span>
      </div>
    </div>
  );
};

export default AutoRefresh;
