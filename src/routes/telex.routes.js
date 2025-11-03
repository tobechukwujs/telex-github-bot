const express = require('express');
const telexController = require('../controllers/telex.controller');
const router = express.Router();

/**
 * This is the single endpoint that Telex.im will send all
 * webhook POST requests to.
 */
router.post('/api/telex', telexController.handleTelexWebhook);

module.exports = router;
