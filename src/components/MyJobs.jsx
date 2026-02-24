import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import ViewJobModal from './ViewJobModal';
import EditJobModal from './EditJobModal';
import { Button, Box, TextField, RadioGroup, FormControlLabel, Radio, FormLabel } from '@mui/material';
import JobEdit from "./JobEdit";

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [progressFilter, setProgressFilter] = useState("All");
  const [openJobEditModal, setOpenJobEditModal] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
      const filtered = res.data.filter(job => job.createdBy === user?.username);
      const sorted = filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setJobs(sorted);
      showSnackbar("Jobs table refreshed successfully");
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

  // -----------------------------
  // FILTERING LOGIC
  // -----------------------------
const filteredJobs = jobs.filter(job => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    (job.customerName || "").toLowerCase().includes(search) ||
    (job.jobRef || "").toLowerCase().includes(search) ||
    (job.customerPhone || "").toLowerCase().includes(search) ||
    (job.model || "").toLowerCase().includes(search) ||
    (job.technician || "").toLowerCase().includes(search);

  // Normalize jobProgress
  const progress = (job.jobProgress || "").trim();

  // Handle exact matches and prefix matches
  const matchesProgress =
    progressFilter === "All" ||
    progress === progressFilter ||              // exact match
    progress.startsWith(progressFilter);        // prefix match (e.g., Closed By Bill - IDxxxxx)

  return matchesSearch && matchesProgress;
});


  // Map jobs to DataGrid rows
  const rows = filteredJobs.map((job) => ({
    id: job._id,
    jobRef: job.jobRef,
    customerPrefix: job.customerPrefix,
    customerName: `${job.customerPrefix ? job.customerPrefix + ' ' : ''}${job.customerName}`,
    customerPhone: job.customerPhone,
    createdAt: new Date(job.createdAt).toLocaleDateString(),
    model: [job.deviceType,job.model, job.series, job.emei].filter(Boolean).join(' | '),
    status: job.status,
    progress: job.jobProgress || '-',
    technician: job.technician || '-',
    issue: Array.isArray(job.faults) ? job.faults.join(' | ') : '-',
    jobObj: job,
  }));

  const columns = [
    { field: 'jobRef', headerName: 'Job Ref', width: 160 },
    { field: 'customerName', headerName: 'Customer Name', width: 250 },
    { field: 'customerPhone', headerName: 'Customer Phone', width: 130 },
    { field: 'createdAt', headerName: 'Created Date', width: 110 },
    { field: 'model', headerName: 'Model', width: 400 },
    { field: 'issue', headerName: 'Issues', width: 400 },
    { field: 'status', headerName: 'Status', width: 110 },
    { field: 'progress', headerName: 'Progress', width: 200 },
    { field: 'technician', headerName: 'Technician', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
        align: 'center',            // <-- Centers cell content
  headerAlign: 'center',      // <-- Centers column header
      renderCell: (params) => {
        const job = params.row.jobObj;

  // Disable condition
  const progress = (job.jobProgress || "").toLowerCase().trim();
  const isClosed =
    progress === "completed" || progress.startsWith("closed by bill");

return (
          <Box display="flex" 
          gap={1}
          justifyContent="center"   // <-- Center horizontally
        alignItems="center"       // <-- Center vertically
        width="100%"              // <-- Ensures full cell width
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => handleView(job)}
              sx={{
                mt: 1,
                padding: "2px 6px",
                fontSize: "0.8rem",
                minWidth: "0",
                lineHeight: 1.2,
              }}
            >
              View
            </Button>
            <Button
              variant="contained"
              size="small"
              color="error"
              disabled={isClosed}
              onClick={() => !isClosed && handleEdit(job)}
              sx={{
                mt: 1,
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
  if (progress === "canceled" || progress === "returned")
    return "rgba(255, 182, 193, 0.3)"; // light pink
  if (progress === "hold") return "rgba(255, 255, 204, 0.5)"; // light yellow
  if (progress === "Waiting For Parts" || progress === "waiting for parts") return "rgba(255, 255, 204, 0.5)";
  if (progress === "just_started" || progress === "pending") return "inherit";

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
     

      {/* ---------------- RADIO FILTER ---------------- */}
      <Box mb={2}>


        <RadioGroup
          row
          value={progressFilter}
          onChange={(e) => setProgressFilter(e.target.value)}
        >
          <FormControlLabel value="All" control={<Radio />} label="All" />
          <FormControlLabel value="Just_started" control={<Radio />} label="Pending & Just Started" />
          <FormControlLabel value="Hold" control={<Radio />} label="Hold" />
          <FormControlLabel value="Waiting For Parts" control={<Radio />} label="Waiting For Parts" />
          <FormControlLabel value="Returned" control={<Radio />} label="Returned" />
          <FormControlLabel value="Closed By Bill" control={<Radio />} label="Finished" /> 
          <FormControlLabel value="Canceled" control={<Radio />} label="Canceled" />
           <FormControlLabel value="Completed" control={<Radio />} label="Completed" />
           <Button onClick={() => setOpenJobEditModal(true)} variant="contained" size="small" sx={{ mr: 1, fontSize: "0.8rem", minWidth: "0", lineHeight: 1.2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>Job Edit Manual</Button>
           <Button  onClick={fetchJobs} variant="contained" size="small" sx={{ fontSize: "0.8rem", minWidth: "0", lineHeight: 1.2, backgroundColor: '#9c27b0', '&:hover': { backgroundColor: '#7b1fa2' } }}  >REFRESH</Button>
        </RadioGroup>
      </Box>

      {/* ---------------- SEARCH BAR ---------------- */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          label="Search by Name, Job Ref, Phone, Model, Technician..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
                   sx={{
                    mb: 2,
                    "& .MuiInputBase-input": {
                      padding: "6px 10px",   // ↓ smaller height
                    },
                    "& .MuiInputLabel-root": {
                      top: "-4px",           // adjust label position slightly
                    }
                  }}   />
     
      </Box>

      {/* ---------------- DATA GRID ---------------- */}
      <Paper sx={{ height: 700, width: '100%' }}>
        <DataGrid
  rows={rows}
  columns={columns}
  pageSizeOptions={[20, 50, 100]}
  initialState={{
    pagination: { paginationModel: { page: 0, pageSize: 20 } },
  }}
  checkboxSelection
  disableRowSelectionOnClick
  sx={{ 
    border: 0,
    "& .super-app-row": {
      // default row styling (optional)
    }
  }}
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
        />
      )}
{openJobEditModal && (
        <JobEdit onClose={() => setOpenJobEditModal(false)} />
      )}

    </div>
  );
};

export default MyJobs;
