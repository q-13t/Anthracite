const ObjectSelectionControl = ({ object, selectObject, selectedObject }) => {
    return (
        <p onClick={() => { selectObject(object) }} className={selectedObject === object ? "Selected-Object" : "Selectable-Object"}>{object.name ? object.name : object.type}</p>
    );
}

export default ObjectSelectionControl;