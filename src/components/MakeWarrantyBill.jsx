import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import companyLogo from "/IDSLogo.png"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import StockForBill from "../stock_GRN/StockForBill";
import TradeProductItemGRN from "../stock_GRN/TradeProductItemGRN";
import ViewAdvancedPayments from "./ViewAdvancedPayments";
import SideAlert from "./public/SideAlert";
import BillsModal from "../stock_GRN/BillsModal";

export default function MakeWarrantyBill({ open = true, onClose = () => {true}}) {

//------------PAYMENT METHODS SECTION--------------
const paymentMethods = [  "Card - Visa",  "Card - MasterCard",  "Bank Transfer",  "KOKO",  "Cash",  "Cheque",  "Credit",  "Half-Payment",];
const [openTradeModal, setOpenTradeModal] = useState(false);
const [payments, setPayments] = useState([]);
const [showCloseConfirm, setShowCloseConfirm] = useState(false);
const [showEmergencyWarning, setShowEmergencyWarning] = useState(false);
const [showViewPayments, setShowViewPayments] = useState(false);
const [warrantyBillNo, setWarrantyBillNo] = useState("");
const [warrantyBillDate, setWarrantyBillDate] = useState("");

const namePattern =/^(mr\.|mrs\.|miss\.|dr\.|ven\.)\s[A-Z][a-z]+(\s[A-Z][a-z]+){1,2}$/i;
const phonePattern = /^(01|07)\d{8}$/;

const [alertSlide, setAlertSlide] = useState({
  show: false,
  title: "",
  message: "",
  type: "error",
});
const showError = (title, message) => {
  setAlertSlide({
    show: true,
    title,
    message,
    type: "error",
  });
};
const showSuccess = (title, message) => {
  setAlertSlide({
    show: true,
    title,
    message,
    type: "success",
  });
};
const handleCheck = (method) => {
  setPayments((prev) =>
    prev.some((p) => p.method === method)
      ? prev.filter((p) => p.method !== method) // remove if exists
      : [...prev, { method, amount: "" }] // add if not selected
  );
};

const handleAmountChangeForPaymentMethod = (method, amount) => {
  setPayments((prev) =>
    prev.map((p) =>
      p.method === method ? { ...p, amount } : p
    )
  );
};

const forbiddenDiscountWords = ["DISCOUNT","discount","Discnt","discnt","DSCOUNT","DSCNT","dscnt","Dscnt","disct","DISCT","disc.","Disc.","dsct","DSCT","dis.","Dis."];

const discountPin = "132112";
// Utility function to detect discount words
const containsDiscount = (text) => {
  return forbiddenDiscountWords.some((word) =>
    text.toUpperCase().includes(word.toUpperCase())
  );
};


  const [showStockModal, setShowStockModal] = useState(false);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [jobRefInput, setJobRefInput] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [billMaker, setBillMaker] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [jobCreators, setJobCreators] = useState([]); 
  const [customer, setCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    company: "",
  });
  const [isBillSaved, setIsBillSaved] = useState(false);

  //==============   FETCHING ALL JOB CREATORS  =======================
    // 🔽 Fetch job creators when the modal opens
  useEffect(() => {
    if (open) {
      fetchJobCreators();
      setBillNumber(fetchBillNumber());
    }
  }, [open]);
