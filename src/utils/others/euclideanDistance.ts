export default function euclideanDistance(
  position1: { x: number; y: number },
  position2: { x: number; y: number }
) {
  return Math.sqrt(
    Math.pow(position2.x - position1.x, 2) +
      Math.pow(position2.y - position1.y, 2)
  );
}
