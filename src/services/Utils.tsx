import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
// import { Database, Storage as StorageIonic } from '@ionic/storage';
// import { Storage as StorageIonic } from '@ionic/storage';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { PushNotificationSchema, PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { calculator, calculatorOutline, flask, globe, heart, leaf, planet } from 'ionicons/icons';

// export const store = new StorageIonic();

export const three_line = /\n\n\n/g;
export const two_line = /\n\n/g;
export const one_line = /\n/g;
export const first_char = /\S/;

export interface ShowAlertInterface {
    header: string;
    subHeader: string;
    message: string;
    buttons: any;
    showAlert: boolean;
    // inputs: [];
}
export const applicationServerPublicKey = "BFcrXzGXv3UrzWTvrbYgs27tCy_y5OO9FTcvh6ND-zug_jFgOjXcPvEdG_FDO0ZLXeT0nJpIQhKi7PigTtrVRc0";
export const videoConstraints = {facingMode: 'user'};
export const constraints = {video: videoConstraints, audio: true};
export const webRTC: any = {};

export const monthNameList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const dayNameList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
export const daySimpleNameList = ['Yesterday', 'Today', 'Tomorrow'];
export const timeSimpleNameList = ['morning', 'day', 'afternoon', 'evening'];
export const supportedSubjects:any = {
    Maths: {name: "Maths", code: "Math", icon: calculator, classLevel: ['Gr8','Gr9','Gr10','Gr11','Gr12','Yr1','Yr2'], colorClass: "mathsColor"},
    Physics: {name: "Physics", code: "Phys", icon: planet, classLevel: ['Gr10','Gr11','Gr12','Yr1','Yr2'], colorClass: "physicsColor"},
    Chemistry: {name: "Chemistry", code: "Chem", icon: flask, classLevel: ['Gr10','Gr11','Gr12','Yr1','Yr2'], colorClass: "chemColor"},
    Biology: {name: "Life Science", code: "LifeSci", icon: heart, classLevel: ['Gr10','Gr11','Gr12','Yr1','Yr2'], colorClass: "bioColor"},
    Agriculture: {name: "Agriculture", code: "Agric", icon: leaf, classLevel: ['Gr10','Gr11','Gr12','Yr1','Yr2'], colorClass: "agricColor"},
    Geography: {name: "Geography", code: "Geo", icon: globe, classLevel: ['Gr10','Gr11','Gr12','Yr1','Yr2'], colorClass: "geoColor"},
    MathsLit: {name: "Maths Lit.", code: "MatLit", icon: calculatorOutline, classLevel: ['Gr10','Gr11','Gr12'], colorClass: "matListColor"},
    // Accounting: {name: "Accounting", code: "Acc", icon: briefcase, classLevel: ['Gr10','Gr11','Gr12'], colorClass: "accoutingColor"},
    // English: {name: "English", code: "Engl", icon: language, classLevel: ['Gr8','Gr9','Gr10','Gr11','Gr12'], colorClass: "englishColor"},
    // Economics: {name: "Economics", code: "Econ", icon: cash, classLevel: ['Gr10','Gr11','Gr12','Yr1','Yr2'], colorClass: "economicsColor"},
    // Business: {name: "Business Studies", code: "Busi", icon: business, classLevel: ['Gr10','Gr11','Gr12','Yr1','Yr2'], colorClass: "bsColor"},
};


/*=================================Offline Protocol settings==============================*/
export const SOCKET_PROTOCOL = "ws";
export const HTTP_PROTOCOL = "http";
export const APP_LOCAL_DOMAIN = "localhost:3000";
export const APP_AUTH_DOMAIN = APP_LOCAL_DOMAIN;
export const APP_VIDEOS_DOMAIN = APP_LOCAL_DOMAIN;
/*=================================Online Protocol settings==============================*/
// export const SOCKET_PROTOCOL = "wss";
// export const HTTP_PROTOCOL = "https";
// export const APP_LOCAL_DOMAIN = "appimate.com";
// export const APP_AUTH_DOMAIN = "appimate.com";
// export const APP_VIDEOS_DOMAIN = "appimate.com";


