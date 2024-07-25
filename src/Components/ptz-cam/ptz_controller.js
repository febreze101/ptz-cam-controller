import useWebSocket, { ReadyState } from "react-use-websocket";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Slider } from "@mui/material";
import Box from "@mui/material/Box";
import { animated } from "react-spring";
import { useGesture } from "@use-gesture/react";
import CameraPositionIndicator from "./CameraPositionIndicator";
import { debounce } from 'lodash';

const RemoteVideo = () => (
    <video autoPlay playsInline style={{ width: '300px', height: '225px' }} />
);

export default function PtzController() {
    const [currCenterX, setCurrCenterX] = useState(0);
    const [currCenterY, setCurrCenterY] = useState(0);

    const [zoomScale, setZoomScale] = useState(1);
    

    const ZOOM_MAX = 100;
    const ZOOM_MIN = 1;

    const [zoomDistance, setZoomDistance] = useState(1);

    const touchAreaRef = useRef(null);

    const { sendJsonMessage, readyState } = useWebSocket("ws://cart:9876", {
        onOpen: () => console.log("Camera Controller ws opened"),
        onError: (error) => console.error("WebSocket error:", error),
        shouldReconnect: (closeEvent) => true,
    });

    const resetCamera = () => {
        setCurrCenterX(0);
        setCurrCenterY(0);
        console.log("resetting camera positioning");
        sendJsonMessage({ pan_absolute: 0, tilt_absolute: 0 });
    };

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    useEffect(() => {
        resetCamera();
    }, [])

    // handle tap moving
    const handleTap = ({ clientX, clientY }) => {
        if (touchAreaRef.current) {
            // get dimmensions of touch area
            const { width, height, left, top, right, bottom } = touchAreaRef.current.getBoundingClientRect();

            let maxWidth = 259200; // max allowed width 72 degree FOV @ increments of 3600 per degree
            let maxHeight = 39600; // max allowed height 72 degree FOV @ increments of 3600 per degree

            if (zoomScale >= 1) {
                maxWidth = Math.round(maxWidth - (maxWidth * 0.4)) 
                maxHeight = Math.round(maxHeight - (maxHeight * 0.4))
            }

            let areaWidthIncrements = ((width - left * 2) * 3600) / maxWidth;
            let areaHeightIncrements = ((height - top - (height - bottom)) * 3600) / maxHeight;

            let leftBound = -518_400;
            let rightBound = 518_400;

            let topBound = -284_400;
            let botBound = 284_400;

            // get click position
            const clickX = clientX - left;
            const clickY = clientY - top;

            let newCenterX = currCenterX;
            let newCenterY = currCenterY;

            // if we click on left or right side
            if (clickX < width / 2) {
                newCenterX = currCenterX + (Math.round(((width / 2) - clickX) / areaWidthIncrements) * 3600)
                console.log("x location: " + newCenterX);
            } else {
                newCenterX = currCenterX - (Math.round((clickX - (width / 2)) / areaWidthIncrements) * 3600)
                console.log("x location: " + newCenterX);
            }

            // if we click top or bottom
            if (clickY < height / 2) {
                newCenterY = currCenterY - (Math.round((height / 2 - clickY) / areaHeightIncrements) * 14400);
            } else {
                newCenterY = currCenterY + (Math.round((clickY - height / 2) / areaHeightIncrements) * 14400);
            }

            // Clamp values to ensure they're within valid ranges
            newCenterX = Math.min(Math.max(newCenterX, leftBound), rightBound);
            newCenterY = Math.min(Math.max(newCenterY, topBound), botBound);

            setCurrCenterX(newCenterX)
            setCurrCenterY(newCenterY);
            if (zoomScale < 2) {
                sendJsonMessage({ pan_absolute: newCenterX, tilt_absolute: newCenterY });
            }
            scaleZoom(newCenterX, newCenterY);
        }
    };

    const debouncedHandleZoom = useCallback(
        debounce((newZoomDistance) => {
            const clampedZoom = Math.min(Math.max(newZoomDistance, ZOOM_MIN), ZOOM_MAX);
            setZoomDistance(clampedZoom);
            sendJsonMessage({ zoom_absolute: Math.round(clampedZoom) });
            console.log(`Zoom set to: ${clampedZoom}`);
        }, 100),
        [sendJsonMessage]
    );

    const handleZoom = useCallback(
        (newZoomDistance) => {
            const clampedZoom = Math.min(Math.max(newZoomDistance, ZOOM_MIN), ZOOM_MAX);
            setZoomDistance(clampedZoom);
            sendJsonMessage({ zoom_absolute: Math.round(clampedZoom) });
            console.log(`Zoom set to: ${clampedZoom}`);
        },
        [ZOOM_MAX, ZOOM_MIN]
    );

    // handle gestures
    const gestureRecognizer = useGesture(
        {
            // onClick: (state) => {
            //     handleTapToMove(state.event);
            // },
            onPinch: ({ delta: [d], offset: [totalD], event, first, last }) => {
                event.preventDefault();
                if (event.type === "wheel") {
                    const newZoom = zoomDistance - d / 100;
                    debouncedHandleZoom(newZoom);
                } else {
                    // For touch pinch, use the total offset for smoother zooming
                    const newZoom = ZOOM_MIN + (totalD / 25) * (ZOOM_MAX - ZOOM_MIN);
                    debouncedHandleZoom(newZoom);
                }
            },
        },
        {
            pinch: { pinchOnWheel: true, filterTaps: true },
            eventOptions: { passive: false },
        }
    );

    // scale movement wiht zoom 
    const scaleZoom = (centerX, centerY) => {

        setZoomScale(zoomDistance / 5)
        let newCenterX;
        let newCenterY;

        console.log("zoomScale", zoomScale);

        newCenterX = Math.round((centerX / zoomScale) / 3600) * 3600
        newCenterY = Math.round((centerY / zoomScale) / 3600) * 3600

        sendJsonMessage({ pan_absolute: newCenterX, tilt_absolute: newCenterY });

    }

    useEffect(() => {
        scaleZoom();
    }, [zoomDistance])

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
                {/* Display connection status */}
                <div aria-live="polite" className="text-2xl text-cyan-50 mb-4" role="status">Connection status: {connectionStatus}</div>

                <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="flex justify-between w-full max-w-xs">
                        <Button
                            aria-label="reset-camera"
                            variant="contained"
                            sx={{
                                backgroundColor: "#FFCDD2",
                                color: "black",
                                "&:hover": { backgroundColor: "#d7dbd0" },
                            }}
                            className="m-4 text-cyan-50 red-100"
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
                            max={ZOOM_MAX}
                            valueLabelFormat={`Zoom ${zoomDistance}x`}
                            onChange={(_, newValue) => handleZoom(newValue)}
                            sx={{
                                width: "80%",
                                color: "#ffffff",
                                "& .MuiSlider-thumb": {
                                    backgroundColor: "#FFCDD2",
                                },
                                "& .MuiSlider-rail": {
                                    backgroundColor: "#8bc34a",
                                },
                                "& .MuiSlider-mark": {
                                    backgroundColor: "#FFCDD2",
                                    height: "8px",
                                    width: "2px",
                                    "&.MuiSlider-markActive": {
                                        opacity: 1,
                                        backgroundColor: "#FFCDD2",
                                    },
                                },
                            }}
                            className="m-4"
                        />
                    </div>
                    <Box className="w-full h-full mt-4 p-2">
                        <animated.div
                            aria-label={"cam-control-area"}
                            onClick={handleTap}
                            ref={touchAreaRef}
                            className="w-full h-full text-2xl text-cyan-50 justify-center content-center select-none shadow-2xl border-red-100 border-4"
                            {...gestureRecognizer()}
                            style={{
                                touchAction: "none",
                                // background: "#333842",
                                borderRadius: "15px",
                            }}
                        >
                            <RemoteVideo />
                            {/* <img src="https://res.klook.com/images/fl_lossy.progressive,q_65/c_fill,w_1200,h_630/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/tsah7c9evnal289z5fig/IMG%20Worlds%20of%20Adventure%20Admission%20Ticket%20in%20Dubai%20-%20Klook.jpg"/> */}
                            touch this area to interact with the camera
                            <br />
                            slide or two finger pinch to zoom
                        </animated.div>
                    </Box>
                </div>
                {/* <CameraPositionIndicator
                    aria-label={"camera-position-indicator"}
                    className="overflow-auto"
                    currCenterX={currCenterX}
                    currCenterY={currCenterY}
                    zoomLevel={zoomDistance}
                    zoomMax={ZOOM_MAX}
                /> */}
            </Box>
        </>
    );
}
