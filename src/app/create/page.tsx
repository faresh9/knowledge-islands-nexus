"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getWikipediaPageInfo, getRelatedPages, WikipediaPage } from '@/utils/wikiApi';
import { saveIslandFromWikiPage, createConnection } from '@/utils/dbService';
import Link from 'next/link';
import slugify from 'slugify';

export default function CreateIslandPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainPage, setMainPage] = useState<WikipediaPage | null>(null);
  const [relatedPages, setRelatedPages] = useState<WikipediaPage[]>([]);
  const [selectedRelated, setSelectedRelated] = useState<{[key: number]: boolean}>({});
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  
  useEffect(() => {
    if (!title) {
      setError("No title provided");
      setIsLoading(false);
      return;
    }
    
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Get main page info
        const pageInfo = await getWikipediaPageInfo(title);
        if (!pageInfo) {
          throw new Error(`Could not find Wikipedia page for "${title}"`);
        }
        setMainPage(pageInfo);
        
        // Get related pages
        const related = await getRelatedPages(title, 5);
        setRelatedPages(related);
        
        // Initialize all related pages as selected
        const initialSelected = related.reduce((acc, page) => {
          acc[page.pageid] = true;
          return acc;
        }, {} as {[key: number]: boolean});
        setSelectedRelated(initialSelected);
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [title]);
  
  const handleCreateIsland = async () => {
    if (!mainPage) return;
    
    try {
      setIsLoading(true);
      
      // Save main island
      const island = await saveIslandFromWikiPage(mainPage);
      const mainSlug = slugify(mainPage.title, { lower: true });
      setCreatedSlug(mainSlug);
      
      // Create connections with selected related pages
      for (const relatedPage of relatedPages) {
        if (selectedRelated[relatedPage.pageid]) {
          // First save the related page as an island
          await saveIslandFromWikiPage(relatedPage);
          const relatedSlug = slugify(relatedPage.title, { lower: true });
          
          // Then create a bidirectional connection
          await createConnection(mainSlug, relatedSlug, 'related');
        }
      }
      
      // Redirect to the newly created island
      router.push(`/island/${mainSlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create island");
      setIsLoading(false);
    }
  };
  
  const toggleRelatedSelection = (pageid: number) => {
    setSelectedRelated(prev => ({
      ...prev,
      [pageid]: !prev[pageid]
    }));
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading Wikipedia content...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">Return to home</Link>
        </div>
      </div>
    );
  }
  
  if (!mainPage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h1 className="text-2xl font-bold text-yellow-700 mb-4">Page Not Found</h1>
          <p className="text-yellow-600 mb-4">The Wikipedia page could not be found.</p>
          <Link href="/" className="text-blue-600 hover:underline">Return to home</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Knowledge Island</h1>
      
      <div className="bg-black p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {mainPage.thumbnail && (
            <div className="md:w-1/3">
              <img 
                src={mainPage.thumbnail.source} 
                alt={mainPage.title}
                className="w-full rounded-lg shadow-sm"
              />
            </div>
          )}
          <div className={mainPage.thumbnail ? "md:w-2/3" : "w-full"}>
            <h2 className="text-2xl font-bold mb-4">{mainPage.title}</h2>
            <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: mainPage.extract }} />
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <a href={mainPage.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View on Wikipedia
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {relatedPages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Related Knowledge Islands</h2>
          <p className="text-gray-600 mb-4">
            Select which related topics should be connected to this main island:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPages.map(page => (
              <div 
                key={page.pageid}
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  selectedRelated[page.pageid] ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => toggleRelatedSelection(page.pageid)}
              >
                <div className="flex items-start">
                  {page.thumbnail && (
                    <div className="w-16 h-16 mr-4 flex-shrink-0">
                      <img 
                        src={page.thumbnail.source} 
                        alt={page.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{page.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {page.extract.substring(0, 100).replace(/<\/?[^>]+(>|$)/g, "")}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-6 space-x-4">
        <Link 
          href="/"
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          onClick={handleCreateIsland}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Island'}
        </button>
      </div>
    </div>
  );
}