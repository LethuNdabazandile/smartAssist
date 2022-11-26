import React, { useState } from 'react';
import { IonButton, IonIcon, IonInput, IonItem, IonLabel } from '@ionic/react';
import { person} from 'ionicons/icons';

import './index.css';

const  Forgot:React.FC<any> = ({username, ranKey, routerFunction, fowardOnsubmit}) => {
    const initialvalues:any = {in_AppimateID:""};
    const [formValues, setFormValues] = useState(initialvalues);

    const handleChange = (e: any) =>{
        const{name,value} = e.target;
        setFormValues({...formValues, [name]:value});
    }

    return (
        <div className="topDiv">
            <br/>
            <form method="POST" action="api/authentication?logIn=2&mod=2" onSubmit={fowardOnsubmit}>
                <input type="hidden" name="in_App" defaultValue="videos" />
                <input type="hidden" name="type" defaultValue="forgotPassword" />
                <input type="hidden" name="in_AppimateID" defaultValue={username} />
                <input type="hidden" name="ranKey" defaultValue={ranKey} />
                <IonItem mode='ios' className="ionMyItem">
                    <IonLabel mode='ios' position="floating" className="theLabel" >Email / Phone</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={person} />
                    <IonInput mode='ios' onInput={handleChange} name="in_AppimateID" type="text" className="theInput" required />
                </IonItem>
                <br/>
                <br/>
                <IonButton mode='ios' expand="block" type="submit" className="ion-activatable ripple-parent subButton">Submit</IonButton>
            </form>
            <br/>
            <br/>
            <br/>
            <div className="myButtons">   
                <p className="myForgot" onClick={()=>routerFunction('login')}>Remeber your password?  <span className='mySpan'> Sign in.</span></p>           
            </div>
        </div>
    );
}

export default Forgot;