import React, { useRef, useEffect } from 'react';
import DetectionOverlay from './DetectionOverlay';
import FaceRecognitionOverlay from './FaceRecognitionOverlay';

const WebcamView = ({ videoRef, predictions, isStreaming, faceDetections, showFaceRecognition = true }) => {
  const containerRef = useRef(null);
  const [videoDimensions, setVideoDimensions] = React.useState({ width: 640, height: 480 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDimensions({
        width: video.videoWidth,
        height: video.videoHeight
      });
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [videoRef]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div 
        ref={containerRef}
        className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl aspect-video"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-lg font-medium">Camera not active</p>
              <p className="text-sm text-gray-300">Click "Start Camera" to begin detection</p>
            </div>
          </div>
        )}

        {isStreaming && (
          <>
            <DetectionOverlay
              predictions={predictions}
              videoWidth={videoDimensions.width}
              videoHeight={videoDimensions.height}
              containerRef={containerRef}
            />
            {showFaceRecognition && (
              <FaceRecognitionOverlay
                faceDetections={faceDetections}
                videoWidth={videoDimensions.width}
                videoHeight={videoDimensions.height}
                containerRef={containerRef}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamView;