// =========== fetch job creators============
  async function fetchJobCreators() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/job-creators`);
      if (Array.isArray(res.data)) {
        setJobCreators(res.data);
      } else {
        console.warn("Unexpected response for job creators:", res.data);
        setJobCreators([]);
      }
    } catch (error) {
      console.error("Error fetching job creators:", error);
      alert("Failed to load job creators list.");
    }
  }

  //==============  fetch technicians ====================
  async function fetchTechnicians() {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/technicians`);
    if (Array.isArray(res.data)) {
      setTechnicians(res.data); // Make sure you have a state variable like `technicians`
    } else {
      console.warn("Unexpected response for technicians:", res.data);
      setTechnicians([]);
    }
  } catch (error) {
    console.error("Error fetching technicians:", error);
    alert("Failed to load technicians list.");
  }
}
useEffect(() => {
  fetchTechnicians();
}, []);


  const [itemDraft, setItemDraft] = useState({ description: "", qty: 1, unitPrice: 0, amount: 0 });
  const [items, setItems] = useState([]);

  const printRef = useRef(null);

  useEffect(() => {
    // Recalculate amount whenever qty or unitPrice change in draft
    setItemDraft((d) => ({ ...d, amount: roundTo2(d.qty * d.unitPrice) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemDraft.qty, itemDraft.unitPrice]);

  async function fetchBillNumber() {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bills/generate-number`);
      setBillNumber(response.data.billNumber);
    } catch (error) {
      console.error("Error fetching bill number:", error);
      setBillNumber(""); // fallback if needed
    }
  }

  function roundTo2(num) {
    return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
  }


  function handleItemDraftChange(field, value) {
  if (field === "description" && containsDiscount(value)) {
    const enteredPin = prompt(
      "Discounts are restricted! Enter 6-digit PIN to allow:"
    );

    if (enteredPin !== discountPin) {
      alert("Incorrect PIN! Discounts are not allowed.");
      return; // stop updating input
    }
  }
    setItemDraft((d) => {
      const next = { ...d, [field]: value };
      if (field === "qty" || field === "unitPrice") {
        next.amount = roundTo2(Number(next.qty) * Number(next.unitPrice));
      }
      return next;
    });
  }

 function handleAddItem() {
  const { description, qty, unitPrice, amount } = itemDraft;

  if (!description.trim()) {
    alert("Please enter a description.");
    return;
  }
  if (containsDiscount(description)) {
    const enteredPin = prompt(
      "Discounts are restricted! Enter 6-digit PIN to allow:"
    );

    if (enteredPin !== discountPin) {
      alert("Incorrect PIN! Discounts are not allowed.");
      return;
    }
  }
  // Create a consistent finalLabel for manually added items
  const finalLabel = `${description.trim()}`;

  const newItem = {
    id: Date.now() + Math.random(),
    description: description.trim(),
    finalLabel, // ✅ ensures tally with StockForBill
    qty: Number(qty) || 0,
    unitPrice: roundTo2(Number(unitPrice) || 0),
    amount: roundTo2(Number(amount) || 0),
    isDescriptionOnly: true,
  };

  setItems((s) => [...s, newItem]);
  setItemDraft({ description: "", qty: 1, unitPrice: 0, amount: 0 });
}

// Add this handler in MakeBill
const handleAddStockItemToBill = (stockItem) => {
  const newItem = {
    id: stockItem._id, // ✅ Use real MongoDB _id
    description: stockItem.label || stockItem.attributes?.description || "",
    finalLabel: stockItem.label || stockItem.attributes?.description || "",
    qty: 1,
    unitPrice: stockItem.unitPrice || 0,
    amount: stockItem.unitPrice || 0,
    isStockItem: true, // ✅ Flag to differentiate stock items from manually added items
  };

  setItems((prev) => [...prev, newItem]);
};


async function handleSearchJob() {
  const input = jobRefInput.trim(); // what user typed (e.g. "10-25-004")
  if (!input) {
    alert("Enter a job number");
    return;
  }

  // Always prefix with IDSJBN-
  const jobRef = `IDSJBN-${input.toUpperCase()}`;

  try {
    // Fetch specific job using jobRef
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/jobs/details/${jobRef}`
    );

    const job = res.data;
    if (!job) {
      alert(`Job ${jobRef} not found`);
      return;
    }

    // Populate customer fields with job data
    setCustomer({
      name: job.customerName || "",
      contact: job.customerPhone || "",
      email: job.customerEmail || "",
      address: job.customerAddress || "",
      company: job.customerCompany || "",
    });

    alert(`Customer data for ${jobRef} loaded!`);
  } catch (err) {
    console.error("Error fetching job:", err);
    alert("Failed to fetch job data. Check console for details.");
  }
}


//===========================  VERY IMPORTANT FUNCTION THIS HANDLES THE STOCK ========================
const handleDeleteItem = async (item) => {
  if (!item || !item.isStockItem) return;

  try {
    // Try incrementing stock qty using the real MongoDB _id
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/stock/${item._id}/increment`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error("Stock item not found");

    alert(`Stock quantity for ${item.finalLabel} updated in DB.`);
  } catch (error) {
    console.warn(
      `Stock item ${item.finalLabel} not found, recreating in DB...`
    );

    // Recreate stock item using full MongoDB structure
    const newStockItem = {
      category: item.category || "product",
      key: item.key || item._id.toString(), // fallback if key missing
      label: item.label || "Unknown",
      qty: item.qty || 1,
      unitPrice: Number(item.unitPrice) || 0,
      attributes: item.attributes || {},
    };

    try {
      const createResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stock/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStockItem),
        }
      );

      if (!createResponse.ok) throw new Error("Failed to recreate stock item");

      alert(`Stock item ${item.finalLabel} recreated successfully in DB.`);
    } catch (createError) {
      console.error(createError);
      alert(`Failed to recreate stock item ${item.finalLabel}.`);
    }
  }

  // Remove item from bill table regardless
  setItems((prev) => prev.filter((it) => it._id !== item._id));
};

//===============================   END THE STOCK HANDELING FUNCTION  ===========================


//===========================  HANDEL ADVANCED PAYMENT  ========================
const handleAddAdvancedPaymentToBill = (payment) => {
  const description = `ADVANCED PAYMENT DEDUCTED | ${payment.remarks || "No Remarks"} | ${payment.customerName}`;

  const newItem = {
    id: payment._id,              // Use real MongoDB _id as unique key
    _id: payment._id,             // Keep MongoDB _id for backend updates
    description,
    finalLabel: description,
    qty: 1,
    unitPrice: -Math.abs(Number(payment.amount)),
    amount: -Math.abs(Number(payment.amount)), // ✅ NEGATIVE deduction
    isAdvancedPayment: true,
  };

  setItems((prev) => [...prev, newItem]);
  setShowViewPayments(false);
};



  const subTotal = roundTo2(items.reduce((acc, it) => acc + Number(it.amount || 0), 0));

async function handleDownloadPDF() {
  if (!printRef.current) return alert("Nothing to download");

  try {
    const element = printRef.current;

    // Convert the invoice DOM node to high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 3, // Higher scale = sharper
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff", // Ensure white background
    });

    const imgData = canvas.toDataURL("image/png");

    // Create jsPDF instance
    const pdf = new jsPDF("l", "mm", "a5");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate image height to maintain aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;

    // If content fits in one page
    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    } else {
      // If content exceeds one page, split correctly
      let remainingHeight = canvas.height;
      while (remainingHeight > 0) {
        const pageCanvasHeight = (pageHeight * canvas.width) / imgWidth;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = Math.min(pageCanvasHeight, remainingHeight);

        const ctx = tempCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          canvas.height - remainingHeight,
          canvas.width,
          tempCanvas.height,
          0,
          0,
          canvas.width,
          tempCanvas.height
        );

        const pageImgData = tempCanvas.toDataURL("image/png");
        pdf.addImage(pageImgData, "PNG", 0, 0, imgWidth, (tempCanvas.height * imgWidth) / canvas.width);

        remainingHeight -= tempCanvas.height;
        if (remainingHeight > 0) pdf.addPage();
      }
    }

    pdf.save(`${billNumber}.pdf`);
    onClose();
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("Error while generating PDF.");
  }
}


const viewStockForBill = () => {
  setShowStockModal(true);
};

const handleAmountChange = (id, newAmount) => {
  setItems((prevItems) =>
    prevItems.map((item) =>
      item.id === id ? { ...item, amount: parseFloat(newAmount) || 0 } : item
    )
  );
};

// ===============save the bill ===========================


 const handleSaveBill = async () => {
  if (!customer.name || items.length === 0) {
    return alert("Customer and items are required to save the bill");
  }

  if (!namePattern.test(customer.name)) {
  return showError(
    "Invalid Customer Name",
    "Customer name must follow: Mr./Mrs./Miss./Dr. FirstName LastName"
  );
}

if (!phonePattern.test(customer.contact)) {
  return showError(
    "Invalid Phone Number",
    "Phone number must start with 01 or 07 and contain exactly 10 digits."
  );
}
// ✅ NEW VALIDATION for bill maker
if (!billMaker || billMaker === "") {
  return showError(
    "Bill Maker Not Assigned",
    "Please assign a bill maker before saving the bill."
  );
}


  const billData = {
    billNumber,
    date,
    billMaker,
    technician: selectedTechnician || "", // ✅ Add selected technician here
    payments: [{ method: "Cash", amount: 0 }], // ✅ Store all payment methods + amounts
    jobRef: jobRefInput ? `IDSJBN-${jobRefInput.toUpperCase()}` : "",
    customer,
    items,
    subTotal:0,
    billProfit:0,
  };

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/bills/warranty`, billData);

    if (res.status === 201) {
      alert(`Bill ${res.data.billNumber} saved successfully!`);
      setIsBillSaved(true);

        // Close the job linked to this bill
        jobCloseByBill(jobRefInput ? `IDSJBN-${jobRefInput.toUpperCase()}` : "", res.data.billNumber);
        return true; // ✅ SUCCESS
    }
  } catch (error) {
    console.error("Error saving bill:", error);
    alert("Failed to save the bill. Check console for details.");
  }
};


