import { IonCard, IonIcon, IonImg } from "@ionic/react";
import { shareSocial } from "ionicons/icons";

import './index.css';
interface ComponetntProps {
    onClickHandler: Function;
    extraValues?: any;
}
const ShareOptions:React.FC<ComponetntProps> = ({onClickHandler, extraValues})=>{
    
    return (
        <div
        className="shareOptsHolder" onClick={()=>{onClickHandler('appimate', extraValues)}}>
            <IonCard className="shareOpts">
                <div className="shareOptsIconHolder">
                    <IonImg src="assets/icon/ICON 192x192.png" className="shareOptsAppimate"/>
                </div>
                <br />
                inside Appimate
            </IonCard>
            <IonCard className="shareOpts" onClick={()=>{onClickHandler('other', extraValues)}}>
                <div className="shareOptsIconHolder">
                    <IonIcon icon={shareSocial} className="shareOptsSocial"/>
                </div>
                <br />
                to other Apps
            </IonCard>
        </div>
    ) 
}
export default ShareOptions;