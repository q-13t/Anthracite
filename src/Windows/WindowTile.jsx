import React from 'react';
import anthracite_svg from '../assets/Anthracite.svg';
import './WindowTile.css';
const WindowTile = ({ window: params, updateWindow }) => {

    const handleWindowUpdate = () => {
        params.visible = !params.visible;
        updateWindow(params.id, params);
    };

    return (
        <div className='Window-Tile' onClick={() => { handleWindowUpdate() }} style={{ backgroundColor: params.visible ? 'var(--highlight-color)' : 'var(--background-color)' }}>
            <img src={anthracite_svg} alt="" />
        </div>
    );
}

export default WindowTile;