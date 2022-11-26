import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonBadge, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { albums, chatbubbles, home, menu, notifications } from 'ionicons/icons';
import { IonReactRouter } from '@ionic/react-router';
// import { SplashScreen } from '@capacitor/splash-screen';

import { checkPushPermission, manageDeliveredNotifications, onDeviceStorage } from './services/Utils';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import WelcomeSetup from './components/WelcomeSetUp';
import AppimateRequest from './components/AppimateRequest';
import AppimateCalls from './components/AppimateCalls';
import VideoPlayer from './components/VideoPlayer';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Videos from './pages/Videos';
import Notifications from './pages/Notifications';
import Dashboard from './pages/Dashboard';
import Chats from './pages/Chats';
import Menu from './pages/Menu';
import TabBarSticky from './components/TabBarSticky';
import VideoPreview from './components/VideoPreview';
import Leaderboard from './components/Leaderboard';
import AuthRoute from './rerouting/AuthRoute';
import Chatting from './pages/Chatting';
import Library from './pages/Library';
import Subject from './pages/Subject';
import QuizActivity from './pages/QuizActivity';
import Payments from './pages/Payments';

import { AppContext } from './contexts/AppContextProvider';
import { useConversations } from './contexts/ConversationsProvider';
import { useSocket } from './contexts/SocketProvider';

import { getCurrentVideo, getPlaying, loggedIn, openPlayer, peopleTyping, playVideoList, setCallTrigger, setColorMode, setConnectionState, setInitialAuth, setLocalLibrary, setMainFeed, setMySubjects, setNotifyCounter, setPushAccess } from './services/State';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './pages/index.css';
import PaymentPrompt from './components/PaymentsManager/PaymentPrompt';
import PaymentConfirmer from './components/PaymentsManager/PaymentConfirmer';
import { Capacitor } from '@capacitor/core';

setupIonicReact();

