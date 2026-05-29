# SnoozeTax

A brutally effective alarm clock that charges you real money ($1.00 or custom) every time you snooze or miss your alarm.

## 🚀 Features
- **Wallet System**: Top up your balance and pay for your extra sleep.
- **Wood Block Puzzle**: Force your brain awake by solving a spatial puzzle to dismiss the alarm.
- **Customizable Accountability**: Change your snooze tax amount and puzzle difficulty (Easy/Medium/Hard).
- **Anti-Cheat Recovery**: Retroactive penalties if you force-quit the app during an alarm or reboot your phone.
- **System Dashboard**: Monitor git submodule status and stream session logs via the integrated Go backend.
- **Native Precision**: Schedules unique notifications for each weekday to ensure accurate alarm firing on iOS and Android.

## 🏗️ Architecture
- **Frontend**: React Native / Expo (SDK 52) with Expo Router.
- **Backend**: Go (Golang) serving a System Status API and WebSocket log streamer.
- **Storage**: Secure local storage for wallet balance and transaction history.

## 🛠️ Setup
1. **Frontend**:
   ```bash
   npm install --legacy-peer-deps
   npx expo start
   ```
2. **Backend**:
   ```bash
   cd backend-go
   go build -o snooze-backend .
   ./snooze-backend
   ```

## 🧪 Testing
Run the Jest test suite:
```bash
npm test
```
