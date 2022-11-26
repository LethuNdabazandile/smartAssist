import {
    Chart as ChartJS,
    registerables
} from 'chart.js';
import { Bar, Doughnut, Pie, PolarArea, Line } from 'react-chartjs-2';

ChartJS.register(...registerables);
  

const Charts:React.FC<any> = ({data})=>{
    const myOptions = {
        maintainAspectRatio: true,
        responsive: true,
        plugins: {
            title: data.title,
            legend: {
                position: 'top' as const,
            },
        },
    };
    var usefullData = data;
    if (Object.keys(usefullData).length === 0) {
        usefullData = {
            labels: [],
            datasets: [
                {

                }
            ]
        };
    }

    var chartByType;
    if (data.type==='line') {
        chartByType = <Line data={usefullData} options={myOptions} />;
    } else if (data.type==='pie') {
        chartByType = <Pie data={usefullData} options={myOptions} />;
    } else if (data.type==='doughnut') {
        chartByType = <Doughnut data={usefullData} options={myOptions} />;
    } else if (data.type==='polarArea') {
        chartByType = <PolarArea data={usefullData} options={myOptions} />;
    } else if (data.type==='bar') {
        chartByType = <Bar data={usefullData} options={myOptions} />;
    };
    return (
        <>
            {
                chartByType
            }
        </>
    )
}

export default Charts;