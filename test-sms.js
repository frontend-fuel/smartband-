require('dotenv').config();
const twilio = require('twilio');

// Twilio Configuration - using your exact credentials
const accountSid = 'AC0a3641c5370b3c14ada4b5c04a42d990';
const authToken = '909e64f093c504fc4e899bfdd50ae2a6';
const client = twilio(accountSid, authToken);

// Test SMS function
async function testSMS() {
  try {
    console.log('Testing SMS with Twilio...');
    const message = await client.messages.create({
      body: 'SMARTBAND+ SOS Alert! Location: https://maps.google.com/maps?q=17.3850,78.4867',
      from: '+15673471858',
      to: '+919391502293'
    });
    console.log('SMS sent successfully with SID:', message.sid);
  } catch (error) {
    console.error('Error sending SMS:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}

testSMS();