//========== Update the progress of a job ===========
const jobCloseByBill = async (jobRef, billNumber) => {
  if (!jobRef || !billNumber) {
    return alert(`Take a Print of downloaded ${billNumber} Bill PDF`);
  }

  const updatedFields = {
    jobProgress: `Closed By Bill - ${billNumber}`, 
  };

  try {
    const res = await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/jobs-creatoredit/edit/${jobRef}`,
      updatedFields
    );

    if (res.status === 200) {
      alert(`Job ${jobRef} successfully closed by bill ${billNumber}`);
    }
  } catch (error) {
    console.error("Error closing job:", error);
    alert("Failed to close the job. Check console for details.");
  }
};

//==============    TRDE ITEM FUNCTION  ==============================
const handleAddFromTradeModal = (tradeItem) => {

  const labelParts = [
    tradeItem.item,        
    tradeItem.capacity,      
    tradeItem.region,      
    tradeItem.color,        
    tradeItem.serial,  
    tradeItem.imei,          
    tradeItem.condition    
  ].filter(Boolean); 

  const fullLabel = labelParts.join(" | ") + "  - EXCHANGED ITEM";

  const newItem = {
    id: Date.now() + Math.random(),
    description: fullLabel,
    finalLabel: fullLabel,
    qty: tradeItem.qty,
    unitPrice: -(Number(tradeItem.costPrice)) || 0,
    amount: -(Number(tradeItem.costPrice) * Number(tradeItem.qty)),
    isTradeItem: true,
    raw: tradeItem
  };

  setItems((prev) => [...prev, newItem]);
};

const handleCloseClick = () => {
  if (items.length > 0) {
    alert("Plase clear the Bill Item Table");
    setShowCloseConfirm(false);
  } else {
    // Table is empty → close directly
    setShowCloseConfirm(true);
  }
};


const confirmClose = () => {
  setShowCloseConfirm(false);
  onClose();
};

const cancelClose = () => setShowCloseConfirm(false);

// Function to calculate total profit
const calculateTotalProfit = () => {
  return items.reduce((total, item) => total + (item.amount - item.unitPrice), 0);
};
const billProfit = calculateTotalProfit();

  if (!open) return null;

//====================  EMERGENCY CLOSING FUNCTION ===================
const handleDeleteAdvancedPaymentItem = async (it) => {
  try {
    setItems(prev => prev.filter(x => x.id !== it.id));

    if (it.isAdvancedPayment) {
      const API_URL = `${import.meta.env.VITE_API_URL}/api/advanced-payments`;
      await axios.patch(`${API_URL}/${it._id}`, { isAddedToBill: false });
      console.log("Updated isAddedToBill to false for:", it);
      alert("Advanced Payment Remoned from the bill & updated");
    }
  } catch (err) {
    console.error("Failed to update advanced payment:", err);
    alert("Failed to update advanced payment status. Try again.");
  }
};

const handleSearchCustomerByPhone = async () => {
  const phone = customer.contact?.trim();

  if (!phone || !phonePattern.test(phone)) {
    return showError(
      "Invalid Phone Number",
      "Enter a valid phone number before searching."
    );
  }

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/customers/by-phone/${phone}`
    );

    const cust = res.data;

    if (!cust) {
      return showError(
        "Customer Not Found",
        "No customer found with this phone number."
      );
    }

    // ✅ Auto-fill customer details
    setCustomer({
      name: `${cust.prefix ? cust.prefix + "." : ""} ${cust.name}`.trim(),
      contact: cust.phone || "",
      email: cust.email || "",
      address: cust.address || "",
      company: cust.company || "",
    });
return showSuccess(
  "Customer Found",
  "Customer details loaded successfully."
);

  } catch (error) {
    if (error.response?.status === 404) {
      showError(
        "Customer Not Found",
        "No customer found with this phone number."
      );
    } else {
      console.error("Customer search error:", error);
      showError(
        "Search Failed",
        "Failed to search customer. Please try again."
      );
    }
  }
};

