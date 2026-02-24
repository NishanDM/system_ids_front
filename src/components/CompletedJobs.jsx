import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ViewJobModal from './ViewJobModal';
import PrintInvoice from './PrintInvoice';
import { useReactToPrint } from 'react-to-print';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Toolbar,
  Typography,
  Checkbox,
  Tooltip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import PropTypes from 'prop-types';
import { visuallyHidden } from '@mui/utils';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Table head definition
const headCells = [
  { id: 'jobRef', numeric: false, disablePadding: true, label: 'Job Ref' },
  { id: 'customerName', numeric: false, disablePadding: false, label: 'Customer Name' },
  { id: 'customerPhone', numeric: false, disablePadding: false, label: 'Customer Phone' },
  { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
  { id: 'deviceType', numeric: false, disablePadding: false, label: 'Device Type' },
  { id: 'jobProgress', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'technician', numeric: false, disablePadding: false, label: 'Technician' },
  { id: 'actions', numeric: false, disablePadding: false, label: 'Actions' },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all jobs' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected } = props;
  return (
    <Toolbar
      sx={[
        { pl: { sm: 2 }, pr: { xs: 1, sm: 1 } },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          ✅ Completed Jobs
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <Button color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <Button startIcon={<FilterListIcon />}>Filter</Button>
        </Tooltip>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function CompletedJobs() {
  const [jobs, setJobs] = useState([]);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, setDense] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef();

  // Fetch completed jobs
  const fetchCompletedJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/completed`);
      const sorted = res.data
        .filter((job) => job.jobProgress === 'Completed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobs(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = jobs.map((n) => n._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0)
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleView = (job) => setIsViewing(true) || setSelectedJob(job);
  const handlePrintView = (job) => {
    setSelectedJob(job);
    setIsPrinting(true);
    setTimeout(() => handlePrint(), 300);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Invoice',
    onAfterPrint: () => setIsPrinting(false),
  });

  const visibleRows = React.useMemo(
    () =>
      jobs
        .slice()
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [jobs, order, orderBy, page, rowsPerPage],
  );

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} size={dense ? 'small' : 'medium'}>
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={jobs.length}
            />
            <TableBody>
              {visibleRows.map((row) => {
                const isItemSelected = selected.indexOf(row._id) !== -1;
                const labelId = `enhanced-table-checkbox-${row._id}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row._id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row._id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row" padding="none">
                      {row.jobRef}
                    </TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{row.customerPhone}</TableCell>
                    <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{row.deviceType}</TableCell>
                    <TableCell sx={{ color: 'green' }}>{row.jobProgress}</TableCell>
                    <TableCell>{row.technician || '-'}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button size="small" variant="contained" onClick={() => handleView(row)}>
                          View
                        </Button>
                        <Button size="small" variant="outlined" color="warning" onClick={() => handlePrintView(row)}>
                          Print
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={jobs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel control={<Switch checked={dense} onChange={handleChangeDense} />} label="Dense padding" />

      {/* Modals */}
      {isViewing && selectedJob && <ViewJobModal job={selectedJob} onClose={() => setIsViewing(false)} />}
      {isPrinting && selectedJob && <PrintInvoice job={selectedJob} onClose={() => setIsPrinting(false)} printRef={printRef} onPrint={handlePrint} />}
    </Box>
  );
}
