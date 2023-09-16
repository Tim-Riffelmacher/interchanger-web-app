import Graph, { NodeId } from "./Graph";
import { Node, EdgeId } from "./Graph";
import { Stats } from "../../components/modals/StatsModal";
import { buildEdgeId } from "../../data/presets";
import equalId from "../others/equalId";

export type DebugHistoryLabelBody = {
  updatedLabelledNodeIds: NodeId[];
  updatedNodesOfDegreeKMinus1: NodeId[];
};

export type DebugHistoryMoveBody = {
  nodeIdToReduce: NodeId;
  move: {
    updatedEdgeIdsInT: EdgeId[];
  };
  propagatedMoves: {
    labelledNodeId: NodeId;
    edgeIdToAdd: EdgeId;
    edgeIdToRemove: EdgeId;
    updatedEdgeIdsInT: EdgeId[];
    updatedLabelledNodeIds: NodeId[];
  }[];
};

export type DebugHistory = {
  k: number;
  subphases: {
    finished: boolean;
    nodeIdsInT: NodeId[];
    edgeIdsInT: EdgeId[];
    nodesOfDegreeKLeft: number;
    nodeIdsOfDegreeK: NodeId[];
    nodeIdsOfDegreeKMinus1: NodeId[];
    edgeIdsInF: EdgeId[]; // Stores all edges in F.
    nodeIdsInC: NodeId[][]; // Stores all different components in C.
    edgeIdsInC: EdgeId[][];
    outerComponentEdgeIds: EdgeId[];
    labelledNodeIds: NodeId[];
    edgeIdForCyle: EdgeId;
    nodeIdsInCycle: NodeId[];
    nodeIdsOfDegreeKMinus1InCycle: NodeId[];
    edgeIdsInCycle: EdgeId[];
    containsMove: boolean;
    body: DebugHistoryLabelBody | DebugHistoryMoveBody;
  }[];
}[];

/**
 * The algorithm handler.
 */
