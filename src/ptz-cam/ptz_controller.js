import useWebSocket from "react-use-websocket";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import React, { useRef, useState } from "react";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import { animated, useSpring } from "react-spring";
import {
  useGesture,
  dragAction,
  pinchAction,
  createUseGesture,
  useDrag,
} from "@use-gesture/react";

export default function PtzController() {
  const panRange = 648000;
  const panIncrements = panRange / 180;
  const [panPosition, setPanPosition] = useState(0);

  const tiltRange = 324000;
  const tiltIncrements = tiltRange / 90;
  const [tiltPosition, setTiltPosition] = useState(0);

  const [coor, setCoor] = useState({ x: 0, y: 0 });

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

  const zoomMin = 1;
  const zoomMax = 100;
  const [zoomDistance, setZoomDistance] = useState(0);

  const quadrant = useRef(null);

  const boxRef = useRef(null);

  // const { sendJsonMessage } = useWebSocket("ws://cart:9876", {
  //   onOpen: () => console.log("Camera Controller ws opened"),
  // });

  // Handle zoom in
  const handleZoomIn = () => {
    const newZoomDistance = Math.max(zoomDistance + 5, 0);
    setZoomDistance(newZoomDistance);
    // sendJsonMessage({ zoom_absolute: newZoomDistance });
    console.log(`action zoom-in'; position: ${newZoomDistance}`);
  };

  // Handle zoom out
  const handleZoomOut = () => {
    const newZoomDistance = Math.max(zoomDistance - 5, 0);
    setZoomDistance(newZoomDistance);
    // sendJsonMessage({ zoom_absolute: newZoomDistance });
    console.log(`action zoom-in'; position: ${newZoomDistance}`);
  };

  // Handle tilting down
  const handleTiltDown = () => {
    const newTiltPos = Math.max(tiltPosition - tiltIncrements, -tiltRange);
    // if tiltPosition goes out of bounds, reset
    if (tiltPosition < -tiltRange) {
      setTiltPosition(-tiltRange);
    } else {
      setTiltPosition(newTiltPos);
    }

    console.log("tilt position", tiltPosition);
    // sendJsonMessage({ tilt_absolute: newTiltPos });
    console.log(`action 'tilt-down'; position: ${newTiltPos}`);
  };

  // Handle tilting up
  const handleTiltUp = () => {
    const newTiltPos = Math.min(tiltPosition + tiltIncrements, tiltRange);
    // if tiltPosition goes out of bounds, reset
    if (newTiltPos > tiltRange) {
      setTiltPosition(tiltRange);
    } else {
      setTiltPosition(newTiltPos);
    }

    console.log("new tilt position", newTiltPos);
    // sendJsonMessage({ tilt_absolute: newTiltPos });
    console.log(`action 'tilt-up'; position: ${newTiltPos}`);
  };

  // Handle panning left
  const handlePanLeft = () => {
    const newPanPos = Math.max(panPosition - panIncrements, -panRange);
    if (newPanPos < -panRange) {
      console.log("Reached minimum pan distance");
      setPanPosition(-panRange);
    } else {
      setPanPosition(newPanPos);
    }

    // sendJsonMessage({ pan_absolute: newPanPos });
    console.log(`action 'pan-left'; position: ${newPanPos}`);
  };

  // Handle panning right
  const handlePanRight = () => {
    const newPanPos = Math.min(panPosition + panIncrements, panRange);
    if (newPanPos > panRange) {
      console.log("Reached minimum pan distance");
      setPanPosition(panRange);
    } else {
      setPanPosition(newPanPos);
    }

    // sendJsonMessage({ pan_absolute: newPanPos });
    console.log(`action 'pan-right'; position: ${newPanPos}`);
  };

  const setQuadrant = ({ targetX, targetY }) => {
    if (targetX > 0 && targetY < 0) {
      quadrant.current = "quadrant1";
    } else if (targetX < 0 && targetY < 0) {
      quadrant.current = "quadrant2";
    } else if (targetX > 0 && targetY > 0) {
      quadrant.current = "quadrant3";
    } else if (targetX < 0 && targetY > 0) {
      quadrant.current = "quadrant4";
    }
  };

  // handle tap moving
  const handleTapToMove = ({ clientX, clientY }) => {
    if (boxRef.current) {
      const { width, height, left, top, right, bottom } =
        boxRef.current.getBoundingClientRect();

      // get center of element
      const centerX = width / 2;
      const centerY = height / 2;

      // get click location
      const targetX = clientX - left - centerX;
      const targetY = clientY - centerY;

      // set quadrant
      setQuadrant({ targetX, targetY });

      // number of divisions in the screen
      const incrementCountX = width / 18;
      const incrementCountY = height / 18;

      // distance from center of element
      const distX = targetX - centerX;
      const distY = targetY - centerY;

      // amount to move camera irl
      const incrementAmountX =
        Math.round(distX / incrementCountX) * 5 * panIncrements;
      const incrementAmountY =
        Math.round(distY / incrementCountY) * 5 * tiltIncrements;

      // handle move based on quadrant
      if (quadrant.current === "quadrant1") {
        const newPanPos = panPosition + Math.abs(incrementAmountX);
        const newTiltPos = tiltPosition + Math.abs(incrementAmountY);

        setPanPosition(Math.min(newPanPos, panRange));
        setTiltPosition(Math.min(newTiltPos, tiltRange));
        console.log(panPosition, tiltPosition);
        // sendJsonMessage({ zoom_absolute: newPanPos, tilt_absolute: newTiltPos});
      } else if (quadrant.current === "quadrant2") {
        const newPanPos = panPosition + incrementAmountX;
        const newTiltPos = tiltPosition + Math.abs(incrementAmountY);

        setPanPosition(Math.max(newPanPos, -panRange));
        setTiltPosition(Math.min(newTiltPos, tiltRange));
        console.log(panPosition, tiltPosition);
        // sendJsonMessage({ zoom_absolute: newPanPos, tilt_absolute: newTiltPos});
      } else if (quadrant.current === "quadrant3") {
        const newPanPos = panPosition + incrementAmountX;
        const newTiltPos = tiltPosition + incrementAmountY;

        setPanPosition(Math.max(newPanPos, -panRange));
        setTiltPosition(Math.max(newTiltPos, -tiltRange));
        console.log(panPosition, tiltPosition);
        // sendJsonMessage({ zoom_absolute: newPanPos, tilt_absolute: newTiltPos});
      } else if (quadrant.current === "quadrant4") {
        const newPanPos = panPosition + Math.abs(incrementAmountX);
        const newTiltPos = tiltPosition + incrementAmountY;

        setPanPosition(Math.min(newPanPos, panRange));
        setTiltPosition(Math.max(newTiltPos, -tiltRange));
        console.log(panPosition, tiltPosition);
        // sendJsonMessage({ zoom_absolute: newPanPos, tilt_absolute: newTiltPos});
      }
    }
  };

  // handle gestures
  const gestureRecognizer = useGesture(
    {
      onPointerDown: (state) => {
        console.log("onPointerDown", state);
        const { event } = state;
        handleTapToMove(event);
      },
      onDrag: ({ movement: [mx, my], direction: [dx, dy] }) => {
        if (dx > 0) {
          // Dragging to the right
          handlePanRight();
        } else if (dx < 0) {
          // Dragging to the left
          handlePanLeft();
        }
        if (dy > 0) {
          // Dragging down
          handleTiltDown();
        } else if (dy < 0) {
          // Dragging up
          handleTiltUp();
        }
        api.start({ x: mx, y: my });
      },
    },
    {
      drag: {
        threshold: 10,
        filterTaps: true,
      },
    }
  );

  return (
    <>
      <Box
        sx={{
          background: "#262a31",
          minHeight: "100vh",
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
        className="h-screen"
      >
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="flex justify-between w-full max-w-xs">
            <Button
              className="m-4 text-cyan-50"
              sx={{
                backgroundColor: "#eef2e3",
                color: "black",
                "&:hover": {
                  backgroundColor: "#d7dbd0", // A slightly darker shade for the hover state
                },
              }}
              variant="contained"
              onClick={handleZoomIn}
            >
              Zoom In
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#eef2e3",
                color: "black",
                "&:hover": { backgroundColor: "#d7dbd0" },
              }}
              onClick={handleZoomOut}
              className="m-4 text-cyan-50"
            >
              Zoom Out
            </Button>
          </div>
          <Box className="w-full h-full mt-4 p-2" ref={boxRef}>
            <animated.div
              // onClick={handleTapToMove}
              className="w-full h-full  text-cyan-50 justify-center content-center select-none shadow-2xl"
              {...gestureRecognizer()}
              style={{
                touchAction: "none",
                background: "#333842",
                borderRadius: "15px",
              }}
            >
              Touch this area to interact with the camera
            </animated.div>
          </Box>
        </div>
      </Box>
    </>
  );
}
