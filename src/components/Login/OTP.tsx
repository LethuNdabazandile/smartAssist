import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { IonBackButton, IonButton, IonCard, IonIcon, IonInput, IonItem, IonLabel } from '@ionic/react';
import { arrowBack, lockClosed} from 'ionicons/icons';
import { onDeviceStorage } from '../../services/Utils';
import './index.css';

const  OTP:React.FC<any> = ({routerFunction, username, otpResend, fowardOnsubmit}) => {
    const [innerUsername, setInnerUsername] = useState(username);
    let location = useLocation();
    var paramsString = location.search;

    var url = "api/authentication?logIn=3";
    const queryParams = new URLSearchParams(paramsString);
    if (queryParams.has("mod")) {
        url += "&mod="+queryParams.get("mod");
    } else {
        url += "&mod=0";
    };

    if ((username === "")||(username === " ")) {
        onDeviceStorage('get', 'username').then(res=>{
            setInnerUsername(res);
        });
    }
    return (
        <>
        {
            (innerUsername && innerUsername.length > 0)?(
                <div className="topDiv">
                    <br/>
                    <form method="POST" action={url} onSubmit={fowardOnsubmit}>
                        <input type="hidden" name="in_App" defaultValue="videos" />
                        <input type="hidden" name="type" defaultValue="otp" />
                        <input type="hidden" name="in_AppimateID" defaultValue={innerUsername} />
                        <IonItem mode='ios' className="ionMyItem">
                            <IonLabel mode='ios' position="floating" className="theLabel" >One time pin</IonLabel>
                            <IonIcon mode='ios' className="iconPart" icon={lockClosed} />
                            <IonInput mode='ios' name="in_OTP" type="number" className="theInput" required />
                        </IonItem>
                        <br/>
                        <br/>
                        <IonButton mode='ios' expand="block" type="submit" className="ion-activatable ripple-parent subButton">Submit</IonButton>
                    </form>
                    <br/>
                    <br/>
                    <br/>
                    <div className="myButtons">   
                        <p className="myForgot" onClick={otpResend}>Didn't recieve otp?  <span className='mySpan'> Resend</span></p> 
                        <br/>
                        {
                            (queryParams.get("mod") === '0')?(
                                ""
                            ):(
                                <p className="myForgot" onClick={()=>routerFunction('login')}>Back to sign in? <span className='mySpan'> Sign in.</span></p>
                            )
                        }      
                    </div>
                </div>
            ):(
                <>
                <IonCard>
                    <h1>
                        Username not captured.
                    </h1>
                    <IonBackButton defaultHref="/" text="Go Back   " icon={arrowBack} />
                </IonCard>
                </>
            )
        }
        </>
    );
}

export default OTP;