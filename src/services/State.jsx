

var isOnline = true;
var colorMode = "light";

if (navigator.onLine === false) {
  isOnline = false; 
}; 
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    colorMode = "dark";
};
export const initialState = {
    initialAuth: false,
    auth: {
        user: null
    },
    user: {
        homeData: {},
        msgCount: 0,
        notifyCount: 0,
        pushAccess: false,
        mySubjects: [],
        recentVideos: [],
        favVideos: [],
        offlineVideos: [],
        isSubscribed: {
            paid: true
        }
    },
    messaging: {
        typing: []
    },
    // socketConnection: 'Closed',
    videos: {
        videos: [
        ],
        tempVideos: [
        ],
        playList: [
        ],
        currentVideos: [
        ]
    },
    quiz: {},
    ui: {
        callOpen: false,
        playerOpen: false,
        requesterOpen: false,
        colorMode: colorMode,
        microTransactions: {
            show: false,
            presentingElement: null
        },
    },
    rtcCall: null,
    isOnline: isOnline,
    internetStatus: true,
    microTransactions: {
        paymentMethod: "card",
        cardInfo: {},
        selectedProduct: {}
    },
}


export const reducer = (state, action) => {
    const playing = getPlaying(state);
    const cv = getCurrentVideo(state);
    const user = getUser(state);
    

    switch (action.type) {
        case 'SET_INITIAL_AUTH': {
            return {
                ...state,
                initialAuth: action.value,
            }
        }
        case 'SET_CALL_TRIGGER': {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    callOpen: true
                },
                rtcCall: action.callParams
            }
        }
        case 'SET_CALL_PEERS': {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    callOpen: true
                },
                rtcCall: {
                    ...state.rtcCall,
                    peers: action.peers
                }
            }
        }
        case 'USER_TYPING': {
            var newtypingList = [];
            // var oldTypingList = [];
            // if (state.messaging.typing) {
            //     oldTypingList = state.messaging.typing;
            // }
            // var personsTypingStateKey = oldTypingList.findIndex(t => t.id === action.typing.person.id);
            // if (!personsTypingStateKey) {
                if (action.typing.act === 'add') {
            //         newtypingList = oldTypingList.push({id: action.typing.person.id});
                } else {
            //         delete oldTypingList[personsTypingStateKey];
                }
            // };
            return {
                ...state,
                messaging: {
                    ...state.messaging,
                    typing: newtypingList
                }
            }
        }
        case 'SOCKET_CONNECTION': {
            return {
                ...state,
                socketConnection: action.connectionStatus
            }
        }
        case 'SET_SETUP_STATE': {
            return {
                ...state,
                auth: {
                    user: {
                        ...state.auth.user,
                        setUp: action.setUp
                    }
                }
            }
        }
        case 'SET_MSG_COUNT': {
            var newCount = state.user.msgCount + action.newCount;
            return {
                ...state,
                user: {
                    ...state.user,
                    msgCount: newCount
                }
            }
        }
        case 'SET_NOTIFY_COUNT': {
            var newCountNotify = state.user.notifyCount + action.newCount;
            return {
                ...state,
                user: {
                    ...state.user,
                    notifyCount: newCountNotify
                }
            }
        }
        case 'PLAY': {
            if (action.video && action.video !== cv) {
                const newRecentVideos = getRecentVideos(state).filter(t => t.id !== action.video.id);
                const index = getVideoIndex(state, action.video.id);

                return {
                    ...state,
                    ui: {
                        ...state.ui,
                        playerOpen: true
                    },
                    user: {
                        ...user,
                        recentVideos: [action.track, ...newRecentVideos]
                    },
                    playing: {
                        ...playing,
                        index,
                        progress: 0,
                        paused: false,
                        counted: false,
                        id: action.video.id,
                        // playerRef: playerRef,
                    }
                }
            }

            return {
                ...state,
                playing: {
                    ...playing,
                    paused: false
                }
            }
        }

        case 'SET_PLAYER_OPEN': {
          return {
            ...state,
            ui: {
              ...state.ui,
              playerOpen: action.open
            }
          }
        }
        case 'SET_REQUESTER_OPEN': {
          return {
            ...state,
            ui: {
              ...state.ui,
              requesterOpen: action.open
            }
          }
        }
        case 'SET_CALL_OPEN': {
          return {
            ...state,
            ui: {
              ...state.ui,
              callOpen: action.open
            },
            rtcCall: null
          }
        }
        case 'SET_MY_SUBJECTS': {
            return {
                ...state,
                user: {
                    ...state.user,
                    mySubjects: action.mySubjects
                }
            }
        }
        case 'SET_CURRENT_VIDEOS': {
            return {
                ...state,
                videos: {
                    ...state.videos,
                    currentVideos: action.videos
                }
            }
        }
        case 'PLAY_VIDEO_LIST': {
            // console.log(action);
            if (action.tempVideos && action.start) {
                const newRecentVideos = getRecentVideos(state).filter(t => t.id !== action.start.id);
                const firstVideoIndex = action.tempVideos.findIndex(t => t.id === action.start.id);
                var firstVideo = action.tempVideos[firstVideoIndex];
                // console.log(firstVideo, cv)
                if (firstVideo !== cv) {
                    const index = firstVideoIndex;
                    return {
                        ...state,

                        user: {
                            ...user,
                            recentVideos: [action.start, ...newRecentVideos]
                        },
                        ui: {
                            ...state.ui,
                            playerOpen: true,
                        },
                        videos: {
                            ...state.videos,
                            tempVideos: action.tempVideos, 
                            playList: action.playList,
                        },
                        playing: {
                            ...playing,
                            index,
                            progress: 0,
                            paused: false,
                            counted: false,
                            id: firstVideo.id,
                            time: firstVideo.time
                        }
                    }   
                }
                return {
                  ...state
                }
            }
            return {
              ...state
            }
        }
        case 'SET_CURRENT_SUBJECT': {
            return {
                ...state,
                quiz: {
                    ...state.quiz,
                    subject: action.subject
                }
            }
        }
        case 'SET_CURRENT_TOPIC': {
            return {
                ...state,
                quiz: {
                    ...state.quiz,
                    topic: action.topic
                }
            }
        }
        
        case 'SET_PUSH_ACCESS': {
            return {
                ...state,
                user: {
                    ...state.user,
                    pushAccess: action.pushAccess,
                }
            }
        }
        case 'STOP_PLAY': {
            // syncMyActions(state, "play", action.track.id, -2);
            return {
              ...state,
              playing: null,
              // playing: {
              //   ...playing,
              //   // stopped: true,
              // }
            }
        }
        case 'SET_LOCAL_LIBRARY': {
            if (action.localLibrary) {
                const newLocalLibrary = action.localLibrary;
                const newLocalRecentsLibrary = newLocalLibrary.recentVideos || [];
                const newLocalFavLibrary = newLocalLibrary.favVideos || [];
                const newLocalOfflineLibrary = newLocalLibrary.offlineVideos || [];
                return {
                    ...state,

                    user: {
                        ...user,
                        recentVideos: [...newLocalRecentsLibrary],
                        favVideos: [...newLocalFavLibrary],
                        offlineVideos: [...newLocalOfflineLibrary],
                    },
                }
            } else {
                return {
                    ...state
                }
            }
        }
        case 'SET_RECENT_VIDEOS': {
            if (action.videoList) {
                const newRecentVideos = action.videoList;
                return {
                    ...state,

                    user: {
                        ...user,
                        recentVideos: [...newRecentVideos]
                    },
                }
            } else {
                return {
                    ...state
                }
            }
        }
        case 'UNSET_RECENT_VIDEO': {
            if (action.video) {
                const newRecentVideos = getRecentVideos(state).filter(t => t.id !== action.video.id);
                return {
                    ...state,

                    user: {
                        ...user,
                        recentVideos: [...newRecentVideos]
                    },
                }
            } else {
                return {
                    ...state
                }
            }
        }
        case 'SET_OFFLINE_VIDEOS': {
            if (action.video) {
                const newOfflineVideo = action.video;
                return {
                    ...state,
                    user: {
                        ...state.user,
                        offlineVideos: [
                            ...state.user.offlineVideos,
                            newOfflineVideo
                        ]
                    },
                }
            } else {
                return {
                    ...state
                }
            }
        }
        case 'UNSET_OFFLINE_VIDEOS': {
            if (action.video) {
                const newOfflineVideos = getRecentVideos(state).filter(t => t.id !== action.video.id);
                return {
                    ...state,

                    user: {
                        ...user,
                        offlineVideos: [...newOfflineVideos]
                    },
                }
            } else {
                return {
                    ...state
                }
            }
        }
        case 'SET_CURRENT_CHAT': {

            return {
                ...state,
                user: {
                    ...state.user,
                    currentChat: action.currentChat
                }
            }
        }
        case 'SET_MICRO_TRANSACTION': {
            if ('show' in action.newTransactionInfo) {
                var showPrt = action.newTransactionInfo.show;
                var presentingElement = action.newTransactionInfo.presentingElement;
                return {
                    ...state,
                    ui: {
                        ...state.ui,
                        microTransactions: {
                            ...state.ui.microTransactions,
                            show: showPrt,
                            presentingElement
                        }
                    }
                }
            } else {
                var newTransactionInfo = action.newTransactionInfo;
                return {
                    ...state,
                    microTransactions: {
                        ...state.microTransactions,
                        ...newTransactionInfo,
                    },
                    
                }
            }
        }
        case 'PAYMENT_CONFIRMATION': {
            var paymentConfirmation = action.confirmation;
            return {
                ...state,
                paymentConfirmation
            };
        }
        case 'SET_IS_SUBSCRIBED': {
            return {
                ...state,
                user: {
                    ...state.user,
                    isSubscribed: {
                        paid: action.isSubscribed
                    }
                }
            }
        }
        case 'SET_MAIN_FEED': {
            var feedData = action.feed;
            if (feedData.status) {
                var homeData = feedData.data;
                return {
                    ...state,
                    user: {
                        ...state.user,
                        homeData: {
                            ...state.user.homeData,
                            ...homeData
                        }
                    }
                };
            } else {
                return {
                    ...state,
                };
            }
        }
        case 'UI': {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    colorMode: action.colorMode
                }
            }
        }
        case 'SET_INTERNET_CONNECTIVITY': {
            return {
                ...state,
                internetStatus: action.value
            }
        }
        case 'LOGOUT': {
            var newState = initialState;
            return newState;
        }
        case 'LOGGED_IN': {
            return {
                ...state,
                auth: {
                    ...state.auth,
                    user: action.user
                },
                initialAuth: action.user.initialAuth
            }
        }
        case 'SET_PROFILE_PIC': {
            return {
                ...state,
                auth: {
                    ...state.auth,
                    user: {
                        ...state.auth.user,
                        profilePic: action.profilePic
                    }
                }
            }
        }

        default: {
            return state;
        }
    }
};

