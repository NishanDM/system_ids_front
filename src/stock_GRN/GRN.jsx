// GRN.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import devicesList from "./devices.json";
import StockUpdateOverlay from "./StockUpdateOverlay";
import AddGRNItemManual from "./AddGRNItemManual";
import BulkGRN from "./BulkGRN";

/**
 * GRN.jsx
 *
 * Props:
 *  - open (bool) : whether modal is visible
 *  - onClose (fn) : called when modal closed
 *  - onSave (fn)  : called with GRN payload when Save GRN is clicked
 *
 * This component uses Tailwind CSS classes only. All text uses `text-xs`.
 *
 * Customize `itemOptions` and `attributeConfigs` to reflect your real catalog.
 */

export default function GRN({ open = true, onClose = () => {}, onSave = (payload) => {} }) {

//===================FETCHING SUPPLIERS====================
  // Suppliers dropdown
  const [suppliers, setSuppliers] = useState([]);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
//===============ADD A NEW SUPPLIER===========
// Add at the top with other useState hooks
const [newSupplierName, setNewSupplierName] = useState("");
const [newSupplierPhone, setNewSupplierPhone] = useState("");
const [newSupplierEmail, setNewSupplierEmail] = useState("");
const [newSupplierLocation, setNewSupplierLocation] = useState("");
const [paymentMethodOfGRN, setpaymentMethodOfGRN] = useState("");
const [currentStockQty, setCurrentStockQty] = useState(null);
const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
const [overlayOpen, setOverlayOpen] = useState(false);
const [overlayMessage, setOverlayMessage] = useState("");
const [manualItemOpen, setManualItemOpen] = useState(false);
const [bulkGRNOpen, setBulkGRNOpen] = useState(false);


// const valuesForAccessories = require("./devices.json");


// const valuesForAccessories = require("./devices.json");
function handleAttemptClose() {
  if (items.length > 0) {
    // There are items in table, show confirmation modal
    setConfirmCloseOpen(true);
  } else {
    // Safe to close
    onClose();
  }
}

const handleAddSupplier = async () => {
  if (!newSupplierName.trim()) {
    alert("Supplier name is required.");
    return;
  }

  const newSupplier = {
    supplierName: newSupplierName,
    contactPhone: newSupplierPhone,
    contactEmail: newSupplierEmail || "N/A",
    location: newSupplierLocation,
  };

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/suppliers`, newSupplier);
    if (!response.data) throw new Error("Failed to add supplier");

    // Close modal
    setAddSupplierOpen(false);
    // Reset form
    setNewSupplierName("");
    setNewSupplierPhone("");
    setNewSupplierEmail("");
    setNewSupplierLocation("");

    // Update suppliers list with new supplier
    setSuppliers(prev => [...prev, response.data]);
    setSupplier(response.data.supplierName); // optionally auto-select new supplier

    alert("Supplier added successfully!");
  } catch (error) {
    console.error(error);
    alert("Error adding supplier");
  }
};

  // Fetch suppliers from backend
  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/suppliers`);
        setSuppliers(res.data); // assuming res.data is array of suppliers
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      }
    }
    fetchSuppliers();
  }, []);

  useEffect(() => {
  if (addSupplierOpen) {
    document.getElementById("newSupplierName")?.focus();
  }
}, [addSupplierOpen]);


  // Header fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [invoice, setInvoice] = useState("");
  const [supplier, setSupplier] = useState("");

  // Item entry state
  const [category, setCategory] = useState(""); // "spare", "accessory", "product"
  const [selectedItemKey, setSelectedItemKey] = useState(""); // key from itemOptions
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [attributes, setAttributes] = useState({});

  // GRN table
  const [items, setItems] = useState([]);
  const [stockUpdated, setStockUpdated] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);


  const [matchedDescriptions, setMatchedDescriptions] = useState([]); // list of options
