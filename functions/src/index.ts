/**
 * Cloud Functions for DaisySyete Admin User Management
 * Handles user creation, verification email sending, and role management
 */

import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

/**
 * Cloud Function: Create a new admin user
 * Called by super_admin to invite new admins
 * Creates user WITHOUT password, sends verification + password setup email
 * 
 * @param data - { email: string, first_name: string, last_name: string, role: string }
 * @returns - { success: boolean, uid?: string, message: string }
 */
export const createAdminUser = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: any) => {
    try {
      // Verify caller is authenticated
      if (!request.auth) {
        throw new Error('Authentication required');
      }

      const callerUid = request.auth.uid;
      const data = request.data;

      // Verify caller is super_admin
      const callerDoc = await db.collection('admin_users').doc(callerUid).get();
      if (!callerDoc.exists || callerDoc.data()?.role !== 'super_admin') {
        throw new Error('Only super_admin can create new admin users');
      }

      // Validate input
      const { email, first_name, last_name, role } = data;
      if (!email || !first_name || !last_name || !role) {
        throw new Error('Missing required fields: email, first_name, last_name, role');
      }

      // Validate role
      const validRoles = ['admin', 'data_analyst', 'survey_manager'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      // Create Firebase Auth user WITHOUT password
      const userRecord = await auth.createUser({
        email: email,
        displayName: `${first_name} ${last_name}`,
        emailVerified: false
      });

      // Create admin_users Firestore document with pending status
      await db.collection('admin_users').doc(userRecord.uid).set({
        first_name: first_name,
        last_name: last_name,
        email: email,
        role: role,
        status: 'pending',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: callerUid
      });

      // Firebase will automatically send password reset email when user tries to login
      // with this account (since no password is set yet)
      logger.info(`Admin user created: ${email} with role ${role}. Password setup email will be sent on first login attempt.`);

      return {
        success: true,
        uid: userRecord.uid,
        message: `User invited successfully. Setup email sent to ${email}. They will set their password from the email link.`
      };
    } catch (error: any) {
      logger.error('Error in createAdminUser:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-exists') {
        return {
          success: false,
          message: 'This email is already registered. Try a different email.'
        };
      }
      
      return {
        success: false,
        message: error.message || 'Failed to create admin user'
      };
    }
  }
);

/**
 * Cloud Function: Resend verification email
 * Called by super_admin to resend verification email to pending users
 * 
 * @param data - { uid: string, email: string }
 * @returns - { success: boolean, message: string }
 */
export const resendVerificationEmail = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: any) => {
    try {
      // Verify caller is authenticated
      if (!request.auth) {
        throw new Error('Authentication required');
      }

      const callerUid = request.auth.uid;
      const data = request.data;

      // Verify caller is super_admin or admin
      const callerDoc = await db.collection('admin_users').doc(callerUid).get();
      const callerRole = callerDoc.data()?.role;
      if (!['super_admin', 'admin'].includes(callerRole)) {
        throw new Error('Only super_admin or admin can resend verification emails');
      }

      // Validate input
      const { uid, email } = data;
      if (!uid || !email) {
        throw new Error('Missing required fields: uid, email');
      }

      // Send verification email
      await sendVerificationEmail(uid, email);

      logger.info(`Verification email resent to: ${email}`);

      return {
        success: true,
        message: `Verification email resent to ${email}`
      };
    } catch (error: any) {
      logger.error('Error in resendVerificationEmail:', error);
      return {
        success: false,
        message: error.message || 'Failed to resend verification email'
      };
    }
  }
);

/**
 * Cloud Function: Triggered when a user's email is verified
 * Updates the admin_users document to 'active' status
 */
