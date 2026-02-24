import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function ViewExpenses({ date, onClose }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // context menu
  const [menu, setMenu] = useState(null); // { x, y, expense }

  // delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // edit modal
  const [editData, setEditData] = useState(null);

  const menuRef = useRef(null);

  /* ---------------------------------- */
  /* Fetch expenses */
  /* ---------------------------------- */
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cash-expenses?date=${date}`
      );
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [date]);

  /* ---------------------------------- */
  /* Close context menu on outside click */
  /* ---------------------------------- */
  useEffect(() => {
    const handleClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* ---------------------------------- */
  /* Delete expense */
  /* ---------------------------------- */
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/cash-expenses/${deleteTarget._id}`
      );
      setDeleteTarget(null);
      fetchExpenses();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ---------------------------------- */
  /* Update expense */
  /* ---------------------------------- */
  const saveEdit = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/cash-expenses/${editData._id}`,
        editData
      );
      setEditData(null);
      fetchExpenses();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl p-5 text-xs">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-semibold text-sm">Cash Expenses</h3>
            <p className="text-gray-500 text-[11px]">
              Expenses for {date}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            ✕
          </button>
        </div>

        <hr className="mb-3" />

        {/* Content */}
        {loading && (
          <p className="text-center text-gray-500 py-6">
            Loading expenses...
          </p>
        )}

        {!loading && expenses.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No expenses recorded for this date
          </p>
        )}

        {!loading && expenses.length > 0 && (
          <>
            <div className="max-h-[360px] overflow-y-auto border rounded">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="text-left px-3 py-2 border-b">
                      Description
                    </th>
                    <th className="text-left px-3 py-2 border-b">
                      Category
                    </th>
                    <th className="text-right px-3 py-2 border-b">
                      Amount (Rs.)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr
                      key={exp._id}
                      className="hover:bg-gray-200 cursor-context-menu"
                      onContextMenu={e => {
                        e.preventDefault();
                        setMenu({
                          x: e.pageX,
                          y: e.pageY,
                          expense: exp
                        });
                      }}
                    >
                      <td className="px-3 py-1 border-b">
                        {exp.description || "-"}
                      </td>
                      <td className="px-3 py-1 border-b">
                        {exp.category}
                      </td>
                      <td className="px-3 py-1 border-b text-right font-medium">
                        {Number(exp.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="font-semibold">Total Expenses</span>
              <span className="font-bold text-sm text-red-600">
                Rs. {totalExpenses.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right Click Menu */}
      {menu && (
        <div
          ref={menuRef}
          className="fixed bg-white shadow-lg border rounded text-xs z-[70] "
          style={{ top: menu.y, left: menu.x }}
        >
          <button
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left cursor-pointer font-bold"
            onClick={() => {
              setEditData(menu.expense);
              setMenu(null);
            }}
          >
             Edit
          </button>
          <button
            className="block px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left cursor-pointer font-bold"
            onClick={() => {
              setDeleteTarget(menu.expense);
              setMenu(null);
            }}
          >
             Delete
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
  <div className="fixed inset-0 z-[80] flex items-center justify-center">
    {/* backdrop */}
    <div className="absolute inset-0 bg-black/30" />

    {/* modal */}
    <div className="relative z-10 bg-white p-4 rounded shadow w-72">
      <p className="text-sm mb-4">
        Delete this expense permanently?
      </p>

      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-1 border rounded cursor-pointer"
          onClick={() => setDeleteTarget(null)}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 bg-red-600 text-white rounded cursor-pointer"
          onClick={confirmDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


      {/* Edit Modal */}
      {editData && (
  <div className="fixed inset-0 z-[80] flex items-center justify-center">
    {/* backdrop */}
    <div className="absolute inset-0 bg-black/30" />

    {/* modal */}
    <div className="relative bg-white p-5 rounded shadow w-full max-w-md text-xs">
      <h3 className="font-semibold text-sm mb-3">
        Edit Cash Expense
      </h3>

      {["description", "paidBy"].map(field => (
        <input
          key={field}
          className="w-full border px-2 py-1 mb-2 rounded"
          placeholder={field}
          value={editData[field] || ""}
          onChange={e =>
            setEditData({ ...editData, [field]: e.target.value })
          }
        />
      ))}

      <select
        className="w-full border px-2 py-1 mb-2 rounded"
        value={editData.category}
        onChange={e =>
          setEditData({ ...editData, category: e.target.value })
        }
      >
        <option>Food</option>
        <option>Transport</option>
        <option>Shop</option>
        <option>Misc</option>
        <option>Salary Advance</option>
      </select>

      <input
        type="number"
        className="w-full border px-2 py-1 mb-3 rounded"
        value={editData.amount}
        onChange={e =>
          setEditData({ ...editData, amount: e.target.value })
        }
      />

      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-1 border rounded cursor-pointer"
          onClick={() => setEditData(null)}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer"
          onClick={saveEdit}
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
