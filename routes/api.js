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
    try {
        const { message, level, timestamp, url, data } = req.body;
        
        // Format the log entry
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${url}] ${message} ${data ? JSON.stringify(data) : ''}`;
        
        // Write to log file
        fs.appendFileSync(CLIENT_LOG_FILE, logEntry + '\n');
        
        // Also write to stdout (which Passenger captures)
        console.log(logEntry);
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error writing to client log:', error);
        res.status(500).json({ success: false, error: error.message });
    }
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