export const setInitialAuth = (value) => ({
    type: 'SET_INITIAL_AUTH',
    value
})
export const loggedIn = (user) => ({
    type: 'LOGGED_IN',
    user
});
export const logout = () => ({
    type: 'LOGOUT'
});
export const setInternetConnectivity = (value)=>({
    type: 'SET_INTERNET_CONNECTIVITY',
    value
});
export const setIsSubscribedPaid = (isSubscribed)=>({
    type: 'SET_IS_SUBSCRIBED',
    isSubscribed
})


export const setCallTrigger = (callParams)=>({
    type: 'SET_CALL_TRIGGER',
    callParams
});
export const setCallPeers = (peers)=>({
    type: 'SET_CALL_PEERS',
    peers
});
export const peopleTyping = (person, act)=>({
    type: 'USER_TYPING',
    typing: {
        person,
        act
    }
})
export const setConnectionState = (connectionStatus)=>({
    type: 'SOCKET_CONNECTION',
    connectionStatus
});
export const setCurrentChat = (currentChat)=>({
    type: "SET_CURRENT_CHAT",
    currentChat
})
export const openPlayer = () => ({
    type: 'SET_PLAYER_OPEN',
    open: true
})
export const openRequester = () => ({
    type: 'SET_REQUESTER_OPEN',
    open: true
})

