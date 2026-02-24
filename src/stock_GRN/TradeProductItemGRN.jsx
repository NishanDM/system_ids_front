// TradeProductItemGRN.jsx
import React, { useState } from "react";
import axios from "axios";

const TradeProductItemGRN = ({ open, onClose, onAddToBill }) => {
  if (!open) return null;

  // Local state for form
  const initialFormData = {
  item: "",
  qty: 1,
  costPrice: "",
  capacity: "",
  color: "",
  region: "",
  serial: "",
  imei: "",
  condition: "Used",
};
const [formData, setFormData] = useState(initialFormData);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const [successMessage, setSuccessMessage] = useState("");
const [loading, setLoading] = useState(false);

//===================   ADD THE PARTICULAR PRODUCT ITEM INTO THE STOCK ==============================
const handleAddToStock = async () => {
  // Destructure
  const { item, qty, costPrice, capacity, color, region, serial, imei, condition } = formData;

  // Validation
  if (!item || !qty || !costPrice || !capacity || !color || !region || !serial || !imei || !condition) {
    alert("Please fill in all required fields!");
    throw new Error("Validation failed"); // 🔴 IMPORTANT
  }

  if (isNaN(Number(qty)) || isNaN(Number(costPrice))) {
    alert("Quantity and Cost Price must be valid numbers.");
    throw new Error("Invalid number input");
  }

  const payload = {
    category: "product",
    key: item,
    label: item.replace(/_/g, " "),
    qty: Number(qty),
    unitPrice: Number(costPrice),
    attributes: {
      model: capacity,
      color,
      region,
      serialNumber: serial,
      imeiNumber: imei,
      condition,
    },
  };

  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/stock`,
    payload
  );

  console.log("Stock Added Successfully:", res.data); // ✅ ALWAYS logs on success

  setSuccessMessage("Item successfully added to stock!");
  setTimeout(() => setSuccessMessage(""), 3000);

  return res.data; // ✅ explicit success signal
};
const addBillAndStock = async () => {
  if (loading) return;
  setLoading(true);

  try {
    // 1️⃣ Add to stock
    const stockData = await handleAddToStock(); // will THROW if invalid

    // 2️⃣ Only runs if stock was added successfully
    await onAddToBill(formData);

    alert("Successfully added to the bill and stock!");

    setFormData(initialFormData);
    onClose();

  } catch (err) {
    console.error("Add Bill & Stock failed:", err.message);
    // No bill creation happens here
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 p-6 text-sm min-h-[300px]">
        <h2 className="text-lg font-bold mb-4">Trade Product Item</h2>

        {/* 🔥 3x3 GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Item */}
          <div>
            <label className="text-xs font-semibold">Item</label>
            <select
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="">Select Item</option>
              <option value="iphone_11">iPhone 11</option>
                <option value="iphone_11_pro">iPhone 11 Pro</option>
                <option value="iphone_11_pro_max">iPhone 11 Pro Max</option>

                <option value="iphone_12">iPhone 12</option>
                <option value="iphone_12_mini">iPhone 12 Mini</option>
                <option value="iphone_12_pro">iPhone 12 Pro</option>
                <option value="iphone_12_pro_max">iPhone 12 Pro Max</option>

                <option value="iphone_13">iPhone 13</option>
                <option value="iphone_13_mini">iPhone 13 Mini</option>
                <option value="iphone_13_pro">iPhone 13 Pro</option>
                <option value="iphone_13_pro_max">iPhone 13 Pro Max</option>

                <option value="iphone_14">iPhone 14</option>
                <option value="iphone_14_plus">iPhone 14 Plus</option>
                <option value="iphone_14_pro">iPhone 14 Pro</option>
                <option value="iphone_14_pro_max">iPhone 14 Pro Max</option>

                <option value="iphone_15">iPhone 15</option>
                <option value="iphone_15_plus">iPhone 15 Plus</option>
                <option value="iphone_15_pro">iPhone 15 Pro</option>
                <option value="iphone_15_pro_max">iPhone 15 Pro Max</option>

                <option value="iphone_16">iPhone 16</option>
                <option value="iphone_16_plus">iPhone 16 Plus</option>
                <option value="iphone_16e">iPhone 16e</option>
                <option value="iphone_16_pro">iPhone 16 Pro</option>
                <option value="iphone_16_pro_max">iPhone 16 Pro Max</option>

                <option value="iphone_17">iPhone 17</option>
                <option value="iphone_air">iPhone Air</option>
                <option value="iphone_17_pro">iPhone 17 Pro</option>
                <option value="iphone_17_pro_max">iPhone 17 Pro Max</option>

                <option value="samsung_s23">Samsung S23</option>
                <option value="samsung_s23_ultra">Samsung S23 Ultra</option>

                <option value="samsung_s24">Samsung S24</option>
                <option value="samsung_s24_ultra">Samsung S24 Ultra</option>

                <option value="samsung_s25">Samsung S25</option>
                <option value="samsung_s25_ultra">Samsung S25 Ultra</option>
               
                <option value="macbook_air_13">MacBook Air 13</option>
                <option value="macbook_air_15">MacBook Air 15</option>

                <option value="macbook_pro_13">MacBook Pro 13</option>
                <option value="macbook_pro_14">MacBook Pro 14</option>
                <option value="macbook_pro_16">MacBook Pro 16</option>

                <option value="ipad_9_7">iPad 9.7</option>
                <option value="ipad_10_2">iPad 10.2</option>
                <option value="ipad_10_9">iPad 10.9</option>

                <option value="ipad_air_10_5">iPad Air 10.5</option>
                <option value="ipad_air_10_9">iPad Air 10.9</option>
                <option value="ipad_air_11">iPad Air 11</option>
                <option value="ipad_air_13">iPad Air 13</option>

                <option value="ipad_mini_7_9">iPad mini 7.9</option>
                <option value="ipad_mini_8_3">iPad mini 8.3</option>

                <option value="ipad_pro_9_7">iPad Pro 9.7</option>
                <option value="ipad_pro_10_5">iPad Pro 10.5</option>
                <option value="ipad_pro_11">iPad Pro 11</option>
                <option value="ipad_pro_12_9">iPad Pro 12.9</option>
                <option value="ipad_pro_13">iPad Pro 13</option>

                <option value="apple_watch_series">Apple Watch Series</option>
                <option value="apple_watch_se">Apple Watch SE</option>
                <option value="apple_watch_ultra">Apple Watch Ultra</option>

                <option value="airpods">AirPods</option>
                <option value="airpods_2">AirPods 2</option>
                <option value="airpods_3">AirPods 3</option>
                <option value="airpods_pro">AirPods Pro</option>
                <option value="airpods_max">AirPods Max</option>

                <option value="imac">iMac</option>
                <option value="mac_mini">Mac mini</option>
                <option value="mac_studio">Mac Studio</option>
                <option value="mac_pro">Mac Pro</option>

                <option value="studio_display">Studio Display</option>
                <option value="pro_display_xdr">Pro Display XDR</option>

                <option value="apple_tv_hd">Apple TV HD</option>
                <option value="apple_tv_4k">Apple TV 4K</option>

                <option value="homepod">HomePod</option>
                <option value="homepod_mini">HomePod mini</option>

                <option value="magic_keyboard">Magic Keyboard</option>
                <option value="magic_mouse">Magic Mouse</option>
                <option value="magic_trackpad">Magic Trackpad</option>
                <option value="apple_pencil">Apple Pencil</option>
                <option value="airtag">AirTag</option>

            </select>
          </div>

          {/* Qty */}
          <div>
            <label className="text-xs font-semibold">Qty</label>
            <input
              type="number"
              name="qty"
              min="1"
              value={formData.qty}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="text-xs font-semibold">Cost Price</label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="text-xs font-semibold">Capacity</label>
            <select
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="">NULL</option>
              <option>64</option>
              <option>128</option>
              <option>256</option>
              <option>512</option>
              <option>1TB</option>
              <option>2TB</option>
              <option>8GB / 256GB</option>
              <option>8GB / 512GB</option>
              <option>16GB / 256GB</option>
              <option>16GB / 512GB</option>
              <option>16GB / 1TB</option>
              <option>24GB / 512GB</option>
              <option>24GB / 1TB</option>
              <option>32GB / 512GB</option>
              <option>32GB / 1TB</option>
              <option>32GB / 2TB</option>
              <option>36GB / 1TB</option>
              <option>36GB / 2TB</option>
              <option>48GB / 1TB</option>
              <option>48GB / 2TB</option>
              <option>64GB / 1TB</option>
              <option>64GB / 2TB</option>
              <option>64GB / 4TB</option>
              <option>96GB / 2TB</option>
              <option>96GB / 4TB</option>
              <option>128GB / 4TB</option>
              <option>128GB / 8TB</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold">Color</label>
            <select
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="">NULL</option>
              <option>BLACK</option>
              <option>WHITE</option>
              <option>STARLIGHT</option>
              <option>MIDNIGHT</option>
              <option>BLUE</option>
              <option>LIGHT BLUE</option>
              <option>PINK</option>
              <option>GREEN</option>
              <option>YELLOW</option>
              <option>PURPLE</option>
              <option>RED</option>
              <option>CORAL</option>
              <option>TEAL</option>
              <option>ULTRAMARINE</option>
              <option>ORANGE</option>
              <option>SIERRA BLUE</option>
              <option>PACIFIC BLUE</option>
              <option>ALPINE GREEN</option>
              <option>FOREST GREEN</option>
              <option>GOLD</option>
              <option>SILVER</option>
              <option>GRAPHITE</option>
              <option>SPACE GRAY</option>
              <option>JET BLACK</option>
              <option>ROSE GOLD</option>
              <option>TITANIUM</option>
              <option>NATURAL TITANIUM</option>
              <option>BLUE TITANIUM</option>
              <option>WHITE TITANIUM</option>
              <option>BLACK TITANIUM</option>
              <option>DESERT TITANIUM</option>
              <option>DESERT BLACK</option>
              <option>MIST BLUE</option>
              <option>SAGE</option>
              <option>LAVENDER</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="text-xs font-semibold">Region / Country</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="">Select Region</option>
                <option>NULL</option>
                <option>ZPA</option>
                <option>XA</option>
                <option>HNA</option>
                <option>AEA</option>
                <option>QNA</option>
                <option>LLA</option>
                <option>JA</option>
                <option>CHA</option>
                <option>HKA</option>
                <option>INA</option>
                <option>KHA</option>
                <option>THA</option>
                <option>MYA</option>
                <option>IDA</option>
                <option>SNA</option>
                <option>TWA</option>
                <option>BRA</option>
                <option>MEXA</option>
                <option>RUA</option>
                <option>TUA</option>
                <option>EU</option>
                <option>UKA</option>
                <option>VNA</option>
                <option>VIETNAM</option>
            </select>
          </div>

          {/* Serial Number */}
          <div>
            <label className="text-xs font-semibold"><span className="text-red-500 font-bold mr-1">*</span>Serial Number</label>
            <input
              type="text"
              name="serial"
              value={formData.serial}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder="**This field is mandetory**"
              required
            />
          </div>

          {/* IMEI */}
          <div>
            <label className="text-xs font-semibold">IMEI Number</label>
            <input
              type="text"
              name="imei"
              value={formData.imei}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder="Please give NULL when no IMEI"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="text-xs font-semibold">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option>Used</option>
              <option>New</option>
            </select>
          </div>

        </div>
{/* Success Message */}
{successMessage && (
  <div className="w-full text-center text-green-600 font-semibold mt-4">
    {successMessage}
  </div>
)}
        {/* Buttons */}
        <div className="flex justify-end mt-6">
           <button
            onClick={addBillAndStock}
            disabled={loading}
            className={`px-3 py-1 rounded text-xs mr-2 cursor-pointer font-bold text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-700 hover:bg-cyan-900"
            }`}
          >
            {loading ? "Processing..." : "Add to Bill & Stock"}
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs cursor-pointer hover:bg-red-700 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeProductItemGRN;
