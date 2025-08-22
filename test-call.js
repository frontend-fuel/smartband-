require('dotenv').config();
const twilio = require('twilio');

// Twilio Configuration - using your exact credentials
const accountSid = 'AC0a3641c5370b3c14ada4b5c04a42d990';
const authToken = '909e64f093c504fc4e899bfdd50ae2a6';
const client = twilio(accountSid, authToken);

// Test Voice Call function
async function testCall() {
  try {
    console.log('Testing Voice Call with Twilio...');
    const call = await client.calls.create({
      twiml: `<Response>
                <Say voice="alice">
                  This is an emergency alert from Smartband Plus. 
                  An SOS signal has been triggered. 
                  The user's location is latitude 17.3850, longitude 78.4867. 
                  Please respond immediately.
                </Say>
                <Pause length="2"/>
                <Say voice="alice">
                  This message will repeat.
                </Say>
                <Pause length="1"/>
                <Say voice="alice">
                  Emergency alert from Smartband Plus. 
                  SOS signal triggered. 
                  Location: latitude 17.3850, longitude 78.4867.
                </Say>
              </Response>`,
      to: '+919391502293',
      from: '+15673471858'
    });
    console.log('Call initiated successfully with SID:', call.sid);
    console.log('Call Status:', call.status);
  } catch (error) {
    console.error('Error making call:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}

testCall();
