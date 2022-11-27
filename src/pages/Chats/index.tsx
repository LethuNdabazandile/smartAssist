import { useRef, useState } from 'react';
import { useHistory } from 'react-router';

import { IonAvatar, IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonContent, IonFab, IonFabButton, IonHeader, 
    IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, 
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
    const [isOpen, setIsOpen] = useState(false);
    const modalRef = useRef<any>(null);

    const convoSearchRef = useRef<any>(null);
    const [present, dismiss] = useIonActionSheet();

    const [showModal, setShowModal] = useState({show: false, title: "", header: "", data: []});
    const [showModal2, setShowModal2] = useState({show: false, title: "", data: []});

    const ionListRef:any = useRef();
    const [courseSets, setCourseSets] = useState([
        {courseName: "Data Science", description: "In simple terms, a data scientist s job is to analyze data for actionable insights. Specific tasks include: Identifying the data-analytics problems that offer the greatest opportunities to the organization. Determining the correct data sets and variables.",
        universities: ["NMMU", "WITS", "UWC"]},
        {courseName: "Data Engeneering", description: "In simple terms, a data scientist s job is to analyze data for actionable insights. Specific tasks include: Identifying the data-analytics problems that offer the greatest opportunities to the organization. Determining the correct data sets and variables.",
        universities: ["NMMU", "UFH", "WSU", "CPUT"]},
        {courseName: "Computer Science", description: "In simple terms, a data scientist s job is to analyze data for actionable insights. Specific tasks include: Identifying the data-analytics problems that offer the greatest opportunities to the organization. Determining the correct data sets and variables.",
        universities: ["NMMU", "UFH", "WSU", "CPUT"]}
    ]);
    const selectCourse = (course: any,)=>{
       console.log(course)
       setShowModal({show: true, title: course.courseName, header: course.description, data: course.universities});
    }
    
    const applying = (varsities: any, course: any)=>{
       setShowModal2({show: true, title: course, data: varsities});

    }

    return (
        <IonPage>
            <IonHeader mode="ios">
                <IonToolbar>
                    <IonTitle>Courses</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader mode="ios" collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Courses</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonSearchbar mode='ios' ref={convoSearchRef} animated showCancelButton='focus'/>
                <IonList mode="ios" ref={ionListRef}>
                    {
                        (courseSets.length > 0)?(
                            courseSets.map((theData: any, key: number) => (
                            <IonCard key={key} onClick={()=>selectCourse(theData)}>
                                <IonCardHeader>
                                    <IonCardSubtitle>{theData.courseName}</IonCardSubtitle>                            
                                </IonCardHeader>
                                <IonCardContent>
                                    {theData.description.substring(0, 155)}...
                                </IonCardContent>
                            </IonCard>
                            ))
                        
                        ):(
                            ""
                        )
                    }
                    
                </IonList>
            </IonContent>
            {/* <SearchUsersModal routerRef={routerRef} showModal={showModal} setShowModal={setShowModal} multiSelectText={{'button': "New Group", 'toast': "Now search your group participants"}} selectPerson={selectPerson} selectGroup={selectGroup}/> */}
            {/* <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonFabButton onClick={startNewChat} mode='ios'>
                    <IonIcon icon={chatbubble} mode='ios'/>
                </IonFabButton>
            </IonFab> */}
            <IonModal 
                mode='ios'
                ref={modalRef}
                presentingElement= {routerRef.current}
                swipeToClose={true}
                isOpen={showModal.show}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Course details</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setShowModal({show: false, title: "", header: "", data: []})}>Close</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <h1>{showModal.title}</h1>
                    <p>{showModal.header}</p>
                    <br/>
                    <p><b>Institutions :</b></p>
                    {
                    showModal.data.map((name: any, key: number) => (
                        <p key={key}>- {name}</p>
                    ))
                    }
                    <IonButton mode='ios' expand="block" className='' onClick={()=>applying(showModal.data, showModal.title)}>APPLY</IonButton>
                </IonContent>
            </IonModal>
            <IonModal
                mode='ios'
                ref={routerRef}
                presentingElement= {modalRef.current}
                swipeToClose={true}
                isOpen={showModal2.show}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Application</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setShowModal2({show: false, title: "", data: []})}>Close</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <form>
                        <IonItem>
                            <IonLabel position="floating">ID Number</IonLabel>
                            <IonInput name='in_idNo' placeholder='ID Number' required/>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="floating">First Name</IonLabel>
                            <IonInput name='in_firstName' placeholder='First Name' required/>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="floating">Last Name</IonLabel>
                            <IonInput name='in_lastName' placeholder='Last Name' required/>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="floating">Physical Address</IonLabel>
                            <IonInput name='in_address' placeholder='Physical Address' required/>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="floating">Email Address</IonLabel>
                            <IonInput name='in_email' placeholder='Email Address' required/>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="floating">Phone Number</IonLabel>
                            <IonInput name='in_phone' placeholder='Phone Number' required/>
                        </IonItem>
                        <IonButton mode='ios' expand="block" className='' type='submit'>APPLY</IonButton>
                    </form>
                </IonContent>
            </IonModal>
        </IonPage>
    );
}

export default Chats;