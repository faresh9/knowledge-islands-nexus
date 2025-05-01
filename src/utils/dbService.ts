import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import slugify from 'slugify';
import { WikipediaPage } from './wikiApi';

// Initialize Prisma client with better error handling
let prisma: ReturnType<typeof initPrismaClient>;

function initPrismaClient() {
  try {
    return new PrismaClient().$extends(withAccelerate());
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    throw new Error("Database connection failed. Please check your configuration.");
  }
}

// Initialize prisma on first import
try {
  prisma = initPrismaClient();
} catch (error) {
  console.error("Prisma initialization error:", error);
  // You could implement a mock database for development if needed
}

export interface GraphData {
  nodes: any[];
  links: any[];
}

/**
 * Save a Wikipedia page as an Island in the database
 */
export async function saveIslandFromWikiPage(page: WikipediaPage) {
  const slug = slugify(page.title, { lower: true });
  
  try {
    // Create or update the island
    const island = await prisma.island.upsert({
      where: { slug },
      update: {
        title: page.title,
        description: page.extract,
        imageUrl: page.thumbnail?.source,
        wikiUrl: page.url,
        viewCount: { increment: 1 },
      },
      create: {
        title: page.title,
        description: page.extract,
        slug,
        imageUrl: page.thumbnail?.source,
        wikiUrl: page.url,
      },
    });

    return island;
  } catch (error) {
    console.error('Error saving island:', error);
    throw error;
  }
}

/**
 * Create a connection between two islands
 */
export async function createConnection(sourceSlug: string, targetSlug: string, label: string) {
  try {
    // Get islands by slug
    const sourceIsland = await prisma.island.findUnique({ where: { slug: sourceSlug } });
    const targetIsland = await prisma.island.findUnique({ where: { slug: targetSlug } });
    
    if (!sourceIsland || !targetIsland) {
      throw new Error('One or both islands not found');
    }

    // Create the connection
    const connection = await prisma.connection.create({
      data: {
        sourceId: sourceIsland.id,
        targetId: targetIsland.id,
        label,
      },
    });

    return connection;
  } catch (error) {
    console.error('Error creating connection:', error);
    throw error;
  }
}

/**
 * Get an island by slug
 */
export async function getIslandBySlug(slug: string) {
  try {
    const island = await prisma.island.findUnique({
      where: { slug },
      include: {
        asSourceConnections: {
          include: {
            target: true,
          },
        },
        asTargetConnections: {
          include: {
            source: true,
          },
        },
        tags: true,
      },
    });

    return island;
  } catch (error) {
    console.error(`Error fetching island with slug "${slug}":`, error);
    throw error;
  }
}

/**
 * Get all islands
 */
export async function getAllIslands() {
  try {
    const islands = await prisma.island.findMany({
      include: {
        tags: true,
      },
    });

    return islands;
  } catch (error) {
    console.error('Error fetching islands:', error);
    throw error;
  }
}

/**
 * Convert database data to graph data structure
 */
export function dbToGraphData(islands: any[], connections?: any[]): GraphData {
  // Map islands to nodes
  const nodes = islands.map(island => ({
    id: island.id,
    title: island.title,
    description: island.description ? island.description.substring(0, 150) + '...' : '',
    image: island.imageUrl,
    url: island.wikiUrl,
    slug: island.slug,
    group: island.tags?.length ? island.tags[0].id : 0,
    val: 10 + (island.popularity || 0) * 10, // Size based on popularity
    color: island.color,
  }));

  // Create a map of island id to array index for quick lookup
  const idToIndex = {};
  islands.forEach((island, index) => {
    idToIndex[island.id] = index;
  });

  // Process connections if provided, otherwise use the ones from islands
  const links = [];
  
  if (connections) {
    // Use provided connections
    connections.forEach(conn => {
      links.push({
        source: conn.sourceId,
        target: conn.targetId,
        value: conn.strength || 1,
        label: conn.label,
        bidirectional: conn.bidirectional,
      });
    });
  } else {
    // Extract connections from islands
    islands.forEach(island => {
      // Source connections
      if (island.asSourceConnections) {
        island.asSourceConnections.forEach(conn => {
          links.push({
            source: island.id,
            target: conn.target.id,
            value: conn.strength || 1,
            label: conn.label,
            bidirectional: conn.bidirectional,
          });
        });
      }
    });
  }

  return { nodes, links };
}

/**
 * Record a user interaction with an island
 */
export async function recordInteraction(interactionType: string, islandId?: string, connectionId?: string, userId?: string) {
  try {
    await prisma.userInteraction.create({
      data: {
        interactionType,
        islandId,
        connectionId,
        userId,
      },
    });
    
    // Update island popularity if it's a view
    if (interactionType === 'view' && islandId) {
      await prisma.island.update({
        where: { id: islandId },
        data: {
          viewCount: { increment: 1 },
          popularity: { increment: 0.1 }, // Simple popularity metric
        },
      });
    }
  } catch (error) {
    console.error('Error recording interaction:', error);
  }
}

/**
 * Search islands by title or description
 */
export async function searchIslands(query: string) {
  try {
    const islands = await prisma.island.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        tags: true,
      },
      take: 10,
    });

    // Log the search query
    await prisma.searchQuery.create({
      data: {
        query,
        resultsCount: islands.length,
      },
    });

    return islands;
  } catch (error) {
    console.error(`Error searching islands for "${query}":`, error);
    return [];
  }
}