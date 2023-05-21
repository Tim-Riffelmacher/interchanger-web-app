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
import NavigationBar, {
  ClearScope,
  RunMode,
  EditMode,
} from "./navigation/NavigationBar";
import Graph, { EdgeId } from "../utils/algorithm/Graph";
import { NodeId } from "../utils/algorithm/Graph";
import Algorithm, { DebugHistory } from "../utils/algorithm/Algorithm";
import loadPreset, { buildCyEdge, buildEdgeId, Preset } from "../data/presets";
import { buildCyNode } from "../data/presets";
import equalId from "../utils/others/equalId";
import RenameNodeModal from "./modals/RenameNodeModal";
import StatsModal, { Stats } from "./modals/StatsModal";
import { retreat } from "../utils/others/sleep";
import randomHexColor, { HexColor } from "../utils/others/randomHexColor";
import DebugInfo from "./modals/DebugInfo";
import debugInfoTextTemplates from "../data/debugInfoTextTemplates";
const avsdf = require("cytoscape-avsdf");

cytoscape.use(avsdf);
cytoscape.use(edgehandles);

export type DebugAction = "Back" | "Next" | "SkipSubphase" | "SkipPhase";

export enum DebugHistoryStep {
  SHOW_T = 0,
  SHOW_NODES_OF_DEGREE_K = 1,
  SHOW_NODES_OF_DEGREE_K_MINUS_1 = 2,
  SHOW_F = 3,
  SHOW_C = 4,
  SHOW_OUTER_COMPONENT_EDGES = 5,
  SHOW_CYCLE = 6,
  SHOW_FURTHER = 7,
}

