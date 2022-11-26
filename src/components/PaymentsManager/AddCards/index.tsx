import { useContext , useState } from "react";
import { IonIcon, IonCard, 
    IonButton, IonLoading, IonAlert, IonList, IonInput, 
    IonItem, IonLabel
} from "@ionic/react";
import { card } from "ionicons/icons";

import { AppContext } from "../../../contexts/AppContextProvider";
import { appAuthDomain, makeRequests, ShowAlertInterface } from "../../../services/Utils";

import './index.css';

const AddCards: React.FC<any> = ({firstModalRef, addCardCallback})=>{
    const { state } = useContext(AppContext);
    const [showLoadingState, setShowLoading] = useState({showLoadingMessage:'c...', showLoading: false});
    const [showAlertState, setShowAlert] = useState<ShowAlertInterface>({header: "", subHeader: "", message: "", buttons: [], showAlert: false});

    const addCard = (e:any)=>{
        e.preventDefault();
        var formDataJSON = new FormData(e.target);

        var requestObject = {
            method: "POST", 
            url: appAuthDomain("api/profile?appType=trans&action=addCard"),
            data: {
                formDataJSON,
            },
            headers:{
                "Content-Type": "multipart/form-data"
            }
        };
        setShowLoading({showLoading: true, showLoadingMessage: "Please wait... "});
        makeRequests(state, requestObject).then(response=>{
            setTimeout(() => {
                setShowLoading({...showLoadingState, showLoading: false});
                var buttonActions =[] 
                if (response.success) {
                    buttonActions = [
                        {
                            text: 'Okay',
                            handler: () => {
                                addCardCallback();
                            }
                        }
                    ];
                }else{
                    buttonActions = [
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary',
                            handler: () => {
                            }
                        },
                        {
                            text: 'Retry',
                            handler: () => {
                                addCard(e);
                            }
                        }
                    ];
                    
                }
                var alertStateVars = {...showAlertState, header: response.msg, subHeader: "", message: response.msg2, inputs:"", buttons: buttonActions};
                setShowAlert({...alertStateVars, showAlert: true});
            }, 200);
        })
    }
    
    return (
        <>
            <IonCard className="checkoutCard">
                <form onSubmit={addCard}>
                    <IonList>
                        <IonItem>
                            <IonLabel position="floating">Card Holder Names</IonLabel>
                            <IonInput name="cardHolder" placeholder="Firstname Lastname" required/>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="floating">Card Number</IonLabel>
                            <IonInput name="cardNumber" placeholder="0000 0000 0000 0000" required/>
                        </IonItem>

                        <IonItem>
                            <IonLabel >
                                <IonLabel position="floating">MM </IonLabel>
                                <IonInput name="month" type='number' placeholder="MM" required/>
                            </IonLabel>
                            <IonLabel slot="end" >
                                <IonLabel position="floating">YY </IonLabel>
                                <IonInput name="year" type='number' placeholder="YY" required/>
                            </IonLabel>
                        </IonItem>
                        
                        <IonItem>
                            <IonLabel position="floating">CVV</IonLabel>
                            <IonInput name="cvv" type='number' placeholder="CVV" required/>
                        </IonItem>
                        
                    </IonList>
                    <div className='payBtnHolder'>
                        <IonButton className="payBtn" expand='block' slot='end' type='submit'><IonIcon icon={card}/> Add card</IonButton>
                    </div>
                </form>
            </IonCard>
            <IonLoading
                mode='ios'
                isOpen={showLoadingState.showLoading}
                onDidDismiss={() => setShowLoading({...showLoadingState, showLoading: false})}
                message={showLoadingState.showLoadingMessage}
            />
            <IonAlert
                mode='ios'
                isOpen={showAlertState.showAlert}
                onDidDismiss={() => setShowAlert({...showAlertState, showAlert: false})}
                header={showAlertState.header}
                subHeader={showAlertState.subHeader}
                message={showAlertState.message}
                buttons={showAlertState.buttons}
                // inputs={showAlertState.inputs}
            />
        </>
    );

}
export default AddCards;