import { useState } from 'react';

import { IonIcon } from '@ionic/react';
import { paperPlane } from 'ionicons/icons';
import { textAreaAdjust } from '../../services/Utils';


import './index.css';
const AskField:React.FC<any> = ({onClickHandler, options})=>{

    const [text, setText] = useState("");

    const handleSubmit = (e:any)=>{
        onClickHandler(e, text);
        setText("");
    }
    return (
        <>
        <br/>
        <br/>
        <br/>
        <div className='requestCenterSectionInputs'>
            <div className="requestCenterInput">
                <textarea 
                    value={text}
                    placeholder='write your question...'
                    className="requestCenterInputField"
                    onChange={
                        e => {
                            setText(e.target.value!);
                            textAreaAdjust(e.target);
                        }
                    }
                />
            </div>
            <button className="requestCenterSend" onClick={handleSubmit}>
                <IonIcon 
                icon={paperPlane}
                className="requestCenterSendIcon"
                />
            </button>
        </div>
        </>
    )
}
export default AskField;