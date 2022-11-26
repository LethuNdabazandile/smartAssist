import { useCallback, useContext, useEffect, useState } from 'react';
import { IonCard } from '@ionic/react';
import Charts from '../../Charts';

import { AppContext } from '../../../contexts/AppContextProvider';
// import { AppContext } from '../../../services/State';
import { localDomain, makeRequests } from '../../../services/Utils';

import './index.css';

const Stats:React.FC<any> = ({showMyModal, setShowLoading, setShowAlertState})=>{
    const {state} = useContext(AppContext);
    
    const [chartData, seChartData] = useState<any>([]);

    const pullStats = useCallback(()=>{
        setShowLoading({showLoadingMessage: "Loading my stats...", showLoading: true, triggered: false});

        var reqData = {
            appType: "trans"
        };
        var requestObj = {url: localDomain("api/dasboard?moreInsights=true"), method: "POST", data: reqData};
        makeRequests(state, requestObj).then(response=>{
            console.log(response);
            setTimeout(() => {
                setShowLoading({showLoadingMessage: "", showLoading: false, triggered: false});
            }, 500);
            var buttonActions = [];

            if (response.success) {
                seChartData(response.data.moreData);
            } else {
                buttonActions = [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            // showMyModal();
                            console.log(showMyModal)
                        }
                    },
                    {
                        text: 'Retry',
                        handler: () => {
                            pullStats();
                        }
                    }
                ];
                var alertStateVars = {header: response.msg, subHeader: "", message: response.msg2, buttons: buttonActions};
                setTimeout(() => {
                    setShowAlertState({...alertStateVars, showAlert: true});
                }, 500);
                seChartData([
                    {type: 'bar', labels: ['t', 'u', 'v', 'w', 'x', 'y', 'z'], datasets: [
                        {label: "Earnings", data: [3, 7, 11, 9, 15, 19, 21]},
                    ], scale: {yAxes: {ticks: {beginAtZero: true}}}},
                    {type: 'doughnut', labels: ['t', 'u', 'v', 'w', 'x', 'y', 'z'], datasets: [
                        {label: "Requests", data: [1, 5, 3, 7]}, 
                    ]},
                    {type: 'polarArea', labels: ['t', 'u', 'v', 'w', 'x', 'y', 'z'], datasets: [
                        {label: "Earnings", data: [1, 5, 3, 4, 8]}, 
                    ]},
                ]);
            }
        });
    }, [setShowLoading, state, showMyModal, setShowAlertState]);

    useEffect(()=>{
        pullStats();
    }, [pullStats]);
    console.log(chartData);
    
    return (
        <>
        {
            chartData.map((theData: any)=>{
                return <IonCard key={theData.type}>
                    <Charts data={theData} />
                </IonCard>;
            })
        }
        </>
    )
}

export default Stats;