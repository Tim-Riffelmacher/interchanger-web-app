import cytoscape, {
  EdgeSingular,
  ElementDefinition,
  NodeSingular,
} from "cytoscape";
import edgehandles from "cytoscape-edgehandles";
import { Core } from "cytoscape";
import { EdgeHandlesInstance } from "cytoscape-edgehandles";
import { useRef, useState } from "react";
import deepCopy from "../utils/deepCopy";
import CytoscapeComponent from "react-cytoscapejs";
import euclideanDistance from "../utils/euclideanDistance";
import swapElements from "../utils/swapElements";
import buildEdgeId from "../utils/buildEdgeId";
import Navigation, { ClearScope, DrawModeAction, RunSpeed } from "./Navigation";
import Graph from "../utils/Graph";
import { NodeId } from "../utils/Graph";
import Algorithm from "../utils/Algorithm";
import loadPreset, { buildCYEdge, Preset } from "../data/presets";
import { buildCYNode } from "../data/presets";
import sleep from "../utils/sleep";

cytoscape.use(edgehandles);

function Sandbox() {
  const cyCore = useRef<Core | null>(null);
  const cyEdgeHandles = useRef<EdgeHandlesInstance | null>(null);
  const [cyNodes, setCYNodes] = useState<ElementDefinition[]>([]);
  const [cyEdges, setCYEdges] = useState<ElementDefinition[]>([]);
  const [drawModeActive, setDrawModeActive] = useState(false);
  const runProgressRef = useRef<number>();
  const [runProgress, setRunProgress] = useState<number>();
  const runSpeedRef = useRef<RunSpeed>(1.0);
  const [runSpeed, setRunSpeed] = useState<RunSpeed>(runSpeedRef.current);
  const stopIndicatorRef = useRef(false);

  const _setRunProgress = (runProgress?: number) => {
    runProgressRef.current = runProgress;
    setRunProgress(runProgress);
  };
  const _setRunSpeed = (runSpeed: RunSpeed) => {
    runSpeedRef.current = runSpeed;
    setRunSpeed(runSpeed);
  };

  const connectNNearestCYNodes = (n: number) => {
    const copiedCYEdges = deepCopy(cyEdges);
    for (const cyNode of cyNodes) {
      const nearestDistances: number[] = new Array(n).fill(
        Number.MAX_SAFE_INTEGER
      );
      let nearestCYNodeIds: string[] = [];

      for (const otherCYNode of cyNodes) {
        if (
          cyNode.data.id === otherCYNode.data.id ||
          !cyNode.position ||
          !otherCYNode.position ||
          !otherCYNode.data.id
        )
          continue;

        const distance = euclideanDistance(
          cyNode.position,
          otherCYNode.position
        );
        if (nearestDistances[n - 1] > distance) {
          nearestDistances[n - 1] = distance;
          nearestCYNodeIds[n - 1] = otherCYNode.data.id;

          for (let i = nearestDistances.length - 1; i >= 1; i--) {
            if (nearestDistances[i] >= nearestDistances[i - 1]) break;
            swapElements(nearestDistances, i, i - 1);
            swapElements(nearestCYNodeIds, i, i - 1);
          }
        }
      }

      nearestCYNodeIds = nearestCYNodeIds.filter(
        (nearCYNodeId) =>
          nearCYNodeId &&
          !cyEdges.some(
            (cyEdge) =>
              cyEdge.data.id === buildEdgeId(cyNode.data.id!, nearCYNodeId) ||
              cyEdge.data.id === buildEdgeId(nearCYNodeId, cyNode.data.id!)
          )
      );

      for (const nearCYNodeId of nearestCYNodeIds) {
        copiedCYEdges.push(
          buildCYEdge(Number(cyNode.data.id), Number(nearCYNodeId))
        );
      }
    }
    setCYEdges(copiedCYEdges);
  };

  const setupCytoscape = (cy: cytoscape.Core) => {
    // Setup cy core.
    cyCore.current = cy;
    cyCore.current.on("dragfree", "node", (event) => {
      const eventNode = event.target as NodeSingular;
      const copiedCYNodes = deepCopy(cyNodes);
      const node = copiedCYNodes.find(
        (cyNode) => cyNode.data.id === eventNode.id()
      );
      if (!node) return;
      node["position"] = eventNode.position();
      setCYNodes(copiedCYNodes);
    });
    cy.on("cxttap", "node", (event) => {
      if (runProgressRef.current !== undefined) return;

      const eventNode = event.target as NodeSingular;
      const copiedCYNodes = deepCopy(cyNodes);
      const nodeIndex = copiedCYNodes.findIndex(
        (cyNode) => cyNode.data.id === eventNode.id()
      );
      if (nodeIndex < 0) return;
      copiedCYNodes.splice(nodeIndex, 1);

      const copiedCYEdges = deepCopy(cyEdges).filter(
        (cyEdge) =>
          eventNode.id() !== cyEdge.data.source &&
          eventNode.id() !== cyEdge.data.target
      );

      setCYEdges(copiedCYEdges);
      setCYNodes(copiedCYNodes);
    });
    cy.on("cxttap", "edge", (event) => {
      if (runProgressRef.current !== undefined) return;

      const eventEdge = event.target as EdgeSingular;
      const copiedCYEdges = deepCopy(cyEdges).filter(
        (cyEdge) =>
          (cyEdge.data.source !== eventEdge.data().source ||
            cyEdge.data.target !== eventEdge.data().target) &&
          (cyEdge.data.source !== eventEdge.data().target ||
            cyEdge.data.target !== eventEdge.data().source)
      );
      setCYEdges(copiedCYEdges);
    });

    // Setup cy edgehandles.
    cyEdgeHandles.current?.disableDrawMode();
    cyEdgeHandles.current?.destroy();
    cyEdgeHandles.current = cy.edgehandles({
      canConnect: (sourceNode, targetNode) =>
        !sourceNode.same(targetNode) &&
        !cyCore
          .current!.elements("edge")
          .some(
            (cyEdge) =>
              cyEdge.data().source === sourceNode.id() &&
              cyEdge.data().target === targetNode.id()
          ),
      edgeParams: (sourceNode, targetNode) => {
        return buildCYEdge(Number(sourceNode.id()), Number(targetNode.id()));
      },
    });
    if (drawModeActive) {
      cyEdgeHandles.current.enableDrawMode();
    } else {
      cyEdgeHandles.current.disableDrawMode();
    }
  };

  const handleDrawModeChange = (active: boolean, action?: DrawModeAction) => {
    if (!active) {
      if (!action)
        throw new Error("Action is required if draw mode changes to inactive.");
      if (!cyCore.current)
        throw new Error(
          "CY Core is required if draw mode changes to inactive."
        );

      if (action === "Ok") {
        const cyEdges: ElementDefinition[] = cyCore.current
          .elements("edge")
          .map((cyEdge) => ({ group: "edges", data: cyEdge.data() }));
        setCYEdges(cyEdges);
      } else {
        const currentCYEdges = cyCore.current.elements("edge");
        for (const currentCYEdge of currentCYEdges.toArray()) {
          if (cyEdges.some((cyEdge) => cyEdge.data.id === currentCYEdge.id()))
            continue;

          cyCore.current.remove(`#${currentCYEdge.id()}`);
        }
      }
    }

    setDrawModeActive(active);
  };

  const handleRun = async () => {
    _setRunProgress(0);

    const graph = new Graph<{}>();
    const nodes = cyNodes.map((cyNode) => ({
      nodeId: cyNode.data.id as string,
      data: {},
    }));
    graph.addNodes(...nodes);
    const edges: [NodeId, NodeId][] = [];
    for (const cyEdge of cyEdges) {
      if (
        edges.some(
          (edge) =>
            (cyEdge.data.source === edge[0] &&
              cyEdge.data.target === edge[1]) ||
            (cyEdge.data.target === edge[0] && cyEdge.data.source === edge[1])
        )
      )
        continue;

      edges.push([cyEdge.data.source, cyEdge.data.target]);
    }
    graph.addEdges(...edges);

    const algorithm = new Algorithm();
    const spanningTreeHistory = algorithm.run(graph);
    const historyLength = spanningTreeHistory.length;
    while (spanningTreeHistory.length !== 0) {
      if (stopIndicatorRef.current) break;

      const spanningTree = spanningTreeHistory.shift();
      if (!spanningTree) break;

      const copiedCYEdges = deepCopy(cyEdges);
      copiedCYEdges.forEach((cyEdge) => {
        if (
          spanningTree
            .getFlatEdges()
            .some(
              (edge) =>
                (cyEdge.data.source === edge[0].nodeId &&
                  cyEdge.data.target === edge[1].nodeId) ||
                (cyEdge.data.target === edge[0].nodeId &&
                  cyEdge.data.source === edge[1].nodeId)
            )
        )
          cyEdge.data.lineColor = "#0d6efd";
        else cyEdge.data.lineColor = "#ccc";
      });
      setCYEdges(copiedCYEdges);
      _setRunProgress(100 * (1 - spanningTreeHistory.length / historyLength));

      await sleep(1500 * (1 / runSpeedRef.current));
    }
    _setRunProgress(undefined);
    stopIndicatorRef.current = false;
  };

  const handleLoadPreset = (preset: Preset) => {
    const { cyNodes, cyEdges } = loadPreset(preset);
    setCYNodes(cyNodes);
    setCYEdges(cyEdges);
  };

  const handleAddNode = () => {
    let maxNodeId = Math.max(
      ...cyNodes.map((cyNode) => Number(cyNode.data.id))
    );
    if (!Number.isSafeInteger(maxNodeId)) maxNodeId = -1;
    const copiedCYNodes = deepCopy(cyNodes);
    copiedCYNodes.push(buildCYNode(maxNodeId + 1, { x: 0, y: 0 }));
    setCYNodes(copiedCYNodes);
  };

  const handleClear = (clearScope: ClearScope) => {
    if (clearScope === "All") {
      setCYNodes([]);
    }
    setCYEdges([]);
  };

  const handleStop = () => {
    if (!runProgress || runProgress === 100) return;
    stopIndicatorRef.current = true;
  };

  return (
    <>
      <Navigation
        drawModeActive={drawModeActive}
        runProgress={runProgress}
        runSpeed={runSpeed}
        onDrawModeChange={handleDrawModeChange}
        onRunSpeedChange={_setRunSpeed}
        onConnectNNearestNodes={() => connectNNearestCYNodes(4)}
        onLoadPreset={handleLoadPreset}
        onClear={handleClear}
        onAddNode={handleAddNode}
        onRun={handleRun}
        onStop={handleStop}
      ></Navigation>
      <CytoscapeComponent
        className={`w-100 flex-grow-1 ${drawModeActive}`}
        cy={setupCytoscape}
        elements={CytoscapeComponent.normalizeElements({
          nodes: cyNodes,
          edges: cyEdges,
        })}
        wheelSensitivity={0.2}
        layout={{ name: "preset" }}
        stylesheet={[
          {
            selector: "node",
            style: {
              label: "data(label)",
              width: "100%",
              height: "100%",
              "font-weight": "bold",
              "background-color": "black",
              "background-image": "data(imageUrl)",
              "background-image-containment": "over",
              "background-opacity": 0.0,
              "background-width": "225%",
              "background-height": "225%",
              "background-offset-y": "10%",
            },
          },
          {
            selector: "edge",
            style: {
              width: 6,
              "curve-style": "straight",
              "line-style": "solid",
              "line-color": "data(lineColor)",
            },
          },
        ]}
      />
    </>
  );
}

export default Sandbox;
