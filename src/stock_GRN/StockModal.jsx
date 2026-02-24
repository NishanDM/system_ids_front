import React, { useEffect, useState } from "react";

const StockModal = ({ onClose }) => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("spare");
  const [showConfirmClose, setShowConfirmClose] = useState(false);


  // Debounced search states
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown filter
  const [selectedFilter, setSelectedFilter] = useState("");

  const fetchStockData = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/stock/`
    );

    if (!response.ok) throw new Error("Failed to fetch stock data");

    const data = await response.json();
    setStockItems(data);
  } catch (err) {
    console.error("Error fetching stock:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchStockData();
}, []);


  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Categorize items
  const categories = {
    spare: stockItems.filter((item) => item.category === "spare"),
    accessory: stockItems.filter((item) => item.category === "accessory"),
    product: stockItems.filter((item) => item.category === "product"),
  };

  // Highlight matched text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.toString().replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
  };

  // Filter items
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
      item.attributes?.imeiNumber,
      item.attributes?.serialNumber,
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

  // Dropdown options based on category
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

  // Render table (unchanged except highlight support)
  const renderTable = (category, items) => {
    if (!items || items.length === 0)
      return <p className="text-gray-500 italic">No items available.</p>;

// const getRowClass = (category, qty) => {
//   if ((category === "spare" || category === "accessory") && qty <= 5) {
//     return "bg-red-100"; // light red
//   }
//   return "";
// };
const getRowClass = (category, qty, label) => {
  // Ignore low-qty highlight for 20W Power Adaptor
  if (category === "accessory" && label === "20W Power Adaptor") {
    return "";
  }

  // Normal low stock condition
  if ((category === "spare" || category === "accessory") && qty <= 5) {
    return "bg-red-100";
  }

  return "";
};


    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {/* Your existing tables stay the same — only label & attribute cells updated with highlight */}
        <table className="min-w-full text-xs">
          <thead className="bg-gray-100 text-gray-600 uppercase">
            {category === "spare" && (
              <tr>
                <th className="px-3 py-2 text-left">Label</th>
                <th className="px-3 py-2 text-left">Quantity</th>
                <th className="px-3 py-2 text-left">Unit Price (LKR)</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Compatibility</th>
                <th className="px-3 py-2 text-left">Condition</th>
                <th className="px-3 py-2 text-left">Other Value</th>
              </tr>
            )}

            {category === "accessory" && (
              <tr>
                <th className="px-3 py-2 text-left">Label</th>
                <th className="px-3 py-2 text-left">Quantity</th>
                <th className="px-3 py-2 text-left">Unit Price (LKR)</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Brand</th>
                <th className="px-3 py-2 text-left">Color</th>
                <th className="px-3 py-2 text-left">Other Value</th>
              </tr>
            )}

            {category === "product" && (
              <tr>
                <th className="px-3 py-2 text-left">Label</th>
                <th className="px-3 py-2 text-left">Quantity</th>
                <th className="px-3 py-2 text-left">Unit Price (LKR)</th>
                <th className="px-3 py-2 text-left">Capacity</th>
                <th className="px-3 py-2 text-left">Color</th>
                <th className="px-3 py-2 text-left">Region</th>
                <th className="px-3 py-2 text-left">Serial Number</th>
                <th className="px-3 py-2 text-left">IMEI Number</th>
                <th className="px-3 py-2 text-left">Condition</th>
                <th className="px-3 py-2 text-left">Other Value</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item._id.$oid || item._id}  className={getRowClass(category, item.qty, item.label)} >
                {/* Each cell with highlight */}
                <td className="px-3 py-2 font-medium text-gray-800"
                  dangerouslySetInnerHTML={{ __html: highlightText(item.label, searchQuery) }}
                />
                <td className="px-3 py-2">{item.qty}</td>
                <td className="px-3 py-2">Rs. {item.unitPrice?.toLocaleString()}</td>

                {/* Different attributes depending on category */}
                {category === "spare" && (
                  <>
                    <td className="px-3 py-2"
                      dangerouslySetInnerHTML={{ __html: highlightText(item.attributes?.description || "--", searchQuery) }}
                    />
                    <td className="px-3 py-2"
                      dangerouslySetInnerHTML={{ __html: highlightText(item.attributes?.compatibility || "--", searchQuery) }}
                    />
                    <td className="px-3 py-2">{item.attributes?.condition || "--"}</td>
                    <td className="px-3 py-2">{item.attributes?.otherValue || "--"}</td>
                  </>
                )}

                {category === "accessory" && (
                  <>
                    <td className="px-3 py-2"
                      dangerouslySetInnerHTML={{ __html: highlightText(item.attributes?.description || "--", searchQuery) }}
                    />
                    <td className="px-3 py-2"
                      dangerouslySetInnerHTML={{ __html: highlightText(item.attributes?.brand || "--", searchQuery) }}
                    />
                    <td className="px-3 py-2">{item.attributes?.color || "--"}</td>
                    <td className="px-3 py-2">{item.attributes?.otherValue || "--"}</td>
                  </>
                )}

                {category === "product" && (
                  <>
                    <td className="px-3 py-2">{item.attributes?.model || "--"}</td>
                    <td className="px-3 py-2">{item.attributes?.color || "--"}</td>
                    <td className="px-3 py-2">{item.attributes?.region || "--"}</td>
                    <td className="px-3 py-2">{item.attributes?.serialNumber || "--"}</td>
                    <td className="px-3 py-2">{item.attributes?.imeiNumber || "--"}</td>
                    <td className="px-3 py-2">{item.attributes?.condition || "--"}</td>
                    <td className="px-3 py-2">{item.attributes?.otherValue || "--"}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 p-4 text-xs min-h-[600px] flex flex-col">

        <div className="flex justify-between items-center border-b pb-3 mb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Stock Inventory</h2>
          
          <button onClick={() => setShowConfirmClose(true)} className="absolute top-3 right-3 text-gray-600 hover:text-white hover:font-bold hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">✕</button>
        </div>

        {/* Category Buttons */}
        <div className="flex space-x-2 mb-3 flex-shrink-0">
          {["spare", "accessory", "product"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSelectedFilter(""); }}
              className={`px-3 py-1 rounded-md border ${
                activeCategory === cat
                  ? "bg-gray-800 text-white border-gray-800 cursor-pointer"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
            <button
              onClick={fetchStockData}
              disabled={loading}
              className="bg-cyan-700 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium cursor-pointer disabled:opacity-50"
            >
              Re-Fresh
            </button>
        </div>

        {/* Filter Dropdown */}
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

        {/* Search Bar */}
        <div className="mb-4 flex-shrink-0">
          <input
            type="text"
            placeholder={`Search ${activeCategory}...`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-60 text-gray-600">
              <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
              Loading stock data...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-medium">⚠️ {error}</div>
          ) : (
            <div>{renderTable(activeCategory, filteredItems)}</div>
          )}
        </div>

      </div>
{showConfirmClose && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black opacity-40"></div>

    <div className="relative bg-white rounded-xl shadow-xl w-80 p-4 text-center">
      <p className="mb-4 font-semibold">Are you sure you want to close ?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setShowConfirmClose(false);
            onClose(); // close the modal
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


    </div>
  );
};

export default StockModal;
