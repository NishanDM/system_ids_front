// JobFormWrapper.jsx
import React from 'react';
import JobForm from './JobForm';

const JobFormWrapper = ({
  formData,
  setFormData,
  technicians,
  handleChange,
  handleAddFault,
  handleSendVerification,
  handleSubmit,
  newFault,
  setNewFault,
  selectedColors,
  dataset,
  accessoriesExpanded,
  setAccessoriesExpanded
}) => {
  const maxVisible = 5;
  const allAccessories = dataset.repairedAccessories || [];
  const visibleAccessories = accessoriesExpanded
    ? allAccessories
    : allAccessories.slice(0, maxVisible);

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white p-4 shadow rounded text-sm space-y-4">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">📋 Job Submission</h2>

      {/* Job Details */}
      <Section title="Job Details" color="text-blue-700">
        <Row>
          <Input label="Job Ref" name="jobRef" value={formData.jobRef} readOnly />
          <Input label="Created Date" name="createdDate" type="date" value={formData.createdDate} readOnly />
          <Select label="Job Flag" name="jobFlag" value={formData.jobFlag} onChange={handleChange} options={['Normal', 'Quick']} />
          <Input label="Created By" name="createdBy" value={formData.createdBy} readOnly />
        </Row>
      </Section>

      {/* Customer Details */}
      <Section title="Customer Details" color="text-green-700">
        <Row>
          <Select label="Prefix" name="customerPrefix" value={formData.customerPrefix} onChange={handleChange} options={['Mr', 'Mrs', 'Ms', 'Ven.', 'Dr', 'Rev.']} placeholder="-- Select Prefix --" />
          <Input label="Name" name="customerName" value={formData.customerName} onChange={handleChange} required />
          <Input label="Phone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required />
          <Input label="Email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
          <Input label="Company" name="customerCompany" value={formData.customerCompany} onChange={handleChange} />
        </Row>
        <TextArea label="Address" name="customerAddress" value={formData.customerAddress} onChange={handleChange} rows={2} />
      </Section>

      {/* Device Details */}
      <Section title="Device Details" color="text-purple-700">
        <Row>
          <Select label="Device Type" name="deviceType" value={formData.deviceType} onChange={handleChange} options={Object.keys(dataset.deviceModels)} />
          <Select label="Model" name="model" value={formData.model} onChange={handleChange} options={dataset.deviceModels[formData.deviceType] || []} placeholder="-- Select Model --" required />
          <Input label="Serial Number" name="series" value={formData.series} onChange={handleChange} />
          <Input label="EMEI" name="emei" value={formData.emei} onChange={handleChange} />
          <Input label="Capacity" name="capacity" value={formData.capacity} onChange={handleChange} />
          <Select label="Color" name="color" value={formData.color} onChange={handleChange} options={selectedColors} placeholder={selectedColors.length ? '-- Select Color --' : 'No colors available'} />
          <Input label="Passcode / Pattern" name="passcode" value={formData.passcode} onChange={handleChange} />
        </Row>

        <Row>
          <div className="flex items-center space-x-2 mt-2">
            <input type="checkbox" name="simTrayCollected" checked={formData.simTrayCollected} onChange={handleChange} id="simTrayCollected" />
            <label htmlFor="simTrayCollected" className="text-sm font-medium">SIM Tray Collected</label>
          </div>
          {formData.simTrayCollected && (
            <Input label="SIM Tray Serial" name="simTraySerial" value={formData.simTraySerial} onChange={handleChange} required />
          )}
        </Row>
      </Section>

      {/* Job Info */}
      <Section title="Job Info" color="text-red-700">
        <Row>
          <Select label="Under Warranty" name="underWarranty" value={formData.underWarranty} onChange={handleChange} options={['Yes', 'No']} />
          <Select label="Technician" name="technician" value={formData.technician} onChange={handleChange} options={technicians.map(t => t.username)} placeholder="-- Select Technician --" required />
          <Select label="Status" name="status" value={formData.status} onChange={handleChange} options={['New', 'Re-repair', 'Under-warranty', 'Sell for parts']} />
          <Input label="Est. Completion" name="estimatedCompletion" type="date" value={formData.estimatedCompletion} onChange={handleChange} />
          <Input label="Estimated Cost" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} />
        </Row>

        <Row>
          {/* Faults */}
          <div className="md:col-span-4">
            <label className="block mb-1 font-medium">Faults</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newFault} onChange={(e) => setNewFault(e.target.value)} placeholder="Enter a fault" className="w-full border rounded px-2 py-1" />
              <button type="button" onClick={handleAddFault} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Add</button>
            </div>
            {formData.faults.length > 0 && (
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {formData.faults.map((fault, index) => <li key={index}>{fault}</li>)}
              </ul>
            )}
          </div>

          {/* Accessories */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Accessories to be repaired</label>
            <div className="border p-2 rounded bg-white space-y-1 max-h-64 overflow-auto">
              {visibleAccessories.map((acc) => (
                <div key={acc} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`acc-${acc}`}
                    checked={formData.repaired_accessories.includes(acc)}
                    onChange={() => {
                      setFormData((prev) => ({
                        ...prev,
                        repaired_accessories: prev.repaired_accessories.includes(acc)
                          ? prev.repaired_accessories.filter((a) => a !== acc)
                          : [...prev.repaired_accessories, acc],
                      }));
                    }}
                  />
                  <label htmlFor={`acc-${acc}`} className="text-sm">
                    {acc}
                  </label>
                </div>
              ))}

              {allAccessories.length > maxVisible && (
                <button
                  type="button"
                  onClick={() => setAccessoriesExpanded(!accessoriesExpanded)}
                  className="mt-2 text-blue-600 hover:underline text-sm"
                >
                  {accessoriesExpanded ? 'Collapse ▲' : 'Expand ▼'}
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-4">
            <TextArea label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} />
          </div>
        </Row>
      </Section>

      {/* Buttons */}
      <div className="text-right flex justify-end gap-2 pt-4">
        <button type="button" onClick={handleSendVerification} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Send Verification Email</button>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Submit Job</button>
      </div>
    </form>
  );
};

export default JobFormWrapper;
