const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const serviceAccount = require('../trefla-firebase-adminsdk-ic030-de756cf0e9.json');
const { CONFIG_DOC_ID } = require('../constants');
// const { checkPostLocationWithUser } = require('./utils');

const verifyHealth = () => {
    return "I am good";
}

/**
 * @name getUnreadMsgCountToID
 * @description returns the unread message count to the ID card.
 * @param {String} cardNum 
 * @return {object}
 */
const getUnreadMsgCountToID = async (cardNum) => {
    return admin
    .firestore()
    .collection('chats')
    .where('isForCard', '==', true)
    .where('card_number', '==', cardNum.toString())
    .get()
    .then((querySnapshot) => {
      let chats = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists) {
          chats.push(doc.data());
        }
      });
      return chats;
    })
    .then(chatRooms => {
        const count = chatRooms.reduce((total, room) => total + room.unread_nums[1], 0);
        return {
            status: true,
            message: 'success',
            count
        };
    })
    .catch(error => {
        console.log('[ID unread msg]', error.message);
        return {
            status: false,
            count: 0,
            message: error.message
        };
    });
}

module.exports = {
    getUnreadMsgCountToID,
    verifyHealth
};
