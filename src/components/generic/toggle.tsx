import { type ReactNode } from "react";
import "./toggle.css";

const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label?: ReactNode | undefined;
  checked: boolean;
  onChange: () => void;
}) => {
  const checkedClass = checked ? "checked" : "";

  return (
    <label className={`flexRow toggleContainer ${checkedClass}`}>
      <span className="flexGrow leftAlignedText verticalCenterItems">
        {label}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="toggle"></div>
    </label>
  );
};

export default Toggle;
