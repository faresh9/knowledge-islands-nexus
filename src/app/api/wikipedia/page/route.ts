import { NextResponse } from 'next/server';
import axios from 'axios';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const pageid = searchParams.get('pageid');

  if (!title && !pageid) {
    return NextResponse.json(
      { error: 'Either title or pageid parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Get page content and basic info
    const contentResponse = await axios.get(WIKIPEDIA_API_URL, {
      params: {
        action: 'query',
        prop: 'extracts|categories|links|pageimages|info',
        exintro: '1',
        inprop: 'url',
        titles: title || undefined,
        pageids: pageid || undefined,
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
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Format the response
    const pageInfo = {
      pageid: parseInt(pageId),
      title: page.title,
      extract: page.extract,
      categories: page.categories || [],
      links: page.links || [],
      thumbnail: page.thumbnail,
      url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
    };

    return NextResponse.json(pageInfo);
  } catch (error) {
    console.error(`Error getting Wikipedia page info:`, error);
    return NextResponse.json(
      { error: 'Failed to retrieve Wikipedia page information' },
      { status: 500 }
    );
  }
}