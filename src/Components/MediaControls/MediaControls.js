import { Box, Button, Typography } from "@mui/material"
import React from "react"
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeSlider from "./VolumeSlider"

const MediaControls = () => {

    return (

        <Box className="media-controls"
            sx={{
                display: "flex",
                backgroundColor: '#323233',
                height: '100%',
                borderRadius: '20px',
                backdropFilter: 'blur(5px)',
            }}
        >
            {/* Buttons */}
            <Box className="buttons"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    margin: '10px',
                    justifyContent: 'space-evenly'
                }}
            >
                <Button variant="contained"
                    sx={{
                        width: '115px',
                        height: '115px',
                        borderRadius: '30%',
                        margin: '10px',
                        backgroundColor: 'hsl(145, 63%, 49%)'
                    }}
                >
                    <LocalPhoneIcon sx={{ fontSize: '50px' }} />
                </Button>
                <Button variant="contained"
                    sx={{
                        width: '115px',
                        height: '115px',
                        borderRadius: '30%',
                        margin: '10px',
                        backgroundColor: 'hsl(204, 8%, 76%)'
                    }}
                >
                    <MicOffIcon sx={{ fontSize: '50px' }} />
                </Button>

            </Box>


            {/* Volume slider */}
            <Box sx={{
                position: 'relative',
                width: '115px',
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Box sx={{
                    transform: 'rotate(270deg)',
                    position: 'absolute',
                    width: '400px', // This should match the slider's width after rotation
                    height: '115px', // This should match the slider's height after rotation
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <VolumeSlider />
                </Box>
            </Box>
        </Box>
    )

}

export default MediaControls