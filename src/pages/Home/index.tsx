import { useCallback, useContext, useEffect, useState } from 'react';

import { IonAlert, IonBadge, IonButton, IonCard, IonCardTitle, IonContent, IonFab, IonHeader, IonIcon, 
    IonPage, IonRefresher, IonRefresherContent, 
    IonTitle, IonToolbar, RefresherEventDetail, useIonViewWillEnter 
} from '@ionic/react';
import { arrowForward, checkmarkCircle, chevronDownCircleOutline, create, reload, trophy } from 'ionicons/icons';
import 'swiper/css';
import 'swiper/css/zoom';

import { AppContext } from '../../contexts/AppContextProvider';
import { useSocket } from '../../contexts/SocketProvider';
import { getCurrentVideo, getMySubjects, openRequester, setCurrentVideos, setMicroTransactions, setPaymentConfirmation } from '../../services/State';
import { appAuthDomain, dateTimeNow, getTimeOfDay, makeRequests, ShowAlertInterface, supportedSubjects, videosSourceDomain } from '../../services/Utils';

import VideosList from '../../components/VideosList';
import './index.css';
import { useLocation } from 'react-router';

const Home:React.FC<any> = ({routerRef, doPlay})=>{
    const { state, dispatch } = useContext(AppContext);
    const socket = useSocket();

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
    const [selectedSubject, setSelectedSubject] = useState<any>("All");
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

    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonTitle>Appimate</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">Appimate</IonTitle>
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
                        <IonCard className='homeAvgPerformance' routerLink='/quiz' mode='ios'>
                            <div  style={{float:"left", width: "70%"}}>
                                <IonCardTitle className='homeWelcomeText'>
                                    <span className={'onlineState onlineState'+state.socketConnection} ></span>
                                    {
                                        (state.auth.user)?(
                                            "Good "+getDateTimeObject.name+" "+state.auth.user.firstname
                                        ):(
                                            "Good "+getDateTimeObject.name
                                        )
                                    }
                                </IonCardTitle>
                                <p className={'homeMesgext'}>
                                    {
                                        (state.user.homeData)?(
                                            <>
                                            {(state.user.homeData.message)?(state.user.homeData.message):("My current progress")}
                                            </>
                                        ):(
                                            "My current progress"
                                        )
                                    }
                                </p>
                            </div>
                            <div className={'scoreDiv'} style={{float:"left", width: "25%"}}>
                                <IonIcon icon={checkmarkCircle} className="scoreIcon"/>
                                <p className={'scoreText'}>
                                    {
                                        (state.user.homeData)?(
                                            <>
                                            {(state.user.homeData.points)?(state.user.homeData.points):("0")}
                                            </>
                                        ):(
                                            "0"
                                        )
                                    }
                                </p>
                            </div>
                        </IonCard>
                    </div>
                    <div className='quizRelatedInfo'>
                        <div >
                            <IonCard  className="homeGridCol2" routerLink="/quiz">
                                {
                                    (state.user.homeData.activities>0)?(
                                    <IonBadge color="danger" style={{right: "5%", position: "absolute", zIndex: 1000}}>
                                        {
                                            (state.user.homeData.activities > 99)?(
                                                `${state.user.homeData.activities}+`
                                            ):(
                                                state.user.homeData.activities
                                            )
                                        }
                                    </IonBadge>
                                    ):("")
                                }
                                <IonIcon icon={create} className="gridIcons"/>
                                <IonCardTitle className='gridTitle'>Quiz</IonCardTitle>
                            </IonCard>
                        </div>
                        <div >
                            <IonCard className="homeGridCol2" routerLink='/leaderboard'>
                                <IonIcon icon={trophy} className="gridIcons"/>
                                <IonCardTitle className='gridTitle'>Leaderboard</IonCardTitle>
                            </IonCard>
                        </div>
                    </div>
                </div>
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
            <IonFab className='requestBtnFab' >
                <IonButton mode='ios' className='requestBtn' onClick={enterRequestMode}>Request</IonButton>
            </IonFab>
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