function handleAddWarrantyDescription() {
  if (!warrantyBillNo.trim()) {
    alert("Please enter previous Bill Number.");
    return;
  }
if (!/^\d{5}$/.test(warrantyBillNo)) {
  alert("Bill number must be exactly 5 digits.");
  return;
}

  if (!warrantyBillDate.trim()) {
    alert("Please enter previous Bill Date.");
    return;
  }
if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(warrantyBillDate)) {
  alert("Please enter a valid date in MM/DD/YYYY format.");
  return;
}


  const description = `Previous Bill No: IDS-${warrantyBillNo.trim()} | Date: ${warrantyBillDate.trim()} | Warranty Claim`;

  // Safety check (same as handleAddItem)
  if (containsDiscount(description)) {
    const enteredPin = prompt(
      "Discounts are restricted! Enter 6-digit PIN to allow:"
    );

    if (enteredPin !== discountPin) {
      alert("Incorrect PIN! Discounts are not allowed.");
      return;
    }
  }

  const finalLabel = description;

  const newItem = {
    id: Date.now() + Math.random(),
    description,
    finalLabel,
    qty: 0,
    unitPrice: 0,
    amount: 0,
    isDescriptionOnly: true,
  };

  setItems((s) => [...s, newItem]);

  // Clear warranty inputs after adding
  setWarrantyBillNo("");
  setWarrantyBillDate("");
}


