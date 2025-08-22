require('dotenv').config();
const twilio = require('twilio');

// Twilio Configuration
const accountSid = 'AC0a3641c5370b3c14ada4b5c04a42d990';
const authToken = '909e64f093c504fc4e899bfdd50ae2a6';
const client = twilio(accountSid, authToken);

// Emergency Alert System - SMS + Voice Call
class EmergencyAlert {
  constructor() {
    this.twilioNumber = '+15673471858';
    this.emergencyContacts = ['+919391502293']; // Add more contacts as needed
  }

  // Send SMS Alert
  async sendSMSAlert(location = { lat: 17.3850, lng: 78.4867 }) {
    const message = `🚨 SMARTBAND+ SOS ALERT! 🚨
Emergency signal triggered!
Location: https://maps.google.com/maps?q=${location.lat},${location.lng}
Time: ${new Date().toLocaleString()}
Please respond immediately!`;

    const results = [];
    for (const contact of this.emergencyContacts) {
      try {
        const sms = await client.messages.create({
          body: message,
          from: this.twilioNumber,
          to: contact
        });
        results.push({ type: 'SMS', contact, success: true, sid: sms.sid });
        console.log(`SMS sent to ${contact} - SID: ${sms.sid}`);
      } catch (error) {
        results.push({ type: 'SMS', contact, success: false, error: error.message });
        console.error(`SMS failed to ${contact}:`, error.message);
      }
    }
    return results;
  }

  // Make Voice Call Alert
  async makeVoiceCall(location = { lat: 17.3850, lng: 78.4867 }) {
    const twimlMessage = `<Response>
      <Say voice="alice" rate="slow">
        Emergency Alert from Smartband Plus. 
        An S.O.S signal has been triggered. 
        The user needs immediate assistance.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="slow">
        Location coordinates: 
        Latitude ${location.lat}, 
        Longitude ${location.lng}.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="slow">
        Please respond to this emergency immediately. 
        Thank you.
      </Say>
    </Response>`;

    const results = [];
    for (const contact of this.emergencyContacts) {
      try {
        const call = await client.calls.create({
          twiml: twimlMessage,
          to: contact,
          from: this.twilioNumber
        });
        results.push({ type: 'CALL', contact, success: true, sid: call.sid });
        console.log(`Call initiated to ${contact} - SID: ${call.sid}`);
      } catch (error) {
        results.push({ type: 'CALL', contact, success: false, error: error.message });
        console.error(`Call failed to ${contact}:`, error.message);
      }
    }
    return results;
  }

  // Send Complete Emergency Alert (SMS + Call)
  async sendEmergencyAlert(location = { lat: 17.3850, lng: 78.4867 }) {
    console.log('🚨 INITIATING EMERGENCY ALERT SYSTEM 🚨');
    console.log(`Location: ${location.lat}, ${location.lng}`);
    
    try {
      // Send SMS first (faster)
      console.log('Sending SMS alerts...');
      const smsResults = await this.sendSMSAlert(location);
      
      // Wait 2 seconds then make calls
      console.log('Waiting 2 seconds before making calls...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Initiating voice calls...');
      const callResults = await this.makeVoiceCall(location);
      
      return {
        success: true,
        sms: smsResults,
        calls: callResults,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Emergency alert system error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Add emergency contact
  addEmergencyContact(phoneNumber) {
    if (!this.emergencyContacts.includes(phoneNumber)) {
      this.emergencyContacts.push(phoneNumber);
      console.log(`Added emergency contact: ${phoneNumber}`);
    }
  }

  // Remove emergency contact
  removeEmergencyContact(phoneNumber) {
    const index = this.emergencyContacts.indexOf(phoneNumber);
    if (index > -1) {
      this.emergencyContacts.splice(index, 1);
      console.log(`Removed emergency contact: ${phoneNumber}`);
    }
  }
}

// Export for use in other files
module.exports = EmergencyAlert;

// Test function if run directly
if (require.main === module) {
  const emergencySystem = new EmergencyAlert();
  
  // Test the complete emergency alert system
  emergencySystem.sendEmergencyAlert({ lat: 17.3850, lng: 78.4867 })
    .then(result => {
      console.log('\n=== EMERGENCY ALERT RESULTS ===');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Test failed:', error);
    });
}
