import { Box, Button, Typography } from "@mui/material"
import React from "react"
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
// import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeSlider from "./VolumeSlider"

const MediaControls = () => {

    return (
        <Box sx={{ position: 'relative', height: 300, width: 300 }}>

            <Box className="media-controls"
                sx={{
                    display: "flex",
                    alignContent: 'center',
                    justifyContent: 'space-evenly',
                    backgroundColor: '#323233',
                    height: '100%',
                    borderRadius: '30px',
                    backdropFilter: 'blur(5px)',
                }}
                outline='none'
            >
                {/* Buttons */}
                <Box className="buttons"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: 'space-evenly'
                    }}
                    outline='none'
                >
                    <Button variant="contained"
                        sx={{
                            width: '115px',
                            height: '115px',
                            borderRadius: '30%',
                            backgroundColor: 'hsl(145, 63%, 49%)'
                        }}
                        outline='none'
                    >
                        <LocalPhoneIcon sx={{ fontSize: '50px' }} />
                    </Button>
                    <Button variant="contained"
                        sx={{
                            width: '115px',
                            height: '115px',
                            borderRadius: '30%',
                            backgroundColor: 'hsl(204, 8%, 76%)'
                        }}
                        outline='none'
                    >
                        <MicOffIcon sx={{ fontSize: '50px' }} />
                    </Button>

                </Box>


                {/* Volume slider */}
                <Box 
                    sx={{
                        position: 'relative',
                        width: '115px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    outline='none'
                >
                    <Box sx={{
                        transform: 'rotate(270deg)',
                        position: 'absolute',
                        width: '254px', // This should match the slider's width after rotation
                        height: '115px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <VolumeSlider />
                    </Box>
                </Box>
            </Box>
        </Box>
    )

}

export default MediaControls