import { ElementDefinition } from "cytoscape";
import padNumber from "../utils/others/padNumber";
import { EdgeId, NodeId } from "../utils/algorithm/Graph";

export type Preset = "Germany" | "Star" | "Square" | "Random";

export default function loadPreset(preset: Preset) {
  const cyNodes: ElementDefinition[] = [];
  const cyEdges: ElementDefinition[] = [];
  switch (preset) {
    case "Germany":
      loadGermanyPreset(cyNodes);
      break;
    case "Star":
      loadStarPreset(cyNodes, cyEdges);
      break;
    case "Square":
      loadSquarePreset(cyNodes, cyEdges);
      break;
    case "Random":
      loadRandomPreset(cyNodes, cyEdges);
      break;
    default:
      throw new Error(
        "Cannot load preset with specified name, because it doesn't exist."
      );
  }
  return { cyNodes, cyEdges };
}

function loadGermanyPreset(cyNodes: ElementDefinition[]) {
  cyNodes.push(
    buildCyNode(0, { x: 1077, y: -354 }, "Stralsund"),
    buildCyNode(1, { x: 1048, y: 113 }, "Potsdam"),
    buildCyNode(2, { x: 1111, y: 32 }, "Berlin"),
    buildCyNode(3, { x: 515, y: -72 }, "Bremen"),
    buildCyNode(4, { x: 471, y: 158 }, "Bielefeld"),
    buildCyNode(5, { x: 938, y: -295 }, "Rostock"),
    buildCyNode(6, { x: 327, y: 288 }, "Dortmund"),
    buildCyNode(7, { x: 585, y: 308 }, "Kassel"),
    buildCyNode(8, { x: 1167, y: 372 }, "Dresden"),
    buildCyNode(9, { x: 891, y: 159 }, "Madgeburg"),
    buildCyNode(10, { x: 234, y: 366 }, "Düsseldorf"),
    buildCyNode(11, { x: 688, y: -350 }, "Kiel"),
    buildCyNode(12, { x: 652, y: -175 }, "Hamburg"),
    buildCyNode(13, { x: 631, y: 93 }, "Hannover"),
    buildCyNode(14, { x: 764, y: -243 }, "Lübeck"),
    buildCyNode(15, { x: 238, y: 286 }, "Essen"),
    buildCyNode(16, { x: 968, y: 306 }, "Leipzig"),
    buildCyNode(17, { x: 565, y: 839 }, "Stuttgart"),
    buildCyNode(18, { x: 453, y: 808 }, "Karlsruhe"),
    buildCyNode(19, { x: 461, y: 697 }, "Mannheim"),
    buildCyNode(20, { x: 499, y: 571 }, "Frankfurt am Main"),
    buildCyNode(21, { x: 281, y: 432 }, "Köln"),
    buildCyNode(22, { x: 951, y: 790 }, "Regensburg"),
    buildCyNode(23, { x: 810, y: 706 }, "Nürnberg"),
    buildCyNode(24, { x: 607, y: -495 }, "Flensburg"),
    buildCyNode(25, { x: 884, y: 952 }, "München"),
    buildCyNode(26, { x: 392, y: 994 }, "Freiburg im Breisgau")
  );
}

