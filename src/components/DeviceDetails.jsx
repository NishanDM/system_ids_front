import React, { useState, useEffect } from 'react';
import deviceModels from '../data/deviceModels.json';
import deviceColors from '../data/deviceColors.json';

const capacityOptions = ['NULL', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB', '8TB'];

const DeviceDetails = ({ formData, setFormData }) => {
  const [filteredModels, setFilteredModels] = useState([]);
  const selectedColors = deviceColors[formData.model] || [];

  useEffect(() => {
    if (formData.deviceType) {
      setFilteredModels(deviceModels[formData.deviceType] || []);
    } else {
      setFilteredModels([]);
    }
  }, [formData.deviceType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    if (name === 'deviceType') {
      setFormData((prev) => ({
        ...prev,
        deviceType: finalValue,
        model: '',
        color: '',
      }));
      return;
    }

    if (name === 'model') {
      setFormData((prev) => ({
        ...prev,
        model: finalValue,
        color: '',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const resetSection = () => {
    setFormData((prev) => ({
      ...prev,
      deviceType: '',
      model: '',
      series: '',
      emei: '',
      capacity: '',
      color: '',
      passcode: '',
      simTrayCollected: false,
      simTraySerial: '',
    }));
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600">DEVICE DETAILS</h2>
        <div className="border-t border-gray-300 mt-2"></div>
      </div>

      {/* Section 1: Device Type & Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Device Type */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Device Type</label>
          <input
            list="deviceTypeOptions"
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
            placeholder="Select or type"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="deviceTypeOptions">
            {Object.keys(deviceModels).map((type, idx) => (
              <option key={idx} value={type} />
            ))}
          </datalist>
        </div>

        {/* Model */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Model</label>
          <input
            list="modelOptions"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Select or type"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="modelOptions">
            {filteredModels.map((model, idx) => (
              <option key={idx} value={model} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Additional Device Details */}
      <div className="text-center mt-6">
        <h3 className="text-lg text-green-600 font-semibold">ADDITIONAL DEVICE DETAILS</h3>
        <div className="border-t border-gray-300 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {/* Serial Number */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Serial Number</label>
          <input
            type="text"
            name="series"
            value={formData.series}
            onChange={handleChange}
            placeholder="Enter Serial Number"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* EMEI */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">EMEI</label>
          <input
            type="text"
            name="emei"
            value={formData.emei}
            onChange={handleChange}
            placeholder="Enter EMEI"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Capacity */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Capacity</label>
          <select
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {capacityOptions.map((cap, idx) => (
              <option key={idx} value={cap}>
                {cap}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Color</label>
          <input
            list="colorOptions"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Select or type"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="colorOptions">
            {selectedColors.map((color, idx) => (
              <option key={idx} value={color} />
            ))}
          </datalist>
        </div>

        {/* Passcode */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Passcode / Pattern</label>
          <input
            type="text"
            name="passcode"
            value={formData.passcode}
            onChange={handleChange}
            placeholder="Enter Passcode"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* SIM Tray */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
            <input
              type="checkbox"
              name="simTrayCollected"
              checked={formData.simTrayCollected}
              onChange={handleChange}
            />
            SIM Tray Collected
          </label>
          {formData.simTrayCollected && (
            <input
              type="text"
              name="simTraySerial"
              value={formData.simTraySerial}
              onChange={handleChange}
              placeholder="SIM Tray Serial"
              className="border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={resetSection}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Reset Device Details
        </button>
      </div>
    </div>
  );
};

export default DeviceDetails;