const App: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const socket = useSocket();
  const {recieveMessage} = useConversations();
  // const history = useHistory();
  const routerRef = useRef<HTMLIonRouterOutletElement | null>(null);

  document.body.classList.toggle('dark', (state.ui.colorMode==="dark")?(true):(false));

  const playing = getPlaying(state);
  var conditionalLandingPage = true;

  const keepMySubjects = useCallback(subjects => {
    dispatch(setMySubjects(subjects));
  }, [dispatch]);
  const doPlay = useCallback((video, videoList)=>{
    var tempVideos:any = [];
    var myPlayList:any = [];
    videoList.forEach((theVideo:any)=>{
        myPlayList.push(theVideo.vidId || theVideo.id);
        tempVideos.push(theVideo);
    });
    video.id = video.vidId || video.id;

    // console.log(video, getCurrentVideo(state));
    if (getCurrentVideo(state)) {
        if (video.id === (getCurrentVideo(state)).id) {
          dispatch(openPlayer());
        } else {
          dispatch(playVideoList(tempVideos, myPlayList, video));
        }
    } else {
      dispatch(playVideoList(tempVideos, myPlayList, video));
    };
    if (state.auth.user) {
      onDeviceStorage('get', 'library').then((localLibrary: any)=>{
        var currentLibrary = localLibrary || "{}";
        currentLibrary = JSON.parse(currentLibrary);
        var keepOnLibrary = {...currentLibrary};
        if ('recentVideos' in currentLibrary) {
          const newRecentVideos = (currentLibrary.recentVideos).filter((t: any) => t.id !== video.id);
          keepOnLibrary.recentVideos = [video, ...newRecentVideos];
        } else {
          keepOnLibrary.recentVideos = [ video ];
        };
        onDeviceStorage('set', {library: JSON.stringify(keepOnLibrary)});
      });
    } else {
      // history.push('/login');
    }
  }, [state, dispatch]);
  const handleSocketMessage = useCallback((socketMessage)=>{
    // console.log('New message', socketMessage);
    if (socketMessage.type === 'call') {
      var callData = socketMessage.data;
      callData.direction = "incoming";
      callData.peers = [];
      dispatch(setCallTrigger(callData));
    } else if (socketMessage.type === 'message') {
      recieveMessage(socketMessage);
    } else if (socketMessage.type === 'notify') {
      dispatch(setNotifyCounter(1));
    } else if (socketMessage.type === 'typing') {
      dispatch(peopleTyping(socketMessage));
    } else if (socketMessage.type === 'paymentStatus') {
      // dispatch(peopleTyping(socketMessage));
    } else if (socketMessage.type === 'feed') {
      onDeviceStorage('set', {feed: JSON.stringify(socketMessage.data)});
      dispatch(setMainFeed(socketMessage));
    };
  }, [dispatch, recieveMessage]);

  useEffect(()=>{
    onDeviceStorage('get', 'themeMode').then(res=>{
      var colorMode = (res==='true')?'dark':'light';
      dispatch(setColorMode(colorMode));
    });
    if (isAuthenticated && state.initialAuth) {
      onDeviceStorage('get', 'userInfo').then((userInfo: any)=>{
        var user = JSON.parse(userInfo);
        user.initialAuth = true;
        dispatch(loggedIn(user));
      });
      
      onDeviceStorage('get', 'mySubjects').then((res: any)=>{
        if (res) {
          var mySubjects = res.split(",");
          var subjectsToKeep:any = [];
          mySubjects.forEach((subject: any) => {
            subjectsToKeep.push({code: subject});
          });
          keepMySubjects(subjectsToKeep);
        } else {
          keepMySubjects([]);
        }
      });
      
      onDeviceStorage('get', 'library').then((localLibrary: any)=>{
        var currentLibrary = localLibrary || "{}";
        currentLibrary = JSON.parse(currentLibrary);

        dispatch(setLocalLibrary(currentLibrary));
      });
      
      onDeviceStorage('get', 'feed').then((localFeed: any)=>{
        var currentFeed = localFeed || "{}";
        currentFeed = JSON.parse(currentFeed);

        dispatch(setMainFeed({status: true, data: currentFeed}));
      });
    }
  }, [dispatch, isAuthenticated, state.initialAuth, keepMySubjects]);
  useEffect(()=>{
    if (socket) {
      socket.on('connect', ()=>{
        dispatch(setConnectionState((socket.connected)?"Connected":"Connecting"))
      });
      socket.on('disconnect', ()=>{
        dispatch(setConnectionState((socket.connected)?"Connected":"Connecting"))
      });
      socket.on('message', (message: any)=>{
        handleSocketMessage(message);
      });
    };
  }, [socket, handleSocketMessage, dispatch]);
  useEffect(()=>{
    if (!state.initialAuth) {
      onDeviceStorage('get', 'userInfo').then((fetchedInfo: any)=>{
        if (fetchedInfo) {
          var userInfo = JSON.parse(fetchedInfo);
          if (userInfo.accessToken) {
            if (userInfo.accessToken!=="") {
              setIsAuthenticated(true);
              checkPushPermission().then(permi=>{
                if (permi.receive === "granted") {
                    dispatch(setPushAccess(true));
                };
              });
              manageDeliveredNotifications({});
            }
          }
        };
        dispatch(setInitialAuth(true));
      })
    };
  }, [state.initialAuth, dispatch]);

  if (((Capacitor.getPlatform() === 'ios')||(Capacitor.getPlatform() === 'android'))&&(isAuthenticated)) {
    conditionalLandingPage = false;
  };

  return (
    <IonApp>
      {
        (!state.initialAuth)?(
          <div className='loaderAfterSplashScreen'>
            <div className='appLogo'>
              <img decoding="async" loading="lazy" src="/assets/icon/ICON 512x512_tp_tiny.png" alt='AppLogo'/>
            </div>
          </div>
        ):(
          <>
          <IonReactRouter>
            {
              (playing) ? (
                <TabBarSticky>
                  <VideoPreview />
                </TabBarSticky>
              ) : ""
            }
            <IonTabs>
              <IonRouterOutlet ref={routerRef}
                mode="ios">
                <Route exact path="/login">
                  <Login name="Login"/>
                </Route>
                <Route exact path="/register">
                  <Login name="Create Account"/>
                </Route>
                <Route exact path="/otp">
                  <Login name="OTP"/>
                </Route>
                <Route exact path="/forgotPassword">
                  <Login name="Forgot Password"/>
                </Route>
                <Route exact path="/resetPassword">
                  <Login name="Reset Password"/>
                </Route>
                <Route exact path="/home" >
                  <Home routerRef={routerRef} doPlay={doPlay}/>
                </Route>
                <AuthRoute exact path="/library" isAuthorized={isAuthenticated}>
                  <Library routerRef={routerRef} doPlay={doPlay}/>
                </AuthRoute>
                <AuthRoute exact path="/notifications" isAuthorized={isAuthenticated}>
                  <Notifications />
                </AuthRoute>
                <AuthRoute exact path="/profile" isAuthorized={isAuthenticated}>
                  <Profile />
                </AuthRoute>
                <AuthRoute exact path="/chats" isAuthorized={isAuthenticated}>
                  <Chats routerRef={routerRef}/>
                </AuthRoute>
                <AuthRoute exact path="/chatting" isAuthorized={isAuthenticated} >
                  <Chatting doPlay={doPlay}/>
                </AuthRoute>
                <AuthRoute exact path="/menu" isAuthorized={isAuthenticated}>
                  <Menu />
                </AuthRoute>
                <AuthRoute exact path="/dashboard" isAuthorized={isAuthenticated}>
                  <Dashboard routerRef={routerRef} />
                </AuthRoute>
                <Route exact path="/videos" >
                  <Videos doPlay={doPlay}/>
                </Route>
                <AuthRoute exact path="/quiz" isAuthorized={isAuthenticated}>
                  <Quiz />
                </AuthRoute>
                <AuthRoute exact path="/leaderboard" isAuthorized={isAuthenticated}>
                  <Leaderboard />
                </AuthRoute>
                <AuthRoute exact path="/subject" isAuthorized={isAuthenticated}>
                  <Subject />
                </AuthRoute>
                <AuthRoute exact path="/activity" isAuthorized={isAuthenticated}>
                  <QuizActivity routerRef={routerRef} />
                </AuthRoute>
                <AuthRoute exact path="/payments" isAuthorized={isAuthenticated}>
                  <Payments firstModalRef={routerRef}/>
                </AuthRoute>
                {
                  (conditionalLandingPage)?(
                  <Route exact path="/">
                    <LandingPage />
                  </Route>
                  ):(
                  <Route exact path="/">
                    {/* <Home routerRef={routerRef} doPlay={doPlay}/> */}
                    <Redirect to={`/home`} />
                  </Route>
                  )
                }
              </IonRouterOutlet>
              <IonTabBar mode='ios' slot="bottom" id='defaultIonicTabBar'>
                <IonTabButton tab="home" href="/home">
                  <IonIcon icon={home} mode='ios'/>
                  <IonLabel>Home</IonLabel>
                </IonTabButton>
                <IonTabButton tab="library" href="/library">
                  <IonIcon icon={albums} mode='ios'/>
                  <IonLabel>My Library</IonLabel>
                </IonTabButton>
                <IonTabButton tab="chats" href="/chats">
                  {
                    (state.user.msgCount>0)?(
                      <IonBadge color="danger">{
                        (state.user.msgCount > 99)?(
                          `${state.user.msgCount}+`
                        ):(
                            state.user.msgCount
                        )
                      }</IonBadge>
                    ):("")
                  }
                  <IonIcon icon={chatbubbles} mode='ios'/>
                  <IonLabel>Chats</IonLabel>
                </IonTabButton>
                <IonTabButton tab="notifications" href="/notifications">
                  {
                    (state.user.notifyCount>0)?(
                      <IonBadge color="danger">{
                        (state.user.notifyCount > 99)?(
                          `${state.user.notifyCount}+`
                        ):(
                          state.user.notifyCount
                        )
                      }</IonBadge>
                    ):("")
                  }
                  <IonIcon icon={notifications} mode='ios'/>
                  <IonLabel>Notify</IonLabel>
                </IonTabButton>
                <IonTabButton tab="menu" href="/menu">
                  {
                    (state.user.profileNotifyCount>0)?(
                      <IonBadge color="danger">{
                        (state.user.profileNotifyCount > 99)?(
                          `${state.user.profileNotifyCount}+`
                        ):(
                          state.user.profileNotifyCount
                        )
                      }</IonBadge>
                    ):("")
                  }
                  <IonIcon icon={menu} mode='ios'/>
                  <IonLabel>Menu</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
          {
            (state.auth.user)?(
              <>
              <WelcomeSetup routerRef={routerRef} />
              <AppimateRequest routerRef={routerRef} />
              <AppimateCalls routerRef={routerRef} />
              <PaymentPrompt />
              <PaymentConfirmer firstModalRef={routerRef} />
              </>
            ):("")
          }
          {
            (playing)?(
              <VideoPlayer routerRef={routerRef} doPlay={doPlay}/>
            ):("")
          }
          </>
        )
      }
    </IonApp>
  )
};

export default App;