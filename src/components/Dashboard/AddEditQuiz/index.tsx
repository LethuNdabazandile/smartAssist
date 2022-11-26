import { useContext, useState } from 'react';

import { IonAvatar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonImg, IonItem, IonLabel, IonSearchbar, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonTextarea, IonThumbnail } from '@ionic/react';
import { addCircle, closeCircle, cloudUpload, create, logoYoutube, trashBin } from 'ionicons/icons';

import { AppContext } from '../../../contexts/AppContextProvider';
import { arrayEntriesByArrayOnKeyValue, localDomain, makeRequests, supportedSubjects, videoThumbDomain } from '../../../services/Utils';

import './index.css';

const AddEditCar:React.FC<any> = ({purpose, myQuizInfo, setShowLoading, setShowAlertState})=>{
    const {state} = useContext(AppContext);
    const [explainerResults, setExplainerResults] = useState([]);
    const [selectedExplainer, setSelectedExplainer] = useState<any>({});
    const [numberOfOptions, setNumberOfOptions] = useState([{option: 0, type: ''}, {option: 1, type: ''}]);
    const [chosenDemographic, setChosenDemographic] = useState("");
    const [pulledTopics, setPulledTopics] = useState([]);
    
    const [personalizationObj, setPersonalizationObj] = useState<any>({});


    const choseGrade = (gradeChosen: string)=>{
        setPersonalizationObj({...personalizationObj, classLevel: gradeChosen});
    }
    const choseSubject = (subjectChosen: string)=>{

        // var subjKey = subject.subject.subjKey;
        // var fullPersonalization = personalizationObj;
        // var personalizationSubject:any = {};
        // if (fullPersonalization.subjects) {
        //     personalizationSubject = fullPersonalization.subjects;
        //     if (!(subjKey in personalizationObj.subjects )) {
        //         personalizationSubject[subjKey] = subject.subject;
        //     } else {
        //         delete personalizationSubject[subjKey];
        //     }
        // } else {
        //     personalizationSubject[subjKey] = subject.subject;
        // };
        // fullPersonalization.subjects = personalizationSubject;
        // setPersonalizationObj({...fullPersonalization});

        
        var requestObj = {method: "GET", url: localDomain("api/assessments?appType=videos&action=pullTopics&subject="+subjectChosen)};
        makeRequests(state, requestObj).then(response=>{
            console.log(response);
            if (response.success) {
                setPulledTopics(response.data);
            } else {
                var buttonActions = [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            setPersonalizationObj({...personalizationObj, classLevel: null});
                        }
                    },
                    {
                        text: 'Retry',
                        handler: () => {
                            setPersonalizationObj({...personalizationObj});
                        }
                    }
                ];
                var alertStateVars = {header: response.msg, subHeader: "", message: response.msg2, buttons: buttonActions};
                setTimeout(() => {
                    setShowAlertState({...alertStateVars, showAlert: true});
                }, 500);
                setPulledTopics([]);
            }
        })
    }
    const addAnswerOption = ()=>{
        setNumberOfOptions([...numberOfOptions, {option: numberOfOptions.length-1, type: ''}])
    }
    const setOptionSegment = (key: number, segValue: string)=>{
        var newOptions = numberOfOptions.map((opt, optKey)=>{
            if (optKey === key) return {...opt, type: segValue};
            return opt;
        })
        setNumberOfOptions([...newOptions]);
    }
    const removeAnswerOption = (key: number)=>{
        var newOptions = numberOfOptions.filter(o=>o.option !== key);
        newOptions = newOptions.map((opt, optKey)=>{
            return {...opt, option: optKey}
        })
        setNumberOfOptions([...newOptions]);
    }
    const captureSelectedExplainer = (explainer: any)=>{
        setSelectedExplainer(explainer);
        setExplainerResults([]);
    }
    const removeSeletedExplainer = (explainer: any)=>{
        setSelectedExplainer({});
    }
    const searchExplainer = (text: string)=>{
        if (text.length > 0) {
            var requestObj = {method: "GET", url: localDomain("api/search?appType=videos&focus=videos&q="+text)};
            makeRequests(state, requestObj).then(response=>{
                if (response.success) {
                    setExplainerResults(response.data);
                } else {
                    setExplainerResults([]);
                }
            })
        } else {
            setExplainerResults([]);
        }
    }
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
            console.log(response);
            setTimeout(() => {
                setShowLoading({showLoadingMessage: "", showLoading: false, triggered: false});
            }, 500);
            var buttonActions = [];
            if (response.success) {
                buttonActions = [
                    {
                        text: 'Done',
                        handler: () => {
                            // submitFunction(e);
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
    console.log(personalizationObj)
    
    return (
        <IonCard>
        {
            (purpose==="add")?(
                <>
                <form action={localDomain("api/addEditQuiz?action=addQuiz")} onSubmit={submitFunction}>
                    <>
                    <input name='in_ExplainerVideo' type={'hidden'} value={selectedExplainer.id}/>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Question Type</IonLabel>
                        <IonSelect interface="action-sheet" name="in_QuestionType">
                            <IonSelectOption value="0">Multiple Choice (MCQ)</IonSelectOption>
                            <IonSelectOption value="1">Long question</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Targeted Viewers</IonLabel>
                        <IonSelect interface="action-sheet" name="in_Demographic" onIonChange={(e)=>{setChosenDemographic(e.detail.value)}}>
                            <IonSelectOption value="All">Everyone</IonSelectOption>
                            <IonSelectOption value="school">School</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    {
                        (chosenDemographic === "school")?(
                            <>
                            <IonItem className="myFormInputs">
                                <IonLabel position="floating" >Class Level</IonLabel>
                                <IonSelect interface="action-sheet" name="in_ClassLevel" value={(personalizationObj.classLevel)?(personalizationObj.classLevel):(null)} onIonChange={(e)=>{choseGrade(e.detail.value)}}>
                                    <IonSelectOption value="Gr8">Grade 8</IonSelectOption>
                                    <IonSelectOption value="Gr9">Grade 9</IonSelectOption>
                                    <IonSelectOption value="Gr10">Grade 10</IonSelectOption>
                                    <IonSelectOption value="Gr11">Grade 11</IonSelectOption>
                                    <IonSelectOption value="Gr12">Grade 12</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                            {
                                ((personalizationObj.classLevel !== "")&&(personalizationObj.classLevel !== null))?(
                                    <>
                                    <IonItem className="myFormInputs">
                                        <IonLabel position="floating" >Subject / Module</IonLabel>
                                        <IonSelect interface="action-sheet" name="in_Subject" onIonChange={(e)=>{choseSubject(e.detail.value)}}>
                                            {
                                                (personalizationObj.classLevel)?(
                                                    subs.map((subject: any, key: number)=>{
                                                        return <IonSelectOption key={key} value={subject.subjKey}>{subject.name}</IonSelectOption>;
                                                    })
                                                ):("")
                                            }
                                        </IonSelect>
                                    </IonItem>
                                    {
                                        (pulledTopics.length > 0)?(
                                            <IonItem className="myFormInputs">
                                                <IonLabel position="floating" >Topic</IonLabel>
                                                <IonSelect interface="action-sheet" name="in_Topic" >
                                                    {
                                                        pulledTopics.map((topic: any, key: number)=>{
                                                            return <IonSelectOption key={key} value={topic.code}>{topic.name}</IonSelectOption>;
                                                        })
                                                    }
                                                </IonSelect>
                                            </IonItem>
                                        ):("")
                                    }
                                    </>
                                ):(
                                    ""
                                )
                            }
                            </>
                        ):(
                            ""
                        )
                    }
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                The Question Part
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem className="myFormInputs">
                                <IonLabel position="stacked">Question Picture</IonLabel>
                                <input type="file" accept="image/*" name="in_QuestionPic" placeholder="Questin image" className="theIput" />
                            </IonItem>
                            <IonItem className="myFormInputs">
                                <IonLabel position="floating" >Question text</IonLabel>
                                <IonTextarea name="in_QuestionText" placeholder="Question text" />
                            </IonItem>
                        </IonCardContent>
                    </IonCard>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                Answer Explanation.
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem className="myFormInputs">
                                <IonLabel position="stacked">Explanation Picture</IonLabel>
                                <input type="file" accept="image/*" name="in_ExplanationPic" placeholder="Questin image" className="theIput" />
                            </IonItem>
                            <IonItem className="myFormInputs">
                                <IonLabel position="floating" >Explanation text</IonLabel>
                                <IonTextarea name="in_ExplanationText" placeholder="Explanatin text" />
                            </IonItem>
                        </IonCardContent>
                    </IonCard>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                Answer options
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {
                                numberOfOptions.map((theOption, key)=>{
                                    return <IonCard key={key}>
                                        {
                                            (key > 1)?(<IonIcon icon={trashBin} onClick={()=>{removeAnswerOption(key)}} />):("")
                                        }
                                        <IonSegment onIonChange={e => {setOptionSegment(key, e.detail.value!)}}>
                                            <IonSegmentButton value={theOption.option+"text"}>Use text</IonSegmentButton>
                                            <IonSegmentButton value={theOption.option+"image"}>Use image</IonSegmentButton>
                                        </IonSegment>
                                        {
                                            (theOption.type === theOption.option+"image")?(
                                                <IonItem className="myFormInputs">
                                                    <IonLabel position="stacked">{"Option "+(key+1)+" Picture"}</IonLabel>
                                                    <input type="file" accept="image/*" name={"in_OptImg"+(key+1)} placeholder="Option image" className="theIput" required />
                                                </IonItem>
                                            ):(
                                                <IonItem className="myFormInputs">
                                                    <IonLabel position="floating" >Option {key+1}</IonLabel>
                                                    <IonTextarea name={"in_Opt"+(key+1)} placeholder={"Option "+(key+1)} className="theIput" required />
                                                </IonItem>
                                            )
                                        }
                                    </IonCard>
                                })
                            }
                            <IonButton size='small' slot='end' onClick={addAnswerOption}><IonIcon icon={addCircle}/> option</IonButton>
                        </IonCardContent>
                    </IonCard>

                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >The Correct Answer</IonLabel>
                        <IonSelect interface="action-sheet"name="in_Ans">
                            {
                                numberOfOptions.map((theOption, key)=>{
                                    return <IonSelectOption key={key} value={key}>Option {key+1}</IonSelectOption>;
                                })
                            }
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Difficulty (1 to 7)</IonLabel>
                        <IonSelect interface="action-sheet" name="in_Difficulty">
                            <IonSelectOption value="1">Level 1</IonSelectOption>
                            <IonSelectOption value="2">Level 2</IonSelectOption>
                            <IonSelectOption value="3">Level 3</IonSelectOption>
                            <IonSelectOption value="4">Level 4</IonSelectOption>
                            <IonSelectOption value="5">Level 5</IonSelectOption>
                            <IonSelectOption value="6">Level 6</IonSelectOption>
                            <IonSelectOption value="7">Level 7</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonCard>
                        <IonSearchbar searchIcon={logoYoutube} placeholder="Search explainer video" onIonChange={e => searchExplainer(e.detail.value!)} showCancelButton="focus" animated/>
                        {
                            (explainerResults.length > 0)?(
                                explainerResults.map((explainer: any, key)=>{
                                    return <IonItem key={key} onClick={()=>{captureSelectedExplainer(explainer)}} >
                                        <IonThumbnail slot="start" >
                                            <img src={videoThumbDomain(explainer.thumbnail)} alt={explainer.heading}/>
                                        </IonThumbnail>
                                        <IonLabel >
                                            <h2>{explainer.heading}</h2>
                                            <p>{explainer.description}</p>
                                        </IonLabel>
                                    </IonItem>
                                })
                            ):(
                                <>
                                {
                                    (Object.keys(selectedExplainer).length > 0)?(
                                        <IonChip>
                                            <IonAvatar>
                                                <IonImg src={videoThumbDomain(selectedExplainer.thumbnail)}/>
                                            </IonAvatar>
                                            <IonLabel>{selectedExplainer.heading}</IonLabel>
                                            <IonIcon icon={closeCircle} onClick={()=>{removeSeletedExplainer(selectedExplainer)}} />
                                        </IonChip>
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
                <form action={localDomain("api/addEditQuiz?action=editQuiz")} onSubmit={submitFunction}>
                    <>
                    <input name='in_Video' type={'hidden'} value={myQuizInfo.id}/>
                    <input name='in_ExplainerVideo' type={'hidden'} value={selectedExplainer.id}/>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Question Type</IonLabel>
                        <IonSelect name="in_QuestionType" interface="action-sheet">
                            <IonSelectOption value="0">MCQ</IonSelectOption>
                            <IonSelectOption value="1">Input question</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Targeted Viewers</IonLabel>
                        <IonSelect name="in_Demographic" interface="action-sheet">
                            <IonSelectOption value="All">Everyone</IonSelectOption>
                            <IonSelectOption value="school">School</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Class Level</IonLabel>
                        <IonSelect interface="action-sheet" name="in_ClassLevel" value={(personalizationObj.classLevel)?(personalizationObj.classLevel):(null)} onIonChange={(e)=>{choseGrade(e.detail.value)}}>
                            <IonSelectOption value="Gr8">Grade 8</IonSelectOption>
                            <IonSelectOption value="Gr9">Grade 9</IonSelectOption>
                            <IonSelectOption value="Gr10">Grade 10</IonSelectOption>
                            <IonSelectOption value="Gr11">Grade 11</IonSelectOption>
                            <IonSelectOption value="Gr12">Grade 12</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    {
                        ((personalizationObj.classLevel !== "")&&(personalizationObj.classLevel !== null))?(
                            <>
                            <IonItem className="myFormInputs">
                                <IonLabel position="floating" >Subject / Module</IonLabel>
                                <IonSelect interface="action-sheet" name="in_Subject" onIonChange={(e)=>{choseSubject(e.detail.value)}}>
                                    {
                                        (personalizationObj.classLevel)?(
                                            subs.map((subject: any, key: number)=>{
                                                return <IonSelectOption key={key} value={subject.subjKey}>{subject.name}</IonSelectOption>;
                                            })
                                        ):("")
                                    }
                                </IonSelect>
                            </IonItem>
                            {
                                (pulledTopics.length > 0)?(
                                    <IonItem className="myFormInputs">
                                        <IonLabel position="floating" >Topic</IonLabel>
                                        <IonSelect interface="action-sheet" name="in_Subject" >
                                            {
                                                pulledTopics.map((topic: any, key: number)=>{
                                                    return <IonSelectOption key={key} value={topic.code}>{topic.name}</IonSelectOption>;
                                                })
                                            }
                                        </IonSelect>
                                    </IonItem>
                                ):("")
                            }
                            </>
                        ):(
                            ""
                        )
                    }
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                The Question Part
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem className="myFormInputs">
                                <IonLabel position="stacked">Question Picture</IonLabel>
                                <input type="file" accept="image/*" name="in_QuestionPic" placeholder="Questin image" className="theIput" />
                            </IonItem>
                            <IonItem className="myFormInputs">
                                <IonLabel position="floating" >Question text</IonLabel>
                                <IonTextarea name="in_QuestionText" placeholder="Question text" />
                            </IonItem>
                        </IonCardContent>
                    </IonCard>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                Answer Explanation.
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem className="myFormInputs">
                                <IonLabel position="stacked">Explanation Picture</IonLabel>
                                <input type="file" accept="image/*" name="in_ExplanationPic" placeholder="Questin image" className="theIput" />
                            </IonItem>
                            <IonItem className="myFormInputs">
                                <IonLabel position="floating" >Explanation text</IonLabel>
                                <IonTextarea name="in_ExplanationText" placeholder="Explanatin text" />
                            </IonItem>
                        </IonCardContent>
                    </IonCard>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                Answer options
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {
                                numberOfOptions.map((theOption, key)=>{
                                    return <IonCard key={key}>
                                        {
                                            (key > 1)?(<IonIcon icon={trashBin} onClick={()=>{removeAnswerOption(key)}} />):("")
                                        }
                                        <IonSegment onIonChange={e => {setOptionSegment(key, e.detail.value!)}}>
                                            <IonSegmentButton value={theOption.option+"text"}>Use text</IonSegmentButton>
                                            <IonSegmentButton value={theOption.option+"image"}>Use image</IonSegmentButton>
                                        </IonSegment>
                                        {
                                            (theOption.type === theOption.option+"image")?(
                                                <IonItem className="myFormInputs">
                                                    <IonLabel position="stacked">{"Option "+(key+1)+" Picture"}</IonLabel>
                                                    <input type="file" accept="image/*" name={"in_OptImg"+(key+1)} placeholder="Option image" className="theIput" required />
                                                </IonItem>
                                            ):(
                                                <IonItem className="myFormInputs">
                                                    <IonLabel position="floating" >Option {key+1}</IonLabel>
                                                    <IonTextarea name={"in_Opt"+(key+1)} placeholder={"Option "+(key+1)} className="theIput" required />
                                                </IonItem>
                                            )
                                        }
                                    </IonCard>
                                })
                            }
                            <IonButton size='small' slot='end' onClick={addAnswerOption}><IonIcon icon={addCircle}/> option</IonButton>
                        </IonCardContent>
                    </IonCard>

                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >The Correct Answer</IonLabel>
                        <IonSelect name="in_Ans" interface="action-sheet">
                            {
                                numberOfOptions.map((theOption, key)=>{
                                    return <IonSelectOption key={key} value={key}>Option {key+1}</IonSelectOption>;
                                })
                            }
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Difficulty (1 to 7)</IonLabel>
                        <IonSelect name="in_Difficulty" interface="action-sheet">
                            <IonSelectOption value="1">Level 1</IonSelectOption>
                            <IonSelectOption value="2">Level 2</IonSelectOption>
                            <IonSelectOption value="3">Level 3</IonSelectOption>
                            <IonSelectOption value="4">Level 4</IonSelectOption>
                            <IonSelectOption value="5">Level 5</IonSelectOption>
                            <IonSelectOption value="6">Level 6</IonSelectOption>
                            <IonSelectOption value="7">Level 7</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonCard>
                        <IonSearchbar searchIcon={logoYoutube} placeholder="Search explainer video" onIonChange={e => searchExplainer(e.detail.value!)} showCancelButton="focus" animated/>
                        {
                            (explainerResults.length > 0)?(
                                explainerResults.map((explainer: any, key)=>{
                                    return <IonCard key={key} onClick={()=>{captureSelectedExplainer(explainer)}}>
                                        <div>
                                            <IonImg src={videoThumbDomain(explainer.thumbnail)}/>
                                        </div>
                                        <div>
                                            {explainer.heading}
                                        </div>
                                    </IonCard>;
                                })
                            ):(
                                <>
                                {
                                    (Object.keys(selectedExplainer).length > 0)?(
                                        <IonChip>
                                            <IonAvatar>
                                                <IonImg src={videoThumbDomain(selectedExplainer.thumbnail)}/>
                                            </IonAvatar>
                                            <IonLabel>{selectedExplainer.heading}</IonLabel>
                                            <IonIcon icon={closeCircle} onClick={()=>{removeSeletedExplainer(selectedExplainer)}} />
                                        </IonChip>
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
    )
}

export default AddEditCar;