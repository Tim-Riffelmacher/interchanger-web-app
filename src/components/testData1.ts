import { ElementDefinition } from "cytoscape";

export const initialRFNodes: ElementDefinition[] = [
  {
    group: "nodes",
    data: {
      id: "3",
      imageUrl: `${process.env.PUBLIC_URL}/assets/Isometric/house_type15_NW.png`,
    },
    position: { x: 200, y: 300 },
  },
  {
    group: "nodes",
    data: {
      id: "0",
      imageUrl: `${process.env.PUBLIC_URL}/assets/Isometric/house_type15_NW.png`,
    },
    position: { x: 200, y: 100 },
  },
  {
    group: "nodes",
    data: {
      id: "1",
      imageUrl: `${process.env.PUBLIC_URL}/assets/Isometric/house_type15_NW.png`,
    },
    position: { x: 100, y: 200 },
  },
  {
    group: "nodes",
    data: {
      id: "2",
      imageUrl: `${process.env.PUBLIC_URL}/assets/Isometric/house_type15_NW.png`,
    },
    position: { x: 300, y: 200 },
  },
  {
    group: "nodes",
    data: {
      id: "4",
      imageUrl: `${process.env.PUBLIC_URL}/assets/Isometric/house_type15_NW.png`,
    },
    position: { x: 100, y: 400 },
  },
  {
    group: "nodes",
    data: {
      id: "5",
      imageUrl: `${process.env.PUBLIC_URL}/assets/Isometric/house_type15_NW.png`,
    },
    position: { x: 300, y: 400 },
  },
  {
    group: "nodes",
    data: {
      id: "6",
      imageUrl: `${process.env.PUBLIC_URL}/assets/Isometric/house_type15_NW.png`,
    },
    position: { x: 600, y: 200 },
  },
  {
    group: "nodes",
    data: {
      id: "7",
      imageUrl: `${process.env.PUBLIC_URL}/assets/Isometric/house_type15_NW.png`,
    },
    position: { x: 500, y: 300 },
  },
  {
    group: "nodes",
    data: {
      id: "8",
      imageUrl: `${process.env.PUBLIC_URL}/assets/Isometric/house_type15_NW.png`,
    },
    position: { x: 600, y: 400 },
  },
];

export const initialRFEdges: ElementDefinition[] = [
  {
    group: "edges",
    data: { id: `e${0}-${1}`, source: "0", target: "1" },
  },
  {
    group: "edges",
    data: { id: `e${0}-${2}`, source: "0", target: "2" },
  },
  {
    group: "edges",
    data: { id: `e${2}-${1}`, source: "2", target: "1" },
  },
  {
    group: "edges",
    data: { id: `e${3}-${1}`, source: "3", target: "1" },
  },
  {
    group: "edges",
    data: { id: `e${2}-${3}`, source: "2", target: "3" },
  },
  {
    group: "edges",
    data: { id: `e${3}-${4}`, source: "3", target: "4" },
  },
  {
    group: "edges",
    data: { id: `e${5}-${2}`, source: "5", target: "2" },
  },
  {
    group: "edges",
    data: { id: `e${5}-${7}`, source: "5", target: "7" },
  },
  {
    group: "edges",
    data: { id: `e${6}-${7}`, source: "6", target: "7" },
  },
  {
    group: "edges",
    data: { id: `e${7}-${8}`, source: "7", target: "8" },
  },
  {
    group: "edges",
    data: { id: `e${3}-${5}`, source: "3", target: "5" },
  },
];
