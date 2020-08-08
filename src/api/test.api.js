import axios from 'axios';
// import firebase from 'firebase/app';
// import 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: 'AIzaSyBdnoTzHFUFDuI-wEyMiZSqPpsy4k4TYDM',
//   authDomain: 'trefla.firebaseapp.com',
//   databaseURL: 'https://trefla.firebaseio.com',
//   projectId: 'trefla',
//   storageBucket: 'trefla.appspot.com',
//   messagingSenderId: '139969386003',
//   appId: '1:139969386003:web:509097a8e125b7d967d1e6',
//   measurementId: 'G-Z650WSCL04',
// };

// firebase.initializeApp(firebaseConfig);

// export const _firebase = firebase;

export const testFunction = async () => {
  try {
    const res = await axios.get('/api/user');
    console.log(res);
    return res;
  } catch (e) {
    return {
      status: false,
      message: e.message,
    };
  }
};
