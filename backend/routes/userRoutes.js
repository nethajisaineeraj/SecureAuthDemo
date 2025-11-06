const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { profile, adminDashboard } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', auth, profile);
router.get('/admin', auth, role(['admin']), adminDashboard);

module.exports = router;
