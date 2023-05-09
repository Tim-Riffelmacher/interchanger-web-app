import Graph, { NodeId } from "./Graph";
import { Node } from "./Graph";
import randomAlternating from "../others/randomAlternating";
import { Stats } from "../../components/modals/StatsModal";

type LabelledNode = Record<
  NodeId,
  { neighbourNodeId: NodeId; edge: [NodeId, NodeId] }
>;

export default class Algorithm<T> {
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

    const spanningTreeHistory: {
      k: number;
      phase: { move: Graph<T>; propagatedMoves: Graph<T>[] }[];
    }[] = [];
    let finished = false;

    while (!finished) {
      const k = spanningTree.getMaxNodeDegree();

      const spanningTreeHistoryPhase: (typeof spanningTreeHistory)[0] = {
        k,
        phase: [],
      };
      if (spanningTreeHistory.length === 0)
        spanningTreeHistoryPhase.phase.push({
          move: spanningTree.clone(false),
          propagatedMoves: [],
        });

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
        let outerComponentEdges = this.getOuterComponentEdges(
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
            outerComponentEdges = this.getOuterComponentEdges(
              graph,
              spanningTree,
              nodesOfDegreeKAndKMinus1
            );
          } else {
            const nodeToReduce = cycleNodesOfDegreeK[0];
            const propagatedMoves: Graph<T>[] = [];

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

              spanningTree.addEdge(labelledNode.edge[0], labelledNode.edge[1]);

              spanningTree.removeEdge(
                nodeIdForPotentialPropagate,
                labelledNode.neighbourNodeId
              );

              propagatedMoves.push(spanningTree.clone(false));
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

            // Update spanning tree history.
            spanningTreeHistoryPhase.phase.push({
              move: spanningTree.clone(false),
              propagatedMoves,
            });

            // Update stats.
            statsRecord.localMovesOfNodeOfDegreeK++;
            statsRecord.localMovesOfNodeOfDegreeKMinus1 +=
              propagatedMoves.length;

            break;
          }
        }

        nodesOfDegreeK = spanningTree.getNodesOfDegree(k);
        nodesOfDegreeKMinus1 = spanningTree.getNodesOfDegree(k - 1);
      }

      spanningTreeHistory.push(spanningTreeHistoryPhase);

      statsRecord.localMoves =
        statsRecord.localMovesOfNodeOfDegreeK +
        statsRecord.localMovesOfNodeOfDegreeKMinus1;
      stats.counts.push(statsRecord);
    }

    stats.finalMaxNodeDegree = spanningTree.getMaxNodeDegree();

    return { spanningTreeHistory, stats };
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
    return cycle[(nodeIndex + 1) % cycle.length]; // TODO(trm): Only for testing non random!
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

  public getComponents(C: Graph<T>) {
    const visitedComponents = C.breadthFirstSearch();
    const components = visitedComponents.map(
      (visitedComponent) => visitedComponent.nodes
    );
    return components;
  }

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

  public getOuterComponentEdges(
    graph: Graph<T>,
    spanningTree: Graph<T>,
    nodesOfDegreeKAndKMinus1: Node<T>[]
  ) {
    const F = spanningTree.getAdjacentEdges(...nodesOfDegreeKAndKMinus1); // TODO(trm): there could be doubled edges.
    const C = spanningTree.clone(false);
    C.removeEdges(
      ...F.map((edge) => [edge[0].nodeId, edge[1].nodeId] as [NodeId, NodeId])
    );

    const components = this.getComponents(C);
    const interComponentEdges = graph
      .getFlatEdges()
      .filter((edge) =>
        components.some((component1) =>
          component1.some((node1) =>
            components.some(
              (component2) =>
                component1 !== component2 &&
                component2.some(
                  (node2) =>
                    edge[0].nodeId === node1.nodeId &&
                    edge[1].nodeId === node2.nodeId
                )
            )
          )
        )
      ); // TODO(trm): Always source node id < dest node id to save storage.

    const outerComponentEdges = interComponentEdges.filter(
      (interComponentEdge) =>
        !nodesOfDegreeKAndKMinus1.some(
          (node) =>
            interComponentEdge[0].nodeId === node.nodeId ||
            interComponentEdge[1].nodeId === node.nodeId
        )
    );

    return outerComponentEdges;
  }
}