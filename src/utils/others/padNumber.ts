/**
 * Pads number with the desired amount of zeroes.
 */
export default function padNumber(x: number | string, size: number) {
  x = x.toString();
  while (x.length < size) x = `0${x}`;
  return x;
}
