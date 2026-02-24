import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SideAlert from "../../components/public/SideAlert";
import axios from "axios";
import ViewTradeItems from "./ViewTradeItems";

const OnlyTradeItem = ({ open, onClose }) => {

  const [step, setStep] = useState(1);
  const [tradeItem, setTradeItem] = useState(null);
  const [jobCreators, setJobCreators] = useState([]);
  const [viewTradeItemsOpen, setViewTradeItemsOpen] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (title, message, type = "info") => {
    setAlert({ show: true, title, message, type });
  };

  const [customer, setCustomer] = useState({
    prefix: "Mr",
    firstName: "",
    lastName: "",
    mobile: "",
  });

  const generateKeyFromLabel = (label) => {
    if (!label) return "";
    return label
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const [item, setItem] = useState({
    category: "product",
    key: "",
    label: "",
    qty: 1,
    unitPrice: "",
    attributes: {
      model: "",
      color: "",
      region: "",
      serialNumber: "",
      imeiNumber: "",
      condition: "",
    },
  });

  const [payment, setPayment] = useState({
    date: new Date().toISOString().slice(0, 10),
    method: "Cash",
    amount: "",
    billMaker: "",
  });

  async function fetchJobCreators() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/job-creators`
      );
      setJobCreators(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      alert("Failed to load job creators list.");
    }
  }

  useEffect(() => {
    if (open) fetchJobCreators();
  }, [open]);

  /* ---------------- SAVE CUSTOMER ---------------- */

  const handleSaveCustomer = async () => {
    if (!customer.firstName || !customer.lastName || !customer.mobile) {
      showAlert("Validation Error", "Please fill all required customer fields", "error");
      return;
    }

    const payload = {
      prefix: customer.prefix,
      name: `${customer.firstName.trim()} ${customer.lastName.trim()}`,
      phone: customer.mobile.trim(),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/edit_customer/`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showAlert("Success", "Customer saved successfully!", "success");
      setStep(2);

    } catch (err) {
      showAlert("Error", err.message, "error");
    }
  };

  /* ---------------- ADD TO STOCK ---------------- */

  const handleAddToStock = async () => {

    if (!item.label || !item.unitPrice) {
      showAlert("Validation Error", "Please fill Item Name and Unit Price", "error");
      return;
    }

    const payload = {
      category: item.category,
      key: generateKeyFromLabel(item.label),
      label: item.label,
      qty: item.qty,
      unitPrice: item.unitPrice,
      attributes: item.attributes,
      createdAt: new Date().toISOString(),
    };

    try {

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stock`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showAlert("Success", "Item added to stock!", "success");

      setTradeItem(item);
      setStep(3);

    } catch (err) {
      showAlert("Error", err.message, "error");
    }
  };

  /* ---------------- SAVE TRADE ITEM ---------------- */

  const handleSaveTradeItem = async () => {

    if (!payment.amount) {
      showAlert("Validation Error", "Payment amount required", "error");
      return;
    }

    const payload = {
      customer,
      item,
      payment,
      createdAt: new Date().toISOString(),
    };

    try {

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trade-items`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showAlert("Success", "Trade item saved successfully!", "success");

      downloadPaymentPDF(payment, customer, item);

      onClose();

    } catch (err) {
      showAlert("Error", err.message, "error");
    }
  };

  /* ---------------- PDF ---------------- */

