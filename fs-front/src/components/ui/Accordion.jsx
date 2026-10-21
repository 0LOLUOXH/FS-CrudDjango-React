import React, { useState } from "react";

export function Accordion({
  items = [],
  allowMultiple = false,
  className = "",
}) {
  const [openIndexes, setOpenIndexes] = useState([0]);

  const toggleIndex = (index) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={`accordion ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndexes.includes(idx);
        return (
          <div key={idx} className={`acc-item ${isOpen ? "active" : ""}`}>
            <div className="acc-head" onClick={() => toggleIndex(idx)}>
              <span>{item.title}</span>
              <i className="fa-solid fa-chevron-down"></i>
            </div>
            <div className="acc-body">{item.content}</div>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
