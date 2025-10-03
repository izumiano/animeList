import { clamp, type ProgressCSS } from "../../utils/utils";
import "./progressBar.css";

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div
      className="progressBar"
      style={
        { "--progress": clamp(progress, { min: 0, max: 1 }) } as ProgressCSS
      }
    >
      <span></span>
    </div>
  );
};

export default ProgressBar;
