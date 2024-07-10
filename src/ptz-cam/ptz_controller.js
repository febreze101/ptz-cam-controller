import useWebSocket from "react-use-websocket"
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import React, {useState} from "react";
import { Button } from "@mui/material";
import Box from '@mui/material/Box';
import { useGesture, dragAction, pinchAction, createUseGesture, useDrag } from "@use-gesture/react";


export default function PtzController() {
    const panRange = 648000;
    const panIncrements = panRange / 180;
    const [panPosition, setPanPosition] = useState(0);
    
    const tiltRange = 324000;
    const tiltIncrements = tiltRange / 90;
    const [tiltPosition, setTiltPosition] = useState(0);


    const zoomMin = 1;
    const zoomMax = 100; 
    const [zoomDistance, setZoomDistance] = useState(0);
    

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
        const newTiltPosition = Math.max(tiltPosition - tiltIncrements, -tiltRange / 2);
        setTiltPosition(newTiltPosition);
        sendJsonMessage({ tilt_absolute: newTiltPosition });
        console.log(`action 'tilt-down'; position: ${newTiltPosition}`);
    };
    
    // Handle tilting up
    const handleTiltUp = () => {
        const newTiltPosition = Math.max(tiltPosition + tiltIncrements, 0);
        setTiltPosition(newTiltPosition);
        sendJsonMessage({ tilt_absolute: newTiltPosition });
        console.log(`action 'tilt-up'; position: ${newTiltPosition}`);
    };

    // Handle panning left
    const handlePanLeft = () => {
        const newPanPosition = Math.max(panPosition - panIncrements, 0);
        setPanPosition(newPanPosition);
        sendJsonMessage({ pan_absolute: newPanPosition });
        console.log(`action 'pan-left'; position: ${newPanPosition}`);
    };

    // Handle panning right
    const handlePanRight = () => {
        const newPanPosition = Math.max(panPosition + panIncrements, 0);
        setPanPosition(newPanPosition);
        sendJsonMessage({ pan_absolute: newPanPosition });
        console.log(`action 'pan-right'; position: ${newPanPosition}`);
    };

    useGesture({
        onDrag: ({ event, offset: [x]})
    })

    // Controls to pass to the transformComponent
    const Controls = () => {
        const { zoomIn, zoomOut, resetTransform } = useControls();
        return (
          <>
            <Button onClick={handleZoomIn}>Zoom In</Button>
            <Button onClick={handleZoomOut}>Zoom Out</Button>
            <Button onClick={handleTiltUp} >Tilt Up</Button>
            <Button onClick={handleTiltDown}>Tilt Down</Button>
            <Button onClick={handlePanRight}>Pan Right</Button>
            <Button onClick={handlePanLeft}>Pan left</Button>
            <Button onClick={() => resetTransform()}>Reset</Button>
          </>
        );
    };

    return (
        <>
            <Box sx={{ background: '#d3d3d3', minHeight: '100vh', p: 3 }}>
                <TransformWrapper>
                    <TransformComponent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>

                            <div style={{ width: "500px", height: "500px", background: "#f0f0f0" }}>
                                
                            </div>
                            <Controls />
                        </Box>
                    </TransformComponent>
                </TransformWrapper>
            </Box>
        </>
    )
};