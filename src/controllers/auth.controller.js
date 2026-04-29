const User = require('../models/User');
const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nibssService = require('../services/nibss.service');
const emailService = require('../services/email.service');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully. Please proceed to identity verification (onboarding) to create your bank account.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.onboard = async (req, res) => {
  try {
    const { kycType, kycID, dob } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) return res.status(400).json({ message: 'User already verified and account created' });

    // Create account on NIBSS
    const nibssAccount = await nibssService.createAccount({
      kycType,
      kycID,
      dob
    });

    // Fetch full account details (including accountName which might be missing in creation response)
    const accountDetails = await nibssService.getNameEnquiry(nibssAccount.accountNumber);

    user.isVerified = true;
    await user.save();

    // Save account details locally
    const account = new Account({
      userId: user._id,
      accountNumber: nibssAccount.accountNumber,
      accountName: accountDetails.accountName || nibssAccount.accountName,
      bankCode: nibssAccount.bankCode,
      bankName: nibssAccount.bankName || accountDetails.bankName,
      balance: nibssAccount.balance || 15000
    });

    await account.save();

    // Send Welcome Email
    await emailService.sendWelcomeEmail(user, account.accountNumber);

    res.status(200).json({
      message: 'Identity verified and account created successfully',
      account: {
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        bankName: account.bankName,
        balance: account.balance
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Onboarding failed', details: error.response?.data || error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateBvn = async (req, res) => {
  try {
    const { bvn } = req.body;
    const result = await nibssService.validateBvn(bvn);
    res.status(200).json({ message: 'BVN validation successful', result });
  } catch (error) {
    res.status(500).json({ message: 'BVN validation failed', details: error.response?.data || error.message });
  }
};

exports.validateNin = async (req, res) => {
  try {
    const { nin } = req.body;
    const result = await nibssService.validateNin(nin);
    res.status(200).json({ message: 'NIN validation successful', result });
  } catch (error) {
    res.status(500).json({ message: 'NIN validation failed', details: error.response?.data || error.message });
  }
};

exports.insertIdentity = async (req, res) => {
  try {
    const { kycType, kycID, firstName, lastName, dob, phone } = req.body;

    if (kycType === 'bvn') {
      await nibssService.createBvn({
        bvn: kycID,
        firstName,
        lastName,
        dob,
        phone
      });
    } else if (kycType === 'nin') {
      await nibssService.createNin({
        nin: kycID,
        firstName,
        lastName,
        dob
      });
    } else {
      return res.status(400).json({ message: 'Invalid KYC type. Must be BVN or NIN' });
    }

    res.status(201).json({ message: `${kycType} created successfully on NIBSS.` });
  } catch (error) {
    res.status(500).json({ message: 'Identity creation failed', details: error.response?.data || error.message });
  }
};

exports.nibssAuth = async (req, res) => {
  try {
    const token = await nibssService.authenticate();
    res.status(200).json({ message: 'NIBSS Authentication successful', token });
  } catch (error) {
    res.status(500).json({ message: 'NIBSS Authentication failed', error: error.message });
  }
};

exports.syncAccount = async (req, res) => {
  try {
    const { accountNumber } = req.body;
    const userId = req.user.id;
    const details = await nibssService.getNameEnquiry(accountNumber);
    const account = await new Account({ 
    userId,
    accountNumber,
    accountName: details.accountName,
    bankCode: details.bankCode,
    bankName: details.bankName,
    balance: details.balance || 15000
  });

    await account.save();


    res.status(200).json({ message: 'Account details synchronized successfully', account });
  } catch (error) {
    res.status(500).json({ message: 'Account synchronization failed', details: error.response?.data || error.message });
  }
};