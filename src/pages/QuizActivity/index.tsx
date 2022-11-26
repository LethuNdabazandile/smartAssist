import { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { IonAlert, IonBackButton, IonButton, IonButtons, IonCard, 
    IonCardContent, IonContent, 
    IonHeader, 
    // IonHeader, 
    IonIcon, 
    IonItem, 
    IonList, 
    IonModal, 
    IonPage,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
    useIonViewWillEnter 
} from '@ionic/react';
import { arrowBackCircle, arrowDown, arrowForwardCircle, checkmarkCircle, chevronBack, closeCircle, reloadCircle } from 'ionicons/icons';
import { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { AppContext } from '../../contexts/AppContextProvider';
import { getCurrentSubject, getCurrentTopic } from '../../services/State';
import { appAuthDomain, canvasToImage, genWebShare, makeRequests, ShowAlertInterface, videoFilesDomain, videoThumbDomain } from '../../services/Utils';

import SwiperButtonPrev from '../../components/SwiperPrevButton';
import SwiperButtonNext from '../../components/SwiperNextButton';
import ScoreGraph from '../../components/ScoreGraph';
// import ShareOptions from '../../components/ShareOptions';


import './index.css';

const QuizActivity:React.FC<any> = ({routerRef})=>{
    const { state } = useContext(AppContext);

    const [showModal, setShowModal] = useState({open: false});
    const [showAlertState, setShowAlert] = useState<ShowAlertInterface>({header: "", subHeader: "", message: "", buttons: [], showAlert: false});
    const [myQuestions, setMyQuestions] = useState<any[]>([]);
    let history = useHistory();
    let location = useLocation();

    var pageIn = location.pathname;
    pageIn = pageIn.substring(1, pageIn.length);

    const optionNums = ["A", "B", "C", "D", "E", "F"];


    const shareOptionsFunc = useCallback((platform: string)=>{
        // console.log('platform', platform);
        var requestObject:any = {};
        if (platform==='appimate') {
            
        } else {
            var quizLinkPerpare = ``;

            quizLinkPerpare = `https://appimate.com/quiz${location.search}`;

            var title = "Appimate | Quiz";
            var quizLink = quizLinkPerpare;
            var myQuizHeading = "I just finished my Quiz set.";
			var sharedImages = [canvasToImage(document.querySelector('canvas'), 'imgFromCanvas.jpeg')];
            genWebShare(title, myQuizHeading, quizLink, sharedImages).then(shareRes=>{
                console.log(shareRes);
                var actionType = 'shareVideoFail';
                if (shareRes) {
                    actionType = 'shareVideoSuccess';
                    window.history.back();
                };
                requestObject.data = {
                    actionType: actionType
                };
                makeRequests(state, requestObject);
            });
        }
    }, [state, location.search]);
    const handlePrev = ()=>{
        
    }
    const handleNext = ()=>{
        var quizProgress = true;
        myQuestions.forEach((checkQuestion)=>{
            if (!checkQuestion.answered) {
                quizProgress = false;
            };
        });
        if (quizProgress) {
            setShowModal({open: true});
        }
    }
    const verifyChoice = (question: any, choiceKey: any)=>{
        var requestObject = {
            method: "POST", 
            url: appAuthDomain("api/assessments?action=response"),
            data: {
                response: choiceKey,
                qID: question.qID,
                state: 1,
            }
        };
        makeRequests(state, requestObject).then(response=>{
            console.log(response);
        });
        myQuestions.forEach((checkQuestion, key)=>{
            if (checkQuestion.qID === question.qID) {
                var myQuestionsCopy = myQuestions;
                myQuestionsCopy[key] = {...question, answered: true, choice: choiceKey}
                setMyQuestions([...myQuestionsCopy]);
            }
        });
    }
    const viewExplanation = (question: any)=>{

    }
    const resultActions = (actionVal: string)=>{
        if (actionVal === 'finish') {
            setShowModal({...showModal, open: false});
            setTimeout(() => {
                history.goBack();
            }, 500);
        } else if (actionVal === 'retry') {
            setShowModal({...showModal, open: false});
            pushData(()=>{});
        } else if (actionVal === 'share') {
            shareOptionsFunc('other');
        }
    }

    const pushData = (callback: Function) => {
        var requestObj:any = {
            method: "GET", 
        };

        var currentGetParams = location.search;
        const params = new URLSearchParams(currentGetParams);
        const customSubject = params.get("subject"); // is the number 123
        const preparedSet = params.get("set"); // is the number 123
        if (customSubject) {
            const currentSubjectName = getCurrentSubject(state);
            const selectedTopic = getCurrentTopic(state);
            if (currentSubjectName) {
                requestObj.url = appAuthDomain(`api/assessments?appType=videos&action=getSets&type=customSet&subject=${encodeURIComponent(currentSubjectName.name)}&topic=${encodeURIComponent(selectedTopic.name)}`);
            } else {
                const customTopic:any = params.get("topic"); // is the number 123
                requestObj.url = appAuthDomain(`api/assessments?appType=videos&action=getSets&type=customSet&subject=${encodeURIComponent(customSubject)}&topic=${encodeURIComponent(customTopic)}`);                
            }
        } else if (preparedSet) {
            requestObj.url = appAuthDomain(`api/assessments?appType=videos&action=getSets&type=staticSet&quizSet=${encodeURIComponent(preparedSet)}`);
        } else {
            requestObj.url = appAuthDomain(`api/assessments?appType=videos&action=getSets&type=dynamicSet`);
        };
        makeRequests(state, requestObj).then(response=>{
            callback();
            // console.log(response);
            if (response.success) {
                var newData = response.data;
                var newDataModified:any = [];
                newData.forEach((theQuestion: any)=>{
                    var theQuestionModidied = theQuestion;
                    theQuestionModidied.qID = parseInt(theQuestion.qID);
                    theQuestionModidied.answer = parseInt(theQuestion.answer);
                    theQuestionModidied.questionType = parseInt(theQuestion.questionType);
                    newDataModified.push(theQuestionModidied);
                })
                setMyQuestions([
                    ...newDataModified
                ]);
            } else {
                var buttons = [
                    { 
                        text: 'back', role: "cancel", 
                        handler: () => { 
                            console.log('back'); 
                            history.goBack();
                        } 
                    },
                    { 
                        text: 'Retry', handler: () => {
                            console.log('Confirm Ok'); 
                            pushData(()=>{})
                        } 
                    } 
                ]
                var alertStateVarsSuccess = {header: response.msg, subHeader: response.msg2, message: response.msg3, buttons: buttons};
                setTimeout(() => {
                    setShowAlert({...alertStateVarsSuccess, showAlert: true});
                }, 1001);
            }
        })
    }
    
    useIonViewWillEnter(() => {
        pushData(()=>{});
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
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton defaultHref="home" text="Back" icon={chevronBack} />
                </IonButtons>
            </IonToolbar>
            <IonContent fullscreen>
                <Swiper
                    modules={[Pagination]}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                >
                    {
                        (myQuestions.length > 0)?(
                            myQuestions.map((question: any, key: number)=>{
                                return <SwiperSlide key={key} className='quizSlide'>
                                    <IonCard className='quizCard' onClick={()=>{
                                        viewExplanation(question)
                                    }}>
                                        {
                                            (question.questionImg !== "")?(
                                                <img decoding="async" loading="lazy" src={videoFilesDomain(question.questionImg)} alt={""}/>
                                            ):(
                                                ""
                                            )
                                        }
                                        <IonCardContent>
                                            {question.questionText}
                                        </IonCardContent>
                                    </IonCard>
                                    <div className='optionsHolder'>
                                        {
                                            question.options.map((option: any, key: number)=>{
                                                var hasOption = option !== "" && ((option.src !==null)&&(option.src !=="")&&(option.src !==" "));
                                                if (hasOption) {
                                                    return <div className= {('answered' in question)?("quizOption questionAttempted"):("quizOption")} key={key} onClick={()=>{
                                                        verifyChoice(question, key)
                                                    }}>
                                                        <div >
                                                            <p className='optionLabel'>
                                                                {optionNums[key]}.
                                                            </p>
                                                            <div className='theOption'>
                                                                <div className='theOptionMark'>
                                                                    {
                                                                        (key === question.choice)?(
                                                                            <>
                                                                                {
                                                                                    (question.answer === question.choice)?(
                                                                                        <IonIcon className='questionAttempMark questionGotCorrect' icon={checkmarkCircle}/>
                                                                                    ):(
                                                                                        <IonIcon className='questionAttempMark questionGotWrong' icon={closeCircle}/>
                                                                                    )
                                                                                }
                                                                            </>
                                                                        ):(
                                                                            ""
                                                                        )
                                                                    }
                                                                </div>
                                                                {
                                                                    ('answered' in question)?(
                                                                        <div className={(key === question.answer)?("questionOptions correctAnserHighlight"):("questionOptionss")}>
                                                                            {
                                                                                (option.type === "img")?(
                                                                                    <img className='optionImg' src={videoThumbDomain(option.src)} alt={"img"}/>
                                                                                ):(
                                                                                    <>
                                                                                    {
                                                                                        option.src
                                                                                    }
                                                                                    </>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    ):(
                                                                        <div className='questionOptions'>
                                                                            {
                                                                                (option.type === "img")?(
                                                                                    <img className='optionImg' src={videoThumbDomain(option.src)} alt={"img"}/>
                                                                                ):(
                                                                                    <>
                                                                                    {
                                                                                        option.src
                                                                                    }
                                                                                    </>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    )
                                                                }
                                                                
                                                            </div>
                                                        </div>
                                                    </div>;
                                                };
                                                return "";
                                            })
                                        }
                                    </div>
                                    <div className='quizProgressNavBtnsHolder'>
                                        <SwiperButtonPrev >
                                            <button className='quizProgressNavBtns quizSlidePrev'
                                                onClick={()=>{handlePrev()}}
                                            >
                                                <IonIcon icon={arrowBackCircle}/> Prev
                                            </button>
                                        </SwiperButtonPrev>
                                        <SwiperButtonNext >
                                            {
                                                (key === (myQuestions.length - 1))?(
                                                    <button className='quizProgressNavBtns quizSlideNext'
                                                        onClick={()=>{handleNext()}}
                                                    >
                                                        Complete <IonIcon icon={arrowForwardCircle}/>
                                                    </button>
                                                ):(
                                                    <button className='quizProgressNavBtns quizSlideNext'
                                                    >
                                                        Next <IonIcon icon={arrowForwardCircle}/>
                                                    </button>
                                                        )
                                            }
                                        </SwiperButtonNext>
                                    </div>
                                </SwiperSlide>;
                            })
                        ):(
                            <>
                            <IonCard className='quizCard'>
                                <p >
                                    <IonSkeletonText animated style={{height: "200px"}}/>
                                </p>
                            </IonCard>
                            <div className='optionsHolder'>
                                <div className='quizOption'>
                                    <div >
                                        <p className='optionLabel' >
                                            <IonSkeletonText style={{width: "100%", height: "100%"}} animated />
                                        </p>
                                        <p className='theOption' >
                                            <IonSkeletonText style={{width: "100%", height: "100%"}} animated />
                                        </p>
                                    </div>
                                </div>
                                <div className='quizOption'>
                                    <div>
                                        <p className='optionLabel'>
                                            <IonSkeletonText style={{width: "100%", height: "100%"}} animated />
                                        </p>
                                        <p className='theOption'>
                                            <IonSkeletonText style={{width: "100%", height: "100%"}} animated />
                                        </p>
                                    </div>
                                </div>
                                <div className='quizOption'>
                                    <div>
                                        <p className='optionLabel'>
                                            <IonSkeletonText style={{width: "100%", height: "100%"}} animated />
                                        </p>
                                        <p className='theOption'>
                                            <IonSkeletonText style={{width: "100%", height: "100%"}} animated />
                                        </p>
                                    </div>
                                </div>
                                <div className='quizOption'>
                                    <div>
                                        <p className='optionLabel'>
                                            <IonSkeletonText style={{width: "100%", height: "100%"}} animated />
                                        </p>
                                        <p className='theOption'>
                                            <IonSkeletonText style={{width: "100%", height: "100%"}} animated />
                                        </p>
                                    </div>
                                </div>
                            </div>
                            </>
                        )
                    }
                </Swiper>
            </IonContent>
            <IonAlert
                mode='ios'
                isOpen={showAlertState.showAlert}
                onDidDismiss={() => setShowAlert({...showAlertState, showAlert: false})}
                header={showAlertState.header}
                subHeader={showAlertState.subHeader}
                message={showAlertState.message}
                buttons={showAlertState.buttons}
            />
            <IonModal
                isOpen={showModal.open}
                presentingElement={routerRef.current}
                onDidDismiss={()=>{setShowModal({...showModal, open: false})}}
                canDismiss={true}
                mode='ios'
            >
                <IonHeader mode='ios'>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton fill="clear" onClick={()=>{setShowModal({...showModal, open: false})}}>
                                <IonIcon icon={arrowDown} />close
                            </IonButton>
                        </IonButtons>
                        <IonTitle>
                            Results.
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonCard >
                        <div className="scoreAnimatedGraphic">
                            <ScoreGraph score={myQuestions.filter(q=>q.answer === q.choice).length} total={myQuestions.length} color={"cyan"}/>
                        </div>
                    </IonCard>
                    <IonCard>
                        <IonList>
                        {
                            myQuestions.map((question: any, key: number)=>{
                                return <IonItem key={key}>
                                    <div className="resultNumbering">
                                        Q{key+1}
                                    </div>
                                    <div className="">
                                        I chose chose ({optionNums[question.choice]})
                                    </div>
                                    {
                                        (question.answer === question.choice)?(
                                            <IonIcon slot='end' className='questionAttempMark questionGotCorrect' icon={checkmarkCircle}/>
                                        ):(
                                            <IonIcon slot='end' className='questionAttempMark questionGotWrong' icon={closeCircle}/>
                                        )
                                    }
                                </IonItem>
                            })
                        }
                        </IonList>
                    </IonCard>
                </IonContent>
                <div className="resultLastActions">
                    <IonButton shape='round' className='resultActionsBtns' onClick={()=>{resultActions('finish')}}>finish</IonButton>
                    <IonButton shape='round' className='resultActionsBtns' onClick={()=>{resultActions('retry')}}>Retry <IonIcon icon={reloadCircle}/></IonButton>
                    <IonButton shape='round' className='resultActionsBtns' onClick={()=>{resultActions('share')}}>Share</IonButton>
                </div>
            </IonModal>
        </IonPage>
    );
}

export default QuizActivity;