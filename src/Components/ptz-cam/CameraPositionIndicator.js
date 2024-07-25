import React, { useCallback, useEffect } from "react";

const CameraPositionIndicator = ({
    currCenterX,
    currCenterY,
    zoomLevel,
    zoomMax,
}) => {
    const maxWidth = 259200;
    const maxHeight = 39600;

    // Calculate the position as a percentage of the total range
    const panPercentage = ((currCenterX + maxWidth / 2) / maxWidth) * 100;
    const tiltPercentage = ((currCenterY + maxHeight / 2) / maxHeight) * 100;

    // Calculate dot size based on zoom level
    const minDotSize = 6;
    const maxDotSize = 20;
    const dotSize = minDotSize + (zoomLevel / zoomMax) * (maxDotSize - minDotSize);

    // Calculate arrow position and rotation
    const arrowSize = 20;
    const indicatorSize = 150;
    const centerPoint = indicatorSize / 2;
    const arrowDistance = centerPoint - arrowSize;

    const angle = Math.atan2(tiltPercentage - 50, panPercentage - 50);
    const arrowX = centerPoint + Math.cos(angle) * arrowDistance;
    const arrowY = centerPoint + Math.sin(angle) * arrowDistance;

    // Prevent default behavior for mouse and touch events
    const preventDefault = useCallback((e) => {
        e.preventDefault();
    }, []);

    useEffect(() => {
        const indicator = document.querySelector('.camera-position-indicator');
        if (indicator) {
            indicator.addEventListener('touchmove', preventDefault, { passive: false });
            indicator.addEventListener('mousemove', preventDefault);
            indicator.addEventListener('wheel', preventDefault, { passive: false });
        }
        return () => {
            if (indicator) {
                indicator.removeEventListener('touchmove', preventDefault);
                indicator.removeEventListener('mousemove', preventDefault);
                indicator.removeEventListener('wheel', preventDefault);
            }
        };
    }, [preventDefault]);

    return (
        <div
            className="camera-position-indicator"
            style={{
                position: "fixed",  // Changed from "absolute" to "fixed"
                top: "20px",
                right: "20px",
                width: `${indicatorSize}px`,
                height: `${indicatorSize}px`,
                borderRadius: "50%",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                touchAction: "none",  // Prevents default touch actions
                userSelect: "none",   // Prevents text selection
            }}
        >
            {/* Crosshair */}
            <div style={{
                position: "absolute",
                width: "100%",
                height: "1px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
            }} />
            <div style={{
                position: "absolute",
                width: "1px",
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
            }} />

            {/* Direction arrow */}
            <div style={{
                position: "absolute",
                width: "0",
                height: "0",
                borderLeft: `${arrowSize / 2}px solid transparent`,
                borderRight: `${arrowSize / 2}px solid transparent`,
                borderBottom: `${arrowSize}px solid red`,
                transform: `translate(${arrowX - centerPoint}px, ${arrowY - centerPoint}px) rotate(${angle + Math.PI / 2}rad)`,
            }} />

            {/* Center dot */}
            <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "white",
            }} />

            {/* Camera position dot */}
            <div style={{
                position: "absolute",
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                backgroundColor: "#ff0000",
                borderRadius: "50%",
                top: `${tiltPercentage}%`,
                left: `${panPercentage}%`,
                transform: "translate(-50%, -50%)",
                transition: "all 0.3s ease-out",
                opacity: panPercentage >= 0 && panPercentage <= 100 && tiltPercentage >= 0 && tiltPercentage <= 100 ? 1 : 0,
            }} />

            {/* Zoom level indicator */}
            <div style={{
                position: "absolute",
                bottom: "5px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                fontSize: "12px",
            }}>
                Zoom: {Math.round(zoomLevel)}x
            </div>
        </div>
    );
};

export default CameraPositionIndicator;