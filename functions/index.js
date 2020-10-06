const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

admin.initializeApp();

const { firestoreExport } = require('node-firestore-import-export');

const serviceAccount = require('./trefla-firebase-adminsdk-ic030-de756cf0e9.json');
const { CONFIG_DOC_ID } = require('./constants');

const {
  convertTimeToString,
  getDistanceFromLatLonInMeter,
  getUserLastLocation,
  string2Coordinate,
} = require('./libs/utils');
const {
  addPostNotificationToUser,
  checkUserLikedComment,
  getAllUsers,
  getNewNotificationIdOfUser,
  getPrimaryCommentsOfPost,
  getRepliesToComment,
  loadPastAroundPosts,
  loadPostPagination,
  SendAllMultiNotifications,
  sendMultiNotifications,
  sendSingleNotification,
  setNotificationToUser,
} = require('./libs/common');
const {
  downloadBackupFile,
  exportCollections,
  getAllRootCollections,
  getBackupDataById,
  getNewBackupId,
  importFirestoreFromFiles,
  uploadAndZipData,
} = require('./libs/backup');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // credential: admin.credential.applicationDefault(),
//   authDomain: 'https://trefla.firebaseapp.com',
//   databaseURL: 'https://trefla.firebaseio.com',
//   storageBucket: 'trefla.appspot.com',
// });

///////////////////// export/import
const appName = 'trefla';
const databaseURL = 'https://trefla.firebaseio.com';

const exportCollection = function (collection_name) {
  return true; //firestoreService.backup(collection_name);
  // .then((data) => {
  //   console.log('[export success]', data);
  //   return data;
  // })
  // .catch((error) => {
  //   console.log('[export error]', error);
  //   return false;
  // });
};
///////////////////// #export/import

const bucket = admin.storage().bucket();

const app = express();

app.use(cors({ origin: true }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  // host: 'smtp.gmail.com',
  // port: 587,
  // secure: false,
  auth: {
    user: 'martinstevanovic000@gmail.com',
    pass: 'blizanac1',
  },
});

function sendMail({ from, to, subject, body }) {
  const mailOptions = {
    from: 'Trefla Support <admin@trefla.com>',
    to: to,
    subject: subject,
    // text: 'That was easy!',
    html: body,
  };

  return transporter.sendMail(mailOptions);
}

function compareCardImage(oldPath, newPath) {
  const oldPathCore = oldPath.substr(0, oldPath.indexOf('&token'));
  const newPathCore = newPath.substr(0, newPath.indexOf('&token'));
  return oldPathCore.trim() === newPathCore.trim();
}

/**
 * @description send email to user A for the consent about ID transfer
 * @params noti_id
 * @return object
 */
app.post('/id-transfer/consent-email', async (req, res) => {
  const params = req.body;
  const noti_id = req.body.noti_id;
  // console.log('noti_id', noti_id);

  // get notification
  const notiDoc = await admin
    .firestore()
    .collection('admin_notifications')
    .doc(noti_id.toString())
    .get();
  if (!notiDoc.exists) {
    res.json({
      status: false,
      message: 'Not found the request for ID transfer!',
    });
  }

  const notification = notiDoc.data();
  // console.log('[notification]', notification);

  // get user infos
  const fromUserDoc = await admin
    .firestore()
    .collection('users')
    .doc(notification.old_user_id.toString())
    .get();
  const toUserDoc = await admin
    .firestore()
    .collection('users')
    .doc(notification.user_id.toString())
    .get();

  if (!fromUserDoc.exists) {
    res.json({
      status: false,
      message: 'Not found the information of old user!',
    });
  }
  if (!toUserDoc.exists) {
    res.json({
      status: false,
      message: 'Not found the information of new user!',
    });
  }

  // get email template
  const emailTemplDoc = await admin
    .firestore()
    .collection('email_templates')
    .doc('verify_consent')
    .get();

  if (!emailTemplDoc.exists) {
    res.json({ status: false, message: 'Not found the email template!' });
  }

  const fromUser = fromUserDoc.data(),
    toUser = toUserDoc.data(),
    emailTempl = emailTemplDoc.data();

  let htmlBody = emailTempl.body
    .replace(new RegExp('%username%', 'g'), fromUser.user_name)
    .replace(new RegExp('%toUser%', 'g'), toUser.user_name)
    .replace(new RegExp('%email%', 'g'), toUser.email);

  // get admin config
  const configDoc = await admin
    .firestore()
    .collection('config')
    .doc(CONFIG_DOC_ID)
    .get();
  if (!configDoc) {
    res.json({
      status: false,
      message: 'Something went wrong with admin configration!',
    });
  }

  const emailSent = await sendMail({
    from: `Trefla Admin <${configDoc.data().admin_email}>`,
    to: fromUser.email,
    subject: emailTempl.subject,
    body: htmlBody,
  })
    .then(async (info) => {
      // update notification as email sent
      let consent_emails = notification.consent_emails || [];
      consent_emails.push(new Date().getTime());
      await admin
        .firestore()
        .collection('admin_notifications')
        .doc(noti_id.toString())
        .set({ consent_emails: consent_emails }, { merge: true });

      return res.json({
        status: true,
        message: 'Email has been sent successfully.',
        response: info.response,
      });
    })
    .catch((error) => {
      return res.json({
        status: false,
        message: 'Something went wrong!',
        error: error,
      });
    });
});

