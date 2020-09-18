const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const serviceAccount = require('./trefla-firebase-adminsdk-ic030-de756cf0e9.json');
const { CONFIG_DOC_ID } = require('./constants');

const {
  getDistanceFromLatLonInMeter,
  getUserLastLocation,
  string2Coordinate,
} = require('./libs/utils');
const {
  getAllUsers,
  sendMultiNotifications,
  sendSingleNotification,
} = require('./libs/common');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // credential: admin.credential.applicationDefault(),
  databaseURL: 'https://trefla.firebaseio.com',
  storageBucket: 'trefla.appspot.com',
});

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
    .send(message)
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
    console.log('[New noti detected]', notiId);
    console.log('[data]', data);

    // get admin email
    const configDoc = await admin
      .firestore()
      .collection('config')
      .doc('ZYvvzsj8CMffIcHhY689')
      .get();
    if (!configDoc.exists) {
      return false;
    }

    console.log('[config]', configDoc.data());
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
        .replace(new RegExp('%username%', 'g'), userDoc.data().user_name)
        .replace(new RegExp('%email%', 'g'), userDoc.data().email)
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

exports.updatePost = functions.firestore
  .document('posts/{postId}')
  .onUpdate(async (change, context) => {
    const postId = context.params.postId;
    const newData = change.after.data();
    const oldData = change.before.data();

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

    const nearByUsers = allUsers.filter(
      (user) =>
        getDistanceFromLatLonInMeter(postLocation, getUserLastLocation(user)) <=
        user.raidusAround || 100
    );

    const filter_users = nearByUsers.map((user) => user.user_id);
    console.log('[user_ids]', filter_users);
    return true;
  });