const [selectDescriptionModalOpen, setSelectDescriptionModalOpen] = useState(false); // show/hide modal


  // Sample catalog - replace with real data / fetch from backend if needed
  const itemOptions = useMemo(() => ({
    spare: [
  { key: "charging_flex", label: "Charging Flex" },
  { key: "back_glass", label: "Back Glass" },
  { key: "battery", label: "Battery" },
  { key: "back_camera", label: "Back Camera" },
  { key: "front_camera", label: "Front Camera" },
  { key: "display_screen", label: "Display" },
  { key: "ear_speaker", label: "Ear Speaker" },
  { key: "volume_buttons", label: "Volume Buttons" },
  { key: "power_button", label: "Power Button" },
  { key: "wifi_antena", label: "Wi-Fi Antena" },
  { key: "vibrator_motor", label: "Vibrator Motor" },
  { key: "home_button", label: "Home Button" },
  { key: "ic", label: "IC" },
  { key: "nfc_part", label: "NFC Part" },
  { key: "flasher", label: "Flasher" },
  { key: "power_key", label: "Power Key" },
  { key: "iphone_housing", label: "iPhone Housing" },
  { key: "proximity", label: "Proximity Sensor" },
  { key: "motherboard", label: "Mother Board" },
  { key: "face_id_module", label: "Face ID Module" },
  { key: "touch_id", label: "Touch ID Sensor" },
  { key: "charging_port", label: "Charging Port" },
  { key: "power_button", label: "Power Button" },
  { key: "volume_button", label: "Volume Button" },
  { key: "speaker", label: "Speaker" },
  { key: "microphone", label: "Microphone" },  
  { key: "macbook_panel", label: "MacBook Panel" },
  { key: "ipad_digitizer", label: "iPad Digitizer" },
  { key: "macbook_touch_bar", label: "MacBook Touch Bar" },
  { key: "macbook_keyboard", label: "MacBook Keyboard" }, 
  { key: "macbook_trackpad", label: "MacBook Trackpad" },   
  { key: "on_off_ribbon", label: "On-Off Ribbon" },
  { key: "volumn_ribbon", label: "Volume Ribbon" },
  { key: "power_supplier", label: "Power Supplier" },
  { key: "hard_disk", label: "Hard Disk" },
  { key: "imac_fan", label: "iMac Fan" },
  { key: "imac_powersupply", label: "iMac Power Supply" },
  { key: "graphic_card", label: "Graphic Card" },
],

    accessory: [
  // Common iPhone / iPad accessories
  { key: "back_cover", label: "Back Cover" },
  { key: "tempered_glass", label: "Tempered Glass" },
  { key: "camera_lens", label: "Camera Lens" },

  { key: "charger_20w", label: "20W Power Adaptor" },
  { key: "charger_5w", label: "5W Power Adaptor" },
  { key: "charger_12w", label: "12W Power Adaptor" },

  { key: "45W_MagSafe_1_Power_Adaptors", label: "45W MagSafe 1 Power Adaptors" },
  { key: "30W_MagSafe_1_Power_Adaptors", label: "30W MagSafe 1 Power Adaptors" },
  { key: "30W_Type_C Power_Adaptors", label: "30W Type C Power Adaptors" },
  { key: "61W_Type_C_Power_Adaptors", label: "61W Type C Power Adaptors" },
  { key: "60W_MagSafe_1_Power_Adaptors", label: "60W MagSafe 1 Power Adaptors" },
  { key: "85W_MagSafe_1_Power_Adaptors", label: "85W MagSafe 1 Power Adaptors" },

  { key: "45W_MagSafe_2_Power_Adaptors", label: "45W MagSafe 2 Power Adaptors" },
  { key: "60W_MagSafe_2_Power_Adaptors", label: "60W MagSafe 2 Power Adaptors" },
  { key: "85W_MagSafe_2_Power_Adaptors", label: "85W MagSafe 2 Power Adaptors" },

  { key: "Samsung_25W_Type_C_PWR_Adaptors", label: "Samsung 25W Type C PWR Adaptors" },
  { key: "Samsung_45W_Type_C_PWR_Adaptors", label: "Samsung 45W Type C PWR Adaptors" },
  { key: "Google_30W_Type_C_PWR_Adaptors", label: "Google 30W Type C PWR Adaptors" },

  { key: "multi_remax", label: "Multi Charger - Remax" },
  { key: "multi_wiwu", label: "Multi Charger - WIWU" },

  { key: "USB_to_Lightning_Cable-1m", label: "USB to Lightning Cable-1m" },
  { key: "Type_C_to_type_C_1m", label: "Type C to type C - 1m" },
  { key: "Type_C_to_type_C_2m", label: "Type C to type C - 2m" },
  { key: "Type_C_to_Lightning_1m", label: "Type C to Lightning - 1m" },
  { key: "Type_C_to_Lightning_2m", label: "Type C to Lightning - 2m" },
  { key: "30Pin_Cable_1m", label: "30Pin Cable 1m" },
  { key: "Type_C_to_MagSafe_3_2m", label: "Type C to MagSafe 3 - 2m" },

  { key: "Type_C_iWatch_Cable", label: "Type C iWatch Cable" },
  { key: "USB_iWatch_Cable", label: "USB iWatch Cable" },
  
  { key: "3.5mm_EarPods", label: "3.5mm EarPods" },
  { key: "Type_C_EarPods", label: "Type C EarPods" },
  { key: "Lightning_EarPods", label: "Lightning EarPods" },

  { key: "convertor_type_c_to_3.5mm", label: "Convertor Type C to 3.5mm" },
    
  { key: "car_charger_Anker", label: "Car Charger - Anker" },
  { key: "car_charger_Apple", label: "Car Charger - Apple" },
  { key: "car_charger_Baseus", label: "Car Charger - Baseus" },
  { key: "car_charger_KeePhone", label: "Car Charger - KeePhone" },

  { key: "bag_normal", label: "Laptop Bag Normal" },
  { key: "bag_mouse", label: "Laptop Bag with Mouse" },

  { key: "keyboard_case", label: "iPad Keyboard Case" },
  { key: "hard_case", label: "iPad Hard Case" },

  { key: "stabilizer", label: "Phone Stabilizer" },

  { key: "pouch_ipad", label: "iPad Pouch" },
  { key: "pouch_macbook", label: "MacBook Pouch" },

  { key: "power_bank_aspor_5000", label: "PowerBank 5000 - Aspor" },
  { key: "power_bank_aspor_10000", label: "PowerBank 10000 - Aspor" },
  { key: "power_bank_baseus_6000", label: "PowerBank 6000 - Baseus" },
  { key: "power_bank_baseus_10000", label: "PowerBank 10000 - Baseus" },
  { key: "power_bank_keephone_10000", label: "PowerBank 10000 - KeePhone" },
  { key: "power_bank_keephone_5000", label: "PowerBank 5000 - KeePhone" },

  { key: "Liberty_4NC", label: "Soundcore Liberty 4NC" },
  { key: "R100", label: "Soundcore R100" },
  { key: "P40i", label: "Soundcore P40i" },
  { key: "R50i", label: "Soundcore R50i" },

  { key: "AirPods_Case_spigen", label: "Spigen AirPods Case" },
  { key: "AirPods_Case_berlin", label: "Berlin AirPods Case" },
  { key: "AirPods_Case_keephone", label: "KeePhone AirPods Case" },

  { key: "iwatch_case", label: "iWatch Case" },
  { key: "iwatch_strap", label: "iWatch Strap" },
],

    product: [
   // iPhones
  { key: "iphone_5", label: "iPhone 5" },
  { key: "iphone_5S", label: "iPhone 5S" },

  { key: "iphone_6", label: "iPhone 6" },
  { key: "iphone_6_plus", label: "iPhone 6 Plus" },
  { key: "iphone_6s", label: "iPhone 6s" },
  { key: "iphone_6s_plus", label: "iPhone 6s Plus" },

  { key: "iphone_se_1st_gen", label: "iPhone SE (1st generation)" },
  { key: "iphone_se_2nd_gen", label: "iPhone SE (2nd generation)" },
  { key: "iphone_se_3rd_gen", label: "iPhone SE (3rd generation)" },
  { key: "iphone_7", label: "iPhone 7" },
  { key: "iphone_7_plus", label: "iPhone 7 Plus" },

  { key: "iphone_8", label: "iPhone 8" },
  { key: "iphone_8_plus", label: "iPhone 8 Plus" },

  { key: "iphone_x", label: "iPhone X" },
  { key: "iphone_xs", label: "iPhone XS" },
  { key: "iphone_xs_max", label: "iPhone XS Max" },
  { key: "iphone_xr", label: "iPhone XR" },

  { key: "iphone_11",       label: "iPhone 11" },
  { key: "iphone_11_pro",   label: "iPhone 11 Pro" },
  { key: "iphone_11_pro_max", label: "iPhone 11 Pro Max" },

  { key: "iphone_12",       label: "iPhone 12" },
  { key: "iphone_12_mini",  label: "iPhone 12 Mini" },
  { key: "iphone_12_pro",   label: "iPhone 12 Pro" },
  { key: "iphone_12_pro_max", label: "iPhone 12 Pro Max" },

  { key: "iphone_13",       label: "iPhone 13" },
  { key: "iphone_13_mini",  label: "iPhone 13 Mini" },
  { key: "iphone_13_pro",   label: "iPhone 13 Pro" },
  { key: "iphone_13_pro_max", label: "iPhone 13 Pro Max" },

  { key: "iphone_14",       label: "iPhone 14" },
  { key: "iphone_14_plus",  label: "iPhone 14 Plus" },
  { key: "iphone_14_pro",   label: "iPhone 14 Pro" },
  { key: "iphone_14_pro_max", label: "iPhone 14 Pro Max" },

  { key: "iphone_15",       label: "iPhone 15" },
  { key: "iphone_15_plus",  label: "iPhone 15 Plus" },
  { key: "iphone_15_pro",   label: "iPhone 15 Pro" },
  { key: "iphone_15_pro_max", label: "iPhone 15 Pro Max" },

  { key: "iphone_16",       label: "iPhone 16" },
  { key: "iphone_16_plus",  label: "iPhone 16 Plus" },
  { key: "iphone_16e",      label: "iPhone 16e" },  // entry-level model according to wiki. :contentReference[oaicite:1]{index=1}
  { key: "iphone_16_pro",   label: "iPhone 16 Pro" },
  { key: "iphone_16_pro_max", label: "iPhone 16 Pro Max" },

  { key: "iphone_17",       label: "iPhone 17" },
  { key: "iphone_air",      label: "iPhone Air" },  // special model announced in 2025. :contentReference[oaicite:2]{index=2}
  { key: "iphone_17_pro",   label: "iPhone 17 Pro" },
  { key: "iphone_17_pro_max", label: "iPhone 17 Pro Max" },

  { key: "redmi", label: "Redmi Note 14 Pro"},
  { key: "pixel_7_pro", label: "Pixel 7 Pro" },
  { key: "pixel_9_pro_xl", label: "Pixel 9 Pro XL" },

  { key: "samsung_s23_ultra", label: "Samsung S23 Ultra" },
  { key: "samsung_s23", label: "Samsung S23" },

  { key: "samsung_s24", label: "Samsung S24" },
  { key: "samsung_s24_ultra", label: "Samsung S24 Ultra" },

  { key: "samsung_s25", label: "Samsung S25" },
  { key: "samsung_s25_ultra", label: "Samsung S25 Ultra" },


  // iPads
 // ---------- iPad (Standard) ----------
  { key: "ipad_1st_gen", label: "iPad (1st Gen)" },
  { key: "ipad_2nd_gen", label: "iPad (2nd Gen)" },
  { key: "ipad_3rd_gen", label: "iPad (3rd Gen)" },
  { key: "ipad_4th_gen", label: "iPad (4th Gen)" },
  { key: "ipad_5th_gen", label: "iPad (5th Gen)" },
  { key: "ipad_6th_gen", label: "iPad (6th Gen)" },
  { key: "ipad_7th_gen", label: "iPad (7th Gen)" },
  { key: "ipad_8th_gen", label: "iPad (8th Gen)" },
  { key: "ipad_9th_gen", label: "iPad (9th Gen)" },
  { key: "ipad_10th_gen", label: "iPad (10th Gen)" },
  { key: "ipad_11th_gen", label: "iPad (11th Gen)" },

  // ---------- iPad Mini ----------
  { key: "ipad_mini_1", label: "iPad Mini (1st Gen)" },
  { key: "ipad_mini_2", label: "iPad Mini 2" },
  { key: "ipad_mini_3", label: "iPad Mini 3" },
  { key: "ipad_mini_4", label: "iPad Mini 4" },
  { key: "ipad_mini_5", label: "iPad Mini 5" },
  { key: "ipad_mini_6", label: "iPad Mini 6" },
  { key: "ipad_mini_7", label: "iPad Mini 7" },

  // ---------- iPad Air ----------
  { key: "ipad_air_1", label: "iPad Air (1st Gen)" },
  { key: "ipad_air_2", label: "iPad Air (2nd Gen)" },
  { key: "ipad_air_3", label: "iPad Air (3rd Gen)" },
  { key: "ipad_air_4", label: "iPad Air (4th Gen)" },
  { key: "ipad_air_5", label: "iPad Air (5th Gen)" },
  { key: "ipad_air_6", label: "iPad Air (6th Gen)" },
  { key: "ipad_air_7", label: "iPad Air (7th Gen)" },

  // ---------- iPad Pro ----------
  { key: "ipad_pro_9_7_1st_gen", label: "iPad Pro 9.7\"" },
  { key: "ipad_pro_10_5", label: "iPad Pro 10.5\"" },
  { key: "ipad_pro_11_1st_gen", label: "iPad Pro 11\" (1st Gen)" },
  { key: "ipad_pro_11_2nd_gen", label: "iPad Pro 11\" (2nd Gen)" },
  { key: "ipad_pro_11_3rd_gen", label: "iPad Pro 11\" (3rd Gen)" },
  { key: "ipad_pro_11_4th_gen", label: "iPad Pro 11\" (4th Gen)" },
  { key: "ipad_pro_12_9_1st_gen", label: "iPad Pro 12.9\" (1st Gen)" },
  { key: "ipad_pro_12_9_2nd_gen", label: "iPad Pro 12.9\" (2nd Gen)" },
  { key: "ipad_pro_12_9_3rd_gen", label: "iPad Pro 12.9\" (3rd Gen)" },
  { key: "ipad_pro_12_9_4th_gen", label: "iPad Pro 12.9\" (4th Gen)" },
  { key: "ipad_pro_12_9_5th_gen", label: "iPad Pro 12.9\" (5th Gen)" },
  { key: "ipad_pro_12_9_6th_gen", label: "iPad Pro 12.9\" (6th Gen)" },
  { key: "ipad_pro_13_m4", label: "iPad Pro 13\" (M4, 2024)" },

  // MacBooks 
  { key: "macbook_air_2012_11", label: "MacBook Air 11\" - Intel - A1465 - 2012" },
  { key: "macbook_air_2012_13", label: "MacBook Air 13\" - Intel - A1466 - 2012" },
  { key: "macbook_air_2013_11", label: "MacBook Air 11\" - Intel - A1465 - 2013" },
  { key: "macbook_air_2013_13", label: "MacBook Air 13\" - Intel - A1466 - 2013" },
  { key: "macbook_air_2014_11", label: "MacBook Air 11\" - Intel - A1465 - 2014" },
  { key: "macbook_air_2014_13", label: "MacBook Air 13\" - Intel - A1466 - 2014" },

  { key: "macbook_pro_13_2012", label: "MacBook Pro 13\" - Intel - A1278 - 2012" },
  { key: "macbook_pro_15_2012", label: "MacBook Pro 15\" - Intel - A1286 - 2012" },

  { key: "macbook_pro_13_retina_2012", label: "MacBook Pro 13\" Retina - Intel - A1425 - 2012" },
  { key: "macbook_pro_13_retina_2013", label: "MacBook Pro 13\" Retina - Intel - A1502 - 2013" },
  { key: "macbook_pro_13_retina_2014", label: "MacBook Pro 13\" Retina - Intel - A1502 - 2014" },
  { key: "macbook_pro_15_retina_2012", label: "MacBook Pro 15\" Retina - Intel - A1398 - 2012" },
  { key: "macbook_pro_15_retina_2013", label: "MacBook Pro 15\" Retina - Intel - A1398 - 2013" },
  { key: "macbook_pro_15_retina_2014", label: "MacBook Pro 15\" Retina - Intel - A1398 - 2014" },

  { key: "macbook_12_2015", label: "MacBook 12\" - Intel - A1534 - 2015" },
  { key: "macbook_12_2016", label: "MacBook 12\" - Intel - A1534 - 2016" },
  { key: "macbook_12_2017", label: "MacBook 12\" - Intel - A1534 - 2017" },

  { key: "macbook_air_2015", label: "MacBook Air 13\" - Intel - A1466 - 2015" },
  { key: "macbook_air_2017", label: "MacBook Air 13\" - Intel - A1466 - 2017" },
  { key: "macbook_air_retina_2018", label: "MacBook Air 13\" Retina - Intel - A1932 - 2018" },
  { key: "macbook_air_2020_intel", label: "MacBook Air 13\" - Intel - A2179 - 2020" },

  { key: "macbook_air_m1", label: "MacBook Air 13\" - M1 - A2337 - 2020" },
  { key: "macbook_air_m2_13", label: "MacBook Air 13\" - M2 - A2681 - 2022" },
  { key: "macbook_air_m2_15", label: "MacBook Air 15\" - M2 - A2941 - 2023" },
  { key: "macbook_air_m3_13", label: "MacBook Air 13\" - M3 - A3113 - 2024" },
  { key: "macbook_air_m3_15", label: "MacBook Air 15\" - M3 - A3114 - 2024" },

  { key: "macbook_pro_13_2015", label: "MacBook Pro 13\" - Intel - A1502 - 2015" },
  { key: "macbook_pro_13_A2171", label: "MacBook Pro 13\" - A2171" },
  { key: "macbook_pro_13_2016", label: "MacBook Pro 13\" Touch Bar - Intel - A1706/A1708 - 2016" },
  { key: "macbook_pro_13_2018", label: "MacBook Pro 13\" - Intel - A1989 - 2018" },
  { key: "macbook_pro_13_2020_intel", label: "MacBook Pro 13\" - Intel - A2289 - 2020" },
  { key: "macbook_pro_13_m1", label: "MacBook Pro 13\" - M1 - A2338 - 2020" },
  { key: "macbook_pro_13_m2", label: "MacBook Pro 13\" - M2 - A2338 - 2022" },

  { key: "macbook_pro_14_m1_pro", label: "MacBook Pro 14\" - M1 Pro - A2442 - 2021" },
  { key: "macbook_pro_14_m1_max", label: "MacBook Pro 14\" - M1 Max - A2442 - 2021" },
  { key: "macbook_pro_14_m2_pro", label: "MacBook Pro 14\" - M2 Pro - A2779 - 2023" },
  { key: "macbook_pro_14_m2_max", label: "MacBook Pro 14\" - M2 Max - A2779 - 2023" },

  { key: "macbook_pro_16_m1_pro", label: "MacBook Pro 16\" - M1 Pro - A2485 - 2021" },
  { key: "macbook_pro_16_m1_max", label: "MacBook Pro 16\" - M1 Max - A2485 - 2021" },
  { key: "macbook_pro_16_m2_pro", label: "MacBook Pro 16\" - M2 Pro - A2780 - 2023" },
  { key: "macbook_pro_16_m2_max", label: "MacBook Pro 16\" - M2 Max - A2780 - 2023" },

  { key: "macbook_pro", label: "MacBook Pro" },
  { key: "macbook_air", label: "MacBook Air" },
  { key: "macbook", label: "MacBook" },

  { key: "airpods_1", label: "AirPods (1st Generation)" },
  { key: "airpods_2", label: "AirPods (2nd Generation)" },
  { key: "airpods_3", label: "AirPods (3rd Generation)" },
  { key: "airpods_4", label: "AirPods (4th Generation)" },
  { key: "airpods_4_anc", label: "AirPods (4th Generation, with ANC)" },
  { key: "airpods_pro_1", label: "AirPods Pro (1st Generation)" },
  { key: "airpods_pro_2", label: "AirPods Pro (2nd Generation)" },
  { key: "airpods_pro_3", label: "AirPods Pro (3rd Generation)" },
  { key: "airpods_max", label: "AirPods Max" },
  
  // ---------- Apple Watch Series 1 ----------
{ key: "apple_watch_series_1_38mm", label: "Apple Watch Series 1 (38mm)" },
{ key: "apple_watch_series_1_42mm", label: "Apple Watch Series 1 (42mm)" },

// ---------- Apple Watch Series 2 ----------
{ key: "apple_watch_series_2_38mm", label: "Apple Watch Series 2 (38mm)" },
{ key: "apple_watch_series_2_42mm", label: "Apple Watch Series 2 (42mm)" },

// ---------- Apple Watch Series 3 ----------
{ key: "apple_watch_series_3_38mm", label: "Apple Watch Series 3 (38mm)" },
{ key: "apple_watch_series_3_42mm", label: "Apple Watch Series 3 (42mm)" },

// ---------- Apple Watch Series 4 ----------
{ key: "apple_watch_series_4_40mm", label: "Apple Watch Series 4 (40mm)" },
{ key: "apple_watch_series_4_44mm", label: "Apple Watch Series 4 (44mm)" },

// ---------- Apple Watch Series 5 ----------
{ key: "apple_watch_series_5_40mm", label: "Apple Watch Series 5 (40mm)" },
{ key: "apple_watch_series_5_44mm", label: "Apple Watch Series 5 (44mm)" },

// ---------- Apple Watch Series 6 ----------
{ key: "apple_watch_series_6_40mm", label: "Apple Watch Series 6 (40mm)" },
{ key: "apple_watch_series_6_44mm", label: "Apple Watch Series 6 (44mm)" },

// ---------- Apple Watch Series 7 ----------
{ key: "apple_watch_series_7_41mm", label: "Apple Watch Series 7 (41mm)" },
{ key: "apple_watch_series_7_45mm", label: "Apple Watch Series 7 (45mm)" },

// ---------- Apple Watch Series 8 ----------
{ key: "apple_watch_series_8_41mm", label: "Apple Watch Series 8 (41mm)" },
{ key: "apple_watch_series_8_45mm", label: "Apple Watch Series 8 (45mm)" },

// ---------- Apple Watch Series 9 ----------
{ key: "apple_watch_series_9_41mm", label: "Apple Watch Series 9 (41mm)" },
{ key: "apple_watch_series_9_45mm", label: "Apple Watch Series 9 (45mm)" },

// ---------- Apple Watch Series 10 ----------
{ key: "apple_watch_series_10_42mm", label: "Apple Watch Series 10 (42mm)" },
{ key: "apple_watch_series_10_46mm", label: "Apple Watch Series 10 (46mm)" },

// ---------- Apple Watch SE (1st Gen) ----------
{ key: "apple_watch_se_1st_gen_40mm", label: "Apple Watch SE (1st Generation, 40mm)" },
{ key: "apple_watch_se_1st_gen_44mm", label: "Apple Watch SE (1st Generation, 44mm)" },

// ---------- Apple Watch SE (2nd Gen) ----------
{ key: "apple_watch_se_2nd_gen_40mm", label: "Apple Watch SE (2nd Generation, 40mm)" },
{ key: "apple_watch_se_2nd_gen_44mm", label: "Apple Watch SE (2nd Generation, 44mm)" },

// ---------- Apple Watch SE (3rd Gen) ----------
{ key: "apple_watch_se_3rd_gen_40mm", label: "Apple Watch SE (3rd Generation, 40mm)" },
{ key: "apple_watch_se_3rd_gen_44mm", label: "Apple Watch SE (3rd Generation, 44mm)" },

// ---------- Apple Watch Ultra ----------
{ key: "apple_watch_ultra_49mm", label: "Apple Watch Ultra (49mm)" },

// ---------- Apple Watch Ultra 2 ----------
{ key: "apple_watch_ultra_2_49mm", label: "Apple Watch Ultra 2 (49mm)" },

// ---------- Apple Watch Ultra 3 ----------
{ key: "apple_watch_ultra_3_49mm", label: "Apple Watch Ultra 3 (49mm)" },


]

  }), []);

  /**
   * attributeConfigs defines which extra fields to collect per catalog item.
   * Each config is an array of objects: { name: "fieldKey", label: "Label", placeholder, type }
   * Modify to suit your real attributes.
   */
  const attributeConfigs = useMemo(() => ({
    // common fields for spare parts
    spare: [
      { name: "description", label: "Description", placeholder: "color-any special remark", type: "text" },
      { name: "compatibility", label: "Compatibility Model", placeholder: "e.g. iPhone 14 / 14 Pro", type: "text" },
      { name: "condition",    label: "Condition",   placeholder: "Select condition",   type: "select",   options: ["New", "Refurb", "Used"]   },
    ],

    accessory: [
      { name: "description", label: "Description", placeholder: "Color-any special remark", type: "text" },
      { name: "brand", label: "Brand", placeholder: "Brand", type: "text" },
      { name: "color", label: "Color", placeholder: "Color / Finish", type: "text" },
    ],
    product: [
  {name: "model", label: "Capacity", placeholder: "e.g. 128GB, 256GB", type: "select", options: ["NULL","64","128", "256", "512","1TB","2TB","8GB / 256GB","8GB / 512GB","16GB / 256GB","16GB / 512GB","16GB / 1TB","24GB / 512GB","24GB / 1TB","32GB / 512GB","32GB / 1TB","32GB / 2TB","36GB / 1TB","36GB / 2TB","48GB / 1TB","48GB / 2TB","64GB / 1TB","64GB / 2TB","64GB / 4TB","96GB / 2TB","96GB / 4TB","128GB / 4TB","128GB / 8TB"], },
  { name: "color", label: "Color", placeholder: "Color", type: "text" },
  {name: "region", label: "Region / Country", placeholder: "Select region", type: "select", options: ["ZPA", "XA", "HNA","AEA","QNA","LLA","JA","VIETNAM","NULL",], },
  { name: "serialNumber", label: <>Serial Number <span className="text-red-500 font-bold">*</span></>, placeholder: "Device serial number - mandatory", type: "text" },
  { name: "imeiNumber", label: "IMEI Number", placeholder: "Device IMEI number", type: "text" },
  { name: "condition",    label: "Condition",   placeholder: "Select condition",   type: "select",   options: ["New", "Refurb", "Used"]   },

    ],
  }), []);

  // Derived: options for current category
  const currentOptions = useMemo(() => {
    if (!category) return [];
    return itemOptions[category] || [];
  }, [category, itemOptions]);

  // When category changes, reset selected item and attributes
  React.useEffect(() => {
    setSelectedItemKey("");
    setAttributes({});
  }, [category]);

  // Helper to update an attribute field
  function setAttribute(name, value) {
    setAttributes(prev => ({ ...prev, [name]: value }));
  }

  function resetItemForm() {
    setCategory("");
    setSelectedItemKey("");
    setQty(1);
    setUnitPrice("");
    setAttributes({});
  }

  function validateItemEntry() {
    if (!category) return { ok: false, msg: "Select category" };
    if (!selectedItemKey) return { ok: false, msg: "Select item" };
    if (!qty || isNaN(qty) || Number(qty) <= 0) return { ok: false, msg: "Enter quantity > 0" };
    if (unitPrice === "" || isNaN(unitPrice) || Number(unitPrice) < 0) return { ok: false, msg: "Enter valid unit price" };
    // require required attributes (all attribute fields must have some value except serialOrIMEI which is optional)
    const required = (attributeConfigs[category] || []).filter(a => a.name !== "serialOrIMEI");
    for (const a of required) {
      if (!attributes[a.name] || String(attributes[a.name]).trim() === "") {
        return { ok: false, msg: `Enter ${a.label}` };
      }
    }
    return { ok: true };
  }

  function handleAddItem() {
    const v = validateItemEntry();
    if (!v.ok) {
      alert(v.msg);
      return;
    }
    const option = (currentOptions.find(o => o.key === selectedItemKey) || { label: selectedItemKey });
    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      category,
      key: selectedItemKey,
      label: option.label,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      attributes: { ...attributes },
      lineTotal: Number(qty) * Number(unitPrice),
    };
    setItems(prev => [...prev, newItem]);
    resetItemForm();
    // If you want updating stock to auto-toggle, keep it manual as per your request
    setStockUpdated(false);
  }

  function handleDeleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    setStockUpdated(false);
  }

  const grandTotal = items.reduce((s, it) => s + Number(it.lineTotal || 0), 0);
  const [loading, setLoading] = useState(false); // loading state

