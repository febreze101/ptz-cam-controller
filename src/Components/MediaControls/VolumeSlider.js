import { useState } from "react";
import { Box } from "@mui/material";

import "./VolumeSlider.css"

const VolumeSlider = (props) => {

    const [volume, setVolume] = useState(50);
    const [isDragging, setIsDragging] = useState(false);

    const handleVolumeChange = (e) => {
        setVolume(e.target.value)
        console.log(volume);
    }

    const handleDragStart = (e) => {
        if (ondragstart) {
            console.log("dragstart");
        }
        setIsDragging(true)
    }

    const handleDragEnd = (e) => {
        if (ondragend) {
            console.log("dragend");
        }
        setIsDragging(false)
    }

    return (
        <div className="relative bg-white flex items-center mt-8" 
            style={{
                borderRadius: '30px',

                overflow: 'hidden'

            }} 
        >
            <input 
                type="range"
                min='0'
                max='max'
                value={volume}
                
                onChange={handleVolumeChange}
                // onMouseDown={handleDragStart}
                // onMouseUp={handleDragEnd}
                className="volume-slider"
                style={{
                    marginLeft: '10px',
                    marginTop: '50px',
                }}
                // orient="vertical"
            />
            <div style={{ 
                width: volume+"%",
            }} className="absolute h-full bg-blue-400 rounded">

            </div>
        </div>
    )
}

export default VolumeSlider;