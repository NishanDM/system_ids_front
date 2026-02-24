import React, { useEffect, useState } from "react";
import axios from "axios";

const MacStockEdit = ({ onClose }) => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("spare");
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const [selectedPart, setSelectedPart] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  // 1️⃣ Add new states at the top
const [editingItem, setEditingItem] = useState(null);
const [updating, setUpdating] = useState(false);

// 2️⃣ Functions to handle edits
const handleFieldChange = (field, value) => {
  setEditingItem((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleAttributeChange = (field, value) => {
  setEditingItem((prev) => ({
    ...prev,
    attributes: { ...prev.attributes, [field]: value },
  }));
};

// 3️⃣ Save edited item
const saveChanges = async () => {
  if (!editingItem) return;
  setUpdating(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/stock/${editingItem._id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      }
    );
    if (!response.ok) throw new Error("Failed to update stock");

    // Update local state
    setStockItems((prev) =>
      prev.map((item) =>
        item._id === editingItem._id ? editingItem : item
      )
    );

    alert("✅ Stock updated successfully");
    setEditingItem(null);
  } catch (err) {
    console.error(err);
    alert("⚠️ Failed to update stock");
  } finally {
    setUpdating(false);
  }
};



  // Debounced search states
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown filter
  const [selectedFilter, setSelectedFilter] = useState("");

const fetchStockData = async () => {
  setLoading(true);
  setError(null);

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
  };

  // Highlight matched text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.toString().replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
  };

  // Filter items
const filteredItems = stockItems.filter((item) => {
  const q = searchQuery.toLowerCase();

  const description = item.attributes?.description?.toLowerCase() || "";
  const compatibility = item.attributes?.compatibility?.toLowerCase() || "";
  const label = item.label?.toLowerCase() || "";

  /* 🔍 SEARCH FILTER */
  const searchable = [
    label,
    description,
    compatibility,
    item.attributes?.condition,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchesSearch =
    !q || q.split(" ").every((word) => searchable.includes(word));

  /* 🎯 FIRST DROPDOWN FILTER */
  let matchesPrimaryFilter = true;

  switch (selectedFilter) {
    case "MacBook":
      matchesPrimaryFilter =
        item.category === "spare" &&
        (description.includes("macbook") ||
          compatibility.includes("macbook"));
      break;

    case "iMac":
      matchesPrimaryFilter =
        item.category === "spare" &&
        (description.includes("imac") ||
          compatibility.includes("imac"));
      break;

    case "Both":
      matchesPrimaryFilter =
        item.category === "spare" &&
        (description.includes("macbook") ||
          compatibility.includes("macbook") ||
          description.includes("imac") ||
          compatibility.includes("imac"));
      break;

    case "Asset":
      matchesPrimaryFilter = item.category === "asset";
      break;

    case "All":
      matchesPrimaryFilter =
        (item.category === "spare" &&
          (description.includes("macbook") || compatibility.includes("macbook"))) ||
        (item.category === "spare" &&
          (description.includes("imac") || compatibility.includes("imac"))) ||
        item.category === "asset";
      break;
  }

  /* 🧩 SECOND DROPDOWN (PART FILTER) */
  const matchesPart = !selectedPart || item.key === selectedPart;

  /* 🎯 THIRD DROPDOWN (PRODUCT) – FIXED */
  const matchesProduct = !selectedProduct || (() => {
    const selectedProductLabel = productOptions.find(p => p.key === selectedProduct)?.label;
    if (!selectedProductLabel) return true;
    const compatibility = item.attributes?.compatibility || "";
    return compatibility.toLowerCase() === selectedProductLabel.toLowerCase();
  })();

  return matchesSearch && matchesPrimaryFilter && matchesPart && matchesProduct;
});


  // Dropdown options based on category
  const getFilterOptions = () => {
    switch (activeCategory) {
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

const getRowClass = (category, qty, label) => {
  // Ignore low-qty highlight for 20W Power Adaptor
  if (category === "accessory" && label === "20W Power Adaptor") {
    return "";
  }

  // Normal low stock condition
  if ((category === "spare") && qty <= 5) {
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
                <th className="px-3 py-2 text-left">Action</th>
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
                    <td className="px-3 py-2"><button onClick={() => setEditingItem(item)}  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 cursor-pointer">Edit</button></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const fetchItemOptions = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/macbookdata/type/itemOptions`
    );

    // API returns an array → we need the first document's items
    const options = res.data?.[0]?.items || [];
    setItemOptions(options);
  } catch (err) {
    console.error("Failed to fetch item options", err);
  }
};

const fetchProductOptions = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/macbookdata/type/product`
    );

    // API returns an array → take first document's items
    const products = res.data?.[0]?.items || [];
    setProductOptions(products);
  } catch (err) {
    console.error("Failed to fetch product options", err);
  }
};
useEffect(() => {
  fetchStockData();
  fetchItemOptions();
  fetchProductOptions();
}, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 p-4 text-xs min-h-[600px] flex flex-col">

        <div className="flex justify-between items-center border-b pb-3 mb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Stock Inventory Edit</h2>
          <button onClick={() => setShowConfirmClose(true)} className="absolute top-3 right-3 text-gray-600 hover:text-white hover:font-bold hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">✕</button>
        </div>

        {/* Category Buttons */}
        <div className="flex space-x-2 mb-3 flex-shrink-0">
          {["spare"].map((cat) => (
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
          <button className="cursor-pointer border-1 bg-cyan-700 text-white font-semibold px-2 py-2 rounded-md" onClick={fetchStockData}>Refresh</button>
        </div>

        {/* Filter Dropdown */}
       <div className="flex flex-row gap-2">
         {getFilterOptions().length > 0 && (
          <select
            className="border px-3 py-2 rounded-md text-xs mb-3 cursor-pointer"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="">Select an option</option>
            <option value="MacBook">MacBook</option>
            <option value="iMac">iMac</option>
            <option value="Both">Both</option>
            <option value="Asset">Asset</option>
            <option value="All">All</option>
          </select>
        )}
         <select
            className="border px-3 py-2 rounded-md text-xs mb-3 cursor-pointer"
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
          >
            <option value="">Select a Part</option>

            {itemOptions.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <select
              className="border px-3 py-2 rounded-md text-xs mb-3 cursor-pointer"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select a MacBook & iMac Model</option>

              {productOptions.map((product) => (
                <option key={product.key} value={product.key}>
                  {product.label}
                </option>
              ))}
            </select>
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
  ) : getFilterOptions().length > 0 && selectedFilter === "" ? (
    /* 🔒 Disabled message */
    <div className="flex justify-center items-center h-60 text-gray-400 text-sm italic border border-dashed rounded-lg">
      Please select <span className="mx-1 font-semibold text-gray-600">select a filter option</span> to view stock details
    </div>
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


{/* Edit Item Modal */}
{editingItem && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black opacity-40"
      onClick={() => setEditingItem(null)}
    ></div>

    <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 p-4 text-xs max-h-[80vh] overflow-y-auto">
      <h3 className="text-sm font-semibold mb-2">
        Edit Item: {editingItem.label}
      </h3>

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
            onChange={(e) =>
              handleFieldChange("qty", Number(e.target.value))
            }
            className="w-full px-2 py-1 border rounded text-xs"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-xs">Unit Price</label>
          <input
            type="number"
            value={editingItem.unitPrice}
            onChange={(e) =>
              handleFieldChange("unitPrice", Number(e.target.value))
            }
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
                onChange={(e) =>
                  handleAttributeChange(attrKey, e.target.value)
                }
                className="w-full px-2 py-1 border rounded text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={() => setEditingItem(null)}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-xs cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={saveChanges}
          disabled={updating}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs disabled:opacity-50 cursor-pointer"
        >
          {updating ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default MacStockEdit;