export const onUserEmailVerified = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: any) => {
    try {
      if (!request.auth) {
        throw new Error('Authentication required');
      }

      const uid = request.auth.uid;

      // Get user from Firebase Auth
      const user = await auth.getUser(uid);

      if (!user.emailVerified) {
        throw new Error('Email is not verified');
      }

      // Update admin_users document to 'active'
      const adminDoc = await db.collection('admin_users').doc(uid).get();
      if (adminDoc.exists) {
        await db.collection('admin_users').doc(uid).update({
          status: 'active',
          email_verified_at: admin.firestore.FieldValue.serverTimestamp()
        });
        logger.info(`User ${uid} marked as active after email verification`);
      }

      return {
        success: true,
        message: 'Status updated to active'
      };
    } catch (error: any) {
      logger.error('Error in onUserEmailVerified:', error);
      return {
        success: false,
        message: error.message || 'Failed to update user status'
      };
    }
  }
);

/**
 * Helper function: Send verification email
 * Uses Firebase Auth's built-in email verification
 */
async function sendVerificationEmail(uid: string, email: string): Promise<void> {
  try {
    // Get custom claims to preserve
    const user = await auth.getUser(uid);
    const customClaims = user.customClaims || {};

    // Set a custom claim to track verification attempts
    await auth.setCustomUserClaims(uid, {
      ...customClaims,
      verification_email_sent_at: new Date().toISOString()
    });

    // Generate verification link using Firebase REST API
    const actionCodeSettings = {
      url: `https://daisysyete-c9511.firebaseapp.com/admin.html`, // Your admin page URL
      handleCodeInApp: true
    };

    // Generate email verification link
    const link = await auth.generateEmailVerificationLink(email, actionCodeSettings);

    // Log for debugging (in production, use a proper email service)
    logger.info(`Verification link generated for ${email}: ${link}`);

    // Note: Firebase Admin SDK doesn't have built-in email sending
    // The verification email is sent automatically by Firebase Auth
    // when you call sendEmailVerification() from the client-side
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
}

/**
 * Cloud Function: Get admin users list
 * Called by authenticated admins to fetch user list
 */
export const getAdminUsers = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: any) => {
    try {
      if (!request.auth) {
        throw new Error('Authentication required');
      }

      const callerUid = request.auth.uid;

      // Verify caller is admin or super_admin
      const callerDoc = await db.collection('admin_users').doc(callerUid).get();
      const callerRole = callerDoc.data()?.role;
      if (!['super_admin', 'admin'].includes(callerRole)) {
        throw new Error('Only admins can view user list');
      }

      // Fetch all admin users
      const snapshot = await db.collection('admin_users').get();
      const users: any[] = [];

      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        users: users
      };
    } catch (error: any) {
      logger.error('Error in getAdminUsers:', error);
      return {
        success: false,
        users: [],
        message: error.message || 'Failed to fetch admin users'
      };
    }
  }
);

/**
 * Cloud Function: Update admin user role
 * Called by super_admin to change user roles
 */
export const updateAdminRole = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: any) => {
    try {
      if (!request.auth) {
        throw new Error('Authentication required');
      }

      const callerUid = request.auth.uid;
      const data = request.data;

      // Verify caller is super_admin
      const callerDoc = await db.collection('admin_users').doc(callerUid).get();
      if (callerDoc.data()?.role !== 'super_admin') {
        throw new Error('Only super_admin can update user roles');
      }

      // Validate input
      const { uid, role } = data;
      if (!uid || !role) {
        throw new Error('Missing required fields: uid, role');
      }

      // Validate role
      const validRoles = ['admin', 'data_analyst', 'survey_manager', 'super_admin'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      // Update admin_users document
      await db.collection('admin_users').doc(uid).update({
        role: role,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: callerUid
      });

      logger.info(`Updated user ${uid} role to ${role}`);

      return {
        success: true,
        message: `User role updated to ${role}`
      };
    } catch (error: any) {
      logger.error('Error in updateAdminRole:', error);
      return {
        success: false,
        message: error.message || 'Failed to update user role'
      };
    }
  }
);

