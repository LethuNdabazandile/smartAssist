import { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { 
    IonAvatar,
    IonBackButton, IonButtons, IonCard, IonCardContent, IonCol, 
    IonContent, IonGrid, IonHeader, 
    IonList, IonPage, IonRow, IonSkeletonText, IonTitle, IonToolbar, useIonToast, 
    useIonViewWillEnter 
} from '@ionic/react';
import { chevronBack } from 'ionicons/icons';

import { AppContext } from '../../contexts/AppContextProvider';
// import { AppContext } from '../../services/State';
import { appAuthDomain, getInitials, makeRequests } from '../../services/Utils';

import './index.css';

const Home:React.FC = ()=>{
    const { state } = useContext(AppContext);

    let location = useLocation();

    var pageIn = location.pathname;
    pageIn = pageIn.substring(1, pageIn.length);
    let loaderLeaderboard:any = [
        {type: 'loader', pos: 1 },
        {type: 'loader', pos: 1 },
        {type: 'loader', pos: 1 },
        {type: 'loader', pos: 1 },
        {type: 'loader', pos: 1 },
        {type: 'loader', pos: 1 },
        {type: 'loader', pos: 1 },
        {type: 'loader', pos: 1 },
    ];

    const [present, dismiss] = useIonToast();
    const [leaderboardCategory, setLeaderboardCategory] = useState<string>("All");
    const [loadedLeaderboard, setLoadedLeaderboard] = useState<any>(loaderLeaderboard);
    var topThree:any[] =  [];
    if (loadedLeaderboard) {
        if (loadedLeaderboard.length > 0) {
            var unorderedThree = loadedLeaderboard.slice(0,3);
            unorderedThree.forEach((elem: any, key: any)=>{
                if (elem.pos === 2) {
                    topThree.unshift(elem);
                } else {
                    if (elem.pos === 1) {
                        topThree.push(elem);
                    } else {
                        topThree.push(elem);
                    }
                } 
            });
        }
    }

    const fetchLeaderboard = useCallback(()=>{
        var listSize = 10;
        var categoryPart = "&category="+leaderboardCategory;
        if (leaderboardCategory === "Any") {
            categoryPart = "&category="+leaderboardCategory;
        };

        var requestObj = {
            url : appAuthDomain("api/assessments?leaderboard=1&listSize="+listSize+categoryPart),
        };
        makeRequests(state, requestObj).then(response=>{
            setLeaderboardCategory("All");
            if (response.success) {
                var fullData = response.data;
                var leaderboardData = fullData.leaderboard;
                // leaderboardData.reverse();
                var boardlist:any = [];
                for (var key in leaderboardData) {
					var person = leaderboardData[key];
                    boardlist.unshift(person);
                }
                setLoadedLeaderboard(boardlist);
            } else {
                // var leaderboardDataTest:any = {
                //     3: {pos: 5, points: 3, profilePic: "assets/icon/ICON 144x144.png"},
                //     7: {pos: 4, points: 7, profilePic: "assets/icon/ICON 144x144.png"},
                //     9: {pos: 3, points: 9, profilePic: "assets/icon/ICON 144x144.png"},
                //     76: {pos: 2, points: 76, profilePic: "assets/icon/ICON 144x144.png"},
                //     107: {pos: 1, points: 107, profilePic: "assets/icon/ICON 144x144.png"},
                // };
                // // leaderboardDataTest.reverse();
                var boardlistTest:any = [];
                // for (var keyTest in leaderboardDataTest) {
				// 	var personTest = leaderboardDataTest[keyTest];
                //     console.log(personTest)
                //     boardlistTest.unshift(personTest);
                // }
                // // console.log(boardlistTest)
                setLoadedLeaderboard(boardlistTest);
                present({
                    position: "bottom",
                    buttons: [{ text: 'hide', handler: () => dismiss() }],
                    message: response.msg,
                    duration: 2000
                });
            }
        })
    }, [state, leaderboardCategory, present, dismiss])
    
    useIonViewWillEnter(() => {
        fetchLeaderboard();
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
                    <IonTitle>Leaderboard</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" mode='ios'>
                    <IonToolbar>
                        <IonTitle size="large">Leaderboard</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonGrid>
                    <IonRow>
                        {
                           topThree.map((leaderboard: any, key: number)=>{
                                if (leaderboard.type && leaderboard.type==="loader") {
                                    return (
                                        <IonCol key={key} size={"4"} className="myColImg">
                                            <h3 className='h3Leader'>
                                                <p>
                                                    <IonSkeletonText animated style={{width: "100%"}}/>
                                                </p>
                                            </h3>
                                            <div className='leaderTopImgsHolder'>
                                                <IonAvatar className='leaderTopImgsAvt'>
                                                    <IonSkeletonText animated style={{width: "100%"}}/>
                                                </IonAvatar>
                                            </div>
                                            <p className='textLeader'>
                                                <IonSkeletonText animated style={{width: "100%"}}/>
                                            </p>
                                        </IonCol>
                                    )
                                } else {
                                    return (
                                        <IonCol key={key} size={"4"} className="myColImg">
                                            <h3 className='h3Leader'>{leaderboard.pos}</h3>
                                            <div className='leaderTopImgsHolder'>
                                                <IonAvatar className='leaderTopImgsAvt'>
                                                    {
                                                        (leaderboard.profilePic && (leaderboard.profilePic!==""))?(
                                                            <img src={appAuthDomain(leaderboard.profilePic)} alt={leaderboard.profilePic} className='leaderTopImgs'/>
                                                        ):(
                                                            <div className='leaderboardAVTRNoPic'>
                                                                <span>
                                                                    {getInitials(leaderboard.firstname+" "+leaderboard.lastname)}
                                                                </span>
                                                            </div>
                                                        )
                                                    }
                                                </IonAvatar>
                                            </div>
                                            <p className='textLeader'>{leaderboard.firstname+" "+leaderboard.lastname}</p>
                                        </IonCol>
                                    )
                                }
                            })
                        }
                    </IonRow>
                </IonGrid>
                <IonCard>
                    <IonCardContent>
                        <IonList 
                        style={{backgroundColor: "transparent"}}
                        >
                        {
                            (loadedLeaderboard.length > 0)?(
                                loadedLeaderboard.slice(3).map((leaderboard: any, key: number)=>{
                                    if (leaderboard.type && leaderboard.type==="loader") {
                                        return (
                                            <div key={key} className='personCard'>
                                                <h4>
                                                    <IonSkeletonText animated style={{width: "100%"}}/>
                                                </h4>
                                                <IonAvatar className='userAVTR'>
                                                    <IonSkeletonText animated style={{width: "100%"}}/>
                                                </IonAvatar>
                                                <p className='personName'>
                                                    <IonSkeletonText animated style={{width: "100%"}}/>
                                                </p>
                                                <h4>
                                                    <IonSkeletonText animated style={{width: "100%"}}/>
                                                </h4>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div key={key} className='personCard'>
                                                <h4>{leaderboard.pos}</h4>
                                                <IonAvatar className='userAVTR'>
                                                    {
                                                        (leaderboard.profilePic && (leaderboard.profilePic!==""))?(
                                                            <>
                                                            <img src={appAuthDomain(leaderboard.profilePic)} alt="profilePic" className='personPic'/>
                                                            </>
                                                        ):(
                                                            <div className='userAVTRNoPic'>
                                                                <span>
                                                                    {getInitials(leaderboard.firstname+" "+leaderboard.lastname)}
                                                                </span>
                                                            </div>
                                                        )
                                                    }
                                                </IonAvatar>
                                                <p className='personName'>{leaderboard.firstname+" "+leaderboard.lastname}</p>
                                                <h4>{leaderboard.points}</h4>
                                            </div>
                                        )
                                    }
                                })
                            ):(
                                ""
                            )
                        }
                        </IonList>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
}

export default Home;