import { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { IonBackButton, IonButton, IonButtons, IonCard, IonContent, IonFab, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonTitle, IonToolbar, RefresherEventDetail, useIonToast, useIonViewWillEnter } from '@ionic/react';
import { chevronBack, chevronDownCircleOutline, reload } from 'ionicons/icons';
import 'swiper/css';
import 'swiper/css/zoom';

import { AppContext } from '../../contexts/AppContextProvider';
import { getCurrentVideo, getCurrentVideos, getMySubjects, openRequester } from '../../services/State';
import { localDomain, makeRequests, supportedSubjects, videosSourceDomain } from '../../services/Utils';

import VideosList from '../../components/VideosList';

import './index.css';

const Home:React.FC<any> = ({ doPlay})=>{
    const { state, dispatch } = useContext(AppContext);
    var currentVideos =  getCurrentVideos(state);
    const mySubjects = getMySubjects(state);
    
    const [searchVideosText, setSearchVideosText] = useState("");
    const [searchVideosList, setSearchVideosList] = useState<any>([]);
    const [isInfiniteDisabled, setInfiniteDisabled] = useState(false);
    const [loadedVideos, setLoadedVideos] = useState<any>(currentVideos);
    const [categoryChanged, setCategoryChanged] = useState<boolean>(false);
    const [selectedSubject, setSelectedSubject] = useState<any>("All");
    const [present, dismiss] = useIonToast();
    const { search } = useLocation();
    
    const changeCategory = (subject: string)=>{
        if (subject !== selectedSubject) {
            setCategoryChanged(true);
        };
        setSelectedSubject(subject);
    }

    const enterRequestMode = ()=>{
        dispatch(openRequester());
    }

    const doRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        const callbackFunct = ()=>{
            event.detail.complete();
        }
        pushData(selectedSubject, callbackFunct, 1);
    }


    const searchFunc = (keyWords: string)=>{
        var requestObj = {
            method: 'GET',
            url: localDomain("api/search?appType=videos&focus=videos&q="+keyWords)
        };
        setSearchVideosText(keyWords);
        if (keyWords.length > 0) {
            makeRequests(state, requestObj).then((response)=>{
                // console.log(response);
                if (response.success) {
                    setSearchVideosList(response.data);
                } else {
                    var testUsers:any = [];
                    setSearchVideosList(testUsers);
                }
            });
        } else {
            var testUsers:any = [];
            setSearchVideosList(testUsers);
        }
    }
    const pushData = useCallback((selectedSubject: string, callback: Function, direction: number) => {
        var categoryHadChanged = categoryChanged;
        var lastVidID:number = 0;
        if (loadedVideos) {
            if (loadedVideos.length > 0) {
                if (!categoryHadChanged) {
                    var lastVideo = loadedVideos[loadedVideos.length - 1];
                    if (typeof lastVideo === 'object') {
                        if ('id' in lastVideo) {
                            lastVidID = lastVideo['id'];
                        }
                    }
                }
            };
        };
        var requestObj = {
            method: "GET", 
            url: videosSourceDomain("api/videos?appType=videos&action=suggestions&subject="+selectedSubject+"&listSize=9&startFrom="+lastVidID+"&direction="+direction), 
        };
        // console.log(categoryHadChanged, requestObj.url);
        makeRequests(state, requestObj).then(response=>{
            setCategoryChanged(false);
            callback();
            if (response.success) {
                var newData = response.data;
                if ((loadedVideos === currentVideos)||(categoryHadChanged)) {
                    setLoadedVideos([
                        // ...newData.videos
                        ...newData
                    ]);
                } else {
                    var lastVids = loadedVideos?loadedVideos:[];
                    setLoadedVideos([
                        ...lastVids,
                        // ...newData.videos
                        ...newData
                    ]);
                }
            } else {
                setLoadedVideos(null);
                present({
                    position: "bottom",
                    buttons: [{ text: 'hide', handler: () => dismiss() }],
                    message: response.msg,
                    duration: 2000
                });
            };
        });
    }, [state, loadedVideos, currentVideos, categoryChanged, dismiss, present])
    const loadData = (ev: any, direction: number) => {
        setTimeout(() => {
            const callbackFunct = ()=>{
                ev.target.complete();
            };
            pushData(selectedSubject, callbackFunct, direction);
            if (loadedVideos.length === 1000) {
                setInfiniteDisabled(true);
            };
        }, 500);
    };
    useEffect(()=>{
        if (categoryChanged) {
            pushData(selectedSubject, ()=>{}, 1);
        }
    }, [categoryChanged, pushData, selectedSubject]);
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
        if (loadedVideos) {
            if (loadedVideos.length < 4) {
                setTimeout(() => {
                    pushData(selectedSubject, ()=>{}, 1);
                }, 500);
            }
        }
    });


    return (
        <IonPage>
            <IonHeader mode="ios">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="home" text="Back" icon={chevronBack} />
                    </IonButtons>
                    <IonTitle>Videos</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader mode="ios" collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Videos</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonSearchbar mode='ios' onIonChange={e => searchFunc(e.detail.value!)} animated showCancelButton='focus'/>
                <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
                    <IonRefresherContent
                        pullingIcon={chevronDownCircleOutline}
                        pullingText="Pull to refresh"
                        refreshingSpinner="circles"
                        refreshingText="Refreshing...">
                    </IonRefresherContent>
                </IonRefresher>
                <br/>
                {
                    ( (searchVideosList.length>0)||(searchVideosText.replace(" ", "")!=="") )?(
                        <>
                        {
                            (searchVideosList.length>0)?(
                                <VideosList loadedVideos={searchVideosList} doPlay={doPlay}/>
                            ):(
                                
                                <p className='searchUserParagraph'>
                                    {"No matches found for: "}
                                    <span>
                                        {"'"+searchVideosText+"'"}
                                    </span>
                                </p>
                            )
                        }
                        </>
                    ):(
                        <>
                        <div className='subjectsSliderContainer'>
                            {
                                mySubjects.map((subject: any, key: number)=>{
                                    return (
                                        <IonCard key={key} 
                                        className={`subjectsSliders ${(subject.code === selectedSubject)?('selectedSubject'):('')} ${supportedSubjects[subject.code].colorClass}`}
                                        onClick={()=>{changeCategory(subject.code)}}
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
                                    <IonButton mode="ios" className='videoLoadReload' onClick={()=>{pushData(selectedSubject, ()=>{}, -1)}}><IonIcon icon={reload} />Retry</IonButton>
                                </div>
                            )
                        }
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <IonInfiniteScroll
                            onIonInfinite={(evt)=>{loadData(evt, 1)}}
                            threshold="100px"
                            disabled={isInfiniteDisabled}
                        >
                            <IonInfiniteScrollContent
                                loadingSpinner="bubbles"
                                loadingText="Loading more videos..."
                            ></IonInfiniteScrollContent>
                        </IonInfiniteScroll>
                        </>
                    )
                }
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
            </IonContent>
            <IonFab className='requestBtnFab' >
                <IonButton mode="ios" className='requestBtn' onClick={enterRequestMode}>Request</IonButton>
            </IonFab>
        </IonPage>
    );
}

export default Home;