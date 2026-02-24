import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import companyLogo from "/IDSLogo.png";

export default function BillsModal({ onClose }) {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [paymentEditorBill, setPaymentEditorBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const printRef = useRef(null);

  const paymentMethods = [
    "Card - Visa",
    "Card - MasterCard",
    "Bank Transfer",
    "KOKO",
    "Cash",
    "Cheque",
    "Credit",
    "Half-Payment",
  ];

  // Fetch bills
  const fetchBills = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bills`);
      setBills(res.data);
      setFilteredBills(res.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Apply filters
useEffect(() => {
  searchBills();
}, [searchTerm, dateFrom, dateTo, bills,selectedPaymentMethod]);



  // Payment totals
  const getPaymentTotals = () => {
    const totals = {};
    paymentMethods.forEach((m) => (totals[m] = 0));

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    filteredBills.forEach((bill) => {
      const billDate = new Date(bill.date);

      if (!dateFrom && !dateTo) {
        if (billDate < start || billDate >= end) return;
      }

      bill.payments?.forEach((p) => {
        if (totals[p.method] !== undefined) {
          totals[p.method] += p.amount || 0;
        }
      });
    });

    return totals;
  };

  const paymentTotals = getPaymentTotals();

//=============== DOWNLOAD THE IN DETAILED BILL RECORDS ===========================
const downloadExcel = () => {
  const rows = [];

  // ✅ SORT ASCENDING (oldest first, latest last)
  const sortedBills = [...filteredBills].sort((a, b) => {
    const numA = Number(a.billNumber?.replace(/^IDS-/, "")) || 0;
    const numB = Number(b.billNumber?.replace(/^IDS-/, "")) || 0;
    return numA - numB; // ascending order
  });

  sortedBills.forEach((bill) => {
    const paymentMap = {
      "Card - Visa": 0,
      "Card - MasterCard": 0,
      "Bank Transfer": 0,
      KOKO: 0,
      Cash: 0,
      Cheque: 0,
      Credit: 0,
      "Half-Payment": 0,
    };

    bill.payments?.forEach((p) => {
      if (paymentMap[p.method] !== undefined) {
        paymentMap[p.method] += p.amount || 0;
      }
    });

    const paymentString = Object.entries(paymentMap)
      .map(([method, amount]) => {
        const shortName =
          method === "Card - Visa"
            ? "Visa"
            : method === "Card - MasterCard"
            ? "Master"
            : method;
        return `${shortName}: ${amount}`;
      })
      .join(" || ");

    bill.items.forEach((item, index) => {
      rows.push({
        Bill_No: index === 0 ? bill.billNumber : "",
        Job_Ref: index === 0 ? bill.jobRef : "",
        Bill_Date:
          index === 0
            ? new Date(bill.date).toLocaleDateString()
            : "",
        Customer_Name: index === 0 ? bill.customer?.name : "",
        Customer_Phone: index === 0 ? bill.customer?.contact : "",
        Bill_Maker: index === 0 ? bill.billMaker : "",
        Technician: index === 0 ? bill.technician : "",
        Payments: index === 0 ? paymentString : "",
        Item_Label: item.finalLabel,
        Qty: item.qty,
        Unit_Price: item.unitPrice,
        Amount: item.amount,
        Sub_Total: index === 0 ? bill.subTotal : "",
        Profit: index === 0 ? bill.billProfit : "",
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bills Report");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const today = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, ".");

  saveAs(
    new Blob([excelBuffer], { type: "application/octet-stream" }),
    `${today}.xlsx`
  );
};
//================== EDIT PAYMENT METHODS =================
useEffect(() => {
  if (paymentEditorBill) {
    setPayments([...paymentEditorBill.payments]); // load existing payments
  }
}, [paymentEditorBill]);

  const handleCheck = (method) => {
  const exists = payments.some(p => p.method === method);

  if (exists) {
    setPayments(payments.filter(p => p.method !== method));
  } else {
    setPayments([...payments, { method, amount: "" }]);
  }
};

const handleAmountChangeForPaymentMethod = (method, value) => {
  setPayments(payments.map((p) =>
    p.method === method ? { ...p, amount: Number(value) } : p
  ));
};


  // ============   DOWNLOAD THE QUICK EXCEL   ====================================
  const downloadQuickExcel = () => {
  if (!dateFrom || !dateTo) {
    alert("Please select a date range for Quick Excel!");
    return;
  }

  // Filter bills by selected date range
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  toDate.setHours(23, 59, 59, 999); // include the full end date

  const filtered = bills.filter((b) => {
    const billDate = new Date(b.date);
    return billDate >= fromDate && billDate <= toDate;
  });

  const rows = filtered.map((bill) => {
    const paymentTotals = {};
    paymentMethods.forEach((m) => (paymentTotals[m] = 0));

    bill.payments?.forEach((p) => {
      if (paymentTotals[p.method] !== undefined) {
        paymentTotals[p.method] += p.amount || 0;
      }
    });

    return {
      "Bill No": bill.billNumber,
      Date: new Date(bill.date).toLocaleDateString(),
      "Customer Name": bill.customer?.name || "",
      Total: bill.subTotal || 0,
      "Card - Visa": paymentTotals["Card - Visa"],
      "Card - MasterCard": paymentTotals["Card - MasterCard"],
      "Bank Transfer": paymentTotals["Bank Transfer"],
      KOKO: paymentTotals["KOKO"],
      Cash: paymentTotals["Cash"],
      Cheque: paymentTotals["Cheque"],
      Credit: paymentTotals["Credit"],
      "Half-Payment": paymentTotals["Half-Payment"],
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Quick Bills");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, ".");
  saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `QuickBills-${formattedDate}.xlsx`);
};
//================== DOWNLOAD THE SELECTED BILL AS A PDF SECTION ===================
const fetchBillNumberForPrint = async (billNumber) => {
  try {
    // Ensure bill number starts with "IDS-"
    const normalizedBillNumber = billNumber.startsWith("IDS-")
      ? billNumber
      : `IDS-${billNumber}`;

    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/bills/number/${normalizedBillNumber}`
    );

    return res.data; // single bill object
  } catch (err) {
    console.error("Failed to fetch bill for print:", err);
    alert("Failed to fetch bill details for printing!");
    return null;
  }
};

