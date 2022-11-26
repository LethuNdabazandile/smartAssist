import { useRef, useState } from 'react';
import { useHistory } from 'react-router';

import { IonAvatar, IonBadge, IonContent, IonFab, IonFabButton, IonHeader, 
    IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, 
    IonSearchbar, IonTitle, IonToolbar, 
    useIonActionSheet, 
    // useIonToast 
} from '@ionic/react';
import { chatbubble, chatbubbleEllipses, checkmark, checkmarkCircle, checkmarkDone, ellipsisVertical, time } from 'ionicons/icons';

import { useConversations } from '../../contexts/ConversationsProvider';
import { getInitials, localDomain } from '../../services/Utils';
import SearchUsersModal from '../../components/SearchUsersModal';

import './index.css';
const Chats:React.FC<any> = ({routerRef})=>{

    const history = useHistory();
    const {conversations, createConversation, selectConversationIndex, clearConvo, deleteConvo} = useConversations();

    const convoSearchRef = useRef<any>(null);
    // const [present, dismiss] = useIonToast();
    const [present, dismiss] = useIonActionSheet();

    const [showModal, setShowModal] = useState({show: false, title: "", header: "", data: {type: "trip", data: []}});

    const ionListRef:any = useRef();


    
    const startNewChat = ()=>{
        setShowModal({...showModal, show: true})
    };
    
    const selectPerson = (person: any, names: string)=>{
        setShowModal({...showModal, show: false});
        var currentPerson:any;
        if (Array.isArray(person)) {
            if (person.length > 1) {
                // dispatch(setCurrentChat(person));
                createConversation(person, names);
            } else {
                // dispatch(setCurrentChat(person));
                createConversation(person, names);
            };
            currentPerson = person;
        } else {
            createConversation([person], names);
            currentPerson = [person];
        };
        selectConversationIndex(currentPerson);
        history.push("/chatting");
    };
    const selectGroup = (selectedContactIds: Array<any>, newGroupName: string)=>{
        createConversation(selectedContactIds, newGroupName);
        selectConversationIndex(selectedContactIds);
        setTimeout(() => {
            setShowModal({...showModal, show: false});
        }, 100);
        setTimeout(() => {
            history.push("/chatting");
        }, 200);
    };

    const searchConversations = (keyWords: string)=>{

    }
    
    
    const actOnChat = (evt: any, convo: any)=>{

    }
    const actOnConvo = (convo: any, actVal: any) => {
        if (actVal === 0) {
            present({
                mode: 'ios',
                buttons: [
                    { text: 'Contact info' }, 
                    { text: 'Mute' }, 
                    { text: 'Archive Chat' }, 
                    { text: 'Clear Chat', handler: ()=>{
                        clearConvo(convo)
                    } }, 
                    { text: 'Delete Chat', handler: ()=>{
                        deleteConvo(convo);
                        ionListRef?.current?.closeSlidingItems();
                    }}, 
                    { text: 'Cancel', role: "cancel" }
                ],
                header: 'Action Sheet',
                onDidDismiss: () => {
                    dismiss();
                },
            })
        } else {
            
        }
    }
    // console.log(conversations)

    return (
        <IonPage>
            <IonHeader mode="ios">
                <IonToolbar>
                    <IonTitle>Chats</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader mode="ios" collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Chats</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonSearchbar mode='ios' ref={convoSearchRef} onIonChange={e => searchConversations(e.detail.value!)} animated showCancelButton='focus'/>
                <IonList mode="ios" ref={ionListRef}>
                    {
                        conversations.map((conversation: any, index: number) => {
                            var iconVal = time;
                            var seenVal = "";
                            if (conversation.state===1) {
                                iconVal = checkmark;
                            }
                            if (conversation.state === 2) {
                                iconVal = checkmarkDone;
                            };

                            return (
                                <IonItemSliding key={index} onClick={(e: any) => {
                                    // e.persist();
                                    actOnChat(e, conversation);
                                }}>
                                    <IonItemOptions side="start" >
                                        <IonItemOption onClick={() => { actOnConvo(conversation, -2)}}>
                                            <IonIcon icon={chatbubbleEllipses}/>
                                            unread
                                        </IonItemOption>
                                    </IonItemOptions>
                                    <IonItem 
                                        className={"chatListItem "+conversation.selected?"chatListActive":""}
                                        onClick={()=>{selectPerson(conversation.recipients, conversation.names)}}
                                        button
                                    >
                                        <IonAvatar className='profileAVTR'>
                                            {
                                                (conversation.profilePic)?(
                                                    <img src={localDomain(conversation.profilePic)} alt="profilePic" />
                                                ):(
                                                    <div className='profileAVTRNoPic'>
                                                        <span>
                                                            {getInitials(conversation.names)}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                        </IonAvatar>
                                        <IonLabel className='chatListItemLabel'>
                                            <h2>
                                                {
                                                    (conversation.approved === true)?(
                                                        <>
                                                        {conversation.names}<IonIcon icon={checkmarkCircle} className='approvedAccount'/>
                                                        </>
                                                    ):(
                                                        <>
                                                        {conversation.names}
                                                        </>
                                                    )
                                                }
                                            </h2>
                                            <p>
                                                {
                                                    (
                                                        conversation.fromMe
                                                    )?(
                                                        <IonIcon icon={iconVal} className={"msgStateIcon "+seenVal}/>
                                                    ):("")
                                                }
                                                {conversation.lastMsgText}
                                            </p>
                                        </IonLabel>
                                        {
                                            (conversation.unread>0)?(
                                                <IonBadge color="primary">{3}</IonBadge>
                                            ):("")
                                        }
                                    </IonItem>
                                    <IonItemOptions side="end" >
                                        <IonItemOption onClick={() => { actOnConvo(conversation, 0)}}>
                                            <IonIcon icon={ellipsisVertical}/>
                                            More
                                        </IonItemOption>
                                    </IonItemOptions>
                                </IonItemSliding>
                            )
                        })
                    }
                </IonList>
            </IonContent>
            <SearchUsersModal routerRef={routerRef} showModal={showModal} setShowModal={setShowModal} multiSelectText={{'button': "New Group", 'toast': "Now search your group participants"}} selectPerson={selectPerson} selectGroup={selectGroup}/>
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonFabButton onClick={startNewChat} mode='ios'>
                    <IonIcon icon={chatbubble} mode='ios'/>
                </IonFabButton>
            </IonFab>
        </IonPage>
    );
}

export default Chats;