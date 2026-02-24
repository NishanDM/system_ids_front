import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Button, TextField, Snackbar } from '@mui/material';
import ViewJobModal from './ViewJobModal';
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";


import MakeBillForJob from './MakeBillForJob';
import JobEdit from "./JobEdit";
import EditJobModal from './EditJobModal';

export default function AllJobsForAccountant() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [progressFilter, setProgressFilter] = useState('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openManualJobEdit, setOpenManualJobEdit] = useState(false);
  const [openEditJobModal, setOpenEditJobModal] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const resetSelectedRow = () => {
  setSelectedRowId(null);
};

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setJobs(sorted);
      showSnackbar("ALL JOBS REFRESHED SUCCESSFULLY");
      resetSelectedRow();
    } catch (err) {
      console.error(err);
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleView = (job) => {
    setSelectedJob(job);
    setIsViewing(true);
  };

    const handleViewForEdit = (job) => {
    setSelectedJob(job);
    setIsViewing(true);
  };

  const showSnackbar = (message) => {
  setSnackbarMessage(message);
  setSnackbarOpen(true);
};

const handleRowRightClick = (event, job) => {
  event.preventDefault(); // IMPORTANT: disable browser menu

  setSelectedRowId(job._id); // keep your row highlight behavior

  setContextMenu({
    mouseX: event.clientX + 2,
    mouseY: event.clientY - 6,
    job,
  });
};

const handleCloseContextMenu = () => {
  setContextMenu(null);
};

  
  //================================= OPEN THE BILL MODAL  ==============================
  // Inside AllJobs component, near the other useState hooks:
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedJobForBilling, setSelectedJobForBilling] = useState(null);

// Function to open the Bill modal
const openMakeBillForJobModal = (job) => {
  setSelectedJobForBilling(job);
  setIsModalOpen(true);
    // Log full job details to the console
  console.log("Selected Job for Billing:", JSON.stringify(job, null, 2));
};

// Function to close the Bill modal
const closeMakeBillForJobModal = () => {
  setSelectedJobForBilling(null);
  setIsModalOpen(false);
};


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const columns = [
    { id: 'jobRef', label: 'IDSJBN', minWidth: 60 },
    { id: 'date', label: 'Date', minWidth: 60, format: (value) => value || "-" },
    { id: 'customerName', label: 'Cust: Name', minWidth: 130 },
    { id: 'customerPhone', label: 'Phone', minWidth: 70 },
    // { id: 'createdAt', label: 'Date', minWidth: 70, format: (value) => new Date(value).toLocaleDateString(), },
    { id: 'model', label: 'Model', minWidth: 100 },
    { id: 'issues', label: 'Issues', minWidth: 100 },
    // { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'jobProgress', label: 'Progress', minWidth: 80, format: (value) => value || '-' },
    { id: 'technician', label: 'Technician', minWidth: 90, format: (value) => value || '-' },
    { id: 'actions', label: 'Actions', minWidth: 140 },
  ];


  // ===================== PRINT THE JOB AS A PDF ============================
