import React, { useContext, useState } from 'react';
import {
    IonButton, IonButtons, IonContent, IonHeader, 
    // IonIcon, 
    IonLabel, 
    IonModal, IonSegment, IonSegmentButton, IonTitle, IonToolbar 
} from '@ionic/react';
// import { card, cash } from 'ionicons/icons';

import { AppContext } from '../../../contexts/AppContextProvider';
import { setMicroTransactions } from '../../../services/State';
import Cardslist from '../CardsList';
import AddCards from '../AddCards';

import './index.css';
const PaymentPrompt: React.FC<any> = () => {
    const { state, dispatch } = useContext(AppContext);

    const [cardState, setCardState] = useState('chooseCards');

    const firstModalRef = state.ui.microTransactions.presentingElement;
    // const paymentMethod = state.microTransactions.paymentMethod;

    // const onSegment = (seg: any)=>{
    //     // choosePaymentMethod(seg);
    //     if(seg === "card"){
    //         setCardPayModal(true);
    //     };
    // };
    const onCardStateSegment = (seg: any) => {
        setCardState(seg);
    }
    const setCardPayModal = (val: any)=>{
        dispatch(setMicroTransactions({ ...state.ui.microTransactions, show: val }));
    }
    const theCardInfo = (e:any)=>{
        if (e) {
            var cardDetails = {};
            if(e.cardName){
                cardDetails = {cardHolder: e.cardName, cardBrand: e.cardBrand, cardNumber: e.cardNumber, month: (e.cardExpDate).split('/')[0], year: (e.cardExpDate).split('/')[1], cvv: e.cardCvv, newCard: 'false'}
            }else{
                e.preventDefault();
                var formDataJSON = e.target;
                cardDetails = {cardHolder: formDataJSON.cardHolder.value, cardBrand: formDataJSON.cardBrand.value, cardNumber: formDataJSON.cardNumber.value, month: formDataJSON.month.value,
                year: formDataJSON.year.value, cvv: formDataJSON.cvv.value, newCard: formDataJSON.newCard.value}
            };
            
            dispatch(setMicroTransactions({ cardDetails }));
            setCardPayModal(false);
            setTimeout(() => {
                (state.microTransactions.confirmService)();
            }, 300);
        } else {
            onCardStateSegment('addCards');
        }; 
    }

    return (
        <>
        {/* <div>
            <div className='payOptBtns'>
                <IonSegment mode='ios' value={paymentMethod} onIonChange={e => onSegment(e.detail.value!)} >
                    <IonSegmentButton value="cash">
                        <IonIcon mode='ios'icon={cash} />
                        <IonLabel>Cash </IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="card">
                        <IonIcon mode='ios' icon={card}/>
                        <IonLabel>Card</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
            </div>
        </div> */}
        <IonModal
            mode='ios'
            isOpen={state.ui.microTransactions.show}
            presentingElement={firstModalRef?.current}
            canDismiss={true}
            onDidDismiss={() => setCardPayModal(false)}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="end">
                        <IonButton onClick={() => setCardPayModal(false)}>Close</IonButton>
                    </IonButtons>
                    <IonTitle>Card payments</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <>
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">Card payment</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <br/>
                <IonSegment mode='ios' value={cardState} onIonChange={e => onCardStateSegment(e.detail.value!)} >
                    <IonSegmentButton value="chooseCards">
                        {/* <IonIcon mode='ios'icon={cash} /> */}
                        <IonLabel>Choose Cards </IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="addCards">
                        {/* <IonIcon mode='ios' icon={addCircle}/> */}
                        <IonLabel>Add Cards</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
                {
                    (cardState === "chooseCards")?(
                        <Cardslist firstModalRef={firstModalRef} chosenCardFunction={theCardInfo} failGoBack={false}/>
                    ):(
                        <AddCards firstModalRef={firstModalRef} addCardCallback={()=>{onCardStateSegment("chooseCards")}} />
                    )
                }
                </>
            </IonContent>
        </IonModal>
        </>
    )
}

export default PaymentPrompt

