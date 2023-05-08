export default function buildEdgeId(
  sourceNodeId: string,
  targetNodeId: String
) {
  return `e${sourceNodeId}-${targetNodeId}`;
}
