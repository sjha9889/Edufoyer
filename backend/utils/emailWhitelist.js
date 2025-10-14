/**
 * Email Whitelist System
 * Only allows signup for pre-approved email addresses
 */

// List of approved email addresses/domains
const APPROVED_EMAILS = [
  // Add specific approved emails here
  'admin@edufoyer.com',
  'test@edufoyer.com',
  'support@edufoyer.com',
  'user@edufoyer.com',
  'student@edufoyer.com',
  'teacher@edufoyer.com',
  'solver@edufoyer.com'
];

// List of approved domains (optional)
const APPROVED_DOMAINS = [
  'edufoyer.com',
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'kiit.ac.in',
  'kiit.edu.in'
];

/**
 * Check if email is in the whitelist
 * @param {string} email - Email address to check
 * @returns {object} - Validation result
 */
export const checkEmailWhitelist = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isApproved: false,
      message: 'Email is required'
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if email is in the approved list
  if (APPROVED_EMAILS.includes(normalizedEmail)) {
    return {
      isApproved: true,
      message: 'Email is approved'
    };
  }

  // Check if domain is in the approved domains list
  const domain = normalizedEmail.split('@')[1];
  if (domain && APPROVED_DOMAINS.includes(domain)) {
    return {
      isApproved: true,
      message: 'Email domain is approved'
    };
  }

  return {
    isApproved: false,
    message: 'Email not found in approved list. Please contact administrator.'
  };
};

/**
 * Add email to whitelist (admin function)
 * @param {string} email - Email to add
 */
export const addToWhitelist = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!APPROVED_EMAILS.includes(normalizedEmail)) {
    APPROVED_EMAILS.push(normalizedEmail);
    return true;
  }
  return false;
};

/**
 * Remove email from whitelist (admin function)
 * @param {string} email - Email to remove
 */
export const removeFromWhitelist = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const index = APPROVED_EMAILS.indexOf(normalizedEmail);
  if (index > -1) {
    APPROVED_EMAILS.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * Get all approved emails (admin function)
 */
export const getApprovedEmails = () => {
  return [...APPROVED_EMAILS];
};

/**
 * Get all approved domains (admin function)
 */
export const getApprovedDomains = () => {
  return [...APPROVED_DOMAINS];
};
