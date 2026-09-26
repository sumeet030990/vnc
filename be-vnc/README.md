# be-vnc

Backend API for VNC, built with Express 5, TypeScript and Prisma ORM on MySQL.

## Prerequisites

- Node.js 24+ and npm
- A running MySQL server and an empty database for the app

## Getting started

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Create your local env file and fill in the values
cp .env.example .env

# 3. Create the database tables
npm run prisma:migrate -- --name init

# 4. Seed roles, items and demo users (safe to re-run)
npm run prisma:seed

# 5. Start the dev server
npm run dev
```

The server starts on `http://localhost:4000` by default. Check it with:

```bash
curl http://localhost:4000/api/health
# {"status":"ok"}
```

## Environment variables

Set these in `.env`, which is git-ignored. Never commit real values.

| Variable       | Required | Default | Description                                                         |
| -------------- | -------- | ------- | ------------------------------------------------------------------- |
| `PORT`         | No       | `4000`  | Port the HTTP server listens on                                     |
| `DATABASE_URL` | Yes      | —       | MySQL connection string: `mysql://USER:PASSWORD@HOST:3306/DATABASE` |

Use the `mysql://` form of `DATABASE_URL`. The Prisma CLI reads it as-is, and [src/lib/prisma.ts](src/lib/prisma.ts) converts it into the config the MariaDB driver adapter needs at runtime.

## Scripts

| Command         | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `npm run dev`   | Start the dev server with nodemon; restarts when files in `src/` change |
| `npm run build` | Compile TypeScript from `src/` into `dist/`                             |
| `npm start`     | Run the compiled build from `dist/` (run `npm run build` first)         |

## Prisma commands

| Command                  | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `npx prisma format`      | Format and validate `prisma/schema.prisma`             |
| `npx prisma generate`    | Regenerate the Prisma client after editing the schema  |
| `npx prisma migrate dev` | create MigrationFiles and apply to db.                 |
| `npx prisma studio`      | Open Prisma Studio to browse and edit data             |
| `npm run prisma:seed`    | Seed the database using `prisma/seed.ts` (re-runnable) |

`npm install` runs `prisma generate` automatically via `postinstall`.
