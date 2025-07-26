import React from 'react';

const DetectionOverlay = ({ predictions, videoWidth, videoHeight, containerRef }) => {
  if (!predictions || predictions.length === 0 || !containerRef?.current) {
    return null;
  }

  const containerRect = containerRef.current.getBoundingClientRect();
  const scaleX = containerRect.width / videoWidth;
  const scaleY = containerRect.height / videoHeight;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {predictions.map((prediction, index) => {
        const [x, y, width, height] = prediction.bbox;
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;

        return (
          <div key={index}>
            {/* Bounding box */}
            <div
              className="absolute border-2 border-blue-500 bg-blue-500/10"
              style={{
                left: `${scaledX}px`,
                top: `${scaledY}px`,
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
              }}
            />
            {/* Label */}
            <div
              className="absolute bg-blue-500 text-white px-2 py-1 text-xs font-medium rounded-md shadow-lg"
              style={{
                left: `${scaledX}px`,
                top: `${scaledY - 30}px`,
                transform: scaledY < 30 ? 'translateY(40px)' : 'none',
              }}
            >
              {prediction.class} ({Math.round(prediction.score * 100)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DetectionOverlay;

