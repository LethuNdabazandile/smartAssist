import { useState } from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, 
    IonButtons, IonSegment, IonSegmentButton, IonLabel, 
} from "@ionic/react";
import {chevronBack } from "ionicons/icons";


import Cardslist from "../../components/PaymentsManager/CardsList";
import AddCards from "../../components/PaymentsManager/AddCards";

import './index.css';
const Payments: React.FC<any> = ({firstModalRef})=>{

    const [cardState, setCardState] = useState('chooseCards');

    const onCardStateSegment = (seg: any) => {
        setCardState(seg);
    }

    const theCardInfo = (e:any)=>{
        if (e) {
            // // var cardDetails = {};
            // // if(e.cardName){
            // //     cardDetails = {cardHolder: e.cardName, cardBrand: e.cardBrand, cardNumber: e.cardNumber, month: e.cardExpDate, year: e.cardExpDate, cvv: e.cardCvv, newCard: 'false'}
            // // }else{
            // //     e.preventDefault();
            // //     var formDataJSON = e.target;
            // //     cardDetails = {cardHolder: formDataJSON.cardHolder.value, cardBrand: formDataJSON.cardBrand.value, cardNumber: formDataJSON.cardNumber.value, month: formDataJSON.month.value,
            // //     year: formDataJSON.year.value, cvv: formDataJSON.cvv.value, newCard: formDataJSON.newCard.value}
            // // };

            // console.log(cardDetails);
        } else {
            setCardState('addCards');
        }; 
    };
    
    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="home" text="Back" icon={chevronBack} />
                    </IonButtons>
                    <IonTitle>Payment Cards</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">Payment Cards</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <br/>
                
                <IonSegment mode='ios' value={cardState} onIonChange={e => onCardStateSegment(e.detail.value!)} >
                    <IonSegmentButton value="chooseCards">
                        <IonLabel>Choose Cards </IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="addCards">
                        <IonLabel>Add Cards</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
                {
                    (cardState === "chooseCards")?(
                        <Cardslist firstModalRef={firstModalRef} chosenCardFunction={theCardInfo} failGoBack={true}/>
                    ):(
                        <AddCards firstModalRef={firstModalRef} addCardCallback={()=>{onCardStateSegment("chooseCards")}} />
                    )
                }
            </IonContent>
        </IonPage>
    );

}
export default Payments;