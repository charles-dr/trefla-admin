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

exports.api = functions.https.onRequest(app);
