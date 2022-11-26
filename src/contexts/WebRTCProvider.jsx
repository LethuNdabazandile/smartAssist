import React, { useContext, useEffect, useState } from "react";
import { Peer } from "peerjs";
import { AppContext } from "./AppContextProvider";
import { getUserID } from "../services/State";
// import { currentWebSocketDomain } from '../services/Utils';

const WebRTCContext = React.createContext();

export const useWebRTC = ()=>{
    return useContext(WebRTCContext);
}

export const WebRTCProvider = ({children})=>{
    const {state} = useContext(AppContext);
    const [webRTC, setWebRTC] = useState();
    const id = getUserID(state);

    useEffect(()=>{
        var newWebRTC;
        if (id) {
            // console.log(id, state.rtcCall);
            if (state.rtcCall) {
                // console.log(id, state.rtcCall);
                newWebRTC = new Peer(
                    id
                    // ,
                    // {
                    //     host: '/',
                    //     port: 3000
                    // }
                );
                setWebRTC(newWebRTC);
            }
        }
        return () => {
            // console.log(newWebRTC);
            if (newWebRTC) {
                if (newWebRTC._open) {
                    // return newWebRTC.close();
                    return;
                }
            };
            return;
        }
    }, [id, state.rtcCall]);

    return (
        <WebRTCContext.Provider value={webRTC} >
            {children}
        </WebRTCContext.Provider>
    )
}