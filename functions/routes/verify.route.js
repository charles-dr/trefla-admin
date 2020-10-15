const express = require('express');
const bodyParser = require('body-parser');
const {
    getUnreadMsgCountToID,
    verifyHealth
} = require('../libs/verify');
const app = express();
app.use(bodyParser.json());

// test api to check health
app.get('/health', (req, res) => {
    const health = verifyHealth();
    res.send(health);
});

/**
 * @endpoint /unread-msg
 * @param id_card string
 * @return object
 */
app.post('/unread-msg', async (req, res) => {
    if (!req.body.id_card.trim) {
        return res.json({
            status: false, 
            message: `Parameter "id_card" is required!`
        });
    } else {
        const resp = await getUnreadMsgCountToID(req.body.id_card);
        res.status(resp.status ? 200 : 400).json(resp);
    }
});

module.exports = app;
