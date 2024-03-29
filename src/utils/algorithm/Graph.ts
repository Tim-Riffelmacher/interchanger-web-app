export type NodeId = number;
export type EdgeId = `edge__${number}__${number}`;

/**
 * A node inside the graph.
 */
export class Node<T> {
  public readonly nodeId: NodeId;
  public readonly data: T;

  constructor(nodeId: NodeId, data: T) {
    this.nodeId = nodeId;
    this.data = data;
  }
}

/**
 * The graph for use inside the algorithm.
 */
export default class Graph<T> {
  private nodeIds: Record<NodeId, Node<T>> = {};
  private nodes: Map<Node<T>, Node<T>[]> = new Map();

  /**
   * Add nodes with certain data to the graph.
   */
  public addNodes(...nodes: { nodeId: NodeId; data: T }[]) {
    nodes.forEach((node) => this.addNode(node.nodeId, node.data));
  }

  /**
   * Add a single node with certain data to the graph.
   */
  public addNode(nodeId: NodeId, data: T): Node<T> {
    if (this.nodeIds[nodeId])
      throw new Error(
        "Node cannot be added, because there already exists one with same id."
      );

    const node = new Node(nodeId, data);
    this.nodeIds[nodeId] = node;
    this.nodes.set(node, []);
    return node;
  }

  /**
   * Remove a single node from the graph.
   */
  public removeNode(nodeId: NodeId): Node<T> | null {
    const nodeToRemove = this.nodeIds[nodeId];
    if (!nodeToRemove)
      throw new Error("Node cannot be removed, because it doesn't exist.");

    this.nodes.forEach((adjacentNodes, node) => {
      this.nodes.set(
        node,
        adjacentNodes.filter((adjacentNode) => nodeToRemove !== adjacentNode)
      );
    });
    delete this.nodeIds[nodeId];
    this.nodes.delete(nodeToRemove);

    return nodeToRemove;
  }

  /**
   * Add edges to the graph.
   */
  public addEdges(...edges: [NodeId, NodeId][]): void {
    edges.forEach((edge) => this.addEdge(edge[0], edge[1]));
  }

  /**
   * Add a single edge to the graph.
   */
  public addEdge(sourceId: NodeId, destinationId: NodeId): void {
    if (sourceId === destinationId)
      throw new Error(
        "Edge cannot be added, because source and destination node are the same."
      );
    const sourceNode = this.nodeIds[sourceId];
    const destinationNode = this.nodeIds[destinationId];
    if (!sourceNode || !destinationNode)
      throw new Error(
        "Edge cannot be added, because adjacent nodes don't exist."
      );
    if (
      this.nodes.get(sourceNode)!.some((node) => node.nodeId === destinationId)
    )
      throw new Error(
        "Edge cannot be added, because an edge connecting the same nodes already exists."
      );

    this.nodes.get(sourceNode)!.push(destinationNode);
    this.nodes.get(destinationNode)!.push(sourceNode);
  }

  /**
   * Remove edges from the graph.
   */
  public removeEdges(...edges: [NodeId, NodeId][]): void {
    edges.forEach((edge) => this.removeEdge(edge[0], edge[1]));
  }

  /**
   * Remove a single edge from the graph.
   */
  public removeEdge(sourceId: NodeId, destinationId: NodeId): void {
    const sourceNode = this.nodeIds[sourceId];
    const destinationNode = this.nodeIds[destinationId];
    if (!sourceNode || !destinationNode)
      throw new Error(
        "Edge cannot be removed, because adjacent nodes don't exist."
      );

    this.nodes.set(
      sourceNode,
      this.nodes
        .get(sourceNode)!
        .filter((adjacentNode) => destinationNode !== adjacentNode)
    );
    this.nodes.set(
      destinationNode,
      this.nodes
        .get(destinationNode)!
        .filter((adjacentNode) => sourceNode !== adjacentNode)
    );
  }

  /**
   * A helper function for bfs.
   */
  private breadthFirstSearchAux(
    node: Node<T>,
    visited: Map<Node<T>, boolean>,
    visitedComponent: {
      nodes: Node<T>[];
      edges: [Node<T>, Node<T>][];
    }
  ): void {
    const queue: Node<T>[] = [node];
    visited.set(node, true);

    while (queue.length !== 0) {
      let currentNode = queue.shift();
      if (!currentNode) continue;
      visitedComponent.nodes.push(currentNode);

      this.nodes.get(currentNode)!.forEach((adjacentNode) => {
        if (!visited.has(adjacentNode) && currentNode) {
          visited.set(adjacentNode, true);
          visitedComponent.edges.push([currentNode, adjacentNode]);
          queue.push(adjacentNode);
        }
      });
    }
  }

