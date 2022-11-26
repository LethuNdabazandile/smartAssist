import { useContext, useRef, useState } from "react";
import { IonAvatar, IonButton, IonButtons, IonCard, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonSearchbar, IonToast, IonToolbar } from "@ionic/react";
import { chevronDown, peopleCircle, people, arrowForwardCircle } from "ionicons/icons";
import { appAuthDomain, getInitials, makeRequests } from "../../services/Utils";
import { AppContext } from "../../contexts/AppContextProvider";


const SearchUsersModal: React.FC<any> = ({routerRef, showModal, setShowModal, selectPerson, selectGroup, multiSelectText, multiSelectNext})=>{
    const { state } = useContext(AppContext);

    const userSearchRef = useRef<any>(null);
    const peopleModalRef = useRef<any>(null);
    const [showToast1, setShowToast1] = useState<any>({});
    const [searchPeopleText, setSearchPeopleText] = useState("");
    const [searchPeopleList, setSearchPeopleList] = useState<any>([]);
    const [canMarkUsers, setCanMarkUsers] = useState(false);
    const [selectedContactIds, setSelectedContactIds] = useState<any>([]);
    const [showGroupModal, setShowGroupModal] = useState({show: false, title: "", header: "", data: {type: "trip", data: []}});
    const [newGroupName, setNewGroupName] = useState("");



    
    const searchFunc = (keyWords: string)=>{
        var requestObj = {
            method: 'GET',
            url: appAuthDomain("api/search?appType=videos&focus=chat&q="+keyWords)
        };
        setSearchPeopleText(keyWords);
        makeRequests(state, requestObj).then((response)=>{
            if (response.success) {
                setSearchPeopleList(response.data);
            } else {
                var testUsers:any = [
                    // {id: 1, firstname: "WWW", lastname: "XXX", profilePic: appAuthDomain("assets/icon/ICON 48x48.png")},
                    // {id: 2, firstname: "YYY", lastname: "ZZZ", profilePic: appAuthDomain("assets/icon/ICON 48x48.png")},
                    // {id: 3, firstname: "AAA", lastname: "BBB", profilePic: appAuthDomain("assets/icon/ICON 48x48.png")},
                ];
                setSearchPeopleList(testUsers);
            }
        })
    };
    const handleCheckboxChange = (checked: boolean, contactId: number)=>{
        setSelectedContactIds((prevSelectedContactIds: any)=>{
            if (prevSelectedContactIds.includes(contactId)) {
                if (checked) {
                    return [...prevSelectedContactIds];
                } else {
                    return prevSelectedContactIds.filter((prevId: number)=>{
                        return contactId !== prevId;
                    });
                }
            } else {
                if (checked) {
                    return [...prevSelectedContactIds, contactId];
                } else {
                    return prevSelectedContactIds.filter((prevId: number)=>{
                        return contactId !== prevId;
                    });
                }
            }
        });
    }
    const canAddNewGroup = (canMark: boolean)=>{
        if (canMark) {
            if (userSearchRef) {
                if (userSearchRef.current) {
                    userSearchRef.current?.focus();
                }
            }
            // present({
            //     position: "top",
            //     buttons: [{ text: 'hide', handler: () => dismiss() }],
            //     message: "Now search your group participants",
            //     duration: 3000
            // });
            setShowToast1({show: true, position: "top", message: multiSelectText.toast, duration: 3000, buttons: [{ text: 'hide', handler: () => setShowToast1({...showToast1, show: false}) }]})
            if (searchPeopleList.length < 1) {
                searchFunc("")
            }
        }
        setCanMarkUsers(canMark);
    }
    const afterMultiSelect = ()=>{
        if (selectedContactIds.length > 0) {
            if (multiSelectNext) {
                multiSelectNext(selectedContactIds);
            } else {
                setShowGroupModal({...showGroupModal, show: true});
            }
        } else {
            setShowToast1({show: true, position: "top", message: "Select someone", duration: 3000, buttons: [{ text: 'hide', handler: () => setShowToast1({...showToast1, show: false}) }]})
        }
    }
    return (
        <>
            <IonModal
                ref={peopleModalRef}
                mode='ios'
                isOpen={showModal.show}
                canDismiss={true}
                onDidDismiss={() => setShowModal({...showModal, show: false})}
                presentingElement={routerRef.current}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton onClick={() => setShowModal({...showModal, show: false})}>
                                <IonIcon icon={chevronDown}/>
                                Back
                            </IonButton>
                        </IonButtons>
                        <IonSearchbar ref={userSearchRef} onIonChange={e => searchFunc(e.detail.value!)} animated />
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonCard>
                        <IonItem onClick={()=>{canAddNewGroup(!canMarkUsers)}}>
                            <IonIcon icon={peopleCircle}/> {multiSelectText.button}
                        </IonItem>
                    </IonCard>
                    
                    {
                        (searchPeopleList.length > 0)?(
                            searchPeopleList.map((person: { id: number; profilePic: string | undefined; firstname: string; lastname: string; }, key: any)=>{
                                if (canMarkUsers) {
                                    return <IonItem key={key} >
                                        <IonCheckbox 
                                        slot='start'
                                        checked={
                                            selectedContactIds.includes(person.id)
                                        } 
                                        onIonChange={e => handleCheckboxChange(e.detail.checked, person.id)} />
                                        <IonAvatar className='profileAVTR'>
                                            {
                                                (person.profilePic)?(
                                                    <img src={person.profilePic} alt="profilePic"/>
                                                ):(
                                                    <div className='profileAVTRNoPic'>
                                                        <span>
                                                            {getInitials(person.firstname+" "+person.lastname)}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                        </IonAvatar>
                                        <p>
                                            {person.firstname+" "+person.lastname}
                                        </p>
                                    </IonItem>;
                                } else {
                                    return <IonItem key={key} onClick={()=>{selectPerson(person.id, person.firstname+" "+person.lastname)}}>
                                        <IonAvatar className='profileAVTR'>
                                            {
                                                (person.profilePic)?(
                                                    <img src={person.profilePic} alt="profilePic"/>
                                                ):(
                                                    <div className='profileAVTRNoPic'>
                                                        <span>
                                                            {getInitials(person.firstname+" "+person.lastname)}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                        </IonAvatar>
                                        <p>
                                            {person.firstname+" "+person.lastname}
                                        </p>
                                    </IonItem>;
                                }
                            })
                        ):(
                            <p className='searchUserParagraph'>
                                {"No people found matching "}
                                <span>
                                {"'"+searchPeopleText+"'"}
                                </span>
                            </p>
                        )
                    }

                    {
                        (canMarkUsers)?(
                            <>
                            {
                                (
                                    selectedContactIds.length > 1
                                )?(
                                    <>
                                    <IonModal
                                        mode='ios'
                                        isOpen={showGroupModal.show}
                                        canDismiss={true}
                                        onDidDismiss={() => setShowGroupModal({...showGroupModal, show: false})}
                                        presentingElement={peopleModalRef.current}
                                    >
                                        <IonHeader>
                                            <IonToolbar>
                                                <IonButtons slot="start">
                                                    <IonButton onClick={() => setShowGroupModal({...showGroupModal, show: false})}>Back</IonButton>
                                                </IonButtons>
                                            </IonToolbar>
                                        </IonHeader>
                                        <IonContent>
                                            <IonCard>
                                                <IonAvatar >
                                                    <img src={""} alt="groupPic" />
                                                </IonAvatar>
                                                <br/>
                                                <IonItem>
                                                    <IonLabel mode='ios' position="floating" >Enter Group Name</IonLabel>
                                                    <IonInput mode='ios' onIonChange={e => setNewGroupName(e.detail.value!)}/>
                                                </IonItem>
                                            </IonCard>
                                            <IonCard>
                                                <br/>
                                                <br/>
                                                <IonIcon icon={people}/> {selectedContactIds.length} Particpants
                                                <br/>
                                                <br/>
                                            </IonCard>
                                        </IonContent>

                                        <IonButton onClick={()=>{setShowGroupModal({...showGroupModal, show: false}); selectGroup(selectedContactIds, newGroupName)}} >Finish Creating</IonButton>
                                    </IonModal>
                                    <IonFab vertical="bottom" horizontal="end" slot="fixed">
                                        <IonFabButton onClick={afterMultiSelect} mode='ios'>
                                            Next
                                            <IonIcon icon={arrowForwardCircle} mode='ios'/>
                                        </IonFabButton>
                                    </IonFab>
                                    </>
                                ):("")
                            }
                            </>
                        ):("")
                    }
                </IonContent>
            </IonModal>

            <IonToast
                mode="ios"
                isOpen={showToast1.show}
                // onDidDismiss={() => setShowToast1({...showToast1, show: false})}
                buttons= {showToast1.buttons}
                message={showToast1.message}
                duration={showToast1.duration}
            />
        </>
    )
}
export default SearchUsersModal;