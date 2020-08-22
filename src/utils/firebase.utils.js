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

    let download_url = '';
    if (blob) {
      const uploaded = await fileRef.put(blob);
      // get download url
      download_url = await fileRef.getDownloadURL();

    }

    const adminRef = _firebase.firestore().collection('langs').doc(lang_id.toString());

    const update_time = convertTimeToString();
    await adminRef.set({
      active,
      code,
      lang_id,
      name,
      update_time,
      download_url
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


////////////////////////////////////////////////////////////////
//                                                            //
//                         U   S   E   R                      //
//                                                            // 
////////////////////////////////////////////////////////////////

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

export const getUserByIdRequest = async (user_id) => {
  user_id = Number(user_id); // convert into integer
  const userRef = _firebase.firestore().collection('users').doc(user_id.toString());

  return _firebase.firestore().collection('users').doc(user_id.toString()).get()
    .then(doc => {
      if (doc.exists) {
        return doc.data();
      } else {
        return false;
      }
    })
    .catch(err => {
      console.log('[User Fetch]', err);
      return false;
    })
}

export const addNewUserRequest = async (profile, avatarFile) => {
  console.log('[user data]', profile, user_id);
  const user_id = profile.user_id;

  if (!profile.email) { return { status: false, message: 'Email is required!' }; }
  if (!profile.password) { return { status: false, message: 'User Name is required!' }; }
  if (profile.cpassword !== undefined) { delete profile.cpassword; }

  const userWithEmail = await getUserByEmail(profile.email); console.log(userWithEmail);
  if (userWithEmail.status === true) {
    return { status: false, message: 'User already exists with the given email' };
  } else if (userWithEmail.code === 400) {
    return userWithEmail;
  } else if (userWithEmail.code === 404) {

    // update profile photo
    if (!!avatarFile) {
      let ext = getExtensionFromFileName(avatarFile.name);
      const avatarRef = _firebase.storage().ref().child(`profile/${user_id.toString()}.${ext}`);
      try {
        await avatarRef.put(avatarFile);
        let profile_photo = await avatarRef.getDownloadURL();
        profile.photo = profile_photo;
      } catch (e) {
        console.error(e);
        return { status: false, message: 'Failed to upload profile photo!' };
      }
    }

    //add user
    try {
      const userRef = _firebase.firestore().collection('users').doc(user_id.toString());
      await userRef.set({ ...profile, user_id: user_id });
      return { status: true, message: 'A new user has been created!' };
    } catch (err) {
      console.error(err);
      return { status: false, message: 'Something went wrong', details: err.message };
    }
  }
}

export const updateUserProfile = async (profile, avatarFile = null, cardFile = null) => {
  // console.log(avatarFile, cardFile, profile);
  const user_id = profile.user_id;

  // update card photo
  if (!!cardFile) {
    let ext = getExtensionFromFileName(cardFile.name);
    const cardRef = _firebase.storage().ref().child(`card/${user_id.toString()}.${ext}`);
    try {
      console.log('[Uploading card]')
      await cardRef.put(cardFile);
      let card_path = await cardRef.getDownloadURL();
      profile.card_img_url = card_path;
    } catch (e) {
      console.error(e);
      return { status: false, message: 'Failed to upload card image!' };
    }
  }

  // update profile photo
  if (!!avatarFile) {
    let ext = getExtensionFromFileName(avatarFile.name);
    const avatarRef = _firebase.storage().ref().child(`profile/${user_id.toString()}.${ext}`);
    try {
      await avatarRef.put(avatarFile);
      let profile_photo = await avatarRef.getDownloadURL();
      profile.photo = profile_photo;
    } catch (e) {
      console.error(e);
      return { status: false, message: 'Failed to upload profile photo!' };
    }
  }


  try {
    const userRef = _firebase.firestore().collection('users').doc(user_id.toString());
    profile.update_time = convertTimeToString();
    await userRef.set(profile);
    return { status: true, message: 'User has been updated!' };
  } catch (e) {
    return { status: false, message: 'Failed to update profile', details: e.message };
  }
}

export const getUserByEmail = async (email) => {
  return _firebase.firestore().collection('users').where("email", "==", email).get()
    .then(querySnapshot => {
      let user;
      querySnapshot.forEach(doc => {
        user = doc.data();
      });
      if (!!user) {
        return { status: true, message: 'success', data: user };
      } else {
        return { status: false, message: 'No user found with email', code: 404 };
      }
    })
    .catch(err => {
      return { status: false, message: err.message, code: 400 };
    })
}

export const getExtensionFromFileName = (filename) => {
  const tArray = filename.split('.');
  return tArray[tArray.length - 1];
}

export const toggleBanStatus = async ({ active, user_id }, banReason) => {
  // console.log(active, user_id, banReason);
  active = active === 1 ? 1 : 0;

  const user = await getUserByIdRequest(user_id);
  // console.log(user);
  user.active = 1 - active;
  user.ban_reason = banReason;
  user.ban_reply = '';
  user.update_time = convertTimeToString();
  try {
    const userRef = _firebase.firestore().collection('users').doc(user_id.toString());
    await userRef.set(user);
    return { status: true, message: `User has been ${active === 1 ? 'banned' : 'released'}` };
  } catch (e) {
    return { status: false, message: `Failed to ${active === 1 ? 'ban' : 'release'} user...`, details: e.message };
  }
}

export const deleteUserById = async (user_id, options) => {
  console.log(user_id, options);

  // delete post
  if (options.post) {
    try {
      await deletePostsOfUser(user_id);
    } catch (err) {
      return { status: false, message: 'Error while deleting posts!', details: err.message };
    }
  }

  // delete chats
  if (options.chat) {
    try {
      await deleteChatOfUesr(user_id);
    } catch (err) {
      return { status: false, message: 'Error while deleting chat!', details: err.message };
    }
  }

  // delete comments
  if (options.comment) {
    try {
      deleteCommentsOfUser(user_id);
    } catch (err) {
      return { status: false, message: 'Error while deleting comments!', details: err.message };
    }
  }

  // delete reports
  if (options.report) {
    try {
      deleteReportsOfUser(user_id);
    } catch (err) {
      return { status: false, message: 'Error while deleting reports!', details: err.message }
    }
  }

  // delete friends
  if (options.friend) {
    try {
      deleteFriendsOfUser(user_id);
    } catch (err) {
      return { status: false, message: 'Error while deleting friends!', details: err.message };
    }
  }

  // delete user
  try {
    await _firebase.firestore().collection('users').doc(user_id.toString()).collection('notifications').get().then(qss => {
      qss.forEach(async notiDoc => {
        await _firebase.firestore().collection('reports').doc(user_id.toString()).collection('notifications').doc(notiDoc.id).delete();
      });
    });
    await _firebase.firestore().collection('users').doc(user_id.toString()).collection('photos').get().then(qss => {
      qss.forEach(async photoDoc => {
        await _firebase.firestore().collection('reports').doc(user_id.toString()).collection('photos').doc(photoDoc.id).delete();
      });
    });
    await _firebase.firestore().collection('users').doc(user_id.toString()).delete();
  } catch (err) {
    return { status: false, message: 'Error while deleting user', details: err.message };
  }
  return { status: true, message: 'User has been deleted!' };
}

export const deletePostsOfUser = async user_id => {
  await _firebase.firestore().collection('posts').where('post_user_id', '==', user_id).get()
    .then(querySnapshot => {
      querySnapshot.forEach(async doc => {
        await _firebase.firestore().collection('posts').doc(doc.id).collection('likes').get().then(qss => {
          qss.forEach(async likeDoc => {
            await _firebase.firestore().collection('posts').doc(doc.id).collection('likes').doc(likeDoc.id).delete();
          })
        });

        await _firebase.firestore().collection('posts').doc(doc.id).collection('comments').get().then(qss => {
          qss.forEach(async commentDoc => {
            await _firebase.firestore().collection('posts').doc(doc.id).collection('comments').doc(commentDoc.id).delete();
          })
        });
        await _firebase.firestore().collection('posts').doc(doc.id).delete();
      });
    });
}

export const deleteChatOfUesr = async (user_id) => {
  await _firebase.firestore().collection('chats').where('user_ids', 'array-contains', user_id).get()
    .then(querySnapshot => {
      querySnapshot.forEach(async doc => {
        await _firebase.firestore().collection('chats').doc(doc.id).collection('messages').get().then(qss => {
          qss.forEach(async msgDoc => {
            await _firebase.firestore().collection('chats').doc(doc.id).collection('messages').doc(msgDoc.id).delete();
          });
        });
        await _firebase.firestore().collection('chats').doc(doc.id).delete();
      });
    });
}

export const deleteCommentsOfUser = async (user_id) => {
  await _firebase.firestore().collection('comments').where('user_id', '==', user_id).get()
    .then(querySnapshot => {
      querySnapshot.forEach(async doc => {
        await _firebase.firestore().collection('comments').doc(doc.id).collection('likes').get().then(qss => {
          qss.forEach(async msgDoc => {
            await _firebase.firestore().collection('comments').doc(doc.id).collection('likes').doc(msgDoc.id).delete();
          });
        });
        await _firebase.firestore().collection('comments').doc(doc.id).delete();
      });
    });
}

export const deleteReportsOfUser = async (user_id) => {
  await _firebase.firestore().collection('reports').where('user_id', '==', user_id).get()
    .then(querySnapshot => {
      querySnapshot.forEach(async doc => {
        // await _firebase.firestore().collection('reports').doc(doc.id).collection('likes').get().then(qss => {
        //   qss.forEach(async msgDoc => {
        //     await _firebase.firestore().collection('reports').doc(doc.id).collection('likes').doc(msgDoc.id).delete();
        //   });
        // });
        await _firebase.firestore().collection('reports').doc(doc.id).delete();
      });
    });
}

export const deleteFriendsOfUser = async (user_id) => {
  await _firebase.firestore().collection('friends').where('user_ids', 'array-contains', user_id).get()
    .then(querySnapshot => {
      querySnapshot.forEach(async doc => {
        // await _firebase.firestore().collection('reports').doc(doc.id).collection('likes').get().then(qss => {
        //   qss.forEach(async msgDoc => {
        //     await _firebase.firestore().collection('reports').doc(doc.id).collection('likes').doc(msgDoc.id).delete();
        //   });
        // });
        await _firebase.firestore().collection('friends').doc(doc.id).delete();
      });
    });
}



////////////////////////////////////////////////////////////////
//                                                            //
//                         P   O   S   T                      //
//                                                            // 
////////////////////////////////////////////////////////////////

export const getPostByIdRequest = async (post_id) => {
  post_id = Number(post_id); // convert into integer
  const postRef = _firebase.firestore().collection('posts').doc(post_id.toString());

  return _firebase.firestore().collection('posts').doc(post_id.toString()).get()
    .then(doc => {
      if (doc.exists) {
        return doc.data();
      } else {
        return false;
      }
    })
    .catch(err => {
      console.log('[Post Fetch]', err);
      return false;
    })
}

export const updatePostRequest = async (post) => {
  const post_id = post.post_id.toString();

  // console.log(post);
  try {
    const postRef = _firebase.firestore().collection('posts').doc(post_id);
    await postRef.set(post); //, { merge: false }
    return {status: true, message: 'Post has been updated'};
  }
  catch (err) {
    console.log(err);
    return {
      status: false, message: 'Something went wrong', details: err.message
    };
  }
}

export const deletePostByIdRequest = async (post_id) => {
  post_id = post_id.toString();

  try {
    const postRef = _firebase.firestore().collection('posts').doc(post_id);

    // delete comments of the post
    await _firebase.firestore().collection('comments').where('type', '==', 'POST').where('target_id', '==', post_id).get().then(qss => {
      qss.forEach(async commentDoc => {
        await _firebase.firestore().collection('comments').doc(commentDoc.id).delete();
      });
    });

    // delete reports of the postRef
    await _firebase.firestore().collection('reports').where('type', '==', 'POST').where('target_id', '==', post_id).get().then(qss => {
      qss.forEach(async reportDoc => {
        await _firebase.firestore().collection('reports').doc(reportDoc.id).delete();
      });
    });

    // delete post
    await postRef.delete();

    return { status: true, message: 'Post has been deleted!' };
  }
  catch (err) {
    console.error(err);
    return { status: false, message: 'Something went wrong!', details: err.message };
  }
}