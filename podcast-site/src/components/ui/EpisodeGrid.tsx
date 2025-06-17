import { PodcastEpisode } from '@/lib/types';
import EpisodeCard from './EpisodeCard';

interface EpisodeGridProps {
  episodes: PodcastEpisode[];
  onPlayEpisode: (episode: PodcastEpisode) => void;
  channelImage?: string;
}

export default function EpisodeGrid({ episodes, onPlayEpisode, channelImage }: EpisodeGridProps) {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No episodes found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {episodes.map((episode) => (
        <EpisodeCard
          key={episode.id}
          episode={episode}
          onPlay={onPlayEpisode}
          channelImage={channelImage}
        />
      ))}
    </div>
  );
}
