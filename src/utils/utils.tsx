import { toast } from "react-toastify";
import BadResponse from "../external/responses/badResponse";
import "../App.css";
import type { CSSProperties } from "react";

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

export function parseError(ex: unknown) {
  if (typeof ex === "string") {
    return ex;
  } else if (ex instanceof BadResponse) {
    return ex.displayMessage;
  } else if (ex instanceof Error) {
    return ex.message;
  } else {
    return (
      <span>
        Unknown Error <b>{ex as any}</b>
      </span>
    );
  }
}

export function showError(ex: unknown) {
  toast.error(parseError(ex));
}

export function clamp(
  value: number,
  params:
    | { min: number; max: number }
    | { min: number; max?: number }
    | { min?: number; max: number }
) {
  return Math.max(
    params.min ?? -Infinity,
    Math.min(value, params.max ?? Infinity)
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
