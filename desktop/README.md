# VNC desktop

Electron app that bundles `be-vnc` and `fe-vnc` into one installable desktop
app. MySQL is not bundled: it must be installed on the user's machine.

## How it works

- The Electron main process ([main.js](main.js)) loads the built Express app
  from `be-vnc/dist` and starts it on `127.0.0.1` (not reachable from the
  network).
- Express also serves the built frontend (`FRONTEND_DIR`), so the window just
  opens `http://127.0.0.1:<PORT>`.
- The frontend is built with `--mode desktop` (see `fe-vnc/.env.desktop`), so it
  calls the API on the same server instead of a fixed URL.

## Scripts

Run these from this folder after `npm install`.

| Command        | What it does                                                        |
| -------------- | ------------------------------------------------------------------- |
| `npm start`    | Builds backend + frontend, then opens the app                       |
| `npm run dev`  | Opens a window on the Vite dev server (run fe-vnc and be-vnc first) |
| `npm run pack` | Builds an unpacked app in `release/` for a quick check              |
| `npm run dist` | Builds the installer for the current OS in `release/`               |

Build each installer on its own OS: `.dmg` on macOS, `.exe` on Windows,
`.AppImage` on Linux. Builds are not code-signed yet, so macOS and Windows will
show a security warning the first time the app opens.

If Electron starts like plain Node (for example `app` is undefined), your shell
has `ELECTRON_RUN_AS_NODE` set. Unset it and try again.

## Settings on the user's machine

The installed app reads its settings from a `.env` file in the app-data folder:

- macOS: `~/Library/Application Support/VNC/.env`
- Windows: `%APPDATA%\VNC\.env`
- Linux: `~/.config/VNC/.env`

On first launch the app creates this file and asks the user to fill it in:

```
PORT=4000
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE"
```

When run unpacked (`npm start`), the app uses `be-vnc/.env` instead.

## Database setup on the user's machine

The app does not create tables. Before first use, create the database and run
the migrations against it from a developer machine:

```bash
cd ../be-vnc
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE" npx prisma migrate deploy
```

Or run the SQL files in `be-vnc/prisma/migrations/*/migration.sql` in order.
