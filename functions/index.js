const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const serviceAccount = require('./trefla-firebase-adminsdk-ic030-de756cf0e9.json');
const { CONFIG_DOC_ID } = require('./constants');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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

// functions.firestore.document('admin_notifications/{notiId}')
// .onWrite((change, context) => {
//   console.log(context.params, change.after.data());
// });

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

/**
 * @function send email to user A for the consent about ID transfer
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
    .then((info) => {
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
        .replace(new RegExp('%fromUser%', 'g'), fromUserDoc.data().user_name)
        .replace(new RegExp('%toUser%', 'g'), toUserDoc.data().user_name)
        .replace(new RegExp('%time%', 'g'), time);
    }

    const mailSent = await sendMail({
      from: 'Trefla <admin@trefla.com>',
      to: admin_email,
      subject: subject,
      body: htmlBody,
    });
    return mailSent;
  });
