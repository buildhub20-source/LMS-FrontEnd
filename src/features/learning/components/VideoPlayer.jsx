import { useEffect, useRef } from 'react';

/**
 * Reports playback position so progress survives refreshes.
 * `onProgress` is throttled to once every 10 seconds of playback.
 */
export const VideoPlayer = ({ src, poster, startAt = 0, onProgress, onEnded }) => {
  const videoRef = useRef(null);
  const lastReported = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video && startAt > 0) video.currentTime = startAt;
  }, [src, startAt]);

  const handleTimeUpdate = (event) => {
    const current = Math.floor(event.target.currentTime);
    if (current - lastReported.current >= 10) {
      lastReported.current = current;
      onProgress?.({ positionSeconds: current, durationSeconds: event.target.duration });
    }
  };

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      controls
      controlsList="nodownload"
      onTimeUpdate={handleTimeUpdate}
      onEnded={onEnded}
      style={{ width: '100%', borderRadius: 'var(--radius-md)', background: '#000' }}
    >
      <track kind="captions" />
    </video>
  );
};

export default VideoPlayer;
