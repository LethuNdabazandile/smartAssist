import React, { useCallback, useContext, useRef, useState } from "react";
import { useHistory } from "react-router";
import { IonAlert, IonAvatar, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, 
    IonIcon, IonItem, IonLabel, IonList, IonLoading, IonPage, IonTitle, IonToggle, IonToolbar, useIonToast 
} from "@ionic/react";
import { moon, folder, notifications, chatbubble, helpCircle, 
    document as documentIcon, logOut as myLog, heart, card, chevronForward
} from "ionicons/icons";

import { AppContext } from "../../contexts/AppContextProvider";
import { addNativePushRegListeners, appAuthDomain, checkPushPermission, getInitials, getPushPermission, makeRequests, onDeviceStorage,
    ShowAlertInterface, subscribeToPush, unsubscribeToPush 
} from "../../services/Utils";
import { getUserNames, logout, setColorMode, setPushAccess, setSetupState } from "../../services/State";

import './index.css';
import { Capacitor } from "@capacitor/core";

const Menu: React.FC = ()=>{
    const { state, dispatch } = useContext(AppContext);

    const refDarkMode = useRef<HTMLIonToggleElement>(null);

    // const [justLoaded, setJustLoaded] = useState(true);
    const [showLoadingState, setShowLoading] = useState({showLoadingMessage:'c...', showLoading: false});
    const [showAlertState, setShowAlertState] = useState<ShowAlertInterface>({header: "", subHeader: "", message: "", buttons: [], showAlert: false});
    const [present, dismiss] = useIonToast();
    const history = useHistory();




    const checkToggle = useCallback((shouldCheck: boolean)=>{
        var requestObj:any = {method: "POST", url: appAuthDomain("api/requests"), data: {appType: "trans", about: "account", mySkin: shouldCheck}};
        requestObj.headers = {'Content-Type': 'multipart/form-data'};
        makeRequests(state, requestObj).then(response=>{
            console.log(response);
        });
        var chosenMode = shouldCheck?"dark":"light";
        onDeviceStorage('set', {'themeMode': (chosenMode==="dark")?(true):(false)});
        dispatch(setColorMode(chosenMode));
      }, [state, dispatch]);
    const switchMode = (_checked: any)=>{
        checkToggle(_checked);
    };
    const triggerPersonalize = ()=>{
        dispatch(setSetupState(false));
    }
    const updatePushSubscriptionOnServer = (subscriptionAndPlatform: any)=>{
        // alert("Here: "+JSON.stringify(subscriptionAndPlatform));
        let subscription = subscriptionAndPlatform.subscription;
        let endpoint; let key; let token; let type = "web"; 
        if (subscriptionAndPlatform.platform === "ios") type = "apn";
        if (subscriptionAndPlatform.platform === "android") type = "fcm";

        var uint8Array_p256dh:any; var uint8Array_auth:any;
        var subscriptionBody:any = {};
        if (subscription !== null) {
            if (type === "web") {
                endpoint = subscription.endpoint; 
                key = subscription.getKey('p256dh'); 
                token = subscription.getKey('auth');

                uint8Array_p256dh = new Uint8Array(subscription.getKey('p256dh'));
                uint8Array_auth = new Uint8Array(subscription.getKey('auth'));

                subscriptionBody = {
                    endpoint: endpoint ? endpoint : null,
                    key: key ? btoa(String.fromCharCode.apply(null, uint8Array_p256dh)) : null,
                    token: token ? btoa(String.fromCharCode.apply(null, uint8Array_auth)) : null
                }
            } else {
                token = subscription.token;
                subscriptionBody = {
                    token: token ? token : null
                }
            }
        };
        var reqOptions = {
            url: appAuthDomain("api/pushSubscription?appType=videos&action=subscription"),
            method: "POST",
            data: {
                type,
                subscription: JSON.stringify(subscriptionBody)
            }
        };
        setShowLoading({...showLoadingState, showLoadingMessage: "Registering device for notifications...", showLoading: true});
        makeRequests(state, reqOptions).then(pusSubscriptionsRes=>{
            setShowLoading({...showLoadingState, showLoading: false});
            if (pusSubscriptionsRes.success) {
                present({
                    position: "top",
                    buttons: [{ text: 'Done', handler: () => dismiss() }],
                    message: pusSubscriptionsRes.msg,
                    duration: 2000
                });
                if (subscriptionBody.token == null) {
                    dispatch(setPushAccess(false));
                }
            } else {
                var buttonActions = [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            dispatch(setPushAccess(false));
                        }
                    },
                    {
                        text: 'Retry',
                        handler: () => {
                            updatePushSubscriptionOnServer(subscriptionAndPlatform);
                        }
                    }
                ];
                var alertStateVars = {
                    header: pusSubscriptionsRes.msg,
                    subHeader: pusSubscriptionsRes.msg2,
                    message: pusSubscriptionsRes.msg3,
                    buttons: buttonActions
                }
                setShowAlertState({...alertStateVars, showAlert: true});
            }
        })
    }
    const nativePushCallback = (eventInfo: any)=>{
        console.log("NativePushCallback eventInfo: ", eventInfo);
        // alert(JSON.stringify(eventInfo));
        var alertStateVars:any = {};
        if (eventInfo.token) {
            alertStateVars = {
                header: "NativePushCallback",
                subHeader: "eventInfo Token",
                message: eventInfo.token,
                buttons: []
            };
            if (eventInfo.token.value) {
                updatePushSubscriptionOnServer({platform: Capacitor.getPlatform(), subscription: {token: eventInfo.token.value}});                
            } else {
                setShowAlertState({...alertStateVars, showAlert: true});
            }
        } else if (eventInfo.error) {
            alertStateVars = {
                header: "NativePushCallback",
                subHeader: "eventInfo Error",
                message: eventInfo,
                buttons: []
            }
            setShowAlertState({...alertStateVars, showAlert: true});
        }
    }
    const updatePushPermission  = (checked: any)=>{
        var buttonActions:any = [];
        var alertStateVars;
        if (checked) {
            checkPushPermission().then(permCheckRes=>{
                // console.log(permCheckRes);
                if ('success' in permCheckRes) {
                    // getPermissions({name: 'pushManager'}).then(webPermRes=>{
                    //     console.log(webPermRes)
                    // })
                    alertStateVars = {
                        header: permCheckRes.msg,
                        subHeader: permCheckRes.msg2,
                        message: permCheckRes.msg3,
                        buttons: buttonActions
                    }
                    setShowAlertState({...alertStateVars, showAlert: true});
                    
                    dispatch(setPushAccess(false));
                } else {
                    if (permCheckRes.receive !== 'granted') {
                        getPushPermission().then((permRes)=>{
                            console.log('permRes: ', permRes);
                            if ('receive' in permRes) {
                                // console.log(permRes);
                                if (permRes.receive === 'denied') {
                                    alertStateVars = {
                                        header: "Permission was denied",
                                        subHeader: "You can try again.", 
                                        message: "This permission was dined before. Go to your phone settings in order to explicitly grant this permission.",
                                        buttons: buttonActions
                                    };
                                    setShowAlertState({...alertStateVars, showAlert: true});
                                } else {
                                    if (Capacitor.getPlatform() === "web") {
                                        subscribeToPush().then(subscriptionRes=>{
                                            console.log('subscriptionRes web: ', subscriptionRes);
                                            updatePushSubscriptionOnServer({platform: Capacitor.getPlatform(), subscriptionRes});
                                            dispatch(setPushAccess(checked));
                                        }).catch(err=>{
                                            console.log(err)
                                        });
                                    } else {
                                        addNativePushRegListeners(nativePushCallback).then((listenerAddResult)=>{
                                            // console.log('listenerAddResult 1: ', listenerAddResult)
                                            subscribeToPush().then(subscriptionRes=>{
                                                // // console.log('subscriptionRes native: ', subscriptionRes);
                                                // updatePushSubscriptionOnServer({platform: Capacitor.getPlatform(), subscriptionRes});
                                                dispatch(setPushAccess(checked));
                                            });
                                        });
                                    }
                                }
                            } else {
                                console.log("Handle differently");

                            }
                        });
                    } else {
                        if (Capacitor.getPlatform() === "web") {
                            subscribeToPush().then(subscriptionRes=>{
                                console.log('subscriptionRes web: ', subscriptionRes);
                                updatePushSubscriptionOnServer({platform: Capacitor.getPlatform(), subscriptionRes});
                                dispatch(setPushAccess(checked));
                            });
                        } else {
                            addNativePushRegListeners(nativePushCallback).then((listenerAddResult)=>{
                                // console.log('listenerAddResult 2: ', listenerAddResult)
                                subscribeToPush().then(subscriptionRes=>{
                                    // // console.log('subscriptionRes native: ', subscriptionRes);
                                    // updatePushSubscriptionOnServer({platform: Capacitor.getPlatform(), subscriptionRes});
                                    dispatch(setPushAccess(checked));
                                });
                            })
                        }
                    };
                }
            });
        } else {
            checkPushPermission().then(permCheckRes=>{
                console.log('permCheckRes: ', permCheckRes);
                if ('success' in permCheckRes) {
                    console.log("Revoke web push.");

                } else {
                    console.log("Revoke native push.");
                    unsubscribeToPush().then(revokeRes=>{
                        console.log("revokeRes: ", revokeRes);
                    });
                }
            });
        }
    }
    const doLogout = useCallback(()=>{
        var buttonActions = [
            {
                text: 'Not now',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                    // window.history.back();
                }
            },
            {
                text: 'Continue',
                handler: () => {
                    present({
                        position: "top",
                        buttons: [{ text: 'hide', handler: () => dismiss() }],
                        message: 'Logged out ...',
                    });
                    dispatch(logout());
                    history.push("/login");
                    setTimeout(() => {
                        onDeviceStorage('clear', null);
                        localStorage.clear();
                        window.location.reload();
                    }, 500);
                }
            }
        ];
        var alertStateVars = {
            header: "About to log out",
            subHeader: "", 
            message: "Are you sure?",
            buttons: buttonActions
        };
        setShowAlertState({...alertStateVars, showAlert: true});
    }, [dispatch, history, dismiss, present]);

    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonTitle>Menu</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">Menu</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div>
                <br/>
                    <br/>
                    <IonCard 
                        mode='ios'
                        routerLink="/profile"
                        type="button"
                    >
                        {
                            (state.user.profileNotifyCount>0)?(
                            <IonBadge className="menuProfileSetupBadge" color="danger">{
                                (state.user.profileNotifyCount > 99)?(
                                `${state.user.profileNotifyCount}+`
                                ):(
                                state.user.profileNotifyCount
                                )
                            }</IonBadge>
                            ):("")
                        }
                        <br/>
                        <div className="menuProfile">
                            <IonAvatar className='profileAVTR'>
                                {
                                    (state.auth.user && state.auth.user.profilePic)?(
                                        <>
                                        {
                                            (state.auth.user.profilePic !== "")?(
                                                <img src={appAuthDomain(state.auth.user.profilePic)} alt="profilePic" />
                                            ):(
                                                <div className='profileAVTRNoPic'>
                                                    <span>
                                                        {getInitials(getUserNames(state) || "")}
                                                    </span>
                                                </div>
                                            )
                                        }
                                        </>
                                    ):(
                                        <div className='profileAVTRNoPic'>
                                            <span>
                                                {getInitials(getUserNames(state) || "")}
                                            </span>
                                        </div>
                                    )
                                }
                            </IonAvatar>
                            <div className="profileHintsPart">
                                <IonCardTitle className="menuProfileNames">{getUserNames(state)}</IonCardTitle>
                                <IonCardSubtitle>{state.user.type}</IonCardSubtitle>
                                <p>Manage your account (Profile pic, Emails, Phone number, etc. ...)</p>
                            </div>
                            <div className="chevronPart">
                                <IonIcon icon={chevronForward} />
                            </div>
                        </div>
                    </IonCard>
                    <IonCard mode="ios">
                        <IonCardHeader>
                            <IonCardTitle>
                                Settings
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent className="cardContent">
                            <IonList mode='ios' className="cardContentList">
                                <IonItem routerLink="/dashboard" mode="ios">
                                    <IonIcon icon={folder} /> 
                                    <IonLabel>My Dashboard</IonLabel>
                                </IonItem>
                                <IonItem onClick={triggerPersonalize} mode="ios">
                                    <IonIcon icon={heart} /> 
                                    <IonLabel>Personalize</IonLabel>
                                </IonItem>
                                <IonItem routerLink="/payments" mode="ios">
                                    <IonIcon mode='ios' icon={card} />
                                    <IonLabel> Payment cards</IonLabel>
                                </IonItem>
                                <IonItem mode="ios">
                                    <IonIcon icon={notifications} className="component-icon component-icon-dark" />
                                    <IonLabel className="myLabels"> Push notifications</IonLabel>
                                    <IonToggle color="primary" 
                                    checked={state.user.pushAccess} 
                                    onIonChange={(e)=>updatePushPermission(e.detail.checked)}/>
                                </IonItem>
                                <IonItem mode="ios">
                                    <IonIcon slot="start" icon={moon} className="component-icon component-icon-dark" />
                                    <IonLabel>Dark Mode</IonLabel>
                                    <IonToggle 
                                        mode='ios'
                                        checked={(state.ui.colorMode==="dark")?(true):(false)}
                                        ref={refDarkMode} 
                                        onIonChange={e => switchMode(e.detail.checked)}
                                    />
                                </IonItem>
                            </IonList>
                        </IonCardContent>
                    </IonCard>
                    <IonCard mode="ios">
                        <IonCardHeader>
                            <IonCardTitle>
                            More
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent className="cardContent">
                            <IonList className="cardContentList">
                                <IonItem href={appAuthDomain("about.html")}>
                                    <IonIcon icon={chatbubble} />
                                    <IonLabel>About us</IonLabel>
                                </IonItem>
                                <IonItem href={appAuthDomain("help.html")}>
                                    <IonIcon icon={helpCircle} />
                                    <IonLabel>Help</IonLabel>
                                </IonItem>
                                <IonItem href={appAuthDomain("terms.html")}>
                                    <IonIcon icon={documentIcon} />
                                    <IonLabel>Terms</IonLabel>
                                </IonItem>
                            </IonList>
                        </IonCardContent>
                    </IonCard>
                    <IonCard mode='ios'>
                        <IonItem onClick={doLogout}>
                            <IonIcon slot="start" icon={myLog} className="component-icon component-icon-dark" />
                            <IonLabel>Log out</IonLabel>
                        </IonItem>
                    </IonCard>
                    <br/>
                    <br/>
                    <br/>
                </div>
            </IonContent>
            <IonLoading
                mode='ios'
                isOpen={showLoadingState.showLoading}
                onDidDismiss={() => setShowLoading({...showLoadingState, showLoading: false})}
                message={showLoadingState.showLoadingMessage}
            />
            <IonAlert
                mode='ios'
                isOpen={showAlertState.showAlert}
                onDidDismiss={() => setShowAlertState({...showAlertState, showAlert: false})}
                header={showAlertState.header}
                subHeader={showAlertState.subHeader}
                message={showAlertState.message}
                buttons={showAlertState.buttons}
            />
        </IonPage>
    )
}
export default Menu;