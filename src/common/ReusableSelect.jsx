import React from "react";

const ReusableSelect = ({ label, options, value, onChange, error }) => (
  <div className="w-full max-w-md">
    {label && (
      <label className="block mb-1 font-semibold text-gray-700">{label}</label>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
        error
          ? "focus:ring-red-500 focus:border-red-500"
          : "focus:ring-blue-500 focus:border-blue-500"
      }`}
    >
      <option value="">-- Select --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);
export default ReusableSelect;
