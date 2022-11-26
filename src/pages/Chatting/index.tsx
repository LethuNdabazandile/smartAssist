import { useCallback, useContext, useRef } from 'react';
import { useHistory } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { IonAvatar, IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonToolbar, useIonToast, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { call, camera, checkmark, checkmarkCircle, checkmarkDone, chevronBack, paperPlane, time, videocam } from 'ionicons/icons';

import { AppContext } from '../../contexts/AppContextProvider';
import { getUserID, getUserNames, setCallTrigger } from '../../services/State';
import { appAuthDomain, getInitials, textAreaAdjust } from '../../services/Utils';
import { useSocket } from '../../contexts/SocketProvider';
import { useConversations } from '../../contexts/ConversationsProvider';

import './index.css';
import { Capacitor } from '@capacitor/core';

const Chatting:React.FC<any> = ({doPlay})=>{
    const {state, dispatch } = useContext(AppContext);

    const socket = useSocket();
    
    const [present, dismiss] = useIonToast();
    const history = useHistory();


    const {selectedConversation, sendMessage, updateMessageOnConversation} = useConversations();
    const inputRef = useRef(null);
    const setRef = useCallback((node: any)=>{
        if (node) {
            // setTimeout(() => {
                node.scrollIntoView({smooth: true})
            // }, 800);
        }
    }, []);
    
    const setTextFunc = (t: string)=>{
        // var data = { type: 'typing', id: getUserID(state), convo: "", recipients: selectedConversation.recipients};
        // console.log(data);
        // socket.emit(
        //     "typing",
        //     data
        // );
    }

    const handleClickSendMessage = () => {
        var inputField:any = inputRef.current;
        if (inputField) {
            var recipients = selectedConversation.recipients.map((r: any) => r.id);
            var inputText = inputField.value;
            var continueSend = false;
            var preparedText = inputText.replaceAll(" ", "");
            // console.log(preparedText);
            if (preparedText !== "") {
                continueSend = true;
            }
            if (continueSend) {
                // console.log("ccc")
                sendMessage({chatName: selectedConversation.names, id: getUserID(state)}, recipients, {text: inputText}, (locaSendRes: any)=>{
                    // console.log('locaSendRes', locaSendRes);
                    if (locaSendRes.success) {
                        var localIndex = locaSendRes.data.insertId;
                        var data = { 
                            type: 'message', 
                            recipients, 
                            chatName: getUserNames(state),
                            message: {
                                text: inputText
                            }
                        };
                        console.log("vvvvv");
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
                                // console.log(updateEssentials);
                                updateMessageOnConversation(updateEssentials);
                            }
                        );
                        inputField.value = "";
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
            }
        }
    };
    const handleVideos = (ask: any)=>{
        history.push('?vid='+ask.about.id);
        doPlay({...ask.about}, [{...ask.about}]);
    }
    const handleCall = (callType: any)=>{
        if (Capacitor.getPlatform() === "web") {
            var roomId:any = "";
            var roomNames:any = "";
            var callingGroup = false;
            var participants = selectedConversation.recipients;
            var recipients:any = participants.map((participant: any)=> participant.id);
            if (participants.length > 1) callingGroup = true;
            roomId = uuidv4(); //When I just use the UUIDs for all Call identifiers;
            if (callingGroup) {
                // roomId = uuidv4();
            } else {
                roomNames = getUserNames(state);
            };
            dispatch(setCallTrigger({type: callType, direction: 'outgoing', roomId, recipients, names: roomNames, peers: []}));
        } else {
            present({
                position: "top",
                buttons: [{ text: 'Ok', handler: () =>{
                    dismiss()
                } }],
                message: "Calls not supported (coming soon).",
                duration: 5000
            });
        }
    };

    useIonViewWillEnter(() => {
        const inputFieldsSection = document.getElementById("inputFieldsSection");
        const bottomNav = document.getElementById("defaultIonicTabBar");
        if (bottomNav && inputFieldsSection) {
            bottomNav.style.display = "none";
            inputFieldsSection.style.display = "flex";
        };
    });
    useIonViewWillLeave(()=>{
        const inputFieldsSection = document.getElementById("inputFieldsSection");
        const bottomNav = document.getElementById("defaultIonicTabBar");
        if (bottomNav && inputFieldsSection) {
            inputFieldsSection.style.display = "none";
            bottomNav.style.display = "flex";
        }
        if (inputFieldsSection) {
        };
    });
    // console.log(selectedConversation);

    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="home" text="" icon={chevronBack} />
                    </IonButtons>
                    <div className='chattingProfile'>
                        {
                            (selectedConversation)?(
                                <>
                                <IonAvatar className='chattingAVTR'>
                                    {
                                        (selectedConversation.profilePic)?(
                                            <img src={appAuthDomain(selectedConversation.profilePic)} alt="profilePic" />
                                        ):(
                                            <div className='chatAVTRNoPic'>
                                                <span>
                                                    {getInitials(selectedConversation.names)}
                                                </span>
                                            </div>
                                        )
                                    }
                                </IonAvatar>
                                <p>
                                    {
                                        
                                        (selectedConversation.approved === true)?(
                                            <>
                                            {selectedConversation.names}
                                            <IonIcon icon={checkmarkCircle} className='approvedAccount'/>
                                            </>
                                        ):(
                                            <>
                                            {
                                                selectedConversation.names
                                            }
                                            </>
                                        )
                                    }
                                </p>
                                <div className='callDiv'>
                                    <button onClick={()=>handleCall('video')}>
                                        <IonIcon icon={videocam}/>
                                    </button>
                                    <button onClick={()=>handleCall('voice')}>
                                        <IonIcon icon={call}/>
                                    </button>
                                </div>
                                </>
                            ):(
                                ""
                            )
                        }
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {
                    (selectedConversation)?(
                        selectedConversation.messages.map((message: any, index: number) => {
                            const lastMsg = selectedConversation.messages.length-1 === index;
                            var iconVal = time;
                            var seenVal = "";
                            if (message.state===1) {
                                iconVal = checkmark;
                            }
                            if (message.state === 2) {
                                iconVal = checkmarkDone;
                            };
                            return (
                                <div key={index} ref={lastMsg?setRef: null} className="chatTurns" >
                                    <div className={`chatBuddle ${message.fromMe? 'chatfromMe':'chatFromthem'}`}>
                                        {
                                            (message.ask)?(
                                                <>
                                                <div className='attachedAskDiv' onClick={()=>{handleVideos(message.ask)}}>

                                                </div>
                                                {
                                                    message.text
                                                }
                                                </>
                                            ):(
                                                <>
                                                {
                                                    message.text
                                                }
                                                </>
                                            )
                                        }

                                        <span className="msgState">
                                        {
                                            (message.fromMe)?(
                                                <IonIcon mode='ios' icon={iconVal} className={"msgStateIcon "+seenVal}/>
                                            ):("")
                                        }
                                        </span>
                                    </div>
                                </div>
                        )
                        })
                    ):(
                        ""
                    )
                }
            </IonContent>
            <div className='inputFieldsSection' id="inputFieldsSection">
                <div className="chatCenterCamera">
                    <IonIcon icon={camera} className="chatCenterCameraIcon" mode='ios'/>
                </div>
                <div className="chatCenterInput">
                    <textarea 
                        // value={text}
                        ref={inputRef}
                        // type="text"
                        placeholder='write your message...'
                        className="chatCenterInputField"
                        onChange={
                            e => {
                                // // console.log(e.target)
                                setTextFunc(e.target.value!);
                                textAreaAdjust(e.target);
                            }
                        }
                    />
                </div>
                <button className="chatCenterSend" onClick={handleClickSendMessage}>
                    <IonIcon mode='ios'
                    icon={paperPlane}
                    className="chatCenterSendIcon"
                    />
                </button>
            </div>
        </IonPage>
    );
}

export default Chatting;