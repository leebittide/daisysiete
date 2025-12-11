/**
 * Survey Backend - Testing & Example Data
 * =======================================
 * 
 * Use this file to understand the expected data format,
 * test validation rules, and debug issues.
 */

// ===== EXAMPLE 1: Valid Survey Data =====

const validSurveyData = {
  // Client Information (Form 1)
  clientType: "citizen",
  date: "2025-11-28",
  age: 35,
  serviceAvailed: "License Renewal",
  regionOfResidence: "Valenzuela, Metro Manila",
  sex: "Male",

  // Citizens Charter (Form 2)
  citizensCharter: {
    cc1: "1",  // "I know what a CC is and I saw this office's CC"
    cc2: "Easy to see",
    cc3: "Helped very much"
  },

  // Service Quality Dimensions (Form 3) - 5-point scale
  serviceQuality: {
    sqd0: "5",  // CSAT: Highly Satisfied
    sqd1: "5",  // Professionalism
    sqd2: "4",  // Speed of Service
    sqd3: "5",  // Accuracy
    sqd4: "5",  // Courtesy
    sqd5: "4",  // Cleanliness
    sqd6: "5",  // Signage/Visibility
    sqd7: "5",  // Security
    sqd8: "4"   // Overall Experience
  },

  // Feedback & Contact (Form 4)
  feedback: {
    suggestions: "Better parking areas needed in the building",
    email: "user@example.com"
  },

  // Auto-added by backend
  completionStatus: "completed",
  privacyAccepted: true,
  submittedAt: "2025-11-28T10:30:45.123Z",
  ipAddress: "203.0.113.42",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  surveyVersion: "1.0"
};

// ===== EXAMPLE 2: Invalid Survey Data (Will Fail Validation) =====

const invalidSurveyData = {
  clientType: "invalid-type",  // ❌ Not in allowed values
  date: "2025-12-31",          // ❌ Future date (not allowed)
  age: 200,                     // ❌ Out of range (1-150)
  serviceAvailed: "X",          // ❌ Too short (min 2 chars)
  regionOfResidence: "",        // ❌ Empty (required)
  sex: "Maybe",                 // ❌ Invalid option
  citizensCharter: {
    cc1: "invalid",
    cc2: "Not visible at all"
  },
  serviceQuality: {
    // ❌ Missing sqd2, sqd4, sqd6, sqd8
  },
  feedback: {
    suggestions: "X".repeat(600),  // ❌ Too long (max 500)
    email: "invalid-email"         // ❌ Missing @ symbol
  }
};

// ===== VALIDATION PATTERNS =====

const VALIDATION_EXAMPLES = {
  email: {
    valid: ["user@example.com", "john.doe@company.co.uk"],
    invalid: ["invalidemail", "user@", "@example.com"]
  },

  phone: {
    valid: ["09171234567", "+63917123456", "02-8123456"],
    invalid: ["123", "abcd"]
  },

  age: {
    valid: [1, 18, 35, 65, 150],
    invalid: [0, -5, 151, 999, "thirty-five"]
  },

  serviceAvailed: {
    valid: [
      "License Renewal",
      "Birth Certificate",
      "Vehicle Registration",
      "Business Permit"
    ],
    invalid: [
      "X",  // Too short
      "@#$%",  // Invalid characters
      "Service".repeat(50)  // Too long
    ]
  },

  regionOfResidence: {
    valid: [
      "Valenzuela",
      "Manila",
      "Metro Manila",
      "Calabarzon"
    ],
    invalid: [
      "X",  // Too short
      ""  // Empty
    ]
  },

  suggestions: {
    valid: [
      "Great service!",
      "Could improve parking",
      ""  // Optional field
    ],
    invalid: [
      "X".repeat(501)  // Too long (max 500)
    ]
  }
};

// ===== FIELD VALIDATION TEST CASES =====

