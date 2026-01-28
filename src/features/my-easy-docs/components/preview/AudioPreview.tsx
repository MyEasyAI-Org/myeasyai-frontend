// =============================================
// MyEasyDocs - AudioPreview Component
// =============================================
// Preview component for audio files using HTML5 audio.
// Supports: mp3, wav, ogg, webm
// =============================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Music, Download, AlertCircle } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface AudioPreviewProps {
  url: string;
  name: string;
  onDownload?: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function AudioPreview({ url, name, onDownload }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoading(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const skipBackward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  }, []);

  const skipForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  }, [duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-red-500/20 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-slate-300 font-medium mb-2">
          Não foi possível reproduzir o áudio
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Seu navegador pode não suportar este formato de áudio.
        </p>
        {onDownload && (
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar áudio</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={url}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Album art placeholder */}
      <div className="w-48 h-48 mb-8 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-slate-700">
        <Music className={`w-20 h-20 text-purple-400 ${isPlaying ? 'animate-pulse' : ''}`} />
      </div>

      {/* Track name */}
      <h3 className="text-lg font-medium text-white mb-2 text-center max-w-[300px] truncate">
        {name}
      </h3>

      {/* Duration */}
      <p className="text-sm text-slate-500 mb-6">
        {isLoading ? 'Carregando...' : formatTime(duration)}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={isLoading}
          className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between w-full max-w-md mb-6 text-xs text-slate-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={skipBackward}
          disabled={isLoading}
          className="p-3 hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
          title="Voltar 10s"
        >
          <SkipBack className="w-5 h-5 text-slate-300" />
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="p-4 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors disabled:opacity-50"
          title={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </button>

        <button
          onClick={skipForward}
          disabled={isLoading}
          className="p-3 hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
          title="Avançar 10s"
        >
          <SkipForward className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-3 w-full max-w-[200px]">
        <button
          onClick={toggleMute}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          title={isMuted ? 'Ativar som' : 'Silenciar'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-slate-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-300" />
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-slate-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* Download button */}
      {onDownload && (
        <button
          onClick={onDownload}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Baixar áudio</span>
        </button>
      )}
    </div>
  );
}
