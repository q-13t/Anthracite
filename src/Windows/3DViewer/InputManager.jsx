import BoolControl from "./Controls/BoolControl";
import IntegerControl from "./Controls/IntegerControl";
import ObjectSelectionControl from "./Controls/ObjectSelectionControl";
import StringControl from "./Controls/StringControl";
import VectorControl from "./Controls/VectorControl";

const InputManager = ({ object, k, collapseItem, selectObject, selectedObject }) => {
    const renderComponent = () => {

        if (object !== null && k === null) {
            if (object.type === "Group") {
                return (<VectorControl object={object} k={'children'} collapseItem={collapseItem} subname={object.name ? object.name : object.constructor.name} selectObject={selectObject} selectedObject={selectedObject} />)
            } else if (object.type === "GridHelper" || object.type === "AmbientLight" || object.type === "DirectionalLight" || object.type === "DirectionalLightHelper" || object.type === "Mesh") {
                return (<ObjectSelectionControl object={object} selectObject={selectObject} selectedObject={selectedObject} />)
            }
        } else if (object === undefined && k === undefined) { return; }

        switch (typeof object[k]) {
            case "boolean":
                return (<BoolControl object={object} k={k} />);

            case "number":
                return (<IntegerControl object={object} k={k} />);

            case "string":
                return (<StringControl object={object} k={k} />);

            case "object":
                if (object[k] !== null) {
                    if (object[k].constructor.name === "Euler" || object[k].constructor.name === "Matrix4" || object[k].constructor.name === "Vector3" || object[k].constructor.name === "Color") {
                        return (<VectorControl object={object} k={k} collapseItem={collapseItem} subname={object.constructor.name} />);
                    }
                }
                break;


            default:
                break;
        }
    }

    return (
        renderComponent()
    );
}

export default InputManager;