const TEST_CASES = [
  {
    field: "age",
    testCases: [
      { value: "35", valid: true, reason: "Within range 1-150" },
      { value: "0", valid: false, reason: "Below minimum" },
      { value: "151", valid: false, reason: "Above maximum" },
      { value: "abc", valid: false, reason: "Not a number" },
      { value: "35.5", valid: false, reason: "Not an integer" }
    ]
  },

  {
    field: "clientType",
    testCases: [
      { value: "citizen", valid: true, reason: "Valid option" },
      { value: "business", valid: true, reason: "Valid option" },
      { value: "government", valid: true, reason: "Valid option" },
      { value: "other", valid: false, reason: "Not in allowed list" },
      { value: "", valid: false, reason: "Empty/required" }
    ]
  },

  {
    field: "email",
    testCases: [
      { value: "user@example.com", valid: true, reason: "Valid email" },
      { value: "john.doe@company.co.uk", valid: true, reason: "Valid email" },
      { value: "", valid: true, reason: "Optional field, empty is ok" },
      { value: "invalidemail", valid: false, reason: "Missing @" },
      { value: "user@", valid: false, reason: "Incomplete domain" }
    ]
  },

  {
    field: "date",
    testCases: [
      { value: "2025-11-28", valid: true, reason: "Today's date" },
      { value: "2025-01-01", valid: true, reason: "Past date" },
      { value: "2025-12-31", valid: false, reason: "Future date not allowed" },
      { value: "invalid-date", valid: false, reason: "Invalid format" }
    ]
  },

  {
    field: "sex",
    testCases: [
      { value: "Male", valid: true, reason: "Valid option" },
      { value: "Female", valid: true, reason: "Valid option" },
      { value: "Others", valid: true, reason: "Valid option" },
      { value: "Other", valid: false, reason: "Incorrect capitalization" },
      { value: "", valid: false, reason: "Empty/required" }
    ]
  }
];

// ===== FORM PROGRESSION EXAMPLES =====

const FORM_NAVIGATION_FLOW = {
  start: {
    currentForm: 1,
    visible: "form-1",
    action: "User sees Client Information form"
  },

  afterForm1: {
    currentForm: 2,
    visible: "form-2",
    formData: {
      form1: {
        clientType: "citizen",
        date: "2025-11-28",
        age: 35,
        serviceAvailed: "License Renewal",
        regionOfResidence: "Valenzuela",
        sex: "Male"
      }
    },
    action: "User fills Citizens Charter questions"
  },

  afterForm2: {
    currentForm: 3,
    visible: "form-3",
    formData: {
      form1: { /* same as above */ },
      form2: {
        cc1: "1",
        cc2: "Easy to see",
        cc3: "Helped very much"
      }
    },
    action: "User rates Service Quality (SQD 0-8)"
  },

  afterForm3: {
    currentForm: 4,
    visible: "form-4",
    formData: {
      form1: { /* ... */ },
      form2: { /* ... */ },
      form3: {
        sqd0: "5",
        sqd1: "5",
        sqd2: "4",
        sqd3: "5",
        sqd4: "5",
        sqd5: "4",
        sqd6: "5",
        sqd7: "5",
        sqd8: "4"
      }
    },
    action: "User submits optional suggestions and email"
  },

  afterForm4: {
    currentForm: null,
    visible: "thank-you-modal",
    formData: {
      form1: { /* ... */ },
      form2: { /* ... */ },
      form3: { /* ... */ },
      form4: {
        suggestions: "Better parking needed",
        email: "user@example.com"
      }
    },
    action: "Survey submitted to Firestore, user sees thank you"
  }
};

// ===== CONDITIONAL VALIDATION EXAMPLE =====

const CONDITIONAL_VALIDATION = {
  scenario: "User selects 'unaware' for CC1 question",
  
  cc1Value: "4",  // "I do not know what a CC is"
  
  effect: "CC2 and CC3 automatically set to N/A (not applicable)",
  
  result: {
    cc1: "4",
    cc2: "Not Applicable",  // Auto-filled
    cc3: "Not Applicable"   // Auto-filled
  },

  validation: "CC2 and CC3 no longer required"
};

// ===== DUPLICATE SUBMISSION DETECTION =====

const DUPLICATE_SUBMISSION_EXAMPLE = {
  firstSubmission: {
    time: "2025-11-28T10:00:00Z",
    clientType: "citizen",
    email: "user@example.com",
    stored: "localStorage['lastSurveySubmission_citizen_user@example.com'] = 1732786800000"
  },

  secondAttemptWithin5Minutes: {
    time: "2025-11-28T10:04:00Z",  // 4 minutes later
    clientType: "citizen",
    email: "user@example.com",
    check: "timeDiff = (10:04 - 10:00) = 4 minutes",
    result: "BLOCKED - 'You have already submitted a survey recently. Please wait a few minutes.'"
  },

  thirdAttemptAfter5Minutes: {
    time: "2025-11-28T10:06:00Z",  // 6 minutes later
    clientType: "citizen",
    email: "user@example.com",
    check: "timeDiff = (10:06 - 10:00) = 6 minutes",
    result: "ALLOWED - new submission accepted"
  },

  edgeCase: "Different email = different submission allowed immediately"
};