export default class Algorithm<T> {
  /**
   * Runs the algorithm on a given graph and returns the result additionally providing stats and history.
   */
  public run(graph: Graph<T>) {
    if (graph.breadthFirstSearch().length !== 1)
      throw new Error(
        "Cannot run algorithm, because the graph is either empty or not fully connected."
      );

    const spanningTree = this.getArbitrarySpanningTree(graph);
    let labelledNodes: Record<
      NodeId,
      { neighbourNodeId: NodeId; edge: [NodeId, NodeId] }
    > = {};

    const stats: Stats = {
      initialMaxNodeDegree: spanningTree.getMaxNodeDegree(),
      finalMaxNodeDegree: -1,
      counts: [],
    };

    let finished = false;

    const debugHistory: DebugHistory = [];

    while (!finished) {
      const k = spanningTree.getMaxNodeDegree();

      const debugHistoryPhase: (typeof debugHistory)[0] = {
        k,
        subphases: [],
      };

      let nodesOfDegreeK = spanningTree.getNodesOfDegree(k);
      let nodesOfDegreeKMinus1 = spanningTree.getNodesOfDegree(k - 1);

      const statsRecord: Stats["counts"][0] = {
        maxNodeDegree: k,
        localMoves: 0,
        localMovesOfNodeOfDegreeK: 0,
        localMovesOfNodeOfDegreeKMinus1: 0,
      };

      while (nodesOfDegreeK.length !== 0) {
        let nodesOfDegreeKAndKMinus1 = [
          ...nodesOfDegreeK,
          ...nodesOfDegreeKMinus1,
        ];

        labelledNodes = {};
        let { outerComponentEdges, F, components } =
          this.getOuterComponentEdges(
            graph,
            spanningTree,
            nodesOfDegreeKAndKMinus1
          );
        finished = outerComponentEdges.length === 0;
        if (finished) {
          break;
        }

        while (outerComponentEdges.length !== 0) {
          const outerComponentEdge = outerComponentEdges[0];

          const extendedSpanningTree = spanningTree.clone(false);
          extendedSpanningTree.addEdge(
            outerComponentEdge[0].nodeId,
            outerComponentEdge[1].nodeId
          );
          const cycle = this.getCycle(
            extendedSpanningTree,
            outerComponentEdge[0].nodeId
          );
          const cycleNodesOfDegreeK = cycle.filter((cycleNode) =>
            nodesOfDegreeK.some((node) => cycleNode.nodeId === node.nodeId)
          );
          const cycleNodesOfDegreeKMinus1 = cycle.filter((cycleNode) =>
            nodesOfDegreeKMinus1.some(
              (node) => cycleNode.nodeId === node.nodeId
            )
          );

          ////
          // Start of updating the history.
          ////
          const debugHistorySubphase: Partial<
            (typeof debugHistory)[0]["subphases"][0]
          > = {
            finished: false,
            nodeIdsInT: spanningTree.getFlatNodes().map((node) => node.nodeId),
            edgeIdsInT: spanningTree
              .getFlatEdges()
              .map((edge) => buildEdgeId(edge[0].nodeId, edge[1].nodeId)),
            nodesOfDegreeKLeft: nodesOfDegreeK.length,
            nodeIdsOfDegreeK: nodesOfDegreeK.map((node) => node.nodeId),
            nodeIdsOfDegreeKMinus1: nodesOfDegreeKMinus1.map(
              (node) => node.nodeId
            ),
            edgeIdsInF: F.map((edge) =>
              buildEdgeId(edge[0].nodeId, edge[1].nodeId)
            ) as EdgeId[],
            nodeIdsInC: components.map((component) =>
              component.nodes.map((node) => node.nodeId)
            ),
            edgeIdsInC: components.map((component) =>
              component.edges.map((edge) =>
                buildEdgeId(edge[0].nodeId, edge[1].nodeId)
              )
            ),
            outerComponentEdgeIds: outerComponentEdges.map((edge) =>
              buildEdgeId(edge[0].nodeId, edge[1].nodeId)
            ) as EdgeId[],
            labelledNodeIds: Object.keys(labelledNodes).map((key) =>
              Number(key)
            ),
            edgeIdForCyle: buildEdgeId(
              outerComponentEdge[0].nodeId,
              outerComponentEdge[1].nodeId
            ),
            nodeIdsInCycle: cycle.map((node) => node.nodeId),
            edgeIdsInCycle: cycle.map((node, i) =>
              buildEdgeId(node.nodeId, cycle[(i + 1) % cycle.length].nodeId)
            ),
          };
          ////
          // End of updating the history.
          ////

          if (cycleNodesOfDegreeK.length === 0) {
            for (const cycleNode of cycleNodesOfDegreeKMinus1) {
              labelledNodes[cycleNode.nodeId] = {
                neighbourNodeId: this.getRandomCycleNeighbourNode(
                  cycle,
                  cycleNode.nodeId
                ).nodeId,
                edge: [
                  outerComponentEdge[0].nodeId,
                  outerComponentEdge[1].nodeId,
                ],
              };
              const nodeIndexToRemove = nodesOfDegreeKMinus1.findIndex(
                (node) => cycleNode.nodeId === node.nodeId
              );
              if (nodeIndexToRemove < 0)
                throw new Error(
                  "Node of degree k-1 cannot be removed, because there was no matching node id."
                );
              nodesOfDegreeKMinus1.splice(nodeIndexToRemove, 1);
              nodesOfDegreeKAndKMinus1 = [
                ...nodesOfDegreeK,
                ...nodesOfDegreeKMinus1,
              ];
            }

            ////
            // Start of updating the history.
            ////
            debugHistorySubphase.nodeIdsOfDegreeKMinus1InCycle =
              cycleNodesOfDegreeKMinus1.map((node) => node.nodeId);
            debugHistorySubphase.containsMove = false;
            debugHistorySubphase.body = {
              updatedLabelledNodeIds: Object.keys(labelledNodes).map((key) =>
                Number(key)
              ),
              updatedNodesOfDegreeKMinus1: nodesOfDegreeKMinus1.map(
                (node) => node.nodeId
              ),
            };
            debugHistoryPhase.subphases.push(
              debugHistorySubphase as (typeof debugHistory)[0]["subphases"][0]
            );
            ////
            // End of updating the history.
            ////

            outerComponentEdges = this.getOuterComponentEdges(
              graph,
              spanningTree,
              nodesOfDegreeKAndKMinus1
            ).outerComponentEdges;
          } else {
            const nodeToReduce = cycleNodesOfDegreeK[0];

            const propagatedMoves: DebugHistoryMoveBody["propagatedMoves"] = [];

            const formerSpanningTree = spanningTree.clone(false);

            // Propagate local moves if necessary so nodes of degree k-1 are not accidentally of degree k after finishing the current subphase.
            const nodeIdsForPotentialPropagate = [
              outerComponentEdge[0].nodeId,
              outerComponentEdge[1].nodeId,
            ];
            while (nodeIdsForPotentialPropagate.length !== 0) {
              const nodeIdForPotentialPropagate =
                nodeIdsForPotentialPropagate.shift();
              if (!nodeIdForPotentialPropagate) break;
              const labelledNode = labelledNodes[nodeIdForPotentialPropagate];
              if (!labelledNode) continue;

              ////
              // Start of updating the history.
              ////
              propagatedMoves.push({
                labelledNodeId: nodeIdForPotentialPropagate,
                edgeIdToAdd: buildEdgeId(
                  labelledNode.edge[0],
                  labelledNode.edge[1]
                ),
                edgeIdToRemove: buildEdgeId(
                  nodeIdForPotentialPropagate,
                  labelledNode.neighbourNodeId
                ),
                updatedEdgeIdsInT: spanningTree
                  .getFlatEdges()
                  .map((edge) => buildEdgeId(edge[0].nodeId, edge[1].nodeId)),
                updatedLabelledNodeIds: Object.keys(labelledNodes).map((key) =>
                  Number(key)
                ),
              });
              ////
              // End of updating the history.
              ////

              spanningTree.addEdge(labelledNode.edge[0], labelledNode.edge[1]);

              spanningTree.removeEdge(
                nodeIdForPotentialPropagate,
                labelledNode.neighbourNodeId
              );

              delete labelledNodes[nodeIdForPotentialPropagate];
              nodeIdsForPotentialPropagate.push(
                labelledNode.edge[0],
                labelledNode.edge[1]
              );

              ////
              // Start of updating the history.
              ////
              propagatedMoves.push({
                labelledNodeId: nodeIdForPotentialPropagate,
                edgeIdToAdd: buildEdgeId(
                  labelledNode.edge[0],
                  labelledNode.edge[1]
                ),
                edgeIdToRemove: buildEdgeId(
                  nodeIdForPotentialPropagate,
                  labelledNode.neighbourNodeId
                ),
                updatedEdgeIdsInT: spanningTree
                  .getFlatEdges()
                  .map((edge) => buildEdgeId(edge[0].nodeId, edge[1].nodeId)),
                updatedLabelledNodeIds: Object.keys(labelledNodes).map((key) =>
                  Number(key)
                ),
              });
              ////
              // End of updating the history.
              ////
            }

            // Now really reduce the degree.
            spanningTree.addEdge(
              outerComponentEdge[0].nodeId,
              outerComponentEdge[1].nodeId
            );

            const neighbourNode = this.getRandomCycleNeighbourNode(
              cycle,
              nodeToReduce.nodeId
            );
            spanningTree.removeEdge(nodeToReduce.nodeId, neighbourNode.nodeId);

            // Update stats.
            statsRecord.localMovesOfNodeOfDegreeK++;
            statsRecord.localMovesOfNodeOfDegreeKMinus1 +=
              propagatedMoves.length / 2;

            ////
            // Start of updating the history.
            ////
            formerSpanningTree.addEdge(
              outerComponentEdge[0].nodeId,
              outerComponentEdge[1].nodeId
            );
            formerSpanningTree.removeEdge(
              nodeToReduce.nodeId,
              neighbourNode.nodeId
            );
            debugHistorySubphase.containsMove = true;
            debugHistorySubphase.body = {
              nodeIdToReduce: nodeToReduce.nodeId,
              move: {
                updatedEdgeIdsInT: formerSpanningTree
                  .getFlatEdges()
                  .map((edge) => buildEdgeId(edge[0].nodeId, edge[1].nodeId)),
              },
              propagatedMoves,
            };
            debugHistoryPhase.subphases.push(
              debugHistorySubphase as (typeof debugHistory)[0]["subphases"][0]
            );
            ////
            // End of updating the history.
            ////

            break;
          }
        }

        nodesOfDegreeK = spanningTree.getNodesOfDegree(k);
        nodesOfDegreeKMinus1 = spanningTree.getNodesOfDegree(k - 1);
      }

      debugHistory.push(debugHistoryPhase);

      statsRecord.localMoves =
        statsRecord.localMovesOfNodeOfDegreeK +
        statsRecord.localMovesOfNodeOfDegreeKMinus1;
      stats.counts.push(statsRecord);
    }

    stats.finalMaxNodeDegree = spanningTree.getMaxNodeDegree();

    debugHistory[debugHistory.length - 1].subphases.push({
      finished: true,
      nodeIdsInT: spanningTree.getFlatNodes().map((node) => node.nodeId),
      edgeIdsInT: spanningTree
        .getFlatEdges()
        .map((edge) => buildEdgeId(edge[0].nodeId, edge[1].nodeId)),
    } as any);

    return { stats, debugHistory };
  }

