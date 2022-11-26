import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import { IonContent, IonHeader, IonListHeader, IonLabel, IonPage, IonSearchbar, IonSegment, IonSegmentButton, IonTitle, IonToolbar, useIonViewWillEnter, IonCard } from '@ionic/react';

import { AppContext } from '../../contexts/AppContextProvider';
import { setRecentVideos } from '../../services/State';
import { appAuthDomain, capitalize, makeRequests, onDeviceStorage } from '../../services/Utils';

import './index.css';
import Charts from '../../components/Charts';

const Library:React.FC<any> = ({doPlay})=>{
    const { state, dispatch } = useContext(AppContext);


    var presentTrends = [
        {type: 'doughnut', labels: ['t', 'u', 'v', 'w', 'x', 'y', 'z'], datasets: [
            {label: "Requests", data: [1, 5, 3, 7]}, 
        ]},
    ];//getRecentVideos(state);
    var futureTrends = [
        {type: 'bar', labels: ['t', 'u', 'v', 'w', 'x', 'y', 'z'], datasets: [
            {label: "Earnings", data: [3, 7, 11, 9, 15, 19, 21]},
        ], scale: {yAxes: {ticks: {beginAtZero: true}}}},
    ];//getFavVideos(state);


    const [searchText, setSearchText] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [segDisable, setSegDisable] = useState(false);
    const [segment, setSegment] = useState("future");
    const [searchedContent, setSearchedContent] = useState([]);
    const [localTrends, setLocalLibrary] = useState({presentTrends, futureTrends});

    const history = useHistory();


    const onSegment = (seg: any)=>{
        setSegment(seg);
    };
    const doPlayFunction = (trend: any, localTrends: any)=>{
        // history.push('/watch?vid='+video.id);
        history.push('?trends='+trend.id);
        // doPlay(trend, localTrends);
    };

    

    const searchFunc = (keyWords: string)=>{
        if (state.isOnline) {
            var requestObj = {
                method: 'GET',
                url: appAuthDomain("api/search?appType=videos&focus=careerTrends&q="+keyWords)
            };
            setSearchText(keyWords);
            if (keyWords.length > 0) {
                makeRequests(state, requestObj).then((response)=>{
                    if (response.success) {
                        setSearchedContent(response.data);
                    } else {
                        let testUsers:any = [];
                        setSearchedContent(testUsers);
                    }
                });
            } else {
                let testUsers:any = [];
                setSearchedContent(testUsers);
            }
        } else {
            var testUsers:any = [];
            setSearchedContent(testUsers);
        }
    }

    
    useIonViewWillEnter(() => {
        onDeviceStorage('get', 'trends').then((localTrends: any)=>{
            var localTrendsPulled = localTrends || "{}";
            localTrendsPulled = JSON.parse(localTrendsPulled);
            if (localTrendsPulled['presentTrends']) {
                presentTrends = localTrendsPulled.presentTrends;
                dispatch(setRecentVideos(presentTrends));
            };
            if (localTrendsPulled['futureTrends']) {
                futureTrends = localTrendsPulled.futureTrends;
            };
            setLocalLibrary({
                ...localTrends,
                futureTrends,
                presentTrends,
            })
        });
    });
    
    useEffect(()=>{
        if (!state.isOnline) {
            setSegDisable(false);
        }
    }, [state.isOnline]);


    console.log(localTrends)
    return (
        <IonPage>
            <IonHeader mode='ios'>
                <IonToolbar>
                    <IonTitle>Data Driven Insights</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader mode='ios' collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Data Driven Insights</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div>
                    <IonSearchbar mode='ios' onIonChange={(e)=>{searchFunc(e.detail.value!)}} onIonFocus={()=>setSearchFocused(true)} onIonBlur={()=>setSearchFocused(false)} animated showCancelButton='focus'/>
                </div>
                <br/>
                <br/>
                {
                    (!searchFocused && (searchText.length < 1))?(
                        <>
                        <IonSegment mode='ios' value={segment} onIonChange={e => onSegment(e.detail.value!)} disabled={segDisable}>
                            {/* <IonSegmentButton value="past">
                                <IonLabel>Past </IonLabel>
                            </IonSegmentButton> */}
                            <IonSegmentButton value="present">
                                <IonLabel>Present</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="future">
                                <IonLabel>Future</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                        
                        <IonListHeader mode='ios'>
                            <IonLabel>{((segment===("future"))?"Predicted ":"") +""+ capitalize(segment)} Trends</IonLabel>
                        </IonListHeader>
                        {
                            (segment === "future")?(
                                <>
                                {localTrends.futureTrends.map((theData: any, key: number) => (
                                    <IonCard key={key} >
                                        <Charts data={theData} />
                                    </IonCard>
                                ))}
                                </>
                            ):(
                                <>
                                {localTrends.presentTrends.map((theData: any, key: number) => (
                                    <IonCard key={key} onClick={() => doPlayFunction(theData, localTrends.presentTrends)} button>
                                        <Charts data={theData} />
                                    </IonCard>
                                ))}
                                </>
                            )
                        }
                        </>
                        ):(
                            <>
                            {searchedContent.map((video: any, key: number) => (
                                <IonCard key={key} onClick={() => doPlayFunction(video, searchedContent)} button>
                                    
                                </IonCard>
                            ))}
                            </>
                        )
                    }
            </IonContent>
        </IonPage>
    )
}
export default Library;