'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { PodcastData, PodcastEpisode } from '@/lib/types';
import EpisodeGrid from '@/components/ui/EpisodeGrid';
import AudioPlayer from '@/components/ui/AudioPlayer';
import SearchBar from '@/components/ui/SearchBar';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { EpisodeGridSkeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';
import { RefreshCw, AlertCircle } from 'lucide-react';

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
    episode.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (episode.subtitle && episode.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to Load Episodes</h2>
          <p className="text-gray-600 mb-4">
            {error.message || 'There was an error loading the podcast episodes.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 pb-32">
        {/* Podcast Header */}
        {data?.channel && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {data.channel.image && (
                <div className="flex-shrink-0">
                  <Image
                    src={data.channel.image}
                    alt={data.channel.title}
                    width={120}
                    height={120}
                    className="rounded-xl shadow-lg"
                    priority
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 text-gray-900">
                  {data.channel.title}
                </h1>
                <p className="text-gray-600 text-lg mb-4">
                  {data.channel.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>By {data.channel.author}</span>
                  <span>•</span>
                  <span>{data.episodes.length} episodes</span>
                  <span>•</span>
                  <span>{data.channel.language.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search episodes..."
          />
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Found {filteredEpisodes.length} episode{filteredEpisodes.length === 1 ? '' : 's'}
            </p>
          )}
        </div>

        {/* Episodes Grid */}
        {isLoading ? (
          <EpisodeGridSkeleton count={6} />
        ) : filteredEpisodes.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No episodes found</p>
            <p className="text-gray-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <EpisodeGrid
            episodes={filteredEpisodes}
            onPlayEpisode={handlePlayEpisode}
            channelImage={data?.channel.image}
          />
        )}

        {/* Audio Player */}
        <AudioPlayer
          episode={currentEpisode}
          onClose={() => setCurrentEpisode(null)}
        />
      </div>
    </ErrorBoundary>
  );
}
