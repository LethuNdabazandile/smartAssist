import { useCallback, useContext , useEffect, useState } from "react";
import {
    IonIcon, IonCard, 
    IonButton, IonLoading, IonAlert, IonCardHeader, IonCardContent, 
} from "@ionic/react";
import { card } from "ionicons/icons";

import { AppContext } from "../../../contexts/AppContextProvider";
import { appAuthDomain, makeRequests, ShowAlertInterface } from "../../../services/Utils";

import './index.css';
const Cardslist: React.FC<any> = ({chosenCardFunction, failGoBack})=>{
    const { state } = useContext(AppContext);

    const [showLoadingState, setShowLoading] = useState({showLoadingMessage:'c...', showLoading: false});
    const [showAlertState, setShowAlert] = useState<ShowAlertInterface>({header: "", subHeader: "", message: "", buttons: [], showAlert: false});
    const [myCardInfo, setMyCardInfo] = useState<any>([]);
    const [firstLoaded, setFirstLoaded] = useState(false);

    const chooseCard = (theCard: any)=>{
        chosenCardFunction(theCard);
    }

    const getMyCards = useCallback(() => {
        setShowLoading({showLoadingMessage: "Fetching payment information...", showLoading: true});
        let requestObejct = {
            method: "GET",
            url: appAuthDomain("api/profile?appType=videos&action=getCards")
        };
        makeRequests(state, requestObejct).then(response=>{
            setTimeout(() => {
                setShowLoading({...showLoadingState, showLoading: false});
            }, 300);
            if (response.success) {
                let respInfo = response.data;
                setMyCardInfo(respInfo);
            } else {
                let respInfo:any = [
                    // {cardName:"Lethu Ndabs", cardNumber:"5546", cardCvv:"355", cardExpDate:"12/45", cardBrand:"Visa"},
                    // {cardName:"Lethu Ndabkkj", cardNumber:"3456", cardCvv:"344", cardExpDate:"11/25", cardBrand:"Master"},
                    // {cardName:"Lethu Ndabkkj", cardNumber:"3456", cardCvv:"344", cardExpDate:"11/25", cardBrand:"Master"},
                ];
                setMyCardInfo(respInfo);
                var buttonActions = [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            if (failGoBack) {
                                // window.history.back();
                            }
                        }
                    },
                    {
                        text: 'Retry',
                        handler: () => {
                            getMyCards();
                        }
                    }
                ];
                var alertStateVars = {header: response.msg2, subHeader: response.msg2, message: response.msg3, inputs: [], buttons: buttonActions};
                setTimeout(() => {
                    setShowAlert({...alertStateVars, showAlert: true});
                }, 1001);
            };
        });
    }, [showLoadingState, setShowLoading, state, failGoBack]);

    useEffect(() => {
        if(!firstLoaded){
            setFirstLoaded(true);
            getMyCards();
        }
    }, [state, firstLoaded, getMyCards]);
    
    return (
        <>
            <div>
                {
                    (myCardInfo.length > 0)?(
                        myCardInfo.map((item: any, key: number) => {
                            return (<IonCard key={key} onClick={()=>{ chooseCard(item) }}>
                                    <IonCardHeader>
                                        <p className="cardName">{item.cardName}</p>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <div className="flexDiv">
                                            <h2>**** **** **** {item.cardNumber}</h2>
                                            <p>{item.cardBrand}</p>
                                        </div>
                                        <div className=" flexDiv">
                                            <h2>Expires  {item.cardExpDate}</h2>
                                            <p>cvv ***</p>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            )
                        })
                    ):(<p style={{textAlign: "center", marginTop: "9%"}}>No bank card linked</p>)
                }
                <br/>
                <IonButton expand="block" slot='end' onClick={() => chosenCardFunction(null)}><IonIcon icon={card}/>Add card</IonButton>
                <br/>
                <br/>
                <br/>
            </div>
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
export default Cardslist;