import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box } from '@mui/material';
import TextField from "@mui/material/TextField"; 
import ViewJobModal from './ViewJobModal';
import EditJobModal from "./EditJobModal";
import {  Radio, RadioGroup,FormControlLabel, FormControl, FormLabel} from "@mui/material";

const MyJobsForTechnician = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));
  const [searchQuery, setSearchQuery] = useState('');
  const [progressFilter, setProgressFilter] = useState("all");
  const [refreshMsg, setRefreshMsg] = useState('');
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

const handleRefresh = async () => {
  await fetchJobs();
  setRefreshMsg('JOBS REFRESHED SUCCESSFULLY');
  setTimeout(() => setRefreshMsg(''), 3000); // hide after 3 seconds
};

  // Format dates (handles ISO strings, MongoDB objects, or "YYYY-MM-DD")
  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = typeof date === "object" && date.$date ? date.$date : date;
    const d = new Date(parsedDate);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-US");
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
      const filtered = res.data.filter(job => job.technician === user?.username);

      const sorted = filtered.sort(
        (a, b) => new Date(b.createdAt?.$date || b.createdAt) - new Date(a.createdAt?.$date || a.createdAt)
      );

      setJobs(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user?.username]);

  const handleView = (job) => {
    setSelectedJob(job);
    setIsViewing(true);
  };

  const handleEdit = (job) => {
    setEditData(job);
    setIsEditing(true);
  };

