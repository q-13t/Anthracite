import React from 'react';
import './WindowTile.css';
const WindowTile = ({ window: params, updateWindow, image }) => {

    const handleWindowUpdate = () => {
        params.visible = !params.visible;
        updateWindow(params.id, params);
    };

    return (
        <div className='Window-Tile' onClick={() => { handleWindowUpdate() }} style={{ backgroundColor: params.visible ? 'var(--highlight-color)' : 'var(--background-color)' }}>
            <img src={image} alt="" />
        </div>
    );
}

export default WindowTile;