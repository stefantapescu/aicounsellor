'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScenarioStep, ScenarioResponse, VideoContent, VideoResponse } from '@/types/simulations';
import { CheckCircle2, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  step: ScenarioStep;
  onComplete: (response: VideoResponse) => void;
  response?: ScenarioResponse;
  isCompleted: boolean;
}

export default function VideoPlayer({
  step,
  onComplete,
  response,
  isCompleted,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const content = step.content as VideoContent;
  const previousResponse = response?.response_data as VideoResponse;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [notes, setNotes] = useState(previousResponse?.notes || '');
  const [watchedDuration, setWatchedDuration] = useState(previousResponse?.watched_duration_seconds || 0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setWatchedDuration(Math.max(watchedDuration, video.currentTime));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [watchedDuration]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleComplete = () => {
    onComplete({
      watched_duration_seconds: watchedDuration,
      completed: watchedDuration >= content.duration_seconds * 0.9, // Consider complete if watched 90%
      notes,
    });
  };

  const progressPercentage = (watchedDuration / content.duration_seconds) * 100;
  const hasWatchedEnough = watchedDuration >= content.duration_seconds * 0.9;

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={content.video_url}
          className="w-full h-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            
            <div className="flex-1">
              <Progress value={progressPercentage} className="h-1" />
            </div>
            
            <div className="text-white text-sm">
              {Math.floor(currentTime)}/{Math.floor(content.duration_seconds)}s
            </div>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Key Points to Remember:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {content.key_points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </Card>

      {/* Notes Section */}
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Take notes (optional):
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write down important points, questions, or reflections..."
          className="min-h-[100px]"
        />
      </div>

      {/* Complete Button */}
      {!isCompleted && (
        <Button
          onClick={handleComplete}
          disabled={!hasWatchedEnough}
          className="w-full"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {hasWatchedEnough ? 'Complete Step' : `Watch at least ${Math.ceil(content.duration_seconds * 0.9)} seconds to complete`}
        </Button>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span>Step Completed!</span>
        </div>
      )}
    </div>
  );
} 