//========================FETCH BILL DETAILS WITH SORING =============================
const fetchBillByNumber = async (billNumber) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/bills/number/${billNumber}`
    );
        // Sort descending by bill number numeric part
    const sortedBills = res.data.sort((a, b) => {
      const numA = Number(a.billNumber.replace(/^IDS-/, ""));
      const numB = Number(b.billNumber.replace(/^IDS-/, ""));
      return numB - numA; // descending
    });
    setBills(sortedBills);
    setFilteredBills(sortedBills);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch full bill:", err);
    alert("Failed to fetch full bill details!");
    return null;
  }
};

//=======================SORTING AND OPTIONAL ============================
useEffect(() => {
searchBills();
}, [searchTerm, dateFrom, dateTo, bills,selectedPaymentMethod]);

const downloadBillPDF = async () => {
  if (!selectedBill) return;

  const fullBill = await fetchBillNumberForPrint(selectedBill.billNumber);
  if (!fullBill) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5", // 210mm x 148mm
  });

  const pageWidth = 210;
  const pageHeight = 148;

  const margin = 8;
  let y = margin;

  // ================= LOGO =================
  try {
    doc.addImage(companyLogo, "PNG", margin, y, 40, 18);
  } catch {}

  // ================= RIGHT HEADER =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Invoice", pageWidth - margin, y + 6, { align: "right" });

  doc.setFont("courier", "normal");
  doc.setFontSize(11);
  doc.text(fullBill.billNumber, pageWidth - margin, y + 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(
    "No.363, Galle Rd, Colombo 06",
    pageWidth - margin,
    y + 18,
    { align: "right" }
  );

  doc.text(
    "Hotline - 0777 142 402 / 0777 142 502 / 0112 500 990",
    pageWidth - margin,
    y + 23,
    { align: "right" }
  );

  // ================= BILL MAKER & DATE =================
  doc.setFontSize(9);

  doc.text(
    `Bill Maker: ${fullBill.billMaker || "-"}`,
    margin,
    y + 24
  );

  doc.text(
    `Date: ${new Date(fullBill.date).toISOString().slice(0, 10)}`,
    margin,
    y + 29
  );

  y += 34;

  // ================= BILL TO =================
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", margin, y);

  doc.setFont("helvetica", "normal");

  doc.text(
    `${fullBill.customer?.name || ""} | ${fullBill.customer?.contact || ""} | ${fullBill.customer?.email || ""}`,
    margin,
    y + 5
  );

  doc.text(
    `${fullBill.customer?.company || ""} | ${fullBill.customer?.address || ""}`,
    margin,
    y + 10
  );

  // ================= PAYMENTS RIGHT =================
  doc.setFont("helvetica", "bold");
  doc.text("Payments", pageWidth - margin - 45, y);

  doc.setFont("helvetica", "normal");

  let payY = y + 5;

  if (fullBill.payments?.length > 0) {
    fullBill.payments.forEach((p) => {
      doc.text(
        p.method,
        pageWidth - margin - 45,
        payY
      );

      doc.text(
        Number(p.amount).toLocaleString(),
        pageWidth - margin,
        payY,
        { align: "right" }
      );

      payY += 5;
    });
  } else {
    doc.text(
      "No payments selected",
      pageWidth - margin - 45,
      payY
    );
  }

  y += 18;

  // ================= ITEMS TABLE =================

  const tableTop = y;
  const descX = margin;
  const qtyX = 150;
  const amtX = 170;

  const descW = 130;
  const qtyW = 20;
  const amtW = 32;

  const rowH = 6;

  // Header line
  doc.setDrawColor(200);
  doc.line(margin, tableTop, pageWidth - margin, tableTop);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("Description", descX, tableTop + 4);
  doc.text("Qty", qtyX + qtyW - 2, tableTop + 4, { align: "right" });
  doc.text("Amount", amtX + amtW - 2, tableTop + 4, { align: "right" });

  y += rowH;

  doc.setFont("helvetica", "normal");
doc.setFontSize(7);
fullBill.items.forEach((item) => {

  // Wrap description text inside column width
  const descriptionLines = doc.splitTextToSize(
    item.finalLabel || "",
    descW - 4 // padding safety
  );

  // Calculate dynamic row height
  const lineHeight = 4.5;
  const rowHeight = descriptionLines.length * lineHeight;

  // Print Description (multiple lines)
  doc.text(
    descriptionLines,
    descX,
    y + 4
  );

  // Print Qty aligned with first line
  doc.text(
    String(item.qty),
    qtyX + qtyW - 2,
    y + 4,
    { align: "right" }
  );

  // Print Amount aligned with first line
  doc.text(
    Number(item.amount).toLocaleString(),
    amtX + amtW - 2,
    y + 4,
    { align: "right" }
  );

  // Move Y down based on wrapped height
  y += rowHeight;
});

  // bottom line
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;

  // ================= TOTAL RIGHT =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(
    `Total: Rs. ${Number(fullBill.subTotal).toLocaleString()}`,
    pageWidth - margin,
    y,
    { align: "right" }
  );

  y += 5;

  // ================= TERMS =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Terms & Conditions", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);

  y += 5;
  doc.text(
    "1. No Cash Refund.",
    margin,
    y
  );

  y += 4;
  doc.text(
    "2. For any clarification, please be present with the bill within 5 days.",
    margin,
    y
  );

  y += 4;
  doc.text(
    "3. Once a repaired part, accessory, or product is issued, it will be considered used and purchased.",
    margin,
    y
  );

  // ================= SIGNATURES =================
  const signY = pageHeight - 8;

  doc.setFontSize(7);

  doc.text(
    "Customer Sign: .....................................",
    margin,
    signY
  );

  doc.text(
    "Auth Sign: ......................................................",
    pageWidth - margin,
    signY,
    { align: "right" }
  );

  // ================= SAVE =================
  doc.save(`${fullBill.billNumber}.pdf`);
};

//======================  very important function this gives the summery sheet =======================
const cleanBillNumber = (billNumber = "") =>
  billNumber.replace(/^IDS-/, "");

const cleanJobRef = (jobRef = "") =>
  jobRef.replace(/^IDSJBN-/, "");

const fetchCashBalance = async (date) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/cash-balance/${date}`
    );
    return res.data;
  } catch (err) {
    console.error("Failed to fetch cash balance", err);
    return null;
  }
};

