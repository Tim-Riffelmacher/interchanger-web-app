export default function equalId(idA?: string | number, idB?: string | number) {
  if (idA === undefined || idB === undefined) return false;

  return idA.toString() == idB.toString();
}
