import React, { useState } from 'react'
import { IonButton, IonIcon, IonInput, IonItem, IonLabel } from '@ionic/react';
import { lockClosed, person } from 'ionicons/icons';


import './index.css';

const  SignIn:React.FC<any> = ({routerFunction, fowardOnsubmit}) => {
    const initialvalues:any = {in_AppimateID: "", in_Password:""};
    const [formValues, setFormValues] = useState(initialvalues);

    const handleChange = (e: any) =>{
        const{name,value} = e.target;
        setFormValues({...formValues, [name]:value});
    };

    return (
        <div className="topDiv">
            <br/>
            <form method="POST" action="api/authentication?logIn=1&mod=0" onSubmit={fowardOnsubmit}>
                <input type="hidden" name="in_App" defaultValue="videos" />
                <input type="hidden" name="type" defaultValue="login" />
                <IonItem className="ionMyItem" mode='ios'>
                    <IonLabel position="floating" className="theLabel" >Email / Phone</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={person} />
                    <IonInput name="in_AppimateID" type="text" onInput={handleChange} className="theInput" required />
                </IonItem>
                <IonItem className="ionMyItem" mode='ios'> 
                    <IonLabel position="floating" className="theLabel" >Password</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={lockClosed} />
                    <IonInput name="in_Password" type="password" onInput={handleChange} className="theInput" required />
                </IonItem>
                <br/>
                <br/>
                <IonButton mode='ios' expand="block" type="submit" className="ion-activatable ripple-parent subButton">Login</IonButton>
            </form>
            <br/>
            <br/>
            <br/>
            <div className="myButtons">                                            
                <p className="myForgot" onClick={()=>routerFunction('forgotPassword')}>Forgot password?  </p> 

                <p className="myForgot" onClick={()=>routerFunction('register')}>Don't have an account?  <span className='mySpan'> Register now.</span></p>           
            </div>
        </div>
    );
}

export default SignIn;