# Podcast Site Implementation Plan

## Overview

This implementation plan creates a React/JavaScript frontend for the podcast site based on the PRD requirements and learnings from the postmortem analysis. The plan leverages proven technologies and addresses known issues from the previous implementation.

## Technology Stack

### Core Framework
- **Next.js 15**: React framework with SSR/SSG, API routes, and optimizations
- **React 18**: Component library with hooks and modern features
- **JavaScript/TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid development

### Data & State Management
- **SWR**: Data fetching library with caching and revalidation
- **fast-xml-parser**: RSS feed parsing
- **Server-side caching**: In-memory cache with TTL for RSS data

### Additional Libraries
- **Next.js Image**: Optimized image loading with lazy loading
- **Lucide React**: Icon library for UI elements
- **clsx**: Conditional CSS class utility

## Project Structure

```
podcast-site/
├── public/
│   ├── favicon.ico
│   ├── podcast-placeholder.png
│   └── icons/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── episode/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── episodes/
│   │       │   └── route.ts
│   │       └── audio/
│   │           └── [...path]/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── EpisodeCard.tsx
│   │   │   ├── EpisodeGrid.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── LoadingStates.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── rss-parser.ts
│   │   ├── cache.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── hooks/
│       ├── useEpisodes.ts
│       ├── useAudioPlayer.ts
│       └── useSearch.ts
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## Implementation Phases

### Phase 1: Project Setup & Core Infrastructure (Week 1)

#### 1.1 Project Scaffolding
```bash
# Create Next.js project with TypeScript and Tailwind
npx create-next-app@latest podcast-site --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional dependencies
npm install swr fast-xml-parser lucide-react clsx
npm install -D @types/node
```

#### 1.2 Configuration Files

**next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.simplecastcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.simplecast.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
```

**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

#### 1.3 TypeScript Definitions

**src/lib/types.ts**
```typescript
export interface PodcastChannel {
  title: string;
  description: string;
  image: string;
  language: string;
  link: string;
  lastBuildDate: string;
  copyright: string;
  author: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  audioUrl: string;
  image?: string;
  episodeNumber?: number;
  season?: number;
  episodeType: 'full' | 'trailer' | 'bonus';
  subtitle?: string;
  summary?: string;
  showNotes?: string;
}

export interface PodcastData {
  channel: PodcastChannel;
  episodes: PodcastEpisode[];
}
```

### Phase 2: RSS Feed Integration & API Routes (Week 1-2)

#### 2.1 RSS Parser Implementation

**Key Learnings from Postmortem:**
- Handle GUID type variations (string vs object with #text)
- Unwrap redirect URLs from `r.zen.ai/r/` format
- Implement proper error handling for malformed RSS data
- Cache parsed data server-side with TTL

**src/lib/rss-parser.ts**
```typescript
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

function extractGuid(guid: any): string {
  return typeof guid === 'string' ? guid : guid?.['#text'] || '';
}

export async function fetchAndParseRSS(): Promise<PodcastData> {
  // Implementation details...
}
```

#### 2.2 Server-side Caching

**src/lib/cache.ts**
```typescript
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }
}

export const cache = new SimpleCache();
```

#### 2.3 API Routes

**src/app/api/episodes/route.ts**
```typescript
import { NextResponse } from 'next/server';
import { fetchAndParseRSS } from '@/lib/rss-parser';
import { cache } from '@/lib/cache';

export async function GET() {
  try {
    // Check cache first
    let podcastData = cache.get('podcast-data');
    
    if (!podcastData) {
      podcastData = await fetchAndParseRSS();
      cache.set('podcast-data', podcastData, 60); // 1 hour TTL
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
```

**src/app/api/audio/[...path]/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const audioUrl = 'https://' + params.path.join('/');
  
  try {
    const response = await fetch(audioUrl);
    const headers = new Headers();
    
    // Copy relevant headers for audio streaming
    if (response.headers.get('content-type')) {
      headers.set('content-type', response.headers.get('content-type')!);
    }
    if (response.headers.get('content-length')) {
      headers.set('content-length', response.headers.get('content-length')!);
    }
    
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to proxy audio' },
      { status: 500 }
    );
  }
}
```

### Phase 3: Core UI Components (Week 2)

#### 3.1 Episode Card Component

**src/components/ui/EpisodeCard.tsx**
```typescript
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { PodcastEpisode } from '@/lib/types';

