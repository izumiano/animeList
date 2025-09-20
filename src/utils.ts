export async function sleepFor(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function remToPx(remValue: number) {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );

  const pxValue = remValue * rootFontSize;

  return pxValue;
}
