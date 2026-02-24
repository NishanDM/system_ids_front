import React, { useState } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";
import ViewAdvancedPaymentsPopup from "./ViewAdvancedPaymentsPopup";

export default function AdvancedPayments({ onClose }) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showViewPayments, setShowViewPayments] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    date: "",
    remarks: "",
    amount: "",
    paymentMethod: "",
  });

  const handleChange = (e) => {
  const { name, value } = e.target;

  // Only allow numbers for phone
  if (name === "phone") {
    const numericValue = value.replace(/\D/, ""); // remove non-digits
    setFormData((prev) => ({ ...prev, [name]: numericValue }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};


const handleSaveAdvanced = async (formData) => {
  // ✅ Validate BEFORE API call
  if (!formData.paymentMethod) {
    alert("Please select a payment method");
    return;
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/advanced-payments`,
      formData
    );

    console.log("Advanced Payment Saved:", response.data);
    alert("Advanced Payment saved successfully!");
    
  } catch (error) {
    console.error("Error saving advanced payment:", error);
    alert(
      error.response?.data?.message ||
        "Failed to save advanced payment. Please try again."
    );
  }
};


const resetForm = () => {
  setFormData({
    customerName: "",
    phone: "",
    email: "",
    date: "",
    remarks: "",
    amount: "",
    paymentMethod: "",
  });
};


  const downloadPDF = () => {
  const doc = new jsPDF({
    orientation: "landscape", // A5 landscape
    unit: "mm",
    format: [148, 210], // height x width for A5 landscape
  });

  // Company title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("i Device Solutions - Advanced Payment Receipt", 105, 15, { align: "center" });

  // Company Address & Phone
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Address: No.363, Galle Rd, Colombo 06, Sri Lanka", 10, 30);
  doc.text("Phone: +94 777 142 502 | +94 777 142 402 | +94 112 500 990", 10, 37);

  // Draw a line
  doc.setLineWidth(0.5);
  doc.line(10, 42, 200, 42);

  // Customer details & form data
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details:", 10, 50);

  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${formData.customerName}`, 10, 57);
  doc.text(`Phone: ${formData.phone}`, 10, 64);
  doc.text(`Email: ${formData.email}`, 10, 71);
  doc.text(`Date: ${formData.date}`, 10, 78);
  doc.text(`Advanced Payment Amount: Rs.${formData.amount}.00 | (${formData.paymentMethod})`, 10, 85);
  doc.text(`Remarks: ${formData.remarks}`, 10, 92);

  // Notes & authorization
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Note: This advanced payment is valid only for 30 days.", 10, 105);
  doc.text("Auth Sign: ..................................................", 10, 115);

  // Open PDF in new tab
  doc.output("dataurlnewwindow"); // This opens the PDF in a new browser tab
  resetForm();
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-xs">
      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-xl w-full mx-4 p-6 min-h-[300px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-green-700 ml-45">ADVANCE PAYMENTS</h2>
          <button
            onClick={() => setShowCloseConfirm(true)}
            className="absolute top-3 right-3 text-gray-600 hover:text-white hover:font-bold hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Customer Name"
            className="border border-gray-300 rounded-md p-2"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            maxLength={10} 
            className="border border-gray-300 rounded-md p-2"
            />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border border-gray-300 rounded-md p-2"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2"
          />
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Remarks"
            className="border border-gray-300 rounded-md p-2 resize-none"
          />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="border border-gray-300 rounded-md p-2"
          />
          <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 cursor-pointer"
        >
          <option value="">Select Payment Method</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="card">Card</option>
        </select>

          <button
            onClick={() => handleSaveAdvanced(formData)}
            disabled={!formData.paymentMethod}
            className={`font-bold px-4 py-2 rounded-md cursor-pointer 
              ${!formData.paymentMethod 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600 text-white"}`}
          >
            Save
          </button>

          <button
            onClick={downloadPDF}
            className="bg-green-500 font-bold hover:bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            Print PDF
          </button>
          <button
            onClick={() => setShowViewPayments(true)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md mt-2 cursor-pointer"
          >
            View Advanced Payments
          </button>
        </div>
      </div>
{showViewPayments && (
  <ViewAdvancedPaymentsPopup onClose={() => setShowViewPayments(false)} />
)}
      {/* CLOSE CONFIRM */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40"></div>

          <div className="relative bg-white rounded-xl shadow-xl w-80 p-4 text-center">
            <p className="mb-4 font-semibold">Are you sure you want to close?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  onClose();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-md cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
