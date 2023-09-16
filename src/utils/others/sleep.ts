/**
 * Makes the thread sleep for a while.
 */
export default async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function retreat() {
  return sleep(0);
}
