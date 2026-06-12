# SnoozeTax: The Accountability Alarm Clock

SnoozeTax is a brutally effective alarm clock app designed to leverage "loss aversion" to get you out of bed. Every time you snooze or miss your alarm, it charges you real money.

## 🚀 How It Works

1. **Pre-paid Wallet**: Top up your in-app wallet with credits ($5, $10, $25, or $50).
2. **Set Your Alarm**: Choose your wake-up time and the days you want it to fire.
3. **Accountability**:
   - **Snooze**: Tapping "Snooze" immediately deducts a penalty from your wallet and reschedules the alarm for 9 minutes.
   - **Incremental Penalty**: Enable this in settings to have the penalty increase with each consecutive snooze!
4. **The Dismissal (The Wood Block Puzzle)**:
   - To turn off the alarm, you must solve a spatial wood block puzzle.
   - Clear a line (or more on Hard difficulty) within the time limit to prove you're awake.
   - **Give Up Option**: If the puzzle is too challenging at 6 AM, use the "Give Up & Pay" button to skip the puzzle at the cost of an additional penalty.
   - Failure to solve the puzzle results in a penalty and a 5-minute snooze cycle.

## 🛠 Features

- **Native Precision**: Schedules unique notifications for each weekday for maximum reliability on iOS and Android.
- **Critical Alerts**: Configured to bypass "Do Not Disturb" and silent mode (iOS/Android).
- **Anti-Cheat Recovery**: Detects if you force-quit the app or your phone reboots during an alarm event and applies a retroactive penalty.
- **System Dashboard**: An integrated Go backend allows you to monitor git status and stream session logs via WebSockets.

## 🏗 Architecture

- **Frontend**: React Native / Expo (SDK 52) with Expo Router.
- **Backend**: Go (Golang) for system monitoring and log streaming.
- **Storage**: Secure local storage for wallet balance and transaction logs.

## 🧪 Testing
Run the Jest test suite:
```bash
npm test
```

## 📄 License
This project is licensed under the MIT License.
