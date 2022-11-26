import { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import { IonContent, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonListHeader, IonPage, IonSearchbar, IonSegment, IonSegmentButton, IonThumbnail, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { cloudDownload, removeCircleOutline, trashBin } from 'ionicons/icons';

import { AppContext } from '../../contexts/AppContextProvider';
import {  getFavVideos, getOfflineVideos, getRecentVideos, isOfflineVideo, setFavVideo, setRecentVideos, unsetRecentVideo } from '../../services/State';
import { appAuthDomain, capitalize, localDomain, makeRequests, onDeviceStorage, videoThumbDomain } from '../../services/Utils';

import './index.css';

const Library:React.FC<any> = ({doPlay})=>{
    const { state, dispatch } = useContext(AppContext);


    var recentVideos = getRecentVideos(state);
    var favVideos = getFavVideos(state);
    var offlineVideos = getOfflineVideos(state);

    const ionListRef:any = useRef();

    const [searchText, setSearchText] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [segDisable, setSegDisable] = useState(false);
    const [segment, setSegment] = useState("recents");
    const [searchedContent, setSearchedContent] = useState([]);
    const [localLibrary, setLocalLibrary] = useState({recentVideos, favVideos, offlineVideos});

    const history = useHistory();


    const onSegment = (seg: any)=>{
        setSegment(seg);
    };
    const doPlayFunction = (video: any, loadedVideos: any)=>{
        // history.push('/watch?vid='+video.id);
        history.push('?vid='+video.id);
        doPlay(video, loadedVideos);
    };

    const actOnLibraryItem = (action: any, libItem: any)=>{
        if (action === 0) {
            var moreList = [];
            if (libItem.offlineVideos) {
                moreList = libItem.offlineVideos;
            } else if (libItem.recentVideos) {
                moreList = libItem.recentVideos;
            } else if (libItem.favVideos) {
                moreList = libItem.favVideos;
            };
            doPlayFunction(libItem.video, moreList);
        } else if (action === -1) {
            onDeviceStorage('get', 'library').then((localLibrary: any)=>{
                var localLibraryPulled = localLibrary || "{}";
                localLibraryPulled = JSON.parse(localLibraryPulled);

                var keepOnLibrary = {...localLibraryPulled};
                if (('recentVideos' in localLibraryPulled)&&(libItem.recentVideos)) {
                  const newRecentVideos = (localLibraryPulled.recentVideos).filter((t: any) => t.id !== libItem.video.id);
                  keepOnLibrary.recentVideos = [...newRecentVideos];
                }
                if (('favVideos' in localLibraryPulled)&&(libItem.favVideos)) {
                    const newFavVideos = (localLibraryPulled.favVideos).filter((t: any) => t.id !== libItem.video.id);
                    keepOnLibrary.favVideos = [...newFavVideos];
                }
                if (('offlineVideos' in localLibraryPulled) && (libItem.offlineVideos)) {
                    const newOfflineVideos = (localLibraryPulled.offlineVideos).filter((t: any) => t.id !== libItem.video.id);
                    keepOnLibrary.offlineVideos = [...newOfflineVideos];
                };
                onDeviceStorage('set', {library: JSON.stringify(keepOnLibrary)});

                dispatch(unsetRecentVideo(libItem));
                setLocalLibrary({
                    ...localLibrary,
                    ...keepOnLibrary,
                });
                ionListRef?.current?.closeSlidingItems();
            });
        } else {

        };
    }

    const searchFunc = (keyWords: string)=>{
        if (state.isOnline) {
            var requestObj = {
                method: 'GET',
                url: localDomain("api/search?appType=videos&focus=library&q="+keyWords)
            };
            setSearchText(keyWords);
            if (keyWords.length > 0) {
                makeRequests(state, requestObj).then((response)=>{
                    if (response.success) {
                        setSearchedContent(response.data);
                    } else {
                        let testUsers:any = [];
                        setSearchedContent(testUsers);
                    }
                });
            } else {
                let testUsers:any = [];
                setSearchedContent(testUsers);
            }
        } else {
            var testUsers:any = [];
            setSearchedContent(testUsers);
        }
    }

    
    useIonViewWillEnter(() => {
        onDeviceStorage('get', 'library').then((localLibrary: any)=>{
            var localLibraryPulled = localLibrary || "{}";
            localLibraryPulled = JSON.parse(localLibraryPulled);
            if (localLibraryPulled['recentVideos']) {
                recentVideos = localLibraryPulled.recentVideos;
                dispatch(setRecentVideos(recentVideos));
            };
            if (localLibraryPulled['favVideos']) {
                favVideos = localLibraryPulled.favVideos;
            };
            if (localLibraryPulled['offlineVideos']) {
                offlineVideos = localLibraryPulled.offlineVideos;
            };
            setLocalLibrary({
                ...localLibrary,
                recentVideos,
                favVideos,
                offlineVideos
            })
        });
    });
    
    useEffect(()=>{
        if (!state.isOnline) {
            setSegDisable(false);
        }
    }, [state.isOnline]);


    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonTitle>Your Library</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader mode='ios' collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Your Library</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div>
                    <IonSearchbar mode='ios' onIonChange={(e)=>{searchFunc(e.detail.value!)}} onIonFocus={()=>setSearchFocused(true)} onIonBlur={()=>setSearchFocused(false)} animated showCancelButton='focus'/>
                </div>
                <br/>
                <br/>
                {
                    (!searchFocused && (searchText.length < 1))?(
                        <IonSegment mode='ios' value={segment} onIonChange={e => onSegment(e.detail.value!)} disabled={segDisable}>
                            <IonSegmentButton value="recents">
                                <IonLabel>Recents </IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="favourites">
                                <IonLabel>Favourites</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="offline">
                                <IonLabel>Offline</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    ):("")
                }
                <IonList mode='ios' ref={ionListRef}>
                    {
                        (!searchFocused && (searchText.length < 1))?(
                            <>
                            <IonListHeader mode='ios'>
                                <IonLabel>{capitalize(segment)} Videos</IonLabel>
                            </IonListHeader>
                            {
                                (segDisable || (segment === "offline"))?(
                                    <>
                                    {localLibrary.offlineVideos.map((video: any, key: number) => (
                                        <IonItemSliding key={key} >
                                            <IonItemOptions side="start" >
                                                <IonItemOption onClick={() => { actOnLibraryItem(-1, {video, offlineVideos: localLibrary.offlineVideos})}}>
                                                    <IonIcon icon={trashBin}/>
                                                    delete
                                                </IonItemOption>
                                            </IonItemOptions>
                                            <IonItem onClick={(e: any) => {
                                                // e.persist();
                                                actOnLibraryItem(0, {video, offlineVideos: localLibrary.offlineVideos});
                                            }} button>
                                                <IonThumbnail slot="start" className='libraryThumbnail'>
                                                    <img alt={video.heading} src={videoThumbDomain(video.thumbnail)}/>
                                                    </IonThumbnail>
                                                <IonLabel>
                                                    <h2>{video.heading}</h2>
                                                    <p>{video.description}</p>
                                                </IonLabel>
                                                {(isOfflineVideo(state, video))?(<IonIcon className="offline-indicator" icon={cloudDownload} slot="end"/>):""}
                                            </IonItem>
                                            {/* <IonItemOptions side="end" >
                                                <IonItemOption onClick={() => { actOnLibraryItem(0, video)}}>
                                                    <IonIcon icon={ellipsisVertical}/>
                                                    More
                                                </IonItemOption>
                                            </IonItemOptions> */}
                                        </IonItemSliding>
                                    ))}
                                    </>
                                ):(
                                    <>
                                    {
                                        (segment === "recents")?(
                                            <>
                                            {localLibrary.recentVideos.map((video: any, key: number) => (
                                                <IonItemSliding key={key} >
                                                    <IonItemOptions side="start" >
                                                        <IonItemOption onClick={() => { actOnLibraryItem(-1, {video, recentVideos: localLibrary.recentVideos})}}>
                                                            <IonIcon icon={trashBin}/>
                                                            delete
                                                        </IonItemOption>
                                                    </IonItemOptions>

                                                    <IonItem onClick={(e: any) => {
                                                        // e.persist();
                                                        actOnLibraryItem(0, {video, recentVideos: localLibrary.recentVideos});
                                                    }} button>
                                                        <IonThumbnail slot="start" className='libraryThumbnail'>
                                                        <img alt={video.heading} src={videoThumbDomain(video.thumbnail)}/>
                                                        </IonThumbnail>
                                                        <IonLabel>
                                                        <h2>{video.heading}</h2>
                                                        <p>{video.description}</p>
                                                        </IonLabel>
                                                        {(isOfflineVideo(state, video))?(<IonIcon className="offline-indicator" icon={cloudDownload} slot="end"/>):""}
                                                    </IonItem>
                                                    {/* <IonItemOptions side="end" >
                                                        <IonItemOption onClick={() => { actOnLibraryItem(1, video)}}>
                                                            <IonIcon icon={ellipsisVertical}/>
                                                            More
                                                        </IonItemOption>
                                                    </IonItemOptions> */}
                                                </IonItemSliding>
                                            ))}
                                            </>
                                        ):(
                                            <>
                                            {localLibrary.favVideos.map((video: any, key: number) => (
                                                <IonItem key={key} onClick={() => doPlayFunction(video, localLibrary.favVideos)} button>
                                                    <IonThumbnail slot="start" className='libraryThumbnail'>
                                                        <img alt={video.heading} src={videoThumbDomain(video.thumbnail)}/>
                                                    </IonThumbnail>
                                                    <IonLabel>
                                                        <h2>{video.heading}</h2>
                                                        <p>{video.description}</p>
                                                    </IonLabel>
                                                    {(isOfflineVideo(state, video))?(<IonIcon className="offline-indicator" icon={cloudDownload} slot="end"/>):""}
                                                    <IonIcon
                                                    onClick={e => { e.stopPropagation(); dispatch(setFavVideo(video))}}
                                                    icon={removeCircleOutline} slot="end" />
                                                </IonItem>
                                            ))}
                                            </>
                                        )
                                    }
                                    </>
                                )
                            }
                            </>
                        ):(
                            <>
                            {searchedContent.map((video: any, key: number) => (
                                <IonItem key={key} onClick={() => doPlayFunction(video, searchedContent)} button>
                                    <IonThumbnail slot="start" className='libraryThumbnail'>
                                        <img alt={video.heading} src={appAuthDomain(video.thumbnail)}/>
                                        </IonThumbnail>
                                    <IonLabel>
                                        <h2>{video.heading}</h2>
                                        <p>{video.description}</p>
                                    </IonLabel>
                                    {(isOfflineVideo(state, video))?(<IonIcon className="offline-indicator" icon={cloudDownload} slot="end"/>):""}
                                </IonItem>
                            ))}
                            </>
                        )
                    }
                </IonList>           
            </IonContent>
        </IonPage>
    )
}
export default Library;