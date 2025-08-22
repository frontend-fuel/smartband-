require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const twilio = require('twilio');
const https = require('https');

const app = express();

// Twilio Configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC0a3641c5370b3c14ada4b5c04a42d990';
const authToken = process.env.TWILIO_AUTH_TOKEN || '909e64f093c504fc4e899bfdd50ae2a6';
const client = twilio(accountSid, authToken);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/break-the-silence';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    if (err.name === 'MongoServerSelectionError') {
      console.log('Please check your MongoDB Atlas connection string and network connectivity');
    }
  });

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  height: { type: Number },
  weight: { type: Number },
  bloodType: { type: String },
  emergencyContact: { type: String },
  deviceId: { type: String },
  profilePhoto: { type: String },
  thingspeakConfig: {
    channelId: { type: String },
    readApiKey: { type: String }
  },
  settings: {
    heartRateAlerts: { type: Boolean, default: true },
    gpsTracking: { type: Boolean, default: true },
    sosAutoAlert: { type: Boolean, default: true }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate device ID
    const deviceId = `SB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    // Create new user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      deviceId,
      settings: {
        heartRateAlerts: true,
        gpsTracking: true,
        sosAutoAlert: true
      }
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email, profilePhoto } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ThingSpeak configuration
app.put('/api/user/thingspeak', authenticateToken, async (req, res) => {
  try {
    const { channelId, readApiKey } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        thingspeakConfig: {
          channelId,
          readApiKey
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'ThingSpeak configuration saved successfully', thingspeakConfig: user.thingspeakConfig });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ThingSpeak configuration
app.get('/api/user/thingspeak', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('thingspeakConfig');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.thingspeakConfig || { channelId: '', readApiKey: '' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
app.delete('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Function to send SMS alert with GPS location
async function sendSMSAlert(gpsLocation) {
  try {
    console.log('Attempting to send SMS with GPS location:', gpsLocation);
    const googleMapsLink = `https://maps.google.com/maps?q=${gpsLocation}`;
    const message = await client.messages.create({
      body: `🚨 SMARTBAND+ SOS Alert! Emergency signal triggered! Location: ${googleMapsLink} Time: ${new Date().toLocaleString()} Please respond immediately!`,
      from: '+15673471858',
      to: '+919391502293'
    });
    console.log('SMS sent successfully with SID:', message.sid);
  } catch (error) {
    console.error('Error sending SMS:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Function to make voice call alert with GPS location
async function makeVoiceCall(gpsLocation) {
  try {
    console.log('Attempting to make voice call with GPS location:', gpsLocation);
    const [lat, lng] = gpsLocation.split(',');
    
    const twimlMessage = `<Response>
      <Say voice="alice" rate="slow">
        Emergency Alert from Smartband Plus. 
        An S.O.S signal has been triggered. 
        The user needs immediate assistance.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="slow">
        Location coordinates: 
        Latitude ${lat}, 
        Longitude ${lng}.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="slow">
        You can find the exact location on Google Maps using these coordinates.
        Please respond to this emergency immediately. 
        Thank you.
      </Say>
    </Response>`;

    const call = await client.calls.create({
      twiml: twimlMessage,
      to: '+919391502293',
      from: '+15673471858'
    });
    console.log('Voice call initiated successfully with SID:', call.sid);
  } catch (error) {
    console.error('Error making voice call:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// SMS and Call state tracking
let sosState = {
  lastField1Value: '0',
  messagesSent: 0,
  callsMade: 0,
  canSend: true
};

// Check ThingSpeak field 1 for SOS trigger
async function checkSOSField() {
  try {
    // Fetch latest data from ThingSpeak using https module
    const channelId = '2931414';
    const readApiKey = 'REXGXHUD3G0CWGVX';
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=1`;
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });
    
    if (response && response.feeds && response.feeds.length > 0) {
      const latestEntry = response.feeds[0];
      // Field 1 is the trigger for SOS
      const field1Value = latestEntry.field1;
      // Prefer Field 2 for latitude and Field 3 for longitude; fallback to Field 1/2 if needed
      const lat = latestEntry.field2 || '';
      const lng = latestEntry.field3 || latestEntry.field2 || '';
      const gpsLocation = `${lat},${lng}`;
      
      console.log('Checking Field 1 value:', field1Value);
      
      // Reset logic: if field goes from 1 to 0, reset the counters
      if (sosState.lastField1Value === '1' && field1Value === '0') {
        sosState.messagesSent = 0;
        sosState.callsMade = 0;
        sosState.canSend = true;
        console.log('Field 1 reset to 0 - SMS and Call counters reset');
      }
      
      // Send SMS and Call logic: only if field is 1, we can send, and haven't reached limits
      if (field1Value === '1' && sosState.canSend) {
        let shouldMakeCall = false;
        
        // Send SMS (up to 2 messages)
        if (sosState.messagesSent < 2) {
          console.log(`SOS triggered! Sending SMS alert ${sosState.messagesSent + 1}/2 with GPS location:`, gpsLocation);
          await sendSMSAlert(gpsLocation);
          sosState.messagesSent++;
          
          // Trigger call after first SMS
          if (sosState.messagesSent === 1 && sosState.callsMade < 1) {
            shouldMakeCall = true;
          }
        }
        
        // Make voice call (up to 1 call, triggered after first SMS)
        if (shouldMakeCall || (sosState.callsMade < 1 && sosState.messagesSent >= 1)) {
          console.log(`SOS triggered! Making voice call ${sosState.callsMade + 1}/1 with GPS location:`, gpsLocation);
          sosState.callsMade++;
          
          // Wait 3 seconds after SMS before making call
          setTimeout(async () => {
            await makeVoiceCall(gpsLocation);
          }, 3000);
        }
        
        // Stop sending after limits reached
        if (sosState.messagesSent >= 2 && sosState.callsMade >= 1) {
          sosState.canSend = false;
          console.log('Maximum alerts sent (2 SMS + 1 Call). Waiting for field reset to 0 then 1.');
        }
      }
      
      // Update last known value
      sosState.lastField1Value = field1Value;
    }
  } catch (error) {
    console.error('Error checking SOS field:', error);
  }
}

// Periodically check for SOS trigger (every 30 seconds)
setInterval(checkSOSField, 30000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});