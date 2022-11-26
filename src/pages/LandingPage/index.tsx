import { IonCard, IonIcon, IonPage, IonTitle, useIonViewWillEnter } from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import { useCallback } from 'react';
import { useHistory } from 'react-router';
import { appAuthDomain } from '../../services/Utils';
import './index.css';
const LandingPage:React.FC = ()=>{

    useIonViewWillEnter(() => {
        const bottomNav = document.getElementById("defaultIonicTabBar");
        if (bottomNav) {
            bottomNav.style.display = "none";
        };
    });

    const history = useHistory()
    const moveToPage = useCallback(() => {
        const to = `/home`
        history.push(to)
        // window.open("/help.html", "_self");
    },[ history]);

    return (
        <IonPage>
            <div className="landingMainHolder">
                <div className="companyOverView">
                    <div className="otherPageLink">
                        <a href={appAuthDomain("about.html")}>About us</a>
                        <a href={appAuthDomain("help.html")}>Help</a>
                        <a href={appAuthDomain("terms.html")}>Terms</a>
                    </div>
                    <div className="companyContextGraphics">
                        <div className="companyContextTextGroups">
                            <h1>Extend</h1>
                            <h1>your</h1>
                            <h1>experiences.</h1>
                        </div>
                        <div className="highlightLearningPlatform">
                            <IonCard className="theAppimateAppIcon" routerLink='/home'>
                                <img decoding="async" loading="lazy" src="/assets/icon/ICON 512x512_tp.png" alt="App Icon"/>
                            </IonCard>
                            <div className="theAppimateAppDirect" onClick={moveToPage} >
                                <p>Appimate</p>
                                <IonIcon icon={arrowForward} />
                            </div>
                        </div>
                    </div>
                    <div className="appimateProducts" >
                        <IonTitle>Powered by: Appimate</IonTitle>
                        <div className="appsList">
                            <IonCard className="theApps"></IonCard>
                            <IonCard className="theApps"></IonCard>
                            <IonCard className="theApps"></IonCard>
                        </div>
                    </div>
                </div>
                {/* <div className="loginFormHolder" > */}
                    <IonCard className="loginFormHolder" routerLink='/home'>
                        
                    </IonCard>
                {/* </div> */}
            </div>
        </IonPage>
    );
}
export default LandingPage;