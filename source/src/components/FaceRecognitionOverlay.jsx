import React from 'react';

const FaceRecognitionOverlay = ({ faceDetections, videoWidth, videoHeight, containerRef }) => {
  if (!faceDetections || faceDetections.length === 0 || !containerRef?.current) {
    return null;
  }

  const containerRect = containerRef.current.getBoundingClientRect();
  const scaleX = containerRect.width / videoWidth;
  const scaleY = containerRect.height / videoHeight;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {faceDetections.map((face, index) => {
        const { x, y, width, height } = face.detection.box;
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;

        const isKnown = face.isKnown;
        const confidence = Math.round(face.confidence * 100);
        const borderColor = isKnown ? 'border-green-500' : 'border-yellow-500';
        const bgColor = isKnown ? 'bg-green-500/10' : 'bg-yellow-500/10';
        const labelBgColor = isKnown ? 'bg-green-500' : 'bg-yellow-500';

        return (
          <div key={index}>
            {/* Face bounding box */}
            <div
              className={`absolute border-2 ${borderColor} ${bgColor}`}
              style={{
                left: `${scaledX}px`,
                top: `${scaledY}px`,
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
              }}
            />
            
            {/* Name label */}
            <div
              className={`absolute ${labelBgColor} text-white px-2 py-1 text-xs font-medium rounded-md shadow-lg`}
              style={{
                left: `${scaledX}px`,
                top: `${scaledY - 30}px`,
                transform: scaledY < 30 ? 'translateY(40px)' : 'none',
              }}
            >
              {face.name} {isKnown && `(${confidence}%)`}
            </div>

            {/* Face landmarks (optional - can be toggled) */}
            {face.landmarks && (
              <div className="absolute">
                {face.landmarks.positions.map((point, pointIndex) => (
                  <div
                    key={pointIndex}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full"
                    style={{
                      left: `${point.x * scaleX - 2}px`,
                      top: `${point.y * scaleY - 2}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FaceRecognitionOverlay;

