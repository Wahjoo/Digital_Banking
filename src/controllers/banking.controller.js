const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const nibssService = require('../services/nibss.service');
const emailService = require('../services/email.service');
const { v4: uuidv4 } = require('uuid'); // I need to install uuid

exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const account = await Account.findOne({ userId });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    // Sync with NIBSS
    const nibssBalance = await nibssService.getBalance(account.accountNumber);
    account.balance = nibssBalance.balance;
    await account.save();

    res.json({ balance: account.balance, accountNumber: account.accountNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.nameEnquiry = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const details = await nibssService.getNameEnquiry(accountNumber);
    res.status(200).json({ details });
  } catch (error) {
    res.status(500).json({ message: 'Name enquiry failed', details: error.response?.data || error.message });
  }
};

exports.transfer = async (req, res) => {
  try {
    const { recipientAccountNumber, amount, narration, type } = req.body;
    const senderAccount = await Account.findOne({ userId: req.user.id });

    const details = await nibssService.getNameEnquiry(recipientAccountNumber);

    if (!details) return res.status(404).json({ message: 'Recipient account not found' });

    if (senderAccount.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });

    const reference = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Call NIBSS Transfer
    const nibssTransfer = await nibssService.transfer({
      "from": senderAccount.accountNumber,
      "to": recipientAccountNumber,
      amount,
      narration,
      reference,
      type // 'intra' or 'inter'
    });

    // Record Transaction
    const transaction = new Transaction({
      reference,
      senderAccount: senderAccount.accountNumber,
      recipientAccount: recipientAccountNumber,
      recipientName: details.accountName,
      amount,
      type,
      status: 'success', // NIBSS transfer is synchronous in this mock
      narration,
      userId: req.user.id
    });

    await transaction.save();

    // Update local balance
    senderAccount.balance -= amount;
    await senderAccount.save();

    // Step 5: Send Alerts
    const senderUser = await User.findById(req.user.id);
    await emailService.sendTransactionAlert(senderUser, transaction, false);

    // If recipient is also our customer, send credit alert
    const recipientLocalAccount = await Account.findOne({ accountNumber: recipientAccountNumber });
    if (recipientLocalAccount) {
      const recipientUser = await User.findById(recipientLocalAccount.userId);
      if (recipientUser) {
        await emailService.sendTransactionAlert(recipientUser, transaction, true);
      }
    }

    res.json({ message: 'Transfer successful', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Transfer failed', details: error.response?.data || error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    // Strict data isolation: find by userId
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactionStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    const transaction = await Transaction.findOne({ reference, userId: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found or unauthorized' });

    const status = await nibssService.getTransactionStatus(reference);
    res.json({ status, localRecord: transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await nibssService.getAllAccounts();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all accounts', details: error.response?.data || error.message });
  }
};
