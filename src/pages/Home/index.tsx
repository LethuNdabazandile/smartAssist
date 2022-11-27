import { useCallback, useContext, useEffect, useState } from 'react';

import { IonAlert, IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, 
    IonImg, 
    IonItem, 
    IonLabel, 
    IonModal, 
    IonPage, IonRefresher, IonRefresherContent, 
    IonSelect, 
    IonSelectOption, 
    IonSlide, 
    IonSlides, 
    IonTitle, IonToolbar, RefresherEventDetail, useIonViewWillEnter 
} from '@ionic/react';
import { arrowForward, chevronDownCircleOutline, reload } from 'ionicons/icons';
import 'swiper/css';
import 'swiper/css/zoom';

import { AppContext } from '../../contexts/AppContextProvider';
import { useSocket } from '../../contexts/SocketProvider';
import { getCurrentVideo, getMySubjects, openRequester, setCurrentVideos, setMicroTransactions, setPaymentConfirmation } from '../../services/State';
import { appAuthDomain, dateTimeNow, getTimeOfDay, makeRequests, ShowAlertInterface, supportedSubjects, videosSourceDomain } from '../../services/Utils';

import VideosList from '../../components/VideosList';
import './index.css';
import { useLocation } from 'react-router';
import Charts from '../../components/Charts';