export const currentWebSocketDomain = (path: any) => `${SOCKET_PROTOCOL}://${APP_LOCAL_DOMAIN}/${path}`;
export const localDomain = (path: any) => `${HTTP_PROTOCOL}://${APP_LOCAL_DOMAIN}/${path}`;
export const appAuthDomain = (path: any) => `${HTTP_PROTOCOL}://${APP_AUTH_DOMAIN}/${path}`;
export const imgProfiles = (path: any) => `${HTTP_PROTOCOL}://${APP_AUTH_DOMAIN}/${path}`;
export const quizSourceDomain = (path: any) => `${HTTP_PROTOCOL}://${APP_AUTH_DOMAIN}/${path}`;
export const videosSourceDomain = (path: any) => `${HTTP_PROTOCOL}://${APP_AUTH_DOMAIN}/${path}`;
export const videoFilesDomain = (path: any) => `${HTTP_PROTOCOL}://${APP_VIDEOS_DOMAIN}/${path}`;
export const videoThumbDomain = (path: any) => `${HTTP_PROTOCOL}://${APP_VIDEOS_DOMAIN}/${path}`;

export const sleep = (n: any) => new Promise(r => setTimeout(r, n));

export const bytesToMegaBytes = (b: any) => {
    var megaBytes = (b/1000000).toFixed(1);
    return megaBytes;
}
export const msToTime = (d: any) => {
    var seconds = Math.floor((d / 1000) % 60), minutes = Math.floor((d / (1000 * 60)) % 60), hours = Math.floor(d / (1000*60*60)%60);

    return (hours < 1)? (minutes + ":" + (seconds < 10 ? `0${seconds}` : seconds)): hours+":"+(minutes < 10 ? `0${minutes}` : minutes)  + ":" + (seconds < 10 ? `0${seconds}` : seconds);
}
export const sToTime = (d: any) => {
    var seconds = Math.floor((d / 1) % 60), minutes = Math.floor((d / (1 * 60)) % 60), hours = Math.floor(d / (1000*60*60)%60);

    return (hours < 1)? (minutes + ":" + (seconds < 10 ? `0${seconds}` : seconds)): hours+":"+(minutes < 10 ? `0${minutes}` : minutes) + ":" + (seconds < 10 ? `0${seconds}` : seconds);
}
export const dateTimeNow = ()=> {
    var today = new Date(), secs:any = today.getSeconds(), mins:any = today.getMinutes(), hh:any = today.getHours(), dd:any = today.getDate(), mm:any = today.getMonth()+1,/*January is zero*/ yyyy:any = today.getFullYear();
    if (dd < 10) {dd = '0'+dd;}; if (mm < 10) {mm = '0'+mm;};
    if (secs < 10) {secs = '0'+secs;}; if (mins < 10) {mins = '0'+mins;};
    if (hh < 10) {hh = '0'+hh;};
    return yyyy+'-'+mm+'-'+dd+' '+hh+':'+mins+':'+secs;
}
export const capitalize = (s: string)=>{if(s==null||undefined){s='';}; return s.replace(first_char, (m: string)=>{return m.toUpperCase();});};
export const getDigits = (s: any)=> s.match(/\d+/g).map(Number);
export const getDevice = () => window.navigator.userAgent.toLowerCase();
export const isIos = () => /iphone|ipad|ipod/.test( getDevice() );;
export const genWebShare = (shTitle: string, shText: string, shUrl: string, filesArray: any) => { 
    console.log(navigator)
    if (!("share" in navigator)) {
        console.log('Web Share API not supported.'); 
        return Promise.resolve(null);
    } else {
        var doFiles = false;
        if (filesArray) {
            if (navigator.canShare && navigator.canShare({files: filesArray})) { 
                doFiles = true;
                if ((filesArray[0] instanceof File)||(filesArray[0] instanceof Blob)) {
                    doFiles = true;
                };
            };
        };
        if (doFiles) {
            return navigator.share({title: shTitle, text: shText, url: shUrl, files: filesArray }).then((result)=>{ return result;
            }).catch(error => {console.log('Error sharing: ', error); return null;});
        } else {
            return navigator.share({title: shTitle, text: shText, url: shUrl }).then((result)=>{ return result;
            }).catch(error => {console.log('Error sharing: ', error); return null;});
        }
    };
}
export const arrayEntryByObjectKey = (obj: any, keyName: string, list: { [x: string]: any; hasOwnProperty: (arg0: string) => any; }) => {
    var x;
    for (x in list) {
        if (list.hasOwnProperty(x) && list[x][keyName] === obj[keyName]) {
            return list[x];
        }
    }
    return null;
}
export const arrayEntriesByArrayOnKeyValue = (obj: any, keyName: string, keyValue: string) => {
    var x:any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            if ( element[keyName].includes(keyValue)) {
                x[key] = element;
            }
        }
    }
    return x;
}

