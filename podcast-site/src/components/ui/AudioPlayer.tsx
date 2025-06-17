import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, SkipBack, SkipForward, X } from 'lucide-react';
import { PodcastEpisode } from '@/lib/types';
import { formatTimeSeconds, getAudioProxyUrl } from '@/lib/utils';

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
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Define functions with useCallback to prevent re-renders in keyboard shortcuts
  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsLoading(false);
    }
  }, [isPlaying]);

  const skipTime = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration, currentTime]);

  const changePlaybackRate = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = nextRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !episode) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      console.error('Audio loading error');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    // Load the audio source
    const audioUrl = getAudioProxyUrl(episode.audioUrl);
    audio.src = audioUrl;
    audio.volume = volume;
    audio.playbackRate = playbackRate;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [episode, volume, playbackRate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when the player is open and not typing in an input
      if (!episode || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'KeyR':
          e.preventDefault();
          changePlaybackRate();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [episode, togglePlayPause, skipTime, changePlaybackRate, onClose]);

  // Update audio volume when volume state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
  };

  if (!episode) return null;

  const displayImage = episode.image || '/podcast-placeholder.svg';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <audio ref={audioRef} preload="metadata" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Episode Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1 md:flex-none md:w-80">
            <div className="flex-shrink-0">
              <Image
                src={displayImage}
                alt={episode.title}
                width={64}
                height={64}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                {episode.title}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">
                {episode.subtitle || 'Episode'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => skipTime(-30)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Skip back 30 seconds"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" fill="white" />
              ) : (
                <Play className="w-5 h-5" fill="white" />
              )}
            </button>
            
            <button
              onClick={() => skipTime(30)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Skip forward 30 seconds"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="hidden md:flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-xs text-gray-500 tabular-nums">
              {formatTimeSeconds(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100 || 0}%, #e5e7eb ${(currentTime / duration) * 100 || 0}%, #e5e7eb 100%)`
              }}
            />
            <span className="text-xs text-gray-500 tabular-nums">
              {formatTimeSeconds(duration)}
            </span>
          </div>

          {/* Volume and Speed Controls */}
          <div className="hidden lg:flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={changePlaybackRate}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              {playbackRate}x
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden mt-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 tabular-nums">
              {formatTimeSeconds(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100 || 0}%, #e5e7eb ${(currentTime / duration) * 100 || 0}%, #e5e7eb 100%)`
              }}
            />
            <span className="text-xs text-gray-500 tabular-nums">
              {formatTimeSeconds(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
