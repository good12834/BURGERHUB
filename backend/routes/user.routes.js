const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'User route working' });
});

router.get('/orders', (req, res) => {
    res.json({ message: 'User orders endpoint' });
});

module.exports = router;