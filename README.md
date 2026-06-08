# ProxTools/

Next.js conversion of the original static ProxTools/Savage dashboard.

## Stack

- Next.js App Router
- Tailwind CSS
- shadcn-compatible UI primitives
- Drizzle ORM
- Neon Postgres
- Cloudinary asset helper
- Brevo transactional mail helper
- Signed HTTP-only cookie auth with bcrypt password hashes

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add `DATABASE_URL` from Neon and a long random `AUTH_SECRET`.
3. Add Cloudinary and Brevo keys if you want asset uploads and mail sending.
4. Install dependencies:

```bash
npm install
```

5. Push the schema and seed demo data:

```bash
npm run db:push
npm run db:seed
```

6. Run the app:

```bash
npm run dev
```

Demo logins after seeding:

- Customer: `user@proxtools.test` / `user12345`
- Admin: `admin@proxtools.test` / `admin12345`
