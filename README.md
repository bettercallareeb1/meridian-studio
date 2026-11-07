# Meridian Studio OS

A full-stack creative-studio resource and production workspace built with Next.js, PostgreSQL, Drizzle ORM, and Tailwind CSS.

**Live deployment:** <https://meridian-studio-pi.vercel.app>

## What is included

- Overview dashboard with studio KPIs, capacity, and deliverables
- Projects, deliverables, resource schedule, and studio team views
- Authenticated CRUD for projects, tasks, bookings, and team members
- Optional project file uploads backed by S3-compatible object storage
- Dark/light theme, responsive layout, and one-click demo personas

## Local development

Requirements: Node.js 20+ and a PostgreSQL database.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and set `DATABASE_URL` to your PostgreSQL connection string.

3. Push the schema:

   ```bash
   npm run db:push
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open <http://localhost:3000>. The first request seeds the demo workspace if the database is empty.

### Demo accounts

All seeded accounts use the password `Meridian2026!`.

- `areeb@meridian.studio`
- `julian@meridian.studio`
- `sora@meridian.studio`

You can also use the one-click personas on the login screen.

## Using Neon

The app reads `DATABASE_URL` for normal queries. Drizzle migrations prefer `DATABASE_URL_UNPOOLED` when it is present, because schema changes should use a direct connection.

If the project is linked with the Neon CLI, pull the branch variables with:

```bash
neon env pull --file .env.local
```

Then apply the schema:

```bash
npm run db:push
```

## Deploying to Vercel

1. Import the repository at <https://vercel.com/new>, or deploy with the CLI:

   ```bash
   vercel login
   vercel link
   vercel env add DATABASE_URL production
   vercel --prod
   ```

2. Use the Neon **pooled** connection string for `DATABASE_URL` in Vercel.

3. Push the schema to that database once with the direct connection:

   ```bash
   DATABASE_URL_UNPOOLED="postgresql://..." npm run db:push
   ```

4. Redeploy if you added the environment variable after the first deployment.

## Production notes

- The dashboard and read APIs require a signed-in session.
- The demo login endpoint and open registration are intentional for the demo workspace. For a private deployment, disable `/api/auth/demo`, restrict `/api/auth/register`, and replace the shared demo password.
- Uploaded files require the Neon Object Storage (or another S3-compatible) variables from `.env.example`.
- Never commit `.env.local`.
