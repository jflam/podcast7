import { XMLParser } from 'fast-xml-parser';
import { PodcastData, PodcastEpisode, PodcastChannel } from './types';

const RSS_FEED_URL = 'https://hanselminutes.com/subscribe';
const REDIRECT_PATTERN = /^https:\/\/r\.zen\.ai\/r\//;

function extractDirectAudioUrl(url: string): string {
  if (REDIRECT_PATTERN.test(url)) {
    return url.replace('https://r.zen.ai/r/', 'https://');
  }
  return url;
}

function extractGuid(guid: unknown): string {
  if (typeof guid === 'string') {
    return guid;
  }
  if (typeof guid === 'object' && guid !== null && '#text' in guid) {
    return String((guid as { '#text': string })['#text']);
  }
  return '';
}

function generateEpisodeId(title: string, pubDate: string): string {
  // Create a simple ID from title and date
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const dateSlug = new Date(pubDate).toISOString().split('T')[0];
  return `${dateSlug}-${titleSlug}`.substring(0, 100);
}

function parseEpisodes(items: unknown[]): PodcastEpisode[] {
  return items.map((item: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const episodeData = item as any;
    const guid = extractGuid(episodeData.guid);
    const audioUrl = extractDirectAudioUrl(episodeData.enclosure?.['@_url'] || '');
    const episodeId = guid || generateEpisodeId(episodeData.title || '', episodeData.pubDate || '');

    return {
      id: episodeId,
      title: episodeData.title || 'Untitled Episode',
      description: episodeData.description || '',
      pubDate: episodeData.pubDate || '',
      duration: episodeData['itunes:duration'] || '00:00:00',
      audioUrl: audioUrl,
      image: episodeData['itunes:image']?.['@_href'],
      episodeNumber: episodeData['itunes:episode'] ? parseInt(episodeData['itunes:episode'], 10) : undefined,
      season: episodeData['itunes:season'] ? parseInt(episodeData['itunes:season'], 10) : undefined,
      episodeType: (episodeData['itunes:episodeType'] as 'full' | 'trailer' | 'bonus') || 'full',
      subtitle: episodeData['itunes:subtitle'],
      summary: episodeData['itunes:summary'],
      showNotes: episodeData['content:encoded'] || episodeData.description,
    };
  });
}

export async function fetchAndParseRSS(): Promise<PodcastData> {
  try {
    console.log('Fetching RSS feed from:', RSS_FEED_URL);
    
    const response = await fetch(RSS_FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PodcastSite/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    });

    const result = parser.parse(xmlText);
    const rss = result.rss || result;
    const channel = rss.channel;

    if (!channel) {
      throw new Error('Invalid RSS feed: no channel found');
    }

    const podcastChannel: PodcastChannel = {
      title: channel.title || 'Unknown Podcast',
      description: channel.description || '',
      image: channel['itunes:image']?.['@_href'] || channel.image?.url || '',
      language: channel.language || 'en',
      link: channel.link || '',
      lastBuildDate: channel.lastBuildDate || '',
      copyright: channel.copyright || '',
      author: channel['itunes:author'] || channel.managingEditor || '',
    };

    const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);
    const episodes = parseEpisodes(items);

    console.log(`Parsed ${episodes.length} episodes from RSS feed`);

    return {
      channel: podcastChannel,
      episodes: episodes.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()),
    };
  } catch (error) {
    console.error('Error fetching and parsing RSS feed:', error);
    throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
