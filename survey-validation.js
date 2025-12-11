/**
 * Survey Validation Module
 * ======================================
 * 
 * Comprehensive client-side validation for all survey forms.
 * Validates data types, formats, required fields, and length limits.
 */

/**
 * Global validation patterns
 */
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+?\d{1,3}[-.\s]?)?\d{7,14}$/,
  numeric: /^\d+$/,
  alphanumeric: /^[a-zA-Z0-9\s\-.,()]+$/,
  onlyLetters: /^[a-zA-Z\s]+$/
};

/**
 * Field configuration with validation rules
 */
const FIELD_RULES = {
  // Form 1: Client Information
  clientType: {
    required: true,
    type: 'select',
    errorMsg: 'Please select a client type'
  },
  date: {
    required: true,
    type: 'date',
    errorMsg: 'Please select a valid date',
    validator: (value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      return selectedDate <= today; // Can't be future date
    },
    errorMsgCustom: 'Date cannot be in the future'
  },
  age: {
    required: true,
    type: 'number',
    min: 1,
    max: 150,
    errorMsg: 'Please enter a valid age (1-150)',
    validator: (value) => {
      return Number.isInteger(Number(value)) && value > 0 && value <= 150;
    },
    errorMsgCustom: 'Age must be a whole number between 1 and 150'
  },
  serviceAvailed: {
    required: true,
    type: 'text',
    minLength: 2,
    maxLength: 100,
    errorMsg: 'Service availed must be 2-100 characters',
    pattern: 'alphanumeric'
  },
  regionOfResidence: {
    required: true,
    type: 'text',
    minLength: 2,
    maxLength: 100,
    errorMsg: 'Region must be 2-100 characters'
  },
  sex: {
    required: true,
    type: 'radio',
    errorMsg: 'Please select a gender'
  },

  // Form 2: Citizen's Charter
  cc1: {
    required: true,
    type: 'radio',
    errorMsg: 'Please answer Citizen Charter question 1'
  },
  cc2: {
    required: true,
    type: 'radio',
    errorMsg: 'Please answer Citizen Charter question 2',
    conditionalRequired: (formData) => formData.cc1 !== '4' // Only if cc1 is not "unaware"
  },
  cc3: {
    required: true,
    type: 'radio',
    errorMsg: 'Please answer Citizen Charter question 3',
    conditionalRequired: (formData) => formData.cc1 !== '4'
  },

  // Form 3: SQD Questions (Service Quality Dimensions)
  sqd0: { required: true, type: 'radio', errorMsg: 'Please answer SQD question 0' },
  sqd1: { required: true, type: 'radio', errorMsg: 'Please answer SQD question 1' },
  sqd2: { required: true, type: 'radio', errorMsg: 'Please answer SQD question 2' },
  sqd3: { required: true, type: 'radio', errorMsg: 'Please answer SQD question 3' },
  sqd4: { required: true, type: 'radio', errorMsg: 'Please answer SQD question 4' },
  sqd5: { required: true, type: 'radio', errorMsg: 'Please answer SQD question 5' },
  sqd6: { required: true, type: 'radio', errorMsg: 'Please answer SQD question 6' },
  sqd7: { required: true, type: 'radio', errorMsg: 'Please answer SQD question 7' },
  sqd8: { required: true, type: 'radio', errorMsg: 'Please answer SQD question 8' },

  // Form 4: Optional Feedback
  suggestions: {
    required: false,
    type: 'textarea',
    maxLength: 500,
    errorMsg: 'Suggestions must not exceed 500 characters'
  },
  email: {
    required: false,
    type: 'email',
    maxLength: 100,
    pattern: 'email',
    errorMsg: 'Please enter a valid email address',
    validator: (value) => {
      if (!value) return true; // Optional field
      return VALIDATION_PATTERNS.email.test(value);
    }
  }
};

/**
 * Validate a single field
 * 
 * @param {string} fieldName - Name of the field
 * @param {*} value - Value to validate
 * @param {Object} formData - Complete form data (for conditional validation)
 * @returns {{valid: boolean, error: string}}
 */
export function validateField(fieldName, value, formData = {}) {
  const rule = FIELD_RULES[fieldName];

  if (!rule) {
    return { valid: true, error: '' }; // Unknown field passes
  }

  // Check required
  if (rule.required) {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: rule.errorMsg };
    }
  }

  // Check conditional requirement
  if (rule.conditionalRequired) {
    const isConditionallyRequired = rule.conditionalRequired(formData);
    if (isConditionallyRequired && (value === null || value === undefined || value === '')) {
      return { valid: false, error: rule.errorMsg };
    }
  }

  // If field is not required and empty, skip validation
  if (!rule.required && (value === null || value === undefined || value === '')) {
    return { valid: true, error: '' };
  }

  // Check length
  if (rule.minLength && String(value).length < rule.minLength) {
    return { valid: false, error: rule.errorMsg };
  }

  if (rule.maxLength && String(value).length > rule.maxLength) {
    return { valid: false, error: rule.errorMsg };
  }

  // Check range for numbers
  if (rule.type === 'number' || rule.type === 'age') {
    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, error: rule.errorMsg };
    }
    if (rule.min !== undefined && num < rule.min) {
      return { valid: false, error: rule.errorMsg };
    }
    if (rule.max !== undefined && num > rule.max) {
      return { valid: false, error: rule.errorMsg };
    }
  }

  // Check date format
  if (rule.type === 'date') {
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) {
      return { valid: false, error: rule.errorMsg };
    }
  }

  // Check pattern
  if (rule.pattern && VALIDATION_PATTERNS[rule.pattern]) {
    if (!VALIDATION_PATTERNS[rule.pattern].test(String(value))) {
      return { valid: false, error: rule.errorMsg };
    }
  }

  // Custom validator function
  if (rule.validator && typeof rule.validator === 'function') {
    const isValid = rule.validator(value);
    if (!isValid) {
      return { valid: false, error: rule.errorMsgCustom || rule.errorMsg };
    }
  }

  return { valid: true, error: '' };
}

