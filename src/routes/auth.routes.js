const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/onboard', authMiddleware, authController.onboard);
router.post('/validate-bvn', authMiddleware, authController.validateBvn);
router.post('/validate-nin', authMiddleware, authController.validateNin);
router.post('/insert-identity', authMiddleware, authController.insertIdentity);
router.post('/sync-account', authMiddleware, authController.syncAccount);
router.post('/nibss-auth', authController.nibssAuth);

module.exports = router;
