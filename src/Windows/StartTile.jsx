import React from 'react';
import anthracite_svg from '../assets/Anthracite.svg';
import './StartTile.css';

const StartTile = ({ openWindow, boundTo }) => {

    const handleOpen = () => {
        openWindow(boundTo);
    };

    return (
        <div className='Start-Tile' onClick={() => { handleOpen() }}>
            <img src={anthracite_svg} alt="" />
        </div>
    );
}

export default StartTile;