/**
 * @description decide to verify which account.
 * @param verified - object
 * @member from boolean
 * @member to boolean
 * @param noti_id number
 * @return object
 */
app.post('/id-transfer/judge', async (req, res) => {
  try {
    const { noti_id, verified } = req.body;

    // get admin notification data;
    const adminNotiDoc = await admin
      .firestore()
      .collection('admin_notifications')
      .doc(noti_id.toString())
      .get();
    if (!adminNotiDoc.exists) {
      return res.json({ status: false, message: "Data doesn't exist!" });
    }
    const notification = adminNotiDoc.data();

    // two user information
    const fromUserDoc = await admin
      .firestore()
      .collection('users')
      .doc(notification.old_user_id.toString())
      .get();
    const toUserDoc = await admin
      .firestore()
      .collection('users')
      .doc(notification.user_id.toString())
      .get();
    if (!fromUserDoc.exists) {
      return res.json({ status: false, message: "Old user doesn't exist!" });
    }
    if (!toUserDoc.exists) {
      return res.json({ status, message: "New user doesn't exist!" });
    }

    // update user verified status
    await admin
      .firestore()
      .collection('users')
      .doc(notification.old_user_id.toString())
      .set({ verified: verified.from }, { merge: true });
    await admin
      .firestore()
      .collection('users')
      .doc(notification.user_id.toString())
      .set({ verified: verified.to }, { merge: true });

    return res.json({
      status: true,
      message: 'ID Transfer has been processed!',
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, message: error.message });
  }
});

app.post('/comments', async (req, res) => {
  const { post_id, user_id } = req.body;
  console.log('[Req Params]', post_id, user_id);

  const users = await getAllUsers();
  let userMap = {};
  users.map((user) => {
    const {
      location_array,
      device_token,
      location_address,
      ...restData
    } = user;
    return (userMap[user.user_id.toString()] = restData);
  });
  // get primary comments
  getPrimaryCommentsOfPost({ post_id })
    .then((comments) => {
      console.log('primary length', comments.length);
      // return res.json({comments});
      return Promise.all(
        comments.map(async (comment) => {
          // liked
          const liked = await checkUserLikedComment({
            comment_id: comment.comment_id,
            user_id,
          });
          // comments
          const replies = await getRepliesToComment({
            comment_id: comment.comment_id,
            user_id,
          });
          return {
            ...comment,
            liked,
            user: userMap[comment.user_id.toString()],
            comments: replies.map((reply) => ({
              ...reply,
              user: userMap[reply.user_id.toString()],
            })),
          };
        })
      )
        .then((commentList) => {
          return res.json({
            status: true,
            message: 'success',
            count: commentList.length,
            data: commentList,
          });
        })
        .catch((error1) => {
          console.log('[comments] transform', error1.message);
          return res.json({ status: false, message: error1.message });
        });
    })
    .catch((error) => {
      console.log('[primary comments] error ', error.message);
      return res.json({
        status: false,
        message: 'Something went wrong',
        details: error.message,
      });
    });
});

/**
 * @description pagination for posts, filters posts with around radius and location time
 * @param user_id number
 * @param type 'AROUND' | 'ALL'
 * @param last_id number
 * @param limit number
 * @param isMine boolean
 * @param locationIndex number
 */
