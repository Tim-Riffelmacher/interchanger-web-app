/**
 * A randomizer.
 */
export default function randomAlternating() {
  return Math.random() < 0.5 ? -1 : 1;
}
