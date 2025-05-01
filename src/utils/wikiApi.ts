import axios from 'axios';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

interface WikipediaSearchResult {
  title: string;
  pageid: number;
  snippet: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

export interface WikipediaPage {
  pageid: number;
  title: string;
  extract: string;
  categories: { title: string }[];
  links: { title: string }[];
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  url: string;
}

/**
 * Search Wikipedia for a given query
 */
export async function searchWikipedia(query: string, limit: number = 10): Promise<WikipediaSearchResult[]> {
  try {
    const response = await axios.get(WIKIPEDIA_API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*',
        srlimit: limit,
        srprop: 'snippet',
      },
    });

    return response.data.query.search.map((item: any) => ({
      title: item.title,
      pageid: item.pageid,
      snippet: item.snippet.replace(/<\/?span[^>]*>/g, ''),
    }));
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    return [];
  }
}

/**
 * Get detailed information about a Wikipedia page
 */
export async function getWikipediaPageInfo(title: string): Promise<WikipediaPage | null> {
  try {
    // First, get the page content and basic info
    const contentResponse = await axios.get(WIKIPEDIA_API_URL, {
      params: {
        action: 'query',
        prop: 'extracts|categories|links|pageimages',
        exintro: '1',
        titles: title,
        format: 'json',
        origin: '*',
        pithumbsize: 300,
        pilimit: 1,
        cllimit: 20,
        pllimit: 20,
      },
    });

    const pages = contentResponse.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (pageId === '-1') {
      throw new Error('Page not found');
    }

    // Create the page URL
    const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

    return {
      pageid: parseInt(pageId),
      title: page.title,
      extract: page.extract,
      categories: page.categories || [],
      links: page.links || [],
      thumbnail: page.thumbnail,
      url: pageUrl,
    };
  } catch (error) {
    console.error(`Error getting Wikipedia page info for "${title}":`, error);
    return null;
  }
}

/**
 * Get related articles based on links from a given Wikipedia page
 */
export async function getRelatedPages(title: string, limit: number = 5): Promise<WikipediaPage[]> {
  try {
    const pageInfo = await getWikipediaPageInfo(title);
    if (!pageInfo || !pageInfo.links || pageInfo.links.length === 0) {
      return [];
    }

    // Use only the first 'limit' links
    const linksToFetch = pageInfo.links.slice(0, limit).map(link => link.title);
    
    // Fetch information for each linked page in parallel
    const relatedPagesPromises = linksToFetch.map(linkTitle => getWikipediaPageInfo(linkTitle));
    const relatedPages = await Promise.all(relatedPagesPromises);
    
    // Filter out null results
    return relatedPages.filter(page => page !== null) as WikipediaPage[];
  } catch (error) {
    console.error(`Error getting related pages for "${title}":`, error);
    return [];
  }
}

/**
 * Convert Wikipedia data to a graph structure for visualization
 */
export function wikiPagesToGraphData(
  mainPage: WikipediaPage, 
  relatedPages: WikipediaPage[]
): { nodes: any[], links: any[] } {
  const nodes = [
    {
      id: mainPage.pageid,
      title: mainPage.title,
      description: mainPage.extract.substring(0, 150) + '...',
      image: mainPage.thumbnail?.source,
      url: mainPage.url,
      group: 1, // Main node
      val: 20, // Size for visualization
    }
  ];

  const links: any[] = [];

  // Add related pages as nodes and create links
  relatedPages.forEach((page, index) => {
    if (!page) return;

    // Add the related page node
    nodes.push({
      id: page.pageid,
      title: page.title,
      description: page.extract ? (page.extract.substring(0, 150) + '...') : '',
      image: page.thumbnail?.source,
      url: page.url,
      group: 2, // Related node
      val: 10, // Size for visualization
    });

    // Add connection from main node to related node
    links.push({
      source: mainPage.pageid,
      target: page.pageid,
      value: Math.max(1, 5 - index), // Strength decreases with index
      type: 'related',
    });
  });

  return { nodes, links };
}