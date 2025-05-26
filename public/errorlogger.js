// Wait for scripts.js to load the logToServer function
document.addEventListener('DOMContentLoaded', function() {
    // Check if logToServer function exists, otherwise create a fallback
    if (typeof logToServer !== 'function') {
        window.logToServer = function(message, level = 'info', data = null) {
            // Fallback to console logging if the function doesn't exist yet
            console.log(`[${level.toUpperCase()}] ${message}`, data || '');
            
            // Try to send log to server if we're in production
            if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                try {
                    const logData = {
                        message: message,
                        level: level,
                        timestamp: new Date().toISOString(),
                        url: window.location.href,
                        data: data,
                        source: 'errorlogger.js'
                    };
                    
                    fetch('/v1/api/log', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(logData),
                        keepalive: true
                    }).catch(err => console.error('Failed to send log to server:', err));
                } catch (e) {
                    console.error('Server logging failed:', e);
                }
            }
        };
        
        console.log('Created fallback logToServer function in errorlogger.js');
    } else {
        console.log('Using existing logToServer function from scripts.js');
    }
    
    // Add global error handler to send errors to server logs
    window.addEventListener('error', function(event) {
        // Send to server log
        logToServer(`Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, 'error', { 
            stack: event.error ? event.error.stack : null 
        });
    });

    // Also catch unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        // Send to server log
        logToServer(`Unhandled Promise Rejection: ${event.reason}`, 'error', {
            stack: event.reason && event.reason.stack ? event.reason.stack : null
        });
    });
});