const fetchCashExpenses = async (date) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/cash-expenses?date=${date}`
    );
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch cash expenses", err);
    return [];
  }
};

const fetchAdvancedPayments = async (date) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/advanced-payments`
    );

    // filter only same date
    return (res.data || []).filter((ap) => {
      const apDate = new Date(ap.date).toISOString().slice(0, 10);
      return apDate === date;
    });
  } catch (err) {
    console.error("Failed to fetch advanced payments", err);
    return [];
  }
};

const formatPaymentMethod = (method) => {
  if (!method) return "-";
  return method.replace("_", " ").toUpperCase();
};


//========================= FUNCTION FOR BILL SEARCH ==================================

const downloadDailySummaryPDF = async () => {
  // ===== 1️⃣ Normalize dates =====
  const normalizeDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
  };

  const normalizedFrom = normalizeDate(dateFrom);
  const normalizedTo = normalizeDate(dateTo);

  if (!normalizedFrom || !normalizedTo || normalizedFrom !== normalizedTo) {
    alert("Please select the SAME date in From and To for Daily Summary!");
    return;
  }

  // ===== 2️⃣ Fetch cash data =====
  const cashBalance = await fetchCashBalance(normalizedFrom);
  const cashExpenses = await fetchCashExpenses(normalizedFrom);
  const advancedPayments = await fetchAdvancedPayments(normalizedFrom);
  const returnedJobs = await fetchReturnedJobs(normalizedFrom);

  const advancedTotals = {
  cash: 0,
  bank_transfer: 0,
  cheque: 0,
  card: 0,
};

