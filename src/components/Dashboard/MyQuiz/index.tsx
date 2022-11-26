
import { useCallback, useContext, useEffect, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonIcon, IonInfiniteScroll, 
    IonInfiniteScrollContent, IonRefresher, IonRefresherContent, IonSearchbar, IonThumbnail, RefresherEventDetail
} from '@ionic/react';
import { chevronDownCircleOutline, pencil } from 'ionicons/icons';

import { AppContext } from '../../../contexts/AppContextProvider';
import { localDomain, makeRequests } from '../../../services/Utils';

import './index.css';
const MyQuiz:React.FC<any> = ({showMyModal, setShowLoading, setShowAlertState})=>{
    const {state} = useContext(AppContext);
    
    const [searchText, setSearchText] = useState('');
    const [initialDataLoad, setInitialDataLoad] = useState<boolean>(false);
    const [listOfQuiz, setListOfQuiz] = useState<any>([]);
    const [isInfiniteDisabled, setInfiniteDisabled] = useState(false);


    const quizPreview = (question: any)=>{
        var buttonActions = [
            {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                    
                }
            },
            {
                text: 'Edit',
                handler: () => {
                    showMyModal(7, question);
                }
            }
        ];
        var alertStateVars = {header: "Actions", subHeader: "", message: "What do you want to do?", buttons: buttonActions};
        setShowAlertState({...alertStateVars, showAlert: true});
    }
    const quizActions = (question: any)=>{
        
    }
    const pullMyQuiz = useCallback((callback: Function, direction: number)=>{
        setInitialDataLoad(true);
        var startFrom:number = 0;
        if (listOfQuiz.length > 0) {
            var oldestFound = listOfQuiz[listOfQuiz.length - 1];
            var lastQuiz = listOfQuiz[0];
            if (typeof lastQuiz === 'object') {
                if ('qID' in lastQuiz) {
                    if (direction < 0) {
                        startFrom = oldestFound['qID'];
                    } else {
                        startFrom = lastQuiz['qID'];
                    }
                }
            }
        };

        var requestObj = {
            method: "GET", 
            url: localDomain("api/adminStream?appType=videos&action=pullQuestions&listSize=10&direction="+direction+"&startFrom="+startFrom), 
        };
        makeRequests(state, requestObj).then(response=>{
            callback();
            var buttonActions = [];
            if (response.success) {
                var newData = response.data;
                setListOfQuiz([
                    ...listOfQuiz, ...newData
                ]);
            } else {
                if(response.action){
                    buttonActions = [
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary',
                            handler: () => {
                                console.log('Confirm Cancel');
                            }
                        },
                        {
                            text: 'Retry',
                            handler: () => {
                                pullMyQuiz(callback, direction);
                            }
                        }
                    ];
                    var alertStateVars = {header: "Error encountered", subHeader: "", message: response.message, buttons: buttonActions};
                    setTimeout(() => {
                        setShowAlertState({...alertStateVars, showAlert: true});
                    }, 1001);
                }else{
                    setListOfQuiz([]);
                }
            }
        });
    }, [state, setShowAlertState, listOfQuiz]);
    const loadData = (ev: any, direction: number) => {
        setTimeout(() => {
            const callbackFunct = ()=>{
                ev.target.complete();
            };
            pullMyQuiz(callbackFunct, direction);            
            if (listOfQuiz.length === 1000) {
                setInfiniteDisabled(true);
            };
        }, 500);
    }
    const doRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        const callbackFunct = ()=>{
            event.detail.complete();
        }
        pullMyQuiz(callbackFunct, 1);
    }
    
    useEffect(()=>{
        if (listOfQuiz.length < 1) {
            if (!initialDataLoad) {
                pullMyQuiz(()=>{}, -1);
            }
        }
    }, [pullMyQuiz, initialDataLoad, listOfQuiz]);


    return (
        <>
        <IonSearchbar
            value={searchText} onIonChange={e => setSearchText(e.detail.value!)}
            animated
            showCancelButton="focus"
        ></IonSearchbar>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent
                pullingIcon={chevronDownCircleOutline}
                pullingText="Pull to refresh"
                refreshingSpinner="circles"
                refreshingText="Refreshing...">
            </IonRefresherContent>
        </IonRefresher>
           {
                (listOfQuiz.length > 0) ? (
                    listOfQuiz.map((question: any, key: number) => {
                        return <IonCard key={key} onClick={()=>quizPreview(question)} className={"myQuizListCard"}>
                        <IonCardHeader>
                            {
                                (question.questionImg !== "")?(
                                    <IonThumbnail className='carIconPart'>
                                        <img 
                                        decoding="async" loading="lazy" 
                                        src={localDomain(question.questionImg)} alt={question.questionImg}/>
                                    </IonThumbnail>
                                ):("")
                            }
                            <IonCardSubtitle>
                                Type:    {(question.qType === "0")?("Multiple Choice"):( "Long")} question.
                            </IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <div className='questionDetailsPart'>
                                <div>
                                    <h4>Audience: {question.demographic}</h4>
                                    <h4>Class level: {question.classLevel}</h4>
                                    <h4>Subject: {question.qSubject}</h4>
                                    <h4>Topic: {question.qTopic.name}</h4>
                                </div>
                                <div>
                                    <h4>Difficulty: {question.difficulty}</h4>
                                    <h4>Answer: Option {question.ans}</h4>
                                    <h4>Number of options: {(question.options)?(question.options.length):("")}</h4>
                                </div>
                            </div>
                            <IonButton size='small' slot='end' onClick={()=>quizActions(question)}><IonIcon icon={pencil}/></IonButton>
                        </IonCardContent>
                    </IonCard>
                    })
                ) : (
                    <p style={{textAlign: "center"}}>No Quiz information available</p>
                )
           }
           <IonInfiniteScroll
           onIonInfinite={(evt)=>{loadData(evt, -1)}}
           threshold="100px"
           disabled={isInfiniteDisabled}
           >
               <IonInfiniteScrollContent
                   loadingSpinner="bubbles"
                   loadingText="Loading more questions..."
               ></IonInfiniteScrollContent>
           </IonInfiniteScroll>
        </>
    )
}

export default MyQuiz;