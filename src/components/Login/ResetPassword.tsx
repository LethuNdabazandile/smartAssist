import React, { useState } from 'react';
import { IonButton, IonIcon, IonInput, IonItem, IonLabel } from '@ionic/react';
import { lockClosed,} from 'ionicons/icons';
import { onDeviceStorage } from '../../services/Utils';

import './index.css';

const  ResetPassword:React.FC<any> = ({ranKey, username, fowardOnsubmit}) => {
    const initialvalues:any = {in_Password:"", in_PasswordRepeat: ""};
    const [innerUsername, setInnerUsername] = useState(username);
    const [formValues, setFormValues] = useState(initialvalues);

    const handleChange = (e: any) =>{
        const{name,value} = e.target;
        setFormValues({...formValues, [name]:value});
    };
    if ((username === "")||(username === " ")) {
        onDeviceStorage('get', 'username').then(res=>{
            setInnerUsername(res);
        });
    };

    return (
        <div className="topDiv">
            <br/>
            <form method="POST" action="api/authentication?logIn=4&mod=0" onSubmit={fowardOnsubmit}>
                <input type="hidden" name="in_App" defaultValue="videos" />
                <input type="hidden" name="type" defaultValue="resetPassword" />
                <input type="hidden" name="in_AppimateID" defaultValue={innerUsername} />
                <input type="hidden" name="ranKey" defaultValue={ranKey} />
                <IonItem mode='ios' className="ionMyItem">
                    <IonLabel mode='ios' position="floating" className="theLabel" >Password</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={lockClosed} />
                    <IonInput mode='ios' name="in_Password" type="password" onInput={handleChange} className="theInput" required />
                </IonItem>
                <IonItem mode='ios'className="ionMyItem">
                    <IonLabel mode='ios' position="floating" className="theLabel" >Repeat password</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={lockClosed} />
                    <IonInput mode='ios' name="in_PasswordRepeat" type="password" onInput={handleChange} className="theInput" required />
                </IonItem>
                <br/>
                <br/>
                <IonButton mode='ios' expand="block" type="submit" className="ion-activatable ripple-parent subButton">Submit</IonButton>
            </form>
            <br/>
            <br/>
            <br/>
            <div className="myButtons">   
            </div>
        </div>
    );
}

export default ResetPassword;