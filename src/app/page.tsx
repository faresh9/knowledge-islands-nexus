'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import { wikiPagesToGraphData, getWikipediaPageInfo, getRelatedPages } from '@/utils/wikiApi';
import { GraphData } from '@/utils/dbService';
import Image from 'next/image';

export default function Home() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initial data loading - fetch sample data on first load
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        // Start with a featured topic like "Knowledge Graph" as our initial visualization
        const mainPage = await getWikipediaPageInfo("Knowledge Graph");
        
        if (!mainPage) {
          throw new Error("Failed to fetch initial Wikipedia data");
        }
        
        // Get related pages
        const relatedPages = await getRelatedPages(mainPage.title, 8);
        
        // Convert to graph data format
        const initialGraphData = wikiPagesToGraphData(mainPage, relatedPages);
        setGraphData(initialGraphData);
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load initial data. Please try searching for a topic.");
      } finally {
        setLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-b from-blue-600 to-indigo-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
              Knowledge Islands Nexus
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
              Explore islands of knowledge and discover how concepts are connected across the sea of information
            </p>
            
            {/* Search Component */}
            <div className="max-w-2xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>
      
      {/* Knowledge Graph Visualization */}
      <section className="flex-grow bg-slate-100 dark:bg-slate-900 p-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-[500px]">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-4 text-lg">Loading knowledge islands...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <p>Try searching for a topic above to explore knowledge islands.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4">Knowledge Graph Visualization</h2>
              <p className="mb-6 text-center max-w-2xl">
                This interactive visualization shows how concepts are connected. Click on nodes to explore relationships,
                hover to highlight connections, and zoom to see more details.
              </p>
              
              {/* Knowledge Graph Component */}
              <div className="w-full h-[600px] border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <KnowledgeGraph graphData={graphData} />
              </div>
              
              <p className="mt-4 text-sm opacity-70 text-center">
                Data sourced from Wikipedia. Nodes represent articles, and links show relationships between them.
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-950">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Explore Knowledge in a New Way</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-lg shadow">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Learning</h3>
              <p className="text-slate-600 dark:text-slate-300">
                See relationships between concepts visually, making it easier to understand complex topics and their connections.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-lg shadow">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Connections</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Uncover hidden relationships between different knowledge domains and find new paths for exploration.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-lg shadow">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Accelerate Learning</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Navigate through information more effectively by understanding how concepts build upon one another.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Knowledge Islands Nexus</h3>
            <p className="opacity-75">Mapping the archipelago of human knowledge</p>
          </div>
          
          <div className="flex gap-8">
            <div>
              <h4 className="font-semibold mb-3">Explore</h4>
              <ul className="space-y-2">
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:underline">Home</a></li>
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:underline">Features</a></li>
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:underline">About</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:underline">Docs</a></li>
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:underline">API</a></li>
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:underline">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto max-w-6xl mt-8 pt-6 border-t border-slate-700 text-center text-sm opacity-75">
          <p>© {new Date().getFullYear()} Knowledge Islands Nexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
