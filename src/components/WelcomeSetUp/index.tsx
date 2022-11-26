import React, { useCallback, useContext, useEffect, useState } from 'react';
import { IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBackCircle, arrowDown, arrowForwardCircle, checkmarkCircle } from 'ionicons/icons';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';
import 'swiper/css';
import SwiperButtonNext from '../SwiperNextButton';
import SwiperButtonPrev from '../SwiperPrevButton';


import { AppContext } from '../../contexts/AppContextProvider';
import { setSetupState, isSetUp, setMySubjects } from '../../services/State';
import { appAuthDomain, arrayEntriesByArrayOnKeyValue, makeRequests, onDeviceStorage, supportedSubjects } from '../../services/Utils';

import './index.css';

const WelcomeSetup:React.FC<any> = ({routerRef})=>{
    const { state, dispatch } = useContext(AppContext);

    const [personalizationObj, setPersonalizationObj] = useState<any>({});
    const [completeSelection, setCompleteSelection] = useState(true);

    
    var personalObject:any = {
        subjects: {
            school:[], 
            college:[], 
            varsity:[], 
        },
        school: <SwiperButtonNext >
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='Gr8'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'Gr8'})}}>
                Grade 8 <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='Gr9'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'Gr9'})}}>
                Grade 9 <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='Gr10'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'Gr10'})}}>
                Grade 10 <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='Gr11'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'Gr11'})}}>
                Grade 11 <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='Gr12'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'Gr12'})}}>
                Grade 12 <IonIcon icon={arrowForwardCircle}/>
            </div>
        </SwiperButtonNext >,
        college: <SwiperButtonNext >
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='N1'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'N1'})}}>
                N1 <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='N2'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'N2'})}}>
                N2 <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='N3'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'N3'})}}>
                N3 <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='N4'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'N4'})}}>
                N4 <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='N5'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'N5'})}}>
                N5 <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='N6'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'N6'})}}>
                N6 <IonIcon icon={arrowForwardCircle}/>
            </div>
        </SwiperButtonNext >,
        varsity: <SwiperButtonNext >
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='Yr1'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'Yr1'})}}>
                First year <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='Yr2'))?('selectedClassLevel'):(''))} onClick={()=>{personalizationSelector({'classLevel': 'Yr2'})}}>
                Second year <IonIcon icon={arrowForwardCircle}/>
            </div>
            <div className={'welcomeChoices '+(((personalizationObj.classLevel==='Yr3'))?('selectedClassLevel'):(''))}onClick={()=>{personalizationSelector({'classLevel': 'Y3'})}}>
                Senior years <IonIcon icon={arrowForwardCircle}/>
            </div>
        </SwiperButtonNext >
    }

    const handleClose = useCallback(() => {
        dispatch(setSetupState(true));
    }, [dispatch]);
    const selectSubject = (subject: any)=>{
        var subjKey = subject.subject.subjKey;
        var fullPersonalization = personalizationObj;
        var personalizationSubject:any = {};
        if (fullPersonalization.subjects) {
            personalizationSubject = fullPersonalization.subjects;
            if (!(subjKey in personalizationObj.subjects )) {
                personalizationSubject[subjKey] = subject.subject;
            } else {
                delete personalizationSubject[subjKey];
            }
        } else {
            personalizationSubject[subjKey] = subject.subject;
        };
        fullPersonalization.subjects = personalizationSubject;
        setPersonalizationObj({...fullPersonalization});
    }
    const personalizationSelector = (dimension: any)=>{
        var fullPersonalization = personalizationObj;
        for (const key in dimension) {
            fullPersonalization[key] = dimension[key];
        };
        setPersonalizationObj({...fullPersonalization});
    }
    const doneWelcomeSetup = useCallback(()=>{
        onDeviceStorage('get', 'userInfo').then((res: any)=>{
            var currUser = JSON.parse(res);
            currUser.setUp = true;
            if (personalizationObj.demographic) {
                currUser.demographic = personalizationObj.demographic;
            };
            if (personalizationObj.classLevel) {
                currUser.classLevel = personalizationObj.classLevel;
            };
            return onDeviceStorage('set', {userInfo: JSON.stringify(currUser)}).then(res2=>{
                onDeviceStorage('set', {mySubjects: Object.keys(personalizationObj.subjects).join()});
                var subjectsToKeep:any = [];
                Object.keys(personalizationObj.subjects).forEach((subject: any) => {
                    subjectsToKeep.push({code: subject});
                });
                dispatch(setMySubjects(subjectsToKeep));

                dispatch(setSetupState(true));
            })
            
        })

        var requestObject = {
            method: "POST",
            url: appAuthDomain("api/requests?appType=videos&about=account"),
            data: {
                // ...personalizationObj, 
                mainUse: 'videos', 
                subjects: Object.keys(personalizationObj.subjects).join(), 
                demographic: personalizationObj.demographic, 
                classLevel: personalizationObj.classLevel, 
                myClassLevel: personalizationObj.classLevel, 
                setUp: true,
            }
        };
        makeRequests(state, requestObject).then(response=>{
            console.log(response);
        });
    }, [state, personalizationObj, dispatch]);
    useEffect(()=>{
        var allSet = true;
        var requiredItems = ['subjects', 'classLevel', 'demographic'];
        requiredItems.forEach((item, key)=>{
            // console.log(key, item);
            if (item in personalizationObj) {
                const element = personalizationObj[item];
                // console.log(element);
                if (element) {
                    if (item === 'subjects') {
                        if (Object.keys(element).length < 1) {
                            allSet = false;
                        }
                    } else {
                        // allSet = false;
                    }
                } else {
                    allSet = false;
                }
            } else {
                allSet = false;
            };
        });
        setCompleteSelection(allSet);
    }, [personalizationObj]);
    
    var subs = [];
    if (personalizationObj.classLevel) {
        var subsRel = arrayEntriesByArrayOnKeyValue(supportedSubjects, 'classLevel', personalizationObj.classLevel);
        for (const key in subsRel) {
            if (Object.prototype.hasOwnProperty.call(subsRel, key)) {
                var element = subsRel[key];
                element.subjKey = key;
                subs.push(element);
            };
        };
    };
    var setUp = false;
    if (state.auth.user) {
        setUp = isSetUp(state);
    };

    
    return (
        <IonModal
            isOpen={!setUp}
            presentingElement={routerRef.current}
            onDidDismiss={handleClose}
            canDismiss={true}
            mode='ios'
        >
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={handleClose}>
                            <IonIcon icon={arrowDown} />close
                        </IonButton>
                    </IonButtons>
                    <IonTitle>
                        Personalise.
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Swiper className='theSwiper' 
                    slidesPerView={1.1}
                    modules={[Autoplay, Pagination]}
                    pagination={{ clickable: true }}
                    watchSlidesProgress
                    // onSlideChange={(e) => console.log(e)}
                    // onReachEnd={() => { console.log("end game")}}
                >
                    <SwiperSlide className='eachSlide' >
                        <IonCard className='sliderCard'>
                            <div className='slideCardDiv'>
                                <SwiperButtonNext >
                                    <div className={'welcomeChoices '+(((personalizationObj.demographic==='school'))?('welcomeChoicesSelected'):(''))} onClick={()=>{personalizationSelector({'demographic': 'school'})}}>
                                        High school and lower <IonIcon icon={arrowForwardCircle}/>
                                    </div>
                                    <div className={'welcomeChoices '+(((personalizationObj.demographic==='college'))?('welcomeChoicesSelected'):(''))} onClick={()=>{personalizationSelector({'demographic': 'college'})}}>
                                        College <IonIcon icon={arrowForwardCircle}/>
                                    </div>
                                    <div className={'welcomeChoices '+(((personalizationObj.demographic==='varsity'))?('welcomeChoicesSelected'):(''))} onClick={()=>{personalizationSelector({'demographic': 'varsity'})}}>
                                        Varsity <IonIcon icon={arrowForwardCircle}/>
                                    </div>
                                </SwiperButtonNext >
                            </div>
                            <div className='slideCardNext'>
                                <SwiperButtonNext >
                                    <button className='welcomeSlideBtns'>
                                        Next <IonIcon icon={arrowForwardCircle}/>
                                    </button>
                                </SwiperButtonNext >
                            </div>
                        </IonCard>
                    </SwiperSlide>
                    <SwiperSlide className='eachSlide' >
                        <IonCard className='sliderCard'>
                            <div className='slideCardDiv'>
                                {
                                    personalObject[personalizationObj.demographic]
                                }
                            </div>
                            <div className='slideCardNext'>
                                <SwiperButtonPrev >
                                    <button className='welcomeSlideBtns welcomeSlidePrev'>
                                        <IonIcon icon={arrowBackCircle}/> Prev
                                    </button>
                                </SwiperButtonPrev>
                                <SwiperButtonNext >
                                    <button className='welcomeSlideBtns welcomeSlideNext'>
                                        Next <IonIcon icon={arrowForwardCircle}/>
                                    </button>
                                </SwiperButtonNext>
                            </div>
                        </IonCard>
                    </SwiperSlide>
                    <SwiperSlide className='eachSlide' >
                        <IonCard className='sliderCard'>
                            <div className='slideCardDivSubjects'>
                                <SwiperButtonNext >
                                    {
                                        (personalizationObj.classLevel)?(
                                            subs.map((subject: any, key: number)=>{
                                                var thisSubj = subject.subjKey;
                                                return <div key={key} className={
                                                    'welcomeChoiceSubjects '+(
                                                        (personalizationObj.subjects && (thisSubj in personalizationObj.subjects))?(`selectedSubject ${subject.colorClass}`):('')
                                                        )
                                                    } onClick={()=>{selectSubject({'subject': subject})}}>
                                                   <p>
                                                   {
                                                       subject.code
                                                   }
                                                   </p>
                                                </div>;
                                            })
                                        ):("")
                                    }
                                    <br/>
                                    <br/>
                                    <br/>
                                    <br/>
                                    <br/>
                                </SwiperButtonNext >
                            </div>
                            <div className='slideCardNext'>
                                <SwiperButtonPrev >
                                    <button className='welcomeSlideBtns welcomeSlidePrev'>
                                        <IonIcon icon={arrowBackCircle}/> Prev
                                    </button>
                                </SwiperButtonPrev>
                                <IonButton className='welcomeSlideBtns' onClick={doneWelcomeSetup} disabled={!completeSelection}>
                                    Done <IonIcon icon={checkmarkCircle}/>
                                </IonButton>
                            </div>
                        </IonCard>
                    </SwiperSlide>
                </Swiper>
            </IonContent>
        </IonModal>
    )
}
export default WelcomeSetup;