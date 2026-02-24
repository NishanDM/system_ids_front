import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CatalogModalForAssetParts({ open, onClose, type }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ key: "", label: "" });
  const [datasetId, setDatasetId] = useState(null);
  const [message, setMessage] = useState(""); // status message
  const [editingItem, setEditingItem] = useState(null); // item being edited
  const [editForm, setEditForm] = useState({ key: "", label: "" });


  // Fetch dataset and items
  useEffect(() => {
    if (!open) return;

    const fetchItems = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/macbookdata/type/${
          type === "spare" ? "itemOptions" : "product"
        }`;

        const res = await axios.get(url);
        let dataset;

        if (type === "spare") {
          dataset = res.data.find((d) => d.category === "asset_spare");
        } else {
          dataset = res.data[0]; // product datasets
        }

        if (!dataset) {
          setItems([]);
          setDatasetId(null);
          return;
        }

        setDatasetId(dataset._id);
        setItems(dataset.items || []);
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      }
    };

    fetchItems();
  }, [open, type]);

  // Add a new item
  const handleAdd = async () => {
    if (!newItem.key || !newItem.label) return alert("Fill key & label");
    if (!datasetId) return alert("Dataset not loaded");

    try {
      const url =
        type === "spare"
          ? `${import.meta.env.VITE_API_URL}/api/macbookdata/${datasetId}/spare_item/add`
          : `${import.meta.env.VITE_API_URL}/api/macbookdata/${datasetId}/product_item/add`;

      const res = await axios.patch(url, { item: newItem });

      setItems(res.data.items);
      setNewItem({ key: "", label: "" });
      showMessage("Item added successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add item");
      console.error(err);
    }
  };

  // Delete an item
  const handleDelete = async (key) => {
    if (!datasetId) return alert("Dataset not loaded");

    try {
      const url =
        type === "spare"
          ? `${import.meta.env.VITE_API_URL}/api/macbookdata/${datasetId}/items/remove`
          : `${import.meta.env.VITE_API_URL}/api/macbookdata/${datasetId}/items/remove`;

      const res = await axios.patch(url, { key });
      setItems(res.data.items);
      showMessage("Item deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete item");
      console.error(err);
    }
  };

  // Edit label locally only (optional: you can implement PATCH for editing too)
  // const handleEdit = (key, newLabel) => {
  //   setItems((prev) =>
  //     prev.map((i) => (i.key === key ? { ...i, label: newLabel } : i))
  //   );
  // };
  const showMessage = (msg) => {
  setMessage(msg);
  setTimeout(() => setMessage(""), 3000); // clear message after 3 seconds
};


//==============  the edit key and label function  ==================
const handleUpdate = async () => {
  if (!datasetId || !editingItem) return;

  try {
    const url =
      type === "spare"
        ? `${import.meta.env.VITE_API_URL}/api/macbookdata/${datasetId}/items/update`
        : `${import.meta.env.VITE_API_URL}/api/macbookdata/${datasetId}/items/update`;

    const res = await axios.patch(url, {
      oldKey: editingItem.key,
      newItem: editForm,
    });

    setItems(res.data.items);
    setEditingItem(null);
    showMessage("Item updated successfully!");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update item");
    console.error(err);
  }
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-3xl mx-4 p-4 text-xs">
        <h3 className="font-semibold text-sm mb-3">
          {type === "spare" ? "Spare Parts" : "Products"}
        </h3>

        {message && (
  <div className="mb-2 text-xs text-white bg-green-500 px-2 py-1 rounded">
    {message}
  </div>
)}


        {/* List Items */}
        <div className="max-h-64 overflow-auto mb-3">
          {items.map((item) => (
            <div key={item.key} className="flex justify-between items-center mb-1">
              <div>{item.label}</div>
              <div className="flex gap-1">
                <button
                  className="px-2 py-0.5 bg-white border-2 text-balance rounded text-[11px] hover:bg-amber-400 font-bold cursor-pointer"
                  onClick={() => {
                      setEditingItem(item);
                      setEditForm({ key: item.key, label: item.label });
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-0.5 hover:bg-red-600 text-red-600 rounded border-1 text-[11px] bg-white hover:text-white hover:font-semibold cursor-pointer"
                  onClick={() => handleDelete(item.key)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Item */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Key"
            className="border px-2 py-1 text-xs w-1/3"
            value={newItem.key}
            onChange={(e) => setNewItem((prev) => ({ ...prev, key: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Label"
            className="border px-2 py-1 text-xs w-2/3"
            value={newItem.label}
            onChange={(e) => setNewItem((prev) => ({ ...prev, label: e.target.value }))}
          />
          <button
            className="px-2 py-1 bg-green-600 text-white rounded text-xs cursor-pointer hover:bg-green-700"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>

        <div className="flex justify-end">
          <button
            className="px-3 py-1 border rounded text-xs hover:bg-red-300 cursor-pointer font-bold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

{editingItem && (
  <div className="absolute inset-0 flex items-center justify-center bg-none">
    <div className="bg-white rounded-lg p-4 w-72 text-xs shadow-xl">
      <h4 className="font-semibold mb-3">Edit Item</h4>

      <div className="mb-2">
        <label className="block mb-1">Key</label>
        <input
          type="text"
          className="border px-2 py-1 w-full"
          value={editForm.key}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, key: e.target.value }))
          }
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">Label</label>
        <input
          type="text"
          className="border px-2 py-1 w-full"
          value={editForm.label}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, label: e.target.value }))
          }
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          className="px-2 py-1 border rounded hover:bg-gray-200 cursor-pointer"
          onClick={() => setEditingItem(null)}
        >
          Cancel
        </button>
        <button
          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={handleUpdate}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}
