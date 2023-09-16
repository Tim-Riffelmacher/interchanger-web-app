/**
 * Checks if two ids are equal. They may differ in type.
 */
export default function equalId(
  idA?: string | number | null,
  idB?: string | number | null
) {
  if (idA === undefined || idB === undefined || idA === null || idB === null)
    return false;

  return idA.toString() == idB.toString();
}
