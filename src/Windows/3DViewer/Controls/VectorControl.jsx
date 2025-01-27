import DownArrow from "../../../assets/DownArrow.svg";
import IntegerControl from "./IntegerControl.jsx";
import InputManager from "../InputManager.jsx";
import './Controls.css'



const VectorControl = ({ object, k, collapseItem, subname, selectObject, selectedObject }) => {
    return (
        <div className='vector-item'>
            <div className="vector-header" onClick={() => { collapseItem(subname + '-' + k) }}>
                <label htmlFor="range">{k === "children" ? subname : k}</label>
                <img key={subname + '-' + k} caller-id={subname + '-' + k} src={DownArrow} alt="Collapse/Expand" />
            </div>
            <div control-id={subname + '-' + k} className="vector-controls collapsed">
                {object[k] &&
                    Object.keys(object[k]).map((key, index) => {
                        if (key && object[k]) {
                            switch (object[k].constructor.name) {
                                case "Array": {
                                    return (<InputManager key={key} object={object[k][key]} k={null} collapseItem={collapseItem} selectObject={selectObject} selectedObject={selectedObject} />);
                                }
                                case "Euler": {
                                    return (<InputManager key={key} object={object[k]} k={key} />)
                                }
                                case "Color": {
                                    return (<InputManager key={key} object={object[k]} k={key} />)
                                }
                                case "Matrix4": {
                                    let returns = [];
                                    object[k].elements.map((key, index) => {
                                        returns.push(<IntegerControl key={k + key + index} object={object[k].elements} k={index} />)
                                        return 0;
                                    })
                                    return (returns);
                                }
                                case "Vector3": {
                                    return (<InputManager key={key} object={object[k]} k={key} />)
                                }
                                default:
                                    break;
                            }
                        }
                        return 0;
                    })
                }
            </div>
        </div>
    );
}

export default VectorControl;