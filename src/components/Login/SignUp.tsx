import React, { useState } from 'react';
import { IonButton, IonCheckbox, IonIcon, IonInput, IonItem, IonLabel } from '@ionic/react';
import { call, lockClosed, mail, person } from 'ionicons/icons';

import './index.css';

const  SignUp:React.FC<any> = ({routerFunction, fowardOnsubmit}) => {
    const initialvalues:any = {in_Firstname:"", in_Lastname:"", in_Phone:"", in_Email:"", in_Password:"", in_PasswordRepeat:""};

    const [formValues, setFormValues] = useState(initialvalues);

    const handleChange = (e: any) =>{
        const{name,value} = e.target;
        setFormValues({...formValues, [name]:value});
    }

    return (
        <div className="topDiv">
            <br/>
            <form  method="POST" action="api/authentication?logIn=0&mod=1" onSubmit={fowardOnsubmit}>
                <input type="hidden" name="in_App" defaultValue="videos" />
                <input type="hidden" name="type" defaultValue="register" />
                <IonItem className="ionMyItem">
                    <IonLabel position="floating" className="theLabel" >First name</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={person} />
                    <IonInput onInput={handleChange} name="in_Firstname" type="text" className="theInput" required />
                </IonItem>
                <IonItem className="ionMyItem">
                    <IonLabel position="floating" className="theLabel" >Last name</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={person} />
                    <IonInput onInput={handleChange} name="in_Lastname" type="text" className="theInput" required />
                </IonItem>
                <IonItem className="ionMyItem">
                    <IonLabel position="floating" className="theLabel" >Phone</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={call} />
                    <IonInput onInput={handleChange} name="in_Phone" type="tel" className="theInput" required />
                </IonItem>
                <IonItem className="ionMyItem">
                    <IonLabel position="floating" className="theLabel" >Email</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={mail} />
                    <IonInput onInput={handleChange} name="in_Email" type="email" className="theInput" required />
                </IonItem>
                <IonItem className="ionMyItem">
                    <IonLabel position="floating" className="theLabel" >Create Password</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={lockClosed} />
                    <IonInput onInput={handleChange} name="in_Password" type="password" className="theInput" required />
                </IonItem>
                <IonItem className="ionMyItem">
                    <IonLabel position="floating" className="theLabel" >Repeat password</IonLabel>
                    <IonIcon mode='ios' className="iconPart" icon={lockClosed} />
                    <IonInput onInput={handleChange} name="in_PasswordRepeat" type="password" className="theInput" required />
                </IonItem>
                <IonItem>
                    <IonCheckbox slot="start" />
                    <label className='termsLabel'>I accept the <span className='mySpan'>Terms</span> and <span className='mySpan'>Privacy policy</span>.</label>
                </IonItem>
                <br/>
                <br/>
                <IonButton mode='ios' expand="block" type="submit" className="ion-activatable ripple-parent subButton">Register</IonButton>
            </form>
            <br/>
            <div className="myButtons">                                            
                <p className="myForgot" onClick={()=>routerFunction('login')}>Already have an account?  <span className='mySpan'> Login.</span></p>           
            </div>
        </div>
    );
}

export default SignUp;