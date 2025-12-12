# ARTA CSS Admin Dashboard - Role Permissions Summary

## Overview
The ARTA Customer Satisfaction Survey Dashboard has 4 user roles with different levels of access to tabs and features.

---

## 📋 Role Permissions Matrix

### **1. Super Admin** 👑
**Full Access to All Features**

| Tab | Access |
|-----|--------|
| Dashboard | ✅ Full Access |
| Raw Responses | ✅ Full Access |
| Compliance Reports | ✅ Full Access |
| Manage Questions | ✅ Full Access (Edit, Add, Delete CC questions) |
| User Management | ✅ Full Access (Add, Edit, **Cannot Delete super_admin users**) |
| Add User Form | ✅ Full Access |

**Special Privileges:**
- Can manage all question types (SQD & CC)
- Can view all survey responses
- Can create and manage other admin users
- Protected deletion: Cannot delete other super_admin users
- Can edit admin user roles and permissions

---

### **2. Admin** 👨‍💼
**Full Access (Same as Super Admin)**

| Tab | Access |
|-----|--------|
| Dashboard | ✅ Full Access |
| Raw Responses | ✅ Full Access |
| Compliance Reports | ✅ Full Access |
| Manage Questions | ✅ Full Access (Edit, Add, Delete CC questions) |
| User Management | ✅ Full Access (Add, Edit, **Cannot Delete super_admin users**) |
| Add User Form | ✅ Full Access |

**Special Privileges:**
- Same access level as Super Admin
- Can manage all question types (SQD & CC)
- Can view all survey responses
- Can create and manage other admin users
- Cannot delete super_admin users (restricted by security rule)
- Can edit admin user roles

---

### **3. Data Analyst** 📊
**Read-Only / Analysis Access**

| Tab | Access |
|-----|--------|
| Dashboard | ✅ Read-Only Access |
| Raw Responses | ✅ Read-Only Access (View, Filter, Export) |
| Compliance Reports | ✅ Read-Only Access |
| Manage Questions | ❌ **No Access** (Greyed Out) |
| User Management | ❌ **No Access** (Greyed Out) |
| Add User Form | ❌ **No Access** (Greyed Out) |

**Permissions:**
- Can view and analyze survey responses
- Can filter and export response data
- Can view compliance reports
- Can view dashboard metrics
- **Cannot** create, edit, or delete questions
- **Cannot** manage users
- Read-only view of all data

---

### **4. Survey Manager** 🎯
**Question Management Only**

| Tab | Access |
|-----|--------|
| Dashboard | ✅ Read-Only Access |
| Raw Responses | ❌ **No Access** (Greyed Out) |
| Compliance Reports | ❌ **No Access** (Greyed Out) |
| Manage Questions | ✅ Full Access (Edit, Add, Delete CC questions) |
| User Management | ❌ **No Access** (Greyed Out) |
| Add User Form | ❌ **No Access** (Greyed Out) |

**Permissions:**
- Can manage survey questions (add, edit, delete)
- Can add choices/options to CC questions
- Can view dashboard overview
- **Cannot** view survey responses
- **Cannot** view compliance reports
- **Cannot** manage users
- Focused on survey content creation and management

---

## 🔐 Access Control Features

### Navigation Controls
- **Accessible Tabs**: Fully clickable and functional
- **Restricted Tabs**: Greyed out (opacity 50%, cursor changes to "not-allowed", not clickable)
- **Attempt to Navigate**: Shows "Access denied" message if user tries to access unauthorized view

### User Management Restrictions
- **Super Admin Protection**: No one can delete users with super_admin role
- **Delete Button Control**: Delete button is disabled and greyed out for super_admin users
- **Role-Based Visibility**: Users can only see other users appropriate to their role

### Question Management
- **SQD Questions**: Only Super Admin and Admin can view/edit (read-only for others)
- **CC Questions**: Super Admin, Admin, and Survey Manager can edit
- **Add Questions**: Only Super Admin, Admin, and Survey Manager can add

---

## 📊 Tab Summary

| Feature | Super Admin | Admin | Data Analyst | Survey Manager |
|---------|:-----------:|:-----:|:------------:|:--------------:|
| **Dashboard** | ✅ Full | ✅ Full | ✅ Read | ✅ Read |
| **Raw Responses** | ✅ Full | ✅ Full | ✅ Read | ❌ No |
| **Compliance Reports** | ✅ Full | ✅ Full | ✅ Read | ❌ No |
| **Manage Questions** | ✅ Full | ✅ Full | ❌ No | ✅ Full |
| **User Management** | ✅ Full | ✅ Full | ❌ No | ❌ No |
| **Add Users** | ✅ Full | ✅ Full | ❌ No | ❌ No |

---

## 💡 Use Case Examples

### Super Admin
- Initial system setup
- Full platform oversight
- User and permissions management
- Question bank management
- Response analysis

### Admin
- Daily operations
- Survey management
- User team management
- Response monitoring
- Report generation

### Data Analyst
- Survey response analysis
- Report creation
- Data export
- Compliance tracking
- Insight generation

### Survey Manager
- Question creation and updates
- Survey content management
- Test question additions
- Choice/option management

---

## 🔄 Firestore Rules

Access is also enforced at the Firestore database level through security rules, ensuring data cannot be accessed even if someone bypasses the UI controls.

---

**Last Updated:** December 12, 2025
**System:** ARTA Customer Satisfaction Survey Dashboard