app.post('/posts', async (req, res) => {
  let { user_id, type, last_id, limit, isMine, locationIndex } = req.body;
  limit = limit || 100;
  last_id = !last_id ? Math.pow(2, 63) - 1 : last_id;

  //const isMine = req.body.isMine !== undefined && req.body.isMine;
  if (type === 'AROUND') {
    loadPastAroundPosts({ user_id, isMine, locationIndex })
      .then((response) => {
        if (!response.status) {
          return res.json(response);
        } else {
          return res.json({
            status: true,
            message: 'success',
            count: response.data.length,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        console.log(error.message);
        res.json({ status: false, message: error.message });
      });
  } else {
    loadPostPagination({ user_id, last_id, limit, isMine })
      .then((posts) => {
        const next_last_id =
          posts.length > 0 ? posts[posts.length - 1].post_id : 0;
        return res.json({
          status: true,
          message: 'success',
          last_id: posts.length > 0 ? posts[posts.length - 1].post_id : 0,
          count: posts.length,
          has_more: next_last_id > 0 && posts.length === limit,
          data: posts,
        });
      })
      .catch((error) => {
        return res.json({ status: false, message: error.message });
      });
  }
});

app.get('/lang/download', async (req, res) => {
  try {
    const langRef = bucket.child('lang/en.jsons');
    langRef
      .getDownloadURL()
      .then((url) => {
        return { status: true, url };
      })
      .catch((err) => {
        return { stauts: false, error: err.message };
      });
  } catch (e) {
    res.json({
      status: false,
      message: e.message,
    });
  }
});

app.post('/notification/single', async (req, res) => {
  const { user_id, title, body } = req.body;

  const userDoc = await admin
    .firestore()
    .collection('users')
    .doc(user_id.toString())
    .get();
  // error when user does not exist
  if (!userDoc.exists) {
    res.json({ status: false, message: 'User does not exist!' });
  }

  const user = userDoc.data();
  // error when user doesn't have user token
  if (!user.device_token) {
    res.json({ status: false, message: 'Not found the device token!' });
  }

  const token = user.device_token;

  sendSingleNotification({ token, body, title })
    .then((response) => {
      return res.json({ status: true, message: 'Notification has been sent!' });
    })
    .catch((error) => {
      return res.json({
        status: false,
        message: 'Failed to send notification',
        details: error,
      });
    });
});

app.post('/notification/bulk', async (req, res) => {
  const { user_ids, title, body } = req.body;
  console.log('[user ids]', user_ids);
  // get user list
  let users = [];
  try {
    const querySnapshot = await admin
      .firestore()
      .collection('users')
      .where('user_id', 'in', user_ids)
      .get();
    querySnapshot.forEach((doc) => {
      if (doc.exists) {
        users.push(doc.data());
      }
    });
  } catch (error) {
    return res.json({ status: false, message: 'Error while getting users' });
  }
  // console.log('[users]', users);

  let tokens = users
    .filter((user) => !!user.device_token)
    .map((user) => user.device_token);
  console.log('[tokens]', tokens);

  return sendMultiNotifications({ tokens, body, title })
    .then((response) => {
      return res.json({
        status: true,
        message: 'Notifications have been sent!',
      });
    })
    .catch((error) => {
      return res.json({
        status: false,
        message: 'Error while sending notifications!',
      });
    });
});

app.post('/firestore/export', async (req, res) => {
  const collectionIds = await getAllRootCollections();

  const exported = await exportCollections(collectionIds);
  const zipped = await uploadAndZipData(exported);
  return res.json({
    status: true,
    data: collectionIds,
    // exported: exported,
    zip: zipped,
  });
});

app.post('/firestore/import', async (req, res) => {
  // get RTDB data
  const row = await getBackupDataById(req.body.id);
  const downloadURL = row.url;
  const fileNames = await downloadBackupFile({
    downloadURL: row.url,
    fileName: row.file,
  });
  const imported = await importFirestoreFromFiles(fileNames);
  res.json({ status: true, row, imported: Object.keys(imported) });
});

app.get('/user', (req, res) => {
  const response = {
    status: true,
    data: 'sdf',
  };
  res.status(200).json(response);
});

app.get('/posts', async (req, res) => {
  const users = await admin
    .firestore()
    .collection('users')
    // .orderBy('name', req.query.dir === 1 ? 'asc' : 'desc')
    // .startAt(Number(req.query.start))

    // .limit(Number(req.query.length))
    .get()
    .then((querySnapshot) => {
      const rows = [];
      querySnapshot.forEach((doc) => {
        // console.log(`${doc.id}`, doc.data());
        rows.push(doc.data());
      });
      return rows;
    });
  res.json(users);
});

app.post('/export/test', async (req, res) => {
  console.log('[collections]', req.body.collection);
  return res.json(req.body);
  // return firestoreExport(admin.firestore().collection(req.body.collection))
  //   .then((data) => {
  //     console.log('[export success]');
  //     return res.json({ data: data });
  //   })
  //   .catch((err) => {
  //     console.log('[export error]', err);
  //     return res.json({ status: false, error: err });
  //   });
  // return res.send(true);
  // console.log('[collection]', req.body.collection);
  // return exportCollection(req.body.collection)
  //   .then((resp) => {
  //     console.log('[export success]');
  //     return res.json({ status: true, data: resp });
  //   })
  //   .catch((error) => {
  //     console.log('[export error]', error);
  //     return res.json({ status: false });
  //   });
});

app.post('/export/test1', async (req, res) => {
  return firestoreExport(admin.firestore().collection(req.body.collection))
    .then((data) => {
      console.log('[export success]');
      return res.json({ data: data });
    })
    .catch((err) => {
      console.log('[export error]', err);
      return res.json({ status: false, error: err });
    });
});

app.get('/rtdb-test/set', async (req, res) => {
  console.log(admin.database().ref().child('backups').push().key);
  const $now = new Date().toDateString();
  const $time = new Date().getTime();
  await admin
    .database()
    .ref('backups/0')
    .set({
      time: $time,
      file: 'backup-' + $now + '.zip',
    });

  return res.json({ status: true });
});

app.get('/rtdb/new-id', async (req, res) => {
  const newId = await getNewBackupId();
  res.json({ newId });
});

app.get('/noti-test', async (req, res) => {
  const regToken =
    'f84sBPLGQyCmBM4oCbqdCZ:APA91bFQ2STlhY3qime63poqVumRTuIEr2eolSoxGLklVLE8djSQ2KPKaSmIbs_wFfEgg9Xj8MQJk2TfscVZl_3gGydkCLnYNAtEvCtSfqYEDwQdr19ML2X8LzuRMDGXcQ6oxBL-Pnwf';
  const message = {
    // data: { score: '850', time: '2:45' },
    token: regToken,
    notification: {
      title: 'Noti Test',
      body: 'Hello Crash Tester xD!',
    },
  };

  admin
    .messaging()
    .sendAll([message])
    .then((response) => {
      console.log('Successfully sent message', response);
      return res.json({ status: true, data: response });
    })
    .catch((error) => {
      console.log('Error send message:', error);
      return res.json({ status: false, error: error });
    });
});

app.get('/email-test', async (req, res) => {
  // refer: https://github.com/firebase/functions-samples/blob/master/quickstarts/email-users/functions/index.js
  const mailOptions = {
    from: 'Trefla Support <admin@trefla.com>',
    to: 'alerk.star@gmail.com',
    subject: 'Sending Email using Node.js',
    // text: 'That was easy!',
    html: '<h1>Hi Martin</h1> what are you doing?',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.json({
        status: false,
        error,
      });
    } else {
      console.log(`Email sent: ${info.response}`);
      res.json({
        status: true,
        info: info.response,
      });
    }
  });
});

app.get('/test', async (req, res) => {
  console.log('Hey');
  // await functions.firestore.collection('admin_notifications').doc('111').set({name: 'hello'});
  await admin
    .firestore()
    .collection('admin_notifications')
    .add({ name: new Date().getTime().toString() });
  res.json({ status: true });
});

exports.api = functions.https.onRequest(app);

exports.createNotification = functions.firestore
  .document('admin_notifications/{notiId}')
  .onCreate(async (snap, context) => {
    const notiId = context.params.notiId;
    const data = snap.data();
    // console.log('[New noti detected]', notiId);
    // console.log('[data]', data);

    // get admin email
    const configDoc = await admin
      .firestore()
      .collection('config')
      .doc('ZYvvzsj8CMffIcHhY689')
      .get();
    if (!configDoc.exists) {
      return false;
    }

    // console.log('[config]', configDoc.data());
    const admin_email = configDoc.data().admin_email;

    // get admin info
    const adminDoc = await admin.firestore().collection('admin').doc('0').get();

    let subject = '';
    let htmlBody = '';
    const time = new Date().toUTCString();
    // get email templates
    if (data.type === '11') {
      const templDoc = await admin
        .firestore()
        .collection('email_templates')
        .doc('verify_id')
        .get();
      if (!templDoc.exists) {
        // default subject & body
        subject = 'ID Verification Request';
        htmlBody = `Hi Admin. <br/>
        New ID verification request. <br/>
        Name: %username% <br/>
        Email: %email% <br/>
        Time: %time% <br/>
        `;
      } else {
        subject = templDoc.data().subject;
        htmlBody = templDoc.data().body;
      }
      // get user information
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(data.user_id.toString())
        .get();

      htmlBody = htmlBody
        .replace(new RegExp('%AdminName%', 'g'), adminDoc.data().name)
        .replace(
          new RegExp('%username%', 'g'),
          userDoc.exists ? userDoc.data().user_name : '<No USER>'
        )
        .replace(
          new RegExp('%email%', 'g'),
          userDoc.exists ? userDoc.data().email : '<No EMAIL>'
        )
        .replace(new RegExp('%time%', 'g'), time);
    } else if (data.type === '12') {
      const templDoc = await admin
        .firestore()
        .collection('email_templates')
        .doc('verify_transfer')
        .get();
      if (!templDoc.exists) {
        (subject = 'ID Verification Transfer Request'),
          (htmlBody = `Hi Admin. <br/>
        ID verification transfer requested. <br/>
        From: %fromUser% <br/>
        to: %toUser% <br/>
        time: %time% </br/>
      `);
      } else {
        subject = templDoc.data().subject;
        htmlBody = templDoc.data().body;
      }
      // get users' information
      const fromUserDoc = await admin
        .firestore()
        .collection('users')
        .doc(data.old_user_id.toString())
        .get();
      const toUserDoc = await admin
        .firestore()
        .collection('users')
        .doc(data.user_id.toString())
        .get();

      htmlBody = htmlBody
        .replace(new RegExp('%AdminName%', 'g'), adminDoc.data().name)
        .replace(
          new RegExp('%fromUser%', 'g'),
          `${fromUserDoc.data().user_name} (${fromUserDoc.data().email})`
        )
        .replace(
          new RegExp('%toUser%', 'g'),
          `${toUserDoc.data().user_name} (${toUserDoc.data().email})`
        )
        .replace(new RegExp('%time%', 'g'), time);
    } else {
      return false;
    }

    const mailSent = await sendMail({
      from: 'Trefla <admin@trefla.com>',
      to: admin_email,
      subject: subject,
      body: htmlBody,
    });
    return mailSent;
  });

exports.updateID = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const notiId = context.params.userId;
    const newData = change.after.data();
    const oldData = change.before.data();
    console.log('[user ID]', notiId);
    console.log('[new ID]', newData.card_number);
    console.log('[old ID]', oldData.card_number);

    if (
      newData.card_number.trim() === oldData.card_number.trim() &&
      compareCardImage(newData.card_img_url || '', oldData.card_img_url || '')
    ) {
      return false;
    }

    // get admin email
    const configDoc = await admin
      .firestore()
      .collection('config')
      .doc(CONFIG_DOC_ID)
      .get();
    if (!configDoc.exists) {
      return false;
    }

    const adminEmail = configDoc.data().admin_email;

    // get admin info
    const adminDoc = await admin.firestore().collection('admin').doc('0').get();

    // load template
    const templDoc = await admin
      .firestore()
      .collection('email_templates')
      .doc('id_change')
      .get();

    if (!templDoc.exists) {
      return false;
    }

    // make image element
    let oldImg = '',
      newImg = '';

    let template = templDoc
      .data()
      .body.replace(new RegExp('%AdminName%', 'g'), adminDoc.data().name)
      .replace(new RegExp('%Username%', 'g'), newData.user_name)
      .replace(new RegExp('%newCardNum%', 'g'), newData.card_number)
      .replace(new RegExp('%oldCardNum%', 'g'), oldData.card_number);

    if (oldData.card_img_url) {
      const oldImg = `<a href="${oldData.card_img_url}" target="_blank"><img src="${oldData.card_img_url}" style="width: 250px;" alt="Old ID Photo" /><a>`;
      template = template.replace(new RegExp('%oldCardImg%', 'g'), oldImg);
    } else {
      template = template.replace(new RegExp('%oldCardImg%', 'g'), '');
    }
    if (newData.card_img_url) {
      const newImg = `<a href="${newData.card_img_url}" target="_blank"><img src="${newData.card_img_url}" style="width: 250px;" alt="New ID Photo" /><a>`;
      template = template.replace(new RegExp('%newCardImg%', 'g'), newImg);
    } else {
      template = template.replace(new RegExp('%newCardImg%', 'g'), '');
    }

    const mailSent = await sendMail({
      from: 'Trefla <admin@trefla.com>',
      to: adminEmail,
      subject: templDoc.data().subject,
      body: template,
    });

    // insert notification document
    const adminNoti = await admin
      .firestore()
      .collection('admin_notifications')
      .orderBy('noti_id', 'desc')
      .limit(1)
      .get()
      .then((querySnapshot) => {
        const rows = [];
        querySnapshot.forEach((doc) => {
          // console.log(`${doc.id}`, doc.data());
          rows.push(doc.data());
        });
        return rows;
      });

    console.log('adminNoti', adminNoti);

    let newAdminNotiId = 0;
    if (adminNoti.length && adminNoti.length > 0) {
      newAdminNotiId = adminNoti[0].noti_id + 1;
    }
    console.log('[newAdminNotiId]', newAdminNotiId);

    admin
      .firestore()
      .collection('admin_notifications')
      .doc(newAdminNotiId.toString())
      .set({
        type: '13',
        noti_id: newAdminNotiId,
        old: oldData,
        new: newData,
      });

    return mailSent;
  });

