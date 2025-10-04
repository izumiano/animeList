import { clamp, type ProgressCSS } from "../../../utils/utils";
import "./progressBar.css";

const ProgressBar = ({
  progress,
  progressClassName,
  backgroundClassName,
}: {
  progress: number;
  progressClassName?: string;
  backgroundClassName?: string;
}) => {
  return (
    <div
      className={`progressBar ${backgroundClassName}`}
      style={
        { "--progress": clamp(progress, { min: 0, max: 1 }) } as ProgressCSS
      }
    >
      <span className={progressClassName ?? "default"}></span>
    </div>
  );
};

export default ProgressBar;
