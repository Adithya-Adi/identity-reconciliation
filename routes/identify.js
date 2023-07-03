const express = require('express');
const identifyController = require('../controller/identify');

const router = express.Router();

router.post('/', identifyController.identify);

module.exports = router;
