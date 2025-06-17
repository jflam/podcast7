import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { PodcastEpisode } from '@/lib/types';
import { formatDate, formatDuration } from '@/lib/utils';

interface EpisodeCardProps {
  episode: PodcastEpisode;
  onPlay: (episode: PodcastEpisode) => void;
  channelImage?: string;
}

export default function EpisodeCard({ episode, onPlay, channelImage }: EpisodeCardProps) {
  const displayImage = episode.image || channelImage || '/podcast-placeholder.png';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Episode Image */}
      <div className="relative aspect-square">
        <Image
          src={displayImage}
          alt={episode.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <button
          onClick={() => onPlay(episode)}
          className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center group"
          aria-label={`Play episode: ${episode.title}`}
        >
          <Play className="w-12 h-12 text-white group-hover:scale-110 transition-transform" fill="white" />
        </button>
      </div>

      {/* Episode Details */}
      <div className="p-4">
        <Link href={`/episode/${episode.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 line-clamp-2 transition-colors">
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
            <span>{formatDuration(episode.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
