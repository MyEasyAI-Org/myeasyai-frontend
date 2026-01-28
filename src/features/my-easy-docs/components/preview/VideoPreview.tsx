// =============================================
// MyEasyDocs - VideoPreview Component
// =============================================
// Preview component for video files using HTML5 video.
// Supports: mp4, webm, mov, avi
// =============================================

import { useState, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Download, AlertCircle } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface VideoPreviewProps {
  url: string;
  name: string;
  onDownload?: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function VideoPreview({ url, name, onDownload }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoading(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-red-500/20 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-slate-300 font-medium mb-2">
          Não foi possível reproduzir o vídeo
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Seu navegador pode não suportar este formato de vídeo.
        </p>
        {onDownload && (
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar vídeo</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Video container */}
      <div className="flex-1 flex items-center justify-center relative bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <video
          ref={videoRef}
          src={url}
          className="max-w-full max-h-full"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />
      </div>

      {/* Controls */}
      <div className="p-3 bg-slate-800/80 border-t border-slate-700">
        {/* Progress bar */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-slate-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-slate-300" />
              )}
            </button>

            <span className="text-sm text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Tela cheia"
            >
              <Maximize className="w-4 h-4 text-slate-300" />
            </button>

            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Baixar vídeo"
              >
                <Download className="w-4 h-4 text-slate-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
