const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const serviceAccount = require('../trefla-firebase-adminsdk-ic030-de756cf0e9.json');
const { CONFIG_DOC_ID } = require('../constants');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://trefla.firebaseio.com',
//   storageBucket: 'trefla.appspot.com',
// });

exports.sendSingleNotification = async function ({ title, body, token }) {
  const message = {
    // data: { score: '850', time: '2:45' },
    token,
    notification: { title, body },
  };

  return admin.messaging().send(message);
};

exports.sendMultiNotifications = async function ({ title, body, tokens }) {
  const message = {
    tokens,
    notification: { body, title },
  };

  return admin.messaging().sendMulticast(message);
};

exports.SendAllMultiNotifications = async function (messages) {
  return admin.messaging().sendAll(messages);
};

exports.getAllUsers = async function () {
  return admin
    .firestore()
    .collection('users')
    .get()
    .then((querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists) {
          users.push(doc.data());
        }
      });
      return users;
    });
};

const getNewNotificationIdOfUser = async function (user_id) {
  const querySnapshot = await admin
    .firestore()
    .collection('users')
    .doc(user_id.toString())
    .collection('notifications')
    .orderBy('noti_id', 'desc')
    .get();
  let notifications = [];
  querySnapshot.forEach((doc) => {
    if (doc.exists) {
      notifications.push(doc.data());
    }
  });
  return notifications.length === 0 ? 0 : notifications[0].noti_id + 1;
};

const setNotificationToUser = async function (user_id, noti_id, notification) {
  return admin
    .firestore()
    .collection('users')
    .doc(user_id.toString())
    .collection('notifications')
    .doc(noti_id.toString())
    .set(notification);
};

exports.addPostNotificationToUser = async function ({
  user_id,
  sender_id,
  time,
  type,
  optional_val,
}) {
  try {
    const newId = await getNewNotificationIdOfUser(user_id);
    await setNotificationToUser(user_id, newId, {
      noti_id: newId,
      optional_val,
      sender_id,
      time,
      type,
    });
    return true;
  } catch (error) {
    console.log('[Add Notification]', error);
    return false;
  }
};

exports.getNewNotificationIdOfUser = getNewNotificationIdOfUser;
exports.setNotificationToUser = setNotificationToUser;
