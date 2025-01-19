
import hide_svg from '../assets/Hide.svg';
import Minimize_svg from '../assets/Minimize.svg';
import Maximize_svg from '../assets/Maximize.svg';
import Close_svg from '../assets/Close.svg';
import './CustomWindow.css';
import { useEffect, useState } from 'react';
import React from 'react';
import { Children } from 'react';

const CustomWindow = ({ window: properties, updateWindow, closeWindow, children }) => {
    let [state, setState] = useState(properties);
    let dragOffset = { x: 0, y: 0 };
    let dragging = false;


    useEffect(() => {
        setState(properties);
        let resizeObserver = new ResizeObserver((element) => {
            if (properties.maximized) return;
            properties.width = element[0].contentRect.width;
            properties.height = element[0].contentRect.height;
            properties.height_prev = element[0].contentRect.width;
            properties.width_prev = element[0].contentRect.height;
            setState({ ...state, width: element[0].contentRect.width, height: element[0].contentRect.height });
            updateWindow(properties.id, properties);
        });

        resizeObserver.observe(document.querySelector(`[window-id="${properties.id}"]`));
        return () => {
            resizeObserver.disconnect();
        };
    }, [properties]);

    const handleDragStart = (event) => {
        event.preventDefault();
        let offset_x = event.clientX - event.target.getBoundingClientRect().left;
        let offset_y = event.clientY - event.target.getBoundingClientRect().top;
        dragOffset = { x: offset_x, y: offset_y };
        // console.log(dragOffset);
        dragging = true;
        event.target.style.cursor = 'move';
        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', handleDragEnd);
    };

    const handleDrag = (event) => {
        if (!dragging) return;
        event.preventDefault();

        if (properties.maximized) {
            properties.maximized = false;
            let window_el = document.querySelector(`[window-id="${properties.id}"]`);
            window_el.style.width = properties.height_prev + 'px';
            window_el.style.height = properties.width_prev + 'px';
            document.querySelector(`[maximize-id="${properties.id}"]`).src = properties.maximized ? Minimize_svg : Maximize_svg;
        };
        window.cursor = 'move';

        let position_x = Math.min(Math.max(event.clientX - dragOffset.x, 0), document.body.clientWidth - properties.width);
        let position_y = Math.min(Math.max(event.clientY - dragOffset.y, 0), document.body.clientHeight - properties.height - 40);
        properties.x = position_x;
        properties.y = position_y;
        properties.x_prev = position_x;
        properties.y_prev = position_y;
        updateWindow(properties.id, properties);
    };

    const handleDragEnd = (event) => {
        dragging = false;
        event.target.style.cursor = 'default';
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
    };

    const handleMaximizeMinimize = () => {
        properties.visible = !properties.visible;
        updateWindow(properties.id, properties);
    };

    const handleWindowResizeClick = () => {
        properties.maximized = !properties.maximized;
        let window_el = document.querySelector(`[window-id="${properties.id}"]`);

        if (properties.maximized) {
            properties.x = 0;
            properties.y = 0;
            const container = document.getElementById('Window-Frames').getBoundingClientRect();
            window_el.style.width = (container.width - 10) + 'px';
            window_el.style.height = (container.height - 10) + 'px';

            properties.height_prev = properties.height;
            properties.width_prev = properties.width;
            properties.height = container.height - 10;
            properties.width = container.width - 10;
        } else {
            properties.x = properties.x_prev;
            properties.y = properties.y_prev;
            properties.height = properties.height_prev;
            properties.width = properties.width_prev;
            window_el.style.width = properties.width + 'px';
            window_el.style.height = properties.height + 'px';
        }
        setState(properties);
        updateWindow(properties.id, properties);
        document.querySelector(`[maximize-id="${properties.id}"]`).src = properties.maximized ? Minimize_svg : Maximize_svg;
        console.log(state, properties);
    }



    return (
        <div key={properties.id} window-id={properties.id} className='Window' style={{ left: properties.x, top: properties.y, visibility: properties.visible ? 'visible' : 'hidden', zIndex: properties.zIndex, width: properties.width + "px", height: properties.height + "px", maxWidth: document.getElementById('Window-Frames').clientWidth - 10 + "px", maxHeight: document.getElementById('Window-Frames').clientHeight - 10 + "px" }}>
            <div className='Window-Header' >
                <div className='Window-Title-Container' onDoubleClick={(event) => { handleWindowResizeClick() }} onMouseDown={(event) => { handleDragStart(event) }} onMouseMove={(event) => { handleDrag(event) }} onMouseUp={(event) => { handleDragEnd(event) }}>
                    <p className='Window-Title'>{properties.title}</p>
                </div>
                <div className='Window-Buttons'>
                    <img className='window-control' src={hide_svg} alt="hide/show" onClick={(e) => { handleMaximizeMinimize(e) }} />
                    <img maximize-id={properties.id} className='window-control' src={Maximize_svg} alt="minimize/maximize" onClick={() => { handleWindowResizeClick() }} />
                    <img className='window-control' src={Close_svg} alt="close" onClick={() => { closeWindow(properties.id) }} />
                </div>
            </div>
            <div className='Window-Content'>
                {
                    Children.map(children, child => child)
                }
            </div>
        </div>
    );
}

export default CustomWindow;