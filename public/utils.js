/**
 * Utility functions for the crossword game
 */

/**
 * Shows a status message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, info)
 * @param {number} duration - How long to show the message in milliseconds
 */
function showStatusMessage(message, type = 'info', duration = 5000) {
  // Create or get the message element
  let messageEl = document.getElementById('status-message');
  
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.id = 'status-message';
    document.body.appendChild(messageEl);
  }
  
  // Set the message content and style
  messageEl.textContent = message;
  messageEl.className = `status-message ${type}`;
  
  // Show the message
  messageEl.style.display = 'block';
  
  // Clear any existing timeout
  if (window.statusMessageTimeout) {
    clearTimeout(window.statusMessageTimeout);
  }
  
  // Hide the message after the specified duration
  window.statusMessageTimeout = setTimeout(() => {
    messageEl.style.display = 'none';
  }, duration);
}

/**
 * Validates form data
 * @param {Object} data - The form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with isValid and errors
 */
function validateFormData(data, rules) {
  const errors = {};
  
  // Check each field against its rules
  for (const field in rules) {
    const value = data[field];
    const fieldRules = rules[field];
    
    // Required validation
    if (fieldRules.required && !value) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    // Email validation
    if (fieldRules.email && value && !isValidEmail(value)) {
      errors[field] = `${field} must be a valid email`;
    }
    
    // Min length validation
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
    }
    
    // Max length validation
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = `${field} must be no more than ${fieldRules.maxLength} characters`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Checks if a string is a valid email
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Formats a date for display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Calculates the completion percentage of a crossword puzzle
 * @param {Object} progress - The user's progress data
 * @param {Array} grid - The full puzzle grid
 * @returns {number} Completion percentage (0-100)
 */
function calculatePuzzleCompletion(progress, grid) {
  if (!progress || !grid) return 0;
  
  const totalCells = grid.filter(cell => cell !== '#').length;
  const filledCells = Object.values(progress).filter(val => val && val.trim() !== '').length;
  
  return Math.round((filledCells / totalCells) * 100);
}
