const express = require('express');
const router = express.Router();
const bankingController = require('../controllers/banking.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/balance', bankingController.getBalance);
router.get('/name-enquiry/:accountNumber', bankingController.nameEnquiry);
router.post('/transfer', bankingController.transfer);
router.get('/history', bankingController.getTransactionHistory);
router.get('/status/:reference', bankingController.getTransactionStatus);
router.get('/accounts', bankingController.getAllAccounts);

module.exports = router;
