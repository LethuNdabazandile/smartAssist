import { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { IonBackButton, IonBadge, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { checkmarkDoneCircle, chevronBack, trophy } from 'ionicons/icons';

import { AppContext } from '../../contexts/AppContextProvider';
import { getMySubjects, setCurrentSubject } from '../../services/State';
import { makeRequests, quizSourceDomain, supportedSubjects } from '../../services/Utils';

import './index.css';


const Quiz:React.FC = ()=>{
    const { state, dispatch } = useContext(AppContext);

    var [quizDataState, setQuizDataState] = useState<any>({myQuizPoints: 0, myQuizRanking: 0, myQuizMsgTitle: "Daily sets", myQuizMsg: "Take 5 for today" });
    const history = useHistory();
    const mySubjects = getMySubjects(state);

    const goToSubject = (subject: any)=>{
        dispatch(setCurrentSubject(subject));
        history.push("/subject?name="+subject.code);
    }
    const getQuizData = ()=>{


        var requestOnject = {
            methos: "POST",
            url: quizSourceDomain("api/assessments?leaderboard=0"),
            data: {
                appType: "videos"
            }
        }
        makeRequests(state, requestOnject).then(response=>{
            // console.log(response);
            if (response.success) {
                var fullData = response.data;
                var myQuizDash = fullData.myQuizDash;
                if (myQuizDash) {
                    setQuizDataState(myQuizDash);
                };
            } else {
                // setQuizDataState({myQuizPoints: 0, myQuizRanking: 0, myQuizMsgTitle: "Daily sets", myQuizMsg: "Take 5 for today" });
            }
        })
    }

    useIonViewWillEnter(() => {
        getQuizData();
    });

    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="home" text="Back" icon={chevronBack} />
                    </IonButtons>
                    <IonTitle>Quiz</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">Quiz</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div>
                    <IonCard className='quizAvgPerformance' routerLink='/leaderboard' mode='ios'>
                        <div className='firstRect'>
                            <div className='rectParts'>
                                <div className='partIcons'>
                                    <IonIcon icon={checkmarkDoneCircle} className="partIcon avgPer"/>
                                </div>
                                <div className='textPart'>
                                    <p className='para1'>
                                        <span>
                                            {quizDataState.myQuizPoints}
                                        </span>
                                        <br/>
                                        Points
                                    </p>
                                </div>   
                            </div>
                            <div className='rectParts'>
                                <div className='partIcons'>
                                    <IonIcon icon={trophy} className="partIcon"/>
                                </div>
                                <div className='textPart'>
                                    <p className='para1'>
                                        <span>
                                            {quizDataState.myQuizRanking}
                                        </span>
                                        <br/>
                                        Ranking
                                    </p>
                                </div> 
                            </div>
                        </div>
                    </IonCard>
                    
                    <IonCard className='quizAvgPerformance' routerLink={quizDataState.activity || '/activity'} mode='ios'>
                        {
                            (state.user.homeData.activities>0)?(
                            <IonBadge color="danger" style={{right: "5%", position: "absolute", zIndex: 1000}}>
                                {
                                    (state.user.homeData.activities > 99)?(
                                        `${state.user.homeData.activities}+`
                                    ):(
                                        state.user.homeData.activities
                                    )
                                }
                            </IonBadge>
                            ):("")
                        }
                        <div className='firstRect'>
                            <div className='rectParts'>
                                <div className='partIcons'>
                                    {/* <IonIcon icon={checkmarkDoneCircle} className="partIcon avgPer"/> */}
                                </div>
                                <div className='textPart'>
                                    <p className='para1'>
                                        <span>
                                            {quizDataState.myQuizMsgTitle}
                                        </span>
                                        <br/>
                                        {quizDataState.myQuizMsg}
                                    </p>
                                </div>   
                            </div>
                        </div>
                    </IonCard>
                </div>
                <div className='quizSubjectList'>
                    {
                        mySubjects.map((subject: { code: string | number; name: string; }, key: number)=>{
                            return <IonCard key={key} className={"quizSubject "+supportedSubjects[subject.code].colorClass} onClick={() => {
                                goToSubject(supportedSubjects[subject.code]);
                            }} mode='ios'>
                                <IonIcon icon={(supportedSubjects[subject.code]).icon} className="quizSubjectIcons"/>
                                <p className='gridTitle'>{(supportedSubjects[subject.code]).name}</p>
                            </IonCard>;
                        })
                    }
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Quiz;