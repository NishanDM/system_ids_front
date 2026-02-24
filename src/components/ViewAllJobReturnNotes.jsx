import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ViewAllJobReturnNotes({ open, onClose }) {
  const [returnNotes, setReturnNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchReturnNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/job-return-notes`);
      setReturnNotes(res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ));
    } catch (err) {
      console.error("Failed to fetch job return notes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchReturnNotes();
  }, [open]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredNotes = returnNotes.filter((note) => {
    const jobRefMatch = note.jobRef.toLowerCase().includes(searchQuery.toLowerCase());
    let dateMatch = true;

    if (fromDate) {
      dateMatch = new Date(note.returnNoteDate) >= new Date(fromDate);
    }
    if (dateMatch && toDate) {
      dateMatch = new Date(note.returnNoteDate) <= new Date(toDate);
    }

    return jobRefMatch && dateMatch;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Job Return Notes
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent>
        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search by Job Ref"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
          <Button onClick={() => { setFromDate(""); setToDate(""); setSearchQuery(""); }} size="small" variant="outlined">
            Clear Filters
          </Button>
        </Box>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Ref</TableCell>
                    <TableCell>Return Note Date</TableCell>
                    <TableCell>Note Creator</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNotes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((note) => (
                      <TableRow
                        key={note._id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => setSelectedNote(note)}
                      >
                        <TableCell>{note.jobRef}</TableCell>
                        <TableCell>{note.returnNoteDate}</TableCell>
                        <TableCell>{note.returnNoteCreator}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              count={filteredNotes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        {/* Popup for selected note */}
        {selectedNote && (
          <Paper
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              p: 3,
              minWidth: 300,
              maxWidth: 600,
              maxHeight: "80vh",
              overflowY: "auto",
              zIndex: 2000,
              border: "1px solid #ccc",
              boxShadow: 24,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">Job Return Note</Typography>
              <IconButton onClick={() => setSelectedNote(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Typography><strong>Job Ref:</strong> {selectedNote.jobRef}</Typography>
            <Typography><strong>Return Date:</strong> {selectedNote.returnNoteDate}</Typography>
            <Typography><strong>Note Creator:</strong> {selectedNote.returnNoteCreator}</Typography>
            <Typography><strong>Customer Reported:</strong> {selectedNote.customer_reported?.join(", ") || "-"}</Typography>
            <Typography><strong>Faults:</strong> {selectedNote.faults?.join(", ") || "-"}</Typography>
            <Typography><strong>Technician:</strong> {selectedNote.technician || "-"}</Typography>
            <Typography><strong>Status:</strong> {selectedNote.status || "-"}</Typography>
            <Typography><strong>Progress:</strong> {selectedNote.jobProgress || "-"}</Typography>
            <Typography><strong>Device:</strong> {selectedNote.deviceType} | {selectedNote.model} | {selectedNote.series} | {selectedNote.emei}</Typography>
            <Typography><strong>Color:</strong> {selectedNote.color || "-"}</Typography>
            <Typography><strong>Capacity:</strong> {selectedNote.capacity || "-"}</Typography>
            <Typography><strong>Remarks:</strong> {selectedNote.remarks || "-"}</Typography>
          </Paper>
        )}
      </DialogContent>
    </Dialog>
  );
}
