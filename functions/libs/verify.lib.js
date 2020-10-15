const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const serviceAccount = require('../trefla-firebase-adminsdk-ic030-de756cf0e9.json');
const { CONFIG_DOC_ID } = require('../constants');
// const { checkPostLocationWithUser } = require('./utils');

const verifyHealth = () => {
  return 'I am good';
};

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
    .then((chatRooms) => {
      const count = chatRooms.reduce(
        (total, room) => total + room.unread_nums[1],
        0
      );
      return {
        status: true,
        message: 'success',
        count,
      };
    })
    .catch((error) => {
      console.log('[ID unread msg]', error.message);
      return {
        status: false,
        count: 0,
        message: error.message,
      };
    });
};

/**
 * @name checkIDCardVerified
 * @description check if ID card is verified or not
 * @param {String} cardNum
 * @return {Object}
 */

const checkIDCardVerified = async (cardNum) => {
  return admin
    .firestore()
    .collection('users')
    .where('card_number', '==', cardNum)
    .where('card_verified', '==', 1)
    .get()
    .then((querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists) {
          users.push(doc.data());
        }
      });
      return users;
    })
    .then((users) => {
      return users.length && users.length === 1 ? true : false;
    })
    .catch((error) => {
      console.log('[Check Verified]', error.message);
      return false;
    });
};

/**
 * @name unverifyAllIDs
 * @description unverify all IDs, usecases: ID transfer,
 * @param {String} cardNum
 * @return {Object}
 */
const unverifyAcountByCardNumber = async (cardNum) => {
  admin
    .firestore()
    .collection('users')
    .where('card_number', '==', cardNum)
    .get()
    .then((querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists) {
          users.push(doc.data());
        }
      });
      return users;
    })
    .then((users) =>
      // card_verified -> 0
      // for verified user, chat room: card_number: delete or null
      Promise.all(users.map((user) => unverifySingleUser(user)))
    )
    .then((result) => {
      console.log('[unverify result]', result.length);
      return { status: true, message: 'success', result };
    })
    .catch((error) => {
      console.log('[Unverify All]', error.message);
      return { status: false, message: error.message };
    });
};

const unverifySingleUser = async (user) => {
  await admin
    .firestore()
    .collection('users')
    .doc(user.user_id.toString())
    .update({
      card_verified: 0,
    });

  // if verified user, process chat room
  // - delete card number from chat room(or -> "")
  // - delete field: isForCard( or -> false)
  if (false || user.card_verified === 1) {
    return getIDChatroomToUser(user.user_id)
      .then((chatrooms) =>
        Promise.all(
          chatrooms.map((chatroom) => {
            return admin
              .firestore()
              .collection('chats')
              .doc(chatroom.chat_room_id.toString())
              .update({
                isForCard: admin.firestore.FieldValue.delete(),
                card_number: admin.firestore.FieldValue.delete(),
              });
          })
        )
      )
      .then((deletes) => true)
      .catch((error) => {
        console.log('[Unverify Single User]', error.message);
        return false;
      });
  } else {
    return true;
  }
};

const getIDChatroomToUser = async (user_id) => {
  return admin
    .firestore()
    .collection('chats')
    .where('isForCard', '==', true)
    .where('user_ids', 'array-contains', user_id)
    .get()
    .then((querySnapshot) => {
      let chatrooms = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists && doc.data().user_ids[1] === user_id) {
          // user should be the recevier only
          chatrooms.push(doc.data());
        }
      });
      return chatrooms;
    })
    .catch((error) => {
      console.log('[Chat Rooms to User]', error.message);
      return [];
    });
};

/**
 * @name verifyUserById
 * @param {Number} user_id
 * @return {Object}
 */
