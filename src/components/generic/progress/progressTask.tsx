import { useState } from "react";
import type ActivityTask from "../../../utils/activityTask";
import { clamp, parseError, type UUIDType } from "../../../utils/utils";
import ProgressBar from "./progressBar";
import "./progressTask.css";

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
      }`}
      onAnimationEnd={(event) => {
        if (event.animationName === "progressTask_hideAnim") {
          onDelete(task.id);
        }
      }}
      onClick={() => {
        if (!failed) return;

        setForceCloseState(true);
      }}
    >
      <div className="label">
        {failed ? parseError(task.result!.value) : task.label}
      </div>
      <ProgressBar
        progress={
          clamp(task.progress, {
            min: task.maxProgress * 0.07,
          }) / task.maxProgress
        }
        progressClassName={failed ? `fail` : undefined}
      />
    </div>
  );
};

export default ProgressTask;
