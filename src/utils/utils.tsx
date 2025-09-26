import { toast } from "react-toastify";
import BadResponse from "../external/responses/badResponse";
import "../App.css";

export async function sleepFor(
  milliseconds: number,
  abortSignal: AbortSignal | null = null
) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));

  if (abortSignal?.aborted) {
    return { wasAborted: true };
  }

  return { wasAborted: false };
}

export function remToPx(remValue: number) {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );

  const pxValue = remValue * rootFontSize;

  return pxValue;
}

export function showError(ex: unknown) {
  let message: React.ReactNode;

  if (typeof ex === "string") {
    message = ex;
  } else if (ex instanceof BadResponse) {
    message = ex.displayMessage;
  } else if (ex instanceof Error) {
    message = ex.message;
  } else {
    message = (
      <span>
        Unknown Error <b>{ex as any}</b>
      </span>
    );
  }

  toast.error(message, {
    className: "leftAlignedToastBody",
  });
}

export function clamp(value: number, params: { min: number; max: number }) {
  return Math.max(params.min, Math.min(value, params.max));
}
