'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getIslandBySlug, dbToGraphData, recordInteraction } from '@/utils/dbService';
import { getWikipediaPageInfo, getRelatedPages, wikiPagesToGraphData } from '@/utils/wikiApi';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import Link from 'next/link';
import Image from 'next/image';

interface Island {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  wikiUrl?: string;
  slug: string;
  asSourceConnections: any[];
  asTargetConnections: any[];
  tags: any[];
}

export default function IslandPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [island, setIsland] = useState<Island | null>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadIsland() {
      setLoading(true);
      try {
        // Try to get island from database
        let islandData = await getIslandBySlug(slug);
        
        if (islandData) {
          setIsland(islandData);
          
          // Record view interaction
          await recordInteraction('view', islandData.id);
          
          // Get connected islands for visualization
          const connections = [
            ...islandData.asSourceConnections,
            ...islandData.asTargetConnections
          ];
          
          // Create graph data from island and its connections
          const connectedIslands = new Set();
          connections.forEach(conn => {
            connectedIslands.add(conn.source);
            connectedIslands.add(conn.target);
          });
          
          setGraphData(dbToGraphData(Array.from(connectedIslands), connections));
        } else {
          // If no island found in DB, try to get from Wikipedia by slug
          const wikiPage = await getWikipediaPageInfo(slug.replace(/-/g, ' '));
          
          if (!wikiPage) {
            throw new Error(`Island "${slug}" not found`);
          }
          
          // Get related pages from Wikipedia
          const relatedPages = await getRelatedPages(wikiPage.title, 8);
          
          // Create temporary island from Wikipedia data
          setIsland({
            id: `wiki-${wikiPage.pageid}`,
            title: wikiPage.title,
            description: wikiPage.extract,
            imageUrl: wikiPage.thumbnail?.source,
            wikiUrl: wikiPage.url,
            slug: slug,
            asSourceConnections: [],
            asTargetConnections: [],
            tags: []
          });
          
          // Create graph data from Wikipedia data
          setGraphData(wikiPagesToGraphData(wikiPage, relatedPages));
        }
      } catch (err) {
        console.error(`Error loading island "${slug}":`, err);
        setError(`Failed to load island information for "${slug}"`);
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) {
      loadIsland();
    }
  }, [slug]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-xl">Loading knowledge island...</p>
      </div>
    );
  }
  
  if (error || !island) {
    return (
      <div className="container mx-auto max-w-4xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow my-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Error</h1>
        <p className="mb-4">{error || 'Island not found'}</p>
        <Link href="/" className="text-blue-600 hover:underline">
          ← Return to Knowledge Map
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      {/* Island Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {island.imageUrl && (
            <div className="w-32 h-32 relative overflow-hidden rounded-lg flex-shrink-0">
              <Image
                src={island.imageUrl}
                alt={island.title}
                fill
                sizes="(max-width: 768px) 100vw, 128px"
                className="object-cover"
              />
            </div>
          )}
          
          <div className="flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{island.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {island.tags?.map(tag => (
                <span 
                  key={tag.id} 
                  className="inline-block px-3 py-1 text-sm rounded-full"
                  style={{ 
                    backgroundColor: tag.color || '#2ecc71',
                    color: '#fff'
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
            
            {island.wikiUrl && (
              <a 
                href={island.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Wikipedia Source
              </a>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">About this Island</h2>
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: island.description }} />
        </div>
        
        {/* Right Column: Knowledge Graph */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Connected Knowledge</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            This visualization shows how this concept connects to other knowledge islands. 
            Click on a node to explore that island.
          </p>
          <div className="h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg">
            <KnowledgeGraph graphData={graphData} />
          </div>
        </div>
      </div>
      
      {/* Related Islands */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Related Knowledge Islands</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {graphData.nodes
            .filter(node => node.id !== (island?.id || ''))
            .slice(0, 6)
            .map(node => (
              <div key={node.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-1 truncate">{node.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {node.description}
                </p>
                <Link
                  href={`/island/${node.slug || node.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="mt-3 text-blue-600 hover:underline inline-flex items-center"
                >
                  Explore Island
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))
          }
        </div>
      </div>
      
      {/* Navigation back to home */}
      <div className="mt-8 text-center">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:underline">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Return to Knowledge Map
        </Link>
      </div>
    </div>
  );
}