const handleUpdateStock = async () => {
  if (items.length === 0) {
    alert("Add at least one item before updating stock.");
    return;
  }

  try {
    setLoading(true);
    const stockRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/stock`);
    const currentStock = stockRes.data;

    for (const grnItem of items) {

// ✅ RULE: PRODUCTS ARE ALWAYS NEW (SERIAL NUMBER UNIQUE)
      if (grnItem.category === "product") {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/stock`, {
          category: grnItem.category,
          key: grnItem.key,
          label: grnItem.label,
          qty: grnItem.qty, // usually 1, but kept flexible
          unitPrice: grnItem.unitPrice,
          attributes: grnItem.attributes, // includes serialNumber / IMEI
          createdAt: new Date().toISOString(),
        });

        continue; // ⛔ skip matching logic
      }
      // 🔁 SPARES & ACCESSORIES → MERGE LOGIC
      const existing = currentStock.find(
        s =>
          s.category === grnItem.category &&
          s.key === grnItem.key &&
          s.attributes.compatibility === grnItem.attributes.compatibility &&
          s.attributes.condition === grnItem.attributes.condition &&
          s.attributes.description === grnItem.attributes.description
      );

      if (existing) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/api/stock/${existing._id}`, {
          qty: existing.qty + grnItem.qty,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/stock`, {
          category: grnItem.category,
          key: grnItem.key,
          label: grnItem.label,
          qty: grnItem.qty,
          unitPrice: grnItem.unitPrice,
          attributes: grnItem.attributes,
          createdAt: new Date().toISOString(),
        });
      }
    }

    setStockUpdated(true);
    // alert("Stock updated successfully!");
    console.log("Stock updated successfully!");
  } catch (err) {
    console.error(err);
    alert("Error updating stock. See console.");
  } finally {
    setLoading(false);
  }
};


