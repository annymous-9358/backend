const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 4000;

// Replace with your actual Apps Script web app URL
const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_PLIQqwoMccf1an8aHF_RxWtp1BuzTK8qMSLogfmEONPtcgrLWM3yJyshFjes_NdCTg/exec';

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

// Proxy GET requests (for HeadID fetch)
app.get('/api', async (req, res) => {
  try {
    const url = APPSCRIPT_URL + '?headId=' + encodeURIComponent(req.query.headId);
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});