advancedPayments.forEach((ap) => {
  if (advancedTotals[ap.paymentMethod] !== undefined) {
    advancedTotals[ap.paymentMethod] += ap.amount || 0;
  }
});


  // ===== 3️⃣ Filter bills for the selected day =====
  const summaryBills = filteredBills.filter((bill) => {
    const billDate = new Date(bill.date);
    const billISO = billDate.toISOString().slice(0, 10);
    return billISO === normalizedFrom;
  });

  if (summaryBills.length === 0) {
    alert("No bills found for the selected date!");
    return;
  }

  // ===== 4️⃣ Initialize PDF =====
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const ensureSpace = (neededHeight = 20) => {
  if (y + neededHeight > pageHeight - 10) {
    doc.addPage();
    y = 15;
  }
};

  // ===== Title =====
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(
    `The Summary Sheet of ${new Date(normalizedFrom).toLocaleDateString()}`,
    pageWidth / 2,
    12,
    { align: "center" }
  );

  // ===== Table config =====
  const startY = 18;
  let y = startY;
  const rowHeight = 6;

  const columns = [
    "Bill No",
    "Job No",
    "Customer",
    "Technician",
    "Visa",
    "Master",
    "BT",
    "KOKO",
    "Cash",
    "Cheque",
    "Credit",
    "Half",
    "Total",
  ];

  const colWidths = [9, 14, 47, 28, 10, 12, 12, 10, 10, 12, 12, 12, 14];

  // ===== Draw table header =====
  let x = 5;
  doc.setFont("helvetica", "bold");
  columns.forEach((col, i) => {
    doc.rect(x, y, colWidths[i], rowHeight);
    doc.text(col, x + 1, y + 4);
    x += colWidths[i];
  });
  y += rowHeight;
  doc.setFont("helvetica", "normal");

  // ===== Column totals =====
  const paymentMethods = [
    "Card - Visa",
    "Card - MasterCard",
    "Bank Transfer",
    "KOKO",
    "Cash",
    "Cheque",
    "Credit",
    "Half-Payment",
  ];

  const columnTotals = {};
  paymentMethods.forEach((m) => (columnTotals[m] = 0));
  columnTotals.Total = 0;

  // ===== Draw rows =====
  summaryBills.forEach((bill) => {
    if (y + rowHeight > pageHeight - 10) {
      doc.addPage();
      y = startY;

      // Redraw header
      let hx = 5;
      doc.setFont("helvetica", "bold");
      columns.forEach((col, i) => {
        doc.rect(hx, y, colWidths[i], rowHeight);
        doc.text(col, hx + 1, y + 4);
        hx += colWidths[i];
      });
      doc.setFont("helvetica", "normal");
      y += rowHeight;
    }

    const paymentMap = {};
    paymentMethods.forEach((m) => (paymentMap[m] = 0));

    bill.payments?.forEach((p) => {
      if (paymentMap[p.method] !== undefined) {
        paymentMap[p.method] = p.amount || 0;
        columnTotals[p.method] += p.amount || 0;
      }
    });

    columnTotals.Total += bill.subTotal || 0;

    const rowData = [
      (bill.billNumber || "").replace(/^IDS-/, ""),
      (bill.jobRef || "").replace(/^IDSJBN-/, ""),
      bill.customer?.name || "-",
      bill.technician || "-",
      paymentMap["Card - Visa"],
      paymentMap["Card - MasterCard"],
      paymentMap["Bank Transfer"],
      paymentMap["KOKO"],
      paymentMap["Cash"],
      paymentMap["Cheque"],
      paymentMap["Credit"],
      paymentMap["Half-Payment"],
      bill.subTotal || 0,
    ];

    let rx = 5;
    rowData.forEach((cell, i) => {
      doc.rect(rx, y, colWidths[i], rowHeight);
      doc.text(cell !== undefined && cell !== null ? String(cell) : "", rx + 1, y + 4);
      rx += colWidths[i];
    });

    y += rowHeight;
  });

  // ===== Total row =====
  if (y + rowHeight > pageHeight - 10) {
    doc.addPage();
    y = startY;
  }

  doc.setFont("helvetica", "bold");
  const totalRow = [
    "TOTAL",
    "",
    "",
    "",
    columnTotals["Card - Visa"],
    columnTotals["Card - MasterCard"],
    columnTotals["Bank Transfer"],
    columnTotals["KOKO"],
    columnTotals["Cash"],
    columnTotals["Cheque"],
    columnTotals["Credit"],
    columnTotals["Half-Payment"],
    columnTotals.Total,
  ];

  let tx = 5;
  totalRow.forEach((cell, i) => {
    doc.rect(tx, y, colWidths[i], rowHeight);
    doc.text(cell !== undefined && cell !== null ? String(cell) : "", tx + 1, y + 4);
    tx += colWidths[i];
  });
  y += rowHeight;
  doc.setFont("helvetica", "normal");


  doc.addPage();