export const makeRequests = async (state: any, options: any) => {
    var accessToken = "";
    var url = "";
    var method = "get";
    var data;
    var onUploadProgress;
    var customHeaders = {};
    if (state) {
        if (state.auth) {
            if (state.auth.user) {
                if (state.auth.user.accessToken) {
                    accessToken = state.auth.user.accessToken;
                }
            };
        }
    }
    if (options) {
        method = options.method? options.method : "get";
        url = options.url? options.url : "";
        data = options.data? options.data : "";
        customHeaders = options.headers? options.headers : {};
        onUploadProgress = options.onUploadProgress ? options.onUploadProgress: {}
    };
    var headers = {
        Authorization: "Bearer "+accessToken, ...customHeaders
    }

    
    const config = {
        headers,
        ...onUploadProgress
    };
    if (method.toLowerCase().includes("post")) {
        var formData = new FormData();
        for ( var theKey in data ) {
            formData.append(theKey, data[theKey]);
        };
        return axios.post(url, formData, config).then(res=>{
            return res.data;
        }).then(resp=>{
            return resp;
        }).catch(err=>{
            console.log(err);
            return {success: false, msg: "Request error", msg2: err.message, action: {retry: true}};
        });
    } else {
        if (data && (data !== "")) {
            var urlData = "";
            for (var key in data) {
                if (urlData !== "") {
                    urlData += "&";
                }
                urlData += key + "=" + encodeURIComponent(data[key]);
            };
            if (url.includes('?')) {
                url = `${url}&${urlData}`;
            } else {
                url = `${url}?${urlData}`;
            }
        };
        return axios.get(url, config).then(res=>{
            return res.data;
        }).then(resp=>{
            return resp;
        }).catch(err=>{
            console.log(err);
            return {success: false, msg: "Request error", msg2: err.message, action: {retry: true}};
        });
    }
}
export const onDeviceStorage = async (action: string, keyValuePair: any) => {
    if (action === 'set') {
        const key= Object.keys(keyValuePair)[0];
        const value = keyValuePair[key];
        await Preferences.set({key: key, value: value});
        // await store.set({key: key, value: value})
    } else if (action === 'get') {
        var { value } = await Preferences.get({ key: keyValuePair });
        return value;
    } else if (action === 'remove') {
        await Preferences.remove({ key: keyValuePair });
    } else if (action === 'clear') {
        await Preferences.clear();
    } else if (action === 'keys') {
        const { keys } = await Preferences.keys();
        return keys;
    };
}

export const textAreaAdjust = (o: any) => {
    o.style.height = "1px";
    // var currentHeight = (o.style.height).substring(0, (o.style.height).length-2);
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        o.style.height = (o.scrollHeight+15)+"px";
    } else {
        o.style.height = (o.scrollHeight+10)+"px";
    };
}

