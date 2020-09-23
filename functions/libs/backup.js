const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const {
  firestoreExport,
  firestoreImport,
} = require('node-firestore-import-export');
const path = require('path');
const os = require('os');
const fs = require('fs');
const archiver = require('archiver');
const unzipper = require('unzipper');
const UUID = require('uuid-v4');

const fbId = 'trefla';
const fbKeyFile = '../trefla-firebase-adminsdk-ic030-de756cf0e9.json';

// const gcs = require('@google-cloud/storage')({keyFilename: fbKeyFile});
// const bucketSign = gcs.bucket(`${fbId}.appspot.com`);

const { getDateSeed } = require('./utils');

const bucket = admin.storage().bucket();

const downloadBackupFile = async ({ downloadURL, fileName }) => {
  console.log('[download backup file]', fileName);
  return new Promise(async (resolve, reject) => {
    const remoteFile = bucket.file(`backups/${fileName}`);

    const fileNames = [];

    await remoteFile
      .createReadStream()
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        // console.log('[Parse]', entry.path);
        const itemName = entry.path;
        const type = entry.type; // 'Directory' or 'File'

        if (itemName.includes('.json')) {
          const extractFilePath = path.join(os.tmpdir(), itemName);
          entry.pipe(fs.createWriteStream(extractFilePath));
          fileNames.push(itemName);
        } else {
          entry.autodrain();
        }
      })
      .promise()
      .then(() => {
        console.log('[Extract finished] success');
        return resolve(fileNames);
      }),
      (e) => {
        console.log('[Extract finished] error', e);
        return reject(e);
      };
  });
};

const getAllRootCollections = async () => {
  const collections = await admin.firestore().listCollections();
  const collectionIds = collections.map((collection) => collection.id);
  return collectionIds;
};

const importFirestoreFromFiles = async (fileNames) => {
  let datas = {};
  await Promise.all(
    fileNames.map(async (fileName) => {
      const tempFile = path.join(os.tmpdir(), fileName);
      const strData = fs.readFileSync(tempFile);
      //console.log(strData);
      const collectionName = fileName.replace('.json', '');
      datas[collectionName] = JSON.parse(strData);
      await firestoreImport(
        JSON.parse(strData),
        admin.firestore().collection(collectionName)
      );
      return fs.unlinkSync(tempFile);
    })
  );
  return datas;
};

const exportCollections = async (collectionNames) => {
  let data = {};
  await Promise.all(
    collectionNames.map((collectionName) => {
      return firestoreExport(admin.firestore().collection(collectionName))
        .then((collectionData) => {
          return (data[collectionName] = collectionData);
        })
        .catch((err) => err);
    })
  );
  return data;
};

const uploadAndZipData = async (data) => {
  return new Promise((resolve, reject) => {
    const dateSeed = getDateSeed(new Date());
    const zipFileName = `backup-${dateSeed}.zip`;
    const tempZipFilePath = path.join(os.tmpdir(), zipFileName);
    const output = fs.createWriteStream(tempZipFilePath);

    const archive = archiver('zip');

    output.on('close', async () => {
      // console.log(archive.pointer() + ' total bytes');

      const newPath = path.join(path.dirname(tempZipFilePath), zipFileName);
      const uuid = UUID();
      const uploaded = await bucket.upload(tempZipFilePath, {
        destination: `backups/${zipFileName}`,
        metadata: {
          contentType: 'application/zip',
          // predefinedAcl: 'publicRead',
          metadata: { firebaseStorageDownloadTokens: uuid },
        },
      });
      const downloadURL =
        'https://firebasestorage.googleapis.com/v0/b/' +
        bucket.name +
        '/o/' +
        encodeURIComponent(uploaded[0].name) +
        '?alt=media&token=' +
        uuid;
      await fs.unlinkSync(tempZipFilePath);
      // save to RTDB
      const newBkId = await getNewBackupId();
      console.log('[New Id]', newBkId);

      await admin
        .database()
        .ref(`backups/${newBkId.toString()}`)
        .set({
          id: newBkId,
          note: '',
          file: zipFileName,
          url: downloadURL,
          time: Math.floor(new Date().getTime() / 1000),
        });
      resolve({ total: archive.pointer(), name: zipFileName });
    });

    archive.on('error', (err) => {
      console.log('[archive] error', err);
      reject(err);
    });

    archive.pipe(output);

    for (let collectionName in data) {
      const buffer = Buffer.from(JSON.stringify(data[collectionName]));
      archive.append(buffer, { name: `${collectionName}.json` });
    }
    archive.finalize();
  });
};

const getBackupDataById = async (id) => {
  return new Promise((resolve) => {
    admin
      .database()
      .ref('backups')
      .child(id.toString())
      .once('value', (snapshot) => {
        resolve(snapshot.val());
      });
  });
};

const getNewBackupId = async function () {
  return new Promise((resolve) => {
    admin
      .database()
      .ref('backups')
      .orderByChild('id')
      .limitToLast(1)
      .once('value', (snapshot) => {
        let bkArray = [];
        snapshot.forEach((data) => {
          bkArray.push(data.val());
        });
        if (bkArray.length === 0) {
          resolve(0);
        } else {
          resolve(Number(bkArray[0].id) + 1);
        }
      });
  });
};

exports.downloadBackupFile = downloadBackupFile;
exports.exportCollections = exportCollections;
exports.getAllRootCollections = getAllRootCollections;
exports.getBackupDataById = getBackupDataById;
exports.getNewBackupId = getNewBackupId;
exports.importFirestoreFromFiles = importFirestoreFromFiles;
exports.uploadAndZipData = uploadAndZipData;
