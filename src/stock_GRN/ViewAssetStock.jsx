import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewAssetStock = ({ onClose }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null); // currently edited asset
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/asset-grn`);
      setAssets(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching asset stock:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Highlight search matches
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.toString().replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
  };

  // Filter assets based on search query
  const filteredAssets = assets.filter((asset) => {
    const q = searchQuery.toLowerCase();
    const searchable = [
      asset.serialNumber,
      asset.compatibility,
      asset.ram,
      asset.capacity,
      asset.color,
      asset.processor,
      asset.displaySize,
      asset.workingParts,
      asset.faultyParts,
      asset.faults,
      asset.assetRemark,
      asset.createdBy,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return q.split(" ").every((word) => searchable.includes(word));
  });

  // Delete full asset
const handleDeleteAsset = async (assetId) => {
  if (!confirm("Are you sure you want to delete this asset?")) return;
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/asset-grn/${assetId}`);
    setAssets(assets.filter((a) => a._id !== assetId)); // remove from list
    setEditingAsset(null);
  } catch (err) {
    alert("Failed to delete asset: " + err.message);
  }
};

// Delete a single asset part
const handleDeletePart = async (assetId, partId) => {
  if (!confirm("Are you sure you want to delete this asset part?")) return;
  try {
    const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/asset-grn/${assetId}/remove-part/${partId}`);
    // Update the editingAsset and main list
    setEditingAsset(res.data.data);
    setAssets((prev) =>
      prev.map((a) => (a._id === assetId ? res.data.data : a))
    );
  } catch (err) {
    alert("Failed to delete part: " + err.message);
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={() => setShowConfirmClose(true)}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 p-4 text-xs min-h-[600px] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Asset Stock</h2>
          <button
            onClick={() => setShowConfirmClose(true)}
            className="absolute top-3 right-3 text-gray-600 hover:text-white hover:font-bold hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Refresh & Search */}
        <div className="flex space-x-2 mb-3 flex-shrink-0 items-center">
          <button
            onClick={fetchAssets}
            disabled={loading}
            className="bg-cyan-700 hover:bg-green-600 text-white px-2 py-2 rounded-md text-xs font-medium cursor-pointer disabled:opacity-50"
          >
            Re-Fresh
          </button>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="px-3 py-2 border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-gray-300 flex-1"
          />
        </div>

        {/* Scrollable asset list */}
        <div className="flex-1 overflow-y-auto mt-2 space-y-4 max-h-[500px]">
          {loading ? (
            <div className="flex justify-center items-center h-60 text-gray-600">
              <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
              Loading asset stock...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-medium">⚠️ {error}</div>
          ) : filteredAssets.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">No assets found.</p>
          ) : (
            filteredAssets.map((asset, index) => (
              <div
                key={asset._id || index}
                className="border rounded-lg p-3 shadow-sm bg-white"
              >
                {/* Asset Main Info */}
               <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-cyan-700">
                    {asset.serialNumber || "-"} | {asset.compatibility || "-"}
                </h3>
                <button
                onClick={() => setEditingAsset(asset)}
                    className="bg-cyan-700 hover:bg-red-400 text-white px-2 py-2 rounded-md text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                    Edit
                </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-700 text-xs">
                  <div>RAM: <span className="font-semibold">{asset.ram || "-"}</span></div>
                  <div>Capacity: <span className="font-semibold">{asset.capacity || "-"}</span></div>
                  <div>Color: <span className="font-semibold">{asset.color || "-"}</span></div>
                  <div>Processor: <span className="font-semibold">{asset.processor || "-"}</span></div>
                  <div>Display Size: <span className="font-semibold">{asset.displaySize || "-"}</span></div>
                  <div>Working Parts: <span className="font-semibold">{asset.workingParts || "-"}</span></div>
                  <div>Faulty Parts: <span className="font-semibold">{asset.faultyParts || "-"}</span></div>
                  <div>Faults: <span className="font-semibold">{asset.faults || "-"}</span></div>
                  <div>Remark: <span className="font-semibold">{asset.assetRemark || "-"}</span></div>
                  <div>Stock Updated: <span className="font-semibold">{asset.stockUpdated ? "Yes" : "No"}</span></div>
                  <div>GRN Date: <span className="font-semibold">{new Date(asset.grnDate).toLocaleDateString()}</span></div>
                  <div>Created At: <span className="font-semibold">{new Date(asset.createdAt).toLocaleDateString()}</span></div>
                </div>

                {/* Asset Parts */}
                <div className="mt-2">
                  <h4 className="font-semibold text-green-600 mb-1">Asset Parts Used</h4>
                  {asset.assetParts && asset.assetParts.length > 0 ? (
                    <div className="space-y-1 text-gray-700 text-xs">
                      {asset.assetParts.map((part, idx) => (
                        <div key={part._id || idx} className="p-2 border rounded flex justify-between">
                          <span>{part.partLabel || "-"}</span>
                          <span>Qty: {part.qty || 0}</span>
                          <span>Cost: Rs. {part.costPrice?.toLocaleString() || "-"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs italic">No asset parts available.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm Close */}
      {showConfirmClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative bg-white rounded-xl shadow-xl w-80 p-4 text-center">
            <p className="mb-4 font-semibold">Are you sure you want to close?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowConfirmClose(false);
                  onClose();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmClose(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-md cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

{editingAsset && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black opacity-40"
      onClick={() => setEditingAsset(null)}
    ></div>

    <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full p-4 flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Edit Asset: {editingAsset.serialNumber || "-"}
      </h2>

      {/* Asset Info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mb-3">
        <div>RAM: {editingAsset.ram || "-"}</div>
        <div>Capacity: {editingAsset.capacity || "-"}</div>
        <div>Color: {editingAsset.color || "-"}</div>
        <div>Processor: {editingAsset.processor || "-"}</div>
        <div>Display Size: {editingAsset.displaySize || "-"}</div>
      </div>

      {/* Asset Parts */}
      <div className="mb-3">
        <h4 className="font-semibold text-green-600 mb-2">Asset Parts</h4>
        {editingAsset.assetParts && editingAsset.assetParts.length > 0 ? (
          <div className="space-y-1">
            {editingAsset.assetParts.map((part) => (
              <div
                key={part._id}
                className="flex justify-between items-center border rounded p-2"
              >
                <span>{part.partLabel}</span>
                <span>Qty: {part.qty}</span>
                <span>Cost: Rs. {part.costPrice}</span>
                <button
                  className="text-red-500 text-xs hover:underline cursor-pointer"
                  onClick={() => handleDeletePart(editingAsset._id, part._id)}
                >
                  Delete Part
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs italic">No parts</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-3">
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer"
          onClick={() => handleDeleteAsset(editingAsset._id)}
        >
          Delete Asset
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-md cursor-pointer"
          onClick={() => setEditingAsset(null)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default ViewAssetStock;