exports.createPost = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const postId = context.params.postId;
    const newData = snap.data();

    console.log('============== post created ===:', postId);

    // post user
    const postUserDoc = await admin
      .firestore()
      .collection('users')
      .doc(newData.post_user_id.toString())
      .get();

    const postLocation = string2Coordinate(newData.location_coordinate);

    // get all users
    const allUsers = await getAllUsers();

    // const distances = allUsers.map((user) =>
    //   getDistanceFromLatLonInMeter(postLocation, getUserLastLocation(user))
    // );
    // console.log('[distances]', distances);

    let messages = [];
    let nearByUsers = [];

    for (let user of allUsers) {
      if (user.user_id === newData.post_user_id) continue;

      const distance = getDistanceFromLatLonInMeter(
        postLocation,
        getUserLastLocation(user)
      );
      const radius = user.raidusAround || 100;
      if (radius < distance) {
        continue;
      }

      nearByUsers.push(user);
      const userName = postUserDoc.data().user_name;
      const notiContent =
        user.language !== undefined && user.language === 'Romanian'
          ? `${userName} a creat o nouă postare.`
          : `${userName} created a new post.`;
      messages.push({
        token: user.device_token,
        notification: {
          title: 'Trefla',
          body: notiContent,
        },
      });

      addPostNotificationToUser({
        user_id: user.user_id,
        sender_id: newData.post_user_id,
        time: convertTimeToString(),
        type: 0,
        optional_val: Number(postId),
      })
        .then((inserted) => {
          return console.log('[add noti]', user.user_id, inserted);
        })
        .catch((error) => {
          return console.log('[add noti]', error);
        });
    }

    console.log(
      '[user_ids]',
      nearByUsers.map((user) => ({
        id: user.user_id,
        radius: user.raidusAround || 100,
        r: getDistanceFromLatLonInMeter(
          postLocation,
          getUserLastLocation(user)
        ),
      }))
    );
    // console.log('[messages]', messages);
    const msgsWithToken = messages.filter((msg) => !!msg.token);
    if (msgsWithToken.length > 0) {
      const notiSent = await SendAllMultiNotifications(
        messages.filter((msg) => !!msg.token)
      );
    }
    return true;
  });

