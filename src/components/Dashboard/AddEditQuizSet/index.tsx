import { useCallback, useContext, useState } from 'react';

import { IonAvatar, IonButton, IonButtons, IonCard, IonChip, IonContent, IonHeader, IonIcon, IonImg, IonItem, 
    IonLabel, IonModal, IonSearchbar, IonSelect, IonSelectOption, IonThumbnail, IonTitle, IonToolbar,
    // loadingController
} from '@ionic/react';
import { chevronDown, closeCircle, cloudUpload, create, informationCircle } from 'ionicons/icons';

import { AppContext } from '../../../contexts/AppContextProvider';
import { genWebShare, localDomain, makeRequests, videoThumbDomain } from '../../../services/Utils';

import './index.css';
import ShareOptions from '../../ShareOptions';

const AddQuizSet:React.FC<any> = ({purpose, mySetInfo, setShowLoading, setShowAlertState})=>{
    const {state} = useContext(AppContext);
    const [quizResults, setQuizResults] = useState([]);
    const [selectedQuestions, setSelectedQuestion] = useState<any>([]);
    const [modalTwo, setModalTwo] = useState<any>({open: false, title: "", initialBreakpoint: 0.5, body: ""});

    const captureSelectedQuestion = (question: any)=>{
        setSelectedQuestion([...selectedQuestions, {id: question.id, questionText: question.questionText, questionImg: question.questionImg}]);
        setQuizResults([]);
    }
    const removeSeletedQuestion = (question: any)=>{
        var newQuestions = selectedQuestions.filter((q: any)=>q.id !== question.id);
        setSelectedQuestion(newQuestions);
    }
    const searchQuestions = (text: string)=>{
        if (text.length > 0) {
            var requestObj = {method: "GET", url: localDomain("api/search?appType=videos&focus=quiz&q="+text)};
            makeRequests(state, requestObj).then(response=>{
                if (response.success) {
                    setQuizResults(response.data);
                } else {
                    setQuizResults([]);
                }
            });
        } else {
            setQuizResults([]);
        }
    }
    const handleActionsClose = useCallback(() => {
        setModalTwo({...modalTwo, open: false});
    }, [modalTwo]);
    const shareOptionsFunc = useCallback((platform: string, aboutQuizSet)=>{
        var requestObject:any = {};
        if (platform==='appimate') {
            
        } else {
            console.log('aboutQuizSet', aboutQuizSet);
            var title = "Appimate | Quiz set";
            var heading = "Created By: "+aboutQuizSet.creatorNames;
            var quizLink = `https://appimate.com/quiz?set=${encodeURIComponent(aboutQuizSet.id)}`;

            
            genWebShare(title, heading, quizLink, null).then(shareRes=>{
                console.log(shareRes);
                var actionType = 'shareQuizSetFail';
                if (shareRes) {
                    actionType = 'shareQuizSetSuccess';
                    // window.history.back();
                    handleActionsClose();
                };
                requestObject.data = {
                    actionType: actionType
                };
                requestObject.url = localDomain("api/requests?appType=videos&action=shareQuizSet&setID="+aboutQuizSet.id)
                makeRequests(state, requestObject);
            });
        };
    }, [state, handleActionsClose]);
    const submitFunction = (e: any)=>{
        e.preventDefault();
        e.stopPropagation();
        var formData = new FormData(e.target);
        setShowLoading({showLoadingMessage: "Submitting ...", showLoading: true, triggered: false});
        formData.append('appType', 'videos');

        var formDataObj = Object.fromEntries(formData);
        var headers = {
            "Content-Type": "multipart/form-data"
        };
        const logProgress = (progressEvent: any)=>{
            // setShowLoading({showLoadingMessage: "", showLoading: false, triggered: false});
            var textToShow:any = Math.floor((progressEvent.loaded/progressEvent.total)*100);
            if (textToShow === 100) {
                textToShow = textToShow+"% Complete.";
                setTimeout(() => {
                    textToShow = textToShow+"% Done: just waiting for the server.";
                }, 1);
            } else {
                textToShow = textToShow+"% uploaded.";
            };
            setShowLoading({showLoadingMessage: textToShow, showLoading: true, triggered: false});
        }
        const onUploadProgress = {onUploadProgress: logProgress}
        var requestObj = {method: "POST", url: e.target.action, headers: headers, onUploadProgress, data: formDataObj};
        makeRequests(state, requestObj).then(response=>{
            // console.log(response);
            setTimeout(() => {
                setShowLoading({showLoadingMessage: "", showLoading: false, triggered: false});
            }, 500);
            var buttonActions = [];
            if (response.success) {
                buttonActions = [
                    {
                        text: 'Done',
                        handler: () => {
                            handleActionsClose();
                        }
                    },
                    {
                        text: 'Done: Now, share.',
                        handler: () => {
                            setModalTwo({...modalTwo, 
                                open: true, 
                                initialBreakpoint: 0.4,
                                title: "Sharing options", 
                                body: <ShareOptions onClickHandler={shareOptionsFunc} extraValues={response.data} />
                            });
                        }
                    }
                ];
            } else {
                buttonActions = [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            // window.history.back();
                            handleActionsClose();
                        }
                    },
                    {
                        text: 'Retry',
                        handler: () => {
                            submitFunction(e);
                        }
                    }
                ];
            }
            var alertStateVars = {header: response.msg, subHeader: "", message: response.msg2, buttons: buttonActions};
            setTimeout(() => {
                setShowAlertState({...alertStateVars, showAlert: true});
            }, 500);
        });
    };
    
    var selectedQuestionsForSubmission = selectedQuestions.map((q:any)=>{
        return {id: q.id};
    });

    return (
        <>
        <IonCard>
        {
            (purpose==="add")?(
                <>
                <form action={localDomain("api/addEditQuiz?action=addQuizSet")} onSubmit={submitFunction}>
                    <>
                    <input name='in_ListOfQuestions' type={'hidden'} value={JSON.stringify(selectedQuestionsForSubmission)}/>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Is the set Private or public?</IonLabel>
                        <IonSelect name="in_Private" interface="action-sheet">
                            <IonSelectOption value="0">Private</IonSelectOption>
                            <IonSelectOption value="1">Public</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonCard>
                        <IonSearchbar searchIcon={informationCircle} placeholder="Search for questions" onIonChange={e => searchQuestions(e.detail.value!)} showCancelButton="focus" animated/>
                        {
                            (quizResults.length > 0)?(
                                quizResults.map((question: any, key)=>{
                                    return <IonItem key={key} onClick={()=>{captureSelectedQuestion(question)}} >
                                        <IonThumbnail slot="start" >
                                            <img src={videoThumbDomain(question.questionImg)} alt={question.heading}/>
                                        </IonThumbnail>
                                        <IonLabel >
                                            <h2>{question.questionText}</h2>
                                            <p>{question.explanationText}</p>
                                        </IonLabel>
                                    </IonItem>
                                })
                            ):(
                                <>
                                {
                                    (Object.keys(selectedQuestions).length > 0)?(
                                        <>
                                        {
                                            selectedQuestions.map((question: any, key: number)=>{
                                                return <IonChip key={key}>
                                                    <IonAvatar>
                                                        <IonImg src={videoThumbDomain(question.questionImg)}/>
                                                    </IonAvatar>
                                                    <IonLabel>{question.questionText}</IonLabel>
                                                    <IonIcon icon={closeCircle} onClick={()=>{removeSeletedQuestion(question)}} />
                                                </IonChip>
                                            })
                                        }
                                        </>
                                    ):("")
                                }
                                </>
                            )
                        }
                    </IonCard>
                    </>
                    <br/>
                    <br/>
                    <IonButton type='submit' expand='block' ><IonIcon icon={cloudUpload}/>Submit Quiz</IonButton>
                </form>
                </>
            ):(
                <>
                <form action={localDomain("api/addEditQuiz?action=editQuizSet")} onSubmit={submitFunction}>
                    <>
                    <input name='in_QuestionSet' type={'hidden'} value={mySetInfo.id}/>
                    <input name='in_ListOfQuestions' type={'hidden'} value={JSON.stringify(selectedQuestionsForSubmission)}/>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Is the set Private or public?</IonLabel>
                        <IonSelect name="in_Private" interface="action-sheet">
                            <IonSelectOption value="0">Private</IonSelectOption>
                            <IonSelectOption value="1">Public</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonCard>
                        <IonSearchbar searchIcon={informationCircle} placeholder="Search for questions" onIonChange={e => searchQuestions(e.detail.value!)} showCancelButton="focus" animated/>
                        {
                            (quizResults.length > 0)?(
                                quizResults.map((question: any, key)=>{
                                    return <IonItem key={key} onClick={()=>{captureSelectedQuestion(question)}} >
                                        <IonThumbnail slot="start" >
                                            <img src={videoThumbDomain(question.questionImg)} alt={question.heading}/>
                                        </IonThumbnail>
                                        <IonLabel >
                                            <h2>{question.questionText}</h2>
                                            <p>{question.explanationText}</p>
                                        </IonLabel>
                                    </IonItem>
                                })
                            ):(
                                <>
                                {
                                    (Object.keys(selectedQuestions).length > 0)?(
                                        <>
                                        {
                                            selectedQuestions.map((question: any, key: number)=>{
                                                return <IonChip key={key}>
                                                    <IonAvatar>
                                                        <IonImg src={videoThumbDomain(question.questionImg)}/>
                                                    </IonAvatar>
                                                    <IonLabel>{question.questionText}</IonLabel>
                                                    <IonIcon icon={closeCircle} onClick={()=>{removeSeletedQuestion(question)}} />
                                                </IonChip>
                                            })
                                        }
                                        </>
                                    ):("")
                                }
                                </>
                            )
                        }
                    </IonCard>
                    </>
                    <br/>
                    <br/>
                    <IonButton type='submit' expand='block' ><IonIcon icon={create}/>Submit Quiz</IonButton>
                </form>
                </>
            )
        }
        </IonCard>
        <IonModal
        isOpen={modalTwo.open}
        // presentingElement={playerRef.current}
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
        </>
    )
}

export default AddQuizSet;