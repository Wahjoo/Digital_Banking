const axios = require('axios');
require('dotenv').config();

const onboardFintech = async (name, email) => {
  try {
    const baseUrl = process.env.NIBSS_BASE_URL || 'https://nibssbyphoenix.onrender.com/api';
    console.log(`Onboarding Fintech: ${name} (${email}) at ${baseUrl}`);

    const response = await axios.post(`${baseUrl}/fintech/onboard`, {
      name,
      email
    });

    console.log('Success! Please check your email for API credentials.');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Onboarding Failed:', error.response?.data || error.message);
  }
};

// Get command line arguments
const [, , name, email] = process.argv;

if (!name || !email) {
  console.log('Usage: node onboard_fintech.js "Bank Name" "email@example.com"');
} else {
  onboardFintech(name, email);
}
