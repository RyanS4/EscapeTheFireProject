# EmergencyRelay

Emergency relay app for Boys and Girls Club staff to manage student rosters during evacuations.

## Test Accounts

| Role  | Email | Password |
| ----- | ----- | -------- |
| Staff | `A`   | `A`      |
| Admin | `B`   | `B`      |

---

## Prerequisites

- Node.js (v18+)
- npm
- Expo Go app on your phone (for mobile testing)

## Quick Start

### 1. Install Dependencies

```bash
# From the EmergencyRelay folder
cd EmergencyRelay

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

The app automatically selects the correct API URL based on platform (configured in `app.json` under `extra`):

| Platform         | API Base URL            |
| ---------------- | ----------------------- |
| Web              | `http://localhost:5000` |
| Android Emulator | `http://10.0.2.2:5000`  |
| Physical Device  | Your machine's LAN IP   |

---

### Option A: Web Browser

Best for quick testing.

**Terminal 1 - Server:**

```bash
cd server && npm start
```

**Terminal 2 - App:**

```bash
npm run web
```

Opens at `http://localhost:8081`. No config changes needed — uses `API_BASE_WEB` automatically.

---

### Option B: Android Emulator

**Terminal 1 - Server:**

```bash
cd server && npm start
```

**Terminal 2 - App:**

```bash
npm start
```

Press `a` to open in Android emulator. No config changes needed — uses `API_BASE_ANDROID` (`http://10.0.2.2:5000`) automatically.

---

### Option C: Physical Phone (Same Network)

Your phone must be on the same WiFi network as your computer.

**Terminal 1 - Server:**

```bash
cd server && npm start
```

**Terminal 2 - App:**

```bash
npm start
```

Scan the QR code:

- **iOS:** Camera app → tap the Expo notification
- **Android:** Expo Go app → scan QR

**If the app can't connect:** Update `API_BASE` in `app.json` to your computer's LAN IP:

```bash
# Find your IP
hostname -I | awk '{print $1}'   # Linux
ipconfig getifaddr en0            # macOS
```

Then set it in `app.json`:

```json
"extra": {
  "API_BASE": "http://YOUR_IP:5000",
  ...
}
```

Restart with `npm start -- -c` to clear cache.

---

## Project Structure

```
EmergencyRelay/
├── App.js              # Main app entry and navigation
├── app.json            # Expo config (API URLs configured here)
├── screens/            # UI screens
├── contexts/           # React contexts (AuthContext for auth)
├── services/           # API client (api.js)
├── models/             # Data models
└── server/             # Backend API
    ├── src/index.js    # Express server
    └── data/           # NeDB data store (users.db, rosters.db, students.db)
```

## Troubleshooting

### "Network request failed" on phone

- Verify the server is running (`cd server && npm start`)
- Confirm `API_BASE` in `app.json` is correct for your setup:
  - Same network: your LAN IP (e.g., `http://192.168.1.42:5000`)
  - Different network: ngrok URL
- Ensure your phone can reach the server (try opening the URL in phone browser)
- First request through free ngrok may show a "Visit Site" page — tap through it

### Android Emulator can't connect

The emulator uses `10.0.2.2` to reach the host machine's localhost. Verify `API_BASE_ANDROID` is set to `http://10.0.2.2:5000` in `app.json`.

### "Port 5000 already in use"

```bash
# Find and kill the process
kill -9 $(lsof -ti tcp:5000)

# Or use a different port
PORT=5001 npm start
```

### Config changes not taking effect

Clear Expo cache when changing `app.json`:

```bash
npm start -- -c
```