function loadStarPreset(
  cyNodes: ElementDefinition[],
  cyEdges: ElementDefinition[]
) {
  let nodeId = 0;
  cyNodes.push(buildCyNode(nodeId++, { x: 200, y: 200 }));
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) continue;

      let offsetX = 0;
      let offsetY = 0;
      if (i === 1) {
        if (j === 0) offsetX = 50;
        else offsetX = -50;
      }
      if (j === 1) {
        if (i === 0) offsetY = 50;
        else offsetY = -50;
      }

      cyNodes.push(
        buildCyNode(nodeId++, { x: j * 200 + offsetX, y: i * 200 + offsetY })
      );
    }
  }
  for (let i = 0; i < 4; i++) {
    cyNodes.push(
      buildCyNode(nodeId++, {
        x: Math.floor(i / 2) * 400,
        y: i % 2 === 0 ? -325 : 725,
      })
    );
  }
  for (let i = 0; i < 4; i++) {
    cyNodes.push(
      buildCyNode(nodeId++, {
        x: i % 2 === 0 ? -325 : 725,
        y: Math.floor(i / 2) * 400,
      })
    );
  }

  // Center.
  for (let i = 0; i < 8; i++) {
    cyEdges.push(buildCyEdge(0, i + 1));
  }
  // Top and bottom borders.
  for (let i = 0; i < 2; i++) {
    cyEdges.push(buildCyEdge(i + 1, i + 2), buildCyEdge(i + 6, i + 7));
  }
  cyEdges.push(
    // Left and right borders.
    buildCyEdge(1, 4),
    buildCyEdge(4, 6),
    buildCyEdge(3, 5),
    buildCyEdge(5, 8),
    // Top.
    buildCyEdge(1, 9),
    buildCyEdge(2, 9),
    buildCyEdge(2, 11),
    buildCyEdge(3, 11),
    // Right.
    buildCyEdge(3, 14),
    buildCyEdge(5, 14),
    buildCyEdge(5, 16),
    buildCyEdge(8, 16),
    // Bottom.
    buildCyEdge(8, 12),
    buildCyEdge(7, 12),
    buildCyEdge(7, 10),
    buildCyEdge(6, 10),
    // Left.
    buildCyEdge(6, 15),
    buildCyEdge(4, 15),
    buildCyEdge(4, 13),
    buildCyEdge(1, 13)
  );
}

function loadSquarePreset(
  cyNodes: ElementDefinition[],
  cyEdges: ElementDefinition[]
) {
  cyNodes.push(
    buildCyNode(0, { x: 0, y: 0 }),
    buildCyNode(1, { x: 0, y: 200 }),
    buildCyNode(2, { x: 200, y: 0 }),
    buildCyNode(3, { x: 200, y: 200 })
  );

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i < j) cyEdges.push(buildCyEdge(i, j));
    }
  }
}

function loadRandomPreset(
  cyNodes: ElementDefinition[],
  cyEdges: ElementDefinition[]
) {
  const nodeCount = 8 + Math.floor(Math.random() * 8);
  const edgeProbability = 0.2 + Math.random() * 0.2;

  for (let i = 0; i < nodeCount; i++) {
    cyNodes.push(
      buildCyNode(i, { x: Math.random() * 1000, y: Math.random() * 1000 })
    );
  }

  for (let i = 0; i < nodeCount; i++) {
    for (let j = 0; j < nodeCount; j++) {
      if (i < j && Math.random() < edgeProbability)
        cyEdges.push(buildCyEdge(i, j));
    }
  }
}

export function buildEdgeId(source: number, target: number): EdgeId {
  if (source < target) {
    return `edge__${source}__${target}`;
  }
  return `edge__${target}__${source}`;
}

export function buildCyEdge(source: number, target: number): ElementDefinition {
  return {
    group: "edges",
    data: {
      id: buildEdgeId(source, target),
      source: String(source < target ? source : target),
      target: String(source < target ? target : source),
      lineColor: "#ccc",
      lineWidth: 5,
      lineStyle: "dashed",
      marked: false,
    },
  };
}

export function buildCyNode(
  id: number,
  position: { x: number; y: number },
  label = ""
): ElementDefinition {
  return {
    group: "nodes",
    selected: false,
    data: {
      id: String(id),
      imageUrl: `${
        process.env.PUBLIC_URL
      }/assets/Isometric/house_type${padNumber(
        Math.floor(Math.random() * 21) + 1,
        2
      )}_NW.png`,
      label,
      bgColor: "white",
      bgOpacity: 0,
      borderOpacity: 0,
    },
    position,
  };
}
