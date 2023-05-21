import { DebugHistoryStep } from "../components/Sandbox";

function debugInfoTextTemplates(debugHistoryStep: DebugHistoryStep) {
  if (debugHistoryStep === DebugHistoryStep.SHOW_T) {
    return {
      title: "The spanning tree",
      text: "The nodes and edges belonging two the current spanning tree are displayed in blue.",
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_NODES_OF_DEGREE_K) {
    return {
      title: "Find nodes of degree k",
      text: "",
    };
  } else if (
    debugHistoryStep === DebugHistoryStep.SHOW_NODES_OF_DEGREE_K_MINUS_1
  ) {
    return {
      title: "Find nodes of degree k and k-1",
      text: "",
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_F) {
    return {
      title: "Nodes of degree k and k-1",
      text: "Get all edges where at least one endpoint refers to a node of degree k or k-1.",
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_C) {
    return {
      title: "Nodes of degree k and k-1",
      text: "After removing the edges, that were incident with nodes of degree k or k-1, get all components formed.",
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_OUTER_COMPONENT_EDGES) {
    return {
      title: "Find outer egdes",
      text: "Get all edges that connect two different components.",
    };
  } else if (debugHistoryStep === DebugHistoryStep.SHOW_CYCLE) {
    return {
      title: "Form a cycle",
      text: "After removing the edges, that were incident with nodes of degree k or k-1, get all components formed.",
    };
  }

  return { title: "", text: "" };
}

export default debugInfoTextTemplates;
