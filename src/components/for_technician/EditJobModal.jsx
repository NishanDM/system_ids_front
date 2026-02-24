
import React, { useEffect, useState } from "react";
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

const EditJobModal = ({ editData, setEditData, onClose, refreshJobs }) => {
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "simTrayCollected") {
      setEditData((prev) => ({ ...prev, [name]: value === "Yes" }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const [jobCreators, setJobCreators] = useState([]);
  const fetchJobCreators = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/users/job-creators`
    );

    if (Array.isArray(res.data)) {
      setJobCreators(res.data);
    } else {
      setJobCreators([]);
    }
  } catch (error) {
    console.error("Error fetching job creators:", error);
    alert("Failed to load job creators list.");
  }
};
useEffect(() => {
  fetchJobCreators();
}, []);

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


  //=================== whatsapp msg sending ===================
  const sendWhatsappNotification = async (job) => {
  try {
    const messageText = `Dear ${job.customerPrefix} ${job.customerName},

Your job has been COMPLETED ✅

Job Number: ${job.jobRef}
Device: ${job.deviceType} - ${job.model}

Please come and collect your device as soon as possible.
(THIS IS A SYSTEM GENERATED WHATSAPP MESSAGE - DO NOT REPLY)

i Device Solutions - Wellawatta
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
      console.log("✅ WhatsApp notification sent successfully");
    } else {
      console.warn("⚠️ WhatsApp notification might have failed", response.data);
    }
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message:", error);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editData || !editData.jobRef) {
      alert("❌ Job reference missing!");
      return;
    }
      // ✅ Add WhatsApp confirmation here
  if (editData.jobProgress === "Completed") {
    if (!window.confirm("This will notify the customer via WhatsApp. Continue?")) {
      return; // stops submission if user cancels
    }
  }

    try {
      // Only send editable fields
      const editableFields = { ...editData };
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
      ];
      protectedFields.forEach((field) => delete editableFields[field]);

      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/jobs-creatoredit/edit/${editData.jobRef}`,
        editableFields
      );

      if (res.status === 200) {
        alert("✅ Job updated successfully!");
        onClose();
                // ✅ Refresh jobs automatically
        if (refreshJobs) refreshJobs();
              // ✅ New: send WhatsApp if completed
      if (editData.jobProgress === "Completed") {
        sendWhatsappNotification(editData);
      }
      } else {
        alert(`❌ Failed to update job: ${res.data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Error updating job.";
      alert(`❌ ${errorMsg}`);
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
    <Typography className="font-semibold text-gray-700">
      Device Details (View Only)
    </Typography>
  </AccordionSummary>

  <AccordionDetails className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-90 pointer-events-none">

    {renderInput("Device Type", "deviceType", editData.deviceType, true)}
    {renderInput("Model", "model", editData.model, true)}
    {renderInput("Serial Number", "series", editData.series, true)}
    {renderInput("EMEI", "emei", editData.emei, true)}
    {renderInput("Capacity", "capacity", editData.capacity, true)}
    {renderInput("Color", "color", editData.color, true)}
    {renderInput("Passcode", "passcode", editData.passcode, true)}
    {renderInput("SIM Tray Serial", "simTraySerial", editData.simTraySerial, true)}
    {renderInput("Under Warranty", "underWarranty", editData.underWarranty, true)}

    {/* SIM Tray Collected (View Only) */}
    <FormControl fullWidth size="small" disabled>
      <InputLabel id="sim-tray-label">SIM Tray Collected</InputLabel>
      <Select
        labelId="sim-tray-label"
        value={editData.simTrayCollected ? "Yes" : "No"}
        label="SIM Tray Collected"
      >
        <MenuItem value="Yes">Yes</MenuItem>
        <MenuItem value="No">No</MenuItem>
      </Select>
    </FormControl>

  </AccordionDetails>
</Accordion>


          {/* Job Progress */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className="font-semibold text-gray-700">Job Progress</Typography>
            </AccordionSummary>
            <AccordionDetails className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <TechnicianDropdown editData={editData} handleEditChange={handleEditChange} /> */}
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
                    <MenuItem value="Taken">Taken</MenuItem>
                    <MenuItem value="Checking_Stage">Completed & Checking</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Hold">Hold</MenuItem>
                    {/* <MenuItem value="Returned">Returned</MenuItem> */}
                    <MenuItem value="Canceled">Canceled</MenuItem>
                    <MenuItem value="Assign for another technician">Assign for another technician</MenuItem>
                    <MenuItem value="Waiting For Parts">Waiting For Parts</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ marginTop: 2 }}>
            <TextField
              label="Completed Date"
              name="completed_date"
              type="date"
              value={editData.completed_date || ""}
              onChange={handleEditChange}
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true, // keeps the label above the input for date fields
              }}
            />
          </Box>

            </AccordionDetails>
          </Accordion>

          {/* Faults & Remarks */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className="font-semibold text-gray-700">Faults - Remarks - TechNotes</Typography>
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
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Remarks"
                name="remarks"
                value={editData.remarks || ""}
                onChange={handleEditChange}
                multiline
                rows={2}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Technician Notes"
                name="repaired_accessories"
                value={editData.repaired_accessories || ""}
                onChange={handleEditChange}
                multiline
                rows={2}
                fullWidth
              />

<Box sx={{ minWidth: 120, marginTop: "8px" }}>
  <FormControl fullWidth size="small">
    <InputLabel>Handed Over Person</InputLabel>
    <Select
      name="handed_over_person"
      value={editData.handed_over_person || ""}
      label="Handed Over Person"
      onChange={handleEditChange}
    >
      {jobCreators.map((creator) => (
        <MenuItem key={creator._id} value={creator.username}>
          {creator.username}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

<Box sx={{ minWidth: 120, marginTop: "8px" }}>
  <FormControl fullWidth size="small">
    <InputLabel>Given To Person</InputLabel>
    <Select
      name="given_to_person"
      value={editData.given_to_person || ""}
      label="Given To Person"
      onChange={handleEditChange}
    >
      {jobCreators.map((creator) => (
        <MenuItem key={creator._id} value={creator.username}>
          {creator.username}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>


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
