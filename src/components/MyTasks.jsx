// src/MyTasks.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyTasks = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewing, setIsViewing] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const Field = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-gray-500 text-xs font-medium uppercase">{label}</span>
      <span className="text-gray-800">{value || '--'}</span>
    </div>
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
        const assignedJobs = res.data.filter(job => job.technician === user?.username);
        setJobs(assignedJobs);
      } catch (err) {
        console.error(err);
      }
    };

    fetchJobs();
  }, [user?.username]);

  const handleView = (job) => {
    setSelectedJob(job);
    setIsViewing(true);
  };

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">🧰 Assigned Jobs</h2>
      <table className="min-w-full border bg-white shadow rounded text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">Job Ref</th>
            <th className="px-4 py-2 text-left">Customer</th>
            <th className="px-4 py-2 text-left">Model</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id} className="border-t hover:bg-gray-100">
              <td className="px-4 py-2">{job.jobRef}</td>
              <td className="px-4 py-2">{job.customerName}</td>
              <td className="px-4 py-2">{job.model}</td>
              <td className="px-4 py-2">{job.status}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleView(job)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Modal */}
      {isViewing && selectedJob && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">📋 Job Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
        {/* Job Info */}
        <Field label="Job Ref" value={selectedJob.jobRef} />
        <Field label="Created Date" value={selectedJob.createdDate} />
        <Field label="Job Flag" value={selectedJob.jobFlag} />
        <Field label="Status" value={selectedJob.status} />
        <div className="flex flex-col">
          <label className="text-gray-500 text-xs font-medium uppercase">Progress</label>
          <select
            value={selectedJob.jobProgress}
            onChange={(e) =>
              setSelectedJob((prev) => ({ ...prev, jobProgress: e.target.value }))
            }
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select Progress --</option>
            <option value="Taken">Taken</option>
            <option value="Returned">Returned</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
        <Field label="Created By" value={selectedJob.createdBy} />
        <Field label="Technician" value={selectedJob.technician} />
        <Field label="Est. Completion" value={selectedJob.estimatedCompletion} />
        <Field label="Est. Cost" value={selectedJob.estimatedCost} />

        {/* Customer Info */}
        <div className="col-span-2 mt-4 mb-2">
          <h4 className="font-semibold text-gray-600 border-b pb-1 mb-1">Customer Information</h4>
        </div>
        <Field label="Name" value={`${selectedJob.customerPrefix} ${selectedJob.customerName}`} />
        <Field label="Phone" value={selectedJob.customerPhone} />
        <Field label="Email" value={selectedJob.customerEmail} />
        <Field label="Company" value={selectedJob.customerCompany} />
        <Field label="Address" value={selectedJob.customerAddress} />

        {/* Device Info */}
        <div className="col-span-2 mt-4 mb-2">
          <h4 className="font-semibold text-gray-600 border-b pb-1 mb-1">Device Information</h4>
        </div>
        <Field label="Device Type" value={selectedJob.deviceType} />
        <Field label="Model" value={selectedJob.model} />
        <Field label="Color" value={selectedJob.color} />
        <Field label="Capacity" value={selectedJob.capacity} />
        <Field label="Series" value={selectedJob.series} />
        <Field label="EMEI" value={selectedJob.emei} />
        <Field label="Passcode" value={selectedJob.passcode} />
        <Field label="Under Warranty" value={selectedJob.underWarranty} />
        <Field label="SIM Tray Collected" value={selectedJob.simTrayCollected ? 'Yes' : 'No'} />
        {selectedJob.simTrayCollected && (
          <Field label="SIM Tray Serial" value={selectedJob.simTraySerial} />
        )}

        {/* Faults & Remarks */}
        <div className="col-span-2 mt-4 mb-2">
          <h4 className="font-semibold text-gray-600 border-b pb-1 mb-1">Faults & Remarks</h4>
        </div>
        <div className="col-span-2">
          <p className="font-medium">Faults:</p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            {(selectedJob.faults?.split(',') || []).map((fault, index) => (
              <li key={index}>{fault.trim()}</li>
            ))}
          </ul>
        </div>
        <div className="col-span-2">
          <p className="font-medium">Remarks:</p>
          <p className="text-gray-700 whitespace-pre-wrap">
            {selectedJob.remarks || 'No remarks.'}
          </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => setIsViewing(false)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Close
        </button>
        <button
          onClick={async () => {
            try {
              await axios.put(`${import.meta.env.VITE_API_URL}/api/jobs/${selectedJob._id}`, {
                jobProgress: selectedJob.jobProgress,
              });
              alert('✅ Job progress updated');
              setIsViewing(false);
              // Refresh job list
              const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
              const updated = res.data.filter(job => job.technician === user?.username);
              setJobs(updated);
            } catch (err) {
              console.error(err);
              alert('❌ Failed to update progress');
            }
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Progress
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default MyTasks;
