import { useState } from "react";
import { Box } from "@mui/material";

import "./VolumeSlider.css"

const VolumeSlider = (props) => {

    const [volume, setVolume] = useState(50);

    const handleVolumeChange = (e) => {
        setVolume(e.target.value)
        console.log(volume);
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
                className="volume-slider"
                style={{
                    marginLeft: '10px',
                }}
            />
            <div style={{
                width: volume + "%",
            }} className="absolute h-full bg-blue-400 rounded">

            </div>
        </div>
    )
}

export default VolumeSlider;