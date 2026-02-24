import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Grid, Typography, Paper, Box, } from "@mui/material";
import Logo from "/IDSLogo.png";
import { jsPDF } from "jspdf";

import CustomerDetails from "./CustomerDetails";
import DeviceDetails from "./DeviceDetails";
import JobDetails from "./JobDetails";


// ---------------- Initial State ----------------
const initialFormData = (user, today) => ({
  jobRef: "",
  createdDate: today,
  jobFlag: "Normal",
  createdBy: user?.username || user?.email || "",
  customerPrefix: "",
  customerName: "",
  customerEmail: "",
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
  const [formData, setFormData] = useState(() =>
    initialFormData(
      JSON.parse(localStorage.getItem("user")),
      new Date().toISOString().split("T")[0]
    )
  );
  const [technicians, setTechnicians] = useState([]);
  const [jobImages, setJobImages] = useState([]); // will hold both uploaded files & captured base64 images

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

  // ---------------- Submit Handler ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

      // ============================== Basic Validation ==============================
  const { customerName, customerPhone, customerPrefix, model, deviceType } = formData;

  if (!customerName || !customerPhone ||! customerPrefix ||! model ||!deviceType ) {
    alert("❌ Please fill in all required customer, device, and job details before submitting.");
    return; // Stop submission
  }

    try {
      const fd = new FormData();

      // Add form data
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach((val) => fd.append(key, val));
        } else {
          fd.append(key, formData[key]);
        }
      });


      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/jobs`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status === 201) {
        alert("✅ Job submitted successfully!");
              // ============================== PDF Generation ==============================
      try {
        const jobData = res.data.job; // from backend response
        const billNumber = res.data.job?.billNumber || jobData.jobRef; // optional
        generateJobPDF(jobData, billNumber);
        console.log("📄 Job PDF generated successfully!");
      } catch (pdfErr) {
        console.error("❌ PDF generation failed:", pdfErr);
      }

        // ============================== Email Notification ==============================
        try {
          await axios.post(`${import.meta.env.VITE_API_URL}/api/email/sendJobStart`, {
            to: res.data.customer.email,
            subject: "Job Started",
            jobDetails: res.data.job,
          });
          console.log("📧 Email sent successfully");
        } catch (mailErr) {
          console.error("❌ Email error:", mailErr);
        }

        // ============================== Reset Form =====================================
        const user = JSON.parse(localStorage.getItem("user"));
        const today = new Date().toISOString().split("T")[0];
        const refRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/nextRef`);
        setFormData({
          ...initialFormData(user, today),
          jobRef: refRes.data.nextJobRef || "IDSJBN-00-00-000",
        });
        setJobImages([]);
      } else {
        alert(`❌ Failed to submit job: ${res.data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert(`❌ ${err.response?.data?.message || err.message}`);
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

    // // Optional dotted divider line
    // doc.setLineDash([3, 2], 0);
    // doc.line(margin, 7, pageWidth - margin, 7);
    // doc.setLineDash([]);

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

    // Optional dotted divider
    // doc.setLineDash([3, 2], 0);
    // doc.line(margin, 7, pageWidth - margin, 7);
    // doc.setLineDash([]);

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

  // Save
  // let jobRefName = data?.jobRef?.trim() || billNumber?.trim() || "JobNote";
  // jobRefName = jobRefName.replace(/[^a-zA-Z0-9-_]/g, "_");

  // doc.save(`${jobRefName}.pdf`);

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
      <Box my={2}>
        <DeviceDetails formData={formData} setFormData={setFormData} />
      </Box>
      <Box my={4}>
        <JobDetails formData={formData} setFormData={setFormData} technicians={technicians} />
      </Box>

      {/* Image Capture & Upload */}
      {/* <Box my={4}>
        <InputLabel>Capture / Upload Job Images (max 4)</InputLabel>
        <WebCamCapture images={jobImages} setImages={setJobImages} />
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          style={{ marginTop: 8, marginBottom: 16, cursor: "pointer" }}
        />
        <Grid container spacing={1}>
          {jobImages.map((img, idx) => (
            <Grid item key={idx}>
              <Box position="relative">
                <img
                  src={typeof img === "string" ? img : URL.createObjectURL(img)}
                  alt={`upload-${idx}`}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => removeImage(idx)}
                  sx={{ position: "absolute", top: -8, right: -8, minWidth: 0, px: 0.5 }}
                >
                  ✕
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box> */}

      {/* Submit */}
      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
          Submit Job
        </Button>
      </Box>
    </Paper>
  );
};

export default JobForm;
