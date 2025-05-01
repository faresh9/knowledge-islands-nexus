import { NextResponse } from 'next/server';
import axios from 'axios';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

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

    const results = response.data.query.search.map((item: any) => ({
      title: item.title,
      pageid: item.pageid,
      snippet: item.snippet.replace(/<\/?span[^>]*>/g, ''),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    return NextResponse.json(
      { error: 'Failed to search Wikipedia' },
      { status: 500 }
    );
  }
}