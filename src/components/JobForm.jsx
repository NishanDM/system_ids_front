import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Grid, Typography, Paper, Box, } from "@mui/material";
import Logo from "/IDSLogo.png";
import { jsPDF } from "jspdf";
import SideAlert from "./public/SideAlert";
import CustomerDetails from "./CustomerDetails";
import DeviceDetails from "./DeviceDetails";
import JobDetails from "./JobDetails";
import CustomerEdit from "./customer/CustomerEdit";

// ---------------- Initial State ----------------
const initialFormData = (user, today) => ({
  jobRef: "",
  createdDate: today,
  jobFlag: "Normal",
  createdBy: user?.username || user?.email || "",
  customerPrefix: "",
  customerName: "",
  customerEmail: "",
  isForeignNumber: false,
  customerPhone: "",
  customerAlterPhone: "",
  customerCompany: "",
  customerAddress: "",
  deviceType: "",
  model: "",
  series: "",
  emei: "",
  capacity: "",
  color: "",
  passcode: "",
  underWarranty: "No",
  faults: [],
  technician: "",
  status: "New",
  estimatedCompletion: "",
  estimatedCost: "",
  jobProgress: "Just_started",
  remarks: "",
  repaired_accessories: [],
  simTrayCollected: false,
  simTraySerial: "",
  customer_reported: [],
  newCustomerReported: "",
  collected_accessories: [],
});

const JobForm = () => {
  const [openCustomerEdit, setOpenCustomerEdit] = useState(false);
  const [formData, setFormData] = useState(() =>
    initialFormData(
      JSON.parse(localStorage.getItem("user")),
      new Date().toISOString().split("T")[0]
    )
  );
  const [technicians, setTechnicians] = useState([]);
  const [jobImages, setJobImages] = useState([]); // will hold both uploaded files & captured base64 images
  const [alertConfig, setAlertConfig] = useState({
  show: false,
  title: "",
  message: "",
  type: "info",
});


  // ---------------- Load Initial Data ----------------
  useEffect(() => {
    const init = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const today = new Date().toISOString().split("T")[0];

      try {
        const [refRes, techRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/nextRef`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/technicians`),
        ]);

        setTechnicians(techRes.data || []);
        setFormData({
          ...initialFormData(user, today),
          jobRef: refRes.data.nextJobRef || "IDSJBN-00-00-000",
        });
      } catch (err) {
        console.error("Initialization error:", err);
        setFormData((prev) => ({
          ...prev,
          jobRef: "IDSJBN-00-00-000",
        }));
      }
    };

    init();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  // ------------------------- Full Name Validation -------------------------
  const nameParts = formData.customerName.trim().split(/\s+/);
  const hasFullName = nameParts.length >= 2;
  const hasPrefix = formData.customerPrefix && formData.customerPrefix !== "none";

  if (!hasPrefix || !hasFullName) {
    // alert("❌ Please enter a valid customer name with prefix and both first and second names. Example: Mr John Robert");
    setAlertConfig({
    show: true,
    title: "Customer Name Error",
    message: "Please enter a valid customer name with prefix and both first and second names. Example: Mr John Robert",
    type: "error",
  });
    return;
  }

  // ------------------------- Phone Validation ------------------------------
  // const phoneRegex = /^07\d{8}$/;
  // const phoneRegex = /^(07\d{8}|0\d{2}\d{7})$/;

  // if (!phoneRegex.test(formData.customerPhone)) {
  //   alert("❌ Phone number must be 10 digits and start with 07 (e.g., 0712345678)");
  //   return;
  // }
  // ------------------------- Phone Validation ------------------------------