//====================== Save the bill and Download the PDF at once ==========================
const handleSaveAndDownload = async () => {
  const isSaved = await handleSaveBill();

  if (isSaved) {
    handleDownloadPDF();
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div className="absolute inset-0 bg-black opacity-50" ></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-[98%] md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-auto p-6 m-4">
        <style>{`
          /* local component styles (in addition to Tailwind) */
          .input { @apply border rounded px-3 py-2 w-full; }
          .table-header { background: #f7fafc; }
        `}</style>

        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-white hover:font-bold hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          onClick={handleCloseClick}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-28 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                {companyLogo ? (
                  <img src={companyLogo} alt="logo" className="object-contain w-full h-full" />
                ) : (
                  <div className="text-sm text-gray-500">Company Logo</div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-500 ">Date</div>
                <input className="border rounded px-3 py-1 mt-1 text-xs" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="text-right">
              
              {/* <input className="border rounded px-3 py-1 mt-1 text-xs font-bold" value={billMaker} onChange={(e) => setBillMaker(e.target.value)} placeholder="Name of bill maker" /> */}
              <div className="mt-3 text-xs text-gray-500">Bill Number</div>
              <div className="font-mono text-sm mt-1">{billNumber}</div>

              <div className="mt-3 text-xs text-gray-500">Company Address</div>
              <div className="text-sm">No.363, Galle Rd, Wellawatta, Colombo 06</div>
              <div className="text-sm">Hotline - 0777 142 402 / 0777 142 502 / 0112 500 990</div>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold">Bill To (Customer)</div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {/* <input className="border rounded px-3 py-2 text-xs font-bold " placeholder="Customer Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /> */}
                    <input
                      className="border rounded px-3 py-2 text-xs font-bold"
                      placeholder="Mr./Mrs./Miss./Dr./Ven First [Second] Last"
                      value={customer.name}
                      onChange={(e) => {
                        const value = e.target.value;

                        setCustomer({ ...customer, name: value });

                        if (value && !namePattern.test(value)) {
                          showError(
                            "Invalid Customer Name",
                            "Format must be: Mr./Mrs./Miss./Dr./Ven First Last OR First Second Last (e.g., Mr. John Smith / Mr. John Michael Smith)"
                          );
                        }
                      }}
                    />

                  {/* <input className="border rounded px-3 py-2 text-xs font-bold" placeholder="Contact Number" value={customer.contact} onChange={(e) => setCustomer({ ...customer, contact: e.target.value })} /> */}
                  <input
                      className="border rounded px-3 py-2 text-xs font-bold"
                      placeholder="01XXXXXXXX or 07XXXXXXXX"
                      value={customer.contact}
                      inputMode="numeric"
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        if (value.length > 10) return;

                        setCustomer({ ...customer, contact: value });

                        if (value.length === 10 && !phonePattern.test(value)) {
                          showError(
                            "Invalid Phone Number",
                            "Phone number must start with 01 (land) or 07 (mobile) and contain exactly 10 digits."
                          );
                        }
                      }}
                    />
                  <button className="border-none rounded px-2 py-1 text-white bg-cyan-600 hover:bg-cyan-800 cursor-pointer" onClick={handleSearchCustomerByPhone}>Search Customer</button>
                  <input className="border rounded px-3 py-2 text-xs font-bold" placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                  <input className="border rounded px-3 py-2 text-xs font-bold" placeholder="Address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
                  <input className="border rounded px-3 py-2 text-xs font-bold" placeholder="Company (optional)" value={customer.company} onChange={(e) => setCustomer({ ...customer, company: e.target.value })} />
                  
                </div>
              </div>
              <div><div className="grid grid-cols-1 gap-2 mt-2"><div>              


     </div><div className="font-semibold">Previous Bill Info</div>
     <button className="border-none rounded px-2 py-1 text-white bg-green-600 hover:bg-green-700 cursor-pointer" onClick={() => setShowBillsModal(true)} >View Bills</button>
                    <input
                          className="border rounded px-3 py-2 text-xs font-bold"
                          placeholder="Enter 5-digit Bill No (without IDS-)"
                          value={warrantyBillNo}
                          maxLength={5}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // allow digits only
                            setWarrantyBillNo(value);
                          }}
                        />
                                <input
                                  className="border rounded px-3 py-2 text-xs font-bold"
                                  placeholder="Enter the Previous Bill Date MM/DD/YYYY"
                                  value={warrantyBillDate}
                                  maxLength={10}
                                  inputMode="numeric"
                                  onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, ""); // digits only

                                    if (value.length > 2 && value.length <= 4) {
                                      value = value.slice(0, 2) + "/" + value.slice(2);
                                    } else if (value.length > 4) {
                                      value =
                                        value.slice(0, 2) +
                                        "/" +
                                        value.slice(2, 4) +
                                        "/" +
                                        value.slice(4, 8);
                                    }

                                    setWarrantyBillDate(value);
                                  }}
                                />
                        <button
                          className="border-none rounded px-2 py-1 text-white bg-gray-600 hover:bg-gray-800 cursor-pointer"
                          onClick={handleAddWarrantyDescription}
                        >
                          Add To Warranty Bill
                        </button>

                  <select
                    className="border rounded px-3 py-2 text-xs font-bold bg-white cursor-pointer"
                    value={billMaker}
                    onChange={(e) => setBillMaker(e.target.value)}
                  >
                    <option value="" disabled>Select Bill Maker</option>
                    {jobCreators.map((creator) => (
                      <option key={creator._id} value={creator.username}>
                        {creator.username}
                      </option>
                    ))}
                  </select>
                   <button onClick={viewStockForBill} className="px-3 py-2 bg-purple-600 text-white rounded flex items-center justify-center gap-1 hover:bg-purple-800 cursor-pointer">
                    <span >View Stock</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