export const seekTimeUpdate = (vid: string) => { 
    var curMins:any = 0;
    var curSecs:any = 0;
    var vidElement:any = document.querySelector("#"+vid);
    if (vidElement) {
        curMins = Math.floor(vidElement.currentTime / 60); 
        curSecs = Math.floor(vidElement.currentTime - curMins * 60); 
    }
    if (curMins<10) {
        curMins = "0"+curMins;
    }; 
    if (curSecs<10) {
        curSecs = "0"+curSecs;
    }; 
    return curMins+":"+curSecs;
};

export const getTimeOfDay = (time: any)=>{
    var secs = time.getSeconds(), mins = time.getMinutes(), hh = time.getHours();
    
    var ttName = "";
    if (hh < 12) {
        ttName = timeSimpleNameList[0];
    } else if ((hh > 11) && (hh <= 13)) {
        ttName = timeSimpleNameList[1];
    } else if ((hh > 12) && (hh <= 17)) {
        ttName = timeSimpleNameList[2];
    } else if (hh > 17) {
        ttName = timeSimpleNameList[3];
    };
    return {name: ttName, hour: hh, min: mins, sec: secs};
}
export const getDayOfWeek = (formatedDate: string)=>{
    var today = new Date(), secs = today.getSeconds(), mins = today.getMinutes(), hh = today.getHours(), dd = today.getDate(), mm = today.getMonth()+1, yyyy = today.getFullYear();
    var dOW = (new Date(formatedDate)).getDay();
    var dOM = (new Date(formatedDate)).getDate();
    var mOY = (new Date(formatedDate)).getMonth();
    var mmName = monthNameList[mOY];
    var ddName = dayNameList[dOW];
    var fDayNm:string = "null";
    var ttName:string = "";
    if ((mOY+1) === mm) {
        if (dOM === dd+1) {
            fDayNm = daySimpleNameList[2];
        } else if (dOM === dd) {
            fDayNm = daySimpleNameList[1];
        } else if (dOM === dd-1) {
            fDayNm = daySimpleNameList[0];
        };
    } else {
        if ((mOY+1) === mm+1) {
        // 	fDayNm = this.daySimpleNameList[dOW];
        } else if ((mOY+1) === mm-1) {
        // 	fDayNm = this.daySimpleNameList[dOW];
        };
    };
    if (hh < 12) {
        ttName = timeSimpleNameList[0];
    } else if ((hh > 12) && (hh <= 17)) {
        ttName = timeSimpleNameList[1];
    } else if (hh > 17) {
        ttName = timeSimpleNameList[2];
    };

    return {year: yyyy, month: mmName, day: {name: ddName, name2: fDayNm, value: dd}, time: {name: ttName, hour: hh, min: mins, sec: secs}};
}
export const degreeToRad = (degree: number) => {
    var factor = Math.PI/180; 
    return degree*factor;
};

export const getMaxY = (data: any) => {
    /*Returns the max Y value in our data list*/ 
    var max = 0; 
    for(var ii = 0; ii < data.values.length; ii ++) {
        if(data.values[ii].Y > max) {
            max = data.values[ii].Y;
        };
    }; 
    max += 10 - max % 10; 
    return max; 
};

export const getXPixel = (graph: any, data: any, val: number,  xPadding: number) => {
    /*Return the x pixel for a graph point*/ 
    return ((graph.width() - xPadding) / data.values.length) * val + (xPadding * 1.5); 
};
export const getYPixel = (graph: any, data: any, val: number, yPadding: number) => {
    /*Return the y pixel for a graph point*/ 
    return graph.height() - (((graph.height() - yPadding) / getMaxY(data)) * val) - yPadding;
};
export const canvasToImage = (theCanvas: any, filename="imgFrom", mimeType="image/jpeg", qualityVal=1) => {
    var theImage:any = null;
    if (theCanvas) {
        var dataUrl = theCanvas.toDataURL();
        var arr = dataUrl.split(',');

        theImage = urlB64ToUint8Array(arr[1]);
        theImage = new File([theImage], filename, {type: mimeType, lastModified: Date.now()});
    };
    return theImage;
}

export const urlB64ToUint8Array = (base64String: string) => {
    // const padding = '='.repeat((4 - base64String.length % 4) % 4);const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64String.length % 4) % 4);const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    };
    return outputArray;
}


