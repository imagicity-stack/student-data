# Admissions Dashboard

A student admissions **dashboard** built with **Next.js** that saves
submissions to **Firebase Firestore**, ready to deploy on **Vercel**.

The landing page is an analytics dashboard (totals, gender / category /
class / income distributions, top reasons, support areas, and a recent
admissions table). A **Create Admission** button opens the full form in a
modal; saving it updates the analytics live.

The form is organized into 16 sections: identity, admission, demographics,
birth & background, father's details, mother's details, sibling details
(dynamic), residential address, previous school information, academic
performance, co-curricular exposure, health & medical information, emergency
contact, primary reason for choosing the school (checkboxes), areas where the
child needs support (checkboxes), and transport.

## How it works

- `app/page.js` — the analytics dashboard with a modal launcher (client component).
- `app/AdmissionForm.js` — the multi-section admission form rendered in the modal.
- `app/formConfig.js` — shared section/field definitions used by the form.
- `app/api/students/route.js` — server route handler: `GET` lists admissions for
  the dashboard, `POST` validates and writes to the `students` collection.
- `lib/firebase-admin.js` — initializes the Firebase Admin SDK from environment
  variables (credentials stay server-side, never exposed to the browser).

Each submission is stored as a document in the `students` collection with a
`createdAt` timestamp.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file (copy from `.env.example`) and fill in your
   Firebase service-account credentials:

   ```bash
   cp .env.example .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Firebase setup

1. Create a project at the [Firebase Console](https://console.firebase.google.com/).
2. Create a **Cloud Firestore** database (start in production mode).
3. Go to **Project Settings → Service accounts → Generate new private key**.
   This downloads a JSON file.
4. From that JSON, set these environment variables:

   | Variable                | Source (JSON field) |
   | ----------------------- | ------------------- |
   | `FIREBASE_PROJECT_ID`   | `project_id`        |
   | `FIREBASE_CLIENT_EMAIL` | `client_email`      |
   | `FIREBASE_PRIVATE_KEY`  | `private_key`       |

   For `FIREBASE_PRIVATE_KEY`, keep it wrapped in double quotes. The app
   converts the escaped `\n` sequences into real newlines at runtime.

Because writes go through the Admin SDK on the server, you do **not** need to
open up public Firestore security rules — the default locked rules are fine.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com/), **Add New → Project** and import the repo.
   Vercel auto-detects Next.js; no build configuration is needed.
3. In **Project → Settings → Environment Variables**, add the three Firebase
   variables above (for the Production and Preview environments).
4. Deploy. Submissions from the live form are saved to your Firestore
   `students` collection.
