
import hide_svg from '../assets/Hide.svg';
import Minimize_svg from '../assets/Minimize.svg';
import Maximize_svg from '../assets/Maximize.svg';
import Close_svg from '../assets/Close.svg';
import './CustomWindow.css';
import { useEffect, useState } from 'react';
import React from 'react';
import { Children } from 'react';

const CustomWindow = ({ window, updateWindow, closeWindow, children }) => {
    let [state, setState] = useState(window);
    // console.log(Children.map(children, child => child));

    useEffect(() => {
        setState(window);
        let resizeObserver = new ResizeObserver((element) => {
            if (window.maximized) return;
            window.width = element[0].contentRect.width;
            window.height = element[0].contentRect.height;
            updateWindow(window.id, window);

        });


        resizeObserver.observe(document.querySelector(`[window-id="${window.id}"]`));
        return () => {
            resizeObserver.disconnect();
        };
    }, [window]);

    const handleDrag = (event) => {
        event.preventDefault();
        if (window.maximized) {
            window.maximized = false;
            let window_el = document.querySelector(`[window-id="${window.id}"]`);
            window_el.style.width = window.width + 'px';
            window_el.style.height = window.height + 'px';
            document.querySelector(`[maximize-id="${window.id}"]`).src = window.maximized ? Minimize_svg : Maximize_svg;
        };
        window.cursor = 'move';

        // FIX: Non preserved position of cursor within window on drag
        setState({ ...state, x: event.clientX, y: event.clientY, x_prev: event.clientX, y_prev: event.clientY });
        updateWindow(window.id, state);
    };

    const handleMaximizeMinimize = () => {
        window.visible = !window.visible;
        updateWindow(window.id, window);
    };

    const handleWindowResizeClick = () => {
        window.maximized = !window.maximized;
        let window_el = document.querySelector(`[window-id="${window.id}"]`);

        if (window.maximized) {
            window.x = 0;
            window.y = 0;
            const container = document.getElementById('Window-Frames').getBoundingClientRect();
            window_el.style.width = (container.width - 10) + 'px';
            window_el.style.height = (container.height - 10) + 'px';

            window.height_prev = window.height;
            window.width_prev = window.width;
            window.height = container.height - 10;
            window.width = container.width - 10;
        } else {
            window.x = window.x_prev;
            window.y = window.y_prev;
            window.height = window.height_prev;
            window.width = window.width_prev;
            window_el.style.width = window.width + 'px';
            window_el.style.height = window.height + 'px';
        }
        updateWindow(window.id, window);
        // Update the image for the maximize button
        document.querySelector(`[maximize-id="${window.id}"]`).src = window.maximized ? Minimize_svg : Maximize_svg;
    }



    return (
        <div key={window.id} window-id={window.id} className='Window' style={{ left: window.x, top: window.y, visibility: window.visible ? 'visible' : 'hidden', zIndex: window.zIndex, width: window.width + "px", height: window.height + "px" }}>
            <div className='Window-Header' draggable onDrag={(event) => { handleDrag(event) }}>
                <p className='Window-Title'>{window.title}</p>
                <div className='Window-Buttons'>
                    <img className='window-control' src={hide_svg} alt="hide/show" onClick={(e) => { handleMaximizeMinimize(e) }} />
                    <img maximize-id={window.id} className='window-control' src={Maximize_svg} alt="minimize/maximize" onClick={() => { handleWindowResizeClick() }} />
                    <img className='window-control' src={Close_svg} alt="close" onClick={() => { closeWindow(window.id) }} />
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