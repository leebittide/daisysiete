# ARTA CSS System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Authentication System](#authentication-system)
5. [User Management & RBAC](#user-management--rbac)
6. [Survey Management](#survey-management)
7. [Admin Features](#admin-features)
8. [Firebase Configuration](#firebase-configuration)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

**ARTA CSS System** is a comprehensive Customer Satisfaction Survey platform built for the City Government of Valenzuela. It provides:

- **Admin Dashboard**: Analytics, user management, survey question management
- **Survey Platform**: User-friendly survey interface for citizens and businesses
- **Compliance Reporting**: PDF generation with ARTA-compliant metrics
- **Role-Based Access Control**: Super Admin, Admin, Data Analyst, Survey Manager roles
- **Firebase Backend**: Real-time data synchronization using Firestore and Firebase Auth

**Key Technologies:**
- Frontend: HTML, CSS (Tailwind), JavaScript (Vanilla)
- Backend: Firebase Firestore, Firebase Authentication
- Charts: Chart.js v4.4.0
- PDF Generation: html2pdf.js v0.10.1
- Icons: Lucide Icons

---

## Getting Started

### Prerequisites
- Node.js 16+ 
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project configured for the application

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/leebittar/DaisySyete.git
   cd DaisySyete
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Firebase functions dependencies:**
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Configure Firebase:**
   Update `firebase-config.js` with your Firebase project credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

---

## Project Structure

```
DaisySyete/
├── index.html                    # User survey interface
├── admin.html                    # Admin dashboard
├── survey.html                   # Survey form
├── about.html, help.html, howitworks.html  # Info pages
├── firebase-config.js            # Firebase configuration
├── firebase.json                 # Firebase hosting config
├── firestore.rules              # Firestore security rules
├── rbac.js                      # Role-based access control
├── script.js                    # Survey platform script
├── survey-submission.js         # Submission handler
├── survey-validation.js         # Form validation
├── style.css                    # Global styles
├── package.json                 # Dependencies
├── functions/                   # Cloud Functions (if used)
│   ├── index.js
│   ├── src/index.ts
│   └── package.json
├── Admin Side/                  # Admin UI components
│   ├── Nav Admin/              # Navigation & branding
│   ├── Dashboard Main/         # Dashboard components
│   ├── Compliance Reports/     # Report generation
│   ├── ManageQuestions/        # Question management
│   ├── UserManagement/         # User management
│   └── Login/                  # Login assets
└── User View/                   # User-facing components
    ├── Nav/                    # Navigation
    ├── Survey/                 # Survey pages
    ├── AboutUs/                # About page
    ├── Help/                   # Help page
    └── Footer/                 # Footer components
```

---

## Authentication System

### Firebase Auth Integration

**User Creation Process:**

1. **Super Admin invites user** via User Management tab
2. **Firebase Auth user created** immediately with temporary password
3. **Pending invite stored** in `pending_invites` collection
4. **User receives credentials** in success modal with copy button
5. **User logs in** with email and temporary password
6. **Account activated** when Super Admin sets status to 'active' in User Management
7. **User can change password** in next login

### Login Flow

```
User enters email/password
    ↓
Query admin_users collection by email
    ↓
Check if status === 'active'
    ↓
If active: Proceed to dashboard
If inactive: Show "pending activation" message
```

### Firestore Collections

#### `admin_users`
```javascript
{
  email: string,
  first_name: string,
  last_name: string,
  role: 'super_admin' | 'admin' | 'data_analyst' | 'survey_manager',
  status: 'active' | 'inactive',
  created_at: timestamp,
  created_by: uid,
  activated_at: timestamp,
  activated_by: uid
}
```

#### `pending_invites`
```javascript
{
  email: string,
  first_name: string,
  last_name: string,
  role: string,
  temp_password: string,
  firebase_uid: string,
  status: 'pending',
  created_at: timestamp,
  created_by: uid
}
```

---

## User Management & RBAC

### User Roles

| Role | Permissions | Features |
|------|---|---|
| **Super Admin** | All operations | User Management, Manage Questions, Dashboard, Raw Responses, Compliance Reports |
| **Admin** | Full operational access | User Management, Manage Questions, Dashboard, Raw Responses, Compliance Reports |
| **Data Analyst** | Read-only data access | Dashboard, Raw Responses, Compliance Reports |
| **Survey Manager** | Content management | Dashboard, Manage Questions |

### Role-Based Access Control (RBAC)

**Frontend Implementation (`rbac.js`):**
- Tabs are grayed out for restricted roles
- Navigation is blocked with toast messages
- UI updates based on user role

**Backend Implementation (`firestore.rules`):**
- CREATE/UPDATE/DELETE operations validated
- Collection-level and document-level access control
- Helper functions: `isAuthenticated()`, `isSuperAdmin()`, `getUserRole()`

### Inviting a New User

1. Navigate to **User Management** tab
2. Click **Add User** button
3. Fill in:
   - First Name
   - Last Name
   - Email
   - Role (Admin, Data Analyst, Survey Manager)
4. Click **Invite User**
5. Copy credentials from success modal
6. Share credentials with new user
7. User logs in and changes password
8. Super Admin activates account by setting status to 'active'

---

## Survey Management

### Survey Questions

**Default questions include:**
- Client Type (Citizen, Business, Government)
- Age
- Service Availed
- Region of Residence
- Sex
- Citizens Charter Questions (CC)
- Service Quality (SQD) Ratings (9 metrics)
- Feedback & Suggestions

**Question Management:**
- Load default questions via "Load Default Questions" button
- Add custom questions via "Add CGOV Question"
- Edit/Delete existing questions
- All changes are real-time via Firestore

### Survey Submission

**Process:**
1. User fills survey form
2. Data validated (all required fields, correct types)
3. Submitted to `survey_responses` collection
4. Real-time updates visible in Admin Dashboard

**Data Structure:**
```javascript
{
  clientType: string,
  date: string (ISO),
  age: number,
  serviceAvailed: string,
  regionOfResidence: string,
  sex: string,
  citizensCharter: { cc1, cc2, cc3: number },
  serviceQuality: { sqd0-sqd8: number },
  feedback: { suggestions: string, email: string }
}
```

---

## Admin Features

### Dashboard Analytics

**Real-time Metrics:**
- Total Responses count
- Average Satisfaction (SQD score)
- Most Availed Service
- Client Type Distribution

**Charts:**
- Average Rating per Service (Bar Chart)
- Client Type Distribution (Pie Chart)

### Raw Responses

- View all survey submissions
- Filter by date, region, client type
- Export data for analysis
- Real-time updates from Firestore

### Compliance Reports

**Generate Reports:**
1. **CSV Export**: Download raw data for Excel analysis
2. **ARTA Compliance PDF**: Official report with:
   - Executive Summary
   - Analytics charts
   - Compliance metrics
   - Response statistics
   - Satisfaction breakdown
3. **Comprehensive Report**: Full ARTA submission-ready document

**PDF Features:**
- Professional formatting
- Multiple sections (Overview, Metrics, Feedback)
- Charts and visualizations
- Customizable content
- Download-ready format

---

## Firebase Configuration

### Firestore Security Rules

**Location:** `firestore.rules`

**Key Rules:**

1. **Authentication Check:**
   ```firestore
   function isAuthenticated() {
     return request.auth != null;
   }
   ```

2. **Super Admin Check:**
   ```firestore
   function isSuperAdmin() {
     return request.auth != null &&
            (request.auth.token.role == 'super_admin' ||
             (exists(/databases/$(database)/documents/admin_users/$(request.auth.uid)) &&
              get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.role == 'super_admin'));
   }
   ```

3. **Collections:**
   - `admin_users`: All authenticated users can read; super_admin can create/update/delete
   - `pending_invites`: All authenticated users can CRUD (frontend enforces permissions)
   - `survey_questions`: All authenticated users can read; survey_manager/admin can write
   - `survey_responses`: All authenticated users can read/write their own
   - `reports`: Super admin only

### Environment Variables

**firebase-config.js:**
```javascript
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
```

---

## Deployment

### Firebase Hosting

1. **Build/prepare files** (already HTML/CSS/JS ready)
2. **Deploy:**
   ```bash
   firebase deploy
   ```
   Or specific services:
   ```bash
   firebase deploy --only hosting
   firebase deploy --only firestore:rules
   firebase deploy --only functions
   ```

3. **Verify deployment:**
   ```bash
   firebase hosting:channel:list
   ```

### Production Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database initialized
- [ ] Security rules deployed
- [ ] Super admin account created in Firestore
- [ ] Admin interface accessible at `/admin.html`
- [ ] User survey interface accessible at `/index.html`
- [ ] HTTPS enabled (automatic with Firebase Hosting)
- [ ] Monitoring enabled in Firebase Console

---

## Troubleshooting

### Common Issues

#### 1. "Permission denied" on User Management tab
**Solution:**
- Check Firestore security rules
- Verify user has 'admin' role in admin_users collection
- Rules must allow authenticated users to read admin_users collection

#### 2. User cannot login after invitation
**Possible causes:**
- User account not yet created in Firebase Auth
- User status not set to 'active' in admin_users
- Email doesn't match exactly

**Solution:**
- Check pending_invites collection
- Manually activate user in User Management tab
- Verify email spelling

#### 3. Survey responses not showing in dashboard
**Solution:**
- Verify `survey_responses` collection has documents
- Check Firestore security rules allow reading
- Clear browser cache and refresh
- Check browser console for errors

#### 4. PDF generation fails
**Solution:**
- Ensure html2pdf.js is loaded
- Check for console errors
- Verify data exists in collections
- Try exporting to CSV first

#### 5. Role-based access control not working
**Solution:**
- Check ROLE_ALLOWED_VIEWS in rbac.js
- Verify user role is correct in admin_users
- Check browser sessionStorage for adminUser
- Clear sessionStorage and re-login

### Debug Mode

**Check browser console for:**
```javascript
// Firestore queries
console.log('[admin.html] admin_users snapshot received');
console.log('[admin.html] pending_invites snapshot received');

// Authentication
console.log('User authenticated:', currentUser.email);
console.log('User role:', userRole);

// Navigation
console.log('Navigating to:', view);
console.log('Access denied:', view);
```

### Firebase Console

Monitor real-time issues:
1. Go to Firebase Console
2. Check **Firestore** → Collections
3. Check **Authentication** → Users
4. Check **Realtime Database** → Rules
5. Check **Functions** → Logs

---

## API Reference

### Key Functions

#### Admin Authentication
```javascript
async function validateAdminLogin(email, password)
// Returns: { success: true/false, user: {...}, message: string }
```

#### User Invitation
```javascript
async function inviteUser(firstName, lastName, email, role)
// Returns: { success: true/false, uid: string, tempPassword: string }
```

#### Load Users
```javascript
function loadAdminUsers()
// Subscribes to real-time updates of admin_users and pending_invites
```

#### Activate User
```javascript
async function activateUser(userId, type)
// type: 'pending_invite' | 'admin_users'
// Creates admin_users document and deletes pending_invite
```

#### Generate Report
```javascript
async function generateComprehensiveReport()
// Generates PDF with all metrics and analytics
```

---

## Contact & Support

For issues or questions:
- **Email:** admin@arta.gov.ph
- **Hotline:** +63 (2) 8123-ARTA

---

## License

This project is part of the ARTA (Anti-Red Tape Authority) Customer Satisfaction Survey initiative for Valenzuela City.

---

**Last Updated:** December 12, 2025
**Version:** 1.0
**Status:** Production Ready
