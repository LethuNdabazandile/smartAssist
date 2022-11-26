import { useSwiper } from "swiper/react";

import './index.css';

const SwiperButtonNext:React.FC<any> = ({children})=>{
    const swiper = useSwiper();

    return <div onClick={() => swiper.slideNext()}>{children}</div>;
};
export default SwiperButtonNext;