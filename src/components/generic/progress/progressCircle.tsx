import type { CSSProperties } from "react";
import "./progressCircle.css";
import { clamp, type ProgressCSS } from "../../../utils/utils";

const ProgressCircle = ({
  progress,
  className,
  progressIndicatorStyle,
}: {
  progress: number;
  className?: string;
  progressIndicatorStyle?: CSSProperties;
}) => {
  return (
    <div
      className={`circleProgress ${className}`}
      style={
        {
          "--progress": clamp(progress, { min: 0, max: 1 }) * 100,
        } as ProgressCSS
      }
    >
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" fill="none" />
        <circle
          style={progressIndicatorStyle}
          className="progress"
          cx="50"
          cy="50"
          fill="none"
          pathLength="100"
        />
      </svg>
    </div>
  );
};

export default ProgressCircle;