async function handleSaveGRN() {
  if (!supplier) {
    alert("Please select a supplier before saving.");
    return;
  }
  if (items.length === 0) {
    alert("Add at least one item before saving.");
    return;
  }

  const payload = {
    date,
    invoice,
    supplier,
    items,
    grandTotal,
    paymentMethodOfGRN,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/grn`, payload);
    if (!res.data) throw new Error("Failed to save GRN");

    // alert("GRN saved successfully!");
    console.log("GRN saved successfully!");
    // Optionally, reset form
    setDate(new Date().toISOString().slice(0, 10));
    setInvoice("");
    setSupplier("");
    setItems([]);
    setpaymentMethodOfGRN(""); 
    setStockUpdated(false);
  } catch (err) {
    console.error(err);
    alert("Error saving GRN. See console for details.");
  }
finally {
    // Always reset form and close modal
    setItems([]);
    setStockUpdated(false);
    setSaveAttempted(false);
    onClose();}
}


//==================  new function that update stock and save grn ========================================
const updateStockAndSaveGRN = async () => {
  try {
    // 🔒 Lock UI
    setOverlayMessage("Updating stock, please wait...");
    setOverlayOpen(true);

    // 1️⃣ Update stock
    await handleUpdateStock();

    // small delay to ensure state sync
    await new Promise(resolve => setTimeout(resolve, 0));

    // 🔒 Update message
    setOverlayMessage("Saving GRN, please wait...");

    // 2️⃣ Save GRN
    await handleSaveGRN();

    // ✅ Success
    console.log("Stock updated and GRN saved successfully!");
    alert("Stock updated and GRN saved successfully!");
  } catch (error) {
    console.error("Update stock & save GRN failed:", error);
    alert("Something went wrong while updating stock and saving GRN.");
  } finally {
    // 🔓 Unlock UI
    setOverlayOpen(false);
    setOverlayMessage("");
  }
};



  if (!open) return null;

  // small icon components
  const CloseIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );

  // ===========================  FETCHING DATA FROM THE DB ABOUT THE PARTICULAR SPARE PART   ======================

  useEffect(() => {
  async function fetchMatchingDescriptions() {
    if (category !== "spare" || !selectedItemKey || !attributes.compatibility || !attributes.condition) return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/stock`);
      const currentStock = res.data;

      // Filter stock items for selected part
      const matches = currentStock.filter(s =>
        s.category === category &&
        s.key === selectedItemKey &&
        s.attributes.compatibility === attributes.compatibility &&
        s.attributes.condition === attributes.condition
      );

      if (matches.length > 1) {
        // multiple descriptions found → show modal
        setMatchedDescriptions(matches); 
        setSelectDescriptionModalOpen(true);
      } else if (matches.length === 1) {
        // only 1 match → auto-fill description
        setAttribute("description", matches[0].attributes.description);
      }
    } catch (err) {
      console.error(err);
    }
  }

  fetchMatchingDescriptions();
}, [category, selectedItemKey, attributes.compatibility, attributes.condition]);

  // Auto-fill Description when spare part, compatibility, and condition are selected
