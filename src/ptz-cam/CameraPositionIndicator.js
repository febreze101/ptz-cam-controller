import React from "react";

const CameraPositionIndicator = ({
  panPosition,
  tiltPosition,
  panRange,
  tiltRange,
  zoomLevel,
  maxZoom,
}) => {
  // Calculate the position as a percentage of the total range
  const panPercentage = ((panPosition + panRange) / (2 * panRange)) * 100;
  const tiltPercentage = ((tiltPosition + tiltRange) / (2 * tiltRange)) * 100;

  // Calculate dot size based on zoom level
  const minDotSize = 6;
  const maxDotSize = 20;
  const dotSize =
    minDotSize + (zoomLevel / maxZoom) * (maxDotSize - minDotSize);

  return (
    <div
      className="camera-position-indicator"
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: "100px",
        height: "100px",
        border: "2px solid #fff",
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          backgroundColor: "#ff0000",
          borderRadius: "50%",
          top: `${100 - tiltPercentage}%`,
          left: `${panPercentage}%`,
          transform: "translate(-50%, -50%)",
          transition: "all 0.3s ease-out", // Smooth animation
        }}
      />
    </div>
  );
};

export default CameraPositionIndicator;
