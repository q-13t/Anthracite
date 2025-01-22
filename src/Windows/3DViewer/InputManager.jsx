import { useState, useEffect } from "react";

const InputManager = () => {
    const [value, setValue] = useState(0);


    const handleChange = (event) => {
        console.log(event);

        setValue(Number(event.target.value));
    };

    const handleClick = (event) => {

        console.log(event);
    };

    const handleWheel = (event) => {
        console.log(event);
        setValue(Math.min(Math.max(value + (event.deltaY > 0 ? 1 : -1), -10), 10));
    };

    console.log("render");

    return (
        <div  >
            <input
                type="range"
                value={value}
                min={-10}
                max={10}
                onChange={(e) => handleChange(e)}
            />
            <input type="text" name="tes" id="test" defaultValue={value} onChange={(e) => handleChange(e)} />
            <p
                style={{ color: "white" }}
                onClick={(e) => console.log("click")}
            >
                Value: {parseInt(value)}
            </p>
        </div>
    );
}

export default InputManager;