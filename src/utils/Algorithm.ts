import Graph, { NodeId } from "./Graph";
import { Node } from "./Graph";

export default class Algorithm<T> {
  public run(graph: Graph<T>) {
    if (graph.breadthFirstSearch().length !== 1)
      throw new Error(
        "Cannot run algorithm, because the graph is either empty or not fully connected."
      );

    const spanningTree = this.getArbitrarySpanningTree(graph);
    let labelledNodes: Record<NodeId, [NodeId, NodeId]> = {};

    const spanningTreeHistory = [spanningTree.clone(false)];
    let finished = false;

    while (!finished) {
      const k = spanningTree.getMaxNodeDegree();

      let nodesOfDegreeK = spanningTree.getNodesOfDegree(k);
      let nodesOfDegreeKMinus1 = spanningTree.getNodesOfDegree(k - 1);
      while (nodesOfDegreeK.length !== 0) {
        console.log("Removing node of degree " + k);
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
          console.log("Finished");
          break;
        }

        while (outerComponentEdges.length !== 0) {
          const outerComponentEdge = outerComponentEdges[0];
          console.log("Looking at outer component edge ", outerComponentEdge);

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
              labelledNodes[cycleNode.nodeId] = [
                outerComponentEdge[0].nodeId,
                outerComponentEdge[1].nodeId,
              ];
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
            if (labelledNodes[outerComponentEdge[0].nodeId]) {
            }
            if (labelledNodes[outerComponentEdge[1].nodeId]) {
            }
            spanningTree.addEdge(
              outerComponentEdge[0].nodeId,
              outerComponentEdge[1].nodeId
            );
            const neighbourNodeIndex =
              (cycle.findIndex((node) => node.nodeId === nodeToReduce.nodeId) +
                1) %
              cycle.length;
            // TODO(Trm): CHECK NODE INDEX
            spanningTree.removeEdge(
              nodeToReduce.nodeId,
              cycle[neighbourNodeIndex].nodeId
            );
            spanningTreeHistory.push(spanningTree.clone(false));
            break;
          }
        }

        nodesOfDegreeK = spanningTree.getNodesOfDegree(k);
        nodesOfDegreeKMinus1 = spanningTree.getNodesOfDegree(k - 1);
      }
    }

    return spanningTreeHistory;
  }

  public getArbitrarySpanningTree(graph: Graph<T>) {
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
