export default function equalId(idA?: string | number, idB?: string | number) {
  if (!idA || !idB) return false;
  return idA.toString() === idB.toString();
}
