import React from "react";

export function Button({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        ...style
      }}
    >
      {children}
    </button>
  );
}
