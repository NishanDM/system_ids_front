import React, { useEffect, useState } from "react";

const CustomerEdit = ({ onClose }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);

  const PREFIX_OPTIONS = ["NONE", "MR", "MRS", "MISS", "VEN", "DR"];


  // ---------------- Fetch Customers ----------------
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/edit_customer/`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---------------- Debounce Search ----------------
  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // ---------------- Filtered Customers ----------------
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.alterPhone?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  });

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.toString().replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
  };

  // ---------------- Handle Field Change ----------------
  const handleChange = (field, value, isNew = false) => {
    setEditingCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ---------------- Save Edited Customer ----------------
  const saveChanges = async () => {
    if (!editingCustomer) return;
    setUpdating(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/edit_customer/${editingCustomer._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingCustomer),
        }
      );
      if (!res.ok) throw new Error("Failed to update customer");

      setCustomers((prev) =>
        prev.map((c) => (c._id === editingCustomer._id ? editingCustomer : c))
      );

      alert("✅ Customer updated successfully");
      setEditingCustomer(null);
    } catch {
      alert("⚠️ Failed to update customer");
    } finally {
      setUpdating(false);
    }
  };

  // ---------------- Add New Customer ----------------
  const createCustomer = async () => {
    if (!editingCustomer) return;
    setCreating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/edit_customer/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCustomer),
      });
      if (!res.ok) throw new Error("Failed to create customer");

      const newCustomer = await res.json();
      setCustomers((prev) => [newCustomer, ...prev]);
      alert("✅ Customer created successfully");
      setAddingCustomer(false);
      setEditingCustomer(null);
    } catch (err) {
      alert("⚠️ Failed to create customer: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  // ---------------- Delete Customer ----------------
  const deleteCustomer = async (customer) => {
    const phoneConfirm = prompt(
      `Enter the phone number of ${customer.name} to confirm deletion:`
    );

    if (!phoneConfirm || phoneConfirm !== customer.phone) {
      alert("❌ Phone number mismatch! Customer not deleted.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/edit_customer/${customer._id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete customer");

      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
      alert("✅ Customer deleted successfully");
    } catch (err) {
      alert("⚠️ Failed to delete customer: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 p-4 text-xs min-h-[500px] flex flex-col">
        {/* Header with Add + Refresh */}
        <div className="flex justify-between items-center border-b pb-3 mb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Customer Manager</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditingCustomer({
                  prefix: "",
                  name: "",
                  email: "",
                  phone: "",
                  alterPhone: "",
                  company: "",
                  address: "",
                });
                setAddingCustomer(true);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs cursor-pointer mr-10"
            >
              Add Customer
            </button>
            <button
              onClick={fetchCustomers}
              className="px-3 py-1 bg-cyan-800 text-white rounded hover:bg-cyan-900 text-xs cursor-pointer mr-10"
            >
              Refresh
            </button>
            <button onClick={onClose} className="px-3 py-1 bg-red-400 text-white rounded hover:bg-red-600 text-xs cursor-pointer mr-10">Close</button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-xs mb-4"
        />

        {/* Customer Table */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <div className="text-center text-red-600 font-medium">⚠️ {error}</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100 text-gray-600 uppercase text-left">
                  <tr>
                    <th className="px-3 py-2">No</th>
                    <th className="px-3 py-2">Prefix</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Alt Phone</th>
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">Address</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
<tbody className="divide-y divide-gray-100">
  {filteredCustomers.map((c, index) => (
    <tr 
      key={c._id} 
      className="hover:bg-gray-200 transition-colors" // <-- add this
    >
      <td className="px-3 py-2">{index + 1}</td>
      <td className="px-3 py-2" dangerouslySetInnerHTML={{ __html: highlightText(c.prefix, searchQuery) }} />
      <td className="px-3 py-2" dangerouslySetInnerHTML={{ __html: highlightText(c.name, searchQuery) }} />
      <td className="px-3 py-2" dangerouslySetInnerHTML={{ __html: highlightText(c.email || "-", searchQuery) }} />
      <td className="px-3 py-2" dangerouslySetInnerHTML={{ __html: highlightText(c.phone, searchQuery) }} />
      <td className="px-3 py-2">{c.alterPhone || "-"}</td>
      <td className="px-3 py-2">{c.company || "-"}</td>
      <td className="px-3 py-2">{c.address || "-"}</td>
      <td className="px-3 py-2 flex space-x-1">
        <button
          onClick={() => {
            setEditingCustomer(c);
            setAddingCustomer(false);
          }}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={() => deleteCustomer(c)}
          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 cursor-pointer"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Customer Modal */}
        {editingCustomer && (addingCustomer || !addingCustomer) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setEditingCustomer(null)}></div>

            <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 p-4 text-xs max-h-[80vh] overflow-y-auto">
              <h3 className="text-sm font-semibold mb-2">
                {addingCustomer ? "Add Customer" : `Edit Customer: ${editingCustomer.name}`}
              </h3>

              <div className="space-y-2">
                {["prefix","name","email","phone","alterPhone","company","address"].map((field) => (
                    <div key={field}>
                      <label className="block text-gray-600 text-xs">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>

                      {field === "prefix" ? (
                        <select
                          value={editingCustomer.prefix || "NONE"}
                          onChange={(e) => handleChange("prefix", e.target.value)}
                          className="w-full px-2 py-1 border rounded text-xs bg-white"
                        >
                          {PREFIX_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={editingCustomer[field] || ""}
                          onChange={(e) => handleChange(field, e.target.value)}
                          className="w-full px-2 py-1 border rounded text-xs"
                        />
                      )}
                    </div>
                  ))}

              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => { setEditingCustomer(null); setAddingCustomer(false); }}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                {addingCustomer ? (
                  <button
                    onClick={createCustomer}
                    disabled={creating}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs disabled:opacity-50 cursor-pointer"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                ) : (
                  <button
                    onClick={saveChanges}
                    disabled={updating}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs disabled:opacity-50 cursor-pointer"
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerEdit;
