import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { AppContextProvider } from './contexts/AppContextProvider';
import { SockectProvider } from './contexts/SocketProvider';
import { WebRTCProvider } from './contexts/WebRTCProvider';
import { ConversationsProvider } from './contexts/ConversationsProvider';


ReactDOM.render(
  <React.StrictMode>
    <AppContextProvider> 
      <SockectProvider >
        <WebRTCProvider>
          <ConversationsProvider>
            <App />
          </ConversationsProvider>
        </WebRTCProvider>
      </SockectProvider>
    </AppContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();


const sendToAnalytics = (metric: any) => {
  // console.log(metric);
  const body = JSON.stringify(metric);
  const url = 'https://appimate.com/api/analytics';

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}
reportWebVitals(sendToAnalytics);