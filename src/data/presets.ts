import { ElementDefinition } from "cytoscape";
import padNumber from "../utils/padNumber";

export type Preset = "Germany" | "Star" | "Random";

export default function loadPreset(preset: Preset) {
  const cyNodes: ElementDefinition[] = [];
  const cyEdges: ElementDefinition[] = [];
  switch (preset) {
    case "Germany":
      loadGermanyPreset(cyNodes, cyEdges);
      break;
    case "Star":
      loadStarPreset(cyNodes, cyEdges);
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

function loadGermanyPreset(
  cyNodes: ElementDefinition[],
  cyEdges: ElementDefinition[]
) {
  cyNodes.push(
    buildCYNode(0, { x: 1077, y: -354 }, "Stralsund"),
    buildCYNode(1, { x: 1048, y: 113 }, "Potsdam"),
    buildCYNode(2, { x: 1111, y: 32 }, "Berlin"),
    buildCYNode(3, { x: 515, y: -72 }, "Bremen"),
    buildCYNode(4, { x: 471, y: 158 }, "Bielefeld"),
    buildCYNode(5, { x: 938, y: -295 }, "Rostock"),
    buildCYNode(6, { x: 327, y: 288 }, "Dortmund"),
    buildCYNode(7, { x: 585, y: 308 }, "Kassel"),
    buildCYNode(8, { x: 1167, y: 372 }, "Dresden"),
    buildCYNode(9, { x: 891, y: 159 }, "Madgeburg"),
    buildCYNode(10, { x: 234, y: 366 }, "Düsseldorf"),
    buildCYNode(11, { x: 688, y: -350 }, "Kiel"),
    buildCYNode(12, { x: 652, y: -175 }, "Hamburg"),
    buildCYNode(13, { x: 631, y: 93 }, "Hannover"),
    buildCYNode(14, { x: 764, y: -243 }, "Lübeck"),
    buildCYNode(15, { x: 238, y: 286 }, "Essen"),
    buildCYNode(16, { x: 968, y: 306 }, "Leipzig"),
    buildCYNode(17, { x: 565, y: 839 }, "Stuttgart"),
    buildCYNode(18, { x: 453, y: 808 }, "Karlsruhe"),
    buildCYNode(19, { x: 461, y: 697 }, "Mannheim"),
    buildCYNode(20, { x: 499, y: 571 }, "Frankfurt am Main"),
    buildCYNode(21, { x: 281, y: 432 }, "Köln"),
    buildCYNode(22, { x: 951, y: 790 }, "Regensburg"),
    buildCYNode(23, { x: 810, y: 706 }, "Nürnberg"),
    buildCYNode(24, { x: 607, y: -495 }, "Flensburg"),
    buildCYNode(25, { x: 884, y: 952 }, "München"),
    buildCYNode(26, { x: 392, y: 994 }, "Freiburg im Breisgau")
  );
}

function loadStarPreset(
  cyNodes: ElementDefinition[],
  cyEdges: ElementDefinition[]
) {
  let nodeId = 0;
  cyNodes.push(buildCYNode(nodeId++, { x: 200, y: 200 }));
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) continue;
      cyNodes.push(buildCYNode(nodeId++, { x: j * 200, y: i * 200 }));
    }
  }
  for (let i = 0; i < 4; i++) {
    cyNodes.push(
      buildCYNode(nodeId++, {
        x: Math.floor(i / 2) * 400,
        y: i % 2 === 0 ? -300 : 700,
      })
    );
  }
  for (let i = 0; i < 4; i++) {
    cyNodes.push(
      buildCYNode(nodeId++, {
        x: i % 2 === 0 ? -300 : 700,
        y: Math.floor(i / 2) * 400,
      })
    );
  }

  // Center.
  for (let i = 0; i < 8; i++) {
    cyEdges.push(buildCYEdge(0, i + 1));
  }
  // Top and bottom borders.
  for (let i = 0; i < 2; i++) {
    cyEdges.push(buildCYEdge(i + 1, i + 2), buildCYEdge(i + 6, i + 7));
  }
  cyEdges.push(
    // Left and right borders.
    buildCYEdge(1, 4),
    buildCYEdge(4, 6),
    buildCYEdge(3, 5),
    buildCYEdge(5, 8),
    // Top.
    buildCYEdge(1, 9),
    buildCYEdge(2, 9),
    buildCYEdge(2, 11),
    buildCYEdge(3, 11),
    // Right.
    buildCYEdge(3, 14),
    buildCYEdge(5, 14),
    buildCYEdge(5, 16),
    buildCYEdge(8, 16),
    // Bottom.
    buildCYEdge(8, 12),
    buildCYEdge(7, 12),
    buildCYEdge(7, 10),
    buildCYEdge(6, 10),
    // Left.
    buildCYEdge(6, 15),
    buildCYEdge(4, 15),
    buildCYEdge(4, 13),
    buildCYEdge(1, 13)
  );
}

function loadRandomPreset(
  cyNodes: ElementDefinition[],
  cyEdges: ElementDefinition[]
) {
  const nodeCount = 5 + Math.floor(Math.random() * 5);
  const edgeProbability = 0.25 + Math.random() * 0.25;

  for (let i = 0; i < nodeCount; i++) {
    cyNodes.push(
      buildCYNode(i, { x: Math.random() * 1000, y: Math.random() * 1000 })
    );
  }

  for (let i = 0; i < nodeCount; i++) {
    for (let j = 0; j < nodeCount; j++) {
      if (i < j && Math.random() < edgeProbability)
        cyEdges.push(buildCYEdge(i, j));
    }
  }
}

export function buildCYEdge(source: number, target: number): ElementDefinition {
  return {
    group: "edges",
    data: {
      id: `e${source}-${target}`,
      source: String(source),
      target: String(target),
      lineColor: "#ccc",
    },
  };
}

export function buildCYNode(
  id: number,
  position: { x: number; y: number },
  label?: string
): ElementDefinition {
  return {
    group: "nodes",
    data: {
      id: String(id),
      imageUrl: `${
        process.env.PUBLIC_URL
      }/assets/Isometric/house_type${padNumber(
        Math.floor(Math.random() * 21) + 1,
        2
      )}_NW.png`,
      label: label ?? "",
    },
    position,
  };
}