const [open, setOpen] = useState({ open: false, jobRef: "" });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/jobs/${editData._id}`, editData);
      alert('✅ Job updated successfully!');
      setIsEditing(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update job.');
    }
  };

  // Map jobs to DataGrid rows
const rows = jobs
  .filter((job) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      job.jobRef.toLowerCase().includes(query) ||
      `${job.customerPrefix ? job.customerPrefix + " " : ""}${job.customerName}`
        .toLowerCase()
        .includes(query) ||
      job.customerPhone.toLowerCase().includes(query) ||
      (job.series || "").toLowerCase().includes(query) ||
      (job.emei || "").toLowerCase().includes(query) ||
      (job.model || "").toLowerCase().includes(query) ||
      (job.deviceType || "").toLowerCase().includes(query) ||
      (job.capacity || "").toLowerCase().includes(query) ||
      (job.color || "").toLowerCase().includes(query);

    const progress = (job.jobProgress || "").toLowerCase();

const matchesProgress =
  progressFilter === "all" ||
  (progressFilter === "pending" &&
  (progress === "pending" || progress === "just_started")) ||
  (progressFilter === "checking_stage" && progress === progressFilter) ||
  (progressFilter === "completed" && progress === "completed") ||
  (progressFilter === "closed by bill" && progress.startsWith("closed by bill")) ||
  (progressFilter === "hold" && progress === "hold") ||
  (progressFilter === "taken" && progress === "taken") ||
  (progressFilter === "canceled" && progress === "canceled") ||
  (progressFilter === "returned" && (progress === "returned" || progress === "returned & closed"));

    // ✅ DATE FILTER
  const jobDateRaw =
    typeof job.createdAt === "object" && job.createdAt?.$date
      ? job.createdAt.$date
      : job.createdAt;

  const jobDate = new Date(jobDateRaw);
  jobDate.setHours(0, 0, 0, 0);

  let matchesDate = true;

  if (fromDate) {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    matchesDate = matchesDate && jobDate >= from;
  }

  if (toDate) {
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    matchesDate = matchesDate && jobDate <= to;
  }

  return matchesSearch && matchesProgress && matchesDate;
})
  
  //=================================
  .map(job => ({
    id: job._id,
    jobRef: job.jobRef?.replace(/^IDSJBN-/, "") || "",
    customerPrefix: job.customerPrefix,
    customerName: `${job.customerPrefix ? job.customerPrefix + ' ' : ''}${job.customerName}`,
    createdAt: formatDate(job.createdAt),
    customerPhone: job.customerPhone,
    
    faults: Array.isArray(job.faults)
      ? job.faults.filter(Boolean).join(" | ")
      : "",
    // 👇 ADD THIS
  fullDeviceInfo: [
    job.model,
    job.deviceType,
    job.series,
    job.emei
  ].filter(Boolean).join(" | "), // remove empty and join nicely
    // ✅ NEW FIELD
  techNotes: Array.isArray(job.repaired_accessories)
    ? job.repaired_accessories.join(" | ")
    : (job.repaired_accessories || ""),
    status: job.status,
    progress: job.jobProgress || '-',
    createdBy: job.createdBy,
    jobObj: job, // full job object for actions
  }));

  const columns = [
    { field: 'jobRef', headerName: 'Job Ref', width: 100 },
    { field: 'customerName', headerName: 'Customer Name', width: 250 },
    { field: 'customerPhone', headerName: 'Phone', width: 110 },
    { field: 'createdAt', headerName: 'Created Date', width: 120 },
    { field: 'fullDeviceInfo', headerName: 'Device Details', width: 460 },
    { field: 'faults', headerName: 'Faults', width: 400 },
    {
      field: 'techNotes',
      headerName: 'Tech Notes',
      width: 350,
      renderCell: (params) => (
        <span style={{ whiteSpace: "normal", lineHeight: "1.2" }}>
          {params.value}
        </span>
      )
    },

    // { field: 'status', headerName: 'Status', width: 90 },
    { field: 'progress', headerName: 'Progress', width: 190 },
    // { field: 'createdBy', headerName: 'Created By', width: 130 },
    
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const job = params.row.jobObj;
        const isClosed =
  job.jobProgress &&
  (
    job.jobProgress.toLowerCase().includes("closed by bill") ||
    job.jobProgress.toLowerCase() === "returned" ||
    job.jobProgress.toLowerCase() === "returned & closed"
  );

        return (
          <Box display="flex" gap={1} padding={1}>
            <Button
              variant="contained"
              size="small"
              sx={{
                            mt: 0,
                            mb: 0.7,
                            padding: "2px 6px",
                            fontSize: "0.8rem",
                            minWidth: "0",
                            lineHeight: 1.2,
                          }}
              onClick={() => handleView(job)}
            >
              View
            </Button>
            <Button
                          variant="contained"
                          size="small"
                          color="error"
                          disabled={isClosed}
                          onClick={() => handleEdit(job)}
                          sx={{
                            mt: 0,
                            mb: 0.7,
                            padding: "2px 6px",
                            fontSize: "0.8rem",
                            minWidth: "0",
                            lineHeight: 1.2,
                          }}
                        >
                          Edit
                        </Button>
          </Box>
        );
      },
    },
  ];

  const getRowColor = (p) => {
  if (!p) return "inherit";
  const progress = p.toLowerCase().trim();

  if (progress === "completed") return "rgba(144, 238, 144, 0.3)"; // light green
  if (progress.startsWith("closed by bill")) return "rgba(224, 255, 255, 0.6)"; // very light cyan
  if (progress === "canceled" || progress === "returned" || progress === "returned & closed")
    return "rgba(255, 182, 193, 0.3)"; // light pink
  if (progress === "hold" || progress === "taken" ) return "rgba(255, 255, 204, 0.5)"; // light yellow
  if (progress === "just_started" || progress === "pending" || progress === "Checking_Stage") return "inherit";

  return "inherit";
};
useEffect(() => {
  // Remove old dynamic styles to avoid duplicates
  const oldStyles = document.querySelectorAll("style[data-row-style]");
  oldStyles.forEach(s => s.remove());

  jobs.forEach(job => {
    const color = getRowColor(job.jobProgress);
    const style = document.createElement("style");
    style.dataset.rowStyle = job._id;
    style.innerHTML = `
      .row-${job._id} {
        background-color: ${color} !important;
      }
    `;
    document.head.appendChild(style);
  });
}, [jobs]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
   <Button
    variant="contained"
    size="small"
    onClick={handleRefresh}
    sx={{ height: 30, minWidth: 80 }}
  >
    Refresh
  </Button>
        {refreshMsg && (
      <span className="text-green-700 font-medium">{refreshMsg}</span>
    )}
</div>
<FormControl component="fieldset" sx={{ mb: 2 }}>
  <FormLabel component="legend">Filter by Job Progress</FormLabel>
  <RadioGroup
    row
    value={progressFilter}
    onChange={(e) => setProgressFilter(e.target.value)}
  >
    <FormControlLabel value="all" control={<Radio />} label="All" />
    <FormControlLabel value="checking_stage" control={<Radio />} label="Completed & Checking" />
    <FormControlLabel value="completed" control={<Radio />} label="Completed" />
    <FormControlLabel value="closed by bill" control={<Radio />} label="Finished & Billed" />
    <FormControlLabel value="pending" control={<Radio />} label="Pending" />
    <FormControlLabel value="hold" control={<Radio />} label="Hold" />
    <FormControlLabel value="taken" control={<Radio />} label="Taken" />
    <FormControlLabel value="canceled" control={<Radio />} label="Canceled" />
    <FormControlLabel value="returned" control={<Radio />} label="Returned & Closed" />
  </RadioGroup>
</FormControl>

<Box display="flex" gap={2} mb={2}>
  <TextField
    label="From Date"
    type="date"
    size="small"
    InputLabelProps={{ shrink: true }}
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
  />

  <TextField
    label="To Date"
    type="date"
    size="small"
    InputLabelProps={{ shrink: true }}
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
  />

  <Button
    variant="outlined"
    size="small"
    onClick={() => {
      setFromDate("");
      setToDate("");
    }}
  >
    Clear Dates
  </Button>
</Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        size="small"
        label="Search by Job Ref, Customer Name, Phone, Serial, EMEI, Model or Type"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
         sx={{
    mb: 2,
    "& .MuiInputBase-input": {
      padding: "6px 10px",   // ↓ smaller height
    },
    "& .MuiInputLabel-root": {
      top: "-4px",           // adjust label position slightly
    }
  }}
      />
      <Paper sx={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[20, 50, 100]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 20 } } }}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{ border: 0 }}
          rowHeight={36}
          headerHeight={40}
            getRowClassName={(params) => {
    const color = getRowColor(params.row.progress);
    return color ? `row-${params.id}` : "";
  }}
        />

      </Paper>

      {isViewing && selectedJob && (
        <ViewJobModal job={selectedJob} onClose={() => setIsViewing(false)} />
      )}
{isEditing && (
        <EditJobModal
          editData={editData}
          setEditData={setEditData}
          onClose={() => setIsEditing(false)}
          onSubmit={handleEditSubmit}
          refreshJobs={handleRefresh} 
        />
      )}
    </div>
  );
};

export default MyJobsForTechnician;
