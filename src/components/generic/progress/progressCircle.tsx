import type { CSSProperties } from "react";
import "./progressCircle.css";
import { clamp, type ProgressCSS } from "../../../utils/utils";

type ProgressCircleCSS = ProgressCSS & { "--circleSize": string };

const ProgressCircle = ({
  progress,
  className,
  size,
  progressIndicatorStyle,
}: {
  progress: number;
  className?: string;
  size?: string;
  progressIndicatorStyle?: CSSProperties;
}) => {
  progressIndicatorStyle ??= {};
  progressIndicatorStyle.stroke ??= "var(--colSecondary)";

  return (
    <div
      className={`circleProgress ${className}`}
      style={
        {
          "--progress": clamp(progress, { min: 0, max: 1 }) * 100 + "px",
          "--circleSize": size ?? "3rem",
        } as ProgressCircleCSS
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
