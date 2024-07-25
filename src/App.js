import './App.css';
import MediaControls from './Components/MediaControls/MediaControls';
import PtzController from './Components/ptz-cam/ptz_controller';
import { Box } from '@mui/material';

function App() {
  return (
    <div className="App">
      {/* <PtzController /> */}
      <Box sx={{ border: '1px solid red', height: 300, width: 300 }}>
        <MediaControls />
      </Box>
    </div>
  );
}

export default App;
