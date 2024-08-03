import { Height, WidthFull } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

const lerpColor = (color1, color2, factor) => {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return `rgb(${result.join(',')})`;
}

const SwipeButton = ({ startText, completeText }) => {
    const MIN_BUTTON_POSITION = 8;
    const MAX_BUTTON_POSITION = 248;
    const CONTAINER_WIDTH = 336;

    const [buttonPosition, setButtonPosition] = useState(MIN_BUTTON_POSITION);
    const [isDragging, setIsDragging] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#0D1116');
    const [actionComplete, setActionComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const textRef = useRef(null);
    const currButtonPosRef = useRef(null);


    const handleTouchStart = (e) => {
        if (!isLoading) {
            const touch = e.touches[0];
            const buttonRect = buttonRef.current.getBoundingClientRect();

            if (touch.clientX >= buttonRect.left && touch.clientX <= buttonRect.right &&
                touch.clientY >= buttonRect.top && touch.clientY <= buttonRect.bottom) {
                setIsDragging(true);
                currButtonPosRef.current = buttonPosition;
            }
        }
    }

    const handleTouchEnd = (e) => {
        setIsDragging(false);
        if (currButtonPosRef.current > MAX_BUTTON_POSITION * 0.9 && isDragging) {
            setButtonPosition(MAX_BUTTON_POSITION);
            setActionComplete(true); // action completed
            setIsLoading(true);
        } else {
            setIsLoading(false);
            setButtonPosition(MIN_BUTTON_POSITION);
            setBackgroundColor('#0D1116');
        }
    }

    const handleTouchMove = (e) => {
        if (!isDragging || isLoading) return;
        const containerwidth = containerRef.current.offsetWidth;
        const buttonWidth = buttonRef.current.offsetWidth;
        const maxPosition = containerwidth - buttonWidth - 8;
        const touch = e.touches[0];
        const newButtonPosition = Math.max(MIN_BUTTON_POSITION, Math.min(touch.clientX - containerRef.current.offsetLeft - buttonWidth / 2, maxPosition))
        currButtonPosRef.current = newButtonPosition;
        setButtonPosition(newButtonPosition);
    }

    const resetButton = () => {
        setButtonPosition(MIN_BUTTON_POSITION);
        setActionComplete(false);
        setBackgroundColor('#0D1116')
        setIsLoading(false)
    }

    // handle loading
    useEffect(() => {
        let timer;
        if (isLoading) {
            timer = setTimeout(() => {
                resetButton();
            }, 2000)
        }
        return () => {
            clearTimeout(timer)
        };
    }, [isLoading])

    // change background color
    useEffect(() => {
        const startColor = [13, 17, 22]; // #0D1116
        const endColor = [32, 45, 58]; // #202D3A
        const t = buttonPosition / MAX_BUTTON_POSITION
        if (buttonPosition > MIN_BUTTON_POSITION) {
            const newColor = lerpColor(startColor, endColor, t)
            setBackgroundColor(newColor);
        }
    }, [buttonPosition])

    useEffect(() => {
        const container = containerRef.current;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: true });
        container.addEventListener('touchend', handleTouchEnd)

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, isLoading]);

    const textPosition = CONTAINER_WIDTH / 2 + (buttonPosition - MIN_BUTTON_POSITION);

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
                <Typography
                    position={"absolute"}
                    ref={textRef}
                    color={"white"}
                    fontSize={24}
                    fontWeight={'bold'}
                    style={{
                        left: `${buttonPosition - 182}px`,
                        transition: isDragging ? 'none' : 'left 0.3s ease-out',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {completeText ? completeText : 'Homing'}
                </Typography>
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
                    {isLoading ? (

                        <CircularProgress color="success" />
                    ) : (
                        <KeyboardDoubleArrowRightIcon sx={{ color: 'white', fontSize: '56px' }} />
                    )}

                </Box>
                <Typography
                    position={"absolute"}
                    ref={textRef}
                    color={"white"}
                    fontSize={24}
                    fontWeight={'bold'}
                    style={{
                        left: `${textPosition}px`,
                        transition: isDragging ? 'none' : 'left 0.3s ease-out',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {startText ? startText : 'Home Tools'}
                </Typography>
            </Box>
        </>
    )
}


export default SwipeButton;