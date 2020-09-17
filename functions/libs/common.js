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
