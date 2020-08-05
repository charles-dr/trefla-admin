const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');

admin.initializeApp();

// Using existing Express apps

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));

app.get('/user', (req, res) => {
    res.status(200).json({
        status: true,
        data: "sdf"
    });
});


exports.api = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   response.send('Hello from Firebase!');
// });