useEffect(() => {
  const fetchSpareDescription = async () => {
    if (
      category === "spare" &&
      selectedItemKey &&
      attributes.compatibility &&
      attributes.condition
    ) {
      try {
        // Fetch all stock items
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stock/`);
        const stockItems = await res.json();

        // Find the matching spare part
        const matchedItem = stockItems.find(
          (item) =>
            item.category === "spare" &&
            item.key === selectedItemKey &&
            item.attributes.compatibility === attributes.compatibility &&
            item.attributes.condition === attributes.condition
        );

        if (matchedItem) {
          console.log("Matched Spare Part:", matchedItem);

          // Fetch full record using _id
          const detailRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/stock/${matchedItem._id}`
          );
          const detailData = await detailRes.json();
          console.log("Full MongoDB record:", detailData);

          // ✅ Auto-fill Description input
          if (detailData.attributes?.description) {
            setAttribute("description", detailData.attributes.description);
          }
        } else {
          console.log("No matching spare part found yet.");
        }
      } catch (err) {
        console.error("Error fetching spare part description:", err);
      }
    }
  };

  fetchSpareDescription();
}, [category, selectedItemKey, attributes.compatibility, attributes.condition]);

//=======================    FETCH THE CURRENT STOCK OF THE SELECTED SPARE PART   ====================================