export const closePlayer = () => ({
    type: 'SET_PLAYER_OPEN',
    open: false
})
export const closeRequester = () => ({
    type: 'SET_REQUESTER_OPEN',
    open: false
})
export const closeCall = () => ({
    type: 'SET_CALL_OPEN',
    open: false
})
export const setSetupState = (setUp) => ({
    type: 'SET_SETUP_STATE',
    setUp
})
export const setCurrentVideos = (videos) => ({
    type: 'SET_CURRENT_VIDEOS',
    videos
})


export const pauseVideo = () => ({
    type: 'PAUSE'
});
export const playVideo = (video) => ({
    type: 'PLAY',
    video
});
export const stopPlay = () => ({
    type: 'STOP_PLAY',
});
export const setFavVideo = (video) => ({
    type: 'FAV',
    video
});
export const setOffline = (video) => ({
    type: 'SET_OFFLINE',
    video
});
export const setPushAccess = (pushAccess) => ({
    type: 'SET_PUSH_ACCESS',
    pushAccess
});
export const setColorMode = (color) => ({
    type: 'UI',
    colorMode: color
});
export const setMySubjects = (subjects) => ({
    type: 'SET_MY_SUBJECTS',
    mySubjects: subjects
});
export const setCurrentSubject = (subject) => ({
    type: 'SET_CURRENT_SUBJECT',
    subject
});
export const setCurrentTopic = (topic) => ({
    type: 'SET_CURRENT_TOPIC',
    topic
});

