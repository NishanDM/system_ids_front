import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Grid,
  Typography,
  Divider,
  TextField,
  MenuItem,
    FormControl,
  InputLabel,
  Select,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function JobReturnNote({
  open,
  onClose,
  job,
  onSaveAndPrint
}) {
  const [jobCreators, setJobCreators] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState("");
  const [returnDate, setReturnDate] = useState("");

  useEffect(() => {
    if (open) {
      fetchJobCreators();

      // Auto set today date
      const today = new Date().toISOString().split("T")[0];
      setReturnDate(today);
    }
  }, [open]);

  async function fetchJobCreators() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/job-creators`
      );

      if (Array.isArray(res.data)) {
        setJobCreators(res.data);
      } else {
        console.warn("Unexpected response:", res.data);
        setJobCreators([]);
      }
    } catch (error) {
      console.error("Error fetching job creators:", error);
      alert("Failed to load job creators list.");
    }
  }

  if (!job) return null;

  const InfoRow = ({ label, value }) => (
    <Grid container spacing={1} sx={{ mb: 0.5 }}>
      <Grid item xs={4}>
        <Typography fontWeight="bold">{label}</Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography>{value || "-"}</Typography>
      </Grid>
    </Grid>
  );

  const saveJobReturnNote = async (data) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/job-return-notes`,
      data
    );

    if (res.status === 201) {
      alert("Job Return Note saved successfully!");
      return res.data;
    }
  } catch (error) {
    console.error("Error saving job return note:", error);
    alert("Failed to save Job Return Note.");
    throw error;
  }
};