  /**
   * Executes a bfs on the graph and returns the visited components.
   */
  public breadthFirstSearch() {
    const visited: Map<Node<T>, boolean> = new Map();
    const visitedComponents: {
      nodes: Node<T>[];
      edges: [Node<T>, Node<T>][];
    }[] = [];
    this.nodes.forEach((adjacentNodes, node) => {
      if (!visited.has(node)) {
        const visitedComponent: {
          nodes: Node<T>[];
          edges: [Node<T>, Node<T>][];
        } = { nodes: [], edges: [] };
        this.breadthFirstSearchAux(node, visited, visitedComponent);
        visitedComponents.push(visitedComponent);
      }
    });
    return visitedComponents;
  }

  /**
   * Returns the max node degree of the graph.
   */
  public getMaxNodeDegree() {
    let maxNodeDegree = 0;
    this.nodes.forEach((adjacentNodes) => {
      maxNodeDegree = Math.max(maxNodeDegree, adjacentNodes.length);
    });
    return maxNodeDegree;
  }

  /**
   * Returns all nodes of a given degree.
   */
  public getNodesOfDegree(k: number) {
    return Array.from(this.nodes.entries())
      .filter(([node, adjacentNodes]) => adjacentNodes.length === k)
      .map(([node]) => node);
  }

  /**
   * Get all edges that are adjacent to the given list of nodes.
   */
  public getAdjacentEdges(...nodes: Node<T>[]) {
    const adjacentEdges: [Node<T>, Node<T>][] = [];
    this.nodes.forEach((adjacentNodes, node) =>
      adjacentNodes.forEach((adjacentNode) => {
        if (
          nodes.some((node) => adjacentNode.nodeId === node.nodeId) &&
          !adjacentEdges.some(
            (adjacentEdge) =>
              (adjacentEdge[0].nodeId === node.nodeId &&
                adjacentEdge[1].nodeId === adjacentNode.nodeId) ||
              (adjacentEdge[0].nodeId === adjacentNode.nodeId &&
                adjacentEdge[1].nodeId === node.nodeId)
          )
        )
          adjacentEdges.push([node, adjacentNode]);
      })
    );

    return adjacentEdges;
  }

  /**
   * Clones the whole graph mainly for reuse.
   */
  public clone(clearEdges: boolean) {
    const clonedGraph = new Graph<T>();
    clonedGraph.nodeIds = { ...this.nodeIds };
    clonedGraph.nodes = new Map(this.nodes);
    for (const [node, adjecentNodes] of Array.from(
      clonedGraph.nodes.entries()
    )) {
      if (clearEdges) clonedGraph.nodes.set(node, []);
      else clonedGraph.nodes.set(node, [...adjecentNodes]);
    }
    return clonedGraph;
  }

  /**
   * Get all nodes.
   */
  public getNodes() {
    return this.nodeIds;
  }

  /**
   * Get all nodes (flat).
   */
  public getFlatNodes() {
    return Object.values(this.nodeIds);
  }

  /**
   * Get all edges.
   */
  public getEdges() {
    return this.nodes;
  }

  /**
   * Get all edges (flat).
   */
  public getFlatEdges() {
    return Array.from(this.nodes)
      .flatMap(([node, adjecentNodes]) =>
        adjecentNodes.map(
          (adjacentNode) => [node, adjacentNode] as [Node<T>, Node<T>]
        )
      )
      .filter(
        ([sourceNode, destinationNode]) =>
          sourceNode.nodeId < destinationNode.nodeId
      );
  }

  /**
   * Check if the graph has a certain edge or not.
   */
  public hasEdge(sourceId: NodeId, destinationId: NodeId) {
    const sourceNode = this.nodeIds[sourceId];
    const destinationNode = this.nodeIds[destinationId];
    if (!sourceNode || !destinationNode)
      throw new Error("Cannot check for edge, because nodes don't exist.");

    return !!this.nodes
      .get(sourceNode)
      ?.some((node) => node.nodeId === destinationId);
  }
}
