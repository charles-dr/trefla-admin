const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();

const app = express();

app.use(cors({ origin: true }));

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
    .orderBy('name', req.query.dir == 1 ? 'asc' : 'desc')
    .startAt(Number(req.query.start))

    .limit(Number(req.query.length))
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

exports.api = functions.https.onRequest(app);
