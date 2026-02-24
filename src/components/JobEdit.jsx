import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BillEdit({ onClose }) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [jobNumber, setJobNumber] = useState('');
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [isCompletedJob, setIsCompletedJob] = useState(false);
  const [isClosedJob, setisClosedJob] = useState(false);
  const [jobProgressOptions] = useState([
    "Just_started",
    "Taken",
    "Completed",
    "Hold",
    "Returned",
    "Canceled",
    "Assign for another technician"
  ]);

  // Fetch technicians on mount
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/technicians`);
        setTechnicians(res.data);
      } catch (err) {
        console.error("Failed to fetch technicians:", err);
      }
    };
    fetchTechnicians();
  }, []);

  // Fetch job details
  const handleSearch = async () => {
    if (!jobNumber) return;
    let formattedJobNumber = jobNumber.startsWith("IDSJBN") ? jobNumber : `IDSJBN-${jobNumber}`;
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/details/${formattedJobNumber}`);
      setJobData(res.data);
      console.log("Job Record:", JSON.stringify(res.data, null, 2));
      // 🔥 CHECK IF JOB IS COMPLETED
    if (res.data.jobProgress === "Completed") {
      setIsCompletedJob(true);
    } else {
      setIsCompletedJob(false);
    }
    // 🔥 NEW CONDITION — CHECK IF CLOSED BY BILL
    if (res.data.jobProgress.startsWith("Closed By Bill - IDS-")) {
      setisClosedJob(true);
      alert("This job is Closed By a Bill");
    }

    } catch (err) {
      console.error(err);
      alert('Job not found!');
    } finally {
      setLoading(false);
    }
  };

  // Save edited job
  const handleSave = async () => {
    if (!jobData || !jobData.jobRef) return;

    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/jobs/manualedit`, {
        jobRef: jobData.jobRef,
        ...jobData,
      });
      alert('Job updated successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update job');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-xs">
      <div className="absolute inset-0 bg-black opacity-25"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-xl w-full mx-4 p-6 min-h-[300px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold">EDIT JOB PROGRESS & TECHNICIAN HERE</h2>
          <button 
            onClick={() => setShowCloseConfirm(true)} 
            className="absolute top-3 right-3 text-gray-600 hover:text-white hover:font-bold hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
              type="text"
              value={jobNumber}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // remove non-digit characters

                // Automatically insert hyphens after 2nd and 4th digits
                if (value.length > 2) {
                  value = value.slice(0, 2) + "-" + value.slice(2);
                }
                if (value.length > 5) {
                  value = value.slice(0, 5) + "-" + value.slice(5);
                }

                // Limit length to 8 digits + 2 hyphens
                value = value.slice(0, 8 + 2);

                setJobNumber(value);
              }}
              placeholder="Search by Job Number (IDSJBN)"
              className="flex-1 border rounded-md px-3 py-1"
            />
          <button 
            className="bg-blue-600 font-bold hover:bg-green-600 text-white px-3 py-1 rounded-md cursor-pointer" 
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
{isCompletedJob && (
  <div className="bg-red-100 text-red-700 font-semibold p-3 rounded-md mb-4 text-center border border-red-400">
    The Searched job is <span className="font-bold">COMPLETED</span> by {jobData.technician}.
  </div>
)}

        {/* Editable fields */}
        {jobData && (
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-4 mb-4">
              <label className="font-semibold mr-2">Technician:</label>
              <select
                    value={jobData.technician}
                    onChange={(e) => setJobData({ ...jobData, technician: e.target.value })}
                    className="border rounded-md px-2 py-1 cursor-pointer"
                    disabled={isCompletedJob || isClosedJob}
                    >
                    <option value="">Select Technician</option>
                    {technicians.map((tech) => (
                        <option key={tech._id} value={tech.username}>
                        {tech.username}
                        </option>
                    ))}
                    </select>
                    <label className="font-semibold mr-2">Job Progress:</label>
              <select
                value={jobData.jobProgress}
                onChange={(e) => setJobData({ ...jobData, jobProgress: e.target.value })}
                className="border rounded-md px-2 py-1 cursor-pointer"
                disabled={isCompletedJob || isClosedJob}
              >
                {jobProgressOptions.map((prog) => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-auto">
          <button
            onClick={handleSave}
            className="bg-red-500 font-bold hover:bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer"
            disabled={isCompletedJob || isClosedJob}
          >
            Save
          </button>
        </div>
      </div>


      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative bg-white rounded-xl shadow-xl w-80 p-4 text-center">
            <p className="mb-4 font-semibold">Are you sure you want to close?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  onClose();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-md cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