export const playVideoList = (tempVideos, playList, start) => ({
    type: 'PLAY_VIDEO_LIST',
    tempVideos,
    playList,
    start
});
export const setMessageCounter = (newCount)=>({
    type: 'SET_MSG_COUNT',
    newCount
});
export const setNotifyCounter = (newCount)=>({
    type: 'SET_NOTIFY_COUNT',
    newCount
});
export const setLocalLibrary = (localLibrary)=>({
    type: 'SET_LOCAL_LIBRARY',
    localLibrary
});
export const setRecentVideos = (videoList)=>({
    type: 'SET_RECENT_VIDEOS',
    videoList
});
export const unsetRecentVideo = (video)=>({
    type: 'UNSET_RECENT_VIDEO',
    video
});
export const setOfflineVideos = (video)=>({
    type: 'SET_OFFLINE_VIDEOS',
    video
});
export const unsetOfflineVideos = (video)=>({
    type: 'UNSET_OFFLINE_VIDEOS',
    video
});
export const setMicroTransactions = (newTransactionInfo) => ({
    type: 'SET_MICRO_TRANSACTION',
    newTransactionInfo
})
export const setPaymentConfirmation = (confirmation) => ({
    type: 'PAYMENT_CONFIRMATION',
    confirmation
})
export const setMainFeed = (feed) => ({
    type: 'SET_MAIN_FEED',
    feed
})
export const setProfilePic = (profilePic)=>({
    type: 'SET_PROFILE_PIC',
    profilePic
})

export const isSetUp = (state) => {
    if (state.auth.user){
        return state.auth.user.setUp;
    } else {
        return false;
    }
}
export const isCallOpen = (state) => state.ui.callOpen;
export const isPlayerOpen = (state) => state.ui.playerOpen;
export const isRequesterOpen = (state) => state.ui.requesterOpen;

export const getCurrentChat = (state) => state.user.currentChat;
export const getUserID = (state) => {
    if (!state.auth.user) return null;
    return state.auth.user.uid;
};
export  const getUserRole = (state) => {
    if (!state.auth.user) return null;
    return state.auth.user.role;
};
export const getUserNames = (state) => {
    if (!state.auth.user) return null;
    return state.auth.user.firstname+" "+state.auth.user.lastname;
};
export const getUser = (state) => state.user;
export const getUserAuth = (state) => state.auth.user;

// Color 
export const getColorMode = (state) => state.ui.colorMode;

export const getPlaying = (state) => state.playing;

export const getCurrentVideo = (state) => state.videos.tempVideos[state.playing ? state.playing.index : -1];

export const getVideoIndex = (state, id) => state.videos.tempVideos.findIndex(v => v.id === id);

export const getMySubjects = (state) => state.user.mySubjects;

export const getFavVideos = (state) => state.user.favVideos;
export const getRecentVideos = (state) => state.user.recentVideos;
export const getOfflineVideos = (state) => state.user.offlineVideos;


export const getCurrentVideos = (state)=> state.videos.currentVideos;

export const getCurrentSubject = (state)=> state.quiz.subject;
export const getCurrentTopic = (state)=> state.quiz.topic;


export const getConnectivityState = (state) => state.internetStatus;




export const isOfflineVideo = (state, video) => {
    if (video) {
      if (!('id' in video)) {
        return false; 
      }
      return !!state.user.offlineVideos.find(t => t.id === video.id);
    }
    return false;
  }
export const isFavVideo = (state, video) => {
    if (video) {
        if (!('id' in video)) {
            return false; 
        }
        return !!state.user.favVideos.find(t => t.id === video.id);
    }
    return false;
}