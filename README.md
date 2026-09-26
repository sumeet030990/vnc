## Build the desktop app (Electron)

The desktop app lives in [../desktop](../desktop). MySQL is not bundled and must be installed on the user's machine.

```bash
# One-time: install dependencies in all three projects
cd ../be-vnc && npm install
cd ../fe-vnc && npm install
cd ../desktop && npm install

# From desktop/
npm start      # build backend + frontend, then open the app
npm run pack   # unpacked app in desktop/release/ for a quick check
npm run dist   # installer for the current OS in desktop/release/
```

- Build each installer on its own OS: `.dmg` on macOS, `.exe` on Windows, `.AppImage` on Linux.
- Builds are not code-signed yet, so macOS and Windows show a security warning on first open.
- See [desktop/README.md](../desktop/README.md) for settings and database setup.
