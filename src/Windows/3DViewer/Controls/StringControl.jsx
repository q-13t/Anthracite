import { useEffect, useState } from 'react';
import './Controls.css'

const StringControl = ({ object, k }) => {
    const [value, setValue] = useState(object[k] || "");

    useEffect(() => {
        setValue(object[k] || "");
        return () => {

        };
    }, [object[k]]);

    const handleValueChange = (event) => {
        object[k] = event.target.value;
        setValue(event.target.value);
    }

    return (
        <div className='control-item'>
            <label>{k}</label>
            <input type="text" value={value} onChange={e => { handleValueChange(e); }} />
        </div>
    );
}

export default StringControl;