useEffect(() => {
  const fetchCurrentStock = async () => {
    if (
      category === "spare" &&
      selectedItemKey &&
      attributes.compatibility &&
      attributes.condition &&
      attributes.description
    ) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/stock`);
        const stockItems = res.data;

        const matchedItem = stockItems.find(
          (item) =>
            item.category === "spare" &&
            item.key === selectedItemKey &&
            item.attributes.compatibility === attributes.compatibility &&
            item.attributes.condition === attributes.condition &&
            item.attributes.description === attributes.description
        );

        setCurrentStockQty(matchedItem ? matchedItem.qty : 0);
      } catch (err) {
        console.error("Error fetching current stock:", err);
        setCurrentStockQty(null);
      }
    } else {
      setCurrentStockQty(null);
    }
  };

  fetchCurrentStock();
}, [category, selectedItemKey, attributes.compatibility, attributes.condition, attributes.description]);

  
  return (
    // overlay
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-10/12 w-full mx-4 p-6 text-sm min-h-[600px]">
        {/* header */}
        <div className="flex items-start justify-between space-x-4">
          <div>
            <h2 className="font-semibold text-xs">Create GRN (Goods Received Note)</h2>
            <p className="text-gray-600 text-[11px]">Apple products, spare parts & accessories — enter items and update stock.</p>
          </div>
          <button
            onClick={() => { handleAttemptClose(); }}
            className="p-1 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
            aria-label="Close"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <hr className="my-3" />

        {/* header inputs */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-gray-700 text-xs mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1 text-xs"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs mb-1">Invoice Number</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 text-xs"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="Invoice #"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs mb-1">Supplier</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup.supplierName}>
                  {sup.supplierName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-xs mb-1">Payment Method</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={paymentMethodOfGRN}
              onChange={(e) => setpaymentMethodOfGRN(e.target.value)}
            >
              <option value="">-- Select Payment Method --</option>
              <option value="cash">CASH</option>
              <option value="credit">CREDIT</option>
              <option value="cheque">CHEQUE</option>
              <option value="banktransfer">BANKTRANSFER</option>
              <option value="card">CARD</option>
              <option value="halfpayment">HALF-PAYMENT</option>
              <option value="other">OTHER</option>
            </select>
          </div>
          <button
  onClick={() => setAddSupplierOpen(true)}
  className="tracking-wider px-2 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-800 w-fit cursor-pointer"
>
  Add Supplier
</button>

{/*============== ADD ITEM MANUALLY ==================== */}
<div className="flex items-center gap-2">
  <button
  onClick={() => setManualItemOpen(true)}
  className="tracking-wider px-2 py-1 bg-cyan-700 text-white rounded text-xs font-bold cursor-pointer w-fit hover:bg-cyan-900"
>
  Manual Item
</button> 
<p className="text-xs font-bold  w-fit mt-1">Use this button when the item is not found below</p>
<button
  onClick={() => setBulkGRNOpen(true)}
  className="tracking-wider px-2 py-1 bg-gray-700 text-white rounded text-xs font-bold cursor-pointer w-fit hover:bg-yellow-300 hover:text-black"
>
  Enter Bulk
</button>

</div>
        </div>

        <hr className="my-2" />

        {/* item entry area */}
        <div className="grid grid-cols-3 gap-3 items-end">
          {/* category */}
          <div>
            <label className="block text-gray-700 text-xs mb-1">Category</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="spare">Spare Part</option>
              <option value="accessory">Accessory</option>
              <option value="product">Product</option>
            </select>
          </div>

          {/* item select */}
          <div>
            <label className="block text-gray-700 text-xs mb-1">Item</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={selectedItemKey}
              onChange={(e) => setSelectedItemKey(e.target.value)}
              disabled={!category}
            >
              <option value="">-- Select item --</option>
              {currentOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* qty & price compact */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700 text-xs mb-1">Qty</label>
              <input
                type="number"
                min="1"
                className="w-full border rounded px-2 py-1 text-xs"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs mb-1">Cost Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border rounded px-2 py-1 text-xs"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* dynamic attributes */}
{category && (
  <div className="mt-3 grid grid-cols-3 gap-3">
    {(attributeConfigs[category] || []).map(attr => {
      const isAccessoryDescDropdown =
        category === "accessory" &&
        attr.name === "description" &&
        ["back_cover", "tempered_glass", "camera_lens"].includes(selectedItemKey);

      // ✅ new condition: when category = accessory & item is back_cover / tempered_glass / camera_lens
      const isAccessoryBrandDropdown =
        category === "accessory" && attr.name === "brand" && 
        ["back_cover", "tempered_glass", "camera_lens"].includes(selectedItemKey);

// ✅ new condition: when category = product & attr.name = color
      const isProductColorDropdown =
        category === "product" && attr.name === "color";

      const productColorOptions = ["NULL","MDN", "STARLIGHT", "BLUE", "BLK", "PINK","PURPLE", "GREEN", "ULTRAMINE","TEAL","WHITE","DESERT BLACK","DESERT-TITANIUM","LAVENDRA","WHITE","SAGE","MIST BLUE","ORANGE","SILVER", "BLUE","AURA PURPLE"];

      // ✅ define available brand options
      const brandOptions = (() => {
        if (selectedItemKey === "back_cover") {
          return ["SILICON", "SILICON-MAGSAFE", "ANTI-BURST", "FULL-CLEAR-CASE","FULL-CLEAR-MAGESAFE","COLORED-CLEAR-MAGESAFE","KEEPHONE","UAG","XXUNDO","COBLUE","ROCK","JC-COMM",];
        } else if (selectedItemKey === "tempered_glass") {
          return ["SUPERD", "KEEPHONE","WIWU", "LITO", "9H","JC-COMM","BLUEO","JOYROOM","NORMAL","PRIVACY","REROS","ROCK","ROCKYMILE","MIETUBL","JC-COMM",];
        } else if (selectedItemKey === "camera_lens") {
          return ["LITO", "KEEPHONE","ROCKYMILE","CAMERA-FILM","LENS-FILM","RCSTAL","JC-COMM",];
        }
        return [];
      })();

      const valuesForAccessories = devicesList;

      return (
        <div key={attr.name}>
          <label className="block text-gray-700 text-xs mb-1">{attr.label}</label>

          {/* ✅ special case 1: accessory description dropdown */}
          {isAccessoryDescDropdown ? (
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select Model --</option>
              {valuesForAccessories.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>

          ) : isAccessoryBrandDropdown ? (
            // ✅ special case 2: accessory brand dropdown
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select Brand --</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

          ) : isProductColorDropdown ? (
            // ✅ new dropdown for product colors
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select Color --</option>
              {productColorOptions.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>

          ): category === "spare" && attr.name === "compatibility" ? (
            // spare compatibility dropdown
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select --</option>
              {itemOptions.product.map((opt) => (
                <option key={opt.key} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>

          ) : attr.type === "select" ? (
            // default select type
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select --</option>
              {attr.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

          ) : (
            // default input type
            <input
              type={attr.type}
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder={attr.placeholder}
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            />
          )}
        </div>
      );
    })}
  </div>
)}



        {/* Add item button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-gray-500 text-xs">Tip: fill attributes relevant to the item before adding.</div>
          <div className="text-gray-500 text-xs">  Current Stock:{" "}  <span className="font-semibold">    {currentStockQty !== null ? currentStockQty : "-"}  </span></div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetItemForm}
              className="px-3 py-1 border rounded text-xs hover:bg-gray-50 cursor-pointer"
              title="Reset item entry"
            >
              Reset
            </button>
            <button
              onClick={handleAddItem}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 cursor-pointer"
              title="Add item to GRN table"
            >
              Add Item
            </button>
          </div>
        </div>

        <hr className="my-3" />

        {/* GRN table */}
        <div className="overflow-auto max-h-56 mb-3 text-xs">
          <table className="w-full table-auto text-left text-xs">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Category</th>
                <th className="px-2 py-2">Item</th>
                <th className="px-2 py-2">Attributes</th>
                <th className="px-2 py-2">Qty</th>
                <th className="px-2 py-2">Unit</th>
                <th className="px-2 py-2">Line Total</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-2 py-4 text-center text-gray-500">No items added</td>
                </tr>
              ) : items.map((it, idx) => (
                <tr key={it.id} className="border-b">
                  <td className="px-2 py-2 align-top">{idx + 1}</td>
                  <td className="px-2 py-2 align-top">{it.category}</td>
                  <td className="px-2 py-2 align-top">{it.label}</td>
                  <td className="px-2 py-2 align-top">
                    <div className="text-[11px]">
                      {Object.entries(it.attributes).map(([k, v]) => (
                        <div key={k}><span className="font-medium">{k}:</span> {String(v)}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 align-top">{it.qty}</td>
                  <td className="px-2 py-2 align-top">{it.unitPrice.toFixed(2)}</td>
                  <td className="px-2 py-2 align-top">{it.lineTotal.toFixed(2)}</td>
                  <td className="px-2 py-2 align-top">
                    <button
                      onClick={() => handleDeleteItem(it.id)}
                      className="p-1 rounded hover:bg-red-400 text-xs font-bold hover:text-white"
                      title="Delete item"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* totals and actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <div className="mb-1"><span className="font-medium">Grand Total:</span> {grandTotal.toFixed(2)}</div>
            <div className="text-gray-600 text-[11px]">Stock updated: <span className={stockUpdated ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{stockUpdated ? "Yes" : "No"}</span></div>
          </div>

          <div className="flex items-center space-x-2">

            <button
              onClick={updateStockAndSaveGRN}
              disabled={loading || items.length === 0}
              className={`px-3 py-1 rounded text-xs cursor-pointer ${
                loading || items.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {loading ? "Please wait..." : "Update Stock & Save GRN"}
            </button>

            <button
              onClick={() => { handleAttemptClose(); }}
              className="px-3 py-1 border rounded text-xs hover:bg-gray-50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* small footnote */}
        <p className="text-gray-500 text-[11px] mt-3">
          Note: This component simulates stock update. Replace the alert/console actions with real API calls to update stock and save GRN in backend.
        </p>
      </div>

        {/* ========================  ADD A NEW SUPPLIER POPUP MODAL  =================================== */}
        {/* Add Supplier Modal */}
        {addSupplierOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black opacity-40"
              onClick={() => setAddSupplierOpen(false)}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-96 mx-4 p-4 text-xs">
              <h3 className="font-semibold text-sm mb-3">Add New Supplier</h3>

              {/* Supplier Name */}
              <input
                type="text"
                placeholder="Supplier Name *"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2 text-xs"
              />

              {/* Contact Phone */}
              <input
                type="text"
                placeholder="Contact Phone"
                value={newSupplierPhone}
                onChange={(e) => setNewSupplierPhone(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2 text-xs"
              />

              {/* Contact Email */}
              <input
                type="email"
                placeholder="Contact Email"
                value={newSupplierEmail}
                onChange={(e) => setNewSupplierEmail(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2 text-xs"
              />

              {/* Location */}
              <input
                type="text"
                placeholder="Location"
                value={newSupplierLocation}
                onChange={(e) => setNewSupplierLocation(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-3 text-xs"
              />

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setAddSupplierOpen(false)}
                  className="px-3 py-1 border rounded text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSupplier}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {selectDescriptionModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black opacity-40"
      onClick={() => setSelectDescriptionModalOpen(false)}
    ></div>

    <div className="relative bg-white rounded-xl shadow-2xl w-96 mx-4 p-4 text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Select Correct Description</h3>
        <button
          onClick={() => setSelectDescriptionModalOpen(false)}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {matchedDescriptions.map(item => (
          <button
            key={item._id}
            className="px-3 py-1 border rounded hover:bg-gray-100 text-left cursor-pointer"
            onClick={() => {
              setAttribute("description", item.attributes.description); // fill description
              setSelectDescriptionModalOpen(false);
            }}
          >
            {item.attributes.description}
          </button>
        ))}
      </div>
    </div>
  </div>
)}


{/* Confirm Close Modal */}
{confirmCloseOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black opacity-40"
      onClick={() => setConfirmCloseOpen(false)}
    ></div>

    <div className="relative bg-white rounded-xl shadow-2xl w-80 mx-4 p-4 text-xs">
      <h3 className="font-semibold text-sm mb-2">Cannot Close GRN</h3>
      <p className="mb-4 text-gray-700 text-[11px]">
        There are items in the GRN table. Please clear the table before closing.
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setConfirmCloseOpen(false)}
          className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

<StockUpdateOverlay
  open={overlayOpen}
  message={overlayMessage}
/>

<AddGRNItemManual
  open={manualItemOpen}
  onClose={() => setManualItemOpen(false)}
  onAdd={(item) => {
    setItems(prev => [...prev, item]);
    setStockUpdated(false);
  }}
/>
<BulkGRN
  open={bulkGRNOpen}
  onClose={() => setBulkGRNOpen(false)}
  itemOptions={itemOptions}
  onAdd={(bulkItems) => {
    setItems(prev => [...prev, ...bulkItems]);
    setStockUpdated(false);
  }}
/>


    </div>
  );
}