const verifyUserById = async (user_id) => {
  // change user.card_verified -> true
  // process chat rooms to card number
  //  - add the receiver user id
  //  - update the message subcollection to the verified user

  // unverify other accounts with same card number

  return admin
    .firestore()
    .collection('users')
    .doc(user_id.toString())
    .get()
    .then((doc) => doc.data())
    .then((user) => {
      if (!user.card_number) {
        throw Object.assign(
          new Error("User doesn't have a valid card number!"),
          { code: 400 }
        );
      }
      return Promise.all([
        admin
          .firestore()
          .collection('users')
          .where('card_number', '==', user.card_number)
          .get(),
        admin
          .firestore()
          .collection('chats')
          .where('isForCard', '==', true)
          .where('card_number', '==', user.card_number)
          .get(),
      ]);
    })
    .then(([snap1, snap2]) => {
      let allIDUsers = [];
      snap1.forEach((doc) => {
        if (doc.exists) allIDUsers.push(doc.data());
      });
      let chatrooms = [];
      snap2.forEach((doc) => {
        if (doc.exists) chatrooms.push(doc.data());
      });
      return [allIDUsers, chatrooms];
    })
    .then(([allIDUsers, chatrooms]) =>
      Promise.all([
        manageVerificationStatusOfUsers(allIDUsers, user_id),
        processChatroomToCard(chatrooms, user_id),
      ])
    )
    .then(([verified, chatroomProcessed]) => {
      return {
        status: true,
        message: 'success',
        verified: verified,
        chatrooms: chatroomProcessed,
      };
    })
    .catch((error) => {
      console.log('[verify user]', error.message || error);
      return { status: false, message: error.message || error };
    });
};

/**
 * @name manageVerificationStatusOfUsers
 * @description verify only user with user_id, and unverify all other users.
 * @param {object array} users
 * @param {number} user
 * @return {boolean}
 */
const manageVerificationStatusOfUsers = async (users, user_id) => {
  return Promise.all(
    users.map((user) => {
      return admin
        .firestore()
        .collection('users')
        .doc(user.user_id.toString())
        .update({
          card_verified: user.user_id === user_id ? 1 : 0,
          // card_number: user.user_id === user_id ? user.card_number : admin.firestore.FieldValue.delete()
        })
        .then(() => true)
        .catch((error) => false);
    })
  );
};

/**
 * @name processChatroomToCard
 * @description add the new verified user to the chat room, and add the last message and last time. and lastMsgIdOnTransfer, isCardTransfered if transfer(more than 2 users exist already)
 */
const processChatroomToCard = async (chatrooms, user_id) => {
  return Promise.all(
    chatrooms.map(async (chatroom) => {
      const isTransfer = chatroom.user_ids.length > 1;

      let updateData = {};
      if (!isTransfer) {
        updateData = {
          user_ids: [chatroom.user_ids[0], user_id],
        };
      } else if (chatroom.user_ids[chatroom.user_ids.length - 1] !== user_id) {
        // user must be different from prev verified user!
        // last message
        const lastMsg = await lastMessageOfChatRoom(chatroom.chat_room_id); // should exist surely on transfer
        updateData = {
          user_ids: [...chatroom.user_ids, user_id],
          isTransfered: true,
          lastMsgIdOnTransfer: chatroom.lastMsgIdOnTransfer
            ? [...chatroom.lastMsgIdOnTransfer, lastMsg.msg_id]
            : [lastMsg.msg_id],
          last_message_time:
            typeof chatroom.last_message_time === 'string'
              ? [chatroom.last_message_time, lastMsg.time]
              : [...chatroom.last_message_time, lastMsg.time],
          last_message:
            typeof chatroom.last_message === 'string'
              ? [chatroom.last_message, lastMsg.message]
              : [...chatroom.last_message, lastMsg.message],
        };
      } else {
        updateData = {
          card_number: chatroom.card_number,
        };
      }
      return admin
        .firestore()
        .collection('chats')
        .doc(chatroom.chat_room_id.toString())
        .update(updateData)
        .then(() => true)
        .catch((error) => false);
    })
  );
};

const lastMessageOfChatRoom = async (chat_id) => {
  return admin
    .firestore()
    .collection('chats')
    .doc(chat_id.toString())
    .collection('messages')
    .orderBy('msg_id', 'desc')
    .limit(1)
    .get()
    .then((querySnapshot) => {
      let messages = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists) messages.push(doc.data());
      });
      return messages;
    })
    .then((messages) => (messages.length > 0 ? messages[0] : false))
    .catch((error) => false);
};

module.exports = {
  checkIDCardVerified,
  getUnreadMsgCountToID,
  unverifyAcountByCardNumber,
  unverifySingleUser,
  verifyHealth,
  verifyUserById,
};
