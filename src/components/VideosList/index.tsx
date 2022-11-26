// import { useEffect } from "react";
import { useHistory } from "react-router";
import { IonCard, IonSkeletonText } from "@ionic/react";

import { bytesToMegaBytes, sToTime, videoThumbDomain } from "../../services/Utils";

import './index.css';

interface ComponetntProps {
    loadedVideos: any;
    doPlay: Function;
}
const VideosList:React.FC<ComponetntProps> = ({loadedVideos, doPlay})=>{
    const history = useHistory();

    const doPlayFunction = (video: any, loadedVideos: any)=>{
        // history.push('/watch?vid='+video.id);
        history.push('?vid='+video.id);
        doPlay(video, loadedVideos);
    };
    
    
    return (
        <>
        {
            loadedVideos.map((video: any, key: number)=>{
                if ('heading' in video) {
                    return <IonCard mode='ios' key={key} className='videoPreviewCard' onClick={()=>{
                                doPlayFunction(video, loadedVideos)
                            }}>
                        <img decoding={(key > 2)?("async"):("auto")} loading={(key>2)?("lazy"):("eager")} src={videoThumbDomain(video.thumbnail)} alt={video.heading}/>
                        <p className="vidSize">
                            {bytesToMegaBytes(video.size)+"MB"}
                        </p>
                        <p className="vidTime">
                            {sToTime(video.duration)+"s"}
                        </p>
                    </IonCard>;
                } else {
                    return <IonCard mode='ios' key={key} className='videoPreviewCard' onClick={()=>{
                        doPlayFunction(video, loadedVideos)
                    }}>
                        <p className="vidThumb">
                            <IonSkeletonText animated style={{width: "100%"}}/>
                        </p>
                        <p className="vidSize">
                            <IonSkeletonText animated style={{width: "100%"}}/>
                        </p>
                        <p className="vidTime">
                            <IonSkeletonText animated style={{width: "100%"}}/>
                        </p>
                    </IonCard>;
                }
            })
        }
        </>
    ) 
}
export default VideosList;