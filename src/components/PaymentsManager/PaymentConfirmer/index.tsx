import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    IonAlert,
    IonButton, IonButtons, IonContent, IonHeader, 
    IonModal, IonTitle, IonToolbar 
} from '@ionic/react';

import { AppContext } from '../../../contexts/AppContextProvider';
import { setIsSubscribedPaid, setPaymentConfirmation } from '../../../services/State';


import './index.css';
import { appAuthDomain, makeRequests, ShowAlertInterface } from '../../../services/Utils';
const PaymentConfirmer: React.FC<any> = ({firstModalRef}) => {
    const {state, dispatch } = useContext(AppContext);

    const [showAlertState, setShowAlert] = useState<ShowAlertInterface>({header: "", subHeader: "", message: "", buttons: [], showAlert: false});
    const [cardPayModal, setCardPayModal] = useState<any>({show: false, stage: 'paymentSelector', contents: "ccccc"});
    const [timesIframeRefreshed, setTimesIframeRefreshed] = useState(0);
    const ifraneRef = useRef(null);

    const iframeOnLoad = (e: any)=>{
        // console.log(e);
        // const theIframeTarget = e.target;
        // var iframeUrl = theIframeTarget.src;
        // console.log(theIframeTarget, iframeUrl);
        // console.log('iframeDocument', theIframeTarget.document);

        var myFrame:any = document.getElementById("myFrame");
        // console.log('myFrame', myFrame);
        var myFrameSrc = myFrame.src;
        console.log('myFrameSrc', myFrameSrc);


        var redirectcounter = timesIframeRefreshed+1;
        if (redirectcounter === 5) {
            
        }
        setTimesIframeRefreshed(redirectcounter);
        let requestObejct = {
            method: "POST",
            url: appAuthDomain("api/payments?appType=videos&action=paymentStatus"),
            data: state.paymentConfirmation
        };
        makeRequests(state, requestObejct).then(response=>{
            console.log("Payment status: ", response);
            let newVars = {header: response.msg, subHeader: response.msg2, message: response.msg3, showAlert: true};
            if (response.success) {
                dispatch(setPaymentConfirmation(null));
                dispatch(setIsSubscribedPaid(true));

                setShowAlert({...showAlertState, ...newVars});
            } else {
                // setShowAlert({...showAlertState, ...newVars});
            }
        });
    }
    useEffect(()=>{
        if (cardPayModal.stage === 'paymentSelector') {
            if (state.paymentConfirmation) {
                var paymentResponse = state.paymentConfirmation;
                if (paymentResponse.url) {
                    var iframe = document.createElement('iframe');
                    iframe.setAttribute("style","height:100%;width:100%;");
                    var inputFields = '';
                    var urlParamsString = '';
                    paymentResponse.parameters.forEach((item: any)=>{
                        inputFields += `<input type="hidden" name="${item.name}" value="${item.value}" readOnly/>`;
                        if (urlParamsString !== "") {
                            urlParamsString += "&";
                        };
                        urlParamsString += item.name + "=" + encodeURIComponent(item.value);
                    });
                    urlParamsString += `&url=${encodeURIComponent(paymentResponse.url)}`;
                    var html:any = `
                    <style >
                    #iframeSubmit{min-width: 200px; height: 40px; background-color: lime; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 25px; border: none;}
                    </style>
                    <body>
                        <div title={"Next payment stage."} >
                            <form method='POST' action="${paymentResponse.url}" id="iframeForm">
                                ${
                                    inputFields
                                }
                                <button type='submit' id="iframeSubmit" >Continue</button>
                            </form>
                        </div>
                    </body>
                    <script type="text/javascript" defer>
                    setTimeout(function(){
                        document.getElementById("iframeForm").submit();
                        document.getElementById("iframeSubmit").click();
                    }, 100);
                    </script>`;
                    var iFrameSrc = appAuthDomain("paymentsPage.html?"+urlParamsString);
                    setCardPayModal({...cardPayModal, show: true, stage: 'paymentConfirmation', paymentResponse, contents: {iframe, title: "Payments", srcDoc: html, src: iFrameSrc}});
                } else {
                    console.log("here......")
                    setCardPayModal({...cardPayModal, show: false});
                }
            }
        };
    }, [state, cardPayModal, dispatch]);
    useEffect(()=>{
        // console.log("aaa")
        if (ifraneRef) {
            // console.log("bbb")
            if (ifraneRef.current) {
                // console.log("ccc", ifraneRef.current)
                new MutationObserver(function(mutations) {
                    console.log(mutations)
                    mutations.some(function(mutation: any) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                            console.log(mutation);
                            console.log(`Old src: ${mutation.oldValue},  New src: ${mutation.target.src}`);
                            console.log('Old src: ', mutation.oldValue);
                            console.log('New src: ', mutation.target.src);
                            return true;
                        }
        
                        return false;
                    });
                }).observe(ifraneRef.current, {
                    attributes: true,
                    attributeFilter: ['src'],
                    attributeOldValue: true,
                    characterData: false,
                    characterDataOldValue: false,
                    childList: false,
                    subtree: true
                });
                  
                setTimeout(function() {
                    // document.getElementsByTagName('iframe')[0].src = 'http://jsfiddle.net/';
                }, 3000);
            }
        }
    }, [ifraneRef])


    return (
        <IonModal
            mode='ios'
            isOpen={cardPayModal.show}
            presentingElement={firstModalRef.current}
            canDismiss={true}
            onDidDismiss={() => setCardPayModal({...cardPayModal, stage: "paymentSelector", show: false})}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="end">
                        <IonButton onClick={() => setCardPayModal({...cardPayModal, stage: "paymentSelector", show: false})}>Close</IonButton>
                    </IonButtons>
                    <IonTitle>Confirm Card info.</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {
                    (cardPayModal.contents.iframe)?(
                        <>
                        {
                            (cardPayModal.contents.src)?(
                                <iframe id='myFrame' 
                                    ref={ifraneRef}
                                    title={cardPayModal.contents.title} 
                                    src={cardPayModal.contents.src}
                                    style={{width: "100%", height: "100%"}}
                                    onLoad={iframeOnLoad}
                                />
                            ):(
                                <iframe id='myFrame' 
                                    ref={ifraneRef}
                                    title={cardPayModal.contents.title} 
                                    srcDoc={cardPayModal.contents.srcDoc}
                                    src=""
                                    style={{width: "100%", height: "100%"}}
                                    onLoad={iframeOnLoad}
                                />
                            )
                        }
                        </>
                    ):(
                        <>
                        {cardPayModal.contents.srcDoc}
                        </>
                    )
                }
            </IonContent>
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
        </IonModal>
    )
}

export default PaymentConfirmer;

