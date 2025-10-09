import { toast } from "react-toastify";
import BadResponse from "../external/responses/badResponse";
import "../App.css";
import type { CSSProperties, ReactNode } from "react";
import { v4 as uuid } from "uuid";

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

export function waitForNextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

export function remToPx(remValue: number) {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );

  const pxValue = remValue * rootFontSize;

  return pxValue;
}

export function dvwToPx(dvwValue: number) {
  const dynamicViewportWidth = window.innerWidth;

  const pixelValue = (dvwValue / 100) * dynamicViewportWidth;

  return pixelValue;
}

function _parseError(ex: unknown, params?: { showDetails?: boolean }) {
  if (typeof ex === "string") {
    return ex;
  } else if (ex instanceof BadResponse) {
    if (!params?.showDetails) {
      return ex.displayMessage;
    }

    const data = ex.data?.data ?? ex.data;

    return (
      <>
        <span>{ex.displayMessage}</span>
        {data ? (
          <pre className="unimportantText scroll">
            <i>{JSON.stringify(data, null, 2)}</i>
          </pre>
        ) : null}
      </>
    );
  } else if (ex instanceof Error) {
    if (!params?.showDetails) {
      return ex.message;
    }

    return (
      <>
        <span>{ex.message}</span>
        <pre className="unimportantText scroll">
          <i>{ex.stack}</i>
        </pre>
      </>
    );
  } else if (Array.isArray(ex)) {
    return ex.map((ex) => (
      <span key={uuid()} className="flexGrow">
        <hr />
        {_parseError(ex, params)}
      </span>
    ));
  } else {
    return (
      <span>
        Unknown Error <b>{ex as any}</b>
      </span>
    );
  }
}

export function parseError(
  ex: unknown,
  params?: { title?: ReactNode; showDetails?: boolean }
) {
  return (
    <div className="flexColumn breakWord" style={{ height: "100%" }}>
      {params?.title ? <span>{params.title}</span> : null}
      {_parseError(ex, params)}
    </div>
  );
}

export function showError(ex: unknown, title?: ReactNode) {
  toast.error(parseError(ex, { title: title }));
}

export type MinMaxType =
  | { min: number; max: number }
  | { min: number; max?: number }
  | { min?: number; max: number }
  | undefined;

export function clamp(value: number, params: MinMaxType) {
  return Math.max(
    params?.min ?? -Infinity,
    Math.min(value, params?.max ?? Infinity)
  );
}

export function capitalizeFirstLetter(str: string) {
  if (str.length === 0) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isCapital(str: string) {
  for (const c of str) {
    if (c !== c.toUpperCase()) {
      return false;
    }
  }
  return true;
}

export function dialogifyKey(
  key: string | number | readonly string[] | undefined
) {
  key =
    String(key)
      .replaceAll(/-|_/g, " ") // replace - and _ with spaces
      .match(/\b\w+\b/g) // match words
      ?.map((word) => capitalizeFirstLetter(word))
      .join("") ?? "";
  const words = [];
  let word = "";
  for (const c of key) {
    if (isCapital(c) && word !== "") {
      words.push(word);
      word = "";
    }

    word += c;
  }
  if (word !== "") {
    words.push(word);
  }
  return words.reduce((prev, word) => prev + " " + word);
}

export function removeDiacritics(str: string) {
  // Normalize the string to its canonical decomposition form (NFD).
  // This separates base characters from their diacritical marks.
  const normalizedStr = str.normalize("NFD");

  // Use a regular expression to remove all Unicode diacritical marks.
  // The Unicode range U+0300–U+036F covers most combining diacritical marks.
  const withoutDiacritics = normalizedStr.replace(/[\u0300-\u036f]/g, "");

  return withoutDiacritics;
}

export function removeNonAlphanumeric(str: string) {
  return str.replace(/[^a-zA-Z0-9]/g, "");
}

export type Alignment = "left" | "center" | "right";

export function isElementInViewport(
  element: HTMLElement,
  tolerance: number = 0
) {
  const rect = element.getBoundingClientRect();
  return (
    rect.bottom >= -tolerance &&
    rect.top <= window.innerHeight + tolerance &&
    rect.right >= -tolerance &&
    rect.left <= window.innerWidth + tolerance
  );
}

export type UUIDType = `${string}-${string}-${string}-${string}-${string}`;

export interface ProgressCSS extends CSSProperties {
  "--progress": number;
}

/**
 *
 * @param date
 * @param formatString
 * yyyy - year,
 * MM - month value,
 * dd - day value
 * @returns
 */
export function formatDate(
  date: Date | undefined | null,
  formatString: string
) {
  if (!date) {
    return "Unknown Date";
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed, so add 1
  const day = String(date.getDate()).padStart(2, "0");

  return formatString
    .replaceAll("yyyy", year)
    .replaceAll("MM", month)
    .replaceAll("dd", day);
}

export function allSuccess<TIn, TOut>(
  arr: TIn[],
  {
    forEach,
    successMessage,
    failMessage,
    treatUndefinedAs,
  }: {
    forEach: (item: TIn) => Promise<TOut>;
    successMessage: ReactNode | ((items: TOut[]) => ReactNode);
    failMessage: ReactNode;
    treatUndefinedAs?: "success" | "error" | "ignore";
  }
) {
  treatUndefinedAs ??= "ignore";

  const promises = arr.map((item) => forEach(item));

  Promise.all(promises)
    .then((responses) => {
      const errors = responses.filter(
        (response) =>
          response instanceof Error ||
          (treatUndefinedAs === "error" && response === undefined)
      );
      if (errors.length > 0) {
        showError(errors, failMessage);
        return;
      }
      if (
        treatUndefinedAs !== "success" &&
        responses.every((response) => response === undefined)
      )
        return;

      toast.info(
        typeof successMessage === "function"
          ? successMessage(responses)
          : successMessage
      );
    })
    .catch((ex) => {
      showError(ex, failMessage);
    });
}

export function checkElementOverflow(element: HTMLElement) {
  const isHorizontallyOverflowing = element.scrollWidth > element.clientWidth;
  const isVerticallyOverflowing = element.scrollHeight > element.clientHeight;

  return {
    isHorizontallyOverflowing,
    isVerticallyOverflowing,
    isOverflowing: isHorizontallyOverflowing || isVerticallyOverflowing,
  };
}
