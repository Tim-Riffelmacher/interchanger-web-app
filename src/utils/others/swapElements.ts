/**
 * Swaps elements in an array.
 */
export default function swapElements(array: unknown[], i: number, j: number) {
  const tempElement = array[i];
  array[i] = array[j];
  array[j] = tempElement;
}
