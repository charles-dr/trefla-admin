import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';

import { convertTimeToString } from './common.utils';


const config_id = 'ZYvvzsj8CMffIcHhY689';

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
  // console.log(data);
  return _firebase.firestore().collection('admin').where('email', '==', data.email).where('password', '==', data.password).get()
    .then((querySnapshot) => {
      let status = false;
      querySnapshot.forEach((doc) => {
        // console.log(`${doc.id}`, doc.data());
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

export const getAllLangRequest = () => {
  return _firebase.firestore().collection('langs').orderBy('lang_id', 'asc').get()
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

export const updateAdminPassword = async ({ old_pass, password }) => {
  const admin = await getAdminInfo();
  if (admin) {
    if (admin.password === old_pass) {
      admin.password = password;
      await _firebase.firestore().collection('admin').doc("0").set(admin);

      return { status: true, message: 'Password has been updated!' };
    } else {
      return { status: false, message: 'Old password does not match!' };
    }
  } else {
    return { status: false, message: 'Something went wrong!' };
  }
}


////////////////////////////////////////////////////////////////
//                                                            //
//                       L A N G U A G E                      //
//                                                            // 
////////////////////////////////////////////////////////////////

export const addNewLangRequest = async ({ lang_id, name, code, active, blob }) => {
  try {
    const fileRef = _firebase.storage().ref().child(`lang/${code}.json`);

    if (blob) {
      await fileRef.put(blob);
    }

    const adminRef = _firebase.firestore().collection('langs').doc(lang_id.toString());

    const update_time = convertTimeToString();
    await adminRef.set({
      active,
      code,
      lang_id,
      name,
      update_time
    });
    return { status: true, message: 'Language has been saved.' };
  } catch (e) {
    return { status: false, message: e.message };
  }
}

export const getLangInfoByIdRequest = async lang_id => {
  return _firebase.firestore().collection('langs').doc(lang_id.toString()).get()
    .then(function (doc) {
      if (doc.exists) {
        return doc.data();
      } else {
        console.log("No document exists!");
        return false;
      }
    })
    .catch(function (err) {
      console.log('Error getting lang info: ', err);
      return false;
    });
}

export const getLangFileContentRequest = async lang_code => {
  const fileRef = _firebase.storage().ref().child(`lang/${lang_code}.json`);
  return fileRef.getDownloadURL()
    .then(async url => {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.onload = function (event) {
          var json = xhr.response;
          // console.log(json);
          resolve({ status: true, data: json });
        };
        xhr.open('GET', url);
        xhr.send();
      });
    })
    .catch(err => {
      console.error(err);
      switch (err.code) {
        case 'storage/object-not-found':
          return { status: false, message: 'File not found!' };
        case 'storage/unauthorized':
          return { status: false, message: 'Authorization failed!' };
        case 'storage/canceled':
          return { status: false, message: 'Operation has been canceled' };
        case 'storage/unknown':
          return { status: false, message: 'Unknown error!' };
        default:
          return { status: false, message: 'Something went wrong!' };
      }
    });
}

export const deleteLangByIdRequest = async (lang_id) => {
  console.log(lang_id);
  // return {status: false, message: 'hi'};
  const lang = await getLangInfoByIdRequest(lang_id);
  if (!lang) {
    return { status: false, message: 'Language does not exist!' };
  } else {
    // delete file
    try {
      const fileRef = _firebase.storage().ref().child(`lang/${lang.code}.json`);
      await fileRef.delete();
    } catch (file_error) {
      return { status: false, message: 'Failed to delete file', details: file_error.message };
    }
    // delete document
    try {
      await _firebase.firestore().collection('langs').doc(lang_id.toString()).delete();
      return { status: true, message: `Language '${lang.name}' has been deleted!` };
    } catch (doc_error) {
      return { status: false, message: 'Failed to delete document', details: doc_error.message };
    }
  }
}

export const getConfigRequest = async () => {

  return _firebase.firestore().collection('config').doc(config_id).get()
    .then(doc => {
      if (doc.exists) {
        return doc.data();
      } else {
        console.log('[Config Info] No document exists!');
        return false;
      }
    })
    .catch(err => {
      console.log('Error while getting config info!', err);
      return false;
    });
}

export const updateConfigRequest = async ({ lang_version }) => {
  const config = await getConfigRequest();

  if (!config) return { status: false, message: 'Something went wrong with config data on firestore!' };

  config.lang_version = lang_version;

  try {
    await _firebase.firestore().collection('config').doc(config_id).set(config);
    return { status: true, message: 'Data has been saved!' };
  } catch (err) {
    return { status: false, message: err.message };
  }
}
