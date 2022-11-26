import React, { useEffect, useState } from 'react';

import './index.css';
const waitForElement = (sel, cb) => {
    const el = document.querySelector(sel);

    if (!el || !el.offsetHeight) {
        requestAnimationFrame(() => waitForElement(sel, cb));
    } else {
        cb(el);
    }
}

const TabBarSticky = ({ children }) => {
    const [top, setTop] = useState(0);

    useEffect(() => {
        waitForElement('defaultIonicTabBar', (tabBar) => {
            if (tabBar) {
                const box = tabBar.getBoundingClientRect();
                setTop(window.innerHeight - box.top);
            }
        })
    }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: `${top+50}px`,
            width: '100%',
            zIndex: '1000'
        }} className={'stickyTabBar'}>
        {children}
        </div>
    );
};

export default TabBarSticky;