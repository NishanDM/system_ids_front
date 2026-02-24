import React, { useEffect, useState } from "react";

const StockForDamagedParts = ({ onClose, onAddToBill }) => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("spare");

  // Debounced search states
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown filter
  const [selectedFilter, setSelectedFilter] = useState("");

  // Confirm dialog + update state
  const [confirmItem, setConfirmItem] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Add state to hold entered serial number
const [enteredSerial, setEnteredSerial] = useState("");

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stock/`);
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
      item.attributes?.serialNumber,
      item.attributes?.imeiNumber,
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

  // Confirm BILL click
const handleAddClick = (item) => {
  setConfirmItem(item);

  // ✅ Log full MongoDB item immediately
  console.log("🧾 Selected Item for Billing:");
  console.log(JSON.stringify(item, null, 2));
};



  // Confirm purchase and PATCH stock
  const handleConfirmPurchase = async () => {
    if (!confirmItem) return;
    setUpdating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stock/${confirmItem._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qty: confirmItem.qty - 1 }),
        }
      );

      if (!response.ok) throw new Error("Failed to update stock quantity");

      setStockItems((prev) =>
        prev.map((i) =>
          i._id === confirmItem._id ? { ...i, qty: i.qty - 1 } : i
        )
      );

      onAddToBill(confirmItem);

          // ✅ PRINT FULL MONGODB JSON TO CONSOLE
    console.log("🧾 Billed Item (MongoDB Record):");
    console.log(JSON.stringify(confirmItem, null, 2));
      setConfirmItem(null);
    } catch (err) {
      alert("Failed to update stock. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Render Table (only highlight added)
  const renderTable = (category, items) => {
    if (!items.length)
      return <p className="text-gray-500 italic">No items available.</p>;

    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-100 text-gray-600 uppercase">
            {category === "spare" && (
              <tr>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Unit Price</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Compatibility</th>
                <th className="px-3 py-2">Condition</th>
                <th></th>
              </tr>
            )}

            {category === "accessory" && (
              <tr>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Unit Price</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Color</th>
                <th></th>
              </tr>
            )}

          
          </thead>

          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-3 py-2" dangerouslySetInnerHTML={{ __html: highlightText(item.label, searchQuery) }} />
                <td className="px-3 py-2">{item.qty}</td>
                <td className="px-3 py-2">Rs. {item.unitPrice?.toLocaleString()}</td>

                {category === "spare" && (
                  <>
                    <td className="px-3 py-2" dangerouslySetInnerHTML={{ __html: highlightText(item.attributes?.description || "--", searchQuery) }} />
                    <td className="px-3 py-2" dangerouslySetInnerHTML={{ __html: highlightText(item.attributes?.compatibility || "--", searchQuery) }} />
                    <td className="px-3 py-2">{item.attributes?.condition || "--"}</td>
                  </>
                )}

                {category === "accessory" && (
                  <>
                    <td className="px-3 py-2" dangerouslySetInnerHTML={{ __html: highlightText(item.attributes?.description || "--", searchQuery) }} />
                    <td className="px-3 py-2" dangerouslySetInnerHTML={{ __html: highlightText(item.attributes?.brand || "--", searchQuery) }} />
                    <td className="px-3 py-2">{item.attributes?.color || "--"}</td>
                  </>
                )}

                

                <td className="px-3 py-2">
                  <button
                    onClick={() => handleAddClick(item)}
                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-red-500 cursor-pointer"
                  >
                    ADD
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 p-4 text-xs min-h-[600px] flex flex-col">

        <div className="flex justify-between items-center border-b pb-3 mb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Stock Inventory</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg font-bold cursor-pointer">✕</button>
        </div>

        <div className="flex space-x-2 mb-3 flex-shrink-0">
          {["spare", "accessory"].map((cat) => (
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
        </div>

        {/* {getFilterOptions().length > 0 && (
          <select
            className="border px-3 py-2 rounded-md text-xs mb-3"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="">All</option>
            {getFilterOptions().map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )} */}

        <input
          type="text"
          placeholder={`Search ${activeCategory}...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-xs mb-4"
        />

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

      {/* Confirmation Dialog */}
      
{confirmItem && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center">
    <div className="bg-yellow-50 rounded-lg shadow-lg p-5 w-80 text-center">
      <p className="text-sm text-gray-800 mb-4 font-medium">
        Do you want to remove this damaged part?
      </p>

      {/* Show input only if it's a product */}
      {confirmItem.category === "product" && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter product serial number"
            value={enteredSerial}
            onChange={(e) => setEnteredSerial(e.target.value)}
            className="w-full px-3 py-2 border rounded text-xs"
          />
        </div>
      )}

      <div className="flex justify-center space-x-3">
        <button
          onClick={handleConfirmPurchase}
          disabled={updating || (confirmItem.category === "product" && enteredSerial !== confirmItem.attributes.serialNumber)}
          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 cursor-pointer"
        >
          {updating ? "Processing..." : "Yes"}
        </button>
        <button
          onClick={() => {
            setConfirmItem(null);
            setEnteredSerial(""); // reset input
          }}
          className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs hover:bg-gray-400 cursor-pointer"
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

export default StockForDamagedParts;
