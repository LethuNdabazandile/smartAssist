import { useContext, useState } from 'react';
import { useHistory } from 'react-router';

import { 
    IonAvatar, IonContent, IonHeader, IonInfiniteScroll, 
    IonInfiniteScrollContent, IonItem, 
    IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, 
    IonSearchbar, IonTitle, 
    IonToolbar, RefresherEventDetail, useIonToast, useIonViewWillEnter 
} from '@ionic/react';
import { chevronDownCircleOutline } from 'ionicons/icons';

import { AppContext } from '../../contexts/AppContextProvider';
import { appAuthDomain, getInitials, makeRequests } from '../../services/Utils';

import './index.css';

  

const Notifications:React.FC<any> = ({doPlay})=>{
    const { state } = useContext(AppContext);

    
    const [data, setData] = useState<any>([]);
    const [searchNotifyText, setSearchNotifyText] = useState("");
    const [searchNotificationsList, setSearchNotificationsList] = useState<any>([]);
    const [isInfiniteDisabled, setInfiniteDisabled] = useState(false);
    const [present, dismiss] = useIonToast();
    const history = useHistory();

    const onClick = (item: any)=>{
        if ((item.about === 0)||(item.about === "0")) {
            var video = {id: item.aboutID, subject: item.head};
            history.push('?vid='+video.id);
            doPlay(video, []);
        } else {
            
        };

        var reqObj = {
            method: "POST",
            url: appAuthDomain('api/requests'),
            data: {
                about:'notifications', 
                open: 1, 
                notifyID: item.id
            }
        };
        makeRequests(state, reqObj).then(response=>{
            // appimate.addNotificationBadge(-1);
        });
    }
    const searchFunc = (keyWords: string)=>{
        var requestObj = {
            method: 'GET',
            url: appAuthDomain("api/search?appType=videos&focus=notifications&q="+keyWords),
        };
        setSearchNotifyText(keyWords);
        makeRequests(state, requestObj).then((response)=>{
            if (response.success) {
                setSearchNotificationsList(response.data);
            } else {
                var testUsers:any = [
                    // {id: 1, firstname: "WWW", lastname: "XXX", profilePic: appAuthDomain("assets/icon/ICON 48x48.png")},
                    // {id: 2, firstname: "YYY", lastname: "ZZZ", profilePic: appAuthDomain("assets/icon/ICON 48x48.png")},
                    // {id: 3, firstname: "AAA", lastname: "BBB", profilePic: appAuthDomain("assets/icon/ICON 48x48.png")},
                ];
                setSearchNotificationsList(testUsers);
            }
        });
    }
    const doRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        const callbackFunct = ()=>{
            event.detail.complete();
        }
        pushData(callbackFunct, 1);
    }
    const pushData = (callback: Function, direction: number) => {
        var lastNotifyID:number = 0;
        if (data.length > 0) {
            var oldestFound = data[data.length - 1];
            var lastNofification = data[0];
            if (typeof lastNofification === 'object') {
                if ('id' in lastNofification) {
                    if (direction < 0) {
                        lastNotifyID = oldestFound['id'];
                    } else {
                        lastNotifyID = lastNofification['id'];
                    }
                }
            }
        };
        var requestObj = {
            method: "GET", 
            url: appAuthDomain('api/notifications?appType=videos'), 
            data: {
                fetching: 1, 
                lastNotifyID, 
                direction,
            }
        };
        makeRequests(state, requestObj).then(response=>{
            callback();
            console.log(response);
            if (response.success) {
                var newData = response.data;
                setData([
                    ...data,
                    ...newData
                ]);
            } else {
                var newDataTest:any = [
                    // {id: 1, profilePic: "assets/icon/ICON 144x144.png", head: "xxx", body: "yyy"},
                    // {id: 2, profilePic: "assets/icon/ICON 144x144.png", head: "xxx", body: "yyy"},
                    // {id: 3, profilePic: "assets/icon/ICON 144x144.png", head: "xxx", body: "yyy"},
                    // {id: 4, profilePic: "assets/icon/ICON 144x144.png", head: "xxx", body: "yyy"},
                ];
                setData([
                    ...data,
                    ...newDataTest
                ]);
                present({
                    position: "bottom",
                    buttons: [{ text: 'hide', handler: () => dismiss() }],
                    message: response.msg,
                    duration: 2000
                });
            }
        })
    }
    const loadData = (ev: any, direction: number) => {
        setTimeout(() => {
            const callbackFunct = ()=>{
                ev.target.complete();
            };
            pushData(callbackFunct, direction);            
            if (data.length === 1000) {
                setInfiniteDisabled(true);
            };
        }, 500);
    }

    useIonViewWillEnter(() => {
        if (data.length < 1) {
            pushData(()=>{}, -1);
        }
    });

    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonTitle>Notifications</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader mode='ios' collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Notifications</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonSearchbar mode='ios' onIonChange={e => searchFunc(e.detail.value!)} animated showCancelButton='focus'/>
                {
                    ( (searchNotificationsList.length>0)||(searchNotifyText.replace(" ", "")!=="") )?(
                        <IonList mode='ios'>
                            {
                                (searchNotificationsList.length>0)?(
                                    searchNotificationsList.map((item: any, key: number) => {
                                        return (
                                            <IonItem key={key} onClick={()=>{onClick(item)}} mode="ios">
                                                <IonAvatar className='profileAVTR'>
                                                    {
                                                        (item.profilePic)?(
                                                            <img src={item.profilePic} alt="profilePic"/>
                                                        ):(
                                                            <div className='profileAVTRNoPic'>
                                                                <span>
                                                                    {getInitials(item.firstname+" "+item.lastname)}
                                                                </span>
                                                            </div>
                                                        )
                                                    }
                                                </IonAvatar>
                                                <IonLabel className='notifyListtext'>
                                                    <h4>
                                                        {item.firstname+" "+item.lastname}
                                                    </h4>
                                                    <p>
                                                        {item.head}
                                                    </p>
                                                    <p>
                                                        {item.body}
                                                    </p>
                                                </IonLabel>                                    
                                            </IonItem>
                                        )
                                    })
                                ):(
                                    <p className='searchUserParagraph'>
                                        {"No matches found for: "}
                                        <span>
                                            {"'"+searchNotifyText+"'"}
                                        </span>
                                    </p>
                                )
                            }
                        </IonList>
                    ):(
                        <>
                        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
                            <IonRefresherContent
                                pullingIcon={chevronDownCircleOutline}
                                pullingText="Pull to refresh"
                                refreshingSpinner="circles"
                                refreshingText="Refreshing...">
                            </IonRefresherContent>
                        </IonRefresher>

                        <IonList mode='ios'>
                            {
                                data.map((item: any, key: number) => {
                                    return (
                                        <IonItem key={key} onClick={()=>{onClick(item)}} mode="ios">
                                            <IonAvatar className='profileAVTR'>
                                                {
                                                    (item.profilePic)?(
                                                        <img src={appAuthDomain(item.profilePic)} alt="profilePic"/>
                                                    ):(
                                                        <div className='profileAVTRNoPic'>
                                                            <span>
                                                                {getInitials(item.firstname+" "+item.lastname)}
                                                            </span>
                                                        </div>
                                                    )
                                                }
                                            </IonAvatar>
                                            <IonLabel className='notifyListtext'>
                                                <h4>
                                                    {item.firstname+" "+item.lastname}
                                                </h4>
                                                <p>
                                                    {item.head}
                                                </p>
                                                <p>
                                                    {item.body}
                                                </p>
                                            </IonLabel>                                    
                                        </IonItem>
                                    )
                                })
                            }
                        </IonList>
                        <IonInfiniteScroll
                        onIonInfinite={(evt)=>{loadData(evt, -1)}}
                        threshold="100px"
                        disabled={isInfiniteDisabled}
                        >
                            <IonInfiniteScrollContent
                                loadingSpinner="bubbles"
                                loadingText="Loading more notifications..."
                            ></IonInfiniteScrollContent>
                        </IonInfiniteScroll>
                        </>
                    )
                }
            </IonContent>
        </IonPage>
    );
}

export default Notifications;