// ===== XSS PREVENTION EXAMPLES =====

const XSS_SANITIZATION = {
  input: '<script>alert("xss")</script>',
  
  before: {
    raw: '<script>alert("xss")</script>',
    unsafe: "Script would execute"
  },

  after: {
    sanitized: '&lt;script&gt;alert("xss")&lt;/script&gt;',
    safe: "Script tags are escaped, no execution"
  },

  method: "sanitizeInput() uses textContent, not innerHTML"
};

// ===== ERROR HANDLING SCENARIOS =====

const ERROR_SCENARIOS = [
  {
    scenario: "User submits with empty required field",
    error: "Please enter a valid age (1-150)",
    trigger: "validateField('age', '', formData)",
    userSees: "Red error text below age input"
  },

  {
    scenario: "User submits invalid email",
    error: "Please enter a valid email address",
    trigger: "validateField('email', 'invalid', formData)",
    userSees: "Error message appears below email field"
  },

  {
    scenario: "Network error during submission",
    error: "Failed to save survey response. Please try again.",
    trigger: "saveSurveyResponse() fails",
    userSees: "Alert popup with error message"
  },

  {
    scenario: "User tries to submit duplicate survey",
    error: "You have already submitted a survey recently. Please wait a few minutes.",
    trigger: "checkDuplicateSubmission() returns true",
    userSees: "Alert popup, user stays on Form 4"
  },

  {
    scenario: "Firestore rules reject submission",
    error: "Permission denied - check Firestore rules",
    trigger: "Security rules fail validation",
    userSees: "Console error + generic failure message"
  }
];

// ===== FIRESTORE DOCUMENT EXAMPLES =====

const FIRESTORE_DOCUMENTS = {
  "docId_12345": {
    clientType: "citizen",
    date: "2025-11-28",
    age: 35,
    serviceAvailed: "License Renewal",
    regionOfResidence: "Valenzuela, Metro Manila",
    sex: "Male",
    citizensCharter: {
      cc1: "1",
      cc2: "Easy to see",
      cc3: "Helped very much"
    },
    serviceQuality: {
      sqd0: "5",
      sqd1: "5",
      sqd2: "4",
      sqd3: "5",
      sqd4: "5",
      sqd5: "4",
      sqd6: "5",
      sqd7: "5",
      sqd8: "4"
    },
    feedback: {
      suggestions: "Better parking needed",
      email: "user@example.com"
    },
    completionStatus: "completed",
    privacyAccepted: true,
    submittedAt: "2025-11-28T10:30:45.123Z",
    ipAddress: "203.0.113.42",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    surveyVersion: "1.0"
  },

  "docId_12346": {
    clientType: "business",
    date: "2025-11-27",
    age: 52,
    serviceAvailed: "Business Permit Renewal",
    regionOfResidence: "Quezon City",
    sex: "Female",
    citizensCharter: {
      cc1: "2",
      cc2: "Somewhat easy to see",
      cc3: "Somewhat helped"
    },
    serviceQuality: {
      sqd0: "4",
      sqd1: "4",
      sqd2: "3",
      sqd3: "4",
      sqd4: "4",
      sqd5: "3",
      sqd6: "4",
      sqd7: "4",
      sqd8: "3"
    },
    feedback: {
      suggestions: "",  // Optional field can be empty
      email: ""  // Optional field can be empty
    },
    completionStatus: "completed",
    privacyAccepted: true,
    submittedAt: "2025-11-27T14:15:30.456Z",
    ipAddress: "203.0.113.99",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
    surveyVersion: "1.0"
  }
};

// ===== ANALYTICS QUERIES (For Future Phase 2) =====

const FUTURE_ANALYTICS = {
  query1: "Average satisfaction by region",
  firebase: "db.collection('survey_responses').where('regionOfResidence', '==', 'Valenzuela').get()",
  
  query2: "Satisfaction trend over time",
  firebase: "db.collection('survey_responses').where('submittedAt', '>=', startDate).orderBy('submittedAt').get()",
  
  query3: "Service quality by client type",
  firebase: "db.collection('survey_responses').where('clientType', '==', 'citizen').get()",
  
  query4: "Citizens Charter awareness",
  firebase: "db.collection('survey_responses').where('citizensCharter.cc1', '==', '4').get()",
  
  query5: "Suggestions for improvement",
  firebase: "db.collection('survey_responses').where('feedback.suggestions', '!=', '').get()"
};

