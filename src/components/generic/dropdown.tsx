import { useState, type ReactNode } from "react";
import "./dropdown.css";
import { useOutsideClick } from "./useOutsideClick";
import type { Property } from "csstype";

const Dropdown = ({
  alignment,
  dropdownButton,
  backgroundColor,
  children,
}: {
  alignment?: "left" | "center" | "right";
  dropdownButton: ReactNode;
  backgroundColor?: Property.BackgroundColor;
  children: ReactNode;
}) => {
  const [isOpen, setIsOpenState] = useState(false);

  const isOpenClass = isOpen ? "show" : "hide";

  alignment ??= "left";

  return (
    <div
      ref={useOutsideClick(() => setIsOpenState(false))}
      className="dropdown"
    >
      <div onClick={() => setIsOpenState(!isOpen)}>{dropdownButton}</div>
      <div className={`dropdownMenu ${isOpenClass} arrow`}>
        <div>
          <div
            className={`${isOpenClass}`}
            style={{ backgroundColor: backgroundColor }}
          ></div>
        </div>
      </div>
      <div className={`dropdownMenu ${isOpenClass} ${alignment}Align`}>
        <div>
          <div
            className="dropdownContent"
            style={{ backgroundColor: backgroundColor }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
