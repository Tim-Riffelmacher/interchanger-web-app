import { DebugHistoryStep } from "../components/Sandbox";

/**
 * The hints for execution.
 */
function debugInfoTextTemplates(
  debugHistoryStep: DebugHistoryStep,
  k: number,
  containsMove: boolean
) {
  if (debugHistoryStep === DebugHistoryStep.SHOW_T) {
    return {
      title: "Current spanning tree",
      text: "Show all nodes (blue) and edges (blue) belonging to the current spanning tree.",
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_NODES_OF_DEGREE_K) {
    return {
      title: `Nodes of degree ${k}`,
      text: `Find all nodes of degree ${k} (light-blue).`,
    };
  } else if (
    debugHistoryStep === DebugHistoryStep.SHOW_NODES_OF_DEGREE_K_MINUS_1
  ) {
    return {
      title: `Nodes of degree ${k} and ${k - 1}`,
      text: `Find all nodes of degree ${k} (light-blue) and ${k - 1} (blue).`,
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_F) {
    return {
      title: "Edges in F",
      text: `Find all edges of F (blue) where at least one of the endpoints is a node of degree ${k} (light-blue) or ${
        k - 1
      } (blue).`,
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_C) {
    return {
      title: "Components in C",
      text: `Show all components of C (different colored) that would be created if the edges of F were removed from the spanning tree.`,
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_OUTER_COMPONENT_EDGES) {
    return {
      title: "Edges in H",
      text: `Find all edges of H (dashed blue) connecting two components of C (different colored). Furthermore, the connected components must not contain nodes of degree ${k} or ${
        k - 1
      }. If there are no more left the algorithm terminates.`,
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_CYCLE) {
    return {
      title: "Form a cycle",
      text: "Form a cycle (blue) with any edge (dashed blue) of H.",
    };
  }

  if (!containsMove) {
    return {
      title: "Label nodes",
      text: `Since there is no node of degree ${k} (light-blue) in the cycle, label all nodes of degree ${
        k - 1
      } (blue) in the cycle as reducible for a later time. Then do not count the labelled nodes (black border) as nodes of degree ${
        k - 1
      } anymore.`,
    };
  } else {
    return {
      title: "Local moves",
      text: `Since a node of degree ${k} (light-blue) is included in the cycle, reduce its degree by 1 by removing one of the adjacency edges (dashed blue) of the node from the spanning tree and adding the cycle-closing edge (blue) to the spanning tree. If one of the endpoints of the newly added edge is a node labelled as reducible, reduce its degree and propagate (orange) further if necessary. Then remove the label for all reducible nodes and start over.`,
    };
  }
}

export default debugInfoTextTemplates;
