import cytoscape, {
  EdgeSingular,
  ElementDefinition,
  NodeSingular,
} from "cytoscape";
import edgehandles from "cytoscape-edgehandles";
import { Core } from "cytoscape";
import { EdgeHandlesInstance } from "cytoscape-edgehandles";
import { useRef, useState, useEffect } from "react";
import deepCopy from "../utils/others/deepCopy";
import CytoscapeComponent from "react-cytoscapejs";
import euclideanDistance from "../utils/others/euclideanDistance";
import swapElements from "../utils/others/swapElements";
import buildEdgeId from "../utils/others/buildEdgeId";
import Navigation, { ClearScope, RunSpeed } from "./Navigation";
import Graph from "../utils/algorithm/Graph";
import { NodeId } from "../utils/algorithm/Graph";
import Algorithm from "../utils/algorithm/Algorithm";
import loadPreset, { buildCyEdge, Preset } from "../data/presets";
import { buildCyNode } from "../data/presets";
import sleep from "../utils/others/sleep";
import equalId from "../utils/others/equalId";
import RenameNodeModal from "./modals/RenameNodeModal";
import { EditMode } from "./Navigation";
import StatsModal, { Stats } from "./modals/StatsModal";
import { retreat } from "../utils/others/sleep";
const avsdf = require("cytoscape-avsdf");

cytoscape.use(avsdf);
cytoscape.use(edgehandles);