export const checkPushPermission = async () => {
    let permissionCheck:any = null;
    try {
        if (Capacitor.getPlatform() === "web") {
            if (isIos()) {
                permissionCheck = {success: false, msg: "Web not supported by iOS", msg2: "(Not supported on iOS browsers)", msg3: "web push Notitifications is not supported on iOS devices."};
            } else {
                permissionCheck = {
                    receive: Notification.permission
                };
            }
        } else {
            permissionCheck = await PushNotifications.checkPermissions(); 
        } 
    } catch (error: any) {
        permissionCheck = {success: false, msg: "Not implemented for web", msg2: error.message};
    }
    return permissionCheck;
};
export const getPushPermission = async () => {
    var permission;
    try {
        if (Capacitor.getPlatform() === "web") {
            if (isIos()) {
                permission = {success: false, msg: "Web not supported by iOS", msg2: "(Not supported on iOS browsers)", msg3: "web push Notitifications is not supported on iOS devices."};
            } else {
                permission = {
                    receive: Notification.permission
                };
            }
        } else {
            permission = await PushNotifications.requestPermissions();
        } 
    } catch (error) {
        // console.log(error);
        permission = await getPermissions('push').then(perm=>{
            return perm
        });
    }
    
    console.log('Location permission:', permission);
    return permission;
};
export const getPermissions = async (name: PermissionName) => {
    try {
        if (isIos()) {
            return Promise.resolve({name: name, state: 'prompt', onchange: null});
        } else {
            return navigator.permissions.query({name: name}).then((result)=>{
                return result;
            });
        }
    } catch (error: any) {
        console.log(error.message);
        return navigator.permissions.query({name: name}).then((result)=>{
            return result;
        });
    }
}
export const manageDeliveredNotifications = (notificationOpt: any)=>{
    try {
        let removeOne = false;
        if (Capacitor.getPlatform() === "web") {
            
        } else {
            if (notificationOpt) {
                if (Object.keys(notificationOpt).length > 0) {

                }
            };
            if (removeOne) {
                PushNotifications.removeDeliveredNotifications(notificationOpt);
            } else {
                PushNotifications.removeAllDeliveredNotifications();
            }
        }
    } catch (error: any) {
        console.log("Error: ", error.message);
    }
}
export const addNativePushRegListeners = async (listenerCallback: any)=>{
    var pushListeners;
    try {
        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
            console.log('notification in: ', notification)
            // setnotifications(notifications => [...notifications, { id: notification.id, title: notification.title, body: notification.body, type: 'foreground' }])
            listenerCallback({notification});
        });

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
            console.log('notification action: ', notification)
            // setnotifications(notifications => [...notifications, { id: notification.notification.data.id, title: notification.notification.data.title, body: notification.notification.data.body, type: 'action' }])
            listenerCallback({notification});
        });

        // pushRegistration = new Promise((resolve, reject)=>{
        //     // On success, we should be able to receive notifications
            PushNotifications.addListener('registration', (token: Token) => {
                // resolve(token); // call resolve with results.
                listenerCallback({token});
            });

            // Some issue with our setup and push will not work
            PushNotifications.addListener('registrationError', (error: any) => {
                console.log('Error on registration: ', error);
                // reject(error); // call resolve with results.
                listenerCallback({error});
            });
        // });
        pushListeners = {success: true, msg: "Listeners Added Successfully", msg2: "During push listner registrations.", msg3: ""};
    } catch (error: any) {
        console.log(error)
        pushListeners = {success: false, msg: "Couldn't opt in.", msg2: "During push registration.", msg3: error.message};
    };

    return pushListeners;
}
export const isPushSubscribed = async ()=>{
    const serviceWorker = await navigator.serviceWorker.ready;

    if (serviceWorker != null) {
        return serviceWorker.pushManager.getSubscription().then(function(subscription) {				
            return subscription;
        }).then(res=>{
    // console.log(res)
            return {subscribed: !(res === null), subscription: res};
        }).catch(err=>{
            console.log(err);
            return {subscribed: false};
        });
    } else {
        return {subscribed: false, swRegistration: serviceWorker};
    }
};
export const subscribeToPush = async ()=>{
    try {
        if (Capacitor.getPlatform() === "web") {
            if ('serviceWorker' in navigator || 'PushManager' in window ) { 
                const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

                return isPushSubscribed().then(async (subscriptionRes: any)=>{
                    console.log(subscriptionRes)
                    if (subscriptionRes.subscribed) {
                        return subscriptionRes.subscription;
                    } else {
                        const serviceWorker = await navigator.serviceWorker.ready;

                        let subscriptionOptions = {userVisibleOnly: true, applicationServerKey: applicationServerKey};
                        return serviceWorker.pushManager.subscribe(subscriptionOptions).then(function(subscription: any) { 
                            return subscription; 
                        }).catch((err: any)=>{
                            return {success: false, msg: "Couldn't opt in.", msg2: "During push registration.", msg3: err.message};
                        });
                    }
                })
            } else {
                return {success: false, msg: "Couldn't opt in.", msg2: "(During push registration.)", msg3: `Please update your browser, \nThis notification service doesn't work on this ${Capacitor.getPlatform()} platform.`};
            };
        } else {
            // Register with Apple / Google to receive push via APNS/FCM
            return PushNotifications.register();
        }
    } catch (error: any) {
        console.log(error)
        return {success: false, msg: "Couldn't opt in.", msg2: "During push registration.", msg3: error.message};
    };
}
export const unsubscribeToPush = async ()=>{
    var pushRemoval;
    try {
        // removeAllListeners

        if (Capacitor.getPlatform() === "web") {
            return isPushSubscribed().then((subscriptionRes: any)=>{
                // console.log(subscriptionRes);
                if (subscriptionRes) { 
                    if (subscriptionRes.subscription) {
                        subscriptionRes.subscription.unsubscribe();
                    }
                };
            })
        } else {
            pushRemoval = PushNotifications.removeAllListeners();
        }
    } catch (error: any) {
        pushRemoval = {success: false, msg: "Couldn't opt out", msg2: "Something went wrong.", msg3: error.message, data: error};
        
    };
    return pushRemoval;
}

