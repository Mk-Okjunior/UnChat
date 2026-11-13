# UniChat

UniChat is an Expo Router app for university communities, academic resources, and opportunities.

## Run locally

```bash
npm install
npx expo start
```

## Connect Supabase

Authentication, profile roles, academic resources, and the admin dashboard use Supabase. To connect a project:

1. Create a Supabase project.
2. Open the project's SQL Editor and run [`supabase/migrations/202611020001_initial_schema.sql`](./supabase/migrations/202611020001_initial_schema.sql).
3. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project's Connect/API settings. Do not put a `service_role` key in the app.
4. Restart Expo after changing `.env`.
5. Register the account that should manage the app. In the Supabase SQL Editor, promote that account using its email, then sign out and sign in again:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'admin@example.com';
   ```

## Student registration verification

After the initial schema, run [`supabase/migrations/202611120001_registration_verification.sql`](./supabase/migrations/202611120001_registration_verification.sql). It adds student phone and ID-card path fields and creates the private `student-id-cards` Storage bucket with per-user upload/read/delete policies.

In Supabase Authentication settings, enable email confirmations. Update the signup email template to display `{{ .Token }}` (rather than only `{{ .ConfirmationURL }}`) so users receive the six-digit OTP entered on the registration screen. Configure your app's deployed URL in the Auth URL configuration as usual. The app does not expose a service-role key; signup, OTP verification, and the private Storage upload use the signed-in Supabase client.

The app's ImagePicker config asks only for photo-library access. Native builds must be rebuilt after changing the config plugin settings.

The app does not create a remote Supabase project automatically. Existing demo accounts stored on a device are not migrated; users need to register with the connected Supabase project.

## Notes and downloads

Admins can add academic resources in the dashboard and provide a file URL later. Resources without a file link show that the file has not been added; once a valid URL is saved, students can download/open the file on web and mobile. The database only accepts reads of published notes for signed-in users; note management and profile-role checks are enforced by row-level security.