const downloadPaymentPDF = (payment, customer, item) => {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();

  /* ---------- HEADER ---------- */
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13); // smaller title
  pdf.text("i Device Solutions - Trade Item Invoice", pageWidth / 2, 10, { align: "center" });

  pdf.setLineWidth(0.2);
  pdf.line(10, 13, pageWidth - 10, 13);

  /* ---------- CUSTOMER ---------- */
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("Customer Details", 10, 20);

  pdf.setFont("helvetica", "normal");
  pdf.text(
    `Name: ${customer.prefix} ${customer.firstName} ${customer.lastName}`,
    10,
    26
  );
  pdf.text(`Mobile: ${customer.mobile}`, 10, 31);

  /* ---------- PAYMENT ---------- */
  pdf.setFont("helvetica", "bold");
  pdf.text("Payment Details", 120, 20);

  pdf.setFont("helvetica", "normal");
  pdf.text(`Date: ${payment.date}`, 120, 26);
  // pdf.text(`Method: ${payment.method}`, 120, 31);
  pdf.text(`Bill Maker: ${payment.billMaker}`, 120, 31);

  pdf.line(10, 40, pageWidth - 10, 40);

  /* ---------- ITEM ---------- */
  pdf.setFont("helvetica", "bold");
  pdf.text("Item Details", 10, 46);

  pdf.setFont("helvetica", "normal");
  pdf.text(`Item: ${item.label}`, 10, 52);

  let attrY = 57;

  if (item.attributes.model)
    pdf.text(`Model/Capacity: ${item.attributes.model}`, 10, attrY);
  if (item.attributes.color)
    pdf.text(`Color: ${item.attributes.color}`, 70, attrY);
  if (item.attributes.condition)
    pdf.text(`Condition: ${item.attributes.condition}`, 130, attrY);

  attrY += 6;

  if (item.attributes.serialNumber)
    pdf.text(`Serial: ${item.attributes.serialNumber}`, 10, attrY);
  if (item.attributes.imeiNumber)
    pdf.text(`IMEI: ${item.attributes.imeiNumber}`, 130, attrY);

  pdf.line(10, attrY + 5, pageWidth - 10, attrY + 5);

  /* ---------- TABLE ---------- */
  const tableY = attrY + 12;

  pdf.setFont("helvetica", "bold");
  pdf.text("Qty", 20, tableY);
  pdf.text("Unit Price", 80, tableY);
  pdf.text("Amount", 150, tableY);

  pdf.line(10, tableY + 2, pageWidth - 10, tableY + 2);

  pdf.setFont("helvetica", "normal");
  pdf.text(String(item.qty), 20, tableY + 8);
  pdf.text(String(item.unitPrice), 80, tableY + 8);
  pdf.text(String(payment.amount), 150, tableY + 8);

  pdf.line(10, tableY + 12, pageWidth - 10, tableY + 12);

  /* ---------- TOTAL ---------- */
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(
    `TOTAL : ${payment.amount}`,
    pageWidth - 10,
    tableY + 20,
    { align: "right" }
  );

  /* ---------- SIGNATURE AREA ---------- */
  const signY = 115;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  // Auth sign line
  pdf.text("Auth Sign:", 20, signY);
  pdf.line(45, signY, 100, signY);

  // Customer sign line
  pdf.text("Customer Sign:", 120, signY);
  pdf.line(160, signY, pageWidth - 20, signY);

  /* ---------- FOOTER ---------- */
  pdf.setFontSize(8); // very small toner-saving text
  pdf.text(
    "Thank you for your business",
    pageWidth / 2,
    130,
    { align: "center" }
  );

  pdf.save(`Trade-Receipt-${customer.prefix} ${customer.firstName} ${customer.lastName}.pdf`);
};

  /* ---------------- STEP HEADER ---------------- */

  const StepHeader = () => (
    <div className="flex justify-between mb-6">
      {["Customer","Item","Payment"].map((s,i)=>(
        <div key={i}
          className={`flex-1 text-center pb-2 border-b-2 ${
            step===i+1
            ? "border-blue-600 font-semibold text-blue-600"
            : "border-gray-200 text-gray-400"
          }`}
        >
          {s}
        </div>
      ))}
    </div>
  );

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">

      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl">

        {/* Header */}

        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-xl">
          <h2 className="font-semibold text-lg">Trade Item</h2>

          <button
            onClick={onClose}
            className="text-gray-500 font-bold hover:text-red-500 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6">

          <StepHeader />

          {/* STEP 1 */}

          {step===1 && (

            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <select
                  value={customer.prefix}
                  onChange={(e)=>setCustomer({...customer,prefix:e.target.value})}
                  className="border rounded p-2"
                >
                  <option>Mr</option>
                  <option>Mrs</option>
                  <option>Miss</option>
                  <option>Dr</option>
                </select>

                <input
                  placeholder="Mobile"
                  className="border p-2 rounded"
                  onChange={(e)=>setCustomer({...customer,mobile:e.target.value})}
                />

                <input
                  placeholder="First Name"
                  className="border p-2 rounded"
                  onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
                />

                <input
                  placeholder="Last Name"
                  className="border p-2 rounded"
                  onChange={(e)=>setCustomer({...customer,lastName:e.target.value})}
                />

              </div>

              <div className="flex justify-between">

                <button
                  onClick={()=>setViewTradeItemsOpen(true)}
                  className="border px-4 py-2 rounded hover:bg-gray-100 cursor-pointer"
                >
                  View Trade Items
                </button>

                <button
                  onClick={handleSaveCustomer}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
                >
                  Save Customer
                </button>

              </div>

            </div>
          )}

          {/* STEP 2 */}

