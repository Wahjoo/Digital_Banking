const axios = require('axios');
require('dotenv').config();

class NibssService {
  constructor() {
    this.baseUrl = process.env.NIBSS_BASE_URL;
    this.apiKey = process.env.NIBSS_API_KEY;
    this.apiSecret = process.env.NIBSS_API_SECRET;
    this.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaW50ZWNoSWQiOiI2OWVhNzk0NjA0N2ZmMTM3ZDY5MDQ1OTUiLCJuYW1lIjoiV2Foam9vIEJhbmsgUExDIiwiZW1haWwiOiJnZW5pdXNraGlkMUBnbWFpbC5jb20iLCJiYW5rQ29kZSI6IjI2MiIsImJhbmtOYW1lIjoiV0FIIEJhbmsiLCJpYXQiOjE3Nzc0NjA5NDAsImV4cCI6MTc3NzQ2NDU0MH0.mBY1WYKLMym0GQs7_Oal068A4unfqMIigvlMAj6Wvd0";
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        apiKey: this.apiKey,
        apiSecret: this.apiSecret
      });
      this.token = response.data.token;
      return this.token;
    } catch (error) {
      console.error('NIBSS Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with NIBSS');
    }
  }

  async getHeaders() {
    if (!this.token) await this.authenticate();
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async createBvn(data) {
    const headers = await this.getHeaders();
    const response = await axios.post(`${this.baseUrl}/insertBvn`, data, { headers });
    return response.data;
  }

  async createNin(data) {
    const headers = await this.getHeaders();
    const response = await axios.post(`${this.baseUrl}/insertNin`, data, { headers });
    return response.data;
  }

  async validateBvn(bvn) {
    const headers = await this.getHeaders();
    const response = await axios.post(`${this.baseUrl}/validateBvn`, { bvn }, { headers });
    return response.data;
  }

  async validateNin(nin) {
    const headers = await this.getHeaders();
    const response = await axios.post(`${this.baseUrl}/validateNin`, { nin }, { headers });
    return response.data;
  }

  async createAccount(data) {
    const headers = await this.getHeaders();
    const response = await axios.post(`${this.baseUrl}/account/create`, data, { headers });
    return response.data;
  }

  async getAllAccounts() {
    const headers = await this.getHeaders();
    const response = await axios.get(`${this.baseUrl}/accounts`, { headers });
    return response.data;
  }

  async getNameEnquiry(accountNumber) {
    const headers = await this.getHeaders();
    const response = await axios.get(`${this.baseUrl}/account/name-enquiry/${accountNumber}`, { headers });
    return response.data;
  }

  async getBalance(accountNumber) {
    const headers = await this.getHeaders();
    const response = await axios.get(`${this.baseUrl}/account/balance/${accountNumber}`, { headers });
    return response.data;
  }

  async transfer(data) {
    const headers = await this.getHeaders();
    const response = await axios.post(`${this.baseUrl}/transfer`, data, { headers });
    return response.data;
  }

  async getTransactionStatus(reference) {
    const headers = await this.getHeaders();
    const response = await axios.get(`${this.baseUrl}/transaction/${reference}`, { headers });
    return response.data;
  }
}

module.exports = new NibssService();
