import {useCallback, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonBackButton, IonButtons, IonButton, IonLoading, IonAlert, IonAvatar, IonCardSubtitle } from "@ionic/react";
import {person, lockClosed, chevronBack, mail, call, cloudOffline, trash } from "ionicons/icons";

import { AppContext } from "../../contexts/AppContextProvider";
import { appAuthDomain, getInitials, hapticsImpactHeavy, hapticsImpactLight, hapticsVibrate, makeRequests, onDeviceStorage } from "../../services/Utils";
import { InputChangeEventDetail } from "@ionic/core";

import './index.css';
import { getUserNames, setProfilePic } from "../../services/State";
interface AlertTypeInterface {
    header: string;
    subHeader: string;
    message: string;
    buttons: any;
    showAlert: boolean;
    inputs: any;
}

const Profile: React.FC = ()=>{
    const { state, dispatch } = useContext(AppContext);
    const history = useHistory();
    const [showLoadingState, setShowLoading] = useState({showLoadingMessage:'c...', showLoading: false});
    const [showAlertState, setShowAlert] = useState<AlertTypeInterface>({header: "", subHeader: "", message: "", inputs: [], buttons: [], showAlert: false});
    const [personalProfile, setMyProfile] = useState<any>([]);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [password, setPassword] = useState({
        password: '',
        passwordRepeat: ''
      })
      const [validLength, setValidLength] = useState(false);
      const [hasNumber, setHasNumber] = useState(false);
      const [upperCase, setUpperCase] = useState(false);
      const [lowerCase, setLowerCase] = useState(false);
      const [specialChar, setSpecialChar] = useState(false);
      const [match, setMatch] = useState(false);
      const requiredLength = 8;
    
    const inputChange = (event: CustomEvent<InputChangeEventDetail>)=>{
        var eventTarget:any = event.target;
        var value = event.detail.value;
        var name = eventTarget.name;
        setPassword({
            ...password,
            [name]: value
        })
    }
    
    useEffect(() => {
        setValidLength(password.password.length >= requiredLength ? true : false);
        setUpperCase(password.password.toLowerCase() !== password.password);
        setLowerCase(password.password.toUpperCase() !== password.password);
        setHasNumber(/\d/.test(password.password));
        setMatch(!!password.password && password.password === password.passwordRepeat);
        setSpecialChar(/[ `!@#$%^&*()_+\-=\]{};':"\\|,.<>?~]/.test(password.password));

    }, [password, requiredLength]);

    const editProfileOic = ()=>{
        document.getElementById('changeProfilePic')?.click();
    }
    const addProfilePic = (event: any)=>{
        setShowLoading({showLoadingMessage: "Submitting profile Pic...", showLoading: true});
		var file = event.target.files[0];
		if ((file !== null)||(file !== undefined)) {
            var reader  = new FileReader(); 
			reader.onload = function(evt: any){
				if( evt.target.readyState === FileReader.DONE) {
                    // var theFileName = file["name"];
                    // var theFileMIME = file["type"];
					// // var fileType = (theFileMIME.split("/"))[0]; 
					var revokeTimeDelay = 20000;
					var profileSrc = URL.createObjectURL(file); 
                    var requestObj = {  url: appAuthDomain("api/profile?appType=videos&action=updateProfile"), 
                        method: "POST", headers: { "Content-Type": "multipart/form-data"},
                        data: {
                            in_ProfilePic: file
                        }
                    };
                    makeRequests(state, requestObj).then((response) => {
                        setShowLoading((s)=>({...s, showLoading: false}));
                        var buttonActions:any = [];
                        var alertStateVars:any = {};
                        if (response.success) {
                            hapticsImpactHeavy();
                            hapticsImpactLight();
                            onDeviceStorage('get', 'userInfo').then((userInfo: any)=>{
                                var updatedUserInfo = {...JSON.parse(userInfo), profilePic: response.data.profilePic};
                                onDeviceStorage('set', {userInfo: JSON.stringify(updatedUserInfo)});
                                dispatch(setProfilePic(response.data.profilePic));
                            })
                            
                            buttonActions = [
                                {
                                    text: 'Done',
                                    handler: () => {
                                        // setShowModal2(false);
                                    }
                                }
                            ];
                            alertStateVars = {
                                header: response.msg,
                                subHeader: "", 
                                message: response.msg2,
                                buttons: buttonActions,
                                inputs: [],
                            };
                        } else {
                            hapticsVibrate(300);
                            buttonActions = [
                                {
                                    text: 'Cancel',
                                    role: 'cancel',
                                    cssClass: 'secondary',
                                    handler: () => {
                                        // setMyProfile(updatedInfo);
                                    }
                                },
                                {
                                    text: 'Retry',
                                    handler: () => {
                                        setTimeout(() => {
                                            addProfilePic(event);
                                        }, 500);
                                    }
                                }
                            ];
                            
                        };
                        alertStateVars = {
                            header: response.msg,
                            subHeader: "", 
                            message: response.msg2,
                            buttons: buttonActions,
                            inputs: [],
                        };
                        setTimeout(() => {
                            setShowAlert({...alertStateVars, showAlert: true});
                        }, 501);
                        setTimeout(function() {
                            URL.revokeObjectURL(profileSrc)
                        }, revokeTimeDelay);
                    })
                };
            };
			reader.readAsDataURL(file);
        };
    }
    var submitFunction = (e: any)=>{
        e.preventDefault();
        var profileFrom = new FormData(e.target);

        var inputs = [
            {
                name: 'in_Password',
                label: 'Confirm Password',
                type: "password",
                placeholder: "Password",
            }
        ];
        var passwordAlertObjectBtns = [
            {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                    // setShowModal2(false);
                }
            },
            {
                text: 'Submit',
                handler: (alertData: any) => {
                    var url = e.target.action;
                    profileFrom.append("appType", "trans");
                    profileFrom.append("password", alertData.in_Password);
                    var updatedInfo = Object.fromEntries(profileFrom);
                    let requestObject = {
                        method: "POST",
                        url,
                        headers: {
                            "Content-Type": "multipart/form-data"
                        },
                        data: updatedInfo
                    }

                    setShowLoading({showLoadingMessage: "Submitting...", showLoading: true});
                    makeRequests(state, requestObject).then(response=>{
                        setTimeout(() => {
                            setShowLoading(s=>({...s, showLoading: false}));
                        }, 900);
                        var buttonActions:any = [];
                        var alertStateVars:any = {};
                        if (response.success) {
                            hapticsImpactHeavy();
                            hapticsImpactLight();
                            setMyProfile(updatedInfo);
                            buttonActions = [
                                {
                                    text: 'Done',
                                    handler: () => {
                                        // setShowModal2(false);
                                    }
                                }
                            ];
                        } else {
                            hapticsVibrate(300);
                            buttonActions = [
                                {
                                    text: 'Cancel',
                                    role: 'cancel',
                                    cssClass: 'secondary',
                                    handler: () => {
                                        setMyProfile(updatedInfo);
                                    }
                                },
                                {
                                    text: 'Retry',
                                    handler: () => {
                                        setTimeout(() => {
                                            submitFunction(e);
                                        }, 500);
                                    }
                                }
                            ];
                        };
                        alertStateVars = {
                            header: response.msg,
                            subHeader: "", 
                            message: response.msg2,
                            buttons: buttonActions,
                            inputs: [],
                        };
                        setTimeout(() => {
                            setShowAlert({...alertStateVars, showAlert: true});
                        }, 1001);
                    });
                }
            }
        ];

        var passwordAlertObject = {
            header: "Verify password",
            subHeader: "Security measure", 
            message: "To ensure not anyone can just chenge your details.",
            inputs: inputs,
            buttons: passwordAlertObjectBtns
        };
        setTimeout(() => {
            setShowAlert({...passwordAlertObject, showAlert: true});
        }, 300);
    }

    var submitpassword = (e: any)=>{
        e.preventDefault();
        var orderForm = new FormData(e.target);
        var url = e.target.action;
        orderForm.append("appType", "trans");
        var updatedInfo = Object.fromEntries(orderForm);
                  
        setShowLoading({showLoadingMessage: "Submitting...", showLoading: true});
        let requestObject = {
            method: "POST",
            url,
            headers: {
                "Content-Type": "multipart/form-data"
            },
            data: updatedInfo,
        }
        makeRequests(state, requestObject).then((response: any)=>{
            setTimeout(() => {
                setShowLoading(s=>({...s, showLoading: false}));
            }, 500);

            var buttonActions:any = [];
                var alertStateVars:any = {};
                if (response.success) {
                    hapticsImpactHeavy();
                    hapticsImpactLight();
                    setMyProfile(updatedInfo);
                    buttonActions = [
                        {
                            text: 'Done',
                            handler: () => {
                                // setShowModal2(false);
                            }
                        }
                    ];
                    alertStateVars = {
                        header: response.msg,
                        subHeader: "", 
                        message: response.msg2,
                        buttons: buttonActions
                    };
                    setShowAlert({...alertStateVars, showAlert: true});
                } else {
                    hapticsVibrate(300);
                    buttonActions = [
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary',
                            handler: () => {
                                // setShowModal2(false);
                                setMyProfile(updatedInfo);
                            }
                        },
                        {
                            text: 'Retry',
                            handler: () => {
                                setTimeout(() => {
                                    submitFunction(e);
                                    console.log("Here!!!!!!!!")
                                }, 500);
                            }
                        }
                    ];
                    alertStateVars = {
                        header: response.msg,
                        subHeader: "", 
                        message: response.msg2,
                        buttons: buttonActions
                    };
                    setShowAlert({...alertStateVars, showAlert: true});
                };
        });
    }
    const manageAccount = useCallback((whatToDo)=>{
        var textToDo = whatToDo;
        var alertStateVars:any ={};
        var buttonActions:any = [];
        if(whatToDo === 'deActivate'){
            textToDo = 'de-activate';
        }
        var doRequest = (e: any, pass:any)=>{
            var alertStateVars:any =[];
            var buttonActions:any = [];
            setShowLoading({showLoadingMessage: 'Please wait...', showLoading: true});
            var requestObj:any = {
                method: "POST", 
                url: appAuthDomain("api/authenticate?action="+e), 
                data: {
                    appType: "trans", 
                    password: pass
                }
            };
            requestObj.headers = {'Content-Type': 'multipart/form-data'};
            makeRequests(state, requestObj).then(response=>{
                setTimeout(() => {
                    setShowLoading({showLoadingMessage: 'Please wait...', showLoading: false});
                }, 300);
                if (response.success) {
                    hapticsImpactHeavy();
                    hapticsImpactLight();
                    buttonActions = [{
                        text: 'Okay',
                        cssClass: 'secondary',
                        handler: () => {
                            localStorage.clear();
                            history.push("/login");
                        }
                    }]
                    alertStateVars = {
                        header: response.msg,
                        subHeader: "", 
                        message: response.msg2,
                        inputs: [],
                        buttons: buttonActions
                    };
                    setTimeout(() => {
                        setShowAlert({...alertStateVars, showAlert: true});
                    }, 500)
                }else{
                    hapticsVibrate(300);
                    buttonActions = [{
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            // history.goBack();
                        }
                    },
                    {text: 'Retry',
                        cssClass: 'secondary',
                        handler: () => {
                            doRequest(e, pass);
                        }
                    }]
                    alertStateVars = {
                        header: response.msg,
                        subHeader: "", 
                        message: response.msg2,
                        inputs: [],
                        buttons: buttonActions
                    };
                    setTimeout(() => {
                        setShowAlert({...alertStateVars, showAlert: true});
                    }, 500)
                }
            })
        }
        buttonActions = [
            {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                }
            },
            {
                text: 'Continue',
                cssClass: 'secondary',
                handler: () => {
                    setShowAlert({...alertStateVars, showAlert: false});
                    setTimeout(() => {
                        var myInputs = [
                            {
                                name: 'in_Password',
                                label: 'Enter Password',
                                id: 'passInput',
                                type: "password",
                                placeholder: "Password"
                            },
                        ];
                        var buttonActions = [    
                            {
                                text: 'Continue',
                                cssClass: 'secondary',
                                handler: (alertData: any) => {
                                    doRequest(whatToDo, alertData.in_Password)
                                }
                            },
                        ];
                        let alertStateVars = {
                            header: "For security",
                            subHeader: "", 
                            message: "please enter your password",
                            inputs : myInputs,
                            buttons: buttonActions
                        };
                        setShowAlert({...alertStateVars, showAlert: true});
                    }, 500)
                }
            },
        ];
        alertStateVars = {
            header: "About to "+textToDo,
            subHeader: "", 
            message: "Are you sure you want to "+textToDo+" account?",
            inputs: [],
            buttons: buttonActions
        };
        setShowAlert({...alertStateVars, showAlert: true});
    },[state, history]);
    
    useEffect(()=>{
        if (state.auth && state.auth.user) {
            if(!profileLoaded){
                setProfileLoaded(true);
                (function doSearch(){
                    setShowLoading({showLoadingMessage: "Fetching profile...", showLoading: true});
        
                    let requestObejct = {
                        method: "GET",
                        url: appAuthDomain("api/profile?action=getProfile")
                    };
                    makeRequests(state, requestObejct).then(response=>{
                        setShowLoading(s=>({...s, showLoading: false}));
                        if (response.success) {
                            hapticsImpactHeavy();
                            hapticsImpactLight();
                            var respInfo = response.data;
                            setMyProfile(respInfo);

                            onDeviceStorage('get', 'userInfo').then((userInfo: any)=>{
                                var updatedUserInfo = {...JSON.parse(userInfo), 
                                    profilePic: respInfo.profilePic,
                                    firstname: respInfo.firstname,
                                    lastname: respInfo.lastname,
                                };
                                onDeviceStorage('set', {userInfo: JSON.stringify(updatedUserInfo)});
                                dispatch(setProfilePic(respInfo.profilePic));
                            })
                        } else {
                            hapticsVibrate(300);
                            var buttonActions = [
                                {
                                    text: 'Cancel',
                                    role: 'cancel',
                                    cssClass: 'secondary',
                                    handler: () => {
                                        history.goBack();
                                    }
                                },
                                {
                                    text: 'Retry',
                                    handler: () => {
                                        doSearch();
                                    }
                                }
                            ];
                            var alertStateVars = {header: response.msg2, subHeader: "", message: response.msg2, inputs: [], buttons: buttonActions};
                            setTimeout(() => {
                                setShowAlert({...alertStateVars, showAlert: true});
                            }, 1001);
                        };
                    });
                })();  
            }
            
        } 
    }, [state, history, profileLoaded, dispatch]);
    

    return (
        <IonPage>
            
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="home" text="Back" icon={chevronBack} />
                    </IonButtons>
                    <IonTitle>Profile</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">Profile</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div>
                    <br/>
                    <br/>
            
                    <IonCard>
                        <form action={appAuthDomain("api/profile?action=updateProfile")} onSubmit={submitFunction}>
                            <IonCardHeader>
                                <IonCardTitle>
                                    My Profile
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCard 
                                mode='ios'
                                type="button"
                            >
                                <div className="menuProfile">
                                    <input type="file" accept="image/*" name="changeProfilePic" id="changeProfilePic" onChange={addProfilePic} style={{"display": "none"}} />
                                    <IonAvatar className='profileAVTR' onClick={editProfileOic}>
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
                                        <IonCardSubtitle>{state.user.type}</IonCardSubtitle>
                                        <p>Manage your account (Profile pic).</p>
                                    </div>
                                </div>
                            </IonCard>
                            <IonCardContent className="cardContent">
                                <IonList className="cardContentList">
                                    <IonItem className="profileItems">
                                        <IonLabel position="floating" className="theLabel" >first name</IonLabel>
                                        <IonIcon className="iconPart" icon={person} />
                                        <IonInput style={{width: "87%"}} name="in_Firstname" value={personalProfile.firstname} type="text" className="theInput" required />
                                    </IonItem>
                                    <IonItem className="profileItems">
                                        <IonLabel position="floating" className="theLabel" >Last name</IonLabel>
                                        <IonIcon className="iconPart" icon={person} />
                                        <IonInput style={{width: "87%"}} name="in_Lastname" value={personalProfile.lastname} type="text" className="theInput" required />
                                    </IonItem>
                                    <IonItem className="profileItems"> 
                                        <IonLabel position="floating" className="theLabel" >Email address</IonLabel>
                                        <IonIcon className="iconPart" icon={mail} />
                                        <IonInput style={{width: "87%"}} name="in_Email" value={personalProfile.email} type="email" className="theInput" required />
                                    </IonItem>
                                    <IonItem className="profileItems">
                                        <IonLabel position="floating" className="theLabel" >Cellphone number</IonLabel>
                                        <IonIcon className="iconPart" icon={call} />
                                        <IonInput style={{width: "87%"}} name="in_Phone" value={personalProfile.phone} type="number" className="theInput" required />
                                    </IonItem>
                                </IonList>
                            </IonCardContent>
                            <IonButton expand="block" type='submit'>Save</IonButton>
                        </form>
                    </IonCard>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                Reset password
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent className="cardContent">
                            <form action={appAuthDomain("api/profile")} onSubmit={submitpassword}>
                                <input type="hidden" name="type" defaultValue="resetPassWord" />
                                <input type="hidden" name="resetPassWord"  />
                                <IonList className="cardContentList">
                                    <IonItem className="profileItems">
                                        <IonLabel position="floating" className="theLabel" >Old Password</IonLabel>
                                        <IonIcon className="iconPart" icon={lockClosed} />
                                        <IonInput style={{width: "87%"}} name="oldPassword" type="password" className="theInput" required />
                                    </IonItem>
                                    <IonItem className="profileItems">
                                        <IonLabel position="floating" className="theLabel" >New Password</IonLabel>
                                        <IonIcon className="iconPart" icon={lockClosed} />
                                        <IonInput style={{width: "87%"}} onIonChange={inputChange} name="in_Password" type="password" className="theInput" required />
                                    </IonItem>
                                    <IonItem className="profileItems">
                                        <IonLabel position="floating"  className="theLabel" >Repeat new password</IonLabel>
                                        <IonIcon className="iconPart" icon={lockClosed} />
                                        <IonInput style={{width: "87%"}} onIonChange={inputChange} name="in_PasswordRepeat" type="password" className="theInput" required />
                                    </IonItem>
                                </IonList>
                                <br />
                                <br />
                                {
                                    (password.password !== "")?(
                                        <ul>
                                            <li className={validLength?"criterionMet":""}>
                                                Valid Length: {validLength ? <span>True</span> : <span>False</span>}
                                            </li>
                                            <li className={hasNumber?"criterionMet":""}>
                                                Has a Number: {hasNumber ? <span>True</span> : <span>False</span>}
                                            </li>
                                            <li className={upperCase?"criterionMet":""}>
                                                UpperCase: {upperCase ? <span>True</span> : <span>False</span>}
                                            </li>
                                            <li className={lowerCase?"criterionMet":""}>
                                                LowerCase: {lowerCase ? <span>True</span> : <span>False</span>}
                                            </li>
                                            <li className={specialChar?"criterionMet":""}>
                                                Special Character: {specialChar ? <span>True</span> : <span>False</span>}
                                            </li>
                                            <li className={match?"criterionMet":""}>
                                                Match: {match ? <span>True</span> : <span>False</span>}
                                            </li>
                                        </ul>
                                    ):(
                                        ""
                                    )
                                }
                                
                                <IonButton expand="block" type='submit' disabled={!match}>Reset</IonButton>
                            </form>
                        </IonCardContent>
                    </IonCard>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                Account State
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent className="cardContent">
                            <IonItem onClick={()=>manageAccount('deActivate')}>
                                <IonIcon slot="start" icon={cloudOffline} className="component-icon component-icon-dark" />
                                <IonLabel>De-activate account</IonLabel>
                            </IonItem>
                            <IonItem onClick={()=>manageAccount('delete')}>
                                <IonIcon slot="start" icon={trash} className="component-icon component-icon-dark" />
                                <IonLabel>Delete account</IonLabel>
                            </IonItem>
                        </IonCardContent>
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
                onDidDismiss={() => setShowAlert({...showAlertState, showAlert: false})}
                header={showAlertState.header}
                subHeader={showAlertState.subHeader}
                message={showAlertState.message}
                buttons={showAlertState.buttons}
                inputs={showAlertState.inputs}

            />
        </IonPage>
      );

}
export default Profile;

