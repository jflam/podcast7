'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeft, Calendar, Clock, Play } from 'lucide-react';
import { PodcastData } from '@/lib/types';
import AudioPlayer from '@/components/ui/AudioPlayer';
import LoadingStates from '@/components/ui/LoadingStates';
import { formatDate, formatDuration } from '@/lib/utils';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EpisodePage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { data, error, isLoading } = useSWR<PodcastData>('/api/episodes', fetcher);
  
  const episode = data?.episodes.find(ep => ep.id === params.id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingStates.EpisodeCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to Load Episode</h2>
          <p className="text-gray-600 mb-4">There was an error loading this episode.</p>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Episodes
          </Link>
        </div>
      </div>
    );
  }

  if (!episode) {
    notFound();
  }

  const displayImage = episode.image || data?.channel.image || '/podcast-placeholder.svg';

  const handlePlayEpisode = () => {
    setIsPlaying(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Episodes
          </Link>
        </div>

        {/* Episode Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="relative group">
                <Image
                  src={displayImage}
                  alt={episode.title}
                  width={400}
                  height={400}
                  className="w-full rounded-lg shadow-lg"
                  priority
                />
                {!isPlaying && (
                  <button
                    onClick={handlePlayEpisode}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                    aria-label={`Play episode: ${episode.title}`}
                  >
                    <Play className="w-16 h-16 text-white" fill="white" />
                  </button>
                )}
              </div>
            </div>
            <div className="lg:w-2/3">
              <div className="mb-4">
                {data?.channel && (
                  <Link 
                    href="/" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {data.channel.title}
                  </Link>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 leading-tight">
                {episode.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(episode.pubDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatDuration(episode.duration)}</span>
                </div>
                {episode.episodeNumber && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                    Episode {episode.episodeNumber}
                  </span>
                )}
              </div>

              {episode.subtitle && (
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  {episode.subtitle}
                </p>
              )}

              {episode.summary && episode.summary !== episode.subtitle && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {episode.summary}
                </p>
              )}

              {!isPlaying && (
                <button
                  onClick={handlePlayEpisode}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-5 h-5 mr-2" fill="white" />
                  Play Episode
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Show Notes */}
        {episode.showNotes && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Show Notes</h2>
            <div 
              className="prose prose-lg max-w-none prose-blue prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700"
              dangerouslySetInnerHTML={{ __html: episode.showNotes }}
            />
          </div>
        )}

        {/* Episode Navigation */}
        {data?.episodes && (
          <div className="border-t pt-8">
            <h3 className="text-xl font-bold mb-4 text-gray-900">More Episodes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.episodes
                .filter(ep => ep.id !== episode.id)
                .slice(0, 4)
                .map(ep => (
                  <Link
                    key={ep.id}
                    href={`/episode/${ep.id}`}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Image
                      src={ep.image || data.channel.image || '/podcast-placeholder.svg'}
                      alt={ep.title}
                      width={48}
                      height={48}
                      className="rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                        {ep.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(ep.pubDate)}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {isPlaying && (
        <AudioPlayer
          episode={episode}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}
