const express = require('express');
const router = express.Router();
const roastController = require('../controllers/roastController');

router.get('/random', roastController.getRandomRoast);
router.get('/stats', roastController.getRoastStats);
router.post('/code', roastController.handleRoastCode);
router.post('/battle', roastController.handleRoastBattle);

module.exports = router;
