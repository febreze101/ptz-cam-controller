import useWebSocket from "react-use-websocket";
import {
    TransformWrapper,
    TransformComponent,
    useControls,
} from "react-zoom-pan-pinch";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Slider } from "@mui/material";
import Box from "@mui/material/Box";
import { animated, useSpring } from "react-spring";
import {
    useGesture,
    usePinch,
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

    const [currCenterX, setCurrCenterX] = useState(0)
    const [currCenterY, setCurrCenterY] = useState(0)

    const [leftBound, setLeftBound] = useState(0);
    const [rightBound, setRightbound] = useState(0);

    const zoomMax = 100;
    const zoomMin = 1;

    const [zoomDistance, setZoomDistance] = useState(1);

    const [isZooming, setIsZooming] = useState(false);

    const quadrant = useRef(null);

    const touchAreaRef = useRef(null);

    const { sendJsonMessage } = useWebSocket("ws://cart:9876", {
        onOpen: () => console.log("Camera Controller ws opened"),
    });

    const setQuadrant = ({ targetX, targetY }) => {
        if (targetX > 0 && targetY < 0) {
            quadrant.current = "quadrant1";
        } else if (targetX < 0 && targetY < 0) {
            quadrant.current = "quadrant2";
        } else if (targetX < 0 && targetY > 0) {
            quadrant.current = "quadrant3";
        } else if (targetX > 0 && targetY > 0) {
            quadrant.current = "quadrant4";
        }
    };

    const resetCamera = () => {
        setCurrCenterX(0);
        setCurrCenterY(0);
        sendJsonMessage({ pan_absolute: 0, tilt_absolute: 0 });
    }

    

    // handle tap moving
    const handleTapToMove = ({ clientX, clientY }) => {
        if (touchAreaRef.current) {
            const { width, height, left, top, right, bottom } =
                touchAreaRef.current.getBoundingClientRect();

            console.log(width, height);

            // get center of element
            const centerX = width / 2;
            const centerY = height / 2;

            // get click location
            const targetX = clientX - centerX;
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
                const newPanPos = Math.min(panPosition + Math.abs(incrementAmountX), panRange);
                const newTiltPos = Math.min(tiltPosition + Math.abs(incrementAmountY), tiltRange);

                setPanPosition(newPanPos);
                setTiltPosition(newTiltPos);
                console.log(
                    "pan_absolute: " + newPanPos,
                    "tilt_absolute: " + newTiltPos
                );
                sendJsonMessage({ pan_absolute: newPanPos, tilt_absolute: newTiltPos });
            } else if (quadrant.current === "quadrant2") {
                const newPanPos = Math.max(panPosition + incrementAmountX, -panRange);
                const newTiltPos = Math.min(tiltPosition + Math.abs(incrementAmountY), tiltRange);

                setPanPosition(newPanPos);
                setTiltPosition(newTiltPos);
                console.log(
                    "pan_absolute: " + newPanPos,
                    "tilt_absolute: " + newTiltPos
                );
                sendJsonMessage({ pan_absolute: newPanPos, tilt_absolute: newTiltPos });
            } else if (quadrant.current === "quadrant3") {
                const newPanPos = Math.max(panPosition + incrementAmountX, -panRange);
                const newTiltPos = Math.max(tiltPosition + incrementAmountY, -tiltRange);

                setPanPosition(newPanPos);
                setTiltPosition(newTiltPos);
                console.log(
                    "pan_absolute: " + newPanPos,
                    "tilt_absolute: " + newTiltPos
                );
                sendJsonMessage({ pan_absolute: newPanPos, tilt_absolute: newTiltPos });
            } else if (quadrant.current === "quadrant4") {
                const newPanPos = Math.min(panPosition + Math.abs(incrementAmountX), panRange);
                const newTiltPos = Math.max(tiltPosition + incrementAmountY, -tiltRange);

                setPanPosition(newPanPos);
                setTiltPosition(newTiltPos);
                console.log(
                    "pan_absolute: " + newPanPos,
                    "tilt_absolute: " + newTiltPos
                );
                sendJsonMessage({ pan_absolute: newPanPos, tilt_absolute: newTiltPos });
            }
        }
    };

    const handleZoom = useCallback((newZoomDistance) => {
        const clampedZoom = Math.min(Math.max(newZoomDistance, zoomMin), zoomMax);
        setZoomDistance(clampedZoom);
        sendJsonMessage({ zoom_absolute: Math.round(clampedZoom) });
        console.log(`Zoom set to: ${clampedZoom}`);
    }, [sendJsonMessage, zoomMax, zoomMin]);

    // pinch to zoom
    const handlePinch = usePinch(
        ({ offset: [d], event }) => {
            console.log(event.type);
            if (event.type === 'wheel') {
                event.preventDefault();
                const newZoom = zoomDistance - d / 5; // Adjust for wheel sensitivity
                handleZoom(newZoom);
            } else {
                const newZoom = zoomDistance + d / 5; // Adjust for pinch sensitivity
                handleZoom(newZoom);
            }
        },
        {
            pinchOnWheel: true,
            eventOptions: { passive: false },
        }
    );

    // handle gestures
    const gestureRecognizer = useGesture(
        {
            onClick: (state) => {
                handleTapToMove(state.event);
            },
            onPinch: ({ delta: [d], offset: [totalD], event, first, last }) => {
                event.preventDefault();

                if (first) setIsZooming(true);
                if (last) setIsZooming(false);
                if (event.type === 'wheel') {
                    const newZoom = zoomDistance - d / 100;
                    handleZoom(newZoom);
                } else {
                    // For touch pinch, use the total offset for smoother zooming
                    const newZoom = zoomMin + (totalD / 25) * (zoomMax - zoomMin);
                    handleZoom(newZoom);
                }
            },
        },
        {
            pinch: { pinchOnWheel: true },
            eventOptions: { passive: false }
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
                            aria-label="reset-camera"
                            variant="contained"
                            sx={{
                                backgroundColor: "#eef2e3",
                                color: "black",
                                "&:hover": { backgroundColor: "#d7dbd0" },
                            }}
                            className="m-4 text-cyan-50"
                            onClick={resetCamera}
                        >
                            Reset Camera
                        </Button>
                        <Slider
                            aria-label="zoom-slider"
                            value={zoomDistance}
                            valueLabelDisplay="auto"
                            step={5}
                            marks
                            min={1}
                            max={zoomMax}
                            // valueLabelFormat={"Zoom"}
                            onChange={(_, newValue) => handleZoom(newValue)}
                            sx={{
                                width: '80%',
                                color: '#ffffff',
                                '& .MuiSlider-thumb': {
                                    backgroundColor: '#ffffff',
                                },
                                '& .MuiSlider-track': {
                                    backgroundColor: '#4caf50',
                                },
                                '& .MuiSlider-rail': {
                                    backgroundColor: '#8bc34a',
                                },
                                '& .MuiSlider-mark': {
                                    backgroundColor: '#ffffff',
                                    height: '8px',
                                    width: '2px',
                                    '&.MuiSlider-markActive': {
                                        opacity: 1,
                                        backgroundColor: '#4caf50',
                                    },
                                },
                            }}
                            className="m-4"
                        />
                    </div>
                    <Box className="w-full h-full mt-4 p-2" ref={touchAreaRef}>
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
                            Touch this area to interact with the camera<br />
                            slide or two finger pinch to zoom
                        </animated.div>
                    </Box>
                </div>
            </Box>
        </>
    );
}
