import { useEffect, useState } from 'react';
import './Controls.css'

const BoolControl = ({ object, k }) => {
    const [value, setValue] = useState(object[k] || false);

    useEffect(() => {
        setValue(object[k] || false);
        return () => {

        };
    }, [object[k], k, object]);

    const handleValueChange = () => {
        object[k] = !object[k];
        setValue(object[k]);
    }

    return (
        <div className='control-item'>
            <label >{k}</label>
            <input type="checkbox" checked={value} onChange={() => { handleValueChange() }} />
        </div>
    );
}

export default BoolControl;