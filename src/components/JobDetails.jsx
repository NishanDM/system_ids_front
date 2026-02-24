import React, { useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const JobDetails = ({ formData, setFormData, technicians }) => {
  const [newFault, setNewFault] = useState("");
  const [newCustomerReported, setNewCustomerReported] = useState("");

  /** Handle common input changes */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Reset section to defaults */
  const resetSection = () => {
    setFormData((prev) => ({
      ...prev,
      jobFlag: "Normal",
      technician: "",
      status: "New",
      estimatedCompletion: "",
      estimatedCost: "",
      jobProgress: "Just_started",
      remarks: "",
      faults: [],
      repaired_accessories: [],
      customer_reported: [],
      collected_accessories: [],
    }));
    setNewFault("");
    setNewCustomerReported("");
  };

  /** Fault management */
  const handleAddFault = () => {
    if (!newFault.trim()) return;
    setFormData((prev) => ({
      ...prev,
      faults: [...(prev.faults || []), newFault.trim()],
    }));
    setNewFault("");
  };

  const handleRemoveFault = (index) => {
    setFormData((prev) => ({
      ...prev,
      faults: prev.faults.filter((_, i) => i !== index),
    }));
  };

  /** Customer reported management */
  const handleAddCustomerReported = () => {
    if (!newCustomerReported.trim()) return;
    setFormData((prev) => ({
      ...prev,
      customer_reported: [...(prev.customer_reported || []), newCustomerReported.trim()],
    }));
    setNewCustomerReported("");
  };

  const handleRemoveCustomerReported = (index) => {
    setFormData((prev) => ({
      ...prev,
      customer_reported: prev.customer_reported.filter((_, i) => i !== index),
    }));
  };

  const textFieldSx = {
    "& .MuiInputBase-root": {
      fontSize: 12,
      height: 28,
      padding: "0 8px",
      color: "black",
    },
    "& .MuiInputLabel-root": {
      fontSize: 12,
      color: "black",
      fontWeight: "bold",
    },
  };

  return (
    <Box mb={3}>
        <Box mt={5}>
           <Divider textAlign="center">
             <Typography variant="h6" color="info">
               JOB DETAILS
             </Typography>
           </Divider>
         </Box>

      {/* Main job info */}
      <Grid container spacing={2}  mt={3}>
        {/* Job Flag */}
        <Grid item xs={12} sm={3}>
          <TextField
            select
            label="Job Flag"
            name="jobFlag"
            value={formData.jobFlag}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width: 150
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          >
            {["Normal", "Quick"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Under Warranty */}
        <Grid item xs={12} sm={3}>
          <TextField
            select
            label="Service and Repair Warranty"
            name="underWarranty"
            value={formData.underWarranty}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width: 150
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          >
            {["Yes", "No"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Technician */}
        <Grid item xs={12} sm={3}>
          <TextField
            select
            label="Technician"
            name="technician"
            value={formData.technician}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width: 270
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          >
            <MenuItem value="">-- Select Technician --</MenuItem>
            {technicians.map((t) => (
              <MenuItem key={t._id || t.username} value={t.username}>
                {t.username}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={3}>
          <TextField
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width: 200
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          >
            {["New", "Re-repair", "Under-warranty", "Sell for parts"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Estimated Completion */}
        <Grid item xs={12} sm={3}>
          <TextField
            label="Est. Completion"
            type="date"
            name="estimatedCompletion"
            value={formData.estimatedCompletion}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={textFieldSx}
          />
        </Grid>

        {/* Estimated Cost */}
        <Grid item xs={12} sm={3}>
          <TextField
            label="Estimated Cost"
            name="estimatedCost"
            value={formData.estimatedCost}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width: 200
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Faults Section */}
      <Box mt={2}>
        <Typography fontSize={12} fontWeight={600} mb={0.5}>
          Faults
        </Typography>
        <Box display="flex" gap={1} mb={1}>
          <TextField
            placeholder="Enter a fault"
            value={newFault}
            onChange={(e) => setNewFault(e.target.value)}
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:1130
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddFault()}
          />
          <Button
            variant="contained"
            color="info"
            size="small"
            onClick={handleAddFault}
          >
            Add
          </Button>
        </Box>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {(formData.faults || []).map((fault, index) => (
            <Chip
              key={index}
              label={fault}
              size="small"
              color="default"
              variant="outlined"
              onDelete={() => handleRemoveFault(index)}
              deleteIcon={<CloseIcon />}
              sx={{ fontSize: 12, height: 28 }}
            />
          ))}
        </Stack>
      </Box>

      {/* Customer Reported Section */}
      <Box mt={3}>
        <Typography fontSize={12} fontWeight={600} mb={0.5}>
          Customer Reported
        </Typography>
        <Box display="flex" gap={1} mb={1}>
          <TextField
            placeholder="Enter issue reported by customer"
            value={newCustomerReported}
            onChange={(e) => setNewCustomerReported(e.target.value)}
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:1130
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustomerReported()}
          />
          <Button
            variant="contained"
            color="info"
            size="small"
            onClick={handleAddCustomerReported}
          >
            Add
          </Button>
        </Box>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {(formData.customer_reported || []).map((issue, index) => (
            <Chip
              key={index}
              label={issue}
              size="small"
              color="info"
              variant="outlined"
              onDelete={() => handleRemoveCustomerReported(index)}
              deleteIcon={<CloseIcon />}
              sx={{ fontSize: 12, height: 28 }}
            />
          ))}
        </Stack>
      </Box>

      {/* Accessories & Remarks */}
      <Grid container spacing={1} mt={1}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Other Accessories Collected"
            name="collected_accessories"
            value={formData.collected_accessories || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width: 250
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          >
            <MenuItem value="">-- Select an accessory --</MenuItem>
            {["Charger", "Cable", "Keyboard & Mouse", "Case"].map(
              (item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              )
            )}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                // Remove fixed height
                padding: "4px 8px", // adjust padding for better spacing
                color: "black",
                width: 700, // use full width of the grid item
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold",
              },
            }}
          />
        </Grid>
      </Grid>
      {/* Reset Button */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="contained"
          color="info"
          size="small"
          onClick={resetSection}
        >
          Reset Job Details
        </Button>
      </Box>
    </Box>
  );
};

export default JobDetails;