function Sandbox() {
  // Cytoscape.
  const cyCoreRef = useRef<Core | null>(null);
  const cyEdgeHandlesRef = useRef<EdgeHandlesInstance | null>(null);

  // Nodes.
  const [cyNodes, setCyNodes] = useState<ElementDefinition[]>([]);
  const cyNodesRef = useRef<ElementDefinition[]>([]);
  cyNodesRef.current = cyNodes;

  // Edges.
  const [cyEdges, setCyEdges] = useState<ElementDefinition[]>([]);
  const cyEdgesRef = useRef<ElementDefinition[]>([]);
  cyEdgesRef.current = cyEdges;

  // Edit mode.
  const [editMode, setEditMode] = useState<EditMode>("Move");
  const editModeRef = useRef<EditMode>("Move");
  editModeRef.current = editMode;

  // Run progress and more.
  const [runProgress, setRunProgress] = useState<number>();
  const runProgressRef = useRef<number>();
  runProgressRef.current = runProgress;
  const [runSpeed, setRunSpeed] = useState<RunSpeed>(1.0);
  const runSpeedRef = useRef<RunSpeed>(1.0);
  runSpeedRef.current = runSpeed;
  const [progressBarVariant, setProgressBarVariant] = useState<
    "primary" | "warning"
  >("primary");
  const stopIndicatorRef = useRef(false);
  const [phaseNumber, setPhaseNumber] = useState<number>();

  // Layout.
  const [layout, setLayout] = useState<cytoscape.LayoutOptions>({
    name: "preset",
  });

  // Modals and more.
  const [cyNodeIdForRename, setCyNodeIdForRename] = useState<NodeId>();
  const [showRenameNodeModal, setShowRenameNodeModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stats, setStats] = useState<Stats>();

  useEffect(() => {
    if (!cyCoreRef.current)
      throw new Error(
        "Node positions cannot be updated after layout change, because cy core reference is undefined."
      );

    const updatedCyNodes = cyCoreRef.current.nodes();
    const copiedCyNodes = deepCopy(cyNodes);
    for (let i = 0; i < cyNodes.length; i++) {
      const updatedCyNode = updatedCyNodes[i];
      const cyNode = copiedCyNodes.find((cyNode) =>
        equalId(cyNode.data.id, updatedCyNode.id())
      );
      if (!cyNode)
        throw new Error(
          "Node positions cannot be updated after layout change, because at least one node was not matching the updated ones."
        );
      cyNode.position = updatedCyNode.position();
    }
    setCyNodes(copiedCyNodes);

    if (layout.name !== "preset") setLayout({ name: "preset" });
  }, [layout]);

  const connectNNearestCyNodes = (n: number) => {
    const copiedCyEdges = deepCopy(cyEdges);
    for (const cyNode of cyNodes) {
      const nearestDistances: number[] = new Array(n).fill(
        Number.MAX_SAFE_INTEGER
      );
      let nearestCyNodeIds: string[] = [];

      for (const otherCyNode of cyNodes) {
        if (
          equalId(cyNode.data.id, otherCyNode.data.id) ||
          !cyNode.position ||
          !otherCyNode.position ||
          !otherCyNode.data.id
        )
          continue;

        const distance = euclideanDistance(
          cyNode.position,
          otherCyNode.position
        );
        if (nearestDistances[n - 1] > distance) {
          nearestDistances[n - 1] = distance;
          nearestCyNodeIds[n - 1] = otherCyNode.data.id;

          for (let i = nearestDistances.length - 1; i >= 1; i--) {
            if (nearestDistances[i] >= nearestDistances[i - 1]) break;
            swapElements(nearestDistances, i, i - 1);
            swapElements(nearestCyNodeIds, i, i - 1);
          }
        }
      }

      nearestCyNodeIds = nearestCyNodeIds.filter(
        (nearCyNodeId) =>
          !cyEdges.some(
            (cyEdge) =>
              cyEdge.data.id === buildEdgeId(cyNode.data.id!, nearCyNodeId) ||
              cyEdge.data.id === buildEdgeId(nearCyNodeId, cyNode.data.id!)
          )
      );

      for (const nearCyNodeId of nearestCyNodeIds) {
        copiedCyEdges.push(
          buildCyEdge(Number(cyNode.data.id), Number(nearCyNodeId))
        );
      }
    }
    setCyEdges(copiedCyEdges);
  };

  const setupCytoscape = (cy: cytoscape.Core) => {
    if (cyCoreRef.current === cy) return;

    // Setup cy core.
    cyCoreRef.current = cy;
    cyCoreRef.current.on("dragfreeon", "node", (event) => {
      const eventNode = event.target as NodeSingular;
      const copiedCyNodes = deepCopy(cyNodesRef.current);
      const node = copiedCyNodes.find((cyNode) =>
        equalId(cyNode.data.id, eventNode.id())
      );
      if (!node) return;
      node["position"] = eventNode.position();
      setCyNodes(copiedCyNodes);
    });
    cy.on("select", "node", (event) => {
      if (
        runProgressRef.current !== undefined ||
        editModeRef.current !== "Delete"
      )
        return;

      const eventNode = event.target as NodeSingular;
      const copiedCyNodes = deepCopy(cyNodesRef.current);
      const nodeIndex = copiedCyNodes.findIndex((cyNode) =>
        equalId(cyNode.data.id, eventNode.id())
      );
      if (nodeIndex < 0) return;
      copiedCyNodes.splice(nodeIndex, 1);

      const copiedCyEdges = deepCopy(cyEdgesRef.current).filter(
        (cyEdge) =>
          !equalId(eventNode.id(), cyEdge.data.source) &&
          !equalId(eventNode.id(), cyEdge.data.target)
      );

      setCyEdges(copiedCyEdges);
      setCyNodes(copiedCyNodes);
    });
    cy.on("select", "edge", (event) => {
      if (
        runProgressRef.current !== undefined ||
        editModeRef.current !== "Delete"
      )
        return;

      const eventEdge = event.target as EdgeSingular;
      const copiedCyEdges = deepCopy(cyEdgesRef.current).filter(
        (cyEdge) =>
          (!equalId(cyEdge.data.source, eventEdge.data().source) ||
            !equalId(cyEdge.data.target, eventEdge.data().target)) &&
          (!equalId(cyEdge.data.source, eventEdge.data().target) ||
            !equalId(cyEdge.data.target, eventEdge.data().source))
      );
      setCyEdges(copiedCyEdges);
    });
    cy.on("cxttap", "node", async (event) => {
      if (runProgressRef.current !== undefined) return;

      const eventNode = event.target as NodeSingular;
      setCyNodeIdForRename(eventNode.id());
      setShowRenameNodeModal(true);
    });

    // Setup cy edgehandles.
    cyEdgeHandlesRef.current?.disableDrawMode();
    cyEdgeHandlesRef.current?.destroy();
    cyEdgeHandlesRef.current = cy.edgehandles({
      canConnect: (sourceNode, targetNode) =>
        !sourceNode.same(targetNode) &&
        !cyCoreRef
          .current!.elements("edge")
          .some(
            (cyEdge) =>
              equalId(cyEdge.data().source, sourceNode.id()) &&
              equalId(cyEdge.data().target, targetNode.id())
          ),
      edgeParams: (sourceNode, targetNode) => {
        return buildCyEdge(Number(sourceNode.id()), Number(targetNode.id()));
      },
    });
    if (editMode === "Draw") {
      cyEdgeHandlesRef.current.enableDrawMode();
    } else {
      cyEdgeHandlesRef.current.disableDrawMode();
    }
  };

  const handleEditModeChange = (changedEditMode: EditMode) => {
    if (!cyCoreRef.current)
      throw new Error("CY Core is required if draw mode changes to inactive.");

    if (editMode === "Draw") {
      const cyEdges: ElementDefinition[] = cyCoreRef.current
        .elements("edge")
        .map((cyEdge) => ({ group: "edges", data: cyEdge.data() }));
      setCyEdges(cyEdges);
    }

    setEditMode(changedEditMode);
    if (changedEditMode === "Draw") {
      cyEdgeHandlesRef.current!.enableDrawMode();
    } else {
      cyEdgeHandlesRef.current!.disableDrawMode();
    }
  };

  const handleRun = async () => {
    setRunProgress(0);

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
    const { spanningTreeHistory, stats } = algorithm.run(graph);

    // Set new stats right away.
    setStats(stats);

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

          const copiedCyEdges = deepCopy(cyEdges);
          for (const cyEdge of copiedCyEdges) {
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
          setCyEdges(copiedCyEdges);

          if (i < composedMoves.length - 2) setProgressBarVariant("warning");
          else setProgressBarVariant("primary");

          if (
            composedMoves.length === 1 ||
            (i !== 0 && i !== composedMoves.length - 2)
          )
            composedHistoryIndex++;
          setRunProgress(100 * (composedHistoryIndex / composedHistoryLength));

          if (runSpeedRef.current !== "Skip")
            await sleep(1500 * (1 / runSpeedRef.current));
        }

        lastMove = spanningTreeRecord.move;
      }
    }
    setRunProgress(undefined);
    setRunSpeed(1.0);
    setPhaseNumber(undefined);
    if (!stopIndicatorRef.current) setShowStatsModal(true);
    stopIndicatorRef.current = false;
  };

  const handleLoadPreset = async (preset: Preset) => {
    const { cyNodes, cyEdges } = loadPreset(preset);
    clear("All");
    await retreat();
    setCyNodes(cyNodes);
    setCyEdges(cyEdges);
    await retreat();
    cyCoreRef.current?.fit();
  };

  const handleAddNode = () => {
    let maxNodeId = Math.max(
      ...cyNodes.map((cyNode) => Number(cyNode.data.id))
    );
    if (!Number.isSafeInteger(maxNodeId)) maxNodeId = -1;
    const copiedCyNodes = deepCopy(cyNodes);
    copiedCyNodes.push(buildCyNode(maxNodeId + 1, { x: 0, y: 0 }));
    setCyNodes(copiedCyNodes);
  };

  const clear = (clearScope: ClearScope) => {
    if (clearScope === "All") {
      setCyNodes([]);
    }
    setCyEdges([]);
  };

  const handleStop = () => {
    if (!runProgress || runProgress === 100) return;
    stopIndicatorRef.current = true;
  };

  const handleSkip = () => {
    setRunSpeed("Skip");
  };

  const deleteUnmarkedEdges = () => {
    const copiedCyEdges = deepCopy(cyEdges).filter(
      (cyEdge) => cyEdge.data.marked
    );
    setCyEdges(copiedCyEdges);
  };

  const handleRenameNode = (name: string) => {
    const copiedCyNodes = deepCopy(cyNodes);
    const cyNode = copiedCyNodes.find((cyNode) =>
      equalId(cyNode.data.id, cyNodeIdForRename)
    );
    if (!cyNode)
      throw new Error(
        "Node can't be renamed, because there is no node with the provided id."
      );
    cyNode.data.label = name;
    setCyNodes(copiedCyNodes);
    setShowRenameNodeModal(false);
  };

  const provideOldNodeNameForRename = () => {
    const cyNode = cyNodes.find((cyNode) =>
      equalId(cyNode.data.id, cyNodeIdForRename)
    );
    return cyNode?.data.label;
  };

  return (
    <>
      <div className="d-flex flex-column w-100 h-100">
        <Navigation
          layout={layout}
          progressBarVariant={progressBarVariant}
          editMode={editMode}
          phaseNumber={phaseNumber}
          runProgress={runProgress}
          maxConnectNearestNodesN={cyNodes.length - 1}
          runSpeed={runSpeed}
          onLayoutChange={setLayout}
          onEditModeChange={handleEditModeChange}
          onRunSpeedChange={setRunSpeed}
          onConnectNNearestNodes={connectNNearestCyNodes}
          onConnectAllNodes={() => connectNNearestCyNodes(cyNodes.length - 1)}
          onDeleteUnmarkedEdges={deleteUnmarkedEdges}
          onLoadPreset={handleLoadPreset}
          onClear={clear}
          onAddNode={handleAddNode}
          onRun={handleRun}
          onStop={handleStop}
          onSkip={handleSkip}
        ></Navigation>
        <div id="cy-container" className="flex-grow-1">
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
      <RenameNodeModal
        show={showRenameNodeModal}
        oldName={provideOldNodeNameForRename() ?? ""}
        onOk={handleRenameNode}
        onCancel={() => setShowRenameNodeModal(false)}
      ></RenameNodeModal>
      <StatsModal
        show={showStatsModal}
        stats={
          stats ?? {
            initialMaxNodeDegree: -1,
            finalMaxNodeDegree: -1,
            counts: [],
          }
        }
        onShowChange={setShowStatsModal}
      ></StatsModal>
    </>
  );
}

export default Sandbox;
