import { useCallback, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";

import { IonAlert, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonLoading, IonModal, IonPage, IonRow, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from "@ionic/react";
import { barChart, chevronBack, cloudDownload, create, documents, list, videocam } from "ionicons/icons";

import { AppContext } from "../../contexts/AppContextProvider";
// import { AppContext } from "../../services/State";
import { appAuthDomain, makeRequests, ShowAlertInterface } from "../../services/Utils";

import Stats from "../../components/Dashboard/Stats";
import AddEditQuiz from "../../components/Dashboard/AddEditQuiz";
import AddEditVideos from "../../components/Dashboard/AddEditVideos";
import MyQuiz from "../../components/Dashboard/MyQuiz";
import MyVideos from "../../components/Dashboard/MyVideos";
import AddQuizSet from "../../components/Dashboard/AddEditQuizSet";
import Charts from "../../components/Charts";

import "./index.css";
import MyQuizSets from "../../components/Dashboard/MyQuizSets";

const Dashboard:React.FC<any> = ({routerRef})=>{
    const {state} = useContext(AppContext);

    const [segDisable, setSegDisable] = useState(true);
    const [dashboardSet, setDashboardSet] = useState(false);
    const [segment, setSegment] = useState("manager");
    const [chartData, setChartData] = useState<any>([]);
    // const [myCompanies, setMyCompanies] = useState([{id: 1, name: "xxx"}, {id: 2, name: "yyy"}]);
    const [myCompanies, setMyCompanies] = useState([]);
    const [myDashboardProfile, setMyDashboardProfile] = useState<any>({});
    const [showModal, setShowModal] = useState({show: false, title: "", header: "", data: {type: "trip", data: []}});
    const [showAlertState, setShowAlertState] = useState<ShowAlertInterface>({header: "Alert", subHeader: "If this takes too long, just close tha App and start afresh.", message: "", buttons: [], showAlert: false});
    const [showLoadingState, setShowLoading] = useState({showLoadingMessage: "Loading ...", showLoading: false, triggered: false});
    
    const history = useHistory();


    
    const dashboardPlots = useCallback((plotsData:any)=>{
        // console.log("setupData", plotsData);
        if (Object.keys(plotsData).length > 0) {
            var plots = plotsData.dashPlots;
            if (Array.isArray(plots)) {
                setChartData(plots);
            } else {
                if (Object.keys(plots).length > 0) {
                    if (plots !== "") {
                        setChartData([plots]);
                    }
                }
            }
        }
    }, []);
    const onSegment = (seg: any)=>{
        setSegment(seg);
        if (seg === 'insights') {
            var requestObj = {method: "GET", url: appAuthDomain("api/adminStream?appType=videos&action=dash&subAction=insights")};
            makeRequests(state, requestObj).then(res=>{
                // console.log(res)
                if (res.success) {
                    dashboardPlots(res.data);
                } else {
                    // dashboardPlots({dashPlots: [
                    //     {type: 'bar', labels: ['t', 'u', 'v', 'w', 'x', 'y', 'z'], datasets: [
                    //         {label: "Earnings", data: [3, 7, 11, 9, 15, 19, 21]},
                    //     ], scale: {yAxes: {ticks: {beginAtZero: true}}}},
                    //     {type: 'doughnut', labels: ['t', 'u', 'v', 'w', 'x', 'y', 'z'], datasets: [
                    //         {label: "Requests", data: [1, 5, 3, 7]}, 
                    //     ]},
                    // ]});
                    dashboardPlots({});
                }
            })
        }
    }
    const becomeAcretaor = ()=>{
        var buttonActions = [
            {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {

                }
            },
            {
                text: 'Submit',
                handler: () => {
                    setShowLoading({showLoadingMessage: "Submitting", showLoading: true, triggered: false});
                    var requestObj = {method: "POST", url: appAuthDomain('api/adminStream?appType=videos&action=apply')};
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
                                        becomeAcretaor();
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
            }
        ];
        var alertStateVars = {header: "Become our Partner", subHeader: "Apply to become our partner.", 
            message: "As soon as you get aproved. This will reveal our partner tools, such as the content manangement options (Add & edit: quiz, video) and Statistics or other data tools.", 
            buttons: buttonActions
        };
        setShowAlertState({...alertStateVars, showAlert: true});
    }
    const showMyModal = (whichModal: number, options: any)=>{
        // history.push("dashboard?modal=true");
        var modalData:any = "";
        var modalDataTitle:string = "";
        if (whichModal === 1) {
            modalDataTitle = "More Insights";
            modalData = <Stats showMyModal={showMyModal} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        } else if (whichModal === 2) {
            modalDataTitle = "Add Video";
            modalData = <AddEditVideos purpose={'add'} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        } else if (whichModal === 3) {
            modalDataTitle = "Add Quiz";
            modalData = <AddEditQuiz purpose={'add'} myQuizInfo={myCompanies} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        } else if (whichModal === 4) {
            modalDataTitle = "My Videos";
            modalData = <MyVideos showMyModal={showMyModal} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        } else if (whichModal === 5) {
            modalDataTitle = "My Quiz";
            modalData = <MyQuiz showMyModal={showMyModal} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        } else if (whichModal === 6) {
            modalDataTitle = "Edit Video";
            modalData = <AddEditVideos purpose={'edit'} VideoInfo={options} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        } else if (whichModal === 7) {
            modalDataTitle = "Edit Quiz";
            modalData = <AddEditQuiz purpose={'edit'} myQuizInfo={options} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        } else if (whichModal === 8) {
            modalDataTitle = "Create a Quiz Set";
            modalData = <AddQuizSet purpose={'add'} mySetInfo={options} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        } else if (whichModal === 9) {
            modalDataTitle = "My Quiz Sets";
            modalData = <MyQuizSets showMyModal={showMyModal} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        } else if (whichModal === 10) {
            modalDataTitle = "Edit a Quiz Set";
            modalData = <AddQuizSet purpose={'edit'} mySetInfo={options} setShowLoading={setShowLoading} setShowAlertState={setShowAlertState}/>;
        };
        if (modalData !== "") {
            setShowModal({show: true, title: modalDataTitle, header: "", data: {type: "", data: modalData}});
        } else {
            setShowModal({...showModal, show: false});
        }
    }
    const dashboardSetup = useCallback((setupData:any)=>{
        // console.log("setupData", setupData)
        if (Object.keys(setupData).length > 0) {
            var dashData = setupData.dashData; 
            // var myDashArray = dashData.dashList; 
            var myProfile = dashData.profile; 

            setMyDashboardProfile(myProfile);
            if (myProfile.myGroups.hasGroup) {
                var myGroups = myProfile.myGroups.groups;
                if (myGroups) {
                    setMyCompanies(myGroups);
                    setDashboardSet(true);
                }
            }
        };
    }, []);

    useEffect(()=>{
        if (history.location.search !== "") {
            if (showModal.show) {
                // console.log(history);
                // setShowModal({...showModal, show: false});
            }
        };
    }, [history, showModal]);

    useEffect(()=>{
        if (!dashboardSet) {
            if ((myCompanies.length > 0)) {
                setSegDisable(false);
                setSegment("insights");
            } else {
                const doRequest = ()=>{
                    setShowLoading({showLoadingMessage: "Setting up my dashboard...", showLoading: true, triggered: false});
                    var requestObj = {method: "GET", url: appAuthDomain("api/adminStream?appType=videos&action=dash")};
                    makeRequests(state, requestObj).then(response=>{
                        // console.log(response);
                        setTimeout(() => {
                            setShowLoading({showLoadingMessage: "", showLoading: false, triggered: false});
                        }, 500);
                        if (response.success) {
                            dashboardSetup(response.data);
                        } else {
                            if (response.action) {
                                if (response.action.retry) {
                                    var buttonActions = [
                                        {
                                            text: 'Cancel',
                                            role: 'cancel',
                                            cssClass: 'secondary',
                                            handler: () => {
                                                window.history.back();
                                            }
                                        },
                                        {
                                            text: 'Retry',
                                            handler: () => {
                                                doRequest();
                                            }
                                        }
                                    ];
                                    var alertStateVars = {header: response.msg, subHeader: "", message: response.msg2, buttons: buttonActions};
                                    setTimeout(() => {
                                        setShowAlertState({...alertStateVars, showAlert: true});
                                    }, 500);
                                    dashboardSetup({dashData: {profile: {myGroups: {hasGroup: true, groups: [{id: 1, name: "xxx"}, {id: 2, name: "yyy"}]}}}});
                                } else {
                                    dashboardSetup([]);
                                }
                            } else {
                                dashboardSetup([]);
                            }
                        }
                    });
                };
                doRequest();
            }
        }

        return ()=>{
            setDashboardSet(false);
        }
    }, [state, dashboardSet, myCompanies, dashboardSetup]);


    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="home" text="Back" icon={chevronBack} />
                    </IonButtons>
                    <IonTitle>Dashboard</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">Dashboard</IonTitle>
                    </IonToolbar>
                    <p className="dashboardProfileRole">
                        (
                        {
                            myDashboardProfile.roleName
                        }
                        )
                    </p>
                </IonHeader>
                <IonSegment mode='ios' value={segment} onIonChange={e => onSegment(e.detail.value!)} disabled={segDisable}>
                    <IonSegmentButton value="insights">
                        <IonLabel>Insights </IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="manager">
                        <IonLabel>Manager</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
                {
                    (segment==='insights')?(
                        <IonCard mode='ios'>
                            <IonCardContent>
                                {
                                    chartData.map((theData: any)=>{
                                        return <IonCard key={theData.type} mode='ios'>
                                            <Charts data={theData} />
                                        </IonCard>;
                                    })
                                }
                                <IonButton expand="full" fill="outline" color="medium" onClick={()=>(showMyModal(1, null))}>More Insights<IonIcon icon={barChart}></IonIcon></IonButton>
                            </IonCardContent>
                        </IonCard>
                    ):(
                        <div className="myCointainer">
                            <IonGrid >
                                <IonRow>
                                    {
                                        (myCompanies.length>0)?(
                                            <>
                                                <IonCol onClick={()=>(showMyModal(2, null))}
                                                size={"5.7"}
                                                className="new-track dashboardICons"
                                                >
                                                    <IonIcon className="dashboardTabICons" icon={videocam}/>
                                                    <IonItem lines="none">
                                                        <IonLabel>
                                                        <h2 style={{textAlign:'center'}}>Add Video</h2>
                                                        </IonLabel>
                                                    </IonItem>
                                                </IonCol>
                                                <IonCol onClick={()=>(showMyModal(3, myCompanies))}
                                                    size={"5.7"}
                                                    className="new-track dashboardICons"
                                                    >
                                                    <IonIcon className="dashboardTabICons" icon={create}/>
                                                    <IonItem lines="none">
                                                        <IonLabel>
                                                        <h2 style={{textAlign:'center'}}>Add Quiz</h2>
                                                        </IonLabel>
                                                    </IonItem>
                                                </IonCol>
                                                <IonCol
                                                size={"5.7"} onClick={()=>(showMyModal(4, null))}
                                                className="new-track dashboardICons"
                                                >
                                                    <IonIcon className="dashboardTabICons" icon={cloudDownload}/>
                                                    <IonItem lines="none">
                                                        <IonLabel>
                                                        <h2 style={{textAlign:'center'}}>My Videos</h2>
                                                        </IonLabel>
                                                    </IonItem>
                                                </IonCol>
                                                <IonCol onClick={()=>(showMyModal(5, null))}
                                                size={"5.7"}
                                                className="new-track dashboardICons"
                                                >
                                                    <IonIcon className="dashboardTabICons" icon={documents}/>
                                                    <IonItem lines="none">
                                                        <IonLabel>
                                                        <h2 style={{textAlign:'center'}}>My Quizzes</h2>
                                                        </IonLabel>
                                                    </IonItem>
                                                </IonCol>

                                                <IonCol onClick={()=>(showMyModal(8, null))}
                                                size={"5.7"}
                                                className="new-track dashboardICons"
                                                >
                                                    <IonIcon className="dashboardTabICons" icon={list}/>
                                                    <IonItem lines="none">
                                                        <IonLabel>
                                                        <h2 style={{textAlign:'center'}}>Create a Quiz set</h2>
                                                        </IonLabel>
                                                    </IonItem>
                                                </IonCol>
                                                <IonCol onClick={()=>(showMyModal(9, null))}
                                                size={"5.7"}
                                                className="new-track dashboardICons"
                                                >
                                                    <IonIcon className="dashboardTabICons" icon={list}/>
                                                    <IonItem lines="none">
                                                        <IonLabel>
                                                        <h2 style={{textAlign:'center'}}>My Quiz sets</h2>
                                                        </IonLabel>
                                                    </IonItem>
                                                </IonCol>
                                            </>
                                        ):(
                                            <IonCol onClick={becomeAcretaor}
                                            size={"11.4"}
                                            className="new-track dashboardICons"
                                            >
                                                <IonIcon className="dashboardTabICons" icon={documents}/>
                                                <p style={{textAlign:'center'}}>For rich access: Become a Partner</p>
                                            </IonCol>
                                        )
                                    }
                                </IonRow>
                            </IonGrid>
                        </div>
                    )
                }
            </IonContent>
            <IonLoading
                mode='ios'
                isOpen={showLoadingState.showLoading}
                onDidDismiss={() => setShowLoading({...showLoadingState, showLoading: false})}
                message={showLoadingState.showLoadingMessage}
            />
            <IonAlert
                mode='ios'
                isOpen={showAlertState.showAlert}
                onDidDismiss={() => setShowAlertState({...showAlertState, showAlert: false})}
                header={showAlertState.header}
                subHeader={showAlertState.subHeader}
                message={showAlertState.message}
                buttons={showAlertState.buttons}
            />
            <IonModal
                mode='ios'
                isOpen={showModal.show}
                // cssClass='my-custom-class'
                canDismiss={true}
                onDidDismiss={() => setShowModal({...showModal, show: false})}
                presentingElement={routerRef.current}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setShowModal({...showModal, show: false})}>Close</IonButton>
                        </IonButtons>
                        <IonTitle size="large">
                            {showModal.title}
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {
                        showModal.data.data
                    }
                </IonContent>
            </IonModal>
        </IonPage>
    );
}
export default Dashboard;