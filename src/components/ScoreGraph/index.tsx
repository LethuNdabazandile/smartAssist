import { useCallback, useEffect, useRef } from 'react';
import { degreeToRad } from '../../services/Utils';

import './index.css'
const ScoreGraph:React.FC<any> = ({score, total, color})=>{

    const canvasRef = useRef(null);

    

    const drawGraph = useCallback(()=>{
        var canvas:any = canvasRef.current;
        // var canvas:any = document.querySelector('.canvas');
        var canvasContext = canvas.getContext('2d');
        if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            canvas.width = 420; canvas.height = 300;
        } else if (/webOS|iPad/i.test(navigator.userAgent)) {
            canvas.width = 520; canvas.height = 400;
        } else {
            canvas.width = 1200; canvas.height = 550;
        };

        var scorePieces = ((score/total)*349).toFixed(0);
        var thisScore:any = 0;
        var renderScoreInterval:any = null;
        var currentlyShowingScore = false;
        const renderScore = (thisScore: any) => {
            canvasContext.strokeStyle = color; /*'28d1fa';*/
            canvasContext.lineWidth = 20; canvasContext.lineCap = 'round'; canvasContext.shadowBlur = 15;
            var gradient = canvasContext.createRadialGradient(160,140,15, 160,140,140); gradient.addColorStop(0, 'black'); gradient.addColorStop(1, 'white'); canvasContext.fillStyle = gradient; 
            canvasContext.fillRect(0, 0, 310, 310);
            canvasContext.beginPath(); 
            canvasContext.arc(160, 140, 110, degreeToRad(270), degreeToRad((thisScore)-89)); canvasContext.stroke();
            canvasContext.font = '25px Arial'; canvasContext.fillStyle = 'lime'; canvasContext.fillText("Score", 122,100);
            canvasContext.font = '50px Arial'; canvasContext.fillStyle = color; canvasContext.fillText(score+"/"+total, 115,150);
            canvasContext.font = '25px Arial'; canvasContext.fillStyle = color; canvasContext.fillText(((score/total)*100).toFixed(0)+"%", 125,180);

            // console.log(thisScore, scorePieces); 
            if ( thisScore >= scorePieces ) { 
                clearInterval(renderScoreInterval); renderScoreInterval = null; 
                currentlyShowingScore = false; 
            };
        };
        if (currentlyShowingScore) {
            clearInterval(renderScoreInterval); renderScoreInterval = null;
        };
        currentlyShowingScore = true;
        renderScoreInterval = setInterval(()=>{
            thisScore = parseFloat(thisScore) + parseFloat(scorePieces)/270;
            renderScore(thisScore);
        }, 1);
    }, [score, color, total]);

    useEffect(()=>{
        if (canvasRef.current) {
            drawGraph();
        }
    }, [canvasRef, drawGraph]);

    return (<canvas className="canvas scoreCanvas" id='canvas' ref={canvasRef}></canvas>)
}

export default ScoreGraph;