export const getUserMedia = (constraints: any) => {
    return navigator.mediaDevices.getUserMedia(constraints);
}
export const stopMediaTracks = (stream: any) => { 
    stream.getTracks().forEach((track: any)=>{ 
        track.stop(); 
    }); 
}

export const addStreamToVideoTag = async (stream: any, video: any) => {
    // video.srcObject = stream;
    if ('srcObject' in video) {
        video.srcObject = stream;
    } else if ('mozGetUserMedia' in navigator) {
        video.mozSrcObject = stream;
    } else {
        video.src = (window.URL || window.webkitURL).createObjectURL(stream);
    }
    video.addEventListener('loadedmetadata', ()=>{
        video.play();
    })
    return video;
};
export const addStreamToAudioTag = async (stream: any, audio: any) => {
    // video.srcObject = stream;
    if ('srcObject' in audio) {
        audio.srcObject = stream;
    } else if ('mozGetUserMedia' in navigator) {
        audio.mozSrcObject = stream;
    } else {
        audio.src = (window.URL || window.webkitURL).createObjectURL(stream);
    }
    audio.addEventListener('loadedmetadata', ()=>{
        audio.play();
    })
    return audio;
};

export const arrayEquality = (a: Array<any>, b: Array<any>)=>{
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();

    return a.every((element, index)=>{
        return element === b[index];
    });
}
export const getInitials = (names: string)=>{
    let initials = names.split(" ").map((n)=>n[0]).join("");

    return initials.toUpperCase();
}

export const hapticsImpactLight = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
};
export const hapticsImpactMedium = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
};
export const hapticsImpactHeavy = async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
};
export const hapticsVibrate = async (duration: number) => {
    await Haptics.vibrate({duration});
};