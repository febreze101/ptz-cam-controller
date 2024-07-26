import { useState } from "react";
import { Box } from "@mui/material";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

import "./VolumeSlider.css"

const VolumeSlider = (props) => {

    const [volume, setVolume] = useState(50);

    const handleVolumeChange = (e) => {
        setVolume(e.target.value)
        console.log(volume);
    }

    return (
        <div className="relative bg-white flex items-center"
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
                outline='none'
                onChange={handleVolumeChange}
                className="volume-slider"
            />
            <div style={{
                width: volume + "%",
                transition: '0.5 ease'
            }} outline='none' className="absolute h-full bg-blue-400 rounded flex items-center">
                {
                    volume > 0 ? <VolumeUpIcon sx={{ transform: 'rotate(90deg)', fontSize: '50px', color: 'white', position: "absolute", margin: '10px' }} /> :
                        <VolumeOffIcon sx={{ transform: 'rotate(90deg)', fontSize: '50px', color: 'black', position: "absolute", margin: '10px', transition: '0.8 ease-in' }} className="absolute" />
                }
            </div>
        </div>
    )
}

export default VolumeSlider;