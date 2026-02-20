# EmergencyRelay

Emergency relay app for Boys and Girls Club staff to manage student rosters during evacuations.

## ID for Staff testing:

- Email: `A`
- Password: `A`

## ID for Admin testing:

- Email: `B`
- Password: `B`

---

## Prerequisites

- Node.js (v18+)
- npm
- Expo Go app on your phone (for mobile testing)
- ngrok account (free tier works) - https://ngrok.com

## Quick Start

### 1. Install Dependencies

```bash
# Install app dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Start the Server

```bash
cd server
npm start
```

Server runs on `http://localhost:5000`

---

## Running Options

### Option A: Web Development (localhost only)

Best for quick testing in browser.

**Terminal 1 - Server:**

```bash
cd server && npm start
```

**Terminal 2 - App:**

```bash
npm run web
```

Opens at `http://localhost:8081`

---

### Option B: Android Emulator

**Terminal 1 - Server:**

```bash
cd server && npm start
```

**Terminal 2 - App:**

```bash
npm run start:local
```

Press `a` to open in Android emulator.

---

### Option C: iOS/Android Phone (requires ngrok)

Use this when testing on a physical phone or when on restricted networks (eduroam, corporate WiFi).

**Terminal 1 - Server:**

```bash
cd server && npm start
```

**Terminal 2 - ngrok:**

```bash
ngrok http 5000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.dev`)

**Terminal 3 - Update config and start app:**

Edit `app.json` and set the ngrok URL:

```json
"extra": {
  "API_BASE": "https://abc123.ngrok-free.dev",
  "API_BASE_ANDROID": "https://abc123.ngrok-free.dev"
}
```

Then start Expo:

```bash
npx expo start -c
```

Scan QR code with:

- **iOS:** Camera app → tap notification
- **Android:** Expo Go app → scan QR

**Note:** Free ngrok gives a new URL each restart. Update `app.json` accordingly.

---

## Project Structure

```
EmergencyRelay/
├── App.js              # Main app entry
├── app.json            # Expo config (API URLs here)
├── screens/            # UI screens
├── contexts/           # React contexts (auth)
├── services/           # API client
├── models/             # Data models
└── server/             # Backend API
    ├── src/index.js    # Express server
    └── data/           # NeDB database files
```

## Default Accounts

Create accounts via the admin dashboard after first login, or seed directly in `server/data/users.db`.

## Troubleshooting

### "Network request failed" on phone

- Make sure server is running
- Make sure ngrok is running and URL in `app.json` matches
- First request through free ngrok may show a "Visit Site" page - tap through it

### "Port 5000 already in use"

```bash
# Find process
lsof -ti tcp:5000
# Kill it
kill -9 $(lsof -ti tcp:5000)
# Or use different port
PORT=5001 npm start
```

### Config not updating

Clear Expo cache:

```bash
npx expo start -c
```
