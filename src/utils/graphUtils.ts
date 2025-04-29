
import * as d3 from 'd3';
import { KnowledgeGraphData, TopicNode, TopicLink } from '../data/sampleData';

// Generate a color scale for categories
export const getCategoryColorScale = (data: KnowledgeGraphData) => {
  const categories = Array.from(new Set(data.nodes.map(node => node.category)));
  return d3.scaleOrdinal<string>()
    .domain(categories)
    .range(d3.schemeTableau10);
};

// Get a node by ID
export const getNodeById = (data: KnowledgeGraphData, id: string): TopicNode | undefined => {
  return data.nodes.find(node => node.id === id);
};

// Get all links connected to a node
export const getConnectedLinks = (data: KnowledgeGraphData, nodeId: string): TopicLink[] => {
  return data.links.filter(link => link.source === nodeId || link.target === nodeId);
};

// Get all nodes connected to a node
export const getConnectedNodes = (data: KnowledgeGraphData, nodeId: string): TopicNode[] => {
  const connectedLinks = getConnectedLinks(data, nodeId);
  const connectedNodeIds = new Set<string>();
  
  connectedLinks.forEach(link => {
    if (typeof link.source === 'object') {
      if (link.source.id === nodeId) {
        connectedNodeIds.add(typeof link.target === 'object' ? link.target.id : link.target);
      }
    } else if (link.source === nodeId) {
      connectedNodeIds.add(typeof link.target === 'object' ? link.target.id : link.target);
    }
    
    if (typeof link.target === 'object') {
      if (link.target.id === nodeId) {
        connectedNodeIds.add(typeof link.source === 'object' ? link.source.id : link.source);
      }
    } else if (link.target === nodeId) {
      connectedNodeIds.add(typeof link.source === 'object' ? link.source.id : link.source);
    }
  });
  
  return data.nodes.filter(node => connectedNodeIds.has(node.id));
};

// Generate a force simulation for the graph
export const createForceSimulation = (data: KnowledgeGraphData) => {
  // Create a copy of the nodes array to avoid mutating the original data
  const nodes = [...data.nodes];
  
  // Create a map for faster node lookups
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  // Prepare links with actual node references - properly typed for D3
  const links = data.links.map(link => {
    const source = nodeMap.get(typeof link.source === 'string' ? link.source : link.source.id) || link.source;
    const target = nodeMap.get(typeof link.target === 'string' ? link.target : link.target.id) || link.target;
    
    return {
      ...link,
      source,
      target,
    };
  });

  return d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(link => 200 - (link as any).strength * 50))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(0, 0))
    .force('collision', d3.forceCollide().radius((d: any) => Math.sqrt(d.size) * 2.5));
};

// Generate island path for a node
export const generateIslandPath = (size: number): string => {
  const radius = Math.sqrt(size) * 1.5;
  
  // Create a random island shape using SVG path
  const points = 12; // Number of points around the circle
  const noise = 0.4; // How much variation from perfect circle
  
  let path = '';
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const jitter = 1 - Math.random() * noise;
    const x = Math.cos(angle) * radius * jitter;
    const y = Math.sin(angle) * radius * jitter;
    
    if (i === 0) {
      path += `M${x},${y}`;
    } else {
      path += ` L${x},${y}`;
    }
  }
  
  return path + ' Z'; // Close the path
};

// Calculate the zoom level needed to fit all nodes
export const calculateZoomToFit = (
  nodePositions: { x: number, y: number }[],
  width: number,
  height: number,
  padding = 40
) => {
  if (nodePositions.length === 0) return { scale: 1, x: 0, y: 0 };
  
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  // Find the bounds of all nodes
  nodePositions.forEach(pos => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
  });
  
  // Add padding
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;
  
  const dx = maxX - minX;
  const dy = maxY - minY;
  const scale = Math.min(width / dx, height / dy);
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  return {
    scale,
    x: width / 2 - centerX * scale,
    y: height / 2 - centerY * scale
  };
};
