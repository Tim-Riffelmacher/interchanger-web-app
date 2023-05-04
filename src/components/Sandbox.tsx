import cytoscape, {
  EdgeSingular,
  ElementDefinition,
  NodeSingular,
} from "cytoscape";
import edgehandles from "cytoscape-edgehandles";
import { Core } from "cytoscape";
import { EdgeHandlesInstance } from "cytoscape-edgehandles";
import { useEffect, useRef, useState } from "react";
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
import equalId from "../utils/equalId";
const avsdf = require("cytoscape-avsdf");

cytoscape.use(avsdf);
cytoscape.use(edgehandles);

function Sandbox() {
  const cyCore = useRef<Core | null>(null);
  const cyEdgeHandles = useRef<EdgeHandlesInstance | null>(null);

  const [cyNodes, setCYNodes] = useState<ElementDefinition[]>([]);
  const cyNodesRef = useRef<ElementDefinition[]>([]);
  cyNodesRef.current = cyNodes;

  const [cyEdges, setCYEdges] = useState<ElementDefinition[]>([]);
  const cyEdgesRef = useRef<ElementDefinition[]>([]);
  cyEdgesRef.current = cyEdges;

  const [drawModeActive, setDrawModeActive] = useState(false);
  const runProgressRef = useRef<number>();
  const [runProgress, setRunProgress] = useState<number>();
  const [progressBarVariant, setProgressBarVariant] = useState<
    "primary" | "warning"
  >("primary");
  const runSpeedRef = useRef<RunSpeed>(1.0);
  const [runSpeed, setRunSpeed] = useState<RunSpeed>(runSpeedRef.current);
  const stopIndicatorRef = useRef(false);
  const [layout, setLayout] = useState<cytoscape.LayoutOptions>({
    name: "preset",
  });
  const [selectedCYNodeId, setSelectedCYNodeId] = useState<string>();
  const [phaseNumber, setPhaseNumber] = useState<number>();

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
    if (cyCore.current === cy) return;

    // Setup cy core.
    cyCore.current = cy;
    cyCore.current.on("dragfreeon", "node", (event) => {
      const eventNode = event.target as NodeSingular;
      const copiedCYNodes = deepCopy(cyNodesRef.current);
      const node = copiedCYNodes.find((cyNode) =>
        equalId(cyNode.data.id, eventNode.id())
      );
      if (!node) return;
      node["position"] = eventNode.position();
      setCYNodes(copiedCYNodes);
    });
    cy.on("cxttap", "node", (event) => {
      if (runProgressRef.current !== undefined) return;

      const eventNode = event.target as NodeSingular;
      const copiedCYNodes = deepCopy(cyNodesRef.current);
      const nodeIndex = copiedCYNodes.findIndex((cyNode) =>
        equalId(cyNode.data.id, eventNode.id())
      );
      if (nodeIndex < 0) return;
      copiedCYNodes.splice(nodeIndex, 1);

      const copiedCYEdges = deepCopy(cyEdgesRef.current).filter(
        (cyEdge) =>
          !equalId(eventNode.id(), cyEdge.data.source) &&
          !equalId(eventNode.id(), cyEdge.data.target)
      );

      setCYEdges(copiedCYEdges);
      setCYNodes(copiedCYNodes);
    });
    cy.on("cxttap", "edge", (event) => {
      if (runProgressRef.current !== undefined) return;

      const eventEdge = event.target as EdgeSingular;
      const copiedCYEdges = deepCopy(cyEdgesRef.current).filter(
        (cyEdge) =>
          (!equalId(cyEdge.data.source, eventEdge.data().source) ||
            !equalId(cyEdge.data.target, eventEdge.data().target)) &&
          (!equalId(cyEdge.data.source, eventEdge.data().target) ||
            !equalId(cyEdge.data.target, eventEdge.data().source))
      );
      setCYEdges(copiedCYEdges);
    });
    cy.on("select", "node", async (event) => {
      const eventNode = event.target as NodeSingular;
      setSelectedCYNodeId(eventNode.id());
      await sleep(0);
      cy.elements()
        .not("#" + eventNode.id())
        .unselect();

      document.getElementById("cy-container")?.focus();
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
              equalId(cyEdge.data().source, sourceNode.id()) &&
              equalId(cyEdge.data().target, targetNode.id())
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
    if (active) {
      cyEdgeHandles.current?.enableDrawMode();
    } else {
      cyEdgeHandles.current?.disableDrawMode();
    }
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

    // Calculate overall history length.
    let composedHistoryLength = 0;
    for (const spanningTreePhase of spanningTreeHistory) {
      composedHistoryLength += spanningTreePhase.phase.length;
      for (const spanningTreeRecord of spanningTreePhase.phase) {
        composedHistoryLength += spanningTreeRecord.propagatedMoves.length;
      }
    }

    let composedHistoryIndex = 0;
    let lastMove = spanningTreeHistory[0].phase[0].move;
    for (const spanningTreePhase of spanningTreeHistory) {
      setPhaseNumber(spanningTreePhase.k);

      for (const spanningTreeRecord of spanningTreePhase.phase) {
        const composedMoves = [spanningTreeRecord.move];
        if (spanningTreeRecord.propagatedMoves.length !== 0) {
          composedMoves.unshift(
            spanningTreeRecord.propagatedMoves[
              spanningTreeRecord.propagatedMoves.length - 1
            ]
          );
          composedMoves.unshift(...spanningTreeRecord.propagatedMoves);
          composedMoves.unshift(lastMove);
        }

        for (let i = 0; i < composedMoves.length; i++) {
          if (stopIndicatorRef.current) break;

          const singleMove = composedMoves[i];

          const copiedCYEdges = deepCopy(cyEdges);
          for (const cyEdge of copiedCYEdges) {
            if (
              singleMove
                .getFlatEdges()
                .some(
                  (edge) =>
                    (cyEdge.data.source === edge[0].nodeId &&
                      cyEdge.data.target === edge[1].nodeId) ||
                    (cyEdge.data.target === edge[0].nodeId &&
                      cyEdge.data.source === edge[1].nodeId)
                )
            ) {
              cyEdge.data.lineColor =
                i < composedMoves.length - 2 ? "#ffc107" : "#0d6efd";
              cyEdge.data.marked = true;
            } else {
              cyEdge.data.lineColor = "#ccc";
              cyEdge.data.marked = false;
            }
          }
          setCYEdges(copiedCYEdges);

          if (i < composedMoves.length - 2) setProgressBarVariant("warning");
          else setProgressBarVariant("primary");

          if (
            composedMoves.length === 1 ||
            (i !== 0 && i !== composedMoves.length - 2)
          )
            composedHistoryIndex++;
          _setRunProgress(100 * (composedHistoryIndex / composedHistoryLength));

          if (runSpeedRef.current !== "Skip")
            await sleep(1500 * (1 / runSpeedRef.current));
        }

        lastMove = spanningTreeRecord.move;
      }
    }
    _setRunProgress(undefined);
    _setRunSpeed(1.0);
    setPhaseNumber(undefined);
    stopIndicatorRef.current = false;
  };

  const handleLoadPreset = async (preset: Preset) => {
    const { cyNodes, cyEdges } = loadPreset(preset);
    setLayout({ name: "preset" });
    setCYNodes([]);
    setCYEdges([]);
    await sleep(0);
    setCYNodes(cyNodes);
    setCYEdges(cyEdges);
    await sleep(0);
    cyCore.current?.fit();
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

  const handleSkip = () => {
    _setRunSpeed("Skip");
  };

  const handleKeyDown = (event: any) => {
    if (!selectedCYNodeId) return;
    if (event.key === "Enter" || event.key === "Escape") {
      cyCore.current?.elements().unselect();
      document.getElementById("cy-container")?.blur();
      return;
    }

    const copiedCYNodes = deepCopy(cyNodes);
    const cyNode = copiedCYNodes.find(
      (cyNode) => cyNode.data.id === selectedCYNodeId
    );
    if (!cyNode) return;

    if (!/^[a-zA-Z0-9_.\s-]$|Backspace/.test(event.key)) return;
    if (event.key === "Backspace")
      cyNode.data.label = cyNode.data.label.slice(0, -1);
    else cyNode.data.label += event.key;
    setCYNodes(copiedCYNodes);
  };

  const deleteUnmarkedEdges = () => {
    const copiedCyEdges = deepCopy(cyEdges).filter(
      (cyEdge) => cyEdge.data.marked
    );
    setCYEdges(copiedCyEdges);
  };

  return (
    <div className="d-flex flex-column w-100 h-100">
      <Navigation
        layout={layout}
        progressBarVariant={progressBarVariant}
        drawModeActive={drawModeActive}
        phaseNumber={phaseNumber}
        runProgress={runProgress}
        runSpeed={runSpeed}
        onLayoutChange={setLayout}
        onDrawModeChange={handleDrawModeChange}
        onRunSpeedChange={_setRunSpeed}
        onConnectNNearestNodes={() => connectNNearestCYNodes(5)}
        onConnectAllNodes={() => connectNNearestCYNodes(cyNodes.length - 1)}
        onDeleteUnmarkedEdges={deleteUnmarkedEdges}
        onLoadPreset={handleLoadPreset}
        onClear={handleClear}
        onAddNode={handleAddNode}
        onRun={handleRun}
        onStop={handleStop}
        onSkip={handleSkip}
      ></Navigation>
      <div
        id="cy-container"
        className="flex-grow-1"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <CytoscapeComponent
          className="w-100 h-100"
          cy={setupCytoscape}
          elements={CytoscapeComponent.normalizeElements({
            nodes: cyNodes,
            edges: cyEdges,
          })}
          wheelSensitivity={0.2}
          layout={layout}
          boxSelectionEnabled={false}
          stylesheet={[
            {
              selector: "node",
              style: {
                "selection-box-border-color": "#ff0000",
                "selection-box-border-width": 5,
                label: "data(label)",
                width: "100%",
                height: "100%",
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
              selector: "node:selected",
              css: {
                "border-color": "#ffc107",
                "border-style": "solid",
                "border-width": 3,
                color: "#ffc107",
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
      </div>
    </div>
  );
}

export default Sandbox;
