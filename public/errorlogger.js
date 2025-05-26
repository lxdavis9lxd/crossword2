// Wait for scripts.js to load the logToServer function
document.addEventListener('DOMContentLoaded', function() {
    // Check if logToServer function exists, otherwise create a fallback
    if (typeof logToServer !== 'function') {
        window.logToServer = function(message, level = 'info', data = null) {
            // Fallback to console logging if the function doesn't exist yet
            switch (level) {
                case 'error':
                    console.error(`[${level.toUpperCase()}] ${message}`, data || '');
                    break;
                case 'warn':
                    console.warn(`[${level.toUpperCase()}] ${message}`, data || '');
                    break;
                case 'debug':
                    console.debug(`[${level.toUpperCase()}] ${message}`, data || '');
                    break;
                case 'info':
                default:
                    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
            }
            
            // Server logging removed to prevent logging to cPanel Passenger log files
        };
        
        console.log('Created fallback logToServer function in errorlogger.js');
    } else {
        console.log('Using existing logToServer function from scripts.js');
    }
    
    // Add global error handler for browser console logging only
    window.addEventListener('error', function(event) {
        // Log to console only
        logToServer(`Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, 'error', { 
            stack: event.error ? event.error.stack : null 
        });
    });

    // Also catch unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        // Log to console only
        logToServer(`Unhandled Promise Rejection: ${event.reason}`, 'error', {
            stack: event.reason && event.reason.stack ? event.reason.stack : null
        });
    });
});
