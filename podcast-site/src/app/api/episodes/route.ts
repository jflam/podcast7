import { NextResponse } from 'next/server';
import { fetchAndParseRSS } from '@/lib/rss-parser';
import { cache } from '@/lib/cache';

export async function GET() {
  try {
    // Check cache first
    let podcastData = cache.get('podcast-data');
    
    if (!podcastData) {
      console.log('Cache miss - fetching fresh RSS data');
      podcastData = await fetchAndParseRSS();
      cache.set('podcast-data', podcastData, 60); // 1 hour TTL
    } else {
      console.log('Cache hit - returning cached RSS data');
    }

    return NextResponse.json(podcastData);
  } catch (error) {
    console.error('Failed to fetch episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}
