const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email Error:', error.message);
      // We don't throw here to avoid crashing the main transaction if email fails
    }
  }

  async sendWelcomeEmail(user, accountNumber) {
    const subject = 'Welcome to NibssByPhoenix Bank!';
    const html = `
      <h1>Hello ${user.firstName},</h1>
      <p>Congratulations! Your account has been successfully created and verified.</p>
      <p><strong>Account Number:</strong> ${accountNumber}</p>
      <p><strong>Initial Balance:</strong> ₦15,000.00</p>
      <p>Thank you for choosing NibssByPhoenix Bank.</p>
    `;
    return this.sendEmail(user.email, subject, html);
  }

  async sendTransactionAlert(user, transaction, isCredit = false) {
    const type = isCredit ? 'Credit' : 'Debit';
    const subject = `Transaction Alert: [${type}]`;
    const html = `
      <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: ${isCredit ? '#28a745' : '#dc3545'};">Transaction Alert: ${type}</h2>
        <p>Dear ${user.firstName},</p>
        <p>This is to notify you of a ${type.toLowerCase()} transaction on your account.</p>
        <table style="width: 100%;">
          <tr><td><strong>Amount:</strong></td><td>₦${transaction.amount.toLocaleString()}</td></tr>
          <tr><td><strong>Account:</strong></td><td>${isCredit ? transaction.recipientAccount : transaction.senderAccount}</td></tr>
          <tr><td><strong>Narration:</strong></td><td>${transaction.narration || 'N/A'}</td></tr>
          <tr><td><strong>Reference:</strong></td><td>${transaction.reference}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${new Date(transaction.timestamp).toLocaleString()}</td></tr>
        </table>
        <p>If you did not authorize this transaction, please contact us immediately.</p>
      </div>
    `;
    return this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();