// ===== TESTING CHECKLIST =====

const TESTING_CHECKLIST = {
  validation: {
    description: "Test each form's validation",
    tests: [
      "Submit Form 1 with missing required field → Shows error",
      "Submit Form 1 with age = 200 → Shows error",
      "Submit Form 1 with invalid date → Shows error",
      "Submit Form 2 without selecting CC1 → Shows error",
      "Select CC1=4 (unaware) → CC2 and CC3 auto-set to N/A",
      "Submit Form 3 without all SQD answers → Shows error",
      "Submit Form 4 with invalid email → Shows error",
      "Submit Form 4 with suggestions > 500 chars → Shows error"
    ]
  },

  formNavigation: {
    description: "Test form progression",
    tests: [
      "Click Next on Form 1 → Advances if valid",
      "Click Back on Form 2 → Returns to Form 1",
      "Form 1 data preserved after going to Form 2 → Back to Form 1",
      "Progress bar updates at each form",
      "Submit clears and redirects to home"
    ]
  },

  firebase: {
    description: "Test Firebase integration",
    tests: [
      "Complete survey submission → Document created in Firestore",
      "Document contains all form fields",
      "submittedAt has server timestamp (not client)",
      "ipAddress and userAgent populated",
      "Second submission within 5 mins → Blocked",
      "Second submission after 5 mins → Allowed",
      "XSS attempt sanitized (no <script> tags)"
    ]
  },

  errorHandling: {
    description: "Test error scenarios",
    tests: [
      "Submit with network offline → Shows error message",
      "Invalid Firestore rules → Shows permission error",
      "Duplicate submission → Shows 'already submitted' message",
      "Form field validation error → Red text near field"
    ]
  },

  security: {
    description: "Test security features",
    tests: [
      "Cannot bypass validation (client-side)",
      "Firestore rules reject invalid data",
      "Email format validated",
      "Age range enforced",
      "XSS payload in suggestions → Sanitized"
    ]
  }
};

// ===== BROWSER CONSOLE DEBUGGING =====

const DEBUGGING_TIPS = {
  checkValidation: {
    command: 'localStorage.getItem("surveyState")',
    reason: "View current form data"
  },

  checkSubmissionHistory: {
    command: 'Object.entries(localStorage).filter(([k]) => k.includes("lastSurveySubmission"))',
    reason: "View duplicate submission timestamps"
  },

  resetSurvey: {
    command: 'localStorage.clear()',
    reason: "Clear all survey data (for testing)"
  },

  checkFirebaseErrors: {
    command: 'console.log(error)',
    reason: "See full error message when submission fails"
  },

  manualValidation: {
    command: 'validateField("age", "35", {})',
    reason: "Test validation function directly"
  },

  checkFormData: {
    command: 'collectFormData("form-1")',
    reason: "View collected form data"
  }
};

// ===== EXPECTED CONSOLE OUTPUT =====

const EXPECTED_LOGS = [
  {
    event: "Page loads",
    logs: [
      "✓ Firebase initialized",
      "✓ Firestore enabled",
      "✓ Persistence enabled"
    ]
  },

  {
    event: "User fills and submits Form 1",
    logs: [
      "✓ Form 1 validation passed",
      "✓ Data stored in surveyState",
      "✓ Advancing to Form 2"
    ]
  },

  {
    event: "User submits complete survey",
    logs: [
      "✓ All forms validated",
      "✓ Data sanitized",
      "✓ Duplicate check: No recent submission",
      "✓ Saving to Firestore...",
      "✓ Survey saved with docId: <auto-id>",
      "✓ Showing thank you modal"
    ]
  },

  {
    event: "User tries duplicate submission",
    logs: [
      "✓ Duplicate submission detected",
      "✓ Last submission was X minutes ago",
      "✓ Showing error: 'Already submitted'"
    ]
  }
];

// Export for use in testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validSurveyData,
    invalidSurveyData,
    VALIDATION_EXAMPLES,
    TEST_CASES,
    FORM_NAVIGATION_FLOW,
    CONDITIONAL_VALIDATION,
    DUPLICATE_SUBMISSION_EXAMPLE,
    XSS_SANITIZATION,
    ERROR_SCENARIOS,
    FIRESTORE_DOCUMENTS,
    FUTURE_ANALYTICS,
    TESTING_CHECKLIST,
    DEBUGGING_TIPS,
    EXPECTED_LOGS
  };
}
