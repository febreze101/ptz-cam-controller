import useWebSocket from "react-use-websocket"
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import React, {useRef, useState} from "react";
import { Button } from "@mui/material";
import Box from '@mui/material/Box';
import { animated, useSpring } from 'react-spring';
import { useGesture, dragAction, pinchAction, createUseGesture, useDrag } from "@use-gesture/react";


export default function PtzController() {
    const panRange = 648000;
    const panIncrements = panRange / 180;
    const [panPosition, setPanPosition] = useState(0);
    
    const tiltRange = 324000;
    const tiltIncrements = tiltRange / 90;
    const [tiltPosition, setTiltPosition] = useState(0);

    const [coor, setCoor] = useState({ x: 0, y: 0 });

    const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0}));

    const zoomMin = 1;
    const zoomMax = 100; 
    const [zoomDistance, setZoomDistance] = useState(0);

    const boxRef = useRef(null);
    

    const { sendJsonMessage } = useWebSocket("ws://cart:9876",{
        onOpen: () => console.log('Camera Controller ws opened'),
    })
    

    // Handle zoom in
    const handleZoomIn = () => {
        const newZoomDistance = Math.max(zoomDistance + 5, 0)
        setZoomDistance(newZoomDistance);
        sendJsonMessage({ zoom_absolute: newZoomDistance })
        console.log(`action zoom-in'; position: ${newZoomDistance}`);
    }
    
    // Handle zoom out
    const handleZoomOut = () => {
        const newZoomDistance = Math.max(zoomDistance - 5, 0)
        setZoomDistance(newZoomDistance);
        sendJsonMessage({ zoom_absolute: newZoomDistance })
        console.log(`action zoom-in'; position: ${newZoomDistance}`);
    }
    

    // Handle tilting down
    const handleTiltDown = () => {
        const newTiltPos = Math.max(tiltPosition - tiltIncrements, -tiltRange);
        // if tiltPosition goes out of bounds, reset
        if (tiltPosition < -tiltRange) {
            setTiltPosition(-tiltRange);
        } else {
            setTiltPosition(newTiltPos);
        }

        console.log('tilt position', tiltPosition);
        sendJsonMessage({ tilt_absolute: newTiltPos });
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

        console.log('new tilt position', newTiltPos)
        sendJsonMessage({ tilt_absolute: newTiltPos });
        console.log(`action 'tilt-up'; position: ${newTiltPos}`);
    };

    // Handle panning left
    const handlePanLeft = () => {
        const newPanPos = Math.max(panPosition - panIncrements, -panRange);
        if (newPanPos < -panRange) {
            console.log('Reached minimum pan distance');
            setPanPosition(-panRange)
        } else {
            setPanPosition(newPanPos);
        }
        
        sendJsonMessage({ pan_absolute: newPanPos });
        console.log(`action 'pan-left'; position: ${newPanPos}`);
        
    };

    // Handle panning right
    const handlePanRight = () => {
        const newPanPos = Math.min(panPosition + panIncrements, panRange);
        if (newPanPos > panRange) {
            console.log('Reached minimum pan distance');
            setPanPosition(panRange)
        } else {
            setPanPosition(newPanPos);
        }

        sendJsonMessage({ pan_absolute: newPanPos });
        console.log(`action 'pan-right'; position: ${newPanPos}`);
    };

    // handle tap moving
    const handleTapToMove = ({ clientX, clientY }) => {
        if (boxRef.current) {
            const { width, height, left, top } = boxRef.current.getBoundingClientRect(); 
            const centerX = left + width / 2;
            const centerY = top + height / 2;
            const targetX = clientX - centerX;
            const targetY = clientY - centerY;
            
            console.log('centerX: ' + centerX + ', centerY: ' + centerY);
            console.log('targetX: ' + targetX, 'targetY: ' + targetY);

            const distX = targetX - centerX;
            const distY = targetY - centerY;

            const panMoves = Math.floor(distX / 20);
            const tiltMoves = Math.floor(distY / 20);

            const  panDistance = Math.min(panPosition + (panMoves * panIncrements), panRange)
            const  tiltDistance = Math.min(tiltPosition + (tiltMoves * tiltIncrements), tiltRange)

            sendJsonMessage({ pan_absolute: panDistance, tilt_absolute: tiltDistance })
        }
    }

    // handle gestures
    const gestureRecognizer = useGesture(
        {
            onPointerDown: (state) => {
                console.log('onPointerDown',state);
                const { event } = state;
                handleTapToMove(event);
            },
            onDrag: ({ movement: [mx, my], direction: [dx, dy] }) =>  {
                if (dx > 0) { // Dragging to the right
                    handlePanRight();
                } else if (dx < 0) { // Dragging to the left
                    handlePanLeft();
                }
                if (dy > 0) { // Dragging down
                    handleTiltDown();
                } else if (dy < 0) { // Dragging up
                    handleTiltUp();
                }
                api.start({ x: mx, y: my });
            },
            // onPointerDown: handleTapToMove
        }, {
            drag: {
                threshold: 10,
                filterTaps: true
            }
        }
    );

    return (
        <>
            <Box sx={{ background: '#d3d3d3', minHeight: '100vh', p: 3 }}
                onClick={handleTapToMove}
                ref={boxRef}
            >
                <Button onClick={handleZoomIn}>Zoom In</Button>
                <Button onClick={handleZoomOut}>Zoom Out</Button>
                <animated.div {...gestureRecognizer()} style={{ touchAction: 'none', width: '100%', height: '100vh', background: '#f0f0f0' }}>
                    {/* Swipe left or right to pan, up or down to tilt */}
                </animated.div>

            </Box>
        </>
    )
};