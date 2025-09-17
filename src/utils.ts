export async function sleepFor(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
