import { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

import { IonBackButton, IonButtons, IonCard, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, 
    IonIcon, IonPage, IonRefresher, IonRefresherContent, IonRow, IonTitle, IonToolbar, RefresherEventDetail, 
    useIonToast, useIonViewWillEnter 
} from '@ionic/react';
import { chevronBack, chevronDownCircleOutline, ellipseOutline } from 'ionicons/icons';

import { AppContext } from '../../contexts/AppContextProvider';
import { getCurrentSubject, setCurrentTopic } from '../../services/State';
import { appAuthDomain, makeRequests, onDeviceStorage } from '../../services/Utils';

import './index.css';

const Subject:React.FC = ()=>{
    const { state, dispatch } = useContext(AppContext);

    const [myTopics, setMyTopics] = useState<any[]>([]);
    const [present, dismiss] = useIonToast();
    const history = useHistory();
    let location = useLocation();

    var pageIn = location.pathname;
    pageIn = pageIn.substring(1, pageIn.length);

    const currentSubjectName = getCurrentSubject(state);


    const doRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        const callbackFunct = ()=>{
            event.detail.complete();
        }
        pushData(callbackFunct);
    }
    const pushData = (callback: Function) => {
        var topicsSubject:string = currentSubjectName.code;
        var requestObj = {
            method: "POST", 
            url: appAuthDomain(`api/assessments?action=pullTopics&subject=${topicsSubject}&type=full`), 
            data: {
                appType: 'videos',
                type: 'full',
            }
        };
        makeRequests(state, requestObj).then(response=>{
            callback();
            // console.log(response);
            if (response.success) {
                var newData = response.data;
                setMyTopics([
                    ...newData
                ]);

                onDeviceStorage('get', 'topics').then((localCurrentTopics: any)=>{
                    var currentTopics = localCurrentTopics || "{}";
                    currentTopics = JSON.parse(currentTopics);
                    var keepTopics = {
                        ...currentTopics,
                        [topicsSubject]: newData
                    }
                    onDeviceStorage('set', {topics: JSON.stringify(keepTopics)});
                })
            } else {
                present({
                    position: "bottom",
                    buttons: [{ text: 'hide', handler: () => dismiss() }],
                    message: response.msg,
                    duration: 2000
                });
            }
        })
    }
    const goToQuiz = (topic: any)=>{
        dispatch(setCurrentTopic(topic));
        history.push("/activity?subject="+encodeURIComponent(currentSubjectName.code)+"&topic="+encodeURIComponent(topic.id));
    }
    useIonViewWillEnter(() => {

        onDeviceStorage('get', 'topics').then((localCurrentTopics: any)=>{
            var currentTopics = localCurrentTopics || "{}";
            currentTopics = JSON.parse(currentTopics);
            if (currentTopics[currentSubjectName.code]) {
                var pulledLocalCurrentTopics = currentTopics[currentSubjectName.code];
                setMyTopics([
                    ...pulledLocalCurrentTopics
                ]);
            }

            setTimeout(() => {
                pushData(()=>{});
            }, 500);
        });
    });
    useEffect(() => {
        const bottomNav = document.getElementById("defaultIonicTabBar");
        if (bottomNav) {
            bottomNav.style.display = "none";
        };
        return ()=> {
            if (bottomNav) {
                bottomNav.style.display = "flex";
            }
        }
    },[pageIn]);

    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="home" text="Back" icon={chevronBack} />
                    </IonButtons>
                    <IonTitle>{currentSubjectName.name}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen >
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">{currentSubjectName.name}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
                    <IonRefresherContent
                        pullingIcon={chevronDownCircleOutline}
                        pullingText="Pull to refresh"
                        refreshingSpinner="circles"
                        refreshingText="Refreshing...">
                    </IonRefresherContent>
                </IonRefresher>
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonCard mode='ios' className='homeAvgPerformance' onClick={() => history.push("/leaderboard")}>
                                <div className='firstRect'>
                                    <div className='dailyQ'>
                                         <IonIcon icon={ellipseOutline} className="circleQ"/>
                                        <div className='parablockQ'>
                                            <p className='paraQ'>Progress <span>50</span></p>
                                        </div>   
                                    </div>
                                </div>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                    <IonCardTitle mode='ios'>
                        Topics
                    </IonCardTitle>
                    {
                        myTopics.map((topic: any, key: number)=>{
                            return <IonCard mode='ios' key={key} className="quizSubjectsTopics" onClick={() => goToQuiz(topic)}>
                                {/* <IonIcon icon={[topic.code]).icon} className="gridIcons"/> */}
                                <p className='gridTitle'>{topic.name}</p>
                            </IonCard>;
                        })
                    }
                </IonGrid>
            </IonContent>
        </IonPage>
    );
}

export default Subject;