y = 15;

  // ===== Cash Balance & Expenses =====
  const leftX = 5;
  const rightX = pageWidth / 2 + 5;
  const cashSectionStartY = y + 5;
  let leftY = cashSectionStartY;
  let rightY = cashSectionStartY;

  // Cash Balance
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Cash Balance Summary", leftX, leftY);
  leftY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  if (cashBalance) {
    doc.text(`Bills Cash In: Rs. ${cashBalance.cashIn?.bills?.toLocaleString() || 0}`, leftX, leftY);
    leftY += 4;
    doc.text(`Advances Cash In: Rs. ${cashBalance.cashIn?.advances?.toLocaleString() || 0}`, leftX, leftY);
    leftY += 4;
    doc.text(`Total Cash In: Rs. ${cashBalance.cashIn?.total?.toLocaleString() || 0}`, leftX, leftY);
    leftY += 4;
    doc.text(`Cash Expenses: Rs. ${cashBalance.cashOut?.expenses?.toLocaleString() || 0}`, leftX, leftY);
    leftY += 4;
    doc.setFont("helvetica", "bold");
    doc.text(`Closing Cash: Rs. ${cashBalance.closingCash?.toLocaleString() || 0}`, leftX, leftY);
    leftY += 6;
    doc.setFont("helvetica", "normal");
  } else {
    doc.text("Cash balance data not available.", leftX, leftY);
    leftY += 6;
  }

  // Cash Expenses
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Cash Expense Breakdown", rightX, rightY);
  rightY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  let totalCashExpenses = 0;
  if (cashExpenses.length > 0) {
    cashExpenses.forEach((exp) => {
      if (rightY + 4 > pageHeight - 10) {
        doc.addPage();
        rightY = startY;
      }
      doc.text(`${exp.category} - ${exp.description} : Rs. ${exp.amount?.toLocaleString() || 0}`, rightX, rightY);
      rightY += 4;
      totalCashExpenses += exp.amount || 0;
    });
    doc.setFont("helvetica", "bold");
    doc.text(`Total Cash Expenses: Rs. ${totalCashExpenses.toLocaleString()}`, rightX, rightY);
    rightY += 6;
    doc.setFont("helvetica", "normal");
  } else {
    doc.text("No cash expenses recorded.", rightX, rightY);
    rightY += 6;
  }

  // y = Math.max(leftY, rightY) + 6;
  y = Math.max(leftY, rightY) + 6;
ensureSpace(40); // ensure room for cash sections


  // ===== Advanced Payments Section =====
doc.setFont("helvetica", "bold");
doc.setFontSize(9);
ensureSpace(30);
doc.text("Advanced Payments", 5, y);
y += 5;

doc.setFont("helvetica", "normal");
doc.setFontSize(8);

