import { useSwiper } from "swiper/react";

import './index.css';

const SwiperButtonPrev:React.FC<any> = ({children})=>{
    const swiper = useSwiper();

    return <div onClick={() => swiper.slidePrev()}>{children}</div>;
};
export default SwiperButtonPrev;