interface EpisodeCardProps {
  episode: PodcastEpisode;
  onPlay: (episode: PodcastEpisode) => void;
}

export default function EpisodeCard({ episode, onPlay }: EpisodeCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Episode Image */}
      <div className="relative aspect-square">
        <Image
          src={episode.image || '/podcast-placeholder.png'}
          alt={episode.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <button
          onClick={() => onPlay(episode)}
          className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <Play className="w-12 h-12 text-white" fill="white" />
        </button>
      </div>

      {/* Episode Details */}
      <div className="p-4">
        <Link href={`/episode/${episode.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary-600 line-clamp-2">
            {episode.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {episode.subtitle || episode.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatDate(episode.pubDate)}</span>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{episode.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 3.2 Audio Player Component

**src/components/ui/AudioPlayer.tsx**
```typescript
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { PodcastEpisode } from '@/lib/types';

interface AudioPlayerProps {
  episode: PodcastEpisode | null;
  onClose: () => void;
}

export default function AudioPlayer({ episode, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Component implementation...
  
  if (!episode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      {/* Player UI */}
    </div>
  );
}
```

#### 3.3 Episode Grid Component

**src/components/ui/EpisodeGrid.tsx**
```typescript
import { PodcastEpisode } from '@/lib/types';
import EpisodeCard from './EpisodeCard';

interface EpisodeGridProps {
  episodes: PodcastEpisode[];
  onPlayEpisode: (episode: PodcastEpisode) => void;
}

export default function EpisodeGrid({ episodes, onPlayEpisode }: EpisodeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {episodes.map((episode) => (
        <EpisodeCard
          key={episode.id}
          episode={episode}
          onPlay={onPlayEpisode}
        />
      ))}
    </div>
  );
}
```

### Phase 4: Main Pages & Layout (Week 2-3)

#### 4.1 Root Layout

**src/app/layout.tsx**
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hanselminutes Podcast',
  description: 'Fresh Air for Developers - Weekly talk show on tech',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

#### 4.2 Home Page

**src/app/page.tsx**
```typescript
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { PodcastData, PodcastEpisode } from '@/lib/types';
import EpisodeGrid from '@/components/ui/EpisodeGrid';
import AudioPlayer from '@/components/ui/AudioPlayer';
import SearchBar from '@/components/ui/SearchBar';
import LoadingStates from '@/components/ui/LoadingStates';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, error, isLoading } = useSWR<PodcastData>('/api/episodes', fetcher);

  const handlePlayEpisode = (episode: PodcastEpisode) => {
    setCurrentEpisode(episode);
  };

  const filteredEpisodes = data?.episodes.filter(episode =>
    episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    episode.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to Load Episodes</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Podcast Header */}
      {data?.channel && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{data.channel.title}</h1>
          <p className="text-gray-600 text-lg">{data.channel.description}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search episodes..."
        />
      </div>

      {/* Episodes Grid */}
      {isLoading ? (
        <LoadingStates.EpisodeGrid />
      ) : (
        <EpisodeGrid
          episodes={filteredEpisodes}
          onPlayEpisode={handlePlayEpisode}
        />
      )}

      {/* Audio Player */}
      <AudioPlayer
        episode={currentEpisode}
        onClose={() => setCurrentEpisode(null)}
      />
    </div>
  );
}
```

#### 4.3 Episode Detail Page

**src/app/episode/[id]/page.tsx**
```typescript
'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import { PodcastData, PodcastEpisode } from '@/lib/types';
import AudioPlayer from '@/components/ui/AudioPlayer';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EpisodePage({ params }: { params: { id: string } }) {
  const { data, error, isLoading } = useSWR<PodcastData>('/api/episodes', fetcher);
  
  const episode = data?.episodes.find(ep => ep.id === params.id);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!episode) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Episode Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <Image
                src={episode.image || '/podcast-placeholder.png'}
                alt={episode.title}
                width={400}
                height={400}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold mb-4">{episode.title}</h1>
              <p className="text-gray-600 mb-4">
                {new Date(episode.pubDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-lg text-gray-700 mb-6">
                {episode.subtitle || episode.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Show Notes */}
        {episode.showNotes && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Show Notes</h2>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: episode.showNotes }}
            />
          </div>
        )}
      </div>

      {/* Persistent Audio Player */}
      <AudioPlayer episode={episode} onClose={() => {}} />
    </div>
  );
}
```

### Phase 5: Advanced Features & Polish (Week 3-4)

#### 5.1 Search Functionality with Debouncing
- Implement search with debouncing
- Add search result highlighting
- Filter by date range and episode type

#### 5.2 Enhanced Audio Player
- Persistent player across navigation
- Playback position memory
- Keyboard shortcuts
- Speed adjustment controls

#### 5.3 Performance Optimizations
- Image optimization with Next.js Image
- Lazy loading for episode cards
- Bundle optimization
- Caching strategies

#### 5.4 Error Handling & Loading States
- Comprehensive error boundaries
- Skeleton loading screens
- Network error recovery
- Offline state handling

### Phase 6: Testing & Deployment (Week 4)

#### 6.1 Testing Setup
```bash
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

