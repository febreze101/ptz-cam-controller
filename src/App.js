import './App.css';
import MediaControls from './Components/MediaControls/MediaControls';
import PtzController from './Components/ptz-cam/ptz_controller';
import { Box } from '@mui/material';
import SwipeConfirmButton from './Components/SwipeConfirmation/SwipeConfirmButton'
import SwipeButton from './Components/SwipeButton/SwipeButton';
import { Margin } from '@mui/icons-material';
import VolumeSlider from './Components/MediaControls/VolumeSlider';
import MysteriousText from './Components/TextAnimations/MysteriousText';

function App() {
  return (
    <div className="App">
      <div style={{ marginTop: '25px', marginLeft: '25px', width: '500px' }}>
        <SwipeButton />

        <MysteriousText>
          Lorem ipsum etcertera
        </MysteriousText>
        
        {/* <VolumeSlider /> */}
      </div>
      {/* <SwipeConfirmButton /> */}
        {/* <MediaControls /> */}
    </div>
  );
}

export default App;
