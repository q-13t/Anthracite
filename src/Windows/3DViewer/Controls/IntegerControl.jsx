import { useEffect, useState } from 'react';
import './Controls.css'
import { roundInt } from '../../../utils';

let interval = null;

const IntegerControl = ({ object, k }) => {
    if (typeof k === "string" && k.includes("_")) {
        k = k.split("_")[1];
    }

    const [value, setValue] = useState(roundInt(object[k] || 0));

    useEffect(() => {
        setValue(roundInt(object[k] || 0));
        return () => {

        };
    }, [object[k], k, object]);



    const handleValueChange = (event) => {
        object[k] = Number(event.target.value);
    }

    const resetRange = (event) => {
        event.target.value = 0;
        clearInterval(interval);
    }

    const handleRangeChange = (event) => {
        interval = setInterval(() => {
            let temp = roundInt(0.01 * event.target.value);
            object[k] = object[k] + temp;
            setValue(object[k] + temp);
        }, 50);
    }

    const handleWheel = (event) => {
        event.stopPropagation();
        let temp = roundInt((event.deltaY / 10) * 0.1);
        object[k] = object[k] + temp;
        setValue(object[k] + temp);
    }


    return (
        <div className='control-item'>
            <label>{k}</label>
            <input type="range" onMouseUp={(e) => { resetRange(e) }} defaultValue={0} min={-10} max={10} onMouseDown={(e) => { handleRangeChange(e) }} />
            <input type="number" value={value} onChange={(e) => { handleValueChange(e) }} onWheel={(e) => { handleWheel(e) }} />
        </div>
    );
}

export default IntegerControl;