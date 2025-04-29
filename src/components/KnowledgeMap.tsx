
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { KnowledgeGraphData, TopicNode } from '../data/sampleData';
import { createForceSimulation, generateIslandPath, calculateZoomToFit } from '../utils/graphUtils';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface KnowledgeMapProps {
  data: KnowledgeGraphData;
  onSelectTopic: (topic: TopicNode | null) => void;
  selectedTopic: TopicNode | null;
}

const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ data, onSelectTopic, selectedTopic }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Initialize and update the D3 visualization
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0 || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = svg.select<SVGGElement>('g.container');

    // Clear previous elements
    container.selectAll('*').remove();

    // Create the simulation with stronger forces for larger visualization
    const simulation = createForceSimulation(data);
    simulationRef.current = simulation;
    
    // Strengthen forces for larger layout
    simulation
      .force('charge', d3.forceManyBody().strength(-1200)) // Stronger repulsion
      .force('link', d3.forceLink().id((d: any) => d.id).distance((link: any) => 300 - (link.strength || 0.5) * 70)) // Increased distance
      .force('collision', d3.forceCollide().radius((d: any) => Math.sqrt((d as any).size || 10) * 5)); // Larger collision radius

    // Define marker for arrows
    const defs = svg.append('defs');
    
    // Add glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
      
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '5')
      .attr('result', 'coloredBlur');
      
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    
    // Define arrow marker for links
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30) // Move the arrow away from the node
      .attr('refY', 0)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#38B6FF');

    // Create links group first so nodes appear on top
    const linksGroup = container.append('g')
      .attr('class', 'links');
    
    const links = linksGroup
      .selectAll('path')
      .data(data.links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('stroke', d => d.strength > 0.6 ? '#6C8EBF' : '#38B6FF')
      .attr('stroke-width', d => d.strength * 5) // Increased line thickness
      .attr('fill', 'none')
      .attr('opacity', 0.9) // Increased opacity for better visibility
      .attr('marker-end', 'url(#arrow)')
      .attr('stroke-dasharray', d => d.strength < 0.5 ? '5,5' : 'none'); // Add dashed lines for weak connections

    // Create nodes group
    const nodesGroup = container.append('g')
      .attr('class', 'nodes');
    
    // Create island nodes
    const nodes = nodesGroup
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'island')
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectTopic(d as TopicNode);
      });

    // Add island shape paths with larger sizes
    nodes.append('path')
      .attr('d', d => generateIslandPath(d.size * 3)) // Much larger size
      .attr('fill', d => d.color || '#4CAF50')
      .attr('stroke', '#0D47A1')
      .attr('stroke-width', 2)
      .attr('class', d => `island-shape ${d.id === selectedTopic?.id ? 'glow-effect' : ''}`)
      .attr('filter', d => d.id === selectedTopic?.id ? 'url(#glow)' : '');

    // Add island labels with larger font
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .attr('font-size', d => Math.max(16, Math.sqrt(d.size) * 2)) // Much larger font size
      .text(d => d.name);

    // Add small link description texts on hover
    links.on('mouseover', function(event, d) {
      if (d.description) {
        const [x, y] = d3.pointer(event, container.node());
        
        container.append('text')
          .attr('class', 'link-description')
          .attr('x', x)
          .attr('y', y - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('pointer-events', 'none')
          .text(d.description);
      }
    })
    .on('mouseout', function() {
      container.selectAll('.link-description').remove();
    });

    // Update the simulation on tick
    simulation.on('tick', () => {
      links.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curve factor
        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform.toString());
        setTransform(event.transform);
      });

    svg.call(zoom);

    // Center the visualization initially with a wider view
    if (data.nodes.length > 0) {
      setTimeout(() => {
        const nodePositions = data.nodes.map(node => ({ 
          x: (node as any).x || 0, 
          y: (node as any).y || 0 
        }));
        
        const fitTransform = calculateZoomToFit(
          nodePositions,
          dimensions.width,
          dimensions.height,
          120 // Increased padding for better visibility
        );
        
        svg.transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(fitTransform.x, fitTransform.y)
              .scale(fitTransform.scale * 0.7) // Apply larger initial zoom
          );
      }, 1500); // Give simulation more time to initially position nodes
    }

    // Stop simulation when component unmounts
    return () => {
      if (simulation) simulation.stop();
    };
  }, [data, dimensions, selectedTopic, onSelectTopic]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().duration(300).call(
      zoom.transform,
      transform.scale(1.2)
    );
  }, [transform]);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().duration(300).call(
      zoom.transform,
      transform.scale(0.8)
    );
  }, [transform]);

  const handleZoomReset = useCallback(() => {
    if (!svgRef.current || !data.nodes.length) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    
    const nodePositions = data.nodes.map(node => ({ 
      x: (node as any).x || 0, 
      y: (node as any).y || 0 
    }));
    
    const fitTransform = calculateZoomToFit(
      nodePositions,
      dimensions.width,
      dimensions.height
    );
    
    svg.transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(fitTransform.x, fitTransform.y)
          .scale(fitTransform.scale * 0.7)
      );
  }, [data.nodes, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <svg 
        ref={svgRef} 
        className="w-full h-full" 
        onClick={() => onSelectTopic(null)}
      >
        <g className="container"></g>
      </svg>
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        <Button 
          variant="secondary" 
          size="icon"
          onClick={handleZoomIn}
          className="rounded-full shadow-lg bg-secondary/50 backdrop-blur-sm"
        >
          <ZoomIn size={18} />
        </Button>
        <Button 
          variant="secondary" 
          size="icon"
          onClick={handleZoomOut}
          className="rounded-full shadow-lg bg-secondary/50 backdrop-blur-sm"
        >
          <ZoomOut size={18} />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={handleZoomReset}
          className="rounded-full shadow-lg bg-secondary/50 backdrop-blur-sm"
        >
          <Maximize2 size={18} />
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeMap;
