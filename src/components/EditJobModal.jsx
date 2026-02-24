import React from "react";
import TechnicianDropdown from "./TechnicianDropdown";

import {
  Modal,
  Box,
  InputLabel,
  FormControl,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

const EditJobModal = ({ editData, setEditData, onClose, onJobUpdated }) => {
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "simTrayCollected") {
      setEditData((prev) => ({ ...prev, [name]: value === "Yes" }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const renderInput = (label, name, value, readOnly = false) => (
    <TextField
      label={label}
      name={name}
      value={value || ""}
      onChange={handleEditChange}
      fullWidth
      size="small"
      margin="normal"
      InputProps={{ readOnly }}
    />
  );

  // ================= WhatsApp notification =================
const sendWhatsappNotification = async (job) => {
  try {
    const messageText = `Dear ${job.customerPrefix} ${job.customerName},

Your job has been COMPLETED ✅

Job Number: ${job.jobRef}
Device: ${job.deviceType} - ${job.model}

Please come and collect your device as soon as possible.

(THIS IS A SYSTEM GENERATED WHATSAPP MESSAGE - DO NOT REPLY)

i Device Solutions
+94 112 500 990 | +94 777 142 502 | +94 777 142 402`;

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/whatsapp/send`,
      {
        jobRef: job.jobRef,
        customerName: `${job.customerPrefix} ${job.customerName}`,
        customerPhone: job.customerPhone,
        messageBody: messageText,
      }
    );

    if (response.data?.status === "sent" || response.data?._id) {
      console.log("✅ WhatsApp notification sent");
      alert(' ✅ WhatsApp Message is sent to the customer ✅');
    } else {
      console.warn("⚠️ WhatsApp may not have sent", response.data);
    }
  } catch (error) {
    console.error("❌ WhatsApp send failed:", error);
  }
};

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!editData || !editData.jobRef) {
  //     alert("❌ Job reference missing!");
  //     return;
  //   }

  //   try {
  //     // Only send editable fields
  //     const editableFields = { ...editData };
  //     const protectedFields = [
  //       "jobRef",
  //       "createdDate",
  //       "createdBy",
  //       "customerPrefix",
  //       "customerName",
  //       "customerEmail",
  //       "customerPhone",
  //       "customerCompany",
  //       "customerAddress",
  //     ];
  //     protectedFields.forEach((field) => delete editableFields[field]);

  //     const res = await axios.patch(
  //       `${import.meta.env.VITE_API_URL}/api/jobs-creatoredit/edit/${editData.jobRef}`,
  //       editableFields
  //     );

  //     if (res.status === 200) {
  //       alert("✅ Job updated successfully!");

  //         // send WhatsApp if job completed
  //       if (editData.jobProgress === "Completed") {
  //         await sendWhatsappNotification(editData);
  //       }
  //         // 🔄 refresh all jobs in parent
  //       if (onJobUpdated) {
  //         await onJobUpdated();
  //       }
  //       onClose();
  //     } else {
  //       alert(`❌ Failed to update job: ${res.data.message || "Unknown error"}`);
  //     }
  //   } catch (err) {
  //     console.error("Update error:", err);
  //     const errorMsg = err.response?.data?.message || err.message || "Error updating job.";
  //     alert(`❌ ${errorMsg}`);
  //   }
  // };
  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!editData || !editData.jobRef) {
    alert("❌ Job reference missing!");
    return;
  }

  try {
    // original progress (before editing)
    const originalProgress =
      (editData.jobProgress_original || editData.jobProgress || "")
        .toLowerCase()
        .trim();

    const newProgress =
      (editData.jobProgress || "").toLowerCase().trim();

    // ==============================
    // RULE 1:
    // Completed allowed ONLY if current progress is Checking_Stage
    // ==============================
    if (
      newProgress === "completed" &&
      originalProgress !== "checking_stage"
    ) {
      alert(
        "⚠️ Please check and confirm the job is ready to complete"
      );
      return;
    }

    // ==============================
    // RULE 2: Returned & Closed only if original progress is Canceled
    // ==============================
    if (newProgress === "returned & closed" && originalProgress !== "canceled") {
      alert(
        "⚠️ Only jobs that are CANCELED can be marked as Returned & Closed"
      );
      return; // block update
    }

    // OPTIONAL GOOD PRACTICE:
    if (newProgress === "completed") {
      updatedData.completed_date = new Date().toISOString();
    }

    // ==============================
    // REMOVE PROTECTED FIELDS
    // ==============================
    const editableFields = { ...updatedData };

    const protectedFields = [
      "jobRef",
      "createdDate",
      "createdBy",
      "customerPrefix",
      "customerName",
      "customerEmail",
      "customerPhone",
      "customerCompany",
      "customerAddress",
      "jobProgress_original",
    ];

    protectedFields.forEach((field) => delete editableFields[field]);

    const res = await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/jobs-creatoredit/edit/${editData.jobRef}`,
      editableFields
    );

    if (res.status === 200) {
      alert("✅ Job updated successfully!");

      // WhatsApp send
      if (newProgress === "completed") {
        await sendWhatsappNotification(updatedData);
      }

      if (onJobUpdated) {
        await onJobUpdated();
      }

      onClose();
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error updating job");
  }
};


  return (
    <Modal open={true} onClose={onClose}>
      <Box className="absolute top-1/2 left-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto 
                      bg-white transform -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-lg p-6">
        <Typography variant="h5" className="text-cyan-800 font-bold mb-4 text-center">
          Edit Job Details
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Job Details */}
        {/* Job Details */}
<Accordion defaultExpanded>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography className="font-semibold text-gray-700">Job Details</Typography>
  </AccordionSummary>
  <AccordionDetails className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {renderInput("Job Ref", "jobRef", editData.jobRef, true)}
    {renderInput("Created Date", "createdDate", editData.createdDate, true)}

    {/* Job Flag as Select Dropdown */}
    <Box sx={{ minWidth: 120, marginTop: '8px' }}>
      <FormControl fullWidth size="small">
        <InputLabel id="job-flag-label">Job Flag</InputLabel>
        <Select
          labelId="job-flag-label"
          id="job-flag-select"
          name="jobFlag"
          value={editData.jobFlag || ""}
          label="Job Flag"
          onChange={handleEditChange}
        >
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="Quick">Quick</MenuItem>
        </Select>
      </FormControl>
    </Box>

    {renderInput("Created By", "createdBy", editData.createdBy, true)}
  </AccordionDetails>
</Accordion>


          {/* Device Details */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className="font-semibold text-gray-700">Device Details</Typography>
            </AccordionSummary>
            <AccordionDetails className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Device Type", "deviceType", editData.deviceType, true)}
              {renderInput("Model", "model", editData.model, true)}
              {renderInput("Serial Number", "series", editData.series)}
              {renderInput("EMEI", "emei", editData.emei)}
              {renderInput("Capacity", "capacity", editData.capacity, true)}
              {renderInput("Color", "color", editData.color, true)}
              {renderInput("Passcode", "passcode", editData.passcode)}
              {renderInput("SIM Tray Serial", "simTraySerial", editData.simTraySerial)}
              {renderInput("Under Warranty", "underWarranty", editData.underWarranty, true)}
              <div>
                <Typography variant="body2" className="text-gray-600 mb-1">SIM Tray Collected</Typography>
                <Select
                  name="simTrayCollected"
                  value={editData.simTrayCollected ? "Yes" : "No"}
                  onChange={handleEditChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Job Progress */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className="font-semibold text-gray-700">Job Progress</Typography>
            </AccordionSummary>
            <AccordionDetails className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TechnicianDropdown editData={editData} handleEditChange={handleEditChange} />
              <Box sx={{ minWidth: 120, marginTop: '8px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status-select"
                    name="status"
                    value={editData.status || ""}
                    label="Status"
                    onChange={handleEditChange}
                  >
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Re-repair">Re-repair</MenuItem>
                    <MenuItem value="Under-warranty">Under-warranty</MenuItem>
                    <MenuItem value="Sell for parts">Sell for parts</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ marginTop: 2 }}>
                    <TextField
                      label="Estimated Completion"
                      name="estimatedCompletion"
                      type="date"
                      value={editData.estimatedCompletion || ""}
                      onChange={handleEditChange}
                      fullWidth
                      size="small"
                      InputLabelProps={{
                        shrink: true, // makes label stay above for date inputs
                      }}
                    />
                  </Box>
              {renderInput("Estimated Cost", "estimatedCost", editData.estimatedCost)}
              <Box sx={{ minWidth: 120, marginTop: '8px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="progress-label">Progress</InputLabel>
                  <Select
                    labelId="progress-label"
                    id="progress-select"
                    name="jobProgress"
                    value={editData.jobProgress || ""}
                    label="Progress"
                    onChange={handleEditChange}
                  >
                    {/* <MenuItem value="Taken">Taken</MenuItem> */}
                    <MenuItem value="Completed">Completed</MenuItem>
                    {/* <MenuItem value="Hold">Hold</MenuItem> */}
                    <MenuItem value="Returned & Closed">Returned & Closed</MenuItem>
                    {/* <MenuItem value="Canceled">Canceled</MenuItem> */}
                    {/* <MenuItem value="Assign for another technician">Assign for another technician</MenuItem> */}
                    {/* <MenuItem value="Waiting For Parts">Waiting For Parts</MenuItem> */}
                  </Select>
                </FormControl>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Faults & Remarks */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className="font-semibold text-gray-700">Faults & Remarks</Typography>
            </AccordionSummary>
            <AccordionDetails className="grid grid-cols-1 gap-4">
              <TextField
                label="Faults"
                name="faults"
                value={editData.faults || ""}
                onChange={handleEditChange}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Remarks"
                name="remarks"
                value={editData.remarks || ""}
                onChange={handleEditChange}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Tech Notes"
                name="repaired_accessories"
                value={editData.repaired_accessories || ""}
                onChange={handleEditChange}
                multiline
                rows={2}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </AccordionDetails>
          </Accordion>

          {/* Footer */}
          <Box className="flex justify-end gap-3 pt-6">
            <Button variant="outlined" color="inherit" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="success">Save Changes</Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default EditJobModal;