  /**
   * Returns a random neighbour node that lives in the same cycle as the provided one.
   * @param cycle The cycle of nodes.
   * @param nodeId The node id of the node whose random neighbour node should be returned.
   * @returns The random neighbour node.
   */
  private getRandomCycleNeighbourNode(cycle: Node<T>[], nodeId: NodeId) {
    const nodeIndex = cycle.findIndex((node) => node.nodeId === nodeId);
    if (nodeIndex < 0)
      throw new Error(
        "Random neighbour in cycle can't be retrieved, because the node that should be reduced doesn't exist."
      );
    return cycle[(nodeIndex + 1) % cycle.length];
  }

  /**
   * Returns an arbitrary spanning tree based on the provided graph.
   * The spanning tree is determined via BFS.
   * @param graph The graph.
   * @returns An arbitrary spanning tree.
   */
  private getArbitrarySpanningTree(graph: Graph<T>) {
    const visitedEdges = graph.breadthFirstSearch()[0].edges;
    const spanningTree = graph.clone(true);

    const edgesToAdd = visitedEdges.map(
      (edge) => [edge[0].nodeId, edge[1].nodeId] as [NodeId, NodeId]
    );
    spanningTree.addEdges(...edgesToAdd);

    return spanningTree;
  }

  /**
   * Returns a cycle in the given graph that contains the provided node.
   */
  public getCycle(spanningTree: Graph<T>, startNodeId: NodeId) {
    const startNode = spanningTree.getNodes()[startNodeId];
    if (!startNode)
      throw new Error(
        "Cycle cannoted be calculated, because start node doesn't exist."
      );

    const stack = [startNode];
    const visited = new Map<Node<T>, boolean>();
    visited.set(startNode, true);

    let cycleFound = false;
    while (!cycleFound) {
      let currentNode = stack[stack.length - 1];

      const adjacentNodes = spanningTree.getEdges().get(currentNode)!;
      let hasUnvisitedAdjacentNode = false;
      for (const adjacentNode of adjacentNodes) {
        if (adjacentNode.nodeId === startNodeId && stack.length > 2) {
          cycleFound = true;
          break;
        }
        if (!visited.has(adjacentNode)) {
          visited.set(adjacentNode, true);
          stack.push(adjacentNode);
          hasUnvisitedAdjacentNode = true;
          break;
        }
      }
      if (!hasUnvisitedAdjacentNode && !cycleFound) stack.pop();
    }

    return stack;
  }