#### 6.2 Component Testing
- Unit tests for RSS parser
- Component testing for UI elements
- Integration tests for API routes

#### 6.3 Deployment Configuration
- Vercel deployment setup
- Environment variable configuration
- Performance monitoring setup

## Key Implementation Notes

### RSS Feed & URL Handling
Based on postmortem learnings:

1. **Redirect URL Pattern**: RSS feed contains URLs like `https://r.zen.ai/r/cdn.simplecast.com/...`
2. **URL Unwrapping**: Extract direct CDN URLs during RSS parsing, not in audio player
3. **CORS Handling**: Implement audio proxy API route for cross-origin audio files
4. **GUID Handling**: Support both string and object formats for episode GUIDs

### Image Configuration
```javascript
// next.config.js - Required for external images
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'image.simplecastcdn.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'cdn.simplecast.com',
      pathname: '/**',
    },
  ],
}
```

### Performance Considerations
- Server-side RSS caching (1-hour TTL)
- Client-side data caching with SWR
- Image optimization with lazy loading
- Audio proxy for CORS resolution

## Success Metrics

### Development Phase
- [ ] RSS feed successfully parsed and cached
- [ ] All episodes display with correct metadata
- [ ] Audio player functions across all browsers
- [ ] Search returns relevant results
- [ ] Site is fully responsive
- [ ] Error handling covers edge cases

### Performance Phase
- [ ] Page load time < 3 seconds on mobile
- [ ] Bundle size optimized
- [ ] Core Web Vitals in "Good" range
- [ ] RSS feed caching working properly

### Production Phase  
- [ ] Deployed successfully to production
- [ ] Analytics tracking implemented
- [ ] SEO optimization complete
- [ ] Accessibility compliance verified

## Risk Mitigation

### Technical Risks
1. **RSS Feed Changes**: Implement robust parsing with graceful degradation
2. **Audio CORS Issues**: Maintain audio proxy API route for cross-origin files
3. **Performance Degradation**: Monitor bundle size and implement code splitting
4. **Image Loading Failures**: Implement fallback images and error states

### Content Risks
1. **Feed Unavailability**: Implement caching and error recovery
2. **Malformed Data**: Add validation and sanitization
3. **Large Episode Lists**: Implement pagination or infinite scroll

## Next Steps

1. **Create Project**: Use Next.js create-next-app with recommended configuration
2. **Install Dependencies**: Add required packages for RSS parsing, data fetching, and UI
3. **Configure Environment**: Set up Next.js config for external images and API routes
4. **Implement Core Features**: Follow the phased approach outlined above
5. **Test & Deploy**: Comprehensive testing before production deployment

This implementation plan leverages proven technologies and addresses known issues from the postmortem analysis, ensuring a robust and performant podcast site.
