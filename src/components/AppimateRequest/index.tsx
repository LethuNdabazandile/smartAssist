import { useCallback, useContext, useState } from 'react';
import { 
    IonButton, IonButtons, IonCard, IonHeader, 
    IonIcon, IonModal, 
    IonTitle, IonToolbar, useIonToast, useIonViewWillEnter 
} from '@ionic/react';
import { arrowDown, camera, chevronDown, paperPlane } from 'ionicons/icons';

import { AppContext } from '../../contexts/AppContextProvider';
import { closeRequester, getUserID, getUserNames, isRequesterOpen } from '../../services/State';
import { textAreaAdjust } from '../../services/Utils';
import { useSocket } from '../../contexts/SocketProvider'; 
import { useConversations } from '../../contexts/ConversationsProvider';

import './index.css';

const AppimateRequest:React.FC<any> = ({routerRef})=>{
    const { state, dispatch } = useContext(AppContext);

    const socket = useSocket();
    const { sendMessage, updateMessageOnConversation} = useConversations();
    const [text, setText] = useState("");
    const [present, dismiss] = useIonToast();



    const open = isRequesterOpen(state);
    const handleClose = useCallback(() => {
        dispatch(closeRequester());
    }, [dispatch]);
    const handleClickSendMessage = useCallback(() => {
        var recipients = [1];
        sendMessage({chatName: "Appimate.", id: getUserID(state)}, recipients, {text}, (locaSendRes: any)=>{
            if (locaSendRes.success) {
                var localIndex = locaSendRes.data.insertId;
                var data = { 
                    type: 'message', 
                    recipients, 
                    chatName: getUserNames(state),
                    message: {
                        text
                    }
                };
                socket.emit(
                    "message",
                    data, 
                    (response: any)=>{
                        // console.log(response);
                        var updateEssentials = {
                            recipients,
                            localIndex,
                            state: response.state,
                            msgID: response.msgID
                        };
                        updateMessageOnConversation(updateEssentials);


                        present({
                            position: "top",
                            buttons: [{ text: 'Close', handler: () =>{
                                dismiss()
                            } }],
                            message: "Request sent.",
                            duration: 3000
                        });
                    }
                );
                setText("");
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
    }, [state, socket, text, sendMessage, updateMessageOnConversation, present, dismiss]);
    const handleClickCamera = ()=>{

    }


    useIonViewWillEnter(()=>{
        setText("");
    })
    

    return (
        <>
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
                        Request center
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            {/* <IonContent> */}
                <IonCard className='requestCenterSectionVisuals'>
                    
                </IonCard>
                <div className='requestCenterSectionInputs'>
                    <button className="requestCenterCamera" onClick={handleClickCamera} >
                        <IonIcon icon={camera} className="requestCenterCameraIcon"/>
                    </button>
                    <div className="requestCenterInput">
                        <textarea 
                            value={text}
                            placeholder='write your request...'
                            className="requestCenterInputField"
                            onChange={
                                e => {
                                    setText(e.target.value!);
                                    textAreaAdjust(e.target);
                                }
                            }
                        />
                    </div>
                    <button className="requestCenterSend" onClick={handleClickSendMessage}>
                        <IonIcon icon={paperPlane} className="requestCenterSendIcon" />
                    </button>
                </div>
                <div className='closeRequestCenter' onClick={handleClose}>
                    Close
                    <br/>
                    <IonIcon icon={chevronDown} />
                </div>
            {/* </IonContent> */}
        </IonModal>
        </>
    )
}
export default AppimateRequest;