exports.updatePost = functions.firestore
  .document('posts/{postId}')
  .onUpdate(async (change, context) => {
    const postId = context.params.postId;
    const newData = change.after.data();
    // const oldData = change.before.data();

    console.log('============== post updated ===:', postId);

    // post user
    const postUserDoc = await admin
      .firestore()
      .collection('users')
      .doc(newData.post_user_id.toString())
      .get();

    const postLocation = string2Coordinate(newData.location_coordinate);

    // get all users
    const allUsers = await getAllUsers();

    const distances = allUsers.map((user) =>
      getDistanceFromLatLonInMeter(postLocation, getUserLastLocation(user))
    );
    // console.log('[distances]', distances);

    let messages = [];
    let nearByUsers = [];

    for (let user of allUsers) {
      if (user.user_id === newData.post_user_id) continue;

      const distance = getDistanceFromLatLonInMeter(
        postLocation,
        getUserLastLocation(user)
      );
      const radius = user.raidusAround || 100;
      if (radius < distance) {
        continue;
      }

      nearByUsers.push(user);
      const userName = postUserDoc.data().user_name;
      const notiContent =
        user.language !== undefined && user.language === 'Romanian'
          ? `${userName} și-a actualizat postarea.`
          : `${userName} updated his post.`;
      messages.push({
        token: user.device_token,
        notification: {
          title: 'Trefla',
          body: notiContent,
        },
      });

      addPostNotificationToUser({
        user_id: user.user_id,
        sender_id: newData.post_user_id,
        time: convertTimeToString(),
        type: 1,
        optional_val: Number(postId),
      })
        .then((inserted) => {
          return console.log('[add noti]', user.user_id, inserted);
        })
        .catch((error) => {
          return console.log('[add noti]', error);
        });
    }

    console.log(
      '[user_ids]',
      nearByUsers.map((user) => ({
        id: user.user_id,
        radius: user.raidusAround || 100,
        r: getDistanceFromLatLonInMeter(
          postLocation,
          getUserLastLocation(user)
        ),
      }))
    );
    // console.log('[messages]', messages);

    const notiSent = await SendAllMultiNotifications(
      messages.filter((msg) => !!msg.token)
    );
    return true;
  });

