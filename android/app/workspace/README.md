# Firebase Cloud Functions backend (TypeScript + Express)

This folder contains a minimal Firebase Cloud Functions backend with:

- Express API mounted as a function
- Firestore for user profiles and vedic requests
- Cloud Storage for image uploads
- Auth middleware that verifies Firebase ID tokens
- Local emulator-friendly configuration

Quick start (from repository root):

1. Install dependencies:

```bash
cd functions
npm install
```

2. Build and run emulators:

```bash
npm run build
firebase emulators:start --only functions,firestore,auth,storage
```

3. Routes (when emulators running):

- POST http://localhost:5001/react-native-oldai/us-central1/api/api/auth/link  (Authorization: Bearer <idToken>)
- GET  http://localhost:5001/react-native-oldai/us-central1/api/api/users/:id
- POST http://localhost:5001/react-native-oldai/us-central1/api/api/vedic/solve-text
- POST http://localhost:5001/react-native-oldai/us-central1/api/api/vedic/solve-image

Notes:
- Use the Firebase Emulator UI or `firebase login` + real project to deploy.
- This is a minimal starter: replace placeholder logic for real Vedic math processing.
