import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';

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

export const loginAdmin = (data) => {
  console.log(data);
  return _firebase.firestore().collection('admin').where('email', '==', data.email).where('password', '==', data.password).get()
    .then((querySnapshot) => {
      let status = false;
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id}`, doc.data());
        status = true;
        // return {status: true, message: 'You logged in successfully!'};
      });
      return { status: status, message: status ? 'You logged in successfully!' : 'Invalid credentials!' };
    });
}

export const getAllFriends = () => {
  return _firebase.firestore().collection('friends').orderBy('friend_id', 'asc').get()
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

export const getAdminInfo = async () => {
  return _firebase.firestore().collection('admin').doc('0').get()
    .then(function (doc) {
      if (doc.exists) {
        // console.log(doc.data());
        return doc.data();
      } else {
        console.log("No document exists!");
        return false;
      }
    })
    .catch(function (err) {
      console.log('Error getting admin info: ', err);
      return false;
    });
}

export const getAdminAvatarURL = async () => {
  const fileRef = _firebase.storage().ref().child('admin/profile.png');
  return fileRef.getDownloadURL()
  .then(url => url)
  .catch(err => '');
}

export const updateAdminProfile = async (data, file) => {
  const fileRef = _firebase.app().storage('gs://trefla.appspot.com').ref().child('admin/profile.png');

  if (file) {
    await fileRef.put(file);
    // fileRef.put(file)
    //   .then(function (snapshot) {
    //     fileRef.getDownloadURL().then(function(url) {
    //       console.log('[Storage] uploaded a file!', url);
    //     });        
    //   })
  }

  const adminRef = _firebase.firestore().collection('admin').doc("0");

  await adminRef.set(data)
  return true;
}

