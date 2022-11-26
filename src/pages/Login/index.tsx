import { useCallback, useContext, useEffect, useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router";
import { IonAlert, IonBackButton, IonButtons, IonContent, IonHeader, IonLoading, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { chevronBack } from "ionicons/icons";

import { AppContext } from "../../contexts/AppContextProvider";
import { loggedIn } from "../../services/State";
import { appAuthDomain, makeRequests, onDeviceStorage, ShowAlertInterface } from "../../services/Utils";

import SignIn from "../../components/Login/SignIn";
import SignUp from "../../components/Login/SignUp";
import Forgot from "../../components/Login/Forgot";
import OTP from "../../components/Login/OTP";
import ResetPassword from "../../components/Login/ResetPassword";


import './index.css';
const Login:React.FC<any> = ({name})=>{
    const { dispatch} = useContext(AppContext);

    const [showLoadingState, setShowLoading] = useState({showLoadingMessage: 'c...', showLoading: false});
    const [showAlertState, setShowAlert] = useState<ShowAlertInterface>({header: "", subHeader: "", message: "", buttons: [], showAlert: false});
    const [defaultAction, setDefaultAction] = useState(false); 
    const [stillLoading, setStillLoading] = useState(false); 
    const [ username, setUsername ] = useState("");
    const [ranKey, setRanKey] = useState("");


    let history = useHistory();
    let location = useLocation();

    var pageIn = location.pathname;
    pageIn = pageIn.substring(1, pageIn.length);

    const routerFunction = (e:string)=>{
        history.push("/"+e);
    }
    const otpResend = ()=>{
        authFunction({in_AppimateID: username}, false);
    };
    const fowardOnsubmit = (e: any)=>{
        e.preventDefault();
        e.stopPropagation();
        authFunction(e, null);
    }
    const onSignIn = useCallback(user => {
        var link:any = "/home";
        // console.log(location);
        if (location.state) {
            var theState:any = location.state;
            if (typeof theState === 'object') {
                link = (location && theState.from) || "/home";

                if (link.state) { 
                    if (link.state.from) {               
                        link = link.state.from;
                    };
                };
            }
        };

        
        onDeviceStorage('remove', 'username');
        onDeviceStorage('remove', 'ranKey');
        user.initialAuth = false;
        dispatch(loggedIn(user));
        history.replace(link);
    }, [dispatch, history, location]);

    const authFunction = useCallback((e: any, thirParty: any)=>{
        var url = "";
        var formData:any;
        var requestObject:any = {};
        var sendRequestObject:any = {};
        var showLoadingMessage = 'Submitting...';
        if (thirParty) {
            url = "api/authentication?thirdPart=true";
            formData = new FormData();
            for ( var key in e ) {
                formData.append(key, e[key]);
            };
            showLoadingMessage = thirParty+" authentication...";
        } else if ('in_AppimateID' in e) {
            url = "api/authentication?logIn=2&mod=2";
            formData = new FormData();
            for ( var theKey in e ) {
                formData.append(theKey, e[theKey]);
            };
            showLoadingMessage = "Re-sending OTP ...";
        } else {
            url = e.target.action;
            var authEndpoint = new URL(url);
            url = authEndpoint.pathname+authEndpoint.search;
            url = url.substring(1, url.length);
            formData = new FormData(e.target);
        };
        requestObject = Object.fromEntries(formData.entries());
        sendRequestObject.method = "POST";
        sendRequestObject.url = appAuthDomain(url);
        sendRequestObject.headers = {'Content-Type': 'multipart/form-data'};
        sendRequestObject.data = requestObject;

        setShowLoading({showLoadingMessage: showLoadingMessage, showLoading: true});
        makeRequests(null, sendRequestObject).then(response=>{    
            setTimeout(() => {
                setShowLoading({showLoadingMessage: "", showLoading: false});
            }, 900);
            if (response.success) {
                var fullData = response.data;
                if ((requestObject.type === "login")||(requestObject.type === "register")||(requestObject.type === "resetPassword")) {
                    if (requestObject.type === "register") {
                        history.push("/otp?mod=0");

                        onDeviceStorage('set', {
                            username: requestObject.in_Phone,
                        });
                        setUsername(requestObject.in_Phone);
                    } else {
                        onDeviceStorage('set', {userInfo: JSON.stringify(fullData)});
                        onDeviceStorage('set', {mySubjects: fullData.myPackage});
                        onDeviceStorage('set', {themeMode: fullData.isNightMode}); 

                        if ((requestObject.type === "login")||(requestObject.type === "register")||(requestObject.type === "resetPassword")) {
                            setTimeout(()=>{
                                onSignIn(fullData);
                            }, 1000);
                        };
                    }
                } else if (requestObject.type === "forgotPassword") {
                    history.push("/otp?mod=1");
                    onDeviceStorage('set', {
                        username: requestObject.in_AppimateID,
                    });
                    setUsername(requestObject.in_AppimateID);
                } else if (requestObject.type === "otp") {
                    if (fullData.continue || (fullData.nextAction === 'resetPassword')) {
                        history.push("/resetPassword");
                        onDeviceStorage('set', {
                            username: requestObject.in_AppimateID,
                            ranKey: requestObject.ranKey,
                        });
                        setUsername(requestObject.in_AppimateID);
                        setRanKey(requestObject.ranKey); 
                    } else {
                        onDeviceStorage('set', {userInfo: JSON.stringify(fullData)});
                        onDeviceStorage('set', {userType: JSON.stringify(fullData.role)});
                        onDeviceStorage('set', {themeMode: fullData.isNightMode}); 

                        setTimeout(()=>{
                            onSignIn(fullData);
                        }, 1000);
                    }
                }

                var alertStateVarsSuccess = {
                    header: response.msg, subHeader: response.msg2, message: response.msg3, 
                    buttons: [{
                        text: 'Continue', 
                        handler: () => { 
                            // console.log('Confirm Ok'); 
                        } 
                    }]
                };
                setTimeout(() => {
                    setShowAlert({...alertStateVarsSuccess, showAlert: true});
                }, 1001);
            } else {
                var secondActionObject = {
                    text: 'Ok',
                    handler: () => {
                        console.log('Confirm Ok');
                    }
                };
                if (response.action) {
                    if (response.action.retry) {
                        secondActionObject = {
                            text: 'Retry',
                            handler: () => {
                                authFunction(e, thirParty);
                            }
                        }
                    }
                }
                var buttonActions = [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            console.log('Confirm Cancel');
                        }
                    },
                    secondActionObject
                ];
                var alertStateVars = {header: response.msg, subHeader: response.msg2, message: response.msg3, buttons: buttonActions};
                setTimeout(() => {
                    setShowAlert({...alertStateVars, showAlert: true});
                }, 1001);
            }
        });
    }, [history, onSignIn]);

    const veryifyFunc = ()=>{
        if (!defaultAction) {
            if ((location.pathname ).substring(1, location.pathname.length) === "otp") {
                var paramsString = location.search;
                if (paramsString !== "") {
                    const queryParams = new URLSearchParams(paramsString);
                    if ( queryParams.has("username") && queryParams.has("ranKey") ) {
                        if (!stillLoading) {
                            setStillLoading(true);
                            setShowLoading({showLoadingMessage: 'Verifying Link...', showLoading: true});
                            var requestObj:any = {};
                            var sendObj:any = {
                                type: "verifyLink",
                                ranKey: queryParams.get("ranKey"),
                                in_AppimateID: queryParams.get("username"),
                            };
                            requestObj.url = appAuthDomain("api/authentication");
                            requestObj.method = "POST";
                            requestObj.data = sendObj;
                            makeRequests(null, requestObj).then(response=>{
                                setShowLoading({...showLoadingState, showLoading: false});
                                if (response.success) {
                                    history.push("/resetPassword");
                                    setUsername(sendObj.in_AppimateID);
                                    setRanKey(sendObj.ranKey);
                                    setDefaultAction(true);
                                } else {
                                    var buttonActions = [
                                        {
                                            text: 'Cancel',
                                            role: 'cancel',
                                            cssClass: 'secondary',
                                            handler: () => {
                                                window.history.back();
                                            }
                                        },
                                        {
                                            text: 'Retry',
                                            handler: () => {
                                                veryifyFunc();
                                            }
                                        }
                                    ];

                                    var alertStateVars = {header: response.msg, subHeader: "", message: response.msg2, buttons: buttonActions};
                                    setTimeout(() => {
                                        setShowAlert({...alertStateVars, showAlert: true});
                                    }, 500);
                                }
                            });
                        }
                    } else {
                        setDefaultAction(true);
                    }
                } else {
                    setDefaultAction(true);
                }
            } else {
                setDefaultAction(true);
            }
        } else {
            setDefaultAction(true);
        }
    }

    
    useEffect(() => {
        const loginPages = ['login', 'register', 'otp', 'forgotPassword', 'resetPassword', ''];

        var showBottomNav = false;
        const bottomNav = document.getElementById("defaultIonicTabBar");
        if (!loginPages.includes(pageIn)) {showBottomNav = true; };
        if (bottomNav) {
            bottomNav.style.display = "none";
        };
        return ()=> {
            if (bottomNav) {
                if (showBottomNav) {
                    bottomNav.style.display = "flex";
                }
            }
        }
    },[pageIn]);


    return (
        <IonPage>
            <IonHeader mode="ios">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" text="Back" icon={chevronBack} />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <div className="loginMainHolder">
                    <div className="otherPageLink">
                        {/* <a href="/about">About us</a>
                        <a href="/help">Help</a>
                        <a href="/terms.html">Terms</a> */}
                    </div>
                    <div className="loginFormHolder">
                        <div className="formsContainer">
                            <IonHeader mode="ios" collapse="condense">
                                <IonToolbar>
                                    <IonTitle size="large">{name}</IonTitle>
                                </IonToolbar>
                            </IonHeader>
                            <>
                            { 
                                (defaultAction) ? (
                                    <Switch>
                                        <Route path="/login" component={() => <SignIn routerFunction={routerFunction} fowardOnsubmit={fowardOnsubmit} />} exact /> 
                                        <Route path="/register" component={() => <SignUp routerFunction={routerFunction} fowardOnsubmit={fowardOnsubmit} />} exact />
                                        <Route path="/forgotPassword" component={() => <Forgot routerFunction={routerFunction} fowardOnsubmit={fowardOnsubmit} />} exact />
                                        <Route path="/otp" component={() => <OTP username={username} routerFunction={routerFunction} fowardOnsubmit={fowardOnsubmit}  otpResend={otpResend} />} exact /> 
                                        <Route path="/resetPassword" component={() => <ResetPassword username={username} ranKey={ranKey} fowardOnsubmit={fowardOnsubmit} />} exact /> 
                                    </Switch>
                                ) : veryifyFunc()
                            }
                            </>
                        </div>
                    </div>
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
                onDidDismiss={() => setShowAlert({...showAlertState, showAlert: false})}
                header={showAlertState.header}
                subHeader={showAlertState.subHeader}
                message={showAlertState.message}
                buttons={showAlertState.buttons}
            />
        </IonPage>
    );
}
export default Login;