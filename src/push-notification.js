// import firebase from 'firebase';

// export const inicializarFirebase = () => {
//   firebase.initializeApp({
//     messagingSenderId: "1056539295646"
//   });


//   navigator.serviceWorker
//       .getRegistration()
//       .then((registration) => {
//         firebase.messaging().useServiceWorker(registration);
//       });
// }



// export const pedirPermissaoParaReceberNotificacoes = async () => {
//   try {
//     const messaging = firebase.messaging();
//     await messaging.requestPermission();
//     const token = await messaging.getToken();
//     console.log('token do usuário:', token);
//     return token;
//   } catch (error) {
//     console.error(error);
//   }
// }