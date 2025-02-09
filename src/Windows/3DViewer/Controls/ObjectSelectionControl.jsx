import TrashCan from "../../../assets/TrashCan.svg";
const ObjectSelectionControl = ({ object, selectObject, selectedObject }) => {

    const handleDeleteSelf = () => {
        if (object.parent.children.length === 1) {
            object.parent.parent.remove(object.parent);
        } else {
            object.parent.remove(object);
        }
        if (selectedObject === object) selectObject(null);
    }

    return (
        <div onClick={() => { selectObject(object) }} className={selectedObject === object ? "Selectable-Object-Container Selected-Object" : "Selectable-Object-Container Selectable-Object"}>
            <p >{object.name ? object.name : object.type}</p>
            <img src={TrashCan} onClick={handleDeleteSelf} className="Self-Delete-Object" />
        </div>
    );
}

export default ObjectSelectionControl;