const express = require('express');
const router = express.Router();

const TrainDataController = require('../controllers/TrainDataController');
const isAuthenticated = require('../policies/isAuthenticated');

router.get('/list', isAuthenticated, TrainDataController.list);
router.post('/new', isAuthenticated, TrainDataController.new);
router.put('/edit', isAuthenticated, TrainDataController.edit);
router.delete('/remove', isAuthenticated, TrainDataController.remove);

module.exports = router;
