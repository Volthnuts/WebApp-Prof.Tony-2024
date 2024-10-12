const express = require('express');
const router = express.Router();

const {
    getConfigs,
    getStatus,
    getLogs,
    postLogs,
    getAllConfigs
} = require('../controllers/HttpMethodController');

router.get('/config', getAllConfigs);
//HTTP Methods
router.get('/config/:id', getConfigs);
router.get('/configStatus/:id', getStatus);
router.get('/logs', getLogs);
router.post('/logs', postLogs);

module.exports = router;