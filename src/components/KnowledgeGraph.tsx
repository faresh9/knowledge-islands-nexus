"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData } from '@/utils/dbService';
import { useRouter } from 'next/navigation';

// Dynamically import ForceGraphWrapper with no SSR
const ForceGraph2D = dynamic(
  () => import('./ForceGraphWrapper'),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center" style={{ height: '600px' }}>Loading graph visualization...</div>
  }
);

const ISLAND_COLORS = {
  1: '#ff7675', // Main node - coral
  2: '#74b9ff', // Related node - blue
  3: '#55efc4', // Science node - teal
  4: '#ffeaa7', // History node - yellow
  5: '#b8e994', // Geography node - green
  default: '#a29bfe' // Default - purple
};

interface KnowledgeGraphProps {
  graphData: GraphData;
  onNodeClick?: (node: any) => void;
  width?: number;
  height?: number;
}

export default function KnowledgeGraph({ 
  graphData, 
  onNodeClick,
  width = 800,
  height = 600
}: KnowledgeGraphProps) {
  const graphRef = useRef<any>();
  const router = useRouter();
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [centerNode, setCenterNode] = useState<any>(null);
  
  // Dynamic sizing based on window
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    // Handle window resize for responsive graph
    function handleResize() {
      const isLargeScreen = window.innerWidth > 1024;
      setDimensions({
        width: isLargeScreen ? window.innerWidth * 0.7 : window.innerWidth * 0.95,
        height: window.innerHeight * 0.65
      });
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Auto-center on graph data change
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      // Find the "main" node (usually group 1)
      const mainNode = graphData.nodes.find(node => node.group === 1) || graphData.nodes[0];
      if (mainNode) {
        setCenterNode(mainNode);
        
        // Add a delay to ensure the graph is ready
        setTimeout(() => {
          graphRef.current.centerAt(mainNode.x, mainNode.y, 1000);
          graphRef.current.zoom(1.5, 1000);
        }, 500);
      }
    }
  }, [graphData]);
  
  const handleNodeHover = (node: any) => {
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }
    
    // Find connected nodes and links
    const connectedNodes = new Set([node.id]);
    const connectedLinks = new Set();
    
    graphData.links.forEach(link => {
      if (link.source.id === node.id || link.target.id === node.id) {
        connectedLinks.add(link);
        connectedNodes.add(link.source.id === node.id ? link.target.id : link.source.id);
      }
    });
    
    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);
  };
  
  const handleNodeClick = (node: any) => {
    // If custom handler provided, use it
    if (onNodeClick) {
      onNodeClick(node);
      return;
    }
    
    // Default action: navigate to node details page
    if (node.slug) {
      router.push(`/island/${node.slug}`);
    }
  };
  
  const getNodeColor = (node: any) => {
    // Highlight node if in highlight set
    if (highlightNodes.size > 0 && !highlightNodes.has(node.id)) {
      return 'rgba(200, 200, 200, 0.5)'; // Faded color for non-highlighted nodes
    }
    
    // Main node (centerNode) gets a special color
    if (centerNode && node.id === centerNode.id) {
      return '#e84393'; // Vibrant pink for center node
    }
    
    // Use node's own color, group color, or default
    return node.color || ISLAND_COLORS[node.group] || ISLAND_COLORS.default;
  };
  
  return (
    <div className="knowledge-graph-container">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel="title"
        nodeRelSize={6}
        nodeVal={node => node.val || 5}
        nodeColor={getNodeColor}
        linkWidth={link => highlightLinks.has(link) ? 3 : 1}
        linkColor={link => highlightLinks.has(link) ? '#f39c12' : '#cccccc'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Draw node circle
          const label = node.title;
          const fontSize = 12 / globalScale;
          const nodeR = Math.sqrt(node.val || 5) * 4;
          
          // Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeR, 0, 2 * Math.PI);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();
          
          // Add image if available and node is large enough
          if (node.image && nodeR > 10) {
            try {
              const img = new Image();
              img.src = node.image;
              
              // Create circular clipping path for the image
              ctx.save();
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeR - 2, 0, 2 * Math.PI);
              ctx.clip();
              
              // Draw image centered on node
              const imgSize = nodeR * 2;
              ctx.drawImage(img, node.x - nodeR, node.y - nodeR, imgSize, imgSize);
              ctx.restore();
            } catch (e) {
              // Fallback if image fails
              ctx.fillStyle = getNodeColor(node);
              ctx.fill();
            }
          }
          
          // Draw node border
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeR, 0, 2 * Math.PI);
          ctx.strokeStyle = highlightNodes.has(node.id) ? '#f39c12' : '#ffffff';
          ctx.lineWidth = highlightNodes.has(node.id) ? 2 : 1;
          ctx.stroke();
          
          // Node label
          if (globalScale >= 0.6 || highlightNodes.has(node.id)) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            
            // Text background for better readability
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(
              node.x - textWidth / 2 - 2,
              node.y + nodeR + 2,
              textWidth + 4,
              fontSize + 2
            );
            
            // The actual text
            ctx.fillStyle = 'white';
            ctx.fillText(label, node.x, node.y + nodeR + fontSize / 2 + 2);
          }
        }}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400, 40)}
      />
    </div>
  );
}