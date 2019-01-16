import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './service-worker';
// import { inicializarFirebase } from './push-notification';

// function askPermission() {
//     Notification.requestPermission().then(function(result) {
//     if (result === 'denied') {
//         console.log('Permission wasn\'t granted. Allow a retry.');
//         // alert('negado')
//         return;
//     }
//     if (result === 'default') {
//         console.log('The permission request was dismissed.');
//         // alert('nada')
//         return;
//     }
//     // alert('ok')
//     });
// }

ReactDOM.render(<App />, document.getElementById('root'));


serviceWorker.register();


// askPermission();

// inicializarFirebase();




