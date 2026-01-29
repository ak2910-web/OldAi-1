/**
 * Firebase Admin SDK Configuration
 * Centralized Firebase initialization
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Firestore instance
const db = admin.firestore();

// Firestore types
const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;

module.exports = {
  admin,
  db,
  FieldValue,
  Timestamp,
};
