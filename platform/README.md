# DARKTEC Network — backend foundation

A separate Next.js App Router application in this repository. The public GitHub Pages website remains independent.

## Implemented
- Next.js 15 / React 19 application foundation.
- Supabase browser and server clients with cookie-based session refresh middleware.
- Password sign-in.
- Private /dashboard route with server-side Supabase Auth verification.
- Public POST /api/enquiries endpoint with field validation and a honeypot field.
- Best-effort admin email notification through Resend after an enquiry has been saved; database submission remains successful even if email delivery is temporarily unavailable.
- Enquiry inbox with admin-only read and status updates.
- Database Row Level Security: anonymous visitors can INSERT enquiries only; only users with trusted app_metadata.darktec_admin=true can read or update them.
- No service-role key is required or exposed by this application.

## Required setup before it works online
Supabase project `DARKTEC Network` has been created, the three migrations have been applied, and the owner admin claim has been verified. The Vercel project `darktec-entertainment` exists and its GitHub repository is connected. The application is not live until the first successful Vercel deployment is completed and tested.
1. Supabase project: `DARKTEC Network` (created).
2. Database migrations: `202611060001_initial_network.sql`, `202611060002_security_hardening.sql`, and `202611120001_enquiries_admin.sql` (reported executed successfully).
3. Owner account: created in Supabase Authentication; trusted `app_metadata.darktec_admin=true` claim verified.
4. In SQL Editor, the trusted admin claim can be checked with:

   UPDATE auth.users
   SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('darktec_admin', true)
   WHERE lower(email) = lower('YOUR-ADMIN-EMAIL');

   Sign out and sign in again so the refreshed JWT contains the claim. Never put this claim in user-editable metadata.
5. Confirm Vercel environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set for Production and Preview.
6. Configure email notifications in Vercel → Settings → Environment Variables: `RESEND_API_KEY` (secret API key from Resend), `DARKTEC_NOTIFICATION_EMAIL` (the inbox that should receive alerts), and `DARKTEC_FROM_EMAIL` (a sender address on a domain verified in Resend, e.g. `DARKTEC <notifications@your-verified-domain.com>`). These are server-only variables; never prefix them with `NEXT_PUBLIC_`. Create/verify the sending domain in Resend first, then redeploy.
7. Vercel project `darktec-entertainment` is connected to this GitHub repository with `platform` as root directory. A first successful deployment is still pending.
8. After deployment, add the deployed URL to Supabase Authentication → URL Configuration → Site URL and Redirect URLs.
9. Test sign-in, non-admin denial, enquiry submission, admin inbox access, status changes, and sign-out using separate browser sessions.

## Routes
- / — network overview
- /login — owner/member sign-in
- /dashboard — protected admin inbox
- POST /api/enquiries — public enquiry submission
- POST /api/enquiries/status — admin-only status update
- /auth/signout — sign out

## Public website integration
The static GitHub Pages enquiry form posts to the deployed Next.js API at `https://darktec-entertainment.vercel.app/api/enquiries`. The API allows the GitHub Pages origin explicitly. Keep the API URL and allowed origin aligned if either site URL changes.

## Security notes
- RLS is mandatory; do not disable it.
- The service-role key must never be added to browser code or NEXT_PUBLIC variables.
- Admin status is read only from Supabase Auth app_metadata, never user_metadata.
- Do not enable public registration until profile creation, verification, abuse controls, and member policies have been reviewed.
- Add production rate limiting / bot protection before broad public promotion. The API validates fields and uses a honeypot, but these are not a substitute for edge rate limiting or CAPTCHA. Email alerts require a verified sender domain and the three server-only Resend environment variables described above.