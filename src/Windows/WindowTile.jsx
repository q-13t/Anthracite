import React from 'react';
import anthracite_svg from '../assets/Anthracite.svg';
import './WindowTile.css';
const WindowTile = ({ window, updateWindow }) => {

    const handleWindowUpdate = () => {
        window.visible = !window.visible;
        updateWindow(window.id, window);
    };

    return (
        <div className='Window-Tile' onClick={() => { handleWindowUpdate() }} style={{ backgroundColor: window.visible ? 'var(--highlight-color)' : 'var(--background-color)' }}>
            <img src={anthracite_svg} alt="" />
        </div>
    );
}

export default WindowTile;