import React, { useEffect, useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import axios from "axios";

const TechnicianDropdown = ({ editData, handleEditChange }) => {
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/technicians`);
        setTechnicians(res.data || []);
      } catch (err) {
        console.error("Failed to fetch technicians:", err);
      }
    };
    fetchTechnicians();
  }, []);

  return (
    <Box sx={{ minWidth: 120, marginTop: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="technician-label">Technician</InputLabel>
        <Select
          labelId="technician-label"
          id="technician-select"
          name="technician"
          value={editData.technician || ""}
          label="Technician"
          onChange={handleEditChange}
        >
          <MenuItem value="">
            <em>-- Select Technician --</em>
          </MenuItem>
          {technicians.map((t) => (
            <MenuItem key={t._id || t.username} value={t.username}>
              {t.username}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TechnicianDropdown;
