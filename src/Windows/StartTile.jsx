import React from 'react';
import './StartTile.css';

const StartTile = ({ openWindow, boundTo, image }) => {

    const handleOpen = () => {
        openWindow(boundTo);
    };

    return (
        <div className='Start-Tile' onClick={() => { handleOpen() }}>
            <img src={image} alt="" />
        </div>
    );
}

export default StartTile;