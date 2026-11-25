# Healthy Foods

Two-website Firebase-powered platform for **Healthy Foods** (a student-run small-batch fresh salad business):

- **`apps/customer`** (`http://localhost:3100`): Public storefront featuring live menu bowls, Mobile + OTP + Password account creation, Password-only returning login, saved delivery addresses (with optional GPS pin), and live order status tracking.
- **`apps/owner`** (`http://localhost:3101`): Private Owner Kitchen Portal restricted to `gcreddyprofessional@gmail.com` via Google Sign-In—featuring live order queue (`Accept` / `Decline` / `Mark Delivered`), customer delivery location viewer, menu CRUD with in-browser image upload compression, and kitchen open/closed settings.
- **`firestore.rules` & `firestore.indexes.json`**: Strict Cloud Firestore security rules and composite indexes.

## Local Development

```bash
npm install

# Run Customer Website (port 3100)
npm run dev:customer

# Run Owner Kitchen Portal (port 3101)
npm run dev:owner
```

Copy `apps/customer/.env.example` to `apps/customer/.env.local` and `apps/owner/.env.example` to `apps/owner/.env.local` with your Firebase project values.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```
