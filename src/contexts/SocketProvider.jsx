import React, { useContext, useEffect, useState } from "react";
import io from 'socket.io-client';
import { AppContext } from "./AppContextProvider";
import { getUserAuth, getUserRole, getConnectivityState } from "../services/State";
import { currentWebSocketDomain } from '../services/Utils';
import { onDeviceStorage } from "../services/Utils";


const SockectContext = React.createContext();

export const useSocket = ()=>{
    return useContext(SockectContext);
}

export const SockectProvider = ({children})=>{
    const {state} = useContext(AppContext);
    const [socket, setSocket] = useState();

    const userAuth = getUserAuth(state);
    const userRole = getUserRole(state);
    const connectedToInternet = getConnectivityState(state);

    useEffect(()=>{
        var newSocket;
        if (connectedToInternet && userAuth && userRole) {
            if (userAuth.accessToken) {
                onDeviceStorage('get', 'appimate-lastMsgID').then(localLastMsgID=>{
                    var lastMsgID = localLastMsgID || 0;
                    newSocket = io(
                        currentWebSocketDomain(""),
                        {
                            extraHeaders: {
                                Authorization: `Bearer ${userAuth.accessToken}`
                            },
                            query: {
                                lastMsgID,
                                // role: userRole.role,
                            }
                        }
                    )
                    setSocket(newSocket);
                })
            };

        }
        return () => {
            if (newSocket) {
                if (newSocket.connected) {
                    return newSocket.close();
                }
            };
            return;
        }
    }, [ userAuth, userRole, connectedToInternet]);

    return (
        <SockectContext.Provider value={socket} >
            {children}
        </SockectContext.Provider>
    )
}