function Sandbox() {
  // Cytoscape.
  const cyCoreRef = useRef<Core | null>(null);
  const cyEdgeHandlesRef = useRef<EdgeHandlesInstance | null>(null);

  // Nodes.
  const [cyNodes, setCyNodes] = useState<ElementDefinition[]>([]);
  const cyNodesRef = useRef(cyNodes);
  cyNodesRef.current = cyNodes;

  // Edges.
  const [cyEdges, setCyEdges] = useState<ElementDefinition[]>([]);
  const cyEdgesRef = useRef(cyEdges);
  cyEdgesRef.current = cyEdges;

  // Edit mode.
  const [editMode, setEditMode] = useState<EditMode>("Move");
  const editModeRef = useRef(editMode);
  editModeRef.current = editMode;

  // Run progress and more.
  const [runProgress, setRunProgress] = useState<number | null>(null);
  const runProgressRef = useRef(runProgress);
  runProgressRef.current = runProgress;

  const [runMode, setRunMode] = useState<RunMode>("None");

  const [runSpeed, setRunSpeed] = useState<number>(1);
  const runSpeedRef = useRef(runSpeed);
  runSpeedRef.current = runSpeed;

  const runSpeedChangeIndictorRef = useRef(false);

  const [autoDebugAction, setAutoDebugAction] =
    useState<DebugAction>("SkipSubphase");
  const autoDebugActionRef = useRef(autoDebugAction);
  autoDebugActionRef.current = autoDebugAction;

  const [autoRunInterval, setAutoRunInterval] = useState<any>(null);

  const [progressBarVariant, setProgressBarVariant] = useState<
    "primary" | "warning"
  >("primary");

  const stopIndicatorRef = useRef(false);

  const [phaseNumber, setPhaseNumber] = useState<number | null>(null);

  // Debug history.
  const [debugHistory, setDebugHistory] = useState<DebugHistory | null>(null);
  const debugHistoryRef = useRef(debugHistory);
  debugHistoryRef.current = debugHistory;

  const [debugHistoryComplexIndex, setDebugHistoryComplexIndex] = useState<{
    phaseIndex: number;
    subphaseIndex: number;
    step: DebugHistoryStep;
  } | null>(null);
  const debugHistoryComplexIndexRef = useRef(debugHistoryComplexIndex);
  debugHistoryComplexIndexRef.current = debugHistoryComplexIndex;

  // Layout.
  const [layout, setLayout] = useState<cytoscape.LayoutOptions>({
    name: "preset",
  });

  // Modals and more.
  const [cyNodeIdForRename, setCyNodeIdForRename] = useState<NodeId | null>(
    null
  );
  const [showRenameNodeModal, setShowRenameNodeModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!debugHistory || !debugHistoryComplexIndex) return;

    let progressNumerator = 0;
    let progressDenominator = 0;
    for (let i = 0; i < debugHistory.length; i++) {
      const subphasesLength = debugHistory[i].subphases.length;
      for (let j = 0; j < subphasesLength; j++) {
        if (
          i <= debugHistoryComplexIndex.phaseIndex &&
          j <= debugHistoryComplexIndex.subphaseIndex
        )
          progressNumerator++;
      }
      progressDenominator += subphasesLength;
    }
    setRunProgress((progressNumerator / progressDenominator) * 100);

    const { phaseIndex, subphaseIndex, step } = debugHistoryComplexIndex;
    const debugHistoryRecord =
      debugHistory[phaseIndex].subphases[subphaseIndex];

    if (step === DebugHistoryStep.SHOW_T) {
      colorCyNodes([
        { nodeIds: debugHistoryRecord.nodeIdsInT, hexColor: "#0d6efd" },
      ]);
      colorCyEdges(
        [{ edgeIds: debugHistoryRecord.edgeIdsInT, hexColor: "#0d6efd" }],
        true
      );
    } else if (step === DebugHistoryStep.SHOW_NODES_OF_DEGREE_K) {
      colorCyNodes([
        { nodeIds: debugHistoryRecord.nodeIdsOfDegreeK, hexColor: "#0d6efd" },
      ]);
      colorCyEdges([]);
    } else if (step === DebugHistoryStep.SHOW_NODES_OF_DEGREE_K_MINUS_1) {
      colorCyNodes([
        { nodeIds: debugHistoryRecord.nodeIdsOfDegreeK, hexColor: "#0d6efd" },
        {
          nodeIds: debugHistoryRecord.nodeIdsOfDegreeKMinus1,
          hexColor: "#0d6efd",
        },
      ]);
      colorCyEdges([]);
    } else if (step === DebugHistoryStep.SHOW_F) {
      colorCyNodes([
        {
          nodeIds: debugHistoryRecord.nodeIdsOfDegreeK,
          hexColor: "#0d6efd",
        },
        {
          nodeIds: debugHistoryRecord.nodeIdsOfDegreeKMinus1,
          hexColor: "#0d6efd",
        },
      ]);
      colorCyEdges([
        { edgeIds: debugHistoryRecord.edgeIdsOfF, hexColor: "#0d6efd" },
      ]);
    } else if (step === DebugHistoryStep.SHOW_C) {
      const nodeColors: any[] = [];
      const edgeColors: any[] = [];
      for (let i = 0; i < debugHistoryRecord.nodeIdsInC.length; i++) {
        const hexColor = randomHexColor(`seed_${i}`);
        nodeColors.push({
          nodeIds: debugHistoryRecord.nodeIdsInC[i],
          hexColor,
        });
        edgeColors.push({
          edgeIds: debugHistoryRecord.edgeIdsInC[i],
          hexColor,
        });
      }
      colorCyNodes(nodeColors);
      colorCyEdges(edgeColors);
    } else if (step === DebugHistoryStep.SHOW_OUTER_COMPONENT_EDGES) {
      const nodeColors: any[] = [];
      for (let i = 0; i < debugHistoryRecord.nodeIdsInC.length; i++) {
        nodeColors.push({
          nodeIds: debugHistoryRecord.nodeIdsInC[i],
          hexColor: randomHexColor(`seed_${i}`),
        });
      }
      colorCyNodes(nodeColors);
      colorCyEdges([
        {
          edgeIds: debugHistoryRecord.outerComponentEdgeIds,
          hexColor: "#0d6efd",
        },
      ]);
    } else if (step === DebugHistoryStep.SHOW_CYCLE) {
      colorCyNodes([
        { nodeIds: debugHistoryRecord.nodeIdsInCycle, hexColor: "#0d6efd" },
      ]);
      colorCyEdges([
        {
          edgeIds: debugHistoryRecord.edgeIdsInCycle,
          hexColor: "#0d6efd",
        },
      ]);
    } else if (step === DebugHistoryStep.SHOW_FURTHER) {
      if (!debugHistoryRecord.containsMove) {
      } else {
      }
    }
  }, [debugHistoryComplexIndex]);

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
          !copiedCyEdges.some((cyEdge) =>
            equalId(
              cyEdge.data.id,
              buildEdgeId(Number(cyNode.data.id!), Number(nearCyNodeId))
            )
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
      if (!node)
        throw new Error(
          "Node position cannot be updated, because there is no node with the provided id."
        );
      node.position = eventNode.position();
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
      if (nodeIndex < 0)
        throw new Error(
          "Node cannot be deleted, because there is none with the provided id."
        );
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
      const copiedCyEdges = deepCopy(cyEdgesRef.current);
      const edgeIndex = copiedCyEdges.findIndex((cyEdge) =>
        equalId(cyEdge.data.id, eventEdge.id())
      );
      if (edgeIndex < 0)
        throw new Error(
          "Edge cannot be deleted, because there is none with the provided id."
        );
      copiedCyEdges.splice(edgeIndex, 1);

      setCyEdges(copiedCyEdges);
    });
    cy.on("cxttap", "node", async (event) => {
      if (runProgressRef.current !== undefined) return;

      const eventNode = event.target as NodeSingular;
      setCyNodeIdForRename(Number(eventNode.id()));
      setShowRenameNodeModal(true);
    });

    // Setup cy edgehandles.
    cyEdgeHandlesRef.current?.disableDrawMode();
    cyEdgeHandlesRef.current?.destroy();
    cyEdgeHandlesRef.current = cy.edgehandles({
      canConnect: (sourceNode, targetNode) =>
        !sourceNode.same(targetNode) &&
        !cyCoreRef
          .current!.edges()
          .some((cyEdge) =>
            equalId(
              cyEdge.data().id,
              buildEdgeId(Number(sourceNode.id()), Number(targetNode.id()))
            )
          ),
      edgeParams: (sourceNode, targetNode) =>
        buildCyEdge(Number(sourceNode.id()), Number(targetNode.id())),
    });
    if (editMode === "Draw") {
      cyEdgeHandlesRef.current.enableDrawMode();
    } else {
      cyEdgeHandlesRef.current.disableDrawMode();
    }
  };

  const handleEditModeChange = (changedEditMode: EditMode) => {
    if (!cyCoreRef.current)
      throw new Error("Cy Core is required if draw mode changes to inactive.");

    if (editMode === "Draw") {
      const cyEdges: ElementDefinition[] = cyCoreRef.current
        .edges()
        .map((cyEdge) => ({ group: "edges", data: cyEdge.data() }));
      setCyEdges(cyEdges);
    }

    setEditMode(changedEditMode);

    if (!cyEdgeHandlesRef.current)
      throw new Error(
        "Cy edge handles are required to either enable or disable draw mode when changing the edit mode."
      );
    if (changedEditMode === "Draw") {
      cyEdgeHandlesRef.current.enableDrawMode();
    } else {
      cyEdgeHandlesRef.current.disableDrawMode();
    }
  };

  const autoRun = async () => {
    if (runMode !== "Debug") return;

    setRunMode("Auto");

    // For safety if there already exists an interval.
    clearInterval(autoRunInterval);

    const setupInterval = () => {
      const interval = setInterval(() => {
        if (runSpeedChangeIndictorRef.current) {
          clearInterval(interval);
          runSpeedChangeIndictorRef.current = false;
          setupInterval();
        } else handleDebugAction(autoDebugActionRef.current);
      }, 3000 / runSpeedRef.current);
      setAutoRunInterval(interval);
    };
    setupInterval();

    /* // Calculate overall history length.
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

          const edgeIdsToColor = singleMove
            .getFlatEdges()
            .map((edge) => buildEdgeId(edge[0].nodeId, edge[1].nodeId));
          colorCyEdges(
            edgeIdsToColor,
            i < composedMoves.length - 2 ? "#ffc107" : "#0d6efd",
            true
          );

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
    stopIndicatorRef.current = false;*/
  };

  const debugRun = () => {
    pauseRun();
    setRunMode("Debug");
  };

  const run = () => {
    setRunProgress(0);

    // Transform the cytoscape graph into the internally used graph for the algorithm.
    const graph = new Graph<{}>();
    const nodes = cyNodes.map((cyNode) => ({
      nodeId: Number(cyNode.data.id),
      data: {},
    }));
    graph.addNodes(...nodes);
    const edges: [NodeId, NodeId][] = [];
    for (const cyEdge of cyEdges) {
      edges.push([cyEdge.data.source, cyEdge.data.target]);
    }
    graph.addEdges(...edges);

    const algorithm = new Algorithm();
    const { stats, debugHistory } = algorithm.run(graph);

    // Set debug history right away.
    setDebugHistory(debugHistory);

    // Set new stats right away.
    setStats(stats);

    // Set index for the debug history.
    setDebugHistoryComplexIndex({
      phaseIndex: 0,
      subphaseIndex: 0,
      step: 0,
    });

    setRunMode("Debug");
  };

  const pauseRun = () => {
    clearInterval(autoRunInterval);
    stopIndicatorRef.current = true;
  };

  const stopRun = () => {
    pauseRun();

    setRunMode("None");
    setDebugHistory(null);
    setDebugHistoryComplexIndex(null);
    colorCyNodes([]);
    colorCyEdges([]);
  };

  const loadCertainPreset = async (preset: Preset) => {
    const { cyNodes, cyEdges } = loadPreset(preset);
    setCyNodes(cyNodes);
    setCyEdges(cyEdges);

    await fitScreenIfPossible();
  };

  const addNode = async () => {
    let maxNodeId = Math.max(
      ...cyNodes.map((cyNode) => Number(cyNode.data.id))
    );
    if (!Number.isSafeInteger(maxNodeId)) maxNodeId = -1;
    const copiedCyNodes = deepCopy(cyNodes);
    copiedCyNodes.push(buildCyNode(maxNodeId + 1, { x: 0, y: 0 }));
    setCyNodes(copiedCyNodes);

    await fitScreenIfPossible();
  };

  const fitScreenIfPossible = async () => {
    await retreat();
    cyCoreRef.current?.fit();
  };

  const clear = (clearScope: ClearScope) => {
    if (clearScope === "All") {
      setCyNodes([]);
    }
    setCyEdges([]);
  };

  const handleSkip = () => {
    setRunSpeed(1); // TODO
  };

  const deleteUnmarkedEdges = () => {
    const copiedCyEdges = deepCopy(cyEdges).filter(({ data }) => data.marked);
    setCyEdges(copiedCyEdges);
  };

  const renameNode = (name: string) => {
    if (!cyNodeIdForRename)
      throw new Error(
        "Node can't be renamed, because no node id for rename is stored."
      );

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

  const colorCyNodes = (
    colors: { nodeIds: NodeId[]; hexColor: HexColor }[]
  ) => {
    const copiedCyNodes = deepCopy(cyNodesRef.current);
    for (const cyNode of copiedCyNodes) {
      let nodeColored = false;

      for (const color of colors) {
        if (
          color.nodeIds.some((nodeId) => {
            return equalId(nodeId, Number(cyNode.data.id));
          })
        ) {
          // TODO(trm): Remove Number(...)!
          cyNode.data.bgColor = color.hexColor;
          cyNode.data.bgOpacity = 1;
          nodeColored = true;
          break;
        }
      }

      if (nodeColored) continue;

      cyNode.data.bgColor = "white";
      cyNode.data.bgOpacity = 0;
    }
    setCyNodes(copiedCyNodes);
  };

  const colorCyEdges = (
    colors: { edgeIds: EdgeId[]; hexColor: HexColor }[],
    mark = false
  ) => {
    const copiedCyEdges = deepCopy(cyEdgesRef.current);
    for (const cyEdge of copiedCyEdges) {
      let edgeColored = false;

      for (const color of colors) {
        if (color.edgeIds.some((edgeId) => equalId(edgeId, cyEdge.data.id))) {
          cyEdge.data.lineColor = color.hexColor;
          if (mark) {
            cyEdge.data.lineWidth = 10;
            cyEdge.data.marked = true;
            cyEdge.data.lineStyle = "solid";
          }
          edgeColored = true;
          break;
        }
      }

      if (edgeColored) continue;

      cyEdge.data.lineColor = "#ccc";
      if (mark) {
        cyEdge.data.lineWidth = 5;
        cyEdge.data.marked = false;
        cyEdge.data.lineStyle = "dashed";
      }
    }
    setCyEdges(copiedCyEdges);
  };

  const handleDebugAction = (action: DebugAction) => {
    if (!debugHistoryRef.current || !debugHistoryComplexIndexRef.current)
      return;

    const copiedComplexIndex = deepCopy(debugHistoryComplexIndexRef.current);

    if (action === "Back") {
      copiedComplexIndex.step--;
    } else if (action === "Next") {
      copiedComplexIndex.step++;
    } else if (action === "SkipSubphase") {
      copiedComplexIndex.step = 0;
      copiedComplexIndex.subphaseIndex++;
    } else if (action === "SkipPhase") {
      copiedComplexIndex.step = 0;
      copiedComplexIndex.subphaseIndex = 0;
      copiedComplexIndex.phaseIndex++;
    }

    if (copiedComplexIndex.step < 0) {
      copiedComplexIndex.step = Object.keys(DebugHistoryStep).length / 2 - 1;
      copiedComplexIndex.subphaseIndex--;
    } else if (
      copiedComplexIndex.step >=
      Object.keys(DebugHistoryStep).length / 2
    ) {
      copiedComplexIndex.step = 0;
      copiedComplexIndex.subphaseIndex++;
    }

    if (copiedComplexIndex.subphaseIndex < 0) {
      copiedComplexIndex.subphaseIndex =
        debugHistoryRef.current[copiedComplexIndex.phaseIndex - 1]?.subphases
          .length - 1;
      copiedComplexIndex.phaseIndex--;
    } else if (
      copiedComplexIndex.subphaseIndex >=
      debugHistoryRef.current[copiedComplexIndex.phaseIndex].subphases.length
    ) {
      copiedComplexIndex.subphaseIndex = 0;
      copiedComplexIndex.phaseIndex++;
    }

    if (
      copiedComplexIndex.phaseIndex < 0 ||
      copiedComplexIndex.phaseIndex >= debugHistoryRef.current.length
    ) {
      setRunProgress(null);
      return;
    }
    console.log(
      copiedComplexIndex.phaseIndex,
      debugHistoryRef.current.length,
      debugHistoryRef.current,
      copiedComplexIndex.phaseIndex >= debugHistoryRef.current.length
    );

    setDebugHistoryComplexIndex(copiedComplexIndex);
  };

  const handleRunSpeedChange = (newRunSpeed: number) => {
    runSpeedChangeIndictorRef.current = true;
    setRunSpeed(newRunSpeed);
  };

  return (
    <>
      <div className="d-flex flex-column w-100 h-100">
        <NavigationBar
          progressBarVariant={progressBarVariant}
          editMode={editMode}
          phaseNumber={phaseNumber ?? -1}
          runProgress={runProgress ?? -1}
          maxConnectNearestNodesN={cyNodes.length - 1}
          runSpeed={runSpeed}
          autoDebugAction={autoDebugAction}
          runMode={runMode}
          onLayoutChange={setLayout}
          onEditModeChange={handleEditModeChange}
          onRunSpeedChange={handleRunSpeedChange}
          onAutoDebugActionChange={setAutoDebugAction}
          onConnectNNearestNodes={connectNNearestCyNodes}
          onConnectAllNodes={() => connectNNearestCyNodes(cyNodes.length - 1)}
          onDeleteUnmarkedEdges={deleteUnmarkedEdges}
          onLoadPreset={loadCertainPreset}
          onClear={clear}
          onAddNode={addNode}
          onRun={run}
          onDebugRun={debugRun}
          onAutoRun={autoRun}
          onStop={stopRun}
          onSkip={handleSkip}
          onDebugNext={() => handleDebugAction("Next")}
          onDebugBack={() => handleDebugAction("Back")}
          onDebugSkipSubphase={() => handleDebugAction("SkipSubphase")}
          onDebugSkipPhase={() => handleDebugAction("SkipPhase")}
        ></NavigationBar>
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
                  "border-color": "black",
                  "border-opacity": "data(borderOpacity)" as any,
                  "border-width": "3%",
                  "background-color": "data(bgColor)",
                  "background-image": "data(imageUrl)",
                  "background-image-containment": "over",
                  "background-opacity": "data(bgOpacity)" as any,
                  "background-width": "225%",
                  "background-height": "225%",
                  "background-offset-y": "10%",
                },
              },
              {
                selector: "edge",
                style: {
                  width: "data(lineWidth)",
                  "curve-style": "straight",
                  "line-style": "data(lineStyle)" as any,
                  "line-color": "data(lineColor)",
                  "line-cap": "butt",
                },
              },
            ]}
          />
        </div>
      </div>
      <RenameNodeModal
        show={showRenameNodeModal}
        oldName={provideOldNodeNameForRename() ?? ""}
        onOk={renameNode}
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
      {debugHistoryComplexIndex ? (
        <DebugInfo
          {...debugInfoTextTemplates(debugHistoryComplexIndex.step)}
        ></DebugInfo>
      ) : null}
    </>
  );
}

export default Sandbox;