const updateJobReturnNoteStatus = async () => {
  try {
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/jobs/job_return_note/${job._id}`
    );
  } catch (error) {
    console.error("Error updating job return note status:", error);
    alert("Return note saved but failed to update job status.");
  }
};


//==============  GENERATE THE RETURN NOTE PDF  ==========
// inside JobReturnNote component
const generateReturnNote = (data) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const columnGap = 5;
  const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;

  const addTextLine = (text, x, y, maxWidth, fontSize = 7, fontStyle = "normal") => {
    doc.setFont("Helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.text(text, x, y, { maxWidth });
  };

  let leftY = margin;
  let rightY = margin;
  const leftX = margin;
  const rightX = margin + columnWidth + columnGap;

  // HEADER
  addTextLine("i Device Solutions - JOB RETURN NOTE", leftX, leftY, columnWidth, 11, "bold");
  leftY += 6;

  addTextLine("Return Note", rightX, rightY, columnWidth, 10, "bold");
  rightY += 5;

  addTextLine("No.363, Galle Rd, Colombo 06", rightX, rightY, columnWidth, 8);
  rightY += 4;

  addTextLine("Hotline - 0777 142 402 / 0777 142 502 / 0112 500 990", rightX, rightY, columnWidth, 8);
  rightY += 6;

  addTextLine(data.jobRef, rightX, rightY, columnWidth, 9, "bold");
  rightY += 6;

  // LEFT COLUMN
  const leftContent = [
    ["Job Number", data.jobRef],
    ["Return Date", data.returnNoteDate],
    ["Note Creator", data.returnNoteCreator],
    ["Customer Name", `${data.customerPrefix || ""}. ${data.customerName || ""}`],
    ["Phone", data.customerPhone],
    ["Device Type", data.deviceType],
    ["Model", data.model],
    ["Serial No", data.series],
    ["IMEI", data.emei],
    ["Color", data.color],
    ["Capacity", data.capacity],
  ];

  leftContent.forEach(([label, value]) => {
    addTextLine(`${label}: ${value || "-"}`, leftX, leftY, columnWidth);
    leftY += 5;
  });

  // RIGHT COLUMN
  const rightContent = [
    ["Status", data.status],
    ["Progress", data.jobProgress],
    ["Under Warranty", data.underWarranty],
  ];

  rightContent.forEach(([label, value]) => {
    addTextLine(`${label}: ${value || "-"}`, rightX, rightY, columnWidth);
    rightY += 5;
  });

  // Customer Reported
  if (data.customer_reported?.length) {
    rightY += 3;
    addTextLine("Customer Reported:", rightX, rightY, columnWidth, 7, "bold");
    rightY += 4;
    data.customer_reported.forEach((item) => {
      addTextLine(`- ${item}`, rightX + 2, rightY, columnWidth - 2);
      rightY += 4;
    });
  }

  // Faults
  if (data.faults?.length) {
    rightY += 3;
    addTextLine("Faults Mentioned:", rightX, rightY, columnWidth, 7, "bold");
    rightY += 4;
    data.faults.forEach((fault) => {
      addTextLine(`- ${fault}`, rightX + 2, rightY, columnWidth - 2);
      rightY += 4;
    });
  }

  // Remarks
  rightY += 3;
  addTextLine("Remarks:", rightX, rightY, columnWidth, 7, "bold");
  rightY += 4;
  addTextLine(data.remarks || "-", rightX + 2, rightY, columnWidth);

  // SIGNATURE AREA
  const signY = Math.max(leftY, rightY) + 15;
  addTextLine("Note Creator Sign: ....................................................", leftX, signY, 90, 8);
  addTextLine("Customer Sign: ........................................................", rightX, signY, 90, 8);

  // PRINT / DOWNLOAD
  const fileName = `JOB_RETURN_NOTE-${data.jobRef || "JobReturnNote"}.pdf`;
  const blob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(blob);
  const newTab = window.open(pdfUrl, "_blank");

  if (newTab) {
    newTab.onload = () => {
      newTab.focus();
      newTab.print();
      doc.save(fileName);
    };
  } else {
    doc.save(fileName);
    alert("Popup blocked. PDF downloaded instead.");
  }
};


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      
      {/* HEADER */}
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Job Return Note
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* CONTENT */}
      <DialogContent dividers>

        {/* ===== TOP NEW SECTION ===== */}
        <Typography variant="h6" gutterBottom>
          Return Note Details
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Grid item xs={6}>
  <Box sx={{ minWidth: 200 }}>
    <FormControl fullWidth size="small">
      <InputLabel id="creator-label">Note Creator</InputLabel>
      <Select
        labelId="creator-label"
        id="creator-select"
        value={selectedCreator}
        label="Job Creator"
        onChange={(e) => setSelectedCreator(e.target.value)}
      >
        <MenuItem value="" disabled>
          Select Job Creator
        </MenuItem>

        {jobCreators.map((creator) => (
          <MenuItem key={creator._id} value={creator.username}>
            {creator.username}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
</Grid>

          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Return Note Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {/* ===== JOB INFORMATION ===== */}
        <Typography variant="h6" gutterBottom>
          Job Information
        </Typography>

        <InfoRow label="Job Ref" value={job.jobRef} />
        <InfoRow
          label="Created Date"
          value={
            job.createdAt
              ? new Date(job.createdAt).toLocaleDateString()
              : "-"
          }
        />
        <InfoRow
          label="Customer Name"
          value={`${job.customerPrefix || ""} ${job.customerName || ""}`}
        />
        <InfoRow label="Phone" value={job.customerPhone} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Device Information
        </Typography>

        <InfoRow label="Device Type" value={job.deviceType} />
        <InfoRow label="Model" value={job.model} />
        <InfoRow label="Serial" value={job.series} />
        <InfoRow label="IMEI" value={job.emei} />
        <InfoRow label="Color" value={job.color} />
        <InfoRow label="Capacity" value={job.capacity} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Job Details
        </Typography>

        <InfoRow label="Technician" value={job.technician} />
        <InfoRow label="Status" value={job.status} />
        <InfoRow label="Progress" value={job.jobProgress} />
        <InfoRow label="Under Warranty" value={job.underWarranty} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Customer Reported</Typography>
        <Typography sx={{ mb: 1 }}>
          {job.customer_reported?.length
            ? job.customer_reported.join(", ")
            : "-"}
        </Typography>

        <Typography variant="h6">Faults</Typography>
        <Typography sx={{ mb: 1 }}>
          {job.faults?.length ? job.faults.join(", ") : "-"}
        </Typography>

        <Typography variant="h6">Remarks</Typography>
        <Typography>{job.remarks || "-"}</Typography>

      </DialogContent>

      {/* FOOTER */}
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>

<Button
  variant="contained"
  color="primary"
  onClick={async () => {
    const dataToSave = {
      jobRef: job.jobRef,
      returnNoteCreator: selectedCreator,
      returnNoteDate: returnDate,
      customer_reported: job.customer_reported,
      faults: job.faults,
      remarks: job.remarks,
      technician: job.technician,
      status: job.status,
      jobProgress: job.jobProgress,
      deviceType: job.deviceType,
      model: job.model,
      series: job.series,
      emei: job.emei,
      color: job.color,
      capacity: job.capacity,
    };

    try {
      await saveJobReturnNote(dataToSave); // Save to DB
      await updateJobReturnNoteStatus();
      generateReturnNote(dataToSave); // Generate PDF
      // onSaveAndPrint(dataToSave); // Optional callback
      // 🔥 Let parent handle refresh + close
if (onSaveAndPrint) {
  onSaveAndPrint(dataToSave);
}
      onClose();
    } catch (err) {
      console.error(err);
    }
  }}
>
  Save & Print
</Button>

      </DialogActions>

    </Dialog>
  );
}
