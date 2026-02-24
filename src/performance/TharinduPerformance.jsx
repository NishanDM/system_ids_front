import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

const TharinduPerformance = ({ onclose }) => {
  const technician = "Tharindu Sandaruwan";

  const [jobs, setJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);

  const [monthlyCount, setMonthlyCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [yearlyCount, setYearlyCount] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);


  // ------------------------------------
  // Fetch Jobs
  // ------------------------------------
  useEffect(() => {
    const fetchJobs = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
      const allJobs = res.data;
      
      // Filter by technician
      const filtered = allJobs.filter(
        (j) => j.technician === technician
      );

      setJobs(filtered);

      // Completed Jobs
      const completed = filtered.filter((j) => {
  if (!j.jobProgress) return false;

  const progress = j.jobProgress.toLowerCase();

  return (
    progress === "completed" ||
    progress.startsWith("closed by bill")
  );
});

      setCompletedJobs(completed);

      calculateStats(filtered, completed);
      const totalCompleted = completed.length;
setTotalCompleted(totalCompleted);

    };

    fetchJobs();
  }, []);

  // ------------------------------------
  // Calculate Stats
  // ------------------------------------
  const calculateStats = (all, completed) => {
    const now = moment();

    const monthly = completed.filter((j) =>
      moment(j.updatedAt).isSame(now, "month")
    ).length;

    const weekly = completed.filter((j) =>
      moment(j.updatedAt).isSame(now, "week")
    ).length;

    const yearly = completed.filter((j) =>
      moment(j.updatedAt).isSame(now, "year")
    ).length;

    const rate = all.length > 0 ? ((completed.length / all.length) * 100).toFixed(1) : 0;

    setMonthlyCount(monthly);
    setWeeklyCount(weekly);
    setYearlyCount(yearly);
    setSuccessRate(rate);
  };


  const CloseIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

const JobDetailsPopup = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-4 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h2 className="font-semibold text-xs">Job Details - {job.jobRef}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded cursor-pointer">
            <CloseIcon />
          </button>
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="text-gray-600 text-[11px]"><strong>Customer:</strong> {job.customerPrefix} {job.customerName}</p>
          <p className="text-gray-600 text-[11px]"><strong>Phone:</strong> {job.customerPhone}</p>
          <p className="text-gray-600 text-[11px]"><strong>Device:</strong> {job.deviceType}</p>
          <p className="text-gray-600 text-[11px]"><strong>Model:</strong> {job.model}</p>
          <p className="text-gray-600 text-[11px]"><strong>Series:</strong> {job.series}</p>
          <p className="text-gray-600 text-[11px]"><strong>Status:</strong> {job.jobProgress}</p>
          <p className="text-gray-600 text-[11px]"><strong>Created:</strong> {moment(job.createdAt).format("YYYY-MM-DD")}</p>
          <p className="text-gray-600 text-[11px]"><strong>Completed:</strong> {moment(job.updatedAt).format("YYYY-MM-DD")}</p>
        </div>

        {/* Faults */}
        <div className="mt-3">
          <h2 className="font-semibold text-xs">Faults:</h2>
          <ul className="list-disc ml-4 text-gray-600 text-[11px]">
            {job.faults?.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>

        {/* Repaired Accessories */}
        <div className="mt-3">
          <h2 className="font-semibold text-xs">Repaired Accessories:</h2>
          <ul className="list-disc ml-4 text-gray-600 text-[11px]">
            {job.repaired_accessories?.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>

        {/* Remarks */}
        <div className="mt-3">
          <h2 className="font-semibold text-xs">Remarks:</h2>
          <p className="text-gray-600 text-[11px]">{job.remarks || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};


  return (
    <>
      {/* Main Popup */}
      <div className="fixed inset-0 z-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-40"></div>

        <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 p-6 text-sm min-height-[600px]">

          {/* HEADER */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-semibold">Technician: {technician}</h2>
              <p className="text-gray-600 text-xs">Completed job performance dashboard</p>
            </div>

            <button
              onClick={onclose}
              className="p-1 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
            >
              <CloseIcon />
            </button>
          </div>

          {/* DASHBOARD CARDS */}
          {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Monthly Jobs */}
          <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
            <p className="text-xs opacity-90">Monthly Completed Jobs</p>
            <h1 className="text-3xl font-bold mt-2">{monthlyCount}</h1>
          </div>

          {/* Weekly Jobs */}
          <div className="p-5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg">
            <p className="text-xs opacity-90">Weekly Completed Jobs</p>
            <h1 className="text-3xl font-bold mt-2">{weeklyCount}</h1>
          </div>

          {/* Yearly Jobs */}
          <div className="p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg">
            <p className="text-xs opacity-90">Yearly Completed Jobs</p>
            <h1 className="text-3xl font-bold mt-2">{yearlyCount}</h1>
          </div>

          {/* Success Rate */}
          <div className="p-5 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl shadow-lg">
            <p className="text-xs opacity-90">Success Rate</p>
            <h1 className="text-3xl font-bold mt-2">{successRate}%</h1>
          </div>
          <div className="p-5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-lg">
            <p className="text-xs opacity-90">Total Completed Jobs</p>
            <h1 className="text-3xl font-bold mt-2">{totalCompleted}</h1>
          </div>

        </div>

          {/* ⭐ SCROLLABLE TABLE */}
          <div className="mt-8">
            <h3 className="font-semibold text-sm mb-3">Completed Jobs (This Month)</h3>

            <div className="border-1 overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 text-xs sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Job Ref</th>
                    <th className="p-2 text-left">Device</th>
                    <th className="p-2 text-left">Serial No</th>
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-left">Phone</th>
                  </tr>
                </thead>

                <tbody>
                  {completedJobs
                    .filter((j) => moment(j.updatedAt).isSame(moment(), "month"))
                    .map((j) => (
                      <tr
                        key={j._id}
                        onClick={() => setSelectedJob(j)}
                        className="border-t hover:bg-red-100 cursor-pointer"
                      >
                        <td className="p-0">{j.jobRef.replace("IDSJBN-", "")}</td>
                        <td className="p-0">{j.deviceType}</td>
                        <td className="p-0">{j.series}</td>
                        <td className="p-0">{j.customerName}</td>
                        <td className="p-0">{j.customerPhone}</td>
                      </tr>
                    ))}

                  {completedJobs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-600">
                        No completed jobs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* ⭐ Job Details Popup */}
      {selectedJob && (
        <JobDetailsPopup
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
};

export default TharinduPerformance;
