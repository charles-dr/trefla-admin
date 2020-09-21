const firestoreService = require('firestore-export-import');
const serviceAccount = require('../trefla-firebase-adminsdk-ic030-de756cf0e9.json');

const appName = 'trefla';
const databaseURL = 'https://trefla.firebaseio.com';
firestoreService.initializeApp(serviceAccount, databaseURL, appName);

const exportCollection = function (collection_name) {
  return firestoreService
    .backup(collection_name)
    .then((data) => {
      console.log('[export success]', data);
      return data;
    })
    .catch((error) => {
      console.log('[export error]', error);
      return false;
    });
};

exports.exportCollection = exportCollection;
