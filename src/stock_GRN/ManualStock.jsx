import React, { useEffect, useState } from "react";

const ManualStock = ({ onClose }) => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("spare");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch stock data
const fetchStockData = async () => {
  setLoading(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/stock/`
    );

    if (!response.ok) throw new Error("Failed to fetch stock data");

    const data = await response.json();
    setStockItems(data);
    setError(null);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// Fetch on component mount
useEffect(() => {
  fetchStockData();
}, []);


  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Categorize items
  const categories = {
    spare: stockItems.filter((i) => i.category === "spare"),
    accessory: stockItems.filter((i) => i.category === "accessory"),
    product: stockItems.filter((i) => i.category === "product"),
  };

  // Filter items based on search and selected filter
  const filteredItems = categories[activeCategory].filter((item) => {
    const q = searchQuery.toLowerCase();
    const searchable = [
      item.label,
      item.attributes?.description,
      item.attributes?.brand,
      item.attributes?.model,
      item.attributes?.color,
      item.attributes?.compatibility,
      item.attributes?.condition,
      item.attributes?.capacity,
      item.attributes?.region,
      item.attributes?.serialNumber,
      item.attributes?.imeiNumber,
      item.attributes?.otherValue,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = q.split(" ").every((word) => searchable.includes(word));
    const matchesFilter = selectedFilter
      ? searchable.includes(selectedFilter.toLowerCase())
      : true;

    return matchesSearch && matchesFilter;
  });

  const getFilterOptions = () => {
    switch (activeCategory) {
      case "accessory":
        return [...new Set(categories.accessory.map(i => i.attributes?.brand).filter(Boolean))];
      case "product":
        return [...new Set(categories.product.map(i => i.attributes?.model).filter(Boolean))];
      case "spare":
        return [...new Set(categories.spare.map(i => i.attributes?.compatibility).filter(Boolean))];
      default:
        return [];
    }
  };

  // Highlight search matches
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.toString().replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
  };

  // Handle item attribute change dynamically
  const handleAttributeChange = (field, value) => {
    setEditingItem((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [field]: value },
    }));
  };

  // Handle main fields (label, qty, unitPrice)
  const handleFieldChange = (field, value) => {
    setEditingItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save item changes
  const saveChanges = async () => {
    if (!editingItem) return;
    setUpdating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stock/${editingItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
      if (!response.ok) throw new Error("Failed to update stock");

      // Update local state
      setStockItems((prev) =>
        prev.map((item) => (item._id === editingItem._id ? editingItem : item))
      );

      alert("✅ Stock updated successfully");
      setEditingItem(null);
    } catch {
      alert("⚠️ Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 p-4 text-xs min-h-[600px] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3 mb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Stock Manual Manager</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg font-bold">✕</button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 mb-3 flex-shrink-0">
          {["spare", "accessory", "product"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSelectedFilter(""); }}
              className={`px-3 py-1 rounded-md border ${
                activeCategory === cat
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
          <button className="px-3 py-1 rounded-md border bg-cyan-800 text-white hover:bg-green-700" onClick={fetchStockData}>Refresh</button>
        </div>

        {/* Filter */}
        {getFilterOptions().length > 0 && (
          <select
            className="border px-3 py-2 rounded-md text-xs mb-3"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="">All {activeCategory === "spare" ? "Compatibility" : activeCategory === "accessory" ? "Brands" : "Models"}</option>
            {getFilterOptions().map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder={`Search ${activeCategory}...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-xs mb-4"
        />

        {/* Stock Table */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <div className="text-center text-red-600 font-medium">⚠️ {error}</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                {/* <thead className="bg-gray-100 text-gray-600 uppercase text-left">
                  <tr>
                    <th className="px-3 py-2">Label</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Unit Price</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead> */}
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item._id}>
                      <td className="px-3 py-2 font-medium" dangerouslySetInnerHTML={{ __html: highlightText(item.label, searchQuery) }}  />
                      <td className="px-3 py-2">{item.attributes?.description}</td>
                      <td className="px-3 py-2">{item.attributes?.brand}</td>
                      <td className="px-3 py-2">{item.attributes?.model}</td>
                      <td className="px-3 py-2">{item.attributes?.color}</td>
                      <td className="px-3 py-2">{item.attributes?.compatibility}</td>
                      <td className="px-3 py-2">{item.attributes?.condition}</td>
                      <td className="px-3 py-2">{item.attributes?.capacity}</td>
                      <td className="px-3 py-2">{item.attributes?.region}</td>
                      <td className="px-3 py-2">{item.attributes?.serialNumber}</td>
                      <td className="px-3 py-2">{item.attributes?.imeiNumber}</td>
                      <td className="px-3 py-2">{item.attributes?.otherValue}</td>
                      <td className="px-3 py-2">{item.qty}</td>
                      <td className="px-3 py-2">{item.unitPrice}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Item Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setEditingItem(null)}></div>

            <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 p-4 text-xs max-h-[80vh] overflow-y-auto">
              <h3 className="text-sm font-semibold mb-2">Edit Item: {editingItem.label}</h3>

              <div className="space-y-2">
                {/* Main fields */}
                <div>
                  <label className="block text-gray-600 text-xs">Label</label>
                  <input
                    type="text"
                    value={editingItem.label}
                    onChange={(e) => handleFieldChange("label", e.target.value)}
                    className="w-full px-2 py-1 border rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-xs">Quantity</label>
                  <input
                    type="number"
                    value={editingItem.qty}
                    onChange={(e) => handleFieldChange("qty", Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-xs">Unit Price</label>
                  <input
                    type="number"
                    value={editingItem.unitPrice}
                    onChange={(e) => handleFieldChange("unitPrice", Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs"
                  />
                </div>

                {/* Dynamic Attributes */}
                <div>
                  <h4 className="text-gray-700 font-medium mb-1">Attributes</h4>
                  {Object.keys(editingItem.attributes || {}).map((attrKey) => (
                    <div key={attrKey} className="mb-2">
                      <label className="block text-gray-600 text-xs">{attrKey}</label>
                      <input
                        type="text"
                        value={editingItem.attributes[attrKey]}
                        onChange={(e) => handleAttributeChange(attrKey, e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  disabled={updating}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualStock;
