/* migrate-admins.js
   Node script to migrate admin_users documents to be keyed by Firebase Auth UID.
   Usage:
     1. Install dependencies: npm install firebase-admin
     2. Place service account JSON at ./service-account.json
     3. Run: node tools/migrate-admins.js

   This script will iterate Firebase Auth users and look for any admin_users doc
   with a matching email. When found it will copy data into admin_users/<uid>.
   It will NOT delete the original docs by default; delete manually after verification.
*/

const admin = require('firebase-admin');
const fs = require('fs');

const SERVICE_ACCOUNT = './service-account.json';
const PROJECT_ID = 'daisysyete-c9511';

if (!fs.existsSync(SERVICE_ACCOUNT)) {
  console.error('Missing service account file at', SERVICE_ACCOUNT);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(SERVICE_ACCOUNT)),
  projectId: PROJECT_ID
});

const db = admin.firestore();

async function migrate() {
  try {
    console.log('Listing users from Firebase Auth...');
    let result = await admin.auth().listUsers(1000);
    const users = result.users;
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      const uid = user.uid;
      const email = user.email;
      if (!email) continue;

      const q = await db.collection('admin_users').where('email', '==', email).get();
      if (!q.empty) {
        const doc = q.docs[0];
        const data = doc.data();
        await db.collection('admin_users').doc(uid).set({
          ...data,
          email: email,
          migratedFrom: doc.id,
          migratedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`Migrated ${email} -> admin_users/${uid} (from ${doc.id})`);
      } else {
        // no admin record — skip
      }
    }

    console.log('Migration complete. Verify data in Firestore before deleting old docs.');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

migrate();
