/**
 * Firebase Configuration & Initialization
 * ======================================
 * 
 * This module initializes Firebase with modular SDK v9+
 * and provides core Firestore functions for survey submissions.
 * 
 * Uses Firestore (not Realtime Database) because:
 * - Better for structured survey data
 * - Built-in document validation & indexes
 * - Easier security rules implementation
 * - Better query capabilities for analytics/reports
 * - Auto-generated document IDs for submissions
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase configuration from survey.html
const firebaseConfig = {
  apiKey: "AIzaSyBlmbelcBvE8T-j2_bCeam5oGR7g3zhLz8",
  authDomain: "daisysyete-c9511.firebaseapp.com",
  projectId: "daisysyete-c9511",
  storageBucket: "daisysyete-c9511.firebasestorage.app",
  messagingSenderId: "84742185648",
  appId: "1:84742185648:web:05d506b26a2b725644d175",
  measurementId: "G-0H67RTVBTQ"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Enable offline persistence for better UX
try {
  enableIndexedDbPersistence(db);
} catch (err) {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open; persistence disabled.');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support persistence.');
  }
}

/**
 * Save survey response to Firestore
 * 
 * @param {Object} surveyData - Validated survey data object
 * @returns {Promise<{success: boolean, docId?: string, error?: string}>}
 */
export async function saveSurveyResponse(surveyData) {
  try {
    // Add document to survey_responses collection with auto-generated ID
    // Server timestamp is added automatically by Firestore
    const docRef = await addDoc(collection(db, 'survey_responses'), {
      ...surveyData,
      submittedAt: serverTimestamp(),
      ipAddress: await getClientIP(), // For analytics/security
      userAgent: navigator.userAgent, // For compatibility tracking
      surveyVersion: '1.0' // For schema versioning
    });

    return {
      success: true,
      docId: docRef.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error saving survey response:', error);
    return {
      success: false,
      error: error.message || 'Failed to save survey response. Please try again.'
    };
  }
}

/**
 * Get client IP address (for analytics)
 * Falls back gracefully if service is unavailable
 * 
 * @returns {Promise<string>}
 */
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json', { timeout: 5000 });
    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
  } catch (error) {
    // Silently fail - IP is not critical
  }
  return 'unknown';
}

/**
 * Check if a duplicate submission exists within time window
 * Helps prevent accidental duplicate submissions
 * 
 * @param {string} clientType - User's client type
 * @param {string} email - User's email (if provided)
 * @param {number} minutesWindow - Time window in minutes (default: 5)
 * @returns {Promise<boolean>}
 */
export async function checkDuplicateSubmission(clientType, email, minutesWindow = 5) {
  try {
    // In a real implementation, this would query Firestore for recent submissions
    // For now, we'll use localStorage as a client-side fallback
    const lastSubmissionKey = `lastSurveySubmission_${clientType}_${email}`;
    const lastSubmission = localStorage.getItem(lastSubmissionKey);

    if (lastSubmission) {
      const lastTime = parseInt(lastSubmission, 10);
      const currentTime = Date.now();
      const timeDiff = (currentTime - lastTime) / (1000 * 60); // Convert to minutes

      if (timeDiff < minutesWindow) {
        return true; // Duplicate detected
      }
    }

    return false; // No duplicate
  } catch (error) {
    console.error('Error checking duplicate submission:', error);
    return false; // Let submission proceed on error
  }
}

/**
 * Mark submission in localStorage to track duplicates
 * 
 * @param {string} clientType - User's client type
 * @param {string} email - User's email
 */
export function markSubmissionTime(clientType, email) {
  const lastSubmissionKey = `lastSurveySubmission_${clientType}_${email}`;
  localStorage.setItem(lastSubmissionKey, Date.now().toString());
}

export { db, app };