if (advancedPayments.length > 0) {
  advancedPayments.forEach((ap) => {
    if (y + 4 > pageHeight - 10) {
      doc.addPage();
      y = 15;
    }

    doc.text(
      `${ap.customerName || "-"} | ${ap.phone || "-"} | ${formatPaymentMethod(ap.paymentMethod)} | Rs. ${(ap.amount || 0).toLocaleString()} | ${ap.remarks || "-"}`,
      5,
      y
    );

    y += 4;
  });

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.text("Advanced Payment Totals:", 5, y);
  y += 4;

  doc.text(`Cash: Rs. ${advancedTotals.cash.toLocaleString()}`, 5, y);
  y += 4;
  doc.text(`Bank Transfer: Rs. ${advancedTotals.bank_transfer.toLocaleString()}`, 5, y);
  y += 4;
  doc.text(`Cheque: Rs. ${advancedTotals.cheque.toLocaleString()}`, 5, y);
  y += 4;
  doc.text(`Card: Rs. ${advancedTotals.card.toLocaleString()}`, 5, y);

  doc.setFont("helvetica", "normal");
} else {
  doc.text("No advanced payments recorded.", 5, y);
  y += 4;
}


// ===== Returned Jobs Section =====
doc.addPage();
y = 15;

doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.text("Returned Jobs", 5, y);
y += 6;

doc.setFont("helvetica", "normal");
doc.setFontSize(8);