{/* ---------------- STEP 2 ---------------- */}
{step === 2 && (
  <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Category (disabled) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <input
          value="Product"
          disabled
          className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>

      {/* Item Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item Name
        </label>
        <input
          placeholder="iPhone 16 Pro Max"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) =>
            setItem({ ...item, label: e.target.value })
          }
        />
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model / Capacity
        </label>
        <input
          placeholder="128GB / 256GB"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) =>
            setItem({
              ...item,
              attributes: {
                ...item.attributes,
                model: e.target.value,
              },
            })
          }
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <input
          placeholder="Titanium Black"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) =>
            setItem({
              ...item,
              attributes: {
                ...item.attributes,
                color: e.target.value,
              },
            })
          }
        />
      </div>

      {/* Region */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region
        </label>
        <select
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) =>
            setItem({
              ...item,
              attributes: {
                ...item.attributes,
                region: e.target.value,
              },
            })
          }
        >
          <option value="">Select Region</option>
          <option value="NULL">Null - No Region</option>
          <option value="ZPA">ZPA</option>
          <option value="HNA">HNA</option>
          <option value="XA">XA</option>
          <option value="LLA">LLA</option>
        </select>
      </div>

      {/* Serial Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Serial Number
        </label>
        <input
          placeholder="Serial Number"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) =>
            setItem({
              ...item,
              attributes: {
                ...item.attributes,
                serialNumber: e.target.value,
              },
            })
          }
        />
      </div>

      {/* IMEI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          IMEI Number
        </label>
        <input
          placeholder="IMEI Number"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) =>
            setItem({
              ...item,
              attributes: {
                ...item.attributes,
                imeiNumber: e.target.value,
              },
            })
          }
        />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition
        </label>
        <select
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) =>
            setItem({
              ...item,
              attributes: {
                ...item.attributes,
                condition: e.target.value,
              },
            })
          }
        >
          <option value="">Select Condition</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
        </select>
      </div>

      {/* Unit Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unit Price
        </label>
        <input
          type="number"
          placeholder="100000"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) =>
            setItem({
              ...item,
              unitPrice: Number(e.target.value),
            })
          }
        />
      </div>

    </div>

    {/* Buttons */}
    <div className="flex justify-between pt-4 border-t">

      <button
        onClick={() => setStep(1)}
        className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition"
      >
        Back
      </button>

      <button
        onClick={handleAddToStock}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
      >
        Add To Stock
      </button>

    </div>

  </div>
)}


          {/* STEP 3 */}

          {step===3 && (

            <div className="space-y-4">

              <input
                type="date"
                value={payment.date}
                className="border p-2 rounded w-full"
                onChange={(e)=>setPayment({...payment,date:e.target.value})}
              />

              <input
                placeholder="Amount"
                className="border p-2 rounded w-full"
                onChange={(e)=>setPayment({...payment,amount:e.target.value})}
              />

              <select
                className="border p-2 rounded w-full"
                onChange={(e)=>setPayment({...payment,billMaker:e.target.value})}
              >
                <option value="">Select Bill Maker</option>

                {jobCreators.map((j)=>(
                  <option key={j._id}>{j.username}</option>
                ))}

              </select>

              <div className="flex justify-between">

                <button
                  onClick={()=>setStep(2)}
                  className="border px-4 py-2 rounded cursor-pointer"
                >
                  Back
                </button>

                <button
                  onClick={handleSaveTradeItem}
                  className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                  Save & Print
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      <SideAlert {...alert} onClose={()=>setAlert({...alert,show:false})} />

      <ViewTradeItems
        open={viewTradeItemsOpen}
        onClose={()=>setViewTradeItemsOpen(false)}
      />

    </div>
  );
};

export default OnlyTradeItem;
