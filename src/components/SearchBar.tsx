'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchWikipedia } from '@/utils/wikiApi';
import { searchIslands } from '@/utils/dbService';

interface SearchResult {
  id: string | number;
  title: string;
  description?: string;
  isWikipedia?: boolean;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setIsOpen(true);

    try {
      // Search local database first
      const dbResults = await searchIslands(query);
      
      // Then search Wikipedia
      const wikiResults = await searchWikipedia(query, 5);
      
      // Combine and format results
      const formattedResults: SearchResult[] = [
        ...dbResults.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description?.substring(0, 100) + '...',
          isWikipedia: false
        })),
        ...wikiResults.map(item => ({
          id: item.pageid,
          title: item.title,
          description: item.snippet,
          isWikipedia: true
        }))
      ];
      
      setResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.isWikipedia) {
      // Create a new island from Wikipedia result
      router.push(`/create?title=${encodeURIComponent(result.title)}`);
    } else {
      // Navigate to existing island
      router.push(`/island/${result.id}`);
    }
    
    // Clear results and close dropdown
    setResults([]);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex w-full">
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            className="block w-full p-3 ps-10 text-lg text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Explore knowledge islands..."
            required
          />
          <button
            type="submit"
            className="absolute end-2.5 bottom-2 top-2 bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1 text-white"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full bg-white rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto">
          <ul className="py-2">
            {results.map((result) => (
              <li 
                key={`${result.isWikipedia ? 'wiki' : 'db'}-${result.id}`}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start">
                  <div className="ml-2">
                    <h4 className="font-medium text-gray-900">{result.title}</h4>
                    <p className="text-sm text-gray-500">{result.description}</p>
                    {result.isWikipedia && (
                      <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Wikipedia
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}