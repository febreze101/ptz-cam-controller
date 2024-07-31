import { Height, WidthFull } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";

const lerpColor = (color1, color2, factor) => {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i])); 
    }
    return `rgb(${result.join(',')})`;
}

const SwipeButton = () => {
    const MIN_BUTTON_POSITION = 8;
    const MAX_BUTTON_POSITION = 268;
    const MIN_TEXT_POSITION = 134;

    const [buttonPosition, setButtonPosition] = useState(MIN_BUTTON_POSITION);
    const [textPosition, setTextPosition] = useState(MIN_TEXT_POSITION);
    const [isDragging, setIsDragging] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#0D1116');
    const [actionComplete, setActionComplete] = useState(false);
    const [actionText, setActionText] = useState("Home Tools")
    
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const textRef = useRef(null);
    
  
    const handleTouchStart = (e) => {
        setIsDragging(true);
    }

    const handleTouchEnd = (e) => {
        setIsDragging(false);
        if (buttonPosition > MAX_BUTTON_POSITION / 2) {
            setButtonPosition(MAX_BUTTON_POSITION)
            // additional functionality
            // todo: change text and change icon
            setActionComplete(true);
            
        } else {
            setButtonPosition(MIN_BUTTON_POSITION)
            setBackgroundColor('#0D1116')
        }
    }

    // change background color
    useEffect(() => {
        const startColor = [13, 17, 22]; // #0D1116
        const endColor = [22, 101, 55]; // #9FD491
        const t = buttonPosition / MAX_BUTTON_POSITION
        if (buttonPosition > MIN_BUTTON_POSITION) {
            const newColor = lerpColor(startColor, endColor, t)
            setBackgroundColor(newColor);
        }
    }, [buttonPosition])


    // change text
    useEffect(() => {
        if (actionComplete) {
            console.log(actionComplete);
            setActionText("Homing")
        }
    }, [buttonPosition])

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const containerwidth = containerRef.current.offsetWidth;
        const buttonWidth = buttonRef.current.offsetWidth;
        // const textWidth = textRef.current 
        const maxPosition = containerwidth - buttonWidth - 8;
        const touch = e.touches[0];
        const newButtonPosition = Math.max(MIN_BUTTON_POSITION, Math.min(touch.clientX - containerRef.current.offsetLeft - buttonWidth / 2, maxPosition))
        const newTextPosition = Math.max(MIN_TEXT_POSITION, Math.min( - textRef.current.offsetLeft - buttonWidth / 2, 900));
        setButtonPosition(newButtonPosition);
        setTextPosition(newTextPosition);
    }

    useEffect(() => {
        const container = containerRef.current;
        

        container.addEventListener('touchstart', handleTouchStart, {passive: true});
        container.addEventListener('touchmove', handleTouchMove, {passive: true});
        container.addEventListener('touchend', handleTouchEnd)

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging]);


    return (
        <>
            <Box 
                ref={containerRef}
                id="'swipe-container'"
                style={{
                    position: 'relative',
                    height: '96px',
                    width: '336px',
                    backgroundColor: backgroundColor,
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    transition: 'background-color 0.3s ease',
                }}
            >
                <Box
                    ref={buttonRef}
                    id='swipe-buttn'
                    style={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '80px',
                        width: '80px',
                        backgroundColor: '#202D3A',
                        borderRadius: '24px',
                        left: `${buttonPosition}px`,
                        transition: isDragging ? 'none' : 'left 0.3s ease-out'
                    }}
                >
                    {/* arrow icon */}
                    <ArrowForwardIcon sx={{ color: 'white', fontSize: '56px'}}/>

                </Box>
                    <Typography 
                        position={"absolute"}
                        ref={textRef}
                        color={"white"} 
                        fontSize={24} 
                        fontWeight={'bold'}
                        style={{
                            left: `${textPosition}px`,
                        }}
                    > 
                        {actionText}
                    </Typography>
            </Box>
        
        
        </>

    )
}


export default SwipeButton;