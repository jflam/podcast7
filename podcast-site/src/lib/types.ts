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