if (returnedJobs.length > 0) {
  returnedJobs.forEach((job, index) => {
    if (y + 4 > pageHeight - 10) {
      doc.addPage();
      y = 15;
    }

    doc.text(
      `${index + 1}. Job Ref: ${job.jobRef} | Device: ${job.deviceType || "-"} ${job.model || ""} | Technician: ${job.technician || "-"}`,
      5,
      y
    );

    y += 4;
  });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Returned Jobs: ${returnedJobs.length}`, 5, y);
  doc.setFont("helvetica", "normal");

} else {
  doc.text("No returned jobs recorded for this date.", 5, y);
}


  // ===== Save PDF =====
  doc.save(`Daily_Summary_${normalizedFrom}.pdf`);
};



const searchBills = () => {
  const term = searchTerm.trim().toLowerCase();

  let filtered = [...bills];

  if (term) {
    filtered = filtered.filter((bill) => {
      // ===== BASIC BILL FIELDS =====
      const billNumber = bill.billNumber?.toLowerCase() || "";
      const jobRef = bill.jobRef?.toLowerCase() || "";

      // ===== CUSTOMER FIELDS =====
      const customerName = bill.customer?.name?.toLowerCase() || "";
      const customerPhone = bill.customer?.contact?.toLowerCase() || "";
      const customerEmail = bill.customer?.email?.toLowerCase() || "";

      // ===== ITEM-LEVEL SEARCH (SN / IMEI / LABEL) =====
      const itemMatch = bill.items?.some((item) => {
        const label = item.finalLabel?.toLowerCase() || "";
        return label.includes(term);
      });

      return (
        billNumber.includes(term) ||
        jobRef.includes(term) ||
        customerName.includes(term) ||
        customerPhone.includes(term) ||
        customerEmail.includes(term) ||
        itemMatch
      );
    });
  }

  // ===== DATE FILTER (OPTIONAL) =====
  if (dateFrom || dateTo) {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    if (to) to.setHours(23, 59, 59, 999);

    filtered = filtered.filter((bill) => {
      const billDate = new Date(bill.date);
      if (from && billDate < from) return false;
      if (to && billDate > to) return false;
      return true;
    });
  }

  // ===== PAYMENT METHOD FILTER =====
if (selectedPaymentMethod) {
  filtered = filtered.filter((bill) => 
    bill.payments?.some((p) => p.method === selectedPaymentMethod)
  );
}


  // ===== SORT DESCENDING BY BILL NUMBER =====
  filtered.sort((a, b) => {
    const numA = Number(a.billNumber?.replace(/^IDS-/, "")) || 0;
    const numB = Number(b.billNumber?.replace(/^IDS-/, "")) || 0;
    return numB - numA;
  });

  setFilteredBills(filtered);
};

const fetchReturnedJobs = async (date) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/job-return-notes/by-date?date=${date}`
    );
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch returned jobs", err);
    return [];
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end text-sm p-4">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-10/12 w-full ml-auto mr-6 p-6 min-h-[600px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold">Bills Overview</h2>
          <button onClick={() => setShowCloseConfirm(true)} className="absolute top-3 right-3 text-gray-600 hover:text-white hover:font-bold hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <label>From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border rounded-md px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-1">
            <label>To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border rounded-md px-2 py-1"
            />
          </div>
            <div>
              <button className="cursor-pointer font-bold bg-cyan-600 text-white py-1 px-4 hover:bg-cyan-700 border-none rounded" onClick={fetchBills}>Refresh</button>
            </div>
          <input
            type="text"
            placeholder="Search by bill no, job ref, S/N, EMEI or customer..."
            className="flex-1 border rounded-md px-3 py-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            onClick={downloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md cursor-pointer"
          >
            Download Excel
          </button>
          <button
            onClick={downloadQuickExcel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md cursor-pointer"
          >
            Quick Excel
          </button>
          <button
            onClick={downloadDailySummaryPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md cursor-pointer"
          >
            Daily Summary PDF
          </button>

        </div>

        {/* Payment totals */}
        <div className="flex flex-wrap gap-2 mb-6 mt-4">
          {Object.entries(paymentTotals).map(([method, total], idx) => {
            const colors = [
              "bg-red-500 hover:bg-red-600",
              "bg-green-500 hover:bg-green-600",
              "bg-blue-500 hover:bg-blue-600",
              "bg-yellow-500 hover:bg-yellow-600",
              "bg-purple-500 hover:bg-purple-600",
              "bg-pink-500 hover:bg-pink-600",
              "bg-indigo-500 hover:bg-indigo-600",
              "bg-teal-500 hover:bg-teal-600",
            ];
            const colorClass = colors[idx % colors.length];
            return (
              <button key={method} className={`${colorClass} text-white px-4 py-1 rounded font-bold`}>
                {method}: Rs.{total.toLocaleString()}
              </button>
            );
          })}

          {/* PAYMENT METHODS DROP DOWN */}
        <div>
          <select
            name="paymentMethod"
            id="paymentMethod"
            className="px-4 py-2 border rounded"
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          >
            <option value="">All Payments</option> {/* default: show all */}
            <option value="Card - Visa">Card - Visa</option>
            <option value="Card - MasterCard">Card - MasterCard</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="KOKO">KOKO</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Credit">Credit</option>
            <option value="Half-Payment">Half-Payment</option>
          </select>
        </div>

        </div>

        {/* Bills Table */}
        <div className="border rounded-lg overflow-hidden h-full flex-1">
          <div className="overflow-y-auto max-h-[450px]">
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="p-2 border w-[80px]">Bill No</th>
                  <th className="p-2 border w-[120px]">Date</th>
                  <th className="p-2 border w-[120px]">Job Ref</th>
                  <th className="p-2 border w-[160px]">Customer</th>
                  <th className="p-2 border w-[120px]">Payment</th>
                  <th className="p-2 border text-right w-[140px]">Subtotal (LKR)</th>
                  <th className="p-2 border text-right w-[140px]">Profit (LKR)</th>
                </tr>
              </thead>

              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => (
                    <tr
                      key={bill._id}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => setSelectedBill(bill)}
                    >
                      <td className="p-1 border truncate">{bill.billNumber}</td>
                      <td className="p-1 border truncate">
                        {new Date(bill.date).toLocaleDateString()}
                      </td>
                      <td className="p-1 border truncate">{bill.jobRef}</td>
                      <td className="p-1 border truncate">{bill.customer?.name}</td>
                      <td className="p-1 border truncate">  {bill.payments?.map((p) => p.method).join(" | ")}  </td>
                      <td className="p-1 border text-right truncate">
                        {bill.subTotal?.toLocaleString()}
                      </td>
                      <td className="p-1 border text-right text-green-600 font-medium truncate">
                        {bill.billProfit?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 p-4 italic">
                      No bills found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Details Modal */}
        {selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-40"
            ></div>

            <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 p-6 text-xs">
              <h3 className="text-base font-semibold mb-2">
                Bill Details - {selectedBill.billNumber}
              </h3>

              <div className="space-y-1 mb-3 text-gray-700">
                <p>
                  <strong>Job Ref:</strong> {selectedBill.jobRef}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedBill.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Customer:</strong> {selectedBill.customer?.name} (
                  {selectedBill.customer?.contact})
                </p>

                <p className="font-semibold mt-2">Payment Details:</p>
                <div className="ml-2 space-y-1">
                  {selectedBill.payments?.length > 0 ? (
                    selectedBill.payments.map((pm, idx) => (
                      <p key={idx}>
                        • {pm.method}: <strong>Rs.{pm.amount.toLocaleString()}</strong>
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No payment information</p>
                  )}
                </div>

                <p>
                  <strong>Bill Maker:</strong> {selectedBill.billMaker}
                </p>
                <p>
                  <strong>Technician:</strong> {selectedBill.technician}
                </p>
              </div>

              <div className="border-t pt-2">
                <h4 className="font-semibold mb-1">Items:</h4>

                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-1 border">Item</th>
                      <th className="p-1 border text-right">Qty</th>
                      <th className="p-1 border text-right">Unit</th>
                      <th className="p-1 border text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedBill.items.map((it, i) => (
                      <tr key={i}>
                        <td className="p-1 border">{it.finalLabel}</td>
                        <td className="p-1 border text-right">{it.qty}</td>
                        <td className="p-1 border text-right">
                          {it.unitPrice.toLocaleString()}
                        </td>
                        <td className="p-1 border text-right">
                          {it.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-right mt-2 space-y-1">
                  <p>
                    <strong>Subtotal:</strong>{" "}
                    {selectedBill.subTotal.toLocaleString()} LKR
                  </p>
                  <p className="text-green-600 font-semibold">
                    <strong>Profit:</strong>{" "}
                    {selectedBill.billProfit?.toLocaleString() || 0} LKR
                  </p>
                </div>
              </div>

              <div className="text-right mt-4">
                <button
                  onClick={downloadBillPDF}
                  className="px-3 py-1 border-none font-bold rounded-md hover:bg-green-600 cursor-pointer hover:text-white"
                >
                  Print
                </button>
              <button
                  onClick={() => {
                    setPinInput("");
                    setShowPinPopup(true);
                  }}
                  className="px-3 py-1 border-none font-bold rounded-md hover:bg-blue-800 cursor-pointer hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="px-3 py-1 border-none font-bold rounded-md hover:bg-red-400 cursor-pointer hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
{showCloseConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black opacity-40"></div>

    <div className="relative bg-white rounded-xl shadow-xl w-80 p-4 text-center">
      <p className="mb-4 font-semibold">Are you sure you want to close ?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setShowCloseConfirm(false);
            onClose(); // actually close modal
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

{showPinPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    
    {/* Background overlay */}
    <div className="absolute inset-0 bg-black opacity-40 pointer-events-none"></div>

    {/* Popup */}
    <div className="relative bg-white p-5 rounded-xl shadow-xl w-72 text-center z-50">
      <p className="font-semibold mb-3">Enter PIN to Edit</p>

      <input
        type="password"
        maxLength={6}
        value={pinInput}
        onChange={(e) => setPinInput(e.target.value)}
        className="border rounded w-full px-3 py-2 text-center"
        placeholder="******"
      />

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setShowPinPopup(false)}
          className="bg-gray-300 px-4 py-1 rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            if (pinInput === "200356") {
              setShowPinPopup(false);
              setPaymentEditorBill(selectedBill);
            } else {
              alert("Incorrect PIN!");
            }
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}


{paymentEditorBill && (
  <div className="fixed inset-0 flex items-center justify-center z-50">

    {/* Background Overlay */}
    <div className="absolute inset-0 bg-black opacity-40 pointer-events-none"></div>

    {/* Modal */}
    <div className="relative bg-white p-6 rounded-xl shadow-xl w-96 text-xs z-50">
      <h3 className="text-base font-bold mb-3">
        Edit Payments - {paymentEditorBill.billNumber}
      </h3>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {paymentMethods.map((method, index) => {
          const selected = payments.some(p => p.method === method);
          return (
            <div key={index} className="flex justify-between items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleCheck(method)}
                />
                {method}
              </label>

              {selected && (
                <input
                  type="number"
                  value={payments.find(p => p.method === method)?.amount || ""}
                  onChange={(e) =>
                    handleAmountChangeForPaymentMethod(method, e.target.value)
                  }
                  className="border rounded px-2 py-1 w-24"
                  placeholder="Amount"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setPaymentEditorBill(null)}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/bills/${paymentEditorBill._id}/payments`,
                { payments }
              );

              alert("Payments updated successfully!");
              fetchBills();
              setPaymentEditorBill(null);
            } catch (err) {
              console.error(err);
              alert("Failed to update payments!");
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
