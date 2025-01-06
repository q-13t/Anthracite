import './Main.css';
import React from 'react';
import BackgroundAnimationTiles from './BackgroundAnimationTiles/BackgroundAnimationTiles';
import WindowManager from './Windows/WindowManager';

const App = () => {

    return (
    <div className='App-Container'>
       <div className='Window-Master'>
         <WindowManager />
       </div>
        <BackgroundAnimationTiles />
    </div>
    );
}
 
export default App;