/**
 * Validate entire form
 * 
 * @param {Object} formData - Form data object
 * @param {Array} fieldNames - Array of field names to validate
 * @returns {{valid: boolean, errors: Object}}
 */
export function validateForm(formData, fieldNames) {
  const errors = {};
  let isValid = true;

  fieldNames.forEach((fieldName) => {
    const validation = validateField(fieldName, formData[fieldName], formData);
    if (!validation.valid) {
      errors[fieldName] = validation.error;
      isValid = false;
    }
  });

  return { valid: isValid, errors };
}

/**
 * Sanitize string inputs (XSS prevention)
 * 
 * @param {string} input - String to sanitize
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize entire form data object
 * 
 * @param {Object} formData - Form data to sanitize
 * @returns {Object}
 */
export function sanitizeFormData(formData) {
  const sanitized = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Display error message near field
 * 
 * @param {string} fieldName - Field name
 * @param {string} errorMsg - Error message
 */
export function showFieldError(fieldName, errorMsg) {
  // Find error element associated with field
  let errorElement = document.getElementById(`${fieldName}-error`);

  if (!errorElement) {
    // Create error element if it doesn't exist
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (input) {
      errorElement = document.createElement('p');
      errorElement.id = `${fieldName}-error`;
      errorElement.className = 'text-red-500 text-xs mt-1';
      input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
  }

  if (errorElement) {
    errorElement.textContent = errorMsg;
    errorElement.classList.remove('hidden');
  }

  // Add red border to input fields
  const inputElement = document.querySelector(`[name="${fieldName}"]`);
  if (inputElement) {
    inputElement.style.borderColor = '#ef4444';
    inputElement.style.borderWidth = '2px';
  }

  // Add red border to form sections (for Form 3 SQD fields)
  const formSection = document.getElementById(`${fieldName}-container`);
  if (formSection) {
    formSection.classList.add('error');
  }
}

/**
 * Clear error message from field
 * 
 * @param {string} fieldName - Field name
 */
export function clearFieldError(fieldName) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  }

  // Remove red border from input fields
  const inputElement = document.querySelector(`[name="${fieldName}"]`);
  if (inputElement) {
    inputElement.style.borderColor = '';
    inputElement.style.borderWidth = '';
  }

  // Remove red border from form sections
  const formSection = document.getElementById(`${fieldName}-container`);
  if (formSection) {
    formSection.classList.remove('error');
  }
}

/**
 * Clear all errors from form
 * 
 * @param {Object} errors - Errors object from validation
 */
export function clearAllErrors(errors) {
  Object.keys(errors).forEach((fieldName) => {
    clearFieldError(fieldName);
  });
}

/**
 * Collect form data from all inputs
 * 
 * @param {string} formId - Form element ID
 * @returns {Object}
 */
export function collectFormData(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};

  const formData = {};
  const formElements = form.elements;

  for (let i = 0; i < formElements.length; i++) {
    const element = formElements[i];

    // Skip buttons, labels, and elements without name
    if (!element.name || element.type === 'button' || element.type === 'submit') {
      continue;
    }

    // Handle radio buttons and checkboxes
    if (element.type === 'radio' || element.type === 'checkbox') {
      if (element.checked) {
        formData[element.name] = element.value;
      }
    } else {
      formData[element.name] = element.value;
    }
  }

  return formData;
}

/**
 * Format form data for Firestore storage
 * 
 * @param {Object} form1Data - Client information form data
 * @param {Object} form2Data - Citizen's Charter form data
 * @param {Object} form3Data - SQD questions form data
 * @param {Object} form4Data - Suggestions form data
 * @returns {Object}
 */
export function formatSurveyForStorage(form1Data, form2Data, form3Data, form4Data) {
  return {
    // Client Information
    clientType: form1Data.clientType,
    date: form1Data.date,
    age: parseInt(form1Data.age, 10),
    serviceAvailed: form1Data.serviceAvailed,
    regionOfResidence: form1Data.regionOfResidence,
    sex: form1Data.sex,

    // Citizen's Charter
    citizensCharter: {
      cc1: form2Data.cc1,
      cc2: form2Data.cc2,
      cc3: form2Data.cc3
    },

    // Service Quality Dimensions (SQD)
    serviceQuality: {
      sqd0: form3Data.sqd0,
      sqd1: form3Data.sqd1,
      sqd2: form3Data.sqd2,
      sqd3: form3Data.sqd3,
      sqd4: form3Data.sqd4,
      sqd5: form3Data.sqd5,
      sqd6: form3Data.sqd6,
      sqd7: form3Data.sqd7,
      sqd8: form3Data.sqd8
    },

    // Feedback & Contact
    feedback: {
      suggestions: form4Data.suggestions || '',
      email: form4Data.email || ''
    },

    // Metadata
    completionStatus: 'completed',
    privacyAccepted: true
  };
}