  /**
   * Calculates the H, F and C for the given graph and spanning tree.
   */
  public getOuterComponentEdges(
    graph: Graph<T>,
    spanningTree: Graph<T>,
    nodesOfDegreeKAndKMinus1: Node<T>[]
  ) {
    const F = spanningTree.getAdjacentEdges(...nodesOfDegreeKAndKMinus1);
    const C = spanningTree.clone(false);
    C.removeEdges(
      ...F.map((edge) => [edge[0].nodeId, edge[1].nodeId] as [NodeId, NodeId])
    );
    const components = C.breadthFirstSearch();

    const interComponentEdges = graph
      .getFlatEdges()
      .filter((edge) =>
        components.some(({ nodes: nodes1 }) =>
          nodes1.some((node1) =>
            components.some(
              ({ nodes: nodes2 }) =>
                nodes1 !== nodes2 &&
                nodes2.some(
                  (node2) =>
                    equalId(edge[0].nodeId, node1.nodeId) &&
                    equalId(edge[1].nodeId, node2.nodeId)
                )
            )
          )
        )
      );

    const outerComponentEdges = interComponentEdges.filter(
      (interComponentEdge) =>
        !nodesOfDegreeKAndKMinus1.some(
          (node) =>
            interComponentEdge[0].nodeId === node.nodeId ||
            interComponentEdge[1].nodeId === node.nodeId
        )
    );

    return { outerComponentEdges, F, components };
  }
}
