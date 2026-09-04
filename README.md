# Kane Westfall — Official Site & Fan Chat

A movie-celebrity website with one **owner (admin)** and unlimited **fans**. Fans sign up, get a
private one-to-one message thread, and the owner reads and answers every thread from a single
inbox. Messages are delivered live.

> Kane Westfall is a fictional actor used for the demo content. Change the name, photos and
> filmography in `src/routes/index.tsx` and `src/components/SiteHeader.tsx` to make it yours.

## Deploying to Vercel

This project deploys as a Vite single-page app. Use `npm run build` as the build command and
`dist` as the output directory. The included `vercel.json` keeps direct visits to `/auth`, `/chat`,
`/admin`, and `/settings` working.

Add these environment variables in the Vercel project settings for the Production, Preview, and
Development environments as needed:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

In Supabase Authentication URL Configuration, add the deployed Vercel URL and its `/auth` callback
behavior. Configure Google OAuth redirect URIs using the Supabase callback URL, not the Vercel URL:
`https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`.

---

## Pages

| Page     | Who can see it | What it does                                             |
| -------- | -------------- | -------------------------------------------------------- |
| `/`      | Everyone       | Landing page: hero, filmography, fan-club call to action |
| `/auth`  | Everyone       | Sign up / sign in (Google or email + password)           |
| `/chat`  | Signed-in fans | The fan's private thread with the owner                  |
| `/admin` | The owner only | Inbox with every fan conversation                        |

---

## For fans — how to sign up and chat

1. Open the site and click **Sign in** (top right) or **Chat with Kane**.
2. Choose one of:
   - **Continue with Google (Gmail)** — one click, no password to remember.
   - **Sign up** tab — enter a display name, your email and a password. If email confirmation
     is on, click the link in your inbox before your first sign-in.
3. You land on **My chat**. Type a message and press **Enter** (Shift+Enter for a new line).
4. When the owner replies, it appears in the same thread instantly — no refresh needed.
5. **Sign out** from the top-right button any time.

Fans can only ever see their own conversation.

---

## For the owner — how to sign up and sign in

The owner is not created by hand; the site uses a **one-time owner claim**. The first person to
claim it becomes the permanent owner, and the claim closes forever after that.

**Do this first, before you share the site with fans:**

1. Go to `/auth` and create your account exactly like a fan — with **Google (Gmail)** or with
   email + password. Use the email you want to own the site with.
2. Once signed in, go to **`/admin`** in the address bar.
3. You will see the **Owner access** card saying no owner has been set yet.
4. Click **Claim owner role**. You are now the site owner.
5. From then on, signing in normally at `/auth` takes you straight to the **Owner inbox**, and
   the header shows **Owner inbox** instead of **My chat**.

If someone else has already claimed the owner role, the card will say the area is reserved and
the claim button will not appear — only one owner can exist.

### Using the owner inbox

- The left column lists every fan who has signed up (display name + email).
- Click a fan to open their thread; type in the box and press **Enter** to reply.
- Incoming fan messages appear live while the page is open.

---

## How access is protected

- Every account gets a profile and the `fan` role automatically on sign-up.
- The `admin` role lives in a separate `user_roles` table (never on the profile), and is only
  granted by the one-time `claim_owner_role` action.
- Database access rules: a fan can read and write **only** messages in their own thread; the
  owner can read and reply in every thread and is the only account that can list all profiles.

---

## Customising

- **Actor name / branding**: `src/components/SiteHeader.tsx`, `src/routes/index.tsx`
- **Photos**: `src/assets/hero-portrait.jpg`, `src/assets/stage-banner.jpg`
- **Colours & fonts**: `src/styles.css` (all colours are design tokens — edit them in one place)
- **Google sign-in branding**: you can swap in your own Google OAuth credentials from the
  backend Auth settings; the default managed credentials work out of the box.