// ---- PDF GENERATOR FUNCTION ----
const generateJobPDF = (data, billNumber) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5", // 210 × 148 mm
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const columnGap = 5;
  const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;

  const addTextLine = (
    text,
    x,
    y,
    maxWidth,
    fontSize = 7,
    fontStyle = "normal"
  ) => {
    doc.setFont("Helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.text(text, x, y, { maxWidth });
  };

  /* =====================================================
     PAGE 1 – CUSTOMER COPY
     ===================================================== */
  const drawCustomerPage = () => {
    let leftY = margin;
    let rightY = margin;
    const leftX = margin;
    const rightX = margin + columnWidth + columnGap;

    addTextLine(
      "i Device Solutions - JOB - NOTE (Customer Copy)",
      leftX,
      leftY,
      columnWidth,
      10,
      "bold"
    );
    leftY += 6;

    // Header right
    addTextLine("Invoice", rightX, rightY, columnWidth, 10, "bold");
    rightY += 6;
    // 🔽 SHOP DETAILS (NEW)
    addTextLine(
      "No.363, Galle Rd, Colombo 06",
      rightX,
      rightY,
      columnWidth,
      8
    );
    rightY += 4;

    addTextLine(
      "Hotline - 0777 142 402 / 0777 142 502 / 0112 500 990",
      rightX,
      rightY,
      columnWidth,
      8
    );
    rightY += 6;
    addTextLine(data.jobRef, rightX, rightY, columnWidth, 9, "bold");
    rightY += 5;

    // Left column
    const leftContent = [
      ["Job Number", data.jobRef],
      ["Created Date", data.createdDate],
      ["Created By", data.createdBy],
      ["Customer Name", `${data.customerPrefix || ""} ${data.customerName || ""}`],
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
      ["Status", data.status],
      ["Under Warranty", data.underWarranty],
    ];

    rightContent.forEach(([label, value]) => {
      addTextLine(`${label}: ${value || "-"}`, rightX, rightY, columnWidth);
      rightY += 5;
    });

    // Customer reported
    if (data.customer_reported?.length) {
      addTextLine("Customer Reported:", rightX, rightY, columnWidth, 7, "bold");
      rightY += 4;
      data.customer_reported.forEach((item) => {
        addTextLine(`- ${item}`, rightX + 2, rightY, columnWidth - 2);
        rightY += 4;
      });
    }

    // Faults
    if (data.faults?.length) {
      rightY += 4;
      addTextLine("Faults Mentioned:", rightX, rightY, columnWidth, 7, "bold");
      rightY += 4;
      data.faults.forEach((fault) => {
        addTextLine(`- ${fault}`, rightX + 2, rightY, columnWidth - 2);
        rightY += 4;
      });
    }

    // Remarks
    rightY += 4;
    addTextLine("Remarks:", rightX, rightY, columnWidth, 7, "bold");
    rightY += 4;
    addTextLine(data.remarks || "-", rightX + 2, rightY, columnWidth);

    // Terms
    let termsY = Math.max(leftY, rightY) + 6;
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
    const signY = termsY + 10;
    addTextLine("Authorized: ........................................", leftX, signY, 80);
    addTextLine("Customer: ............................................", rightX, signY, 80);
  };

  /* =====================================================
     PAGE 2 – TECHNICIAN COPY
     ===================================================== */
  const drawTechnicianPage = () => {
    doc.addPage("a5", "landscape");

    let leftY = margin;
    let rightY = margin;
    const leftX = margin;
    const rightX = margin + columnWidth + columnGap;

    addTextLine(
      "IDS - JOB - NOTE (Technician Copy)",
      leftX,
      leftY,
      columnWidth,
      10,
      "bold"
    );
    leftY += 6;

    addTextLine("Invoice", rightX, rightY, columnWidth, 10, "bold");
    rightY += 6;
    addTextLine(data.jobRef, rightX, rightY, columnWidth, 9);
    rightY += 5;

    const leftContent = [
      ["Job Ref", data.jobRef],
      ["Customer Name", `${data.customerPrefix || ""} ${data.customerName || ""}`],
      ["Phone", data.customerPhone],
      ["Device Type", data.deviceType],
      ["Model", data.model],
      ["Serial No", data.series],
      ["IMEI", data.emei],
    ];

    leftContent.forEach(([label, value]) => {
      addTextLine(`${label}: ${value || "-"}`, leftX, leftY, columnWidth);
      leftY += 5;
    });

    const rightContent = [
      ["Technician", data.technician],
      ["Status", data.status],
    ];

    rightContent.forEach(([label, value]) => {
      addTextLine(`${label}: ${value || "-"}`, rightX, rightY, columnWidth);
      rightY += 5;
    });

    // 🔽 ADD THESE FIELDS BELOW TECHNICIAN & STATUS

// Warranty
addTextLine(
  `Under Warranty: ${data.underWarranty || "-"}`,
  rightX,
  rightY,
  columnWidth
);
rightY += 5;

// Customer Reported
if (data.customer_reported?.length) {
  addTextLine("Customer Reported:", rightX, rightY, columnWidth, 7, "bold");
  rightY += 4;

  data.customer_reported.forEach((item) => {
    addTextLine(`- ${item}`, rightX + 2, rightY, columnWidth - 2);
    rightY += 4;
  });
}

// Faults Found
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
rightY += 10;

    // Notes box
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

    doc.rect(leftX, boxY, boxWidth, boxHeight);

    addTextLine(
      "Tech Sign: .................................................",
      leftX,
      boxY + boxHeight + 10,
      100,
      8
    );
  };

  /* =====================================================
     RENDER BOTH PAGES
     ===================================================== */
  drawCustomerPage();
  drawTechnicianPage();

  // Filename
  const safeName = (data.jobRef || billNumber || "JobNote").replace(
    /[^a-zA-Z0-9-_]/g,
    "_"
  );
  const fileName = `${safeName}.pdf`;

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


const filteredJobs = jobs.filter((job) => {
  const query = searchQuery.toLowerCase();

  const matchesSearch =
  job.jobRef.toLowerCase().includes(query) ||
  `${job.customerPrefix ? job.customerPrefix + " " : ""}${job.customerName}`
    .toLowerCase()
    .includes(query) ||
  job.customerPhone.toLowerCase().includes(query) ||
  (job.series || "").toLowerCase().includes(query) ||      // Serial number
  (job.emei || "").toLowerCase().includes(query) ||        // IMEI
  (job.model || "").toLowerCase().includes(query) ||       // Model
  (job.deviceType || "").toLowerCase().includes(query) ||  // Device Type (iPhone, iPad, etc)
  (job.capacity || "").toLowerCase().includes(query) ||    // Storage capacity
  (job.color || "").toLowerCase().includes(query);         // Color


  // Normalize jobProgress
  const progress = job.jobProgress?.toLowerCase() || "";

  // Handle progress filter conditions
  const matchesProgress =
    progressFilter === "all" ||
    (progressFilter === "Just_started" &&
      (progress.includes("pending") || progress.includes("just_started"))) ||
    (progressFilter === "Closed By Bill" &&
      progress.startsWith("closed by bill")) ||
    (progressFilter === "Hold" && progress === "hold") ||
    (progressFilter === "Waiting For Parts" && progress === "waiting for parts") ||
    (progressFilter === "Returned" && progress === "returned") ||
    (progressFilter === "Completed" && progress === "completed") ||
    (progressFilter === "Canceled" && progress === "canceled");

  return matchesSearch && matchesProgress;
});


// ---- PRINT HANDLER ----
const handlePrint = (job) => {
  if (!job) return;

  const now = new Date();
  const billNumber = `IDSBN-${now.getMonth() + 1}-${now.getFullYear()}-${Math.floor(
    Math.random() * 900 + 100
  )}`;

  const data = {
    jobRef: job.jobRef || "-",
    createdDate: job.createdAt
      ? new Date(job.createdAt).toLocaleDateString()
      : "-",
    createdBy: job.createdBy || "-",
    customerPrefix: job.customerPrefix || "",
    customerName: job.customerName || "-",
    customerPhone: job.customerPhone || "-",

    deviceType: job.deviceType || "-",
    model: job.model || "-",
    series: job.series || "-",
    emei: job.emei || "-",
    capacity: job.capacity || "-",
    color: job.color || "-",
    passcode: job.passcode || "-",

    technician: job.technician || "-",
    status: job.status || "-",
    underWarranty: job.underWarranty || "-",

    customer_reported: Array.isArray(job.customer_reported)
      ? job.customer_reported
      : [],

    faults: Array.isArray(job.faults)
      ? job.faults
      : [],

    remarks: job.remarks || "-",
  };

  generateJobPDF(data, billNumber);
};


const getRowColor = (progress = "") => {
  const p = progress.toLowerCase();

  if (p === "completed") return "rgba(144, 238, 144, 0.3)"; // light green
  if (p.startsWith("closed by bill")) return "rgba(224, 255, 255, 0.6)"; // very light cyan
  if (p === "canceled" || p === "returned") return "rgba(255, 182, 193, 0.3)"; // very light red/pink
  if (p === "hold") return "rgba(255, 255, 204, 0.5)"; // very light yellow
  if (p === "just_started" || p === "pending") return "inherit"; // no special color

  return "inherit";
};

const copyJobRefNumber = (job) => {
  if (!job?.jobRef) {
    showSnackbar("Job reference not found");
    return;
  }

  // Remove IDSJBN- prefix ONLY
  const cleanJobRef = job.jobRef.replace(/^IDSJBN-/, "");

  navigator.clipboard
    .writeText(cleanJobRef)
    .then(() => {
      showSnackbar(`Copied Job No: ${cleanJobRef}`);
    })
    .catch(() => {
      showSnackbar("Failed to copy job number");
    });
};


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
      

        {/* Progress Filter */}
<div style={{ margin: "4px 0" }}>
 

  <RadioGroup row value={progressFilter}  onChange={(e) => setProgressFilter(e.target.value)} >
    <FormControlLabel value="all" control={<Radio />} label="All"/>
    <FormControlLabel value="Just_started" control={<Radio />} label="Pending & Just Started" />
    <FormControlLabel value="Closed By Bill" control={<Radio />} label="Finished" />    
    <FormControlLabel value="Hold" control={<Radio />} label="Hold" />
    <FormControlLabel value="Waiting For Parts" control={<Radio />} label="Waiting For Parts" />
    <FormControlLabel value="Returned" control={<Radio />} label="Returned" />
    <FormControlLabel value="Canceled" control={<Radio />} label="Canceled" />
    <FormControlLabel value="Completed" control={<Radio />} label="Completed" />
    <Button onClick={() => setOpenManualJobEdit(true)} variant="contained" size="small" sx={{ mr: 1, fontSize: "0.8rem", minWidth: "0", lineHeight: 1.2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>Job Edit Manual</Button>
    <Button  onClick={fetchJobs} variant="contained" size="small" sx={{ fontSize: "0.8rem", minWidth: "0", lineHeight: 1.2, backgroundColor: '#9c27b0', '&:hover': { backgroundColor: '#7b1fa2' } }}  >REFRESH</Button>
  </RadioGroup>
</div>
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

      {loading && <p>Loading jobs...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && filteredJobs.length > 0 && (
        <>


          <TableContainer sx={{ maxHeight: 800 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ minWidth: column.minWidth }}
                      align={column.align}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((job) => (
                    <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={job._id}
                          onClick={() => setSelectedRowId(job._id)}  // mark clicked row
                          onContextMenu={(e) => handleRowRightClick(e, job)}   // ✅ ADD THIS
                          sx={{
                            backgroundColor: selectedRowId === job._id 
                              ? "rgba(255, 152, 0, 0.5)"  // highlight color for selected row
                              : getRowColor(job.jobProgress),
                            '&:hover': {
                                  backgroundColor: "rgba(255, 235, 59, 0.5)", // same as selected color
                                  cursor: 'pointer',
                                },
                            "& .MuiTableCell-root": {
                              padding: "4px 8px",
                              fontSize: "0.8rem",
                              lineHeight: "1.1rem",
                            },

                            ...(searchQuery &&
                              (job.jobRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                `${job.customerPrefix ? job.customerPrefix + ' ' : ''}${job.customerName}`
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                job.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()))
                                ? { backgroundColor: "rgba(255, 235, 59, 0.3)" }
                                : {}
                            )
                          }}
                        >

                      {columns.map((column) => {
                        if (column.id === 'actions') {
                          const progress = (job.jobProgress || "").toLowerCase().trim();
                          const isClosed = progress === "completed" || progress.startsWith("closed by bill");
                          return (
                            <TableCell key={column.id}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleView(job)}
                                      sx={{ 
                                        mr: 1, 
                                        fontSize: "0.8rem",
                                        minWidth: "0",
                                        lineHeight: 1.2,
                                        backgroundColor: '#1976d2', 
                                        '&:hover': { backgroundColor: '#1565c0' } 
                                      }}
                                    >
                                      View
                                    </Button>

                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handlePrint(job)}
                                      sx={{ 
                                        mr: 1,
                                        fontSize: "0.8rem",
                                        minWidth: "0",
                                         lineHeight: 1.2,
                                        backgroundColor: '#2e7d32',   // Green
                                        '&:hover': { backgroundColor: '#1b5e20' } 
                                      }}
                                    >
                                      Print
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                          setSelectedJobForEdit(job);
                                          setOpenEditJobModal(true);
                                        }}
                                        disabled={isClosed} // disables the button if job is completed/closed
                                        sx={{ 
                                          mr: 1, 
                                          fontSize: "0.8rem",
                                          minWidth: "0",
                                          lineHeight: 1.2,
                                          backgroundColor: "#f5f5f5", // very light gray for enabled
                                          color: "#000000",            // black text
                                          '&:hover': { 
                                            backgroundColor: "#ffe5b4" // slightly darker gray on hover
                                          } 
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    <Button
                                      variant="contained"
                                      size="small"
                                        onClick={() => {
                                          if ((job.jobProgress || "").toLowerCase() === "completed") {
                                            openMakeBillForJobModal(job);
                                          } else {
                                            showSnackbar("Cannot make a bill yet. Please update the job progress into COMPLETED");
                                          }
                                        }}
                                      sx={{ 
                                          fontSize: "0.8rem",
                                          minWidth: "0",
                                          lineHeight: 1.2,
                                          backgroundColor: '#d32f2f',   // Red
                                          '&:hover': { backgroundColor: '#b71c1c' } // Darker red on hover
                                        }}
                                    >
                                      Bill
                                    </Button>
                                  </TableCell>
                          );
                        }

                      let value;
                        if (column.id === "customerName") {
                          value = `${job.customerPrefix ? job.customerPrefix + " " : ""}${job.customerName}`;
                        } 
                        else if (column.id === "model") {
                          value = [
                            job.deviceType || "-",
                            job.model || "-",
                            job.series || "-",
                            job.emei || "-"
                          ].join(" | ");
                        } 
                        else if (column.id === "issues") {
                          value = Array.isArray(job.faults) && job.faults.length > 0 ? job.faults.join(", ") : "-";
                        } 
                        else if (column.id === "jobRef") {
                          // Remove "IDSJBN-" prefix if exists
                          value = job.jobRef?.replace(/^IDSJBN-/, "") || "-";
                        }
                        else if (column.id === "date") {
                          value = job.createdAt
                            ? new Date(job.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              })
                            : "-";
                        }

                        else {
                          value = job[column.id];
                        }
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && value !== undefined ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[20, 40, 100]}
            component="div"
            count={filteredJobs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {isViewing && selectedJob && (
        <ViewJobModal job={selectedJob} onClose={() => setIsViewing(false)} />
      )}
{openEditJobModal && selectedJobForEdit && (
  <EditJobModal
    editData={selectedJobForEdit}
    setEditData={setSelectedJobForEdit}
    onClose={() => setOpenEditJobModal(false)}
    onJobUpdated={fetchJobs}
  />
)}

      {/* Bill Modal */}
<MakeBillForJob    open={isModalOpen}    onClose={closeMakeBillForJobModal}    job={selectedJobForBilling}  />
<Snackbar
  open={snackbarOpen}
  autoHideDuration={3000} // 3 seconds
  onClose={() => setSnackbarOpen(false)}
  message={snackbarMessage}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
/>
{openManualJobEdit && (
        <JobEdit onClose={() => setOpenManualJobEdit(false)} />
      )}

<Menu
  open={Boolean(contextMenu)}
  onClose={handleCloseContextMenu}
  anchorReference="anchorPosition"
  anchorPosition={
    contextMenu
      ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
      : undefined
  }
>
  <MenuItem
    onClick={() => {
      handleView(contextMenu.job);
      handleCloseContextMenu();
    }}
  >
    <ListItemIcon>
      <VisibilityIcon fontSize="small" />
    </ListItemIcon>
    View Job
  </MenuItem>

  <MenuItem
    onClick={() => {
      handlePrint(contextMenu.job);
      handleCloseContextMenu();
    }}
  >
    <ListItemIcon>
      <PrintIcon fontSize="small" />
    </ListItemIcon>
    Print Job
  </MenuItem>

  <MenuItem
    disabled={
      ["completed", "closed by bill"].some(v =>
        (contextMenu?.job?.jobProgress || "").toLowerCase().startsWith(v)
      )
    }
    onClick={() => {
      setSelectedJobForEdit(contextMenu.job);
      setOpenEditJobModal(true);
      handleCloseContextMenu();
    }}
  >
    <ListItemIcon>
      <EditIcon fontSize="small" />
    </ListItemIcon>
    Edit Job
  </MenuItem>

  <MenuItem
    onClick={() => {
      if ((contextMenu.job.jobProgress || "").toLowerCase() === "completed") {
        openMakeBillForJobModal(contextMenu.job);
      } else {
        showSnackbar(
          "Cannot make a bill yet. Please update the job progress into COMPLETED"
        );
      }
      handleCloseContextMenu();
    }}
  >
    <ListItemIcon>
      <ReceiptIcon fontSize="small" />
    </ListItemIcon>
    Make Bill
  </MenuItem>

  <MenuItem
  onClick={() => {
    copyJobRefNumber(contextMenu.job);
    handleCloseContextMenu();
  }}
>
  <ListItemIcon>
    <ContentCopyIcon fontSize="small" />
  </ListItemIcon>
  Copy Job No
</MenuItem>

</Menu>


    </Paper>
  );
}