exports.forgotPasswordRequests = functions.firestore
  .document('forgot_password/{fpId}')
  .onCreate(async (snap, context) => {
    // .onUpdate(async (change, context) => {
    console.log('===================== Forgot Password ---->');
    const fpId = context.params.fpId;
    const fpRequest = snap.data();
    // const fpId = context.params.fpId;
    // const fpRequest = change.after.data();

    // get admin email
    const configDoc = await admin
      .firestore()
      .collection('config')
      .doc('ZYvvzsj8CMffIcHhY689')
      .get();
    if (!configDoc.exists) {
      console.log('[config doc not found]');
      return false;
    }
    // forgot password record
    const fpDoc = await admin
      .firestore()
      .collection('forgot_password')
      .doc(fpId.toString())
      .get();
    if (!fpDoc.exists) {
      console.log('[Forgot password request not found!]');
      return { error: 'Forgot password request not found!' };
    }
    const fpData = fpDoc.data();
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(fpData.user_id.toString())
      .get();
    if (!userDoc.exists) {
      console.log('[User info not found!]');
      return { error: 'User info not found!' };
    }
    const userData = userDoc.data();

    if (userData.email !== fpData.email) {
      console.log('[Email does not match!]', userData.email, fpData.email);
      return { error: 'Email does not match!' };
    }

    // load email template
    const emailTempDoc = await admin
      .firestore()
      .collection('email_templates')
      .doc('forgot_password')
      .get();
    if (!emailTempDoc.exists) {
      console.log('email template not found!');
      return { error: 'Email template not found!' };
    }
    const emailTempData = emailTempDoc.data();
    const emailContent = emailTempData.body
      .replace(new RegExp('%Username%'), userData.user_name)
      .replace(new RegExp('%code%'), fpData.code);
    console.log(emailTempData.subject, emailContent, fpData.email);
    const mailSent = await sendMail({
      from: 'Trefla <admin@trefla.com>',
      to: fpData.email,
      subject: emailTempData.subject,
      body: emailContent,
    });

    return mailSent;
  });
