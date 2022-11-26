import React, { useCallback, useContext } from 'react';
import { useHistory } from 'react-router';

import { IonIcon, IonThumbnail } from '@ionic/react';
import { /*play, pause,*/ closeCircle } from 'ionicons/icons';

import {
    getPlaying, getCurrentVideo, openPlayer,
    // playVideo, 
    stopPlay, 
    // pauseVideo
} from '../../services/State';

import { AppContext } from '../../contexts/AppContextProvider';
import { videoThumbDomain } from '../../services/Utils';

import './index.css';
interface ProgressProps {
    playing: any;
    video: any;
}

const VideoProgress: React.FC<ProgressProps> = ({ playing, video }) => {
    const progress = playing.progress;
    // const left = track.time - progress;
    const percent = (progress / video.time) * 100;

    return (
        <div className="track-preview-progress">
            <div className="track-preview-progress-track">
                <div className="track-preview-progress-current" style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    );
}
interface ContainerProps {
    tabBarTop?: number;
}

const VideoPreview: React.FC<ContainerProps> = ({ tabBarTop }) => {
    const { state, dispatch } = useContext(AppContext);

    const history = useHistory();
    const playing = getPlaying(state);
    const playingVideo = getCurrentVideo(state);

    // const doPlayToggle = useCallback((e, track) => {
    //     // Stop the toggle from opening the modal
    //     e.stopPropagation();

    //     if (playing.paused) {
    //         dispatch(playVideo(track));
    //     } else {
    //         dispatch(pauseVideo());
    //     }
    // }, [playing, dispatch]);
    const doOpenPlayer = useCallback(() => {
        dispatch(openPlayer());
        history.push('?vid='+playing.id);
    }, [history, playing, dispatch]);
    const closePlay = useCallback((e, track)=>{
        // Stop the toggle from opening the modal
        e.stopPropagation();
        dispatch(stopPlay());
    }, [ dispatch]);
    if (!playing) return null;

    return (
        <div style={{ top: `${tabBarTop}px` }} className="track-preview" onClick={doOpenPlayer}>
            <VideoProgress playing={playing} video={playingVideo} />
            <div className="track-preview-wrapper">
                <div className="track-thumbnail-holder">
                    <IonThumbnail className="track-thumbnail">
                        <img alt={playingVideo.heading} src={videoThumbDomain(playingVideo.thumbnail)} className="track-art" />
                    </IonThumbnail>
                </div>


                <div className="track-info">
                    <span className="track-name">{playingVideo.heading}</span>
                        {/* &middot;
                    <span className="track-artist">{playingVideo.heading}</span> */}
                </div>

                <div className="track-controls track-controls-play-pause">
                    {/* {playing.paused ? (
                        <IonIcon icon={play} onClick={(e)=>{doPlayToggle(e, playingVideo)}} />
                        ) : (
                        <IonIcon icon={pause} onClick={(e)=>{doPlayToggle(e, playingVideo)}} />
                    )} */}
                </div>
                <div className="track-controls track-controls-close">
                    <IonIcon icon={closeCircle} onClick={(e)=>{closePlay(e, playingVideo)}} />
                </div>
            </div>
        </div>
    )
};

export default VideoPreview;