const Home:React.FC<any> = ({routerRef, doPlay})=>{
    const { state, dispatch } = useContext(AppContext);
    const socket = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [myColor, setMyColor] = useState("")
    const [choseIsHasDriver, seChoseIsHasDriver] = useState()
    const getDateTimeObject = getTimeOfDay(new Date());
    var loaders = [
        {
            name: "yyy",
            id: 1
        },
        {
            name: "yyy",
            id: 2
        },
        {
            name: "zzz",
            id: 3
        }
    ];
    const { search } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [loadedVideos, setLoadedVideos] = useState<any>(loaders);
    const [careerMSG, setCareerMSG] = useState<any>("");
    const [selectedSubject, setSelectedSubject] = useState<any>("All");
    // const [dataSets, setDataSets] = useState({type: 'line', labels: ['2019', '2020', '2021', '2022'], datasets: [
    //     {label: "Data scientists", data: [10, 15, 22, 30], cubicInterpolationMode:'monotone', borderColor:"blue", backgroundColor: 'blue'},
    //     {label: "Engeneers", data: [12, 7, 24, 27], cubicInterpolationMode:'monotone', borderColor:"Yellow", backgroundColor: 'yellow'}, 
    //     {label: "Software developer", data: [1, 29, 32, 34], cubicInterpolationMode:'monotone', borderColor:"rgba(255, 99, 132, 0.9)", backgroundColor: 'rgba(255, 99, 132, 0.9)'}, 
    //     {label: "Computer scientists", data: [5, 24, 25, 35], cubicInterpolationMode:'monotone', borderColor:"lightBlue", backgroundColor: 'lightBlue'}, 
    //     {label: "Marketing", data: [24, 20, 16, 12], cubicInterpolationMode:'monotone', borderColor:"orange", backgroundColor: 'orange'}, 
    // ]})
    const [showLoadingState, setShowLoading] = useState({showLoadingMessage: "Loading ...", showLoading: false, triggered: false});
    const [showAlertState, setShowAlertState] = useState<ShowAlertInterface>({header: "Alert", subHeader: "If this takes too long, just close tha App and start afresh.", message: "", buttons: [], showAlert: false});

    const mySubjects = getMySubjects(state);
    
    const enterRequestMode = ()=>{
        if ('isSubscribed' in state.user) {
            if (state.user.isSubscribed.paid) {
                dispatch(openRequester());
            } else {
                var confirmService = ()=>{
                    setShowLoading({...showLoadingState, showLoadingMessage: "Sending request...", showLoading: true, triggered: true});
                    var reqObject = {
                        method: "POST",
                        url: appAuthDomain("api/payments?appType=videos&action=addPayments`"),
                        data: {
                            ...state.microTransactions,
                            timeAdded: dateTimeNow()
                        }
                    };
                    var buttonActions = [
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary',
                            handler: ()=>{
                                dispatch(setMicroTransactions({ ...state.ui.microTransactions, show: false }));
                            }
                        },
                        {
                            text: 'Retry',
                            handler: ()=>{
                                confirmService();
                            }
                        }
                    ];
                    var alertStateVars = {
                        header: "Connection issue", 
                        subHeader: "Real-time engine not working.", 
                        message: "Your phone is current not connected to the internet.",
                        inputs: [],
                        buttons: buttonActions
                    };
                    if (socket) {
                        socket.emit('makeSubscription', {...reqObject.data}, (response: any)=>{
                            // console.log('makeSubscription response: ', response);
                            setShowLoading({...showLoadingState, showLoading: false});
                            if (response.status) {
                                var returnedData = response.data;
                                if (reqObject.data.paymentMethod === "card") {
                                    if ('paymentResponse' in returnedData) {
                                        dispatch(setPaymentConfirmation(returnedData.paymentResponse));
                                    } else {
                                        dispatch(openRequester());
                                    }
                                } else {
                                    dispatch(openRequester());
                                };
                            } else if (!response.status) {
                                buttonActions = [
                                    {
                                        text: 'Cancel',
                                        role: 'cancel',
                                        cssClass: 'secondary',
                                        handler: ()=>{
                                            dispatch(setMicroTransactions({ ...state.ui.microTransactions, show: false }));
                                        }
                                    },
                                    {
                                        text: 'Retry',
                                        handler: ()=>{
                                            confirmService();
                                        }
                                    }
                                ];
                                alertStateVars = {
                                    header: response.msg, 
                                    subHeader: response.msg2, 
                                    message: response.msg3,
                                    inputs: [],
                                    buttons: buttonActions
                                };
                                setTimeout(() => {
                                    setShowAlertState({...alertStateVars, showAlert: true}); 
                                }, 500);
                            }
                        });
                    } else {
                        setTimeout(() => {
                            setShowAlertState({...alertStateVars, showAlert: true}); 
                        }, 500);
                    }
                };
                var selectedProduct = {product: {name: 'appimateRequest', amount: {currency: "ZAR", value: "5"}}};
                dispatch(setMicroTransactions({selectedProduct, confirmService}));
                dispatch(setMicroTransactions({ show: true, presentingElement: routerRef }));
            }
        } else {
            dispatch(openRequester());
        };
    }

    
    const goToVideos = ()=>{
        var loadedVideosCurrent;
        if (loadedVideos) {
            loadedVideosCurrent = loadedVideos;
        } else {
            loadedVideosCurrent = [];
        };
        dispatch(setCurrentVideos(loadedVideosCurrent))
        // history.push("/videos");
    }
    
    const videosFunct = (response: any)=>{
        // setLoadedVideos(loaders);
        setTimeout(() => {
            if (response.success) {
                var fullData = response.data;
                setLoadedVideos(fullData);
            } else {
                // setLoadedVideos(null);
            }
        }, 500);
    }
    const fetchFunction =  useCallback((url: string, callbackFunction: Function) => {
        var requestObj = { method: "GET", url: url };
        makeRequests(state, requestObj).then(response=>{
            // console.log(response)
            callbackFunction(response);
        });
    }, [state]);
    
    const doRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        const callbackFunct = (response: any)=>{
            event.detail.complete();
            videosFunct(response);
        }
        fetchFunction(videosSourceDomain("api/videos?appType=videos&action=suggestions&subject="+selectedSubject+"&listSize=3"), callbackFunct);
    }
    const fetchHomeContent = useCallback((selectedSubject)=>{
        fetchFunction(videosSourceDomain("api/videos?appType=videos&action=suggestions&subject="+selectedSubject+"&listSize=3"), videosFunct);
    }, [fetchFunction]);


    useEffect(()=>{
        if (!isLoading) {
            setIsLoading(true);
            fetchHomeContent(selectedSubject);
        };
    }, [isLoading, fetchHomeContent, selectedSubject]);
    useEffect(()=>{
        if (search) {
            let query = new URLSearchParams(search);
            if (query.has("v") || query.has("vid")) {
              let vid = query.get("v") || query.get("vid");
              let subject = query.get("s");
              let heading = query.get("h");
              let timeStamp = query.get("t");
    
              if (!getCurrentVideo(state)) {
                if (vid) {
                    setTimeout(() => {
                        doPlay({id: vid, subject, heading, timeStamp}, [{id: vid, subject, heading, timeStamp}]);
                    }, 300);
                }
              }
            }
        };
    }, [search, state, doPlay]);
    useIonViewWillEnter(() => {
        const bottomNav = document.getElementById("defaultIonicTabBar");
        if (bottomNav) {
            bottomNav.style.display = "flex";
        };
        if (!isLoading) {
            setIsLoading(true);
        }
    });

    const slideOpts = {
        initialSlide: 0,
        // speed: 0.2,
        speed: 400, slidesPerView: 1.1, autoplay: {delay: 2500}
    };
    const chooseVehicleDriver = (val: any)=>{
        // console.log(val);
        seChoseIsHasDriver(val);
    }
    const submitFunction = (e: any, optionalValues: any)=>{
        setShowLoading({...showLoadingState, showLoadingMessage: "Checking data...", showLoading: true, triggered: true});
        e.preventDefault();
        e.stopPropagation();
        var formData = new FormData(e.target);
        var requestObject = Object.fromEntries(formData.entries());
        console.log(requestObject.age);
        var mgsResults = '';
        setMyColor('green')
        if(requestObject.field === 'science'){
            mgsResults = 'You stand a chance of getting a job, the skills in your feild are in high demand.';
        }else if (requestObject.field === 'commerce'){
            setMyColor('orange')
            mgsResults = 'You stand a chance of getting a job, but the skills in your feild are not in hight demand.';
        }else if(requestObject.field === 'General' || requestObject.field === 'Others'){
            setMyColor('red')
            mgsResults = 'Your chances of getting a job are slim, the skills in your feild are not in demand, ';
            if(requestObject.field === 'General' && requestObject.in_grade !== "12"){
                mgsResults += " You should consider changing your subjects."
            }else if(requestObject.field === 'Others'){
                mgsResults += " You should consider changing your course, most fields for in this category are not in demand."  
            }
        }else if (requestObject.field === 'IT'){
            mgsResults = 'You stand a good chance of getting a job, skills in your feild are in high demand.';
        }
        setTimeout(() => {
            setCareerMSG(mgsResults)
            setShowLoading({...showLoadingState, showLoading: false});
        }, 500);
    }

    console.log(state.user.homeData.statsUpdate)
    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonTitle>Smart Assist</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">Smart Assist</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {/* <IonSearchbar mode='ios' /> */}
                <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
                    <IonRefresherContent
                        pullingIcon={chevronDownCircleOutline}
                        pullingText="Pull to refresh"
                        refreshingSpinner="circles"
                        refreshingText="Refreshing...">
                    </IonRefresherContent>
                </IonRefresher>
                <div className='homeTopSection'>
                    <div className='welcomeSection'>
                    <IonSlides pager={true} options={slideOpts}>
                        <IonSlide>
                            <IonCard className="topSliderCard" button>
                                <IonImg src="assets/img/maxresdefault.jpg"/>
                            </IonCard>
                        </IonSlide>
                        <IonSlide>
                            <IonCard className="topSliderCard" button>
                                <IonImg src="assets/img/office-stationary-supplies-500x500.png"/>
                            </IonCard>
                        </IonSlide>
                        <IonSlide>
                            <IonCard className="topSliderCard" button>
                                <IonImg src="assets/img/ad7.jpg"/>
                            </IonCard>
                        </IonSlide>
                    </IonSlides>
                    </div>
                    <div>
                        <IonCard routerLink='/library' button>
                            {
                                (state.user.homeData.statsUpdate)?(
                                    <Charts data={(state.user.homeData.statsUpdate.futureTrends)?(state.user.homeData.statsUpdate.futureTrends):([])} />
                                ):("")
                            }
                        </IonCard>
                    </div>
                    <IonButton mode='ios' expand="block" className='' onClick={() => setIsOpen(true)}>Career guider</IonButton>
                </div>
                <br/>
                <br/><br/>
                <br/><br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <div className='subjectsSliderContainer'>
                    {
                        mySubjects.map((subject: any, key: number)=>{
                            return (
                                    <IonCard key={key} 
                                    className={`subjectsSliders ${(subject.code === selectedSubject)?('selectedSubject'):('')} ${supportedSubjects[subject.code].colorClass}`}
                                    onClick={()=>{ setSelectedSubject(subject.code) }}
                                    >
                                        <p>
                                            {supportedSubjects[subject.code].name}
                                        </p>
                                    </IonCard>
                            )
                        })
                    }
                </div>
                {
                    (loadedVideos)?(
                        <VideosList loadedVideos={loadedVideos} doPlay={doPlay}/>
                    ):(
                        <div className='videoLoadReloadHolder'>
                            <IonButton mode='ios' className='videoLoadReload' onClick={()=>{fetchHomeContent(selectedSubject)}}><IonIcon icon={reload} />Retry</IonButton>
                        </div>
                    )
                }
                <div className='moreVideosHolder'>
                    <IonButton mode='ios' className='moreVideos' routerLink='/videos' onClick={goToVideos}>More videos <IonIcon icon={arrowForward} /></IonButton>
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
            </IonContent>
            {/* <IonFab className='requestBtnFab' >
                <IonButton mode='ios' className='requestBtn' onClick={enterRequestMode}>Request</IonButton>
            </IonFab> */}
            <IonModal 
            mode='ios'
            ref={routerRef}
            presentingElement= {routerRef.current}
            swipeToClose={true}
            isOpen={isOpen}>
                <IonHeader>
                    <IonToolbar>
                    <IonTitle>Career guider</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
                    </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <p style={{textAlign: "center"}}>We will use the your information to predict on which career to path to take</p>
                    <form onSubmit={(evt)=>{submitFunction(evt, null)}}>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Your age</IonLabel>
                        <IonSelect 
                            interface="action-sheet"
                            placeholder="Select one"
                            name='age'
                            aria-required>
                             <IonSelectOption value="20" >13-20 years</IonSelectOption>
                             <IonSelectOption value="25" >20-25 years</IonSelectOption>
                             <IonSelectOption value="30" >25-30 years</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >School level</IonLabel>
                        <IonSelect 
                            interface="action-sheet"
                            placeholder="Select one"
                            name='in_level'
                            onIonChange={(e)=>chooseVehicleDriver(e.detail.value)}
                            aria-required>
                             <IonSelectOption value="highSchool" >High school</IonSelectOption>
                             <IonSelectOption value="Varsity" >University</IonSelectOption>
                             <IonSelectOption value="college" >College</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    {
                        (choseIsHasDriver === 'highSchool')?(
                            <>
                            <IonItem className="myFormInputs">
                                <IonLabel position="floating" >Grade</IonLabel>
                                <IonSelect 
                                    interface="action-sheet"
                                    placeholder="Select one"
                                    name='in_grade'
                                    // onIonChange={(e)=>chooseVehicleDriver(e.detail.value)}
                                    aria-required>
                                    <IonSelectOption value="10" >Grade 10</IonSelectOption>
                                    <IonSelectOption value="11" >Grade 11</IonSelectOption>
                                    <IonSelectOption value="12" >Grade 12</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                            <IonItem className="myFormInputs">
                                <IonLabel position="floating" >School subjects</IonLabel>
                                <IonSelect 
                                    interface="action-sheet"
                                    placeholder="Select one"
                                    name='field'
                                    // onIonChange={(e)=>chooseVehicleDriver(e.detail.value)}
                                    aria-required>
                                    <IonSelectOption value="science" >Science (Physics, Maths, life science & others)</IonSelectOption>
                                    <IonSelectOption value="commerce" >Commerce (Account, Maths, Business studies  & others)</IonSelectOption>
                                    <IonSelectOption value="General" >General (History, Maths lit & others)</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                            </>
                        ):(
                            <IonItem className="myFormInputs">
                                <IonLabel position="floating" >Field</IonLabel>
                                <IonSelect 
                                    interface="action-sheet"
                                    placeholder="Select one"
                                    name='field'
                                    // onIonChange={(e)=>chooseVehicleDriver(e.detail.value)}
                                    aria-required>
                                    <IonSelectOption value="science" >Science (Engeneering, Mechanical, Chemical and others)</IonSelectOption>
                                    <IonSelectOption value="commerce" >Commerce</IonSelectOption>
                                    <IonSelectOption value="IT" >Computer science (IT, IS and others)</IonSelectOption>
                                    <IonSelectOption value="Others" >Others</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                        )
                    }
                        <IonButton mode='ios' expand="block" className='' type='submit'>Submit</IonButton>
                    
                    </form>
                    {
                        (careerMSG !=="")?(
                        <IonCard>
                            <p style={{color: myColor}}>{careerMSG}</p>
                        </IonCard>
                        ):("")
                    }
                    
                </IonContent>
            </IonModal>
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
    );
}

export default Home;