import React from 'react';
import anthracite_svg from '../assets/Anthracite.svg';
import notes_svg from '../assets/Notes.svg';
import WindowsParams from './WindowParams.ts';
import CustomWindow from './CustomWindow.jsx';
import WindowTile from './WindowTile.jsx';
import StartTile from './StartTile.jsx';
import './WindowManager.css';
import ThreeDViewer from './3DViewer/3DViewer.jsx';
import NoteTaker from './NoteTaker/NoteTaker.jsx';

export default class WindowManager extends React.Component {

    constructor(props) {
        super(props);
        this.windowId = 0;
        this.z_index = 0;
        this.startPaneState = 0;
        this.Windows = [];
    }

    updateZIndexes(e) {
        if (document.getElementById('Start-Button').contains(e.target) || document.getElementById('Start-Button-img').contains(e.target)) {
            return;
        } else if (!document.getElementById('Start-Pane').contains(e.target) && this.startPaneState === 1) {
            this.StartPaneToggle();
        };
        let intersected = this.Windows.filter(w => w.params.x <= e.clientX && w.params.x + w.params.width >= e.clientX && w.params.y <= e.clientY && w.params.y + w.params.height >= e.clientY);
        if (intersected.length == 0) {
            return;
        } else if (intersected instanceof Array && intersected.length > 1) {
            intersected = intersected.sort((a, b) => b.params.zIndex - a.params.zIndex)[0];
        } else {
            intersected = intersected[0];
        }
        intersected.params.zIndex = this.z_index++;
        this.forceUpdate();
    }

    componentDidMount() {
        window.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                this.updateZIndexes(e);
            }
        }, true);
    }
    componentWillUnmount() {
        window.removeEventListener('click', this.updateZIndexes);
    }

    updateWindow(id, window) {
        let w = this.Windows.find(w => w.params.id === id);
        w.params.height = window.height;
        w.params.width = window.width;
        w.params.maximized = window.maximized;
        w.params.x = window.x;
        w.params.y = window.y;
        w.params.x_prev = window.x_prev;
        w.params.y_prev = window.y_prev;
        w.params.title = window.title;
        w.params.zIndex = window.zIndex;
        this.forceUpdate();
    }

    closeWindow(id) {
        this.Windows = this.Windows.filter(w => w.params.id !== id);
        this.forceUpdate();
    }

    openWindow(windowType) {
        switch (windowType) {
            case "Editor": {
                this.Windows.push({
                    params: new WindowsParams(this.windowId, 'Editor', 0, 0, 1024, 720, this.z_index++),
                    child: <ThreeDViewer id={this.windowId} />,
                    image: anthracite_svg
                });
                this.windowId++;
                break;
            } case "Notes": {
                this.Windows.push({
                    params: new WindowsParams(this.windowId, 'Notes', 0, 0, 1024, 720, this.z_index++),
                    child: <NoteTaker id={this.windowId} />,
                    image: notes_svg
                });
                this.windowId++;
                break;
            }
            default:
                break;
        }
        this.StartPaneToggle();
        this.forceUpdate();
    }

    StartPaneToggle() {
        let pane = document.getElementById('Start-Pane');
        if (this.startPaneState === 0) {//pane is hidden -> open it
            pane.style.bottom = '6%'
        } else { //pane is open -> close it
            pane.style.bottom = '-100%'
        }
        this.startPaneState = this.startPaneState === 0 ? 1 : 0;
    }

    render() {
        return (
            <div className='Window-Container'>
                <div id='Window-Frames' className='Window-Frames'>
                    {
                        this.Windows.map((data) => {
                            return (
                                <CustomWindow key={`Window-` + data.params.id} window={data.params} updateWindow={this.updateWindow.bind(this)} closeWindow={this.closeWindow.bind(this)} >
                                    {data.child}
                                </CustomWindow>
                            );
                        })
                    }
                </div>
                <div className='Navigation-Buttons'>
                    <div id='Start-Pane' className='Start-Pane'>
                        <div className='Start-Pane-Container'>
                            <StartTile openWindow={this.openWindow.bind(this)} boundTo={"Editor"} image={anthracite_svg} />
                            <StartTile openWindow={this.openWindow.bind(this)} boundTo={"Notes"} image={notes_svg} />
                        </div>
                    </div>
                    <div id="Start-Button" className='Start-Button Tile-container' onClick={() => { this.StartPaneToggle() }}>
                        <img id="Start-Button-img" src={anthracite_svg} alt="" />
                    </div>

                    <div className='Window-Tiles Tile-container'>
                        {
                            this.Windows.map((data) => {
                                return (
                                    <WindowTile key={`Tile-` + data.params.id} image={data.image} window={data.params} updateWindow={this.updateWindow.bind(this)} />
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}