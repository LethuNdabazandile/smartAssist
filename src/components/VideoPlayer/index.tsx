import { useCallback, useContext, useEffect, useRef, useState } from 'react';
// import { useHistory } from 'react-router';
import { IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonModal, IonProgressBar, IonTitle, IonToolbar, useIonToast } from '@ionic/react';
import { arrowRedo, chevronDown, closeCircle, download } from 'ionicons/icons';

import { AppContext } from '../../contexts/AppContextProvider';
import { closePlayer, getCurrentVideo, getPlaying, getUserID, getUserNames, isPlayerOpen, setOfflineVideos } from '../../services/State';
import { appAuthDomain, genWebShare, localDomain, makeRequests, onDeviceStorage, seekTimeUpdate, videoFilesDomain, videoThumbDomain } from '../../services/Utils';
import ShareOptions from '../ShareOptions';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import AskField from '../AskField';
import { useSocket } from '../../contexts/SocketProvider';
import { useConversations } from '../../contexts/ConversationsProvider';


import './index.css';
import SearchUsersModal from '../SearchUsersModal';

const VideoPlayer:React.FC<any> = ({routerRef, doPlay})=>{
    const { state, dispatch } = useContext(AppContext);
    const socket = useSocket();
    const { sendMessage, updateMessageOnConversation} = useConversations();

    const stateTempVideosList = state.videos.tempVideos;
    const stateVideoPlayList = state.videos.playList; 
    const [videoPlayList, setVideoPlayList] = useState(stateVideoPlayList);
    const [modalTwo, setModalTwo] = useState<any>({open: false, title: "", initialBreakpoint: 0.5, body: ""});
    const [modalUsers, setModalUsers] = useState<any>({show: false, title: "", header: "", body: "", data: {}});

    const [present, dismiss] = useIonToast();
    const playerRef = useRef<any>();
    let multiSelectNext = useRef<any>();


    const open = isPlayerOpen(state);
    const playing = getPlaying(state);

    const playingVideo = stateTempVideosList[playing.index];
    const handleClose = useCallback(() => {
        if (open) {
            window.history.back();
        }
        dispatch(closePlayer());
    }, [ open, dispatch]);
    const handleActionsClose = useCallback(() => {
        var myVideoPlayer:any = document.querySelector('#myVideoPlayer');
        myVideoPlayer.play();
        setModalTwo({...modalTwo, open: false});
    }, [modalTwo]);
    

    const shareOptionsFunc = useCallback((platform: string)=>{
        var holdSubject = playingVideo.subject;
        var holdHeading = playingVideo.heading;
        var holdID = playingVideo.id;
        var title = "Appimate | Video";
        var heading = holdSubject+" - "+holdHeading;
        var currentVidTime = seekTimeUpdate('myVideoPlayer');

        var requestObject:any = {};
        if (platform==='appimate') {
            multiSelectNext.current = (selectedRecipients: any)=>{
                requestObject.url = appAuthDomain("api/notifications?appType=videos&action=addNotification");
                requestObject.method = "POST";
                requestObject.data = {
                    userTo: selectedRecipients,
                    heading: title,
                    body: "Check this: "+holdHeading,
                    about: "videos",
                    aboutID: holdID,
                }
                makeRequests(state, requestObject).then((notifyResponse)=>{
                    console.log('notifyResponse: ', notifyResponse);
                    if (notifyResponse.success) {
                        setModalUsers({...modalUsers, show: false});
                        setTimeout(() => {
                            setModalTwo({...modalTwo, open: false});
                        }, 500);
                    } else {
                        
                    }
                });
            };
            setModalUsers({...modalUsers, 
                show: true, 
            });
        } else {
            // console.log(playingVideo);
            var vidLink = "https://appimate.com/videos?s="+holdSubject+"&v="+holdID+"&h="+holdHeading+"&t="+currentVidTime
            
            genWebShare(title, heading, vidLink, null).then(shareRes=>{
                console.log(shareRes);
                var actionType = 'shareVideoFail';
                if (shareRes) {
                    actionType = 'shareVideoSuccess';
                    window.history.back();
                };
                requestObject.data = {
                    actionType: actionType
                };
                requestObject.url = localDomain("api/requests?appType=videos&action=shareVideo&vidID="+holdID)
                makeRequests(state, requestObject);
            });
        }
    }, [state, playingVideo, modalUsers, modalTwo]);
    const askSendHandler = useCallback((e: any, text: string)=>{
        var currentVidTime = seekTimeUpdate('myVideoPlayer');

        var recipients = [1];
        var data = { 
            type: 'message', 
            recipients,
            chatName: getUserNames(state),
            message: {
                text,
                ask: {
                    about: playingVideo,
                    time: currentVidTime
                }
            }
        };
        console.log(data);

        sendMessage({chatName: "Appimate.", id: getUserID(state)}, [1], data.message, (locaSendRes: any)=>{
            if (locaSendRes.success) {
                var localIndex = locaSendRes.data.insertId;
                socket.emit(
                    "message",
                    data, 
                    (response: any)=>{
                        var updateEssentials = {
                            recipients,
                            localIndex,
                            state: response.state,
                            msgID: response.msgID
                        };
                        updateMessageOnConversation(updateEssentials);
                    }
                );
            } else {
                present({
                    position: "bottom",
                    buttons: [{ text: 'retry', handler: () =>{
                        dismiss()
                    } }],
                    message: locaSendRes.msg,
                    duration: 5000
                });
            }
        });
        handleActionsClose();
    }, [playingVideo, state, sendMessage, updateMessageOnConversation, socket, handleActionsClose, present, dismiss]);
    
    const actionBtnsClick = useCallback((action) => {
        var closeTimeout;
        if (action === 'ask') {
            var myVideoPlayer:any = document.querySelector('#myVideoPlayer');
            myVideoPlayer.pause();
            clearTimeout(closeTimeout);
            setModalTwo({...modalTwo, 
                open: true, 
                initialBreakpoint: 0.5,
                title: "Ask Appimate", 
                body: <AskField onClickHandler={askSendHandler} />
            });
        } else if (action === 'share') {
            clearTimeout(closeTimeout);
            setModalTwo({...modalTwo, 
                open: true, 
                initialBreakpoint: 0.4,
                title: "Sharing options", 
                body: <ShareOptions onClickHandler={shareOptionsFunc} />
            });
        } else {
            var initialDownloadProgress = .1;
            setModalTwo({...modalTwo, 
                open: true, 
                initialBreakpoint: 0.3,
                title: "Saving for offline", 
                body: <IonCard className='downloadVideo'>
                    <p className='downloadVideoNumnbers'>(This download will continues in the background)<br/><br/><strong>{initialDownloadProgress*100}%</strong></p>
                    <IonProgressBar color="primary" value={initialDownloadProgress}></IonProgressBar>
                </IonCard>
            });
            var video = getCurrentVideo(state);
            onDeviceStorage('get', 'library').then((localLibrary: any)=>{
                var currentLibrary = localLibrary || "{}";
                currentLibrary = JSON.parse(currentLibrary);
                var keepOnLibrary = {...currentLibrary};
                if ('offlineVideos' in currentLibrary) {
                    const newOfflineVideos = (currentLibrary.offlineVideos).filter((t: any) => t.id !== video.id);
                    keepOnLibrary.offlineVideos = [video, ...newOfflineVideos];
                } else {
                    keepOnLibrary.offlineVideos = [ video ];
                };
                onDeviceStorage('set', {library: JSON.stringify(keepOnLibrary)});
            });
            dispatch(setOfflineVideos(video));
            closeTimeout = setTimeout(()=>{
                // handleActionsClose();
            }, 5000);
        }
    }, [modalTwo, askSendHandler, shareOptionsFunc, dispatch, state]);

    

    useEffect(()=>{
        if (open) {
            if (playingVideo) {
                // seekToTime()
                var requestObj = {
                    method: 'GET',
                    url: appAuthDomain("api/videos?appType=videos&action=suggestions&like="+playingVideo.id+"&listSize=5"),
                }
                makeRequests(state, requestObj).then(response=>{
                    // console.log(response);
                    if (response.success) {
                        var fetchedData = response.data;
                        setVideoPlayList(fetchedData);
                    } else {
                        setVideoPlayList([]);
                    }
                });
            }
        }
    }, [open, state, playingVideo]);

    return (
        <>
        <IonModal
            ref={playerRef}
            isOpen={open}
            presentingElement={routerRef.current}
            onDidDismiss={handleClose}
            canDismiss={true}
            mode='ios'
        >
            
            <IonContent>
                <IonCard>
                    {
                        (playingVideo)?(
                            <video id="myVideoPlayer" className='myVideoPlayer' poster={videoThumbDomain(playingVideo.thumbnail)} src={videoFilesDomain(playingVideo.video)} controls autoPlay controlsList="nodownload" />
                            // <video id="myVideoPlayer" className='myVideoPlayer' src={videoFilesDomain("api/videoStream?src="+encodeURIComponent(playingVideo.video))} controls autoPlay controlsList="nodownload"/>
                        ): (
                            <video src="" />
                        )
                    }
                </IonCard>
                <div className='videoActionsHolder'>
                    <IonButton className='videoActions' onClick={()=>{actionBtnsClick('save')}}>
                        <IonIcon icon={download} className='videoActionsIcons' />
                    </IonButton>
                    <IonButton className='videoActions' onClick={()=>{actionBtnsClick('ask')}}>
                        Ask
                    </IonButton>
                    <IonButton className='videoActions' id='videoActionsBtns' onClick={()=>{actionBtnsClick('share')}}>
                        <IonIcon icon={arrowRedo} className='videoActionsIcons'/>
                    </IonButton>
                </div>
                <p className='nextVideosTitle'>
                    {
                        (videoPlayList.length > 1)?("Next videos"):("")
                    }
                </p>
                <Swiper
                    className='nextVideosSlider'
                    slidesPerView={2.5}
                >
                    {
                        videoPlayList.map((video: any, key: number)=>{
                            return (
                                <SwiperSlide key={key}>
                                    <IonCard onClick={()=>{doPlay(video, videoPlayList)}} className='nextVideos'>
                                        <img decoding={(key > 2)?("async"):("auto")} loading={(key>2)?("lazy"):("eager")} src={videoThumbDomain(video.thumbnail)} alt={video.img}/>
                                    </IonCard>
                                </SwiperSlide>
                            )
                        })
                    }
                </Swiper>
                <div className='closePlayer'>
                    <IonIcon className='closePlayerIcon' icon={closeCircle} onClick={handleClose}/>
                </div>
            </IonContent>
        </IonModal>
        <IonModal
        isOpen={modalTwo.open}
        presentingElement={playerRef.current}
        canDismiss={true}
        onDidDismiss={handleActionsClose}
        // breakpoints={[0.5, 1]}
        initialBreakpoint={modalTwo.initialBreakpoint}
        mode='ios'
        >
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={handleActionsClose}>
                            <IonIcon icon={chevronDown} />close
                        </IonButton>
                    </IonButtons>
                    <IonTitle>
                        {modalTwo.title}
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
            {
                modalTwo.body
            }
            </IonContent>
        </IonModal>
        <SearchUsersModal routerRef={routerRef} showModal={modalUsers} setShowModal={setModalUsers} multiSelectText={{'button': "Select Multiple", 'toast': "Now search your people."}} selectPerson={multiSelectNext.current} multiSelectNext={multiSelectNext.current}/>
        </>
    )
}
export default VideoPlayer;