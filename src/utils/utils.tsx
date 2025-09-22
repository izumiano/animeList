import { toast } from "react-toastify";
import BadResponse from "../external/responses/badResponse";

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
  if (ex instanceof BadResponse) {
    toast.error(ex.displayMessage);
  } else if (ex instanceof Error) {
    toast.error(ex.message);
  } else {
    toast.error(
      <span>
        Unknown Error <b>{ex as any}</b>
      </span>
    );
  }
}
