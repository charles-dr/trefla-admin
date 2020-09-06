const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const serviceAccount = require('./trefla-firebase-adminsdk-ic030-de756cf0e9.json');

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
  auth: {
    user: 'martinstevanovic000@gmail.com',
    pass: 'blizanac1',
  },
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
  const mailOptions = {
    from: 'martinstevanovic000@gmail.com',
    to: 'alerk.star@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!',
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

exports.api = functions.https.onRequest(app);
