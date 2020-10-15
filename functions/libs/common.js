const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const serviceAccount = require('../trefla-firebase-adminsdk-ic030-de756cf0e9.json');
const { CONFIG_DOC_ID } = require('../constants');
const { checkPostLocationWithUser } = require('./utils');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://trefla.firebaseio.com',
//   storageBucket: 'trefla.appspot.com',
// });

exports.sendSingleNotification = async function ({ title, body, token }) {
  const message = {
    // data: { score: '850', time: '2:45' },
    token,
    notification: { title, body },
  };

  return admin.messaging().send(message);
};

exports.sendMultiNotifications = async function ({ title, body, tokens }) {
  const message = {
    tokens,
    notification: { body, title },
  };

  return admin.messaging().sendMulticast(message);
};

exports.SendAllMultiNotifications = async function (messages) {
  return admin.messaging().sendAll(messages);
};

const getAllUsers = async function () {
  return admin
    .firestore()
    .collection('users')
    .get()
    .then((querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists) {
          users.push(doc.data());
        }
      });
      return users;
    });
};

const getUserById = async function (user_id) {
  return admin.firestore().collection('users').doc(user_id.toString()).get();
};

const getNewNotificationIdOfUser = async function (user_id) {
  const querySnapshot = await admin
    .firestore()
    .collection('users')
    .doc(user_id.toString())
    .collection('notifications')
    .orderBy('noti_id', 'desc')
    .get();
  let notifications = [];
  querySnapshot.forEach((doc) => {
    if (doc.exists) {
      notifications.push(doc.data());
    }
  });
  return notifications.length === 0 ? 0 : notifications[0].noti_id + 1;
};

const setNotificationToUser = async function (user_id, noti_id, notification) {
  return admin
    .firestore()
    .collection('users')
    .doc(user_id.toString())
    .collection('notifications')
    .doc(noti_id.toString())
    .set(notification);
};

exports.addPostNotificationToUser = async function ({
  user_id,
  sender_id,
  time,
  type,
  optional_val,
}) {
  try {
    const newId = await getNewNotificationIdOfUser(user_id);
    await setNotificationToUser(user_id, newId, {
      noti_id: newId,
      optional_val,
      sender_id,
      time,
      type,
    });
    return true;
  } catch (error) {
    console.log('[Add Notification]', error);
    return false;
  }
};

const loadConfiguration = async function () {
  const configDoc = await admin
    .firestore()
    .collection('config')
    .doc(CONFIG_DOC_ID)
    .get();
  if (!configDoc.exists) {
    return false;
  } else {
    return configDoc.data();
  }
};

const loadAllAroundPosts = async function () {
  return (
    admin
      .firestore()
      .collection('posts')
      .where('active', '==', 1)
      // .orderBy('post_id', 'desc')
      .get()
      .then((qsh) => {
        let posts = [];
        qsh.forEach((doc) => {
          if (doc.exists) {
            posts.push(doc.data());
          }
        });
        return posts;
      })
  );
};

exports.loadPostPagination = async function ({
  user_id,
  last_id = 0,
  limit = 100,
  isMine,
}) {
  const users = await getAllUsers();
  let userMap = {};
  users.map((user) => {
    const { location_array, device_token, location_address, ...user1 } = user;
    return (userMap[user.user_id.toString()] = user1);
  });
  let ref = admin.firestore().collection('posts').where('active', '==', 1);
  if (isMine) {
    ref = ref.where('post_user_id', '==', user_id);
  }
  return (
    ref
      // .where('post_user_id', '=', user_id)
      .orderBy('post_id', 'desc')
      .startAfter(last_id)
      .limit(limit)
      .get()
      .then(async (snapshot) => {
        let posts = [];
        snapshot.forEach((doc) => {
          doc.exists ? posts.push(doc.data()) : null;
        });

        return await Promise.all(
          posts.map(async (post) => {
            const likeSnapshot = await admin
              .firestore()
              .collection('posts')
              .doc(post.post_id.toString())
              .collection('likes')
              .where('user_id', '==', user_id)
              .get();
            let liked = false;
            likeSnapshot.forEach((doc) => {
              if (doc.exists) {
                liked = true;
              }
            });
            return {
              ...post,
              liked,
              user: userMap[post.post_user_id.toString()],
            };
          })
        );
      })
  );
};

exports.loadPastAroundPosts = async function ({
  user_id,
  isMine,
  locationIndex,
}) {
  const doc = await getUserById(user_id);
  if (!doc.exists) {
    return { status: false, message: 'User does not exist!' };
  }
  const users = await getAllUsers();
  let userMap = {};
  users.map((user) => {
    const { location_array, device_token, location_address, ...user1 } = user;
    return (userMap[user.user_id.toString()] = user1);
  });
  const user = doc.data();
  const config = await loadConfiguration();
  const aroundSearchPeriod = config.aroundSearchPeriod
    ? config.aroundSearchPeriod
    : 2;

  let allPosts = await loadAllAroundPosts();
  if (isMine) {
    allPosts = allPosts.filter((post) => post.post_user_id === user_id);
  }
  console.log('posts', allPosts.length);
  let postsV1 = allPosts.filter((post) =>
    checkPostLocationWithUser(post, user, aroundSearchPeriod, locationIndex)
  );
  let posts = [];
  // check if user liked each post or not.
  await Promise.all(
    postsV1.map(async (post) => {
      // console.log('[post id]', post.post_id);
      const likeSnapshot = await admin
        .firestore()
        .collection('posts')
        .doc(post.post_id.toString())
        .collection('likes')
        .where('user_id', '==', user_id)
        .get();
      let liked = false;
      likeSnapshot.forEach((doc) => {
        if (doc.exists) {
          liked = true;
        }
      });
      posts.push({ ...post, liked });
      return true;
    })
  );
  // console.log('[count]', posts);

  posts.sort((a, b) => (a.post_id < b.post_id ? 1 : -1));

  return {
    status: true,
    data: posts.map((post) => ({
      ...post,
      user: userMap[post.post_user_id.toString()],
    })),
  };
};

const getPrimaryCommentsOfPost = async function ({ post_id }) {
  return admin
    .firestore()
    .collection('comments')
    .where('active', '==', 1)
    .where('type', '==', 'POST')
    .where('target_id', '==', Number(post_id))
    .orderBy('comment_id', 'desc')
    .get()
    .then((querySnapshot) => {
      let comments = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists) {
          comments.push(doc.data());
        }
      });
      return comments;
    })
    .catch((error) => {
      console.log('[Comment error]', error.message);
      return [];
    });
};

const checkUserLikedComment = async function ({ comment_id, user_id }) {
  const querySnapshot = await admin
    .firestore()
    .collection('comments')
    .doc(comment_id.toString())
    .collection('likes')
    .where('user_id', '==', user_id)
    .get();
  let liked = false;
  querySnapshot.forEach((doc) => {
    if (doc.exists) {
      liked = true;
    }
  });
  return liked;
};

const getRepliesToComment = async function ({ comment_id, user_id }) {
  return admin
    .firestore()
    .collection('comments')
    .where('active', '==', 1)
    .where('type', '==', 'COMMENT')
    .where('target_id', '==', comment_id)
    .orderBy('comment_id', 'desc')
    .get()
    .then(async (querySnapshot) => {
      let comments = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists) {
          comments.push(doc.data());
        }
      });
      return Promise.all(
        comments.map(async (comment) => {
          // liked
          const liked = await checkUserLikedComment({
            comment_id: comment.comment_id,
            user_id,
          });
          return { ...comment, liked };
        })
      ).catch((error1) => {
        console.log('[error while transform]', error1.message);
        return null;
      });
    })
    .catch((error) => {
      console.log('[error with replies]', error.message);
      return [];
    });
};

// const getUserById = async (user_id) => {
//   return admin
//   .firestore()
//   .collection('users')
//   .doc(user_id.toString())
//   .get(doc => doc.data());
// }

module.exports = {
  checkUserLikedComment,
  getAllUsers,
  getNewNotificationIdOfUser,
  getPrimaryCommentsOfPost,
  getRepliesToComment,
  getUserById,
  setNotificationToUser,
};
