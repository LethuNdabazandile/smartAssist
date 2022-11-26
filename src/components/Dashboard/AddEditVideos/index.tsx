import { useContext, useRef } from 'react';

import { IonButton, IonCard, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import { cloudUpload, create } from 'ionicons/icons';

import { AppContext } from '../../../contexts/AppContextProvider';
// import { AppContext } from '../../../services/State';
import { appAuthDomain, localDomain, makeRequests } from '../../../services/Utils';

import './index.css';

const AddEditCompany:React.FC<any> = ({purpose, VideoInfo, setShowLoading, setShowAlertState})=>{
    const {state} = useContext(AppContext);
    const videoTimeRefAdd = useRef(null);
    const videoTimeRefEdit = useRef(null);

    const gotVideoToUpload = (event: any)=>{
		var file = event.target.files[0];
        if ((file !== null)||(file !== undefined)) {
            var reader  = new FileReader(); 
            reader.onload = (evt: any) => {
                if( evt.target.readyState === FileReader.DONE) {

                }
            };
			reader.readAsDataURL(file);
        } else {

        }
    }
    const submitFunction = (e: any)=>{
        e.preventDefault();
        e.stopPropagation();
        // console.log(e);
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
        // console.log(requestObj);
        makeRequests(state, requestObj).then(response=>{
            console.log(response)
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
    }

    console.log(VideoInfo)

    return (
        <IonCard>
        {
            (purpose==="add")?(
                <>
                <form action={appAuthDomain("api/addEditVideos?action=addVideo")} onSubmit={submitFunction}>
                    {/* <input type="hidden" name="in_GroupType" value="1"/> */}
                    <IonItem className="myFormInputs">
                        <IonLabel position="stacked">Preview Image (Thumbnail)</IonLabel>
                        <input type="file" accept="image/*" name="in_Preview" placeholder="Video Thumnail" className="theIput" required />
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="stacked">The Video <span ref={videoTimeRefAdd}></span></IonLabel>
                        <input type="file" accept="video/*" onChange={gotVideoToUpload} name="in_Video" placeholder="The Video" className="theIput" required />
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Targeted Viewers</IonLabel>
                        <IonSelect interface="action-sheet" name="in_Demographic">
                            <IonSelectOption value="All">Everyone</IonSelectOption>
                            <IonSelectOption value="school">School</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Class Level</IonLabel>
                        <IonSelect interface="action-sheet" name="in_ClassLevel">
                            <IonSelectOption value="Gr8">Grade 8</IonSelectOption>
                            <IonSelectOption value="Gr9">Grade 9</IonSelectOption>
                            <IonSelectOption value="Gr10">Grade 10</IonSelectOption>
                            <IonSelectOption value="Gr11">Grade 11</IonSelectOption>
                            <IonSelectOption value="Gr12">Grade 12</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Subject / Module</IonLabel>
                        <IonSelect interface="action-sheet" name="in_Subject">
                            <IonSelectOption value="Biology">Biology</IonSelectOption>
                            <IonSelectOption value="Maths">Maths</IonSelectOption>
                            <IonSelectOption value="MathsLit">Maths Literacy</IonSelectOption>
                            <IonSelectOption value="Physics">Physics</IonSelectOption>
                            <IonSelectOption value="Chemistry">Chemistry</IonSelectOption>
                            <IonSelectOption value="Geography">Geography</IonSelectOption>
                            <IonSelectOption value="Economics">Economics</IonSelectOption>
                            <IonSelectOption value="Accounting">Accounting</IonSelectOption>
                            <IonSelectOption value="Agriculture">Agriculture</IonSelectOption>
                            <IonSelectOption value="English">English</IonSelectOption>
                            <IonSelectOption value="Appimate">Appimate - Plublic Videos</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Video heading</IonLabel>
                        <IonInput name="in_Heading" placeholder="Video heading" className="theIput" required />
                    </IonItem>

                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Video description</IonLabel>
                        <IonInput name="in_Description" placeholder="Video description" className="theIput" required />
                    </IonItem>
                    <br/>
                    <br/>
                    <IonButton type='submit' expand='block' ><IonIcon icon={cloudUpload}/>Submit Video</IonButton>
                </form>
                </>
            ):(
                <>
                <form action={appAuthDomain("api/addEditVideos?action=editVideo")} onSubmit={submitFunction}>
                    <input type="hidden" name="in_VideosID" value={VideoInfo.id}/>
                    <IonItem className="myFormInputs">
                        <IonLabel position="stacked">Preview Image (Thumbnail)</IonLabel>
                        <input type="file" accept="image/*" name="in_Preview" placeholder="Video Thumbnail" className="theIput" required />
                        <IonCard>
                            <IonImg src={localDomain(VideoInfo.thumbnail)}/>
                        </IonCard>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="stacked">The Video <span ref={videoTimeRefEdit}></span></IonLabel>
                        <input type="file" accept="video/*" onChange={gotVideoToUpload} name="in_Video" placeholder="The Video" className="theIput" required />
                        <IonCard >
                            <video src={localDomain(VideoInfo.video)} />
                        </IonCard>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Targeted Viewers</IonLabel>
                        <IonSelect name="in_Demographic" value={VideoInfo.demographic} interface="action-sheet">
                            <IonSelectOption value="All">Everyone</IonSelectOption>
                            <IonSelectOption value="school">School</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Class Level</IonLabel>
                        <IonSelect name="in_ClassLevel" value={VideoInfo.classLevel} interface="action-sheet">
                            <IonSelectOption value="Gr8">Grade 8</IonSelectOption>
                            <IonSelectOption value="Gr9">Grade 9</IonSelectOption>
                            <IonSelectOption value="Gr10">Grade 10</IonSelectOption>
                            <IonSelectOption value="Gr11">Grade 11</IonSelectOption>
                            <IonSelectOption value="Gr12">Grade 12</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Subject / Module</IonLabel>
                        <IonSelect name="in_Subject" value={VideoInfo.subject} interface="action-sheet">
                            <IonSelectOption value="Biology">Biology</IonSelectOption>
                            <IonSelectOption value="Maths">Maths</IonSelectOption>
                            <IonSelectOption value="MathsLit">Maths Literacy</IonSelectOption>
                            <IonSelectOption value="Physics">Physics</IonSelectOption>
                            <IonSelectOption value="Chemistry">Chemistry</IonSelectOption>
                            <IonSelectOption value="Geography">Geography</IonSelectOption>
                            <IonSelectOption value="Economics">Economics</IonSelectOption>
                            <IonSelectOption value="Accounting">Accounting</IonSelectOption>
                            <IonSelectOption value="Agriculture">Agriculture</IonSelectOption>
                            <IonSelectOption value="English">English</IonSelectOption>
                            <IonSelectOption value="Appimate">Appimate - Plublic Videos</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Video heading</IonLabel>
                        <IonInput name="in_Heading" value={VideoInfo.heading} placeholder="Video heading" className="theIput" required />
                    </IonItem>

                    <IonItem className="myFormInputs">
                        <IonLabel position="floating" >Video description</IonLabel>
                        <IonInput name="in_Description" value={VideoInfo.description} placeholder="Video description" className="theIput" required />
                    </IonItem>
                    <br/>
                    <br/>
                    <IonButton type='submit' expand='block' ><IonIcon icon={create}/>Submit Video</IonButton>
                </form>
                </>
            )
        }
        </IonCard>
    )
}

export default AddEditCompany;