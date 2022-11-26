import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { 
    IonButton, IonButtons, IonContent, IonHeader, 
    IonIcon, IonModal, 
    IonTitle, IonToolbar, 
    // useIonViewWillEnter 
} from '@ionic/react';
import { albums, arrowDown, cameraReverse, mic, videocam } from 'ionicons/icons';

import { AppContext } from '../../contexts/AppContextProvider';
import { closeCall, isCallOpen, setCallPeers } from '../../services/State';
import { addStreamToAudioTag, addStreamToVideoTag, constraints, getUserMedia, stopMediaTracks } from '../../services/Utils';
import { useSocket } from '../../contexts/SocketProvider'; 
import { useWebRTC } from '../../contexts/WebRTCProvider';

import './index.css';

const AppimateCalls:React.FC<any> = ({routerRef})=>{
    const { state, dispatch } = useContext(AppContext);

    const socket = useSocket();
    const webRTC = useWebRTC();
    const [currentStream, setCurrentStream] = useState(null);
    const [webRTCInitiated, setWebRTCInitiated] = useState(false);
    const participantsVideosRef = useRef(null);

    const open = isCallOpen(state);
    const handleClose = useCallback(() => {
        socket.emit("user-leave", (response: any)=>{
            console.log(response);
        })
        setWebRTCInitiated(false);
        stopMediaTracks(currentStream);
        dispatch(closeCall());
    }, [socket, dispatch, currentStream]);
    const keepCallData = useCallback((action, userId, callInfo)=>{
        if (action === 'add') {
            var newPeersList = state.rtcCall.peers;
            newPeersList[userId] = callInfo;
            dispatch(setCallPeers(newPeersList));
        } else {
            // console.log(state.rtcCall.peers, userId)
            if (state.rtcCall.peers) {
                if (state.rtcCall.peers[userId]) {
                    state.rtcCall.peers[userId].close();
                }
            }
        }
    }, [dispatch, state.rtcCall]);

    useEffect(()=>{
        if (open && webRTC) {
            if (!webRTCInitiated) {
                setWebRTCInitiated(true);
                //Here we handle the PeerJS functionality
                var adaptiveConstrains: any = constraints;
                if (state.rtcCall.type === 'voice') adaptiveConstrains.video = false;
                getUserMedia(adaptiveConstrains).then((localStream: any)=>{
                    addStreamToInterface(state.rtcCall.type, localStream, "Me").then((uiElement: any)=>{
                        uiElement.muted = true;
                        webRTC.on('close', ()=>{
                            uiElement.remove();
                            setWebRTCInitiated(false);
                        });
                    });

                    /*Listening for the call request from the other user*/
                    webRTC.on('call', (call: any)=>{
                        call.answer(localStream); //answer the call from other user
                        call.on("stream", (remoteStream: any) => {
                            // Show stream in some <video> element.
                            addStreamToInterface(state.rtcCall.type, remoteStream, "Me").then((uiElement: any)=>{
                                call.on('close', ()=>{
                                    uiElement.remove();
                                });
                            });
                        });
                        
                        keepCallData('add', state.rtcCall.from, call);
                    });

                    /*Allowing other users to connect to our stream*/
                    socket.on('user-joined', (data: any)=>{ //detect when other user joined.
                        console.log("User joined: ", data);
                        connectToNewUser(data.data, localStream); //add out stream to the webRTC connection of the other user.
                    });
                    socket.on('user-left', (data: any)=>{ //detect when other user joined.
                        console.log("User left: ", data);
                        keepCallData('remove', data.data.from, null);
                        if (false) {
                            handleClose();
                        }
                    });
                    socket.on('user-disconnected', (data: any)=>{ //detect when other user joined.
                        console.log("User Disconnected: ", data);
                        keepCallData('remove', data.data.from, null);
                        if (false) {
                            handleClose();
                        }
                    });

                    setCurrentStream(localStream);
                }).catch(err=>{
                    return {success: false, msg: "Couldn't get user Media", msg2: err.message};
                });
                webRTC.on('open', (id: any)=>{ //Here the process starts, upon the webRTC connection initiated
                    console.log(id, state.rtcCall.direction);
                    if (state.rtcCall.direction === 'outgoing') {
                        var dataOut  = {
                            direction: 'outgoing', 
                            userId: id,
                            roomId: state.rtcCall.roomId, 
                            recipients: state.rtcCall.recipients, 
                            type: state.rtcCall.type,
                            names: state.rtcCall.names,
                        };
                        socket.emit("calling", {data: dataOut}, (response: any)=>{
                            console.log(response);
                        });
                    } else {
                        var dataIn  = {
                            direction: 'incoming', 
                            userId: id, 
                            roomId: state.rtcCall.roomId, 
                            recipients: state.rtcCall.recipients, 
                            type: state.rtcCall.type,
                            from: state.rtcCall.from,
                            names: `${state.auth.user?.firstname} ${state.auth.user?.lastname}`,
                        };
                        // console.log("Responding with: ", dataIn);
                        socket.emit("calling", {data: dataIn}, (response: any)=>{
                            console.log(response);
                        });
                    };
                });
                const connectToNewUser = (data: any, stream: any)=>{
                    // console.log(data);
                    var call = webRTC.call(data.from, stream);
                    call.on('stream', (peerStream: any)=>{
                        addStreamToInterface(data.type, peerStream, data.names).then((uiElement: any)=>{
                            call.on('close', ()=>{
                                uiElement.remove();
                            });
                        });
                    });
                    keepCallData('add', data.from, call);
                }
                const addStreamToInterface = (type: any, stream: any, names: string)=>{
                    var uiElem: any;
                    var uiNames = document.createElement('P');
                    uiNames.className = "callerNames";
                    uiNames.innerHTML = names;
                    if (type === 'video') {
                        uiElem = document.createElement('video');
                        uiElem.className = 'chatVideo';
                        return addStreamToVideoTag(stream, uiElem).then((video: any)=>{
                            if (participantsVideosRef) {
                                if (participantsVideosRef.current) {
                                    var videosHolder: any = participantsVideosRef.current;
                                    // video.append(uiNames);
                                    videosHolder.append(video);
                                }
                            };
                            return video;
                        });
                    } else {
                        uiElem =  new Audio();
                        uiElem.className = 'chatAudio';
                        return addStreamToAudioTag(stream, uiElem).then((audio: any)=>{
                            if (participantsVideosRef) {
                                if (participantsVideosRef.current) {
                                    var videosHolder: any = participantsVideosRef.current;
                                    console.log("Here!!!", audio);
                                    videosHolder.append(audio);
                                }
                            }
                            return audio;
                        })
                    }
                }
            }
        }
    }, [open, webRTC, webRTCInitiated, state.rtcCall, state.auth.user?.firstname, state.auth.user?.lastname, socket, keepCallData, handleClose]);
    

    return (
        <IonModal
            isOpen={open}
            presentingElement={routerRef.current}
            onDidDismiss={handleClose}
            canDismiss={true}
            mode='ios'
        >
            <IonHeader >
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={handleClose}>
                            <IonIcon icon={arrowDown} />close
                        </IonButton>
                    </IonButtons>
                    <IonTitle>
                        Call: 
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className='realTimeCallCenter' ref={participantsVideosRef}>
                    
                </div>
                <div className='callControls'>
                    <button>
                        <IonIcon icon={cameraReverse} />
                    </button>
                    <button>
                        <IonIcon icon={albums} />
                    </button>
                    <button className={
                        (
                            state.rtcCall
                        )?(
                            (state.rtcCall.type === 'voice')?('voiceCallFilled'):("")
                        ):("")
                    }>
                        <IonIcon icon={mic} />
                    </button>
                    <button className={
                        (
                            state.rtcCall
                        )?(
                            (state.rtcCall.type === 'video')?('videoCallFilled'):("")
                        ):("")
                    }>
                        <IonIcon icon={videocam} />
                    </button>
                </div>
            </IonContent>
        </IonModal>
    )
}
export default AppimateCalls;