<div className="mt-3 border-t pt-3">
  <table className="w-full text-sm border-collapse">
    <thead>
      <tr className="bg-gray-100 text-gray-700">
        <th className="border px-3 py-2 text-left w-[70%] text-xs">Description</th>
        <th className="border px-3 py-2 text-center w-[10%] text-xs">Qty</th>
        <th className="border px-3 py-2 text-center w-[10%] text-xs">Unit PRC</th>
        <th className="border px-3 py-2 text-center w-[10%] text-xs">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="border px-3 py-2 font-bold">
          <input
            className="w-full border rounded px-2 py-1 text-xs"
            value={itemDraft.description}
            onChange={(e) =>
              handleItemDraftChange("description", e.target.value)
            }
            placeholder="Enter description"
          />
        </td>
        <td className="border px-3 py-2">
          <input
            type="number"
            min="0"
            className="w-full border rounded px-2 py-1 text-xs text-center"
            value={itemDraft.qty}
            onChange={(e) => handleItemDraftChange("qty", e.target.value)}
          />
        </td>
        <td className="border px-3 py-2">
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full border rounded px-2 py-1 text-xs text-center"
            value={itemDraft.unitPrice === 0 ? "" : itemDraft.unitPrice}
            onChange={(e) => handleItemDraftChange("unitPrice", e.target.value)}
          />
        </td>
        <td className="border px-3 py-2">
          <input
            type="number"
            step="0.01"
            className="w-full border rounded px-2 py-1 text-xs text-center"
            value={itemDraft.amount}
            onChange={(e) => handleItemDraftChange("amount", e.target.value)}
          />
        </td>
      </tr>
    </tbody>
  </table>

  {/* Action Buttons below the table */}
  <div className="flex gap-2 mt-3 justify-end">
    <button
      onClick={handleAddItem}
      className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700 transition cursor-pointer"
    >
      Add to Bill
    </button>
    <button
      onClick={() =>
        setItemDraft({ description: "", qty: 1, unitPrice: 0, amount: 0 })
      }
      className="px-4 py-2 bg-gray-200 text-xs font-bold rounded hover:bg-gray-300 transition cursor-pointer"
    >
      Reset
    </button>
  </div>
</div>
          <div className="mt-4">
            <div className="overflow-x-auto">

{/*============ STARTING OF THE BILL ITEM TABLE=================== */}
              <table className="w-full border-collapse">
  <thead className="table-header text-left text-xs">
    <tr>
      <th className="py-2 px-3 border w-[70%]">Description</th>
      <th className="py-2 px-3 border w-[5%]">Qty</th>
      <th className="py-2 px-3 border w-[10%]">Unit Price</th>
      <th className="py-2 px-3 border w-[10%]">Amount</th>
      <th className="py-2 px-3 border w-[5%]">Actions</th>
    </tr>
  </thead>
  <tbody>
  {items.length === 0 && (
    <tr>
      <td className="p-4 text-center" colSpan={5}>No items added yet</td>
    </tr>
  )}
  {items.map((it) => (
    <tr
      key={it.id}
      className={it.isStockItem ? "bg-green-50" : ""}
    >
      <td className="py-1 px-3 border text-xs w-[70%]">{it.finalLabel}</td>
      <td className="py-1 px-3 border text-xs w-[5%]">{it.qty}</td>
      <td className="py-1 px-3 border text-xs w-[10%]">{it.unitPrice ? it.unitPrice.toFixed(2) : ""}</td>
      <td className="py-1 px-3 border text-xs w-[10%]">
        <input
          type="number"
          className="w-full border rounded px-1 py-0.5 text-right text-xs"
          value={it.amount === 0 ? "" : it.amount}
          onChange={(e) => handleAmountChange(it.id, e.target.value === "" ? 0 : e.target.value)}
        />
      </td>
            <td className="py-1 px-3 border text-xs w-[5%]">
        {it.isDescriptionOnly ? (
          <button
            onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
            className="px-1 py-1 bg-red-500 text-white rounded text-xs cursor-pointer"
          >
            Delete
          </button>
        )  : it.isTradeItem ? (
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
              className="px-2 py-1 bg-gray-200 text-black font-bold rounded text-xs cursor-pointer hover:bg-gray-300"
            >
              Delete
            </button>
         )  : it.isAdvancedPayment ? (
          <button
            onClick={() => handleDeleteAdvancedPaymentItem(it)}
            className="px-2 py-1 bg-purple-500 text-white font-bold rounded text-xs cursor-pointer hover:bg-purple-600"
          >
            Delete
          </button>
        ) : (
          <button
            onClick={() => handleDeleteItem(it)}
            className="px-2 py-1 bg-black text-yellow-300 font-bold rounded text-xs cursor-pointer hover:bg-amber-300 hover:text-black"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>

</table>

            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-full md:w-1/3">
                <div className="flex justify-between py-3 font-semibold text-lg"> <div>Total</div><div>{subTotal.toFixed(2)}</div></div>
                <div className={`flex justify-between py-3 font-semibold text-lg ${billProfit >= 0 ? 'text-green-600' : 'text-red-600' }`}>
                  <div>Profit</div>
                  <div>{billProfit.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
</div>

          </div>

          <div className="mt-6">
            <div className="border-t pt-3">
              <div className="text-sm font-semibold">Terms & Conditions</div>
              <div className="text-xs text-gray-600 mt-2">
                <p>1. No Cash Refund.</p>
                <p>2. If you have any clarification, please be present with the bill within 5 days.</p>
                <p>3. Once repare part, accessory, product is issued, that item will be considered as used and purchased</p>
            </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            {/* <button onClick={() => { setItems([]); }} className="px-2 py-1 bg-gray-200 rounded text-xs cursor-pointer">Clear All Items</button> */}
            <button
                onClick={handleSaveAndDownload}
                className="px-4 py-2 bg-cyan-700 text-white font-bold rounded text-xs cursor-pointer hover:bg-green-700"
              >
                Save Bill & Download PDF
              </button>

            {/* <button onClick={handleCloseClick} className="px-2 py-1 bg-red-500 text-white rounded text-xs cursor-pointer">Close</button> */}
            <button  
            onClick={() => {
    if (items.length > 0) {
      setShowEmergencyWarning(true); // Show popup if items exist
    } else {
      onClose(); // Safe to close
    }
  }}
            className="px-2 py-1 bg-black text-yellow-300 font-bold rounded text-xs cursor-pointer hover:bg-amber-300 hover:text-black">  Emergency Close</button>
          </div>

          {/* Hidden printable area reference - same layout but optimized for printing */}
          <div
  style={{
    position: "absolute",
    left: "-9999px",
    top: 0,
  }}
>
  <div
    ref={printRef}
    id="invoice-printable"
    className="p-4"
    style={{
          width: "210mm",
          height: "148mm",
          boxSizing: "border-box",
          background: "#fff",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "12px",
          color: "#000", 
    }}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div style={{ width: 140, height: 70 }}>
          {companyLogo ? (
            <img
              src={companyLogo}
              alt="logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 50,
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Logo
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#374151" }}>Date: {date}</div>
          <div style={{ fontSize: 11, color: "#374151" }}>
            Bill Maker: {billMaker}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 700 }}>WARRANTY ISSUED INVOICE</div>
        <div style={{ fontFamily: "monospace" }}>{billNumber}</div>
        <div style={{ fontSize: 11 }}>No.363, Galle Rd, Colombo 06</div>
        <div style={{ fontSize: 11 }}>Hotline - 0777 142 402 / 0777 142 502 / 0112 500 990</div>
      </div>
    </div>
    <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
  {/* Left side - Bill To */}
  <div style={{ flex: 1 }}>
    <div style={{ fontWeight: 700 }}>Bill To:</div>
    <div>{customer.name}</div>
    <div>{customer.company}</div>
    <div>{customer.contact} | {customer.email}</div>
    <div>{customer.address}</div>
  </div>

  {/* Right side - Payments */}
  <div style={{ flex: 1, textAlign: "right" }}>
    <div style={{ fontWeight: 700 }}>Payments</div>
    {payments.length === 0 ? (
      <div style={{ fontSize: 11, color: "#374151" }}>No payments selected</div>
    ) : (
      <table style={{ marginLeft: "auto", fontSize: 11 }}>
        <tbody>
          {payments.map((p, i) => (
            <tr key={i}>
              <td style={{ padding: "2px 6px", textAlign: "left" }}>{p.method}</td>
              <td style={{ padding: "2px 6px", textAlign: "right" }}>
                {Number(p.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>


    <table
      style={{
        width: "100%",
        marginTop: 10,
        borderCollapse: "collapse",
        lineHeight: 1.1,
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              borderBottom: "1px solid #e5e7eb",
              padding: "4px 6px",
              textAlign: "left",
            }}
          >
            Description
          </th>
          <th
            style={{
              borderBottom: "1px solid #e5e7eb",
              padding: "4px 6px",
              textAlign: "right",
            }}
          >
            Qty
          </th>
          
          <th
            style={{
              borderBottom: "1px solid #e5e7eb",
              padding: "4px 6px",
              textAlign: "right",
            }}
          >
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.id}>
            <td style={{ padding: "3px 6px" }}>{it.finalLabel}</td>
            <td style={{ padding: "3px 6px", textAlign: "right" }}>{it.qty}</td>
            
            <td style={{ padding: "3px 6px", textAlign: "right" }}>
              {it.amount.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div
      style={{
        marginTop: 8,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div style={{ width: 200 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
            fontWeight: 700,
          }}
        >
          <div>Total</div>
          <div>{subTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>

    <div style={{ marginTop: 15, fontSize: 10 }}>
      <div style={{ fontWeight: 700 }}>Terms & Conditions</div>
      <p>1. No Cash Refund.</p>
      <p>
        2. If you have any clarification, please be present with the bill within
        5 days.
      </p>
      <p>
        3. Once a repaired part, accessory, or product is issued, it will be
        considered used and purchased.
      </p>
    </div>
    <div
  style={{
    marginTop: 25,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    paddingTop: 10,
  }}
>
  <div>
    Customer Sign: ___________________________
  </div>

  <div>
    Authorized Sign: ___________________________
  </div>
</div>
  </div>
</div>


        </div>
      </div>
{showStockModal && (
  <StockForBill
    onClose={() => setShowStockModal(false)}
    onAddToBill={(stockItem) => {
      let newItem = {
      id: stockItem._id,         
      isStockItem: true,        
      qty: 1,
      unitPrice: Number(stockItem.unitPrice) || 0,
      amount: Number(stockItem.unitPrice) || 0,
    }; 
      let finalLabel = ""; 

      switch (stockItem.category) {
        case "spare":
          finalLabel = `${stockItem.label} | ${stockItem.attributes?.description || "--"} | Compatibility: ${stockItem.attributes?.compatibility || "--"}`;
          newItem = {
            ...stockItem,
            ...newItem,
            label: stockItem.label,
            description: stockItem.attributes?.description || "--",
            compatibility: stockItem.attributes?.compatibility || "--",
            finalLabel,
            qty: 1,
            unitPrice: Number(stockItem.unitPrice) || 0,
            amount: Number(stockItem.unitPrice) || 0,
          };
          break;

        case "accessory":
          finalLabel = `${stockItem.label} | ${stockItem.attributes?.description || "--"} | Brand: ${stockItem.attributes?.brand || "--"} | Color: ${stockItem.attributes?.color || "--"}`;
          newItem = {
            ...stockItem,
            ...newItem,
            label: stockItem.label,
            description: stockItem.attributes?.description || "--",
            brand: stockItem.attributes?.brand || "--",
            color: stockItem.attributes?.color || "--",
            finalLabel,
            qty: 1,
            unitPrice: Number(stockItem.unitPrice) || 0,
            amount: Number(stockItem.unitPrice) || 0,
          };
          break;

        case "product":
          finalLabel = `${stockItem.label} | Model: ${stockItem.attributes?.model || "--"} | Color: ${stockItem.attributes?.color || "--"} | Region: ${stockItem.attributes?.region || "--"} | SN: ${stockItem.attributes?.serialNumber || "--"} | IMEI: ${stockItem.attributes?.imeiNumber || "--"} | Condition: ${stockItem.attributes?.condition || "--"}`;
          newItem = {
            ...stockItem,
            ...newItem,
            label: stockItem.label,
            model: stockItem.attributes?.model || "--",
            color: stockItem.attributes?.color || "--",
            region: stockItem.attributes?.region || "--",
            serialNumber: stockItem.attributes?.serialNumber || "--",
            imeiNumber: stockItem.attributes?.imeiNumber || "--",
            condition: stockItem.attributes?.condition || "--",
            finalLabel,
            qty: 1,
            unitPrice: Number(stockItem.unitPrice) || 0,
            amount: Number(stockItem.unitPrice) || 0,
          };
          break;

        default:
          break;
      }

      setItems((prev) => [...prev, newItem]);
    }}
  />
)}

{showCloseConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-none">
    <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
      <p className="mb-4 font-semibold">Are you sure you want to close? Unsaved changes will be lost.</p>
      <div className="flex justify-around gap-4">
        <button onClick={confirmClose} className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer">Yes</button>
        <button onClick={cancelClose} className="px-4 py-2 bg-gray-200 rounded cursor-pointer">No</button>
      </div>
    </div>
  </div>
)}
{showEmergencyWarning && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
      <p className="mb-4 font-semibold">
        You must delete all rows in the bill table before closing!
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowEmergencyWarning(false)}
          className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}


<style>
  {`
    @media print {
      @page {
        size: A5 landscape;
        margin: 5mm; /* very small margin */
      }

      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      #invoice-printable {
        width: 210mm;
        height: 148mm;
        overflow: hidden;
      }

      table tr td,
      table tr th {
        padding: 2px 4px !important;
      }
    }
  `}
</style>
<TradeProductItemGRN
        open={openTradeModal}
        onClose={() => setOpenTradeModal(false)}
        onAddToBill={handleAddFromTradeModal}
      />
      {showViewPayments && (
        <ViewAdvancedPayments onClose={() => setShowViewPayments(false)} onAddToBill={handleAddAdvancedPaymentToBill} />
      )}

      <SideAlert
  show={alertSlide.show}
  onClose={() => setAlertSlide({ ...alertSlide, show: false })}
  title={alertSlide.title}
  message={alertSlide.message}
  type={alertSlide.type}
  autoClose
  duration={4000}
/>
{showBillsModal && (
  <BillsModal
    onClose={() => setShowBillsModal(false)}
  />
)}

    </div>
  );

}
