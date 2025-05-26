const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Log directory
const LOG_DIR = path.join(__dirname, '../logs');
const CLIENT_LOG_FILE = path.join(LOG_DIR, 'client.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// API endpoint for client-side logging
router.post('/log', (req, res) => {
    // Client-side logging to server disabled
    // Returning success status but not writing to logs
    res.status(200).json({ success: true, message: 'Logging disabled' });
});

// Test endpoint to verify API is working
router.get('/status', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
