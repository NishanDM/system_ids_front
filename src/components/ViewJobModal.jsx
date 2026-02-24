import React from "react";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const modalStyle =
  "fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm";

const boxStyle =
  "relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6";

const ViewJobModal = ({ job, onClose }) => {
  if (!job) return null;

  const renderField = (label, value) => (
    <div className="p-2 bg-gray-50 rounded">
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-sm font-semibold">{value ?? "-"}</p>
    </div>
  );

  const renderFullWidthField = (label, value) => (
    <div className="mb-3 p-2 bg-gray-50 rounded">
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-sm font-semibold">{value ?? "-"}</p>
    </div>
  );

  const renderGridSection = (fields) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f, i) => renderField(f.label, f.value))}
    </div>
  );

  // helper: render array as numbered list
  const renderArrayField = (label, arr) => (
    <div className="mb-3 p-2 bg-gray-50 rounded">
      <p className="text-xs font-medium text-gray-600">{label}</p>
      {Array.isArray(arr) && arr.length > 0 ? (
        <ol className="list-decimal list-inside text-sm font-semibold">
          {arr.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm font-semibold">-</p>
      )}
    </div>
  );

  return (
    <Modal open={!!job} onClose={onClose}>
      <div className={modalStyle}>
        <div className={boxStyle}>
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            size="medium"
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h5"
            className="text-green-600 font-bold mb-6 text-center"
          >
            View Job Details
          </Typography>
          <br />

          {/* Job Details */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>Job Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderGridSection([
                { label: "Job Ref", value: job.jobRef },
                { label: "Created Date", value: job.createdDate },
                { label: "Job Flag", value: job.jobFlag },
                { label: "Created By", value: job.createdBy },
                {
                  label: "Created At",
                  value: new Date(job.createdAt).toLocaleString(),
                },
                {
                  label: "Updated At",
                  value: new Date(job.updatedAt).toLocaleString(),
                },
              ])}
            </AccordionDetails>
          </Accordion>

          {/* Customer Information */}
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>Customer Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderGridSection([
                { label: "Prefix", value: job.customerPrefix },
                { label: "Customer Name", value: job.customerName },
                { label: "Customer Phone", value: job.customerPhone },
                { label: "Customer Alter Phone", value: job.customerAlterPhone },
                { label: "Customer Email", value: job.customerEmail },
                { label: "Customer Company", value: job.customerCompany },
                { label: "Customer Address", value: job.customerAddress },
              ])}
            </AccordionDetails>
          </Accordion>

          {/* Device Details */}
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>Device Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderGridSection([
                { label: "Device Type", value: job.deviceType },
                { label: "Model", value: job.model },
                { label: "Serial Number", value: job.series },
                { label: "EMEI", value: job.emei },
                { label: "Capacity", value: job.capacity },
                { label: "Color", value: job.color },
                { label: "Passcode", value: job.passcode },
                { label: "SIM Tray Serial", value: job.simTraySerial },
                { label: "Under Warranty", value: job.underWarranty },
                {
                  label: "SIM Tray Collected",
                  value: job.simTrayCollected ? "Yes" : "No",
                },
              ])}
            </AccordionDetails>
          </Accordion>

          {/* Job Progress */}
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>Job Progress</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderGridSection([
                { label: "Technician", value: job.technician },
                { label: "Status", value: job.status },
                {
                  label: "Estimated Completion",
                  value: job.estimatedCompletion,
                },
                { label: "Estimated Cost", value: job.estimatedCost },
                { label: "Progress", value: job.jobProgress },
                { label: 'Completed Date', value: job.completed_date },
              ])}
            </AccordionDetails>
          </Accordion>

          {/* Faults & Remarks */}
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>Faults & Remarks</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderArrayField(
                "Customer Reported Faults",
                job.customer_reported
              )}
              {renderArrayField(
                "Collected Accessories",
                job.collected_accessories
              )}
              {renderArrayField(
                "Tech Notes",
                job.repaired_accessories
              )}
              {renderArrayField("Faults", job.faults)}
              {renderFullWidthField("Remarks", job.remarks)}
              {renderFullWidthField('Handed Over Person', job.handed_over_person)}
              {renderFullWidthField('Given To Person', job.given_to_person)}
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    </Modal>
  );
};

export default ViewJobModal;
