import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBdnoTzHFUFDuI-wEyMiZSqPpsy4k4TYDM',
  authDomain: 'trefla.firebaseapp.com',
  databaseURL: 'https://trefla.firebaseio.com',
  projectId: 'trefla',
  storageBucket: 'trefla.appspot.com',
  messagingSenderId: '139969386003',
  appId: '1:139969386003:web:509097a8e125b7d967d1e6',
  measurementId: 'G-Z650WSCL04',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const _firebase = firebase;

export const getAllUsers = () => {
  return _firebase.firestore().collection('users').orderBy('user_id', 'asc').get()
  .then((querySnapshot) => {
      const rows = [];
      querySnapshot.forEach((doc) => {
          // console.log(`${doc.id}`, doc.data());
          rows.push(doc.data());
      });
      return rows;
  });
}

export const getAllPosts = () => {
  return _firebase.firestore().collection('posts').orderBy('post_id', 'asc').get()
  .then((querySnapshot) => {
      const rows = [];
      querySnapshot.forEach((doc) => {
          // console.log(`${doc.id}`, doc.data());
          rows.push(doc.data());
      });
      return rows;
  });
}