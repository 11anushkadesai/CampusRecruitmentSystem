import React from "react";

export default function Card({
  children,
  width = "w-full",       // default: full width
  height = "h-auto",      // default: auto height
  className = "",         // for additional custom classes
}) {
  return (
    <div
      className={`bg-white shadow-md rounded-2xl p-4 transition-all duration-300 ${width} ${height} ${className}`}
    >
      {children}
    </div>
  );
}
