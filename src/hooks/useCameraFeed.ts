import { useCallback, useEffect, useRef, useState } from 'react';

type LegacyNavigator = Navigator & {
  getUserMedia?: (constraints: MediaStreamConstraints, success: (stream: MediaStream) => void, error: (err: unknown) => void) => void;
  webkitGetUserMedia?: LegacyNavigator['getUserMedia'];
  mozGetUserMedia?: LegacyNavigator['getUserMedia'];
  msGetUserMedia?: LegacyNavigator['getUserMedia'];
};

function ensureMediaDevicesPolyfill() {
  if (typeof navigator === 'undefined') {
    return;
  }

  const nav = navigator as LegacyNavigator & { mediaDevices?: MediaDevices };

  nav.mediaDevices = nav.mediaDevices || ({} as MediaDevices);

  if (!nav.mediaDevices.getUserMedia) {
    const legacyGetUserMedia =
      nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.msGetUserMedia;

    if (legacyGetUserMedia) {
      nav.mediaDevices.getUserMedia = (constraints: MediaStreamConstraints) =>
        new Promise<MediaStream>((resolve, reject) => {
          legacyGetUserMedia.call(nav, constraints, resolve, reject);
        });
    }
  }
}

interface UseCameraFeedOptions {
  facingMode?: 'environment' | 'user';
  onError?: (error: Error) => void;
}

export function useCameraFeed(options: UseCameraFeedOptions = {}) {
  const { facingMode = 'environment', onError } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (err) {
        console.warn('Failed to stop camera track', err);
      }
    });
    streamRef.current = null;
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    ensureMediaDevicesPolyfill();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const message =
        'Live camera access is unavailable. Enable permissions or use the snapshot uploader below.';
      setError(message);
      onError?.(new Error(message));
      return;
    }

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn('Autoplay prevented, awaiting user interaction', playError);
        }
      }

      setError(null);
      setIsReady(true);
    } catch (err) {
      console.error('Camera start failed', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to access camera. Try granting permission or use the snapshot uploader.';
      setError(message);
      onError?.(err instanceof Error ? err : new Error(message));
      stopCamera();
    }
  }, [facingMode, onError, stopCamera]);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return {
    videoRef,
    startCamera,
    stopCamera,
    isReady,
    error,
  };
}
