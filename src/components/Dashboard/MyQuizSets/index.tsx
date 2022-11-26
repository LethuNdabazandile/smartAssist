
import { useCallback, useContext, useEffect, useState } from 'react';
import { IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonRefresher, 
    IonRefresherContent, IonSearchbar, IonThumbnail, RefresherEventDetail
} from '@ionic/react';
import { chevronDownCircleOutline, pencil, } from 'ionicons/icons';

import { AppContext } from '../../../contexts/AppContextProvider';
// import { AppContext } from '../../../services/State';
import { localDomain, makeRequests, videoThumbDomain } from '../../../services/Utils';
import './index.css';
const MyQuizSets:React.FC<any> = ({showMyModal, setShowLoading, setShowAlertState})=>{
    const {state} = useContext(AppContext);

    const [searchText, setSearchText] = useState('');
    const [initialDataLoad, setInitialDataLoad] = useState<boolean>(false);
    const [listOfVideos, setListOfVideos] = useState<any>([]);
    const [isInfiniteDisabled, setInfiniteDisabled] = useState(false);


    const videoAction = (video: any)=>{
        var buttonActions = [
            {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                    
                }
            },
            {
                text: 'Edit',
                handler: () => {
                    showMyModal(6, video);
                }
            }
        ];
        var alertStateVars = {header: "Actions", subHeader: "", message: "What do you want to do?", buttons: buttonActions};
        setShowAlertState({...alertStateVars, showAlert: true});
    }
    const videoPreview = (video: any)=>{

    }

    const pullMyVideos = useCallback((callback, direction)=>{
        setInitialDataLoad(true);
        var startFrom:number = 0;
        if (listOfVideos.length > 0) {
            var oldestFound = listOfVideos[listOfVideos.length - 1];
            var lastVideo = listOfVideos[0];
            if (typeof lastVideo === 'object') {
                if ('id' in lastVideo) {
                    if (direction < 0) {
                        startFrom = oldestFound['id'];
                    } else {
                        startFrom = lastVideo['id'];
                    }
                }
            }
        };

        var requestObj = {
            method: "GET", 
            url: localDomain("api/adminStream?appType=videos&action=pullQuizSets&listSize=10&direction="+direction+"&startFrom="+startFrom), 
        };
        makeRequests(state, requestObj).then(response=>{
            callback();
            // console.log(response)
            var buttonActions = [];

            if (response.success) {
                var newData = response.data;
                setListOfVideos([
                    ...listOfVideos, ...newData
                ]);
            } else {
                if(response.action){
                    buttonActions = [
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary',
                            handler: () => {
                                console.log('Confirm Cancel');
                            }
                        },
                        {
                            text: 'Retry',
                            handler: () => {
                                pullMyVideos(callback, direction);
                            }
                        }
                    ];
                    var alertStateVars = {header: "Error encountered", subHeader: "", message: response.message, buttons: buttonActions};
                    setTimeout(() => {
                        setShowAlertState({...alertStateVars, showAlert: true});
                    }, 1001);
                }else{
                    // setListOfVideos([]);
                }
            }
        });
    }, [state, setShowAlertState, listOfVideos]);
    

    const loadData = (ev: any, direction: number) => {
        setTimeout(() => {
            const callbackFunct = ()=>{
                ev.target.complete();
            };
            pullMyVideos(callbackFunct, direction);            
            if (listOfVideos.length === 1000) {
                setInfiniteDisabled(true);
            };
        }, 500);
    }
    const doRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        const callbackFunct = ()=>{
            event.detail.complete();
        }
        pullMyVideos(callbackFunct, 1);
    }
    useEffect(()=>{
        if (listOfVideos.length < 1) {
            if (!initialDataLoad) {
                pullMyVideos(()=>{}, -1);
            }
        }
    }, [pullMyVideos, initialDataLoad, listOfVideos]);

    return (
        <>
            <IonSearchbar
                value={searchText} onIonChange={e => setSearchText(e.detail.value!)}
                animated
                showCancelButton="focus"
            ></IonSearchbar>
            <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
                <IonRefresherContent
                    pullingIcon={chevronDownCircleOutline}
                    pullingText="Pull to refresh"
                    refreshingSpinner="circles"
                    refreshingText="Refreshing...">
                </IonRefresherContent>
            </IonRefresher>
           {
               (listOfVideos.length > 0)?(
                    listOfVideos.map((theVideo: any, key: number)=>{
                        return <IonItem key={key}  button>
                            <IonThumbnail slot="start" className='libraryThumbnail' onClick={()=>videoPreview(theVideo)}>
                                <img alt={theVideo.heading} src={videoThumbDomain(theVideo.thumbnail)}/>
                            </IonThumbnail>
                            <IonLabel onClick={()=>videoPreview(theVideo)}>
                                <h2>{theVideo.heading}</h2>
                                <p>{theVideo.description}</p>
                            </IonLabel>
                            <IonIcon icon={pencil} onClick={()=>videoAction(theVideo)}/>
                        </IonItem>
                    })
                ):(
                    <p style={{textAlign: "center"}}>No quiz sets available</p>
               )
           }
           <IonInfiniteScroll
           onIonInfinite={(evt)=>{loadData(evt, -1)}}
           threshold="100px"
           disabled={isInfiniteDisabled}
           >
               <IonInfiniteScrollContent
                   loadingSpinner="bubbles"
                   loadingText="Loading more questions..."
               ></IonInfiniteScrollContent>
           </IonInfiniteScroll>
        </>
    )
}

export default MyQuizSets;