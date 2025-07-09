const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 4000;

// Replace with your actual Apps Script web app URL
const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSOus1PUbcPc53gv9vfQBCcLEP9pGbLSVooTve-YZ5VRPTjPjwcHHAQESt7Ade2lCwow/exec';

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Proxy POST requests
app.post('/api', async (req, res) => {
  try {
    const response = await fetch(APPSCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (parseErr) {
      console.error('Proxy POST error: Could not parse JSON:', text);
      res.status(500).json({ status: 'error', message: 'Invalid JSON from Apps Script', raw: text });
    }
  } catch (err) {
    console.error('Proxy POST error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Enhanced GET requests - now supports both HeadID and Mobile number lookup
app.get('/api', async (req, res) => {
  try {
    let url = APPSCRIPT_URL;
    
    // Check if it's a mobile number lookup
    if (req.query.mobile) {
      url += '?mobile=' + encodeURIComponent(req.query.mobile);
      console.log('Mobile lookup request for:', req.query.mobile);
    } 
    // Check if it's a HeadID lookup (existing functionality)
    else if (req.query.headId) {
      url += '?headId=' + encodeURIComponent(req.query.headId);
      console.log('HeadID lookup request for:', req.query.headId);
    } 
    // No valid parameter provided
    else {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Please provide either mobile or headId parameter' 
      });
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (err) {
    console.error('Proxy GET error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log('Supported endpoints:');
  console.log('- POST /api - Submit form data');
  console.log('- GET /api?headId=XXX - Fetch by HeadID');
  console.log('- GET /api?mobile=XXX - Fetch by mobile number');
});
