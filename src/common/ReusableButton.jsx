import React from "react";

const ReusableButton = ({
  label,
  onClick,
  type = "button",
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`w-full max-w-md bg-blue-600 text-white font-semibold px-4 py-3 rounded-xl shadow hover:bg-blue-700 transition duration-200 ${className}`}
  >
    {label}
  </button>
);

export default ReusableButton;