if (!formData.isForeignNumber) {
  // Sri Lankan number validation
  const phoneRegex = /^(07\d{8}|0\d{2}\d{7})$/;

  if (!phoneRegex.test(formData.customerPhone)) {
    setAlertConfig({
      show: true,
      title: "Invalid Phone Number",
      message:
        "Sri Lankan phone number must be 10 digits and start with 07 or 0XX",
      type: "error",
    });
    return;
  }
} else {
  // Foreign number – basic safety validation
  if (formData.customerPhone.length < 6) {
    setAlertConfig({
      show: true,
      title: "Invalid Foreign Number",
      message: "Please enter a valid foreign phone number",
      type: "error",
    });
    return;
  }
}


    // ------------------------- Technician Validation -------------------------
  if (!formData.technician || formData.technician.trim() === "") {
    // alert("❌ Please enter the technician before submitting the job.");
      setAlertConfig({
    show: true,
    title: "Technician is not entered",
    message: "Please enter the technician before submitting the job.",
    type: "error",
  });
    return; // Stop submission if technician is empty
  }

  // ------------------------- Required Fields Validation --------------------
  const { customerName, customerPhone, customerPrefix, model, deviceType } = formData;

  if (!customerName || !customerPhone || !customerPrefix || !model || !deviceType) {
    // alert("❌ Please fill all required customer, device, and job fields before submitting.");
    setAlertConfig({
    show: true,
    title: "Required Fields Error",
    message: "Please fill all required customer, device, and job fields before submitting",
    type: "error",
  });
    return;
  }

  // ------------------------- Submit to Backend ----------------------------
  try {
    const fd = new FormData();

    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((val) => fd.append(key, val));
      } else {
        fd.append(key, formData[key]);
      }
    });

    // Add job images if you use them
    jobImages.forEach((img) => fd.append("jobImages", img));

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/jobs`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (res.status === 201) {
      alert("✅ Job submitted 100% successfully! ✅");

      // ------------------------- PDF GENERATION ----------------------------
      try {
        const jobData = res.data.job;
        const billNumber = res.data.job?.billNumber || jobData.jobRef;
        generateJobPDF(jobData, billNumber);
      } catch (pdfErr) {
        console.error("PDF generation failed:", pdfErr);
      }

      // ------------------------- Email Notification ------------------------
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/email/sendJobStart`, {
          to: res.data.job.customerEmail,   // adjust this according to backend
          subject: "Job Started",
          jobDetails: res.data.job,
        });
      } catch (mailErr) {
        console.error("Email error:", mailErr);
      }

      // ------------------------- Reset Form --------------------------------
      const user = JSON.parse(localStorage.getItem("user"));
      const today = new Date().toISOString().split("T")[0];

      const refRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/nextRef`);

      setFormData({
        ...initialFormData(user, today),
        jobRef: refRes.data.nextJobRef || "IDSJBN-00-00-000",
      });

      setJobImages([]);
    } else {
      alert(`Failed to submit job: ${res.data.message || "Unknown error"}`);
    }

  } catch (err) {
    console.error("Submit Error:", err);
    alert(err.response?.data?.message || err.message);
  }
};


  //====================   GENERATE THE PDF ============================
const generateJobPDF = (data, billNumber) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5", // (210 × 148 mm)
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const columnGap = 5;
  const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;

  const addTextLine = (text, x, y, maxWidth, fontSize = 7, fontStyle = "normal") => {
    doc.setFont("Helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.text(text, x, y, { maxWidth });
  };

  // ------------------------------
  // PAGE 1 - CUSTOMER COPY
  // ------------------------------
  const drawCustomerPage = () => {
    doc.setFontSize(10);

    let leftY = margin;
    let rightY = margin;
    const leftX = margin;
    const rightX = margin + columnWidth + columnGap;

    // Logo
    doc.addImage(Logo, "PNG", leftX, leftY, 25, 12);
    leftY += 15;

    addTextLine("IDS - JOB - NOTE (Customer Copy)", leftX, leftY, columnWidth, 10, "bold");
    leftY += 6;

    // Header Right
    addTextLine("Invoice", rightX, rightY, columnWidth, 10, "bold");
    rightY += 6;
    addTextLine(billNumber, rightX, rightY, columnWidth, 9);
    rightY += 5;
    addTextLine("No.363, Galle Rd, Colombo 06", rightX, rightY, columnWidth, 8);
    rightY += 4;
    addTextLine(
      "Hotline - 0777 142 402 / 0777 142 502 / 0112 500 990",
      rightX,
      rightY,
      columnWidth,
      8
    );
    rightY += 8;

    // LEFT DATA
    const leftContent = [
      ["Job Ref", data.jobRef],
      ["Created Date", data.createdDate],
      ["Created By", data.createdBy],
      ["Customer Name", `${data.customerPrefix ? data.customerPrefix + " " : ""}${data.customerName || ""}`],
      ["Phone", data.customerPhone],
      ["Device Type", data.deviceType],
      ["Model", data.model],
      ["Serial No", data.series],
      ["IMEI", data.emei],
      ["Capacity", data.capacity],
      ["Color", data.color],
      ["Passcode", data.passcode],
    ];

    leftContent.forEach(([label, value]) => {
      addTextLine(`${label}: ${value || "-"}`, leftX, leftY, columnWidth);
      leftY += 5;
    });

    // RIGHT DATA
    const rightContent = [
      ["Status", data.status],
      ["Under Warranty", data.underWarranty],
    ];

    rightContent.forEach(([label, value]) => {
      addTextLine(`${label}: ${value || "-"}`, rightX, rightY, columnWidth);
      rightY += 5;
    });

    // Lists
    if (data.customer_reported?.length) {
      addTextLine("Customer Reported:", rightX, rightY, columnWidth, 7, "bold");
      rightY += 4;
      data.customer_reported.forEach((item) => {
        addTextLine(`- ${item}`, rightX + 2, rightY, columnWidth - 2);
        rightY += 4;
      });
    }

    if (data.faults?.length) {
      rightY += 4;
      addTextLine("Faults Found:", rightX, rightY, columnWidth, 7, "bold");
      rightY += 4;
      data.faults.forEach((fault) => {
        addTextLine(`- ${fault}`, rightX + 2, rightY, columnWidth - 2);
        rightY += 4;
      });
    }

    rightY += 4;
    addTextLine("Remarks:", rightX, rightY, columnWidth, 7, "bold");
    rightY += 4;
    addTextLine(data.remarks || "-", rightX + 2, rightY, columnWidth);

    // Terms
    let termsY = Math.max(leftY, rightY) + 5;
    const terms = [
      "Terms & Conditions:",
      "1. Customer must verify contents upon receiving product.",
      "2. Original job sheet required for collection.",
      "3. One month repair warranty applies only to repaired components.",
      "4. Company attempts to repair within seven days.",
      "5. Device held for max 14 days.",
      "6. Company not responsible if not collected within 14 days.",
      "7. Acceptance confirms agreement to all terms.",
    ];

    terms.forEach((line) => {
      addTextLine(line, leftX, termsY, pageWidth - margin * 2);
      termsY += 3;
    });

    // Signatures
    const signatureY = termsY + 10;

    addTextLine("Authorized: ........................................", leftX, signatureY, 60);
    addTextLine("Customer: ............................................", rightX - 10, signatureY, 60);

    addTextLine("Thank you for choosing our service!", leftX, signatureY + 12, pageWidth - margin * 2, 8, "bold");
  };

  // ------------------------------
  // PAGE 2 - TECHNICIAN COPY
  // ------------------------------
  const drawTechnicianPage = () => {
    doc.addPage("a5", "landscape");

    let leftY = margin;
    let rightY = margin;
    const leftX = margin;
    const rightX = margin + columnWidth + columnGap;

    addTextLine("IDS - JOB - NOTE (Technician Copy)", leftX, leftY, columnWidth, 10, "bold");
    leftY += 6;

    // Header right
    addTextLine("Invoice", rightX, rightY, columnWidth, 10, "bold");
    rightY += 6;
    addTextLine(billNumber, rightX, rightY, columnWidth, 9);
    rightY += 5;

    // Left column data
    const leftContent = [
      ["Job Ref", data.jobRef],
      ["Created Date", data.createdDate],
      ["Created By", data.createdBy],
      ["Customer Name", `${data.customerPrefix ? data.customerPrefix + " " : ""}${data.customerName || ""}`],
      ["Phone", data.customerPhone],
      ["Device Type", data.deviceType],
      ["Model", data.model],
      ["Serial No", data.series],
      ["IMEI", data.emei],
      ["Capacity", data.capacity],
      ["Color", data.color],
      ["Passcode", data.passcode],
    ];

    leftContent.forEach(([label, value]) => {
      addTextLine(`${label}: ${value || "-"}`, leftX, leftY, columnWidth);
      leftY += 5;
    });

    // Right column
    const rightContent = [
      ["Technician", data.technician],
      ["Status", data.status],
      ["Under Warranty", data.underWarranty],
    ];

    rightContent.forEach(([label, value]) => {
      addTextLine(`${label}: ${value || "-"}`, rightX, rightY, columnWidth);
      rightY += 5;
    });

    // Lists
    if (data.customer_reported?.length) {
      addTextLine("Customer Reported:", rightX, rightY, columnWidth, 7, "bold");
      rightY += 4;
      data.customer_reported.forEach((item) => {
        addTextLine(`- ${item}`, rightX + 2, rightY, columnWidth - 2);
        rightY += 4;
      });
    }

    if (data.faults?.length) {
      rightY += 4;
      addTextLine("Faults Found:", rightX, rightY, columnWidth, 7, "bold");
      rightY += 4;
      data.faults.forEach((fault) => {
        addTextLine(`- ${fault}`, rightX + 2, rightY, columnWidth - 2);
        rightY += 4;
      });
    }

    rightY += 4;
    addTextLine("Remarks:", rightX, rightY, columnWidth, 7, "bold");
    rightY += 4;
    addTextLine(data.remarks || "-", rightX + 2, rightY, columnWidth);

    // Technician Notes box
    let boxY = Math.max(leftY, rightY) + 10;
    const boxHeight = 25;
    const boxWidth = pageWidth - margin * 2;

    addTextLine(
      "Technician Notes     Done:......     Returned:......     Job Maker Sign:.......................................",
      leftX,
      boxY - 4,
      boxWidth,
      8,
      "bold"
    );

    doc.setDrawColor(0);
    doc.rect(leftX, boxY, boxWidth, boxHeight);

    const signY = boxY + boxHeight + 10;
    addTextLine("Tech Sign: .................................................", leftX, signY, 100, 8, "normal");

    const custSignX = pageWidth - margin - 70;
    addTextLine("Cust. Sign: .................................................", custSignX, signY, 70, 8, "normal");
  };

  // ------------------------------
  // Render pages
  // ------------------------------
  drawCustomerPage();
  drawTechnicianPage();


    // Prepare filename
  let jobRefName = data?.jobRef?.trim();
  if (!jobRefName || jobRefName === "") {
    jobRefName = billNumber?.trim() || "JobNote";
  }
  jobRefName = jobRefName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const fileName = `${jobRefName}.pdf`;

  // Open PDF in new tab
  const blob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(blob);
  const newTab = window.open(pdfUrl, "_blank");
  if (newTab) {
    newTab.onload = function () {
      newTab.focus();
      newTab.print();
      doc.save(fileName);
    };
  } else {
    alert("Popup blocked! Please allow popups for this site to view the PDF. PDF downloaded instead.");
  }
};


  // ---------------- Render ----------------
  return (
    <Paper elevation={3} sx={{ maxWidth: 1300, mx: "auto", p: 4 }}>
      <Typography variant="h5" align="center" color="info" gutterBottom>
        CREATE A NEW JOB - NEW JOB FORM
      </Typography>

      {/* Static Info */}
      <Box mb={1} mt={5}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Job Ref"
              value={formData.jobRef}
              fullWidth
              disabled
              variant="outlined"
              size="small"
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "black",
                  fontSize: 12,
                  padding: "0 8px",
                  height: 28,
                  fontWeight: "bold",
                  width: 325,
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "black",
                  fontSize: 12,
                  top: -4,
                  fontWeight: "bold",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Created Date"
              type="date"
              value={formData.createdDate}
              fullWidth
              disabled
              variant="outlined"
              size="small"
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "black",
                  fontSize: 12,
                  padding: "0 8px",
                  height: 28,
                  fontWeight: "bold",
                  width: 325,
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "black",
                  fontSize: 12,
                  top: -4,
                  fontWeight: "bold",
                },
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Created By"
              value={formData.createdBy}
              fullWidth
              disabled
              variant="outlined"
              size="small"
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "black",
                  fontSize: 12,
                  padding: "0 8px",
                  height: 28,
                  fontWeight: "bold",
                  width: 490,
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "black",
                  fontSize: 12,
                  top: -4,
                  fontWeight: "bold",
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Sub-sections */}
      <CustomerDetails formData={formData} setFormData={setFormData} />
      <Button type="submit" variant="contained" color="success"  onClick={() => setOpenCustomerEdit(true)} >
          Customer Details
        </Button>
      <Box my={2}>
        <DeviceDetails formData={formData} setFormData={setFormData} />
      </Box>
      <Box my={4}>
        <JobDetails formData={formData} setFormData={setFormData} technicians={technicians} />
      </Box>

      {/* Submit */}
      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
          Submit Job
        </Button>
      </Box>
      <SideAlert
  show={alertConfig.show}
  onClose={() => setAlertConfig({ ...alertConfig, show: false })}
  title={alertConfig.title}
  message={alertConfig.message}
  type={alertConfig.type}
  autoClose
  duration={4000}
/>
      {openCustomerEdit && (
        <CustomerEdit onClose={() => setOpenCustomerEdit(false)} />
      )}

    </Paper>
  );
};

export default JobForm;
