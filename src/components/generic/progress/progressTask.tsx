import { useState } from "react";
import type ActivityTask from "../../../utils/activityTask";
import { clamp, parseError, type UUIDType } from "../../../utils/utils";
import ProgressBar from "./progressBar";
import "./progressTask.css";
import warnIcon from "../../../assets/warning.png";

const ProgressTask = ({
  task,
  onDelete,
}: {
  task: ActivityTask<unknown>;
  onDelete: (id: UUIDType) => void;
}) => {
  const [forceClose, setForceCloseState] = useState(false);
  const failed = task.result?.failed === true;

  const doClose =
    (task.progress / task.maxProgress === 1 && !failed) || forceClose;

  return (
    <div
      data-disabled={failed}
      className={`progressTask ${doClose ? "hide" : "show"} ${
        failed ? "failed" : ""
      } flexRow flexGrow`}
      onAnimationEnd={(event) => {
        if (event.animationName === "progressTask_hideAnim") {
          onDelete(task.id);
        }
      }}
    >
      <div className="flexColumn flexGrow0Width">
        <div className="progressLabel spaceBetween flexRow flexGrow">
          <span style={{ flex: "1 1 0px", width: "0" }}>
            {failed
              ? parseError(task.result!.value, {
                  showDetails: true,
                  title: task.label,
                })
              : task.label}
          </span>
          {failed ? (
            <img
              src={warnIcon}
              className="mediumIcon smallPadding verticalCenter"
            ></img>
          ) : null}
        </div>
        <ProgressBar
          progress={
            clamp(task.progress, {
              min: task.maxProgress * 0.07,
            }) / task.maxProgress
          }
          showPercentage={true}
          className="progressTaskBar"
          progressClassName={failed ? "fail" : undefined}
        />
        {failed ? (
          <button
            onClick={() => {
              setForceCloseState(true);
            }}
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ProgressTask;
