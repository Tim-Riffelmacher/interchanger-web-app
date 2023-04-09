import { ElementDefinition } from "cytoscape";
import padNumber from "../utils/padNumber";

const NODE_COUNT = 5;

export const initialRFNodes: ElementDefinition[] = [];
for (let i = 0; i < NODE_COUNT; i++) {
  initialRFNodes.push({
    group: "nodes",
    data: {
      id: String(i),
      imageUrl: `${
        process.env.PUBLIC_URL
      }/assets/Isometric/house_type${padNumber(
        Math.floor(Math.random() * 21) + 1,
        2
      )}_NW.png`,
    },

    position: { x: Math.random() * 1000, y: Math.random() * 1000 },
  });
}

export const initialRFEdges: ElementDefinition[] = [];
for (let i = 0; i < NODE_COUNT; i++) {
  for (let j = 0; j < NODE_COUNT; j++) {
    if (i !== j && Math.random() < 0.0)
      initialRFEdges.push({
        group: "edges",
        style: { color: "red" },
        data: {
          id: `e${i}-${j}`,
          source: String(i),
          target: String(j),
          lineColor: "#ccc",
        },
      });
  }
}
