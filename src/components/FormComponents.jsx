// FormComponents.jsx
export const Section = ({ title, color, children }) => (
  <section className="mb-4">
    <h3 className={`font-semibold ${color} mb-2`}>{title}</h3>
    {children}
  </section>
);

export const Row = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">{children}</div>
);

export const Input = ({ label, name, value, onChange, type = 'text', readOnly = false, required = false }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} required={required} readOnly={readOnly} className={`w-full border rounded px-2 py-1 ${readOnly ? 'bg-gray-100' : ''}`} />
  </div>
);

export const Select = ({ label, name, value, onChange, options, placeholder, required = false }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <select name={name} value={value} onChange={onChange} required={required} className="w-full border rounded px-2 py-1">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export const TextArea = ({ label, name, value, onChange, rows = 2, required = false }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <textarea name={name} value={value} onChange={onChange} rows={rows} required={required} className="w-full border rounded px-2 py-1" />
  </div>
);
