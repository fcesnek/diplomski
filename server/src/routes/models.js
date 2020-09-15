const express = require('express');
const router = express.Router();
const upload = require('../utils/aws-sdk-methods');

const ModelController = require('../controllers/ModelController');
const isAuthenticated = require('../policies/isAuthenticated');

router.get('/list', isAuthenticated, ModelController.list);
router.post('/new', isAuthenticated, upload.array('files'), ModelController.new);
router.delete('/remove', isAuthenticated, ModelController.remove);

module.exports = router;
