const express = require('express');
// const bodyParser = require('body-parser');
const { getUserById } = require('../libs/common');
const {
  checkIDCardVerified,
  getUnreadMsgCountToID,
  unverifyAcountByCardNumber,
  unverifySingleUser,
  verifyHealth,
  verifyUserById,
} = require('../libs/verify.lib');

const app = express();
// app.use(bodyParser.json());

// test api to check health
app.get('/health', (req, res) => {
  const health = verifyHealth();
  res.send(health);
});

/**
 * @endpoint [POST]/unread-msg
 * @param {string} id_card
 * @return {object}
 */
app.post('/unread-msg', async (req, res) => {
  if (!req.body.id_card.trim()) {
    return res.json({
      status: false,
      message: `Parameter "id_card" is required!`,
    });
  } else {
    const resp = await getUnreadMsgCountToID(req.body.id_card);
    return res.status(resp.status ? 200 : 400).json(resp);
  }
});

/**
 * @endpoint [POST]/check-verified
 * @param {string} id_card
 * @return {object}
 */
app.post('/check-verified', async (req, res) => {
  if (!req.body.id_card.trim()) {
    return res.json({
      status: false,
      message: `Parameter "id_card" is required!`,
    });
  } else {
    const resp = await checkIDCardVerified(req.body.id_card);
    return res.status(200).json({ status: resp });
  }
});

app.post('/unverify-by-id', async (req, res) => {
  unverifyAcountByCardNumber(req.body.card_num)
    .then((resp) => {
      return res.json({ status: true, message: 'success', result: resp });
    })
    .catch((error) => {
      return res.json({ status: false, message: error.message });
    });
});

app.post('/verify-user', async (req, res) => {
  if (!req.body.user_id && req.body.user_id !== 0) {
    return res.json({
      status: false,
      message: `Parameter "user_id" is required!`,
    });
  }

  return verifyUserById(req.body.user_id)
    .then((resp) => {
      return res.json(resp);
    })
    .catch((error) => {
      return res.json({ status: false, message: error.message });
    });
});

app.post('/unverify-user', async (req, res) => {
  if (!req.body.user_id && req.body.user_id !== 0) {
    return res.json({
      status: false,
      message: `Parameter "user_id" is required!`,
    });
  }
  return getUserById(req.body.user_id)
    .then((doc) => doc.data())
    .then((user) => unverifySingleUser(user))
    .then((verified) => {
      return res.json({
        status: true,
        message: 'User has been unverified!',
      });
    })
    .catch((error) => {
      return res.json({
        status: false,
        message: 'Failed to unverify a user...',
        error: error.message,
